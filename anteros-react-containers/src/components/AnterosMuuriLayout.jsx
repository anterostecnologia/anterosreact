import Muuri from 'muuri';
import PropTypes from 'prop-types';
import React, {
    Children, createContext, createRef,
    forwardRef, useCallback, useContext, useEffect,
    useRef, useState
} from 'react';

const key = '_component';
const isProduction = process.env.NODE_ENV === 'production';
const prefix = 'Invariant failed';
const gridClassName = 'containerClass';
const itemClassNames = [
    'itemClass',
    'itemVisibleClass',
    'itemHiddenClass',
    'itemPositioningClass',
    'itemDraggingClass',
    'itemReleasingClass',
    'itemPlaceholderClass',
];

const hooksNames = [
    'useData',
    'useDrag',
    'useDraggable',
    'useGrid',
    'useRefresh',
    'useShow',
    'useVisibility',
];
const HooksHandlers = [
    ['useData', /*       */ getHandler('setData')],
    ['useDrag', /*       */ getHandler('isDragging')],
    ['useDraggable', /*  */ getHandler('setDraggable')],
    ['useGrid', /*       */ getHandler('gridData')],
    ['useRefresh', /*    */ getHandler('refresh')],
    ['useShow', /*       */ getHandler('isShowing')],
    ['useVisibility', /* */ getHandler('setVisibility')],
];


export function addDecoration(
    instance,
    decoration
) {
    if (isDecorated(instance)) {
        Object.assign(instance[key], decoration);
    } else {
        instance[key] = { ...decoration };
    }
}

export function getDecoration(instance) {
    return instance[key];
}

export function isDecorated(instance) {
    return !!instance[key];
}

export class Invariant extends Error {
    constructor(message) {
        super(message);

        this.name = 'Invariant';
    }
}

export function fillGrid(grid) {
    const sizerElement = document.createElement('div');

    sizerElement.style.visibility = 'hidden';
    sizerElement.style.position = 'absolute';
    sizerElement.classList.add('grid-sizer');

    addDecoration(grid, { sizerElement });
    const gridElement = grid.getElement();

    if (gridElement.children.length === 0) {
        gridElement.appendChild(sizerElement);
    } else {
        gridElement.insertBefore(sizerElement, gridElement.children[0]);
    }
}

const positions = ['relative', 'absolute', 'fixed'];


export function fillGridElement(
    gridElement,
    gridClass
) {
    const position = getComputedStyle(gridElement).position;
    if (!positions.includes(position)) {
        gridElement.style.position = positions[0];
    }
    gridElement.classList.add(gridClass);
    const defaultSetAttribute = gridElement.setAttribute.bind(gridElement);
    gridElement.setAttribute = function setAttribute(attribute, value) {
        if (attribute === 'class') {
            const classNames = (gridElement.getAttribute('class') || '').split(' ');
            if (!classNames.includes(gridClass)) value = `${value} ${gridClass}`;
        }
        defaultSetAttribute(attribute, value);
    };
}

export function fillItem(item) {
    addDecoration(item, { props: {}, data: {} });
    Object.defineProperty(item, '_sortData', {
        get() {
            return this.getData();
        },
        set() {
        },
    });
}

export function fillItemElement(
    itemElement,
    itemClasses
) {
    itemElement.style.position = 'absolute';
    const defaultSetAttribute = itemElement.setAttribute.bind(itemElement);
    itemElement.setAttribute = function setAttribute(attribute, value) {
        if (attribute === 'class') {
            const classNames = (itemElement.getAttribute('class') || '').split(' ');
            const classNamesToAdd = classNames.filter((className) =>
                itemClasses.includes(className)
            );
            value = `${value} ${classNamesToAdd.join(' ')}`;
        }
        defaultSetAttribute(attribute, value);
    };
}

export function removeDecorations(decorated) {
    decorated._component = null;
}

export function addItems(
    grid,
    addedDOMItems,
    indicesToAdd,
    addOptions,
    filter
) {
    for (let i = 0; i < addedDOMItems.length; i++) {
        grid.add(addedDOMItems[i], { index: indicesToAdd[i], layout: false });
    }
    if (!filter && addOptions.show) {
        grid.show(grid.getItems(indicesToAdd), { layout: false });
    }
}

export function filterItems(
    grid,
    predicate
) {
    grid.filter((item) => predicate(item.getData(), item), { layout: false });
}

export function getGridClass(grid) {
    return grid._settings[gridClassName];
}

export function getItemClasses(grid) {
    return itemClassNames.map((className) => grid._settings[className]);
}

export function hideItems(grid, items) {
    grid.hide(items, { layout: false });
}

export function removeItems(
    grid,
    itemsToRemove
) {
    grid.remove(itemsToRemove, { layout: false, removeElements: false });
}

export function showItems(grid, items) {
    grid.show(items, { layout: false });
}

export function sortItems(
    grid,
    predicate,
    sortOptions
) {
    sortOptions = { ...(sortOptions || {}), layout: false };
    if (typeof predicate === 'function') {
        handleFunction(grid, predicate, sortOptions);
    }
    if (typeof predicate === 'string') {
        handleString(grid, predicate, sortOptions);
    }
    if (Array.isArray(predicate)) {
        handleArray(grid, predicate, sortOptions);
    }
}

function handleFunction(
    grid,
    predicate,
    sortOptions
) {
    grid.sort(
        (itemA, itemB) => predicate(itemA.getData(), itemB.getData(), itemA, itemB),
        sortOptions
    );
}

function handleString(
    grid,
    predicate,
    sortOptions
) {
    grid.sort(predicate, sortOptions);
}


function handleArray(
    grid,
    predicate,
    sortOptions
) {
    const items = grid.getItems();
    const sortedItems = [];
    const otherItems = [];

    items.forEach((item) => {
        const itemKey = item._component.key;
        const index = predicate.findIndex((key) => key === itemKey);

        if (index > -1) {
            sortedItems[index] = item;
        } else {
            otherItems.push(item);
        }
    });

    grid.sort(
        Array.prototype.concat(
            sortedItems.filter((item) => !!item),
            otherItems
        ),
        sortOptions
    );
}

export function useFunction(callback) {
    return useRef(callback).current;
}

export function useInstantEffect(
    didUpdate,
    deps
) {
    const needUpdate = useReference(deps);
    const cleanUpRef = useRef();
    if (needUpdate) {
        if (cleanUpRef.current) cleanUpRef.current();
        cleanUpRef.current = didUpdate();
    }
    useEffect(() => {
        return () => {
            if (cleanUpRef.current) cleanUpRef.current();
        };
    }, []);
}

export function useMemoized(factory) {
    const valueRef = useRef();

    if (!valueRef.current) {
        valueRef.current = factory();
    }

    return valueRef.current;
}

export function useReference(dependencyList) {
    const ref = useRef(dependencyList);
    if (ref.current === dependencyList) return true;
    const didUpdate = compare(ref.current, dependencyList);
    ref.current = dependencyList;
    return didUpdate;
}

export function useRerender() {
    const setState = useState()[1];
    return useFunction(() => {
        setState(Object.create(null));
    });
}

export function getInstance(options) {
    const el = document.createElement('div');
    el.style.display = 'none';
    document.body.appendChild(el);
    const grid = new Muuri(el, options);
    document.body.removeChild(el);
    return grid;
}

export function handleRef(ref, value) {
    if (!ref) return;

    if (typeof ref === 'function') ref(value);
    else if ('current' in ref) ref.current = value;
}

export function setDragAutoScroll(options) {
    const { dragAutoScroll } = options;
    if (!dragAutoScroll || !Array.isArray(dragAutoScroll.targets)) return;
    dragAutoScroll.targets.forEach((target) => {
        if (isTargetElement(target)) return;
        invariant(
            'element' in target,
            'You must provide an element in each scroll target'
        );
        const element = target.element;
        let ref = {
            current: null,
        };

        Object.defineProperty(target, 'element', {
            get() {
                return ref.current;
            },
            set(element) {
                if (isTargetElement(element)) {
                    ref.current = element;
                } else {
                    ref = element;
                }
            },
        });

        target.element = element;
    });
}

export function isTargetElement(target) {
    return (
        target instanceof HTMLElement ||
        target instanceof window.constructor
    );
}

export function setDragContainer(options) {
    const { dragContainer } = options;
    let ref = { current: null };
    Object.defineProperty(options, 'dragContainer', {
        get() {
            return ref.current;
        },
        set(value) {
            if (!value || value instanceof Element) {
                ref.current = value;
            } else {
                ref = value;
            }
        },
    });
    options.dragContainer = dragContainer;
}

export function setDragSort(options, globalMap) {
    const { dragSort } = options;
    if (!dragSort || typeof dragSort !== 'object') return;
    invariant(
        typeof dragSort.groupId === 'string',
        'You must provide a string as groupId'
    );
    const group = globalMap.getGroup(dragSort.groupId);
    options.dragSort = () => group;
}

export function setDragStartPredicate(options) {
    const { dragStartPredicate } = options;
    const defaultStartPredicate = getDefaultStartPredicate(dragStartPredicate);
    options.dragStartPredicate = (item, event) => {
        if (!getDecoration(item.getGrid()).dragEnabled) return false;
        if (isDecorated(item) && getDecoration(item).draggable === false)
            return false;

        return defaultStartPredicate(item, event);
    };
}

function getDefaultStartPredicate(
    dragStartPredicate
) {
    return typeof dragStartPredicate === 'function'
        ? dragStartPredicate
        : (item, event) => {
            return Muuri.ItemDrag.defaultStartPredicate(
                item,
                event,
                dragStartPredicate
            );
        };
}


function compare(a, b) {
    if (a.length !== b.length) return true;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return true;
    }

    return false;
}

export function invariant(
    condition,
    message
) {
    if (condition) {
        return;
    }

    if (isProduction) {
        throw new Invariant(prefix);
    } else {
        throw new Invariant(`${prefix}: ${message || ''}`);
    }
}

Muuri.prototype.getId = function getId() {
    return getDecoration(this).id;
};
Muuri.prototype.getGroupIds = function getGroupIds() {
    return getDecoration(this).groupIds;
};
Muuri.prototype.getSizerElement = function getSizerElement() {
    return getDecoration(this).sizerElement;
};

Muuri.Item.prototype.getKey = function getKey() {
    return getDecoration(this).key;
};
Muuri.Item.prototype.getProps = function getProps() {
    return getDecoration(this).props;
};
Muuri.Item.prototype.getData = function getData() {
    return getDecoration(this).data;
};
Muuri.Item.prototype.setData = function setData(data) {
    getDecoration(this).data = data;
};

export function GridComponent({
    children,
    gridProps,
    grid,
    filter,
    sort,
    sortOptions,
    addOptions,
    propsToData,
    onSend,
    onDragStart,
    onDragEnd,
    onFilter,
    onSort,
    onMount,
    onUnmount,
    forceSync,
    dragFixed,
    dragEnabled,
    style,
    instantLayout,
}) {
    const store = useMemoized(() => ({
        gridRef: /*      */ createRef(),
        gridClass: /*    */ getGridClass(grid),
        itemClasses: /*  */ getItemClasses(grid),
        childrenController: /*    */ new ChildrenController(),
        fiberController: /*       */ new FiberController(),
        itemAddController: /*     */ new ItemAddController(),
        itemRemoveController: /*  */ new ItemRemoveController(),
        layoutController: /*      */ new LayoutController(),
        onUnmount,
        onDragStart,
        onDragEnd,
        onFilter,
        onSort,
        onSend,
    }));

    const vars = {
        indicesToAdd: /*   */[],
        addedDOMItems: /*  */[],
        itemsToRemove: /*  */[],
        itemsToRefresh: /* */[],
        itemsToShow: /*    */[],
        itemsToHide: /*    */[],
        hasAdded: /*      */ false,
        hasRemoved: /*    */ false,
        hasFiltered: /*   */ false,
        hasSorted: /*     */ false,
        hasRefreshed: /*  */ false,
        hasShown: /*      */ false,
        hasHidden: /*     */ false,
    };

    useEffect(() => {
        grid
            .on('beforeSend', ({ item, fromGrid, fromIndex }) => {
                if (!getDecoration(item).sentPayload) {
                    const sentPayload = {
                        fromChildrenController: store.childrenController,
                        fromFiberController: store.fiberController,
                        fromGrid,
                        fromIndex,
                    };
                    addDecoration(item, { sentPayload });
                }
            })
            .on('receive', ({ item, toGrid, toIndex }) => {
                const toChildrenController = store.childrenController;
                const toFiberController = store.fiberController;
                if (item.isDragging()) {
                    const receivedPayload = {
                        toChildrenController,
                        toFiberController,
                        toGrid,
                        toIndex,
                    };
                    addDecoration(item, { receivedPayload });
                } else {
                    const sentPayload = getDecoration(item).sentPayload;
                    invariant(sentPayload !== null && typeof sentPayload === 'object');
                    const { fromChildrenController, fromFiberController } = sentPayload;
                    addDecoration(item, { sentPayload: null });
                    const itemFiber = fromFiberController.remove(item.getKey());
                    const itemComponent = fromChildrenController.remove(itemFiber.index);
                    toFiberController.append(itemFiber);
                    toChildrenController.append(itemComponent);
                }
                getDecoration(item).eventController.emitEvent('send', grid);
            })

            .on('dragInit', (item, event) => {
                store.childrenController.incrementDragCounter();
                getDecoration(item).eventController.emitEvent('drag', true);
                if (store.onDragStart) store.onDragStart(item, event);
            })
            .on('dragEnd', (item) => {
                const sentPayload = getDecoration(item).sentPayload;
                const receivedPayload = getDecoration(item).receivedPayload;
                if (sentPayload && receivedPayload) {
                    const {
                        fromChildrenController,
                        fromFiberController,
                        fromGrid,
                        fromIndex,
                    } = sentPayload;
                    const {
                        toChildrenController,
                        toFiberController,
                        toGrid,
                        toIndex,
                    } = receivedPayload;
                    addDecoration(item, { sentPayload: null, receivedPayload: null });
                    if (fromGrid !== toGrid) {
                        invariant(
                            typeof store.onSend === 'function',
                            'An item cannot be sent to another MuuriComponent if the ' +
                            "'onSend' property has not been passed to the MuuriComponent."
                        );
                        const itemFiber = fromFiberController.remove(item.getKey());
                        const itemComponent = fromChildrenController.remove(
                            itemFiber.index
                        );
                        toFiberController.append(itemFiber);
                        toChildrenController.append(itemComponent);
                        store.onSend({
                            key: getDecoration(item).key,
                            fromGrid,
                            fromIndex,
                            fromId: getDecoration(fromGrid).id,
                            fromGroupIds: getDecoration(fromGrid).groupIds,
                            toGrid,
                            toIndex,
                            toId: getDecoration(toGrid).id,
                            toGroupIds: getDecoration(toGrid).groupIds,
                        });
                    }
                }
            })
            .on('dragReleaseEnd', (item) => {
                store.childrenController.decrementDragCounter();
                getDecoration(item).eventController.emitEvent('drag', false);
                if (store.onDragEnd) store.onDragEnd(item);
            })

            .on('showStart', (items) => {
                if (!isDecorated(items[0])) return;
                items.forEach((item) => {
                    const eventController = getDecoration(item).eventController;
                    if (eventController.getPayload('show') !== true) {
                        eventController.emitEvent('show', true);
                    }
                });
            })
            .on('hideEnd', (items) => {
                items.forEach((item) => {
                    const eventController = getDecoration(item).eventController;
                    if (eventController.getPayload('show') !== false) {
                        eventController.emitEvent('show', false);
                    }
                });
            })

            .on('filter', (shownItems, hiddenItems) => {
                if (store.onFilter) store.onFilter(shownItems, hiddenItems);
            })
            .on('sort', (currentOrder, previousOrder) => {
                if (store.onSort) store.onSort(currentOrder, previousOrder);
            });

        if (dragFixed) {
            grid
                .on('dragInit', (item) => {
                    const element = item.getElement();
                    invariant(element !== undefined);
                    const { width, height, paddingTop } = getComputedStyle(element);
                    addDecoration(item, {
                        dragWidth: element.style.width,
                        dragHeight: element.style.height,
                        dragPaddingTop: element.style.paddingTop,
                    });
                    element.style.width = width;
                    element.style.height = height;
                    element.style.paddingTop = paddingTop;
                })
                .on('dragReleaseEnd', (item) => {
                    const element = item.getElement();
                    invariant(element !== undefined);
                    const { dragWidth, dragHeight, dragPaddingTop } = getDecoration(item);
                    element.style.width = dragWidth;
                    element.style.height = dragHeight;
                    element.style.paddingTop = dragPaddingTop;
                });
        }
        invariant(store.gridRef.current !== null);
        grid._element = store.gridRef.current;
        fillGridElement(store.gridRef.current, store.gridClass);
        fillGrid(grid);
        if (onMount) onMount(grid);
        return () => {
            store.childrenController.destroy();
            store.fiberController.destroy();
            store.itemRemoveController.destroy();
            store.itemAddController.destroy();
            store.layoutController.destroy();
        };
    }, []); // eslint-disable-line

    store.childrenController.useInit(children);
    store.fiberController.useInit(store.gridRef);
    store.itemRemoveController.useInit();
    store.itemAddController.useInit();
    store.layoutController.useInit();

    const isFilterChanged = useReference([filter]);
    const isSortChanged = useReference([sort, sortOptions]);

    useEffect(() => {
        addDecoration(grid, { dragEnabled });

        vars.indicesToAdd = store.childrenController.getIndicesToAdd();
        vars.addedDOMItems = store.fiberController.getStateNodes(vars.indicesToAdd);
        vars.itemsToRemove = store.itemRemoveController.getItemsToRemove();
        vars.itemsToRefresh = store.layoutController.getItemsToRefresh();
        vars.itemsToShow = store.layoutController.getItemsToShow();
        vars.itemsToHide = store.layoutController.getItemsToHide();

        store.onUnmount = onUnmount;
        store.onDragStart = onDragStart;
        store.onDragEnd = onDragEnd;
        store.onFilter = onFilter;
        store.onSort = onSort;
        store.onSend = onSend;
    });

    useEffect(() => {
        if (vars.itemsToRemove.length) {
            removeItems(grid, vars.itemsToRemove);
            vars.hasRemoved = true;
        }

        if (vars.indicesToAdd.length) {
            addItems(grid, vars.addedDOMItems, vars.indicesToAdd, addOptions, filter);
            const addedItems = grid.getItems(vars.indicesToAdd);
            store.itemAddController.emit(addedItems);
            vars.hasAdded = true;
        }

        if (filter && (isFilterChanged || vars.hasAdded || forceSync)) {
            filterItems(grid, filter);
            vars.hasFiltered = true;
        }

        if (sort && (isSortChanged || vars.hasAdded || forceSync)) {
            sortItems(grid, sort, sortOptions);
            vars.hasSorted = true;
        }

        if (!filter && vars.itemsToShow.length) {
            showItems(grid, vars.itemsToShow);
            vars.hasShown = true;
        }

        if (!filter && vars.itemsToHide.length) {
            hideItems(grid, vars.itemsToHide);
            vars.hasHidden = true;
        }

        if (vars.itemsToRefresh.length) {
            grid.refreshItems(vars.itemsToRefresh);
            vars.hasRefreshed = true;
        }
        if (
            vars.hasAdded ||
            vars.hasRemoved ||
            vars.hasSorted ||
            vars.hasFiltered ||
            vars.hasRefreshed ||
            vars.hasShown ||
            vars.hasHidden
        ) {
            grid.layout(instantLayout);
        }
    });

    const value = useMemoized(() => ({
        layoutController: store.layoutController,
        grid,
    }));

    return (
        <GridProvider value={value}>
            <div
                style={style}
                {...gridProps}
                ref={store.gridRef}
                {...store.fiberController.getFlagProp()}>
                {store.childrenController.render((child, key) => (
                    <ItemComponent
                        key={key}
                        itemKey={key}
                        grid={grid}
                        propsToData={propsToData}
                        itemClasses={store.itemClasses}
                        itemAddController={store.itemAddController}
                        itemRemoveController={store.itemRemoveController}>
                        {child}
                    </ItemComponent>
                ))}
            </div>
        </GridProvider>
    );
}

GridComponent.propTypes = {
    grid: PropTypes.object.isRequired,
    gridProps: PropTypes.object,
    filter: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    sort: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    sortOptions: PropTypes.exact({
        descending: PropTypes.bool,
    }),
    addOptions: PropTypes.exact({
        show: PropTypes.bool,
    }),
    onSend: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onFilter: PropTypes.func,
    onSort: PropTypes.func,
    onMount: PropTypes.func,
    onUnmount: PropTypes.func,
    forceSync: PropTypes.bool,
    dragFixed: PropTypes.bool,
    dragEnabled: PropTypes.bool,
    instantLayout: PropTypes.bool,
};

GridComponent.defaultProps = {
    gridProps: {},
    addOptions: { show: true },
    sortOptions: { descending: false },
    forceSync: false,
    dragFixed: false,
    dragEnabled: false,
    instantLayout: false,
};

GridComponent.displayName = 'GridComponent';


function ItemComponent({
    children: child,
    itemClasses,
    itemAddController,
    itemRemoveController,
    propsToData,
    itemKey,
    grid,
}) {
    const store = useMemoized(() => {
        const eventController = new EventController();
        const itemRefController = new ItemRefController();
        itemRefController.set('key', itemKey);
        itemRefController.set('eventController', eventController);
        return { eventController, itemRefController, itemRemoveController, grid };
    });

    store.itemRefController.set('props', child.props);
    store.itemRemoveController = itemRemoveController;
    store.grid = grid;

    if (propsToData) {
        const data = propsToData(child.props);
        invariant(
            typeof data === 'object',
            `The data returned by 'propsToData' must be an object, founded ${typeof data}`
        );
        store.itemRefController.set('data', data);
    }

    useEffect(() => {
        itemAddController.requestItem((item) => {
            fillItem(item);
            fillItemElement(item.getElement(), itemClasses);
            store.itemRefController.setItem(item);
        });

        return () => {
            const item = store.itemRefController.getItem();
            invariant(item !== null);
            const element = item.getElement();
            invariant(element !== undefined);
            if (item.isDragging()) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                if (item._drag) item._drag.destroy();
                store.grid.getElement().appendChild(element);
            }
            store.itemRefController.delete();
            store.itemRemoveController.removeItem(item);
            store.itemRefController.destroy();
            store.eventController.destroy();
        };
    }, []);
    return <ItemProvider value={store}>{child}</ItemProvider>;
}

ItemComponent.propTypes = {
    itemAddController: PropTypes.object.isRequired,
    itemClasses: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    propsToData: PropTypes.func,
    children: PropTypes.element.isRequired,
    grid: PropTypes.instanceOf(Muuri).isRequired,
};

ItemComponent.displayName = 'ItemComponent';


export class MuuriMap {
    _idMap = new Map();
    _groupMap = new Map();
  
    get(id) {
      return this._idMap.get(id) || null;
    }
  
    getGroup(groupId) {
      const group = this._groupMap.get(groupId);
  
      if (!group) {
        const newGroup = [];
        this._groupMap.set(groupId, newGroup);
        return newGroup;
      } else {
        return group;
      }
    }

    getAll() {
      return Array.from(this._idMap.values());
    }
  
    set(grid, id) {
      this._idMap.set(id, grid);
      return this;
    }

    setGroup(grid, groupId) {
      const group = this._groupMap.get(groupId);
  
      if (group) {
        group.push(grid);
      } else {
        this._groupMap.set(groupId, [grid]);
      }
  
      return this;
    }
  
    delete(id) {
      this._idMap.delete(id);
      return this;
    }
  
    deleteGroup(grid, groupId) {
      const group = this._groupMap.get(groupId);
  
      if (group) {
        const index = group.indexOf(grid);
        if (index > -1) group.splice(index, 1);
      }
  
      return this;
    }

    clear() {
      this._idMap.clear();
      this._groupMap.clear();
      return this;
    }
  }
  
  export const muuriMap = new MuuriMap();


export const AnterosMuuriLayout = forwardRef(
    function MuuriComponent(
        {
            children,
            id,
            groupIds,
            gridProps,
            filter,
            sort,
            sortOptions,
            addOptions,
            propsToData,
            onSend,
            onDragStart,
            onDragEnd,
            onFilter,
            onSort,
            onMount,
            onUnmount,
            forceSync,
            dragFixed,
            dragEnabled,
            instantLayout,
            style,
            ...options
        },
        muuriRef
    ) {
        const grid = useMemoized(() => {
            options.items = [];
            options.dragEnabled = dragEnabled !== null;
            setDragContainer(options);
            setDragSort(options, muuriMap);
            setDragAutoScroll(options);
            setDragStartPredicate(options);
            const grid = getInstance(options);
            if (id) muuriMap.set(grid, id);
            addDecoration(grid, { id });
            handleRef(muuriRef, grid);
            return grid;
        });
        useEffect(() => {
            return () => {
                handleRef(muuriRef, null);
                removeDecorations(grid);
                if (id) muuriMap.delete(id);
                grid.destroy();
            };
        }, []);

        useInstantEffect(() => {
            addDecoration(grid, { groupIds });
            if (groupIds) {
                groupIds.forEach((groupId) => {
                    muuriMap.setGroup(grid, groupId);
                });
            }

            return () => {
                if (groupIds) {
                    groupIds.forEach((groupId) => {
                        muuriMap.deleteGroup(grid, groupId);
                    });
                }
            };
        }, groupIds || []);

        return (
            <GridComponent
                grid={grid}
                gridProps={gridProps}
                filter={filter}
                sort={sort}
                style={style}
                sortOptions={sortOptions}
                addOptions={addOptions}
                propsToData={propsToData}
                onSend={onSend}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onFilter={onFilter}
                onSort={onSort}
                onMount={onMount}
                onUnmount={onUnmount}
                forceSync={forceSync}
                dragFixed={dragFixed}
                dragEnabled={dragEnabled}
                instantLayout={instantLayout}>
                {children}
            </GridComponent>
        );
    }
);

AnterosMuuriLayout.propTypes = {
    id: PropTypes.string,
    groupIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    showDuration: PropTypes.number,
    showEasing: PropTypes.string,
    hideDuration: PropTypes.number,
    hideEasing: PropTypes.string,
    visibleStyles: PropTypes.shape({}),
    hiddenStyles: PropTypes.shape({}),
    layout: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.exact({
            fillGaps: PropTypes.bool,
            horizontal: PropTypes.bool,
            alignRight: PropTypes.bool,
            alignBottom: PropTypes.bool,
            rounding: PropTypes.bool,
        }),
    ]),
    layoutOnResize: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    layoutDuration: PropTypes.number,
    layoutEasing: PropTypes.string,
    dragContainer: PropTypes.oneOfType([
        PropTypes.instanceOf(HTMLElement),
        PropTypes.shape({
            current: PropTypes.instanceOf(HTMLElement).isRequired,
        }),
    ]),
    dragStartPredicate: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.exact({
            distance: PropTypes.number,
            delay: PropTypes.number,
            handle: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        }),
    ]),
    dragAxis: PropTypes.oneOf(['x', 'y', 'xy']),
    dragSort: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func,
        PropTypes.exact({
            groupId: PropTypes.string.isRequired,
        }),
    ]),
    dragSortHeuristics: PropTypes.exact({
        sortInterval: PropTypes.number,
        minDragDistance: PropTypes.number,
        minBounceBackAngle: PropTypes.number,
    }),
    dragSortPredicate: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.exact({
            action: PropTypes.oneOf(['move', 'swap']),
            migrateAction: PropTypes.oneOf(['move', 'swap']),
            threshold: PropTypes.number,
        }),
    ]),
    dragRelease: PropTypes.exact({
        duration: PropTypes.number,
        easing: PropTypes.string,
        useDragContainer: PropTypes.bool,
    }),
    dragCssProps: PropTypes.exact({
        touchAction: PropTypes.string,
        userSelect: PropTypes.string,
        userDrag: PropTypes.string,
        tapHighlightColor: PropTypes.string,
        touchCallout: PropTypes.string,
        contentZooming: PropTypes.string,
    }),
    dragPlaceholder: PropTypes.exact({
        enabled: PropTypes.bool,
        createElement: PropTypes.func,
        onCreate: PropTypes.func,
        onRemove: PropTypes.func,
        easing: PropTypes.string,
        duration: PropTypes.number,
    }),
    containerClass: PropTypes.string,
    itemClass: PropTypes.string,
    itemVisibleClass: PropTypes.string,
    itemHiddenClass: PropTypes.string,
    itemPositioningClass: PropTypes.string,
    itemDraggingClass: PropTypes.string,
    itemReleasingClass: PropTypes.string,
    itemPlaceholderClass: PropTypes.string,
};


AnterosMuuriLayout.defaultProps = {
    ...Muuri.defaultOptions,
    dragEnabled: null,
};

AnterosMuuriLayout.displayName = 'AnterosMuuriLayout';
AnterosMuuriLayout.componentName = "AnterosMuuriLayout"




export const GridContext = createContext({});
export const GridProvider = GridContext.Provider;
export const useGridContext = () => useContext(GridContext);
GridContext.displayName = 'GridProvider';

export const ItemContext = createContext({});
export const ItemProvider = ItemContext.Provider;
export const useItemContext = () => useContext(ItemContext);
ItemContext.displayName = 'ItemProvider';

export class ChildrenController {
    _oldChildrenArray = [];
    _children = [];
    _indicesToAdd = [];
    _dragCounter = 0;

    useInit(newChildren) {
        const newChildrenArray = Children.toArray(newChildren);
        this._indicesToAdd = getIndicesToAdd(
            newChildrenArray,
            this._oldChildrenArray
        );
        this._children = newChildren || [];
        this._oldChildrenArray = newChildrenArray;
    }

    remove(index) {
        return this._oldChildrenArray.splice(index, 1)[0];
    }

    append(child) {
        this._oldChildrenArray.push(child);
    }

    getIndicesToAdd() {
        return this._indicesToAdd;
    }

    render(cb) {
        const children = Children.map(this._children, (child) => {
            return cb(child, child.key);
        });
        this.flush();
        return children;
    }

    incrementDragCounter() {
        this._dragCounter += 1;
    }

    decrementDragCounter() {
        this._dragCounter -= 1;
    }

    flush() {
        this._children = [];
    }

    destroy() {
        this.flush();
    }
}

export function getIndicesToAdd(
    newChildren,
    oldChildren
) {
    const indicesToAdd = [];
    let oIndex = 0;
    for (let nIndex = 0; nIndex < newChildren.length; nIndex++) {
        const index = findIndex(oldChildren, newChildren[nIndex], oIndex);
        if (index === -1) {
            indicesToAdd.push(nIndex);
        } else {
            oIndex = index;
        }
    }
    return indicesToAdd;
}

function findIndex(
    children,
    child,
    fromIndex
) {
    fromIndex = fromIndex > children.length ? children.length : fromIndex;
    for (let index = fromIndex; index < children.length; index++) {
        if (is(child, children[index])) return index;
    }
    for (let index = 0; index < fromIndex; index++) {
        if (is(child, children[index])) return index;
    }
    return -1;
}

function is(
    componentA,
    componentB
) {
    return componentA.key === componentB.key;
}

export class EventController {
    _eventsMap = new Map();
    _payloadsMap = new Map();

    enableEvent(event, emitter) {
        this._eventsMap.set(event, emitter);
    }

    emitEvent(event, payload) {
        if (this.isEnabled(event)) {
            this._payloadsMap.set(event, payload);
            this._eventsMap.get(event)();
        }
    }

    getPayload(event) {
        return this._payloadsMap.get(event);
    }

    isEnabled(event) {
        return this._eventsMap.has(event);
    }

    destroy() {
        this._eventsMap.clear();
        this._payloadsMap.clear();
    }
}


export class FiberController {
    _fiber;
    _flag = '0';

    useInit(gridElementRef) {
        this.updateFlag();
        useEffect(() => {
            invariant(gridElementRef.current !== null);
            this._fiber = getFiber(gridElementRef.current);
        }, []);
    }

    getStateNodes(orderedIndices) {
        const stateNodes = [];
        if (orderedIndices.length === 0) return stateNodes;
        let child = getCurrentFiber(this._fiber, this._flag).child;
        orderedIndices.forEach((index) => {
            while (child.index !== index) {
                child = child.sibling;
            }
            stateNodes.push(getStateNode(child));
        });
        return stateNodes;
    }

    append(itemComponentFiber) {
        const fiber = getCurrentFiber(this._fiber, this._flag);
        appendFiber(fiber, itemComponentFiber);

        if (fiber.alternate) {
            if (itemComponentFiber.alternate) {
                appendFiber(fiber.alternate, itemComponentFiber.alternate);
            }
        }
    }

    remove(key) {
        const fiber = getCurrentFiber(this._fiber, this._flag);
        const removedChild = removeChild(fiber, key);

        if (fiber.alternate) {
            if (removedChild.alternate) {
                removeChild(fiber.alternate, key);
            }
        }

        return removedChild;
    }

    getFlagProp() {
        return { [FlagProp]: this._flag };
    }

    updateFlag() {
        if (this._flag === '0') this._flag = '1';
        else this._flag = '0';
    }

    destroy() {
        this._fiber = null;
    }
}

export const FlagProp = 'muuri-react-flag';


function getFiber(grid) {
    const key = Object.keys(grid).find((key) =>
        key.startsWith('__reactInternalInstance$')
    );

    invariant(
        typeof key === 'string',
        'Cannot find the __reactInternalInstance$'
    );

    return grid[key];
}

function getCurrentFiber(
    fiber,
    currentFlag
) {
    if (!fiber.alternate) return fiber;
    const fiberFlag = fiber.memoizedProps[FlagProp];
    const alternateFlag = fiber.alternate.memoizedProps[FlagProp];
    if (fiberFlag === alternateFlag) {
        let topFiber = fiber;
        while (topFiber.return) {
            topFiber = topFiber.return;
        }
        const rootFiber = topFiber.stateNode;
        const topCurrentFiber = rootFiber.current;
        return topCurrentFiber === topFiber ? fiber : fiber.alternate;
    }
    return fiberFlag === currentFlag ? fiber : fiber.alternate;
}

function getStateNode(itemComponentFiber) {
    let itemFiber = itemComponentFiber.child.child;
    while (!(itemFiber.stateNode instanceof HTMLElement))
        itemFiber = itemFiber.child;
    return itemFiber.stateNode;
}

function appendFiber(
    parent,
    child
) {
    if (!parent.child) {
        parent.child = child;
        child.index = 0;
    } else {
        let c = parent.child;
        while (c.sibling) {
            c = c.sibling;
        }
        child.index = c.index + 1;
        c.sibling = child;
    }

    child.return = parent;
    if (child._debugOwner) child._debugOwner = parent.return.return;
}

function removeChild(parent, key) {
    let child = parent.child;
    let removedChild;

    if (hasNot(child, key)) {
        while (hasNot(child.sibling, key)) {
            child = child.sibling;
        }
        removedChild = removeSibling(child);
        adjustIndices(child);
    } else {
        removedChild = removeFirstChild(parent);
        child = child.sibling;
        if (child) adjustIndices(child);
    }

    removedChild.sibling = null;
    return removedChild;
}

function removeFirstChild(
    gridElementFiber
) {
    const removed = gridElementFiber.child;
    gridElementFiber.child = gridElementFiber.child.sibling;
    return removed;
}

function removeSibling(fiber) {
    const removed = fiber.sibling;
    fiber.sibling = fiber.sibling.sibling;
    return removed;
}

function adjustIndices(itemComponentFiber) {
    while (itemComponentFiber.sibling) {
        itemComponentFiber.sibling.index = itemComponentFiber.index + 1;
        itemComponentFiber = itemComponentFiber.sibling;
    }
}

function hasNot(itemComponentFiber, key) {
    return itemComponentFiber.child.child.key !== key;
}

export class ItemAddController {
    _requests = [];

    useInit() {
        this._requests = [];
    }

    emit(items) {
        for (let i = 0; i < this._requests.length; i++) {
            this._requests[i](items[i]);
        }
    }

    requestItem(cb) {
        this._requests.push(cb);
    }

    destroy() {
        this._requests = [];
    }
}

export class ItemRefController {
    _item = null;
    _instance = {};

    set(key, value) {
        if (this._item) {
            addDecoration(this._item, { [key]: value });
        } else {
            this._instance[key] = value;
        }
    }
    get(key) {
        if (this._item) {
            return getDecoration(this._item)[key];
        } else {
            return this._instance[key];
        }
    }

    delete() {
        if (this._item) removeDecorations(this._item);
    }

    setItem(item) {
        this._item = item;
        addDecoration(this._item, this._instance);
        this._instance = {};
    }

    getItem() {
        invariant(this._item !== null, 'The item has not been setted yet');
        return this._item;
    }

    hasItem() {
        return this._item !== null;
    }

    destroy() {
        this._item = null;
        this._instance = {};
    }
}


export class ItemRemoveController {
    _itemsToRemove = [];

    useInit() {
        this._itemsToRemove = [];
    }

    removeItem(item) {
        this._itemsToRemove.push(item);
    }

    getItemsToRemove() {
        return this._itemsToRemove;
    }

    destroy() {
        this._itemsToRemove = [];
    }
}

export class LayoutController {
    constructor() {
        this._itemsToRefresh = [];
        this._itemsToShow = [];
        this._itemsToHide = [];
        this._isRendering = false;
    }
    useInit() {
        this._itemsToRefresh = [];
        this._itemsToShow = [];
        this._itemsToHide = [];
        this._isRendering = true;
        useEffect(() => {
            this._isRendering = false;
        });
    }

    refreshItem(item) {
        if (this._isRendering) {
            this._itemsToRefresh.push(item);
        } else {
            const grid = item.getGrid();
            grid.refreshItems([item]);
            grid.layout();
        }
    }

    setItemVisibility(
        item,
        visible,
        instant
    ) {
        if (this._isRendering) {
            if (visible) this._itemsToShow.push(item);
            else this._itemsToHide.push(item);
        } else {
            const grid = item.getGrid();
            if (visible) grid.show([item], { instant });
            else grid.hide([item], { instant });
        }
    }

    getItemsToRefresh() {
        return this._itemsToRefresh;
    }

    getItemsToShow() {
        return this._itemsToShow;
    }

    getItemsToHide() {
        return this._itemsToHide;
    }

    destroy() {
        this._itemsToRefresh = [];
        this._itemsToShow = [];
        this._itemsToHide = [];
    }
}



export function useData(
    initialData,
    options
) {
    const { itemRefController } = useItemContext();
    invariant(
        itemRefController !== undefined,
        'The useData hook can be used only inside an Item'
    );
    const setData = useFunction((data, options) => {
        invariant(
            typeof data === 'object',
            `The data must be an object, founded: ${typeof data}`
        );
        options = options || useData.defaultOptions;
        if (options.merge) {
            const currentData = itemRefController.get('data') || {};
            itemRefController.set('data', Object.assign(currentData, data));
        } else {
            itemRefController.set('data', data);
        }
    });
    if (typeof initialData === 'object') {
        setData(initialData, options);
    }
    return setData;
}

useData.defaultOptions = { merge: false };

export function useDrag() {
    const { eventController } = useItemContext();
    const reRender = useRerender();
    invariant(
        eventController !== undefined,
        'The useDrag hook can be used only inside an Item'
    );
    useEffect(() => {
        eventController.enableEvent('drag', reRender);
    }, [eventController, reRender]);

    return eventController.getPayload('drag') || false;
}



export function useDraggable() {
    const { itemRefController } = useItemContext();
    invariant(
        itemRefController !== undefined,
        'The useData hook can be used only inside an Item'
    );

    const setDraggable = useFunction((draggable) => {
        itemRefController.set('draggable', !!draggable);
    });

    return setDraggable;
}
export function useGrid() {
    const { eventController } = useItemContext();
    const gridContext = useGridContext();
    const reRender = useRerender();
    invariant(
        eventController !== undefined && gridContext.grid !== undefined,
        'The useData hook can be used only inside an Item'
    );
    const grid = eventController.getPayload('send') || gridContext.grid;
    useEffect(() => {
        eventController.enableEvent('send', reRender);
    }, [eventController, reRender]);

    return {
        id: grid._component.id,
        groupIds: grid._component.groupIds,
        grid,
    };
}


export function useRefresh(deps = []) {
    const { layoutController } = useGridContext();
    const { itemRefController } = useItemContext();

    invariant(
        itemRefController !== undefined && layoutController !== undefined,
        'The useRefresh hook can be used only inside an Item'
    );
    const refresh = useCallback(() => {
        if (!itemRefController.hasItem()) return;
        const item = itemRefController.getItem();
        layoutController.refreshItem(item);
    }, [layoutController, itemRefController]);

    useEffect(() => {
        refresh();
    }, deps.concat(refresh)); // eslint-disable-line

    return refresh;
}

export function useShow() {
    const { eventController } = useItemContext();
    const reRender = useRerender();

    invariant(
        eventController !== undefined,
        'The useShow hook can be used only inside an Item'
    );

    useEffect(() => {
        eventController.enableEvent('show', reRender);
    }, [eventController, reRender]);

    return eventController.getPayload('show');
}

export function useVisibility() {
    const { layoutController } = useGridContext();
    const { eventController, itemRefController } = useItemContext();
    invariant(
        itemRefController !== undefined &&
        layoutController !== undefined &&
        eventController !== undefined,
        'The useData hook can be used only inside an Item'
    );

    const setVisibility = useFunction((visible, options) => {
        if (!itemRefController.hasItem()) return;
        if (!!visible === eventController.getPayload('show')) return;
        options = options || useVisibility.defaultOptions;
        layoutController.setItemVisibility(
            itemRefController.getItem(),
            visible,
            options.instant === true
        );
    });

    return setVisibility;
}

useVisibility.defaultOptions = { instant: false };

export function getResponsiveStyle(options) {
    invariant(typeof options === 'object', 'You must define options');
    invariant(
        typeof options.columns === 'number' &&
        options.columns > 0 &&
        options.columns <= 1,
        'options.columns must be a number between 0 (excluded) and 1 (included)'
    );
    invariant(
        typeof options.ratio === 'number' ||
        typeof options.height === 'number' ||
        typeof options.height === 'string',
        'You must provide at least one option between height and ratio'
    );

    invariant(
        typeof options.ratio !== 'number' ||
        (typeof options.height !== 'number' &&
            typeof options.height !== 'string'),
        'You cannot provide both the height and the ratio options'
    );

    const { margin, mStatic, mDynamic } = getResponsiveMargin(
        options.margin || '0px'
    );
    const { needCalc, width } = getResponsiveWidth(
        options.columns,
        mStatic,
        mDynamic
    );

    return options.ratio
        ? {
            width: needCalc ? `calc(${width})` : width,
            paddingTop: getResponsivePaddingTop(width, options.ratio, needCalc),
            height: `0px`,
            borderWidth: '0px',
            margin,
        }
        : {
            width: needCalc ? `calc(${width})` : width,
            paddingTop: `0px`,
            height: getFixedHeight(options.height),
            borderWidth: '0px',
            margin,
        };
}


function getResponsiveWidth(
    columns,
    mStatic,
    mDynamic
) {
    const needCalc = mStatic !== 0;
    const rawWidth = columns * 100 - mDynamic;
    const width = needCalc ? `${rawWidth}% - ${mStatic}px` : `${rawWidth}%`;

    return { needCalc, width };
}


function getResponsivePaddingTop(
    width,
    ratio,
    needCalc
) {
    return needCalc
        ? `calc((${width}) / ${ratio})`
        : `${parseFloat(width) / ratio}%`;
}


function getFixedHeight(height) {
    return typeof height === 'number' ? `${height}px` : height;
}


function getResponsiveMargin(margin) {
    if (typeof margin === 'number') margin = `${margin}px`;
    const margins = margin.trim().split(' ');
    let leftMargin = '0px';
    let rightMargin = '0px';
    let mDynamic = 0;
    let mStatic = 0;
    if (margins.length === 1) {
        leftMargin = rightMargin = margins[0];
    } else if (margins.length === 2) {
        leftMargin = rightMargin = margins[1];
    } else if (margins.length === 3) {
        leftMargin = rightMargin = margins[1];
    } else if (margins.length === 4) {
        leftMargin = margins[3];
        rightMargin = margins[1];
    }
    if (leftMargin.indexOf('%') === -1) mStatic += parseFloat(leftMargin);
    else mDynamic += parseFloat(leftMargin);
    if (rightMargin.indexOf('%') === -1) mStatic += parseFloat(rightMargin);
    else mDynamic += parseFloat(rightMargin);

    return {
        margin,
        mStatic,
        mDynamic,
    };
}


export function getStaticStyle(options) {
    const style = getResponsiveStyle(options);
    invariant(
        'grid' in options,
        'You mast pass the grid instance to get the static style.'
    );
    const sizerElement = options.grid.getSizerElement();
    Object.assign(sizerElement.style, style);
    const { width, height, paddingTop, margin } = window.getComputedStyle(
        sizerElement
    );
    return { width, height, paddingTop, margin };
}





export function getHandler(key) {
    return function handler(payload) {
        return { [key]: payload };
    };
}

function getMerged(hooksHandlers) {
    return Object.assign(
        {},
        ...hooksHandlers.map(([hookName, handler]) => {
            const payload = [hookName]();
            return handler(payload);
        })
    );
}

export function withHooks(
    Component,
    enabledHooks
) {
    invariant(
        Array.isArray(enabledHooks),
        'An array of hooks name must be provided to wrap an item.'
    );
    enabledHooks.forEach((hookName) => {
        invariant(hooksNames.includes(hookName), `Invalid item hook: ${hookName}`);
    });
    invariant(
        enabledHooks.length !== 0,
        'To wrap an item at least one hook must be provided.'
    );
    const hooksHandlers = HooksHandlers.filter(([hookName]) =>
        enabledHooks.includes(hookName)
    );
    return function WrappedItem(props) {
        return <Component {...(props)} {...getMerged(hooksHandlers)} />;
    };
}