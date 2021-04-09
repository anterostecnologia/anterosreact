import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import lodash from 'lodash';
import { autoBind, AnterosResizeDetector } from '@anterostecnologia/anteros-react-core';

const tabPrefix = 'tab-';
const panelPrefix = 'panel-';


class AnterosResponsiveTabs extends Component {
    constructor(props) {
        super(props);

        this.tabRefs = {};
        this.selectedTabKeyProp = props.selectedTabKey;

        this.state = {
            tabDimensions: {},
            blockWidth: 0,
            tabsTotalWidth: 0,
            showMoreWidth: 40,
            selectedTabKey: props.selectedTabKey,
            focusedTabKey: null
        };
        this.onResizeThrottled = lodash.throttle(this.onResize, props.resizeThrottle, { trailing: true });
        autoBind(this);
    }

    componentDidMount() {
        this.setTabsDimensions();
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { selectedTabKey, blockWidth, showMoreWidth } = this.state;
        const { items, transform, showMore, showInkBar, allowRemove, removeActiveOnly, children } = this.props;

        return (
            items !== nextProps.items ||
            children !== nextProps.children ||
            nextProps.transform !== transform ||
            nextProps.showMore !== showMore ||
            nextProps.showInkBar !== showInkBar ||
            nextProps.allowRemove !== allowRemove ||
            nextProps.removeActiveOnly !== removeActiveOnly ||
            nextState.blockWidth !== blockWidth ||
            nextState.showMoreWidth !== showMoreWidth ||
            nextProps.selectedTabKey !== this.selectedTabKeyProp ||
            nextState.selectedTabKey !== selectedTabKey
        );
    }

    componentDidUpdate(prevProps) {
        const { items, selectedTabKey } = this.props;

        if (this.selectedTabKeyProp !== selectedTabKey) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ selectedTabKey });
        }

        if (items !== prevProps.items) {
            this.setTabsDimensions();
        }

        this.selectedTabKeyProp = selectedTabKey;
    }

    onResize() {
        let _this = this;
        if (this.tabsWrapper) {
            const currentIsCollapsed = this.getIsCollapsed();
            this.setState({ blockWidth: this.tabsWrapper.offsetWidth }, () => {
                const { items } = _this.props;
                const { selectedTabKey } = _this.state;
                const nextIsCollapsed = _this.getIsCollapsed();
                if (currentIsCollapsed && !nextIsCollapsed && selectedTabKey === -1 && items && items.length) {
                    const firstTabKey = items[0].key || 0;
                    _this.setState({ selectedTabKey: firstTabKey });
                }
            });
        }
    };

    onChangeTab(nextTabKey) {
        const { onChange } = this.props;
        const { selectedTabKey } = this.state;
        const isCollapsed = this.getIsCollapsed();
        if (isCollapsed && selectedTabKey === nextTabKey) {
            // hide on mobile
            this.setState({ selectedTabKey: -1 });
        } else {
            // change active tab
            this.setState({ selectedTabKey: nextTabKey });
        }

        if (onChange) {
            onChange(nextTabKey);
        }
    };

    onFocusTab(focusedTabKey) {
        this.setState({ focusedTabKey });
    }

    onBlurTab() {
        this.setState({ focusedTabKey: null });
    }

    onKeyDown(event) {
        const { focusedTabKey } = this.state;
        if (event.keyCode === 13 && focusedTabKey !== null) {
            this.setState({ selectedTabKey: focusedTabKey });
        }
    };

    setTabsDimensions() {
        if (!this.tabsWrapper) {
            // it shouldn't happens evern. Just paranoic check
            return;
        }

        // initial wrapper width calculation
        const blockWidth = this.tabsWrapper.offsetWidth;

        // calculate width and offset for each tab
        let tabsTotalWidth = 0;
        const tabDimensions = {};
        let _this = this;
        Object.keys(this.tabRefs).forEach(key => {
            if (_this.tabRefs[key]) {
                const width = _this.tabRefs[key].tab.offsetWidth;
                tabDimensions[key.replace(tabPrefix, '')] = { width, offset: tabsTotalWidth };
                tabsTotalWidth += width;
            }
        });

        this.setState({ tabDimensions, tabsTotalWidth, blockWidth });
    };

    getItems() {
        if (this.props.items && this.props.items.length > 0)
            return this.props.items;

        if (this.props.children) {
            let result = [];
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child, index) {
                if (child.type && (child.type.componentName === 'AnterosResponsiveTab')) {
                    result.push({
                        title: child.props.title,
                        caption: child.props.caption,
                        key: child.props.id,
                        id: child.props.id,
                        content: child.props.children,
                        disabled: child.props.disabled,
                        tabClassName: child.props.tabClassName,
                        panelClassName: child.props.panelClassName,
                        icon: child.props.icon,
                        image: child.props.image,
                        imageCircle: child.props.imageCircle,
                        imageHeight: child.props.imageHeight,
                        imageWidth: child.props.imageWidth,
                    });
                }
            });
            return result;
        }

        return [];
    }

    getTabHeaderActions() {
        if (this.props.items && this.props.items.length > 0)
            return
        else {
            if (this.props.children) {
                let result;
                let arrChildren = React.Children.toArray(this.props.children);
                arrChildren.forEach(function (child, index) {
                    if (child.type && (child.type.componentName === 'TabHeaderActions')) {
                        result = child;
                    }
                });
                return result;
            }
        }
        return;
    }

    getTabs(items) {
        const { showMore, transform, transformWidth, allowRemove, removeActiveOnly, onRemove } = this.props;
        const { blockWidth, tabsTotalWidth, tabDimensions, showMoreWidth } = this.state;
        const selectedTabKey = this.getSelectedTabKey();
        const collapsed = blockWidth && transform && blockWidth < transformWidth;

        let tabIndex = 0;
        let availableWidth = blockWidth - (tabsTotalWidth > blockWidth ? showMoreWidth : 0);
        return items.reduce(
            (result, item, index) => {
                const { key = index, title, icon, image, imageCircle, imageHeight, imageWidth, caption, content, getContent, disabled, tabClassName, panelClassName } = item;

                const selected = selectedTabKey === key;
                const payload = { tabIndex, collapsed, selected, disabled, key };
                const tabPayload = {
                    ...payload,
                    title: title ? title : caption,
                    icon,
                    image,
                    imageCircle,
                    imageHeight,
                    imageWidth,
                    onRemove: evt => {
                        if (typeof onRemove === 'function') {
                            onRemove(key, evt);
                        }
                    },
                    allowRemove: allowRemove && (!removeActiveOnly || selected),
                    className: tabClassName
                };

                const panelPayload = {
                    ...payload,
                    content,
                    getContent,
                    className: panelClassName
                };

                const tabWidth = tabDimensions[key] ? tabDimensions[key].width : 0;

                tabIndex += 1;

                /* eslint-disable no-param-reassign */
                if (
                    // don't need to `Show more` button
                    !showMore ||
                    // initial call
                    !blockWidth ||
                    // collapsed mode
                    collapsed ||
                    // all tabs are fit into the block
                    blockWidth > tabsTotalWidth ||
                    // current tab fit into the block
                    availableWidth - tabWidth > 0
                ) {
                    result.tabsVisible.push(tabPayload);
                } else {
                    result.tabsHidden.push(tabPayload);
                    if (selected) result.isSelectedTabHidden = true;
                }
                /* eslint-enable no-param-reassign */

                result.panels[key] = panelPayload; // eslint-disable-line no-param-reassign
                availableWidth -= tabWidth;

                return result;
            },
            { tabsVisible: [], tabsHidden: [], panels: {}, isSelectedTabHidden: false }
        );
    };

    getTabProps({ title, caption, key, id, icon, image, imageCircle, imageHeight, imageWidth, selected, collapsed, tabIndex, disabled, className, onRemove, allowRemove }) {
        return {
            selected,
            allowRemove,
            children: title ? title : caption,
            key: id,
            id,
            ref: e => (this.tabRefs[tabPrefix + key] = e),
            originalKey: key,
            icon,
            image,
            imageCircle,
            imageHeight,
            imageWidth,
            onClick: this.onChangeTab,
            onFocus: this.onFocusTab,
            onBlur: this.onBlurTab,
            onRemove,
            panelId: panelPrefix + key,
            classNames: this.getClassNamesFor('tab', {
                selected,
                collapsed,
                tabIndex,
                disabled,
                className
            })
        };
    }

    getPanelProps({ key, content, getContent, className }) {
        return {
            getContent,
            children: content,
            key: panelPrefix + key,
            id: panelPrefix + key,
            tabId: tabPrefix + key,
            classNames: this.getClassNamesFor('panel', { className })
        };
    };

    getShowMoreProps(isShown, isSelectedTabHidden, showMoreLabel) {
        return {
            onShowMoreChanged: this.showMoreChanged,
            isShown,
            label: showMoreLabel,
            hasChildSelected: isSelectedTabHidden
        };
    }

    getClassNamesFor(type, { selected, collapsed, tabIndex, disabled, className = '' }) {
        const { tabClass, panelClass } = this.props;
        switch (type) {
            case 'tab':
                return classNames('AnterosTab_tab', className, tabClass, {
                    'AnterosTab_tab--first': !tabIndex,
                    'AnterosTab_tab--selected': selected,
                    'AnterosTab_tab--disabled': disabled,
                    'AnterosTab_tab--collapsed': collapsed
                });
            case 'panel':
                return classNames('AnterosTab_panel', className, panelClass);
            default:
                return '';
        }
    };

    getSelectedTabKey() {
        const { items } = this.props;
        const { selectedTabKey } = this.state;
        if (typeof selectedTabKey === 'undefined') {
            if (!items[0]) {
                return undefined;
            }
            return items[0].key || 0;
        }
        return selectedTabKey;
    };

    getIsCollapsed() {
        const { transform, transformWidth } = this.props;
        const { blockWidth } = this.state;
        return blockWidth && transform && blockWidth < transformWidth;
    };

    showMoreChanged(element) {
        if (!element) {
            return;
        }

        const { showMoreWidth } = this.state;
        const { offsetWidth } = element;
        if (showMoreWidth === offsetWidth) {
            return;
        }

        this.setState({
            showMoreWidth: offsetWidth
        });
    };

    render() {
        const { showInkBar, containerClass, tabsWrapperClass, showMore, transform, showMoreLabel } = this.props;
        const { tabDimensions } = this.state;
        const { tabsVisible, tabsHidden, panels, isSelectedTabHidden } = this.getTabs(this.getItems());
        const isCollapsed = this.getIsCollapsed();
        const selectedTabKey = this.getSelectedTabKey();
        const selectedTabDimensions = tabDimensions[selectedTabKey] || {};

        const containerClasses = classNames('AnterosTab_container', containerClass);
        const tabsClasses = classNames('AnterosTab_tabs', tabsWrapperClass, { AnterosTab_accordion: isCollapsed });

        return (
            <div className={containerClasses} 
                style={this.props.style}
            ref={e => (this.tabsWrapper = e)} 
            onKeyDown={this.onKeyDown}>
                <div className="AnterosTab_container_tabs">
                    <div className={tabsClasses}>
                        {tabsVisible.reduce((result, tab) => {
                            result.push(<Tab {...this.getTabProps(tab)} />);

                            if (isCollapsed && selectedTabKey === tab.key) {
                                result.push(<TabPanel {...this.getPanelProps(panels[tab.key])} />);
                            }
                            return result;
                        }, [])}


                        {!isCollapsed && (
                            <ShowMore {...this.getShowMoreProps(showMore, isSelectedTabHidden, showMoreLabel)}>
                                {tabsHidden.map(tab => (
                                    <Tab {...this.getTabProps(tab)} />
                                ))}
                            </ShowMore>
                        )}
                    </div>
                    {this.getTabHeaderActions()}
                </div>
                {showInkBar && !isCollapsed && !isSelectedTabHidden && (
                    <InkBar left={selectedTabDimensions.offset || 0} width={selectedTabDimensions.width || 0} />
                )}

                {!isCollapsed && panels[selectedTabKey] && <TabPanel {...this.getPanelProps(panels[selectedTabKey])} />}

                {(showMore || transform) && <AnterosResizeDetector handleWidth onResize={this.onResizeThrottled} />}
            </div>
        );
    }
}

AnterosResponsiveTabs.displayName = 'AnterosResponsiveTabs';

AnterosResponsiveTabs.propTypes = {
    /* eslint-disable react/no-unused-prop-types */
    // lista de tabs
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /* eslint-enable react/no-unused-prop-types */
    // selected tab key
    selectedTabKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    // show 'X' and remove tab
    allowRemove: PropTypes.bool,
    // show 'X' closing element only for active tab
    removeActiveOnly: PropTypes.bool,
    // move tabs to the special `Show more` tab if they don't fit into a screen
    showMore: PropTypes.bool,
    // materialUI-like rail under the selected tab
    showInkBar: PropTypes.bool,
    // transform to the accordion on small screens
    transform: PropTypes.bool,
    // tabs will be transformed to accodrion for screen sizes below `transformWidth`px
    transformWidth: PropTypes.number,
    // onChange active tab callback
    onChange: PropTypes.func,
    // onRemove callback
    onRemove: PropTypes.func,
    // frequency of onResize recalculation fires
    resizeThrottle: PropTypes.number,
    // classnames
    containerClass: PropTypes.string,
    tabsWrapperClass: PropTypes.string,
    tabClass: PropTypes.string,
    panelClass: PropTypes.string,
    // labels
    showMoreLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

AnterosResponsiveTabs.defaultProps = {
    items: [],
    selectedTabKey: undefined,
    showMore: true,
    showInkBar: true,
    allowRemove: false,
    removeActiveOnly: false,
    transform: true,
    transformWidth: 800,
    resizeThrottle: 100,
    containerClass: undefined,
    tabsWrapperClass: undefined,
    tabClass: undefined,
    panelClass: undefined,
    showMoreLabel: '...',
    onChange: () => null,
    onRemove: () => null
};

class TabHeaderActions extends Component {

    render() {
        return (<div>
            {this.props.children}
        </div>);
    }
}

TabHeaderActions.componentName = 'TabHeaderActions';


class Tab extends Component {
    constructor(props){
        super(props);
        autoBind(this);
    }
    shouldComponentUpdate(nextProps) {
        const { children, selected, classNames } = this.props;
        return children !== nextProps.children || selected !== nextProps.selected || classNames !== nextProps.classNames;
    }

    onTabClick() {
        const { onClick, originalKey } = this.props;
        onClick(originalKey);
    };

    renderRemovableTab() {
        const { children, onRemove } = this.props;
        return (
            <div className="AnterosTab_removable">
                <div className="AnterosTab_removable-text">{children}</div>
                <div className="AnterosTab_removable-icon" onClick={onRemove}>
                    x
        </div>
            </div>
        );
    };

    renderTab() {
        const { children, icon, image, imageCircle, imageHeight, imageWidth, allowRemove } = this.props;

        if (allowRemove) {
            return this.renderRemovableTab();
        }

        let iconComp;
        if (icon) {
            iconComp = <i className={icon} />;
        }
        let classNameImage;
        if (imageCircle) {
            classNameImage = "img-circle";
        }

        return (<Fragment>
            {iconComp}{" "}
            {image ? <img
                alt=" "
                style={{ marginLeft: "3px", marginRight: "3px" }}
                className={classNameImage}
                src={image}
                height={imageHeight}
                width={imageWidth}
            /> : null}{" "}
            {children}
        </Fragment>);
    };

    render() {
        const { id, classNames, selected, disabled, panelId, onFocus, onBlur, originalKey } = this.props;

        return (
            <div
                ref={e => (this.tab = e)}
                role="tab"
                className={classNames}
                id={id}
                aria-selected={selected ? 'true' : 'false'}
                aria-expanded={selected ? 'true' : 'false'}
                aria-disabled={disabled ? 'true' : 'false'}
                aria-controls={panelId}
                tabIndex="0"
                onClick={this.onTabClick}
                onFocus={onFocus(originalKey)}
                onBlur={onBlur}
            >
                {this.renderTab()}
            </div>
        );
    }
}

Tab.propTypes = {
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    disabled: PropTypes.bool,

    // generic props
    panelId: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
    onFocus: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    allowRemove: PropTypes.bool,
    id: PropTypes.string.isRequired,
    originalKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    classNames: PropTypes.string.isRequired,
    icon: PropTypes.string,
    image: PropTypes.string,
    imageCircle: PropTypes.bool.isRequired,
    imageHeight: PropTypes.string,
    imageWidth: PropTypes.string,
};

Tab.defaultProps = {
    children: undefined,
    onRemove: () => { },
    allowRemove: false,
    disabled: false
};


class TabPanel extends Component {
    shouldComponentUpdate(nextProps) {
        const { children, getContent, classNames } = this.props;
        return (
            getContent !== nextProps.getContent || children !== nextProps.children || classNames !== nextProps.classNames
        );
    }

    render() {
        const { classNames, id, tabId, children, getContent } = this.props;

        return (
            <div className={classNames} role="tabpanel" style={{height:'100%'}} id={id} aria-labelledby={tabId} aria-hidden="false">
                {getContent && getContent()}
                {!getContent && children}
            </div>
        );
    }
}

TabPanel.propTypes = {
    getContent: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    id: PropTypes.string.isRequired,

    // generic props
    classNames: PropTypes.string.isRequired,
    tabId: PropTypes.string.isRequired
};

TabPanel.defaultProps = {
    getContent: undefined,
    children: undefined
};



class ShowMore extends Component {
    constructor() {
        super();

        this.state = {
            isFocused: false,
            isHidden: true
        };

        autoBind(this);
    }

    componentDidMount() {
        if (typeof window !== 'undefined') {
            window.addEventListener('click', this.close);
            window.addEventListener('keydown', this.onKeyDown);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { children, isShown, hasChildSelected } = this.props;
        return (
            children.length !== nextProps.children.length ||
            isShown !== nextProps.isShown ||
            hasChildSelected !== nextProps.hasChildSelected ||
            this.state !== nextState
        );
    }

    componentWillUnmount() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('click', this.close);
            window.removeEventListener('keydown', this.onKeyDown);
        }
    }

    onFocus() {
        this.setState({ isFocused: true });
    }

    onBlur() {
        this.setState({ isFocused: false });
    }

    onKeyDown(event) {
        const { isFocused, isHidden } = this.state;
        if (event.keyCode === 13) {
            if (isFocused) {
                this.setState({ isHidden: !isHidden });
            } else if (!isHidden) {
                this.setState({ isHidden: true });
            }
        }
    };

    close() {
        const { isHidden } = this.state;
        if (!isHidden) {
            this.setState({ isHidden: true });
        }
    };

    toggleVisibility(event) {
        const { isHidden } = this.state;
        event.stopPropagation();
        this.setState({ isHidden: !isHidden });
    };

    render() {
        const { isShown, children, onShowMoreChanged, hasChildSelected, label } = this.props;
        const { isHidden } = this.state;
        if (!isShown || !children || !children.length) {
            return null;
        }

        const isListHidden = isHidden;
        const showMoreStyles = classNames({
            AnterosTab_showmore: true,
            'AnterosTab_showmore--selected': hasChildSelected
        });

        const listStyles = classNames({
            'AnterosTab_showmore-list': true,
            'AnterosTab_showmore-list--opened': !isListHidden
        });

        const showMoreLabelStyles = classNames({
            'AnterosTab_showmore-label': true,
            'AnterosTab_showmore-label--selected': !isListHidden
        });

        return (
            <div
                ref={onShowMoreChanged}
                className={showMoreStyles}
                role="navigation"
                tabIndex="0"
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onClick={this.toggleVisibility}
            >
                <div className={showMoreLabelStyles}>{label}</div>
                <div className={listStyles} aria-hidden={isListHidden} role="menu">
                    {children}
                </div>
            </div>
        );
    }
}

ShowMore.propTypes = {
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    hasChildSelected: PropTypes.bool,
    isShown: PropTypes.bool.isRequired,
    onShowMoreChanged: PropTypes.func,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

ShowMore.defaultProps = {
    children: undefined,
    hasChildSelected: false,
    label: '...',
    onShowMoreChanged: () => null
};

const InkBar = ({ left, width }) => (
    <div className="AnterosTab_inkbar-wrapper">
        <div className="AnterosTab_inkbar" style={{ left, width }} />
    </div>
);

InkBar.propTypes = {
    left: PropTypes.number,
    width: PropTypes.number
};

InkBar.defaultProps = {
    left: 0,
    width: 0
};


class AnterosResponsiveTab extends Component {

    render() {
        return (null);
    }

}

AnterosResponsiveTab.componentName = 'AnterosResponsiveTab';

AnterosResponsiveTab.propTypes = {
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    disabled: PropTypes.bool,
    title: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    tabClassName: PropTypes.string,
    panelClassName: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    imageCircle: PropTypes.bool.isRequired,
    imageHeight: PropTypes.string,
    imageWidth: PropTypes.string,
};

AnterosResponsiveTab.defaultProps = {
    children: undefined,
    disabled: false
};


export { AnterosResponsiveTabs, AnterosResponsiveTab, TabHeaderActions }