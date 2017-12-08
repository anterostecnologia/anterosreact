import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import { AnterosUtils } from "anteros-react-core";
import classNames from "classnames";
import update from 'react-addons-update';


class Icon extends Component {
    render() {
        const { children, className, ...props } = this.props;

        return (
            <i className={classNames("nestable-icon", className)} {...props} />
        );
    }
}


export class AnterosNestableItem extends Component {
    render() {
        const { item, isCopy, options } = this.props;
        const { dragItem, renderItem, handler, childrenProp } = options;
        const isCollapsed = options.isCollapsed(item);

        const isDragging = !isCopy && dragItem && dragItem.id === item.id;
        const hasChildren = item[childrenProp] && item[childrenProp].length > 0;

        let Handler;

        let itemProps = {
            className: classNames(
                "nestable-item" + (isCopy ? '-copy' : ''),
                "nestable-item" + (isCopy ? '-copy' : '') + '-' + item.id,
                {
                    'is-dragging': isDragging
                }
            )
        };

        let rowProps = {};
        let handlerProps = {};
        if (!isCopy) {
            if (dragItem) {
                rowProps = {
                    ...rowProps,
                    onMouseEnter: (e) => options.onMouseEnter(e, item)
                };
            } else {
                handlerProps = {
                    ...handlerProps,
                    draggable: true,
                    onDragStart: (e) => options.onDragStart(e, item)
                };
            }
        }

        if (handler) {
            Handler = <span className="nestable-item-handler" {...handlerProps}>{handler}</span>;
        } else {
            rowProps = {
                ...rowProps,
                ...handlerProps
            };
        }

        const collapseIcon = hasChildren ? (
            <Icon
                className={classNames("nestable-item-icon", isCollapsed ? "icon-plus-gray" : "icon-minus-gray")}
                onClick={e => options.onToggleCollapse(item)}
            />
        ) : '';

        return (
            <li {...itemProps}>
                <div className="nestable-item-name" {...rowProps}>
                    {renderItem({ item, collapseIcon, handler: Handler })}
                </div>

                {hasChildren && !isCollapsed && (
                    <ol className="nestable-list">
                        {item[childrenProp].map((item, i) => {
                            return (
                                <AnterosNestableItem
                                    key={i}
                                    item={item}
                                    options={options}
                                    isCopy={isCopy}
                                />
                            );
                        })}
                    </ol>
                )}
            </li>
        );
    }
}


class AnterosNestable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            itemsOld: null,
            dragItem: null,
            isDirty: false,
            collapsedGroups: []
        };

        this.elCopyStyles = null;
        this.mouse = {
            last: { x: 0 },
            shift: { x: 0 }
        };
        this.collapse = this.collapse.bind(this);
        this.startTrackMouse = this.startTrackMouse.bind(this);
        this.stopTrackMouse = this.stopTrackMouse.bind(this);
        this.dragRevert = this.dragRevert.bind(this);
        this.getPathById = this.getPathById.bind(this);
        this.getItemByPath = this.getItemByPath.bind(this);
        this.getItemDepth = this.getItemDepth.bind(this);
        this.getSplicePath = this.getSplicePath.bind(this);
        this.getRealNextPath = this.getRealNextPath.bind(this);
        this.getItemOptions = this.getItemOptions.bind(this);
        this.isCollapsed = this.isCollapsed.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onToggleCollapse = this.onToggleCollapse.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.renderDragLayer = this.renderDragLayer.bind(this);
    };

    componentDidMount() {
        let { items, childrenProp } = this.props;
        items = AnterosUtils.listWithChildren(items, childrenProp);
        this.setState({ items });
    }

    componentWillReceiveProps(nextProps) {
        const { items: itemsNew, childrenProp } = nextProps;

        this.stopTrackMouse();

        let extra = {};

        if (this.props.collapsed !== nextProps.collapsed) {
            extra.collapsedGroups = [];
        }

        this.setState({
            items: AnterosUtils.listWithChildren(itemsNew, childrenProp),
            dragItem: null,
            isDirty: false,
            ...extra
        });

    }

    componentWillUnmount() {
        this.stopTrackMouse();
    }

    collapse(itemIds) {
        const { childrenProp, collapsed } = this.props;
        const { items } = this.state;

        if (itemIds == 'NONE') {
            this.setState({
                collapsedGroups: collapsed
                    ? AnterosUtils.getAllNonEmptyNodesIds(items, childrenProp)
                    : []
            });

        } else if (itemIds == 'ALL') {
            this.setState({
                collapsedGroups: collapsed
                    ? []
                    : AnterosUtils.getAllNonEmptyNodesIds(items, childrenProp)
            });

        } else if (AnterosUtils.isArray(itemIds)) {
            this.setState({
                collapsedGroups: AnterosUtils.getAllNonEmptyNodesIds(items, childrenProp)
                    .filter(id => (itemIds.indexOf(id) > -1) ^ collapsed)
            });
        } else {

        }
    };

    startTrackMouse() {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onDragEnd);
        document.addEventListener('keydown', this.onKeyDown);
    };

    stopTrackMouse() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('keydown', this.onKeyDown);
        this.elCopyStyles = null;
    };

    moveItem({ dragItem, pathFrom, pathTo }, extraProps = {}) {
        const { childrenProp } = this.props;
        let { items } = this.state;
        const realPathTo = this.getRealNextPath(pathFrom, pathTo);
        const removePath = this.getSplicePath(pathFrom, {
            numToRemove: 1,
            childrenProp: childrenProp
        });

        const insertPath = this.getSplicePath(realPathTo, {
            numToRemove: 0,
            itemsToInsert: [dragItem],
            childrenProp: childrenProp
        });

        items = update(items, removePath);
        items = update(items, insertPath);

        this.setState({
            items,
            isDirty: true,
            ...extraProps
        });
    }

    tryIncreaseDepth(dragItem) {
        const { maxDepth, childrenProp, collapsed } = this.props;
        const pathFrom = this.getPathById(dragItem.id);
        const itemIndex = pathFrom[pathFrom.length - 1];
        const newDepth = pathFrom.length + this.getItemDepth(dragItem);
        if (itemIndex > 0 && newDepth <= maxDepth) {
            const prevSibling = this.getItemByPath(pathFrom.slice(0, -1).concat(itemIndex - 1));
            if (!prevSibling[childrenProp].length || !this.isCollapsed(prevSibling)) {
                const pathTo = pathFrom
                    .slice(0, -1)
                    .concat(itemIndex - 1)
                    .concat(prevSibling[childrenProp].length);
                let collapseProps = {};
                if (collapsed && !prevSibling[childrenProp].length) {
                    collapseProps = this.onToggleCollapse(prevSibling, true);
                }
                this.moveItem({ dragItem, pathFrom, pathTo }, collapseProps);
            }
        }
    }

    tryDecreaseDepth(dragItem) {
        const { childrenProp, collapsed } = this.props;
        const pathFrom = this.getPathById(dragItem.id);
        const itemIndex = pathFrom[pathFrom.length - 1];
        if (pathFrom.length > 1) {
            const parent = this.getItemByPath(pathFrom.slice(0, -1));
            if (itemIndex + 1 == parent[childrenProp].length) {
                let pathTo = pathFrom.slice(0, -1);
                pathTo[pathTo.length - 1] += 1;
                let collapseProps = {};
                if (collapsed && parent[childrenProp].length == 1) {
                    collapseProps = this.onToggleCollapse(parent, true);
                }
                this.moveItem({ dragItem, pathFrom, pathTo }, collapseProps);
            }
        }
    }

    dragApply() {
        const { onChange } = this.props;
        const { items, isDirty, dragItem } = this.state;

        this.setState({
            itemsOld: null,
            dragItem: null,
            isDirty: false
        });

        onChange && isDirty && onChange(items, dragItem);
    }

    dragRevert() {
        const { itemsOld } = this.state;

        this.setState({
            items: itemsOld,
            itemsOld: null,
            dragItem: null,
            isDirty: false
        });
    }

    getPathById(id, items = this.state.items) {
        const { childrenProp } = this.props;
        let path = [];

        items.every((item, i) => {
            if (item.id === id) {
                path.push(i);
            } else if (item[childrenProp]) {
                const childrenPath = this.getPathById(id, item[childrenProp]);

                if (childrenPath.length) {
                    path = path.concat(i).concat(childrenPath);
                }
            }

            return path.length == 0;
        });

        return path;
    }

    getItemByPath(path, items = this.state.items) {
        const { childrenProp } = this.props;
        let item = null;

        path.forEach((index, i) => {
            const list = item ? item[childrenProp] : items;
            item = list[index];
        });

        return item;
    }

    getItemDepth(item) {
        const { childrenProp } = this.props;
        let level = 1;

        if (item[childrenProp].length > 0) {
            const childrenDepths = item[childrenProp].map(this.getItemDepth);
            level += Math.max(...childrenDepths);
        }

        return level;
    };

    getSplicePath(path, options = {}) {
        const splicePath = {};
        const numToRemove = options.numToRemove || 0;
        const itemsToInsert = options.itemsToInsert || [];
        const lastIndex = path.length - 1;
        let currentPath = splicePath;

        path.forEach((index, i) => {
            if (i === lastIndex) {
                currentPath.$splice = [[index, numToRemove, ...itemsToInsert]];
            } else {
                const nextPath = {};
                currentPath[index] = { [options.childrenProp]: nextPath };
                currentPath = nextPath;
            }
        });

        return splicePath;
    }

    getRealNextPath(prevPath, nextPath) {
        const { childrenProp } = this.props;
        const ppLastIndex = prevPath.length - 1;
        const npLastIndex = nextPath.length - 1;

        if (prevPath.length < nextPath.length) {
            let wasShifted = false;

            return nextPath.map((nextIndex, i) => {
                if (wasShifted) {
                    return i == npLastIndex
                        ? nextIndex + 1
                        : nextIndex;
                }

                if (typeof prevPath[i] !== 'number') {
                    return nextIndex;
                }

                if (nextPath[i] > prevPath[i] && i == ppLastIndex) {
                    wasShifted = true;
                    return nextIndex - 1;
                }

                return nextIndex;
            });

        } else if (prevPath.length == nextPath.length) {
            if (nextPath[npLastIndex] > prevPath[npLastIndex]) {
                const target = this.getItemByPath(nextPath);
                if (target[childrenProp] && target[childrenProp].length && !this.isCollapsed(target)) {
                    return nextPath
                        .slice(0, -1)
                        .concat(nextPath[npLastIndex] - 1)
                        .concat(0);
                }
            }
        }

        return nextPath;
    }

    getItemOptions() {
        const { renderItem, handler, childrenProp } = this.props;
        const { dragItem } = this.state;

        return {
            dragItem,
            childrenProp,
            renderItem,
            handler,

            onDragStart: this.onDragStart,
            onMouseEnter: this.onMouseEnter,
            isCollapsed: this.isCollapsed,
            onToggleCollapse: this.onToggleCollapse
        };
    }

    isCollapsed(item) {
        const { collapsed } = this.props;
        const { collapsedGroups } = this.state;

        return !!((collapsedGroups.indexOf(item.id) > -1) ^ collapsed);
    };

    onDragStart(e, item) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.startTrackMouse();
        this.onMouseMove(e);

        this.setState({
            dragItem: item,
            itemsOld: this.state.items
        });
    };

    onDragEnd(e, isCancel) {
        e && e.preventDefault();

        this.stopTrackMouse();

        isCancel
            ? this.dragRevert()
            : this.dragApply();
    };

    onMouseMove(e) {
        const { group, threshold } = this.props;
        const { dragItem } = this.state;
        const { target, clientX, clientY } = e;
        const transformProps = AnterosUtils.getTransformProps(clientX, clientY);
        const el = AnterosUtils.closest(target, '.nestable-item');
        const elCopy = document.querySelector('.nestable-' + group + ' .nestable-drag-layer > .nestable-list');

        if (!this.elCopyStyles) {
            const offset = AnterosUtils.getOffsetRect(el);
            const scroll = {
                top: document.body.scrollTop,
                left: document.body.scrollLeft
            };

            this.elCopyStyles = {
                marginTop: offset.top - clientY - scroll.top,
                marginLeft: offset.left - clientX - scroll.left,
                ...transformProps
            };

        } else {
            this.elCopyStyles = {
                ...this.elCopyStyles,
                ...transformProps
            };
            for (let key in transformProps) {
                if (transformProps.hasOwnProperty(key)) {
                    elCopy.style[key] = transformProps[key];
                }
            }

            const diffX = clientX - this.mouse.last.x;
            if (
                (diffX >= 0 && this.mouse.shift.x >= 0) ||
                (diffX <= 0 && this.mouse.shift.x <= 0)
            ) {
                this.mouse.shift.x += diffX;
            } else {
                this.mouse.shift.x = 0;
            }
            this.mouse.last.x = clientX;

            if (Math.abs(this.mouse.shift.x) > threshold) {
                if (this.mouse.shift.x > 0) {
                    this.tryIncreaseDepth(dragItem);
                } else {
                    this.tryDecreaseDepth(dragItem);
                }

                this.mouse.shift.x = 0;
            }
        }
    };

    onMouseEnter(e, item) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const { collapsed, childrenProp } = this.props;
        const { dragItem } = this.state;
        if (dragItem.id === item.id) return;

        const pathFrom = this.getPathById(dragItem.id);
        const pathTo = this.getPathById(item.id);

        let collapseProps = {};
        if (collapsed && pathFrom.length > 1) {
            const parent = this.getItemByPath(pathFrom.slice(0, -1));
            if (parent[childrenProp].length == 1) {
                collapseProps = this.onToggleCollapse(parent, true);
            }
        }

        this.moveItem({ dragItem, pathFrom, pathTo }, collapseProps);
    };

    onToggleCollapse(item, isGetter) {
        const { collapsed } = this.props;
        const { collapsedGroups } = this.state;
        const isCollapsed = this.isCollapsed(item);

        const newState = {
            collapsedGroups: (isCollapsed ^ collapsed)
                ? collapsedGroups.filter(id => id != item.id)
                : collapsedGroups.concat(item.id)
        };

        if (isGetter) {
            return newState;
        } else {
            this.setState(newState);
        }
    };

    onKeyDown(e) {
        if (e.which === 27) {
            this.onDragEnd(null, true);
        }
    };

    renderDragLayer() {
        const { group } = this.props;
        const { dragItem } = this.state;
        const el = document.querySelector('.nestable-' + group + ' .nestable-item-' + dragItem.id);

        let listStyles = {};
        if (el) {
            listStyles.width = el.clientWidth;
        }
        if (this.elCopyStyles) {
            listStyles = {
                ...listStyles,
                ...this.elCopyStyles
            };
        }

        const options = this.getItemOptions();

        return (
            <div className="nestable-drag-layer">
                <ol className="nestable-list" style={listStyles}>
                    <AnterosNestableItem
                        item={dragItem}
                        options={options}
                        isCopy
                    />
                </ol>
            </div>
        );
    }

    render() {
        const { items, dragItem } = this.state;
        const { group } = this.props;
        const options = this.getItemOptions();

        return (
            <div className={classNames("nestable", "nestable-" + group, { 'is-drag-active': dragItem })}>
                <ol className="nestable-list nestable-group">
                    {items.map((item, i) => {
                        return (
                            <AnterosNestableItem
                                key={i}
                                item={item}
                                options={options}
                            />
                        );
                    })}
                </ol>

                {dragItem && this.renderDragLayer()}
            </div>
        );
    }
}

AnterosNestable.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.any.isRequired
        })
    ),
    threshold: PropTypes.number,
    maxDepth: PropTypes.number,
    collapsed: PropTypes.bool,
    childrenProp: PropTypes.string,
    renderItem: PropTypes.func,
    onChange: PropTypes.func
};
AnterosNestable.defaultProps = {
    items: [],
    threshold: 30,
    maxDepth: 10,
    collapsed: false,
    group: 0,
    childrenProp: 'children',
    renderItem: ({ item }) => item.toString(),
    onChange: () => { }
};

export default AnterosNestable;