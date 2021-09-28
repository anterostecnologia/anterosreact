import React from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import Masonry from './masonry.js';



var propTypes = {
    enableResizableChildren: PropTypes.bool,
    updateOnEachImageLoad: PropTypes.bool,
    options: PropTypes.object,
    elementType: PropTypes.string,
    onLayoutComplete: PropTypes.func,
    onRemoveComplete: PropTypes.func
};

export default class AnterosMasonry extends React.Component {

    constructor(props) {
        super(props);
        this.initializeMasonry = this.initializeMasonry.bind(this);
        this.getCurrentDomChildren = this.getCurrentDomChildren.bind(this);
        this.diffDomChildren = this.diffDomChildren.bind(this);
        this.performLayout = this.performLayout.bind(this);
        this.initializeResizableChildren = this.initializeResizableChildren.bind(this);
        this.listenToElementResize = this.listenToElementResize.bind(this);
        this.destroyErd = this.destroyErd.bind(this);
        this.setRef = this.setRef.bind(this);
        this.idMasonry = (this.props.id?this.props.id:lodash.uniqueId("dtPickerCal"));
    }

    initializeMasonry(force) {
        if (!this.masonry || force) {
            this.masonry = new Masonry(
                this.masonryContainer,
                this.props.options
            );

            if (this.props.onLayoutComplete) {
                this.masonry.on('layoutComplete', this.props.onLayoutComplete);
            }

            if (this.props.onRemoveComplete) {
                this.masonry.on('removeComplete', this.props.onRemoveComplete);
            }

            this.latestKnownDomChildren = this.getCurrentDomChildren();
        }
    }

    getCurrentDomChildren() {
        var node = this.masonryContainer;
        var children = this.props.options.itemSelector ? node.querySelectorAll(this.props.options.itemSelector) : node.children;
        return Array.prototype.slice.call(children);
    }

    diffDomChildren() {
        var forceItemReload = false;

        var knownChildrenStillAttached = this.latestKnownDomChildren.filter(function (element) {
            /*
             * take only elements attached to DOM
             * (aka the parent is the masonry container, not null)
             * otherwise masonry would try to "remove it" again from the DOM
             */
            return !!element.parentNode;
        });

        /*
         * If not all known children are attached to the dom - we have no other way of notifying
         * masonry to remove the ones not still attached besides invoking a complete item reload.
         * basically all the rest of the code below does not matter in that case.
         */
        if (knownChildrenStillAttached.length !== this.latestKnownDomChildren.length) {
            forceItemReload = true;
        }

        var currentDomChildren = this.getCurrentDomChildren();

        /*
         * Since we are looking for a known child which is also attached to the dom AND
         * not attached to the dom at the same time - this would *always* produce an empty array.
         */
        var removed = knownChildrenStillAttached.filter(function (attachedKnownChild) {
            return !~currentDomChildren.indexOf(attachedKnownChild);
        });

        /*
         * This would get any children which are attached to the dom but are *unkown* to us
         * from previous renders
         */
        var newDomChildren = currentDomChildren.filter(function (currentChild) {
            return !~knownChildrenStillAttached.indexOf(currentChild);
        });

        var beginningIndex = 0;

        // get everything added to the beginning of the DOMNode list
        var prepended = newDomChildren.filter(function (newChild) {
            var prepend = (beginningIndex === currentDomChildren.indexOf(newChild));

            if (prepend) {
                // increase the index
                beginningIndex++;
            }

            return prepend;
        });

        // we assume that everything else is appended
        var appended = newDomChildren.filter(function (el) {
            return prepended.indexOf(el) === -1;
        });

        // get everything added to the end of the DOMNode list
        var moved = [];

        /*
         * This would always be true (see above about the lofic for "removed")
         */
        if (removed.length === 0) {
            /*
             * 'moved' will contain some random elements (if any) since the "knownChildrenStillAttached" is a filter
             * of the "known" children which are still attached - All indexes could basically change. (for example
             * if the first element is not attached)
             * Don't trust this array.
             */
            moved = knownChildrenStillAttached.filter(function (child, index) {
                return index !== currentDomChildren.indexOf(child);
            });
        }

        this.latestKnownDomChildren = currentDomChildren;

        return {
            old: knownChildrenStillAttached, // Not used
            new: currentDomChildren, // Not used
            removed: removed,
            appended: appended,
            prepended: prepended,
            moved: moved,
            forceItemReload: forceItemReload
        };
    }

    performLayout() {
        var diff = this.diffDomChildren();

        // Would never be true. (see comments of 'diffDomChildren' about 'removed')
        if (diff.removed.length > 0) {
            if (this.props.enableResizableChildren) {
                diff.removed.forEach(this.erd.removeAllListeners, this.erd);
            }
            this.masonry.remove(diff.removed);
            this.masonry.reloadItems();
        }

        if (diff.appended.length > 0) {
            this.masonry.appended(diff.appended);

            if (diff.prepended.length === 0) {
                this.masonry.reloadItems();
            }

            if (this.props.enableResizableChildren) {
                diff.appended.forEach(this.listenToElementResize, this);
            }
        }

        if (diff.prepended.length > 0) {
            this.masonry.prepended(diff.prepended);

            if (this.props.enableResizableChildren) {
                diff.prepended.forEach(this.listenToElementResize, this);
            }
        }

        if (diff.forceItemReload || diff.moved.length > 0) {
            this.masonry.reloadItems();
        }

        this.masonry.layout();
    }


    initializeResizableChildren() {
        if (!this.props.enableResizableChildren) {
            return;
        }

        this.erd = elementResizeDetectorMaker({
            strategy: 'scroll'
        });

        this.latestKnownDomChildren.forEach(this.listenToElementResize, this);
    }

    listenToElementResize(el) {
        this.erd.listenTo(el, function () {
            this.masonry.layout()
        }.bind(this))
    }

    destroyErd() {
        if (this.erd) {
            this.latestKnownDomChildren.forEach(this.erd.uninstall, this.erd);
        }
    }

    componentDidMount() {
        this.initializeMasonry();
        this.initializeResizableChildren();
    }

    componentDidUpdate() {
        this.performLayout();
    }

    componentWillUnmount() {
        this.destroyErd();

        // unregister events
        if (this.props.onLayoutComplete) {
            this.masonry.off('layoutComplete', this.props.onLayoutComplete);
        }

        if (this.props.onRemoveComplete) {
            this.masonry.off('removeComplete', this.props.onRemoveComplete);
        }

        this.masonry.destroy();
    }

    setRef(n) {
        this.masonryContainer = n;
    }

    render() {
        var props = lodash.omit(this.props, Object.keys(propTypes));
        return React.createElement(this.props.elementType, lodash.assign({id:this.props.idMasonry}, props, { ref: this.setRef }), this.props.children);
    }
}


AnterosMasonry.propTypes = {
    enableResizableChildren: PropTypes.bool,
    updateOnEachImageLoad: PropTypes.bool,
    options: PropTypes.object,
    className: PropTypes.string,
    elementType: PropTypes.string,
    onLayoutComplete: PropTypes.func,
    onRemoveComplete: PropTypes.func
}

AnterosMasonry.defaultProps = {
    enableResizableChildren: false,
    updateOnEachImageLoad: false,
    options: {},
    className: '',
    elementType: 'div',
    onLayoutComplete: function () {
    },
    onRemoveComplete: function () {
    }
}

