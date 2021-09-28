import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'
import isEqual from 'lodash.isequal';
import memoize from 'memoize-one'
import createReactContext from 'create-react-context'
import classNames from 'classnames';
import interact from 'interactjs'
import { autoBind } from '@anterostecnologia/anteros-react-core';


const overridableStyles = {
    fontSize: 12,
    color: 'white',
    cursor: 'pointer',
    background: '#2196f3',
    border: '1px solid #f7f7f7',
    zIndex: 80
}
const selectedStyle = {
    background: '#ffc107',
    border: '1px solid #ff9800',
    zIndex: 82
}
const selectedAndCanMove = {
    cursor: 'move'
}
const selectedAndCanResizeLeft = {
    borderLeftWidth: 3
}
const selectedAndCanResizeLeftAndDragLeft = {
    cursor: 'w-resize'
}
const selectedAndCanResizeRight = {
    borderRightWidth: 3
}
const selectedAndCanResizeRightAndDragRight = {
    cursor: 'e-resize'
}

const leftResizeStyle = {
    position: "absolute",
    width: 24,
    maxWidth: "20%",
    minWidth: 2,
    height: "100%",
    top: 0,
    left: 0,
    cursor: "pointer",
    zIndex: 88,
}

const rightResizeStyle = {
    position: "absolute",
    width: 24,
    maxWidth: "20%",
    minWidth: 2,
    height: "100%",
    top: 0,
    right: 0,
    cursor: "pointer",
    zIndex: 88,
}

const LEFT_VARIANT = 'left'
const RIGHT_VARIANT = 'right'


const defaultKeys = {
    groupIdKey: 'id',
    groupTitleKey: 'title',
    groupRightTitleKey: 'rightTitle',
    groupLabelKey: 'title',
    itemIdKey: 'id',
    itemTitleKey: 'title',
    itemDivTitleKey: 'title',
    itemGroupKey: 'group',
    itemTimeStartKey: 'start_time',
    itemTimeEndKey: 'end_time'
}

const defaultTimeSteps = {
    second: 1,
    minute: 1,
    hour: 1,
    day: 1,
    month: 1,
    year: 1
}

const defaultHeaderFormats = {
    year: {
        long: 'YYYY',
        mediumLong: 'YYYY',
        medium: 'YYYY',
        short: 'YY'
    },
    month: {
        long: 'MMMM YYYY',
        mediumLong: 'MMMM',
        medium: 'MMMM',
        short: 'MM/YY'
    },
    week: {
        long: 'w',
        mediumLong: 'w',
        medium: 'w',
        short: 'w'
    },
    day: {
        long: 'dddd, LL',
        mediumLong: 'dddd, LL',
        medium: 'dd D',
        short: 'D'
    },
    hour: {
        long: 'dddd, LL, HH:00',
        mediumLong: 'L, HH:00',
        medium: 'HH:00',
        short: 'HH'
    },
    minute: {
        long: 'HH:mm',
        mediumLong: 'HH:mm',
        medium: 'HH:mm',
        short: 'mm',
    }
}


const defaultHeaderLabelFormats = {
    yearShort: 'YY',
    yearLong: 'YYYY',
    monthShort: 'MM/YY',
    monthMedium: 'MM/YYYY',
    monthMediumLong: 'MMM YYYY',
    monthLong: 'MMMM YYYY',
    dayShort: 'L',
    dayLong: 'dddd, LL',
    hourShort: 'HH',
    hourMedium: 'HH:00',
    hourMediumLong: 'L, HH:00',
    hourLong: 'dddd, LL, HH:00',
    time: 'LLL'
}


const defaultSubHeaderLabelFormats = {
    yearShort: 'YY',
    yearLong: 'YYYY',
    monthShort: 'MM',
    monthMedium: 'MMM',
    monthLong: 'MMMM',
    dayShort: 'D',
    dayMedium: 'dd D',
    dayMediumLong: 'ddd, Do',
    dayLong: 'dddd, Do',
    hourShort: 'HH',
    hourLong: 'HH:00',
    minuteShort: 'mm',
    minuteLong: 'HH:mm'
}

const TimelineMarkerType = {
    Today: 'Today',
    Custom: 'Custom',
    Cursor: 'Cursor'
}

let intervalStyle = {}

function _get(object, key) {
    return typeof object.get === 'function' ? object.get(key) : object[key]
}

function _length(object) {
    return typeof object.count === 'function' ? object.count() : object.length
}

function arraysEqual(array1, array2) {
    return (
        _length(array1) === _length(array2) &&
        array1.every((element, index) => {
            return element === _get(array2, index)
        })
    )
}

function deepObjectCompare(obj1, obj2) {
    return isEqual(obj1, obj2)
}

function keyBy(value, key) {
    let obj = {}

    value.forEach(function (element) {
        obj[element[key]] = element
    })

    return obj
}

function addListener(component) {
    component._resizeEventListener = {
        handleEvent: () => {
            component.resize()
        }
    }

    window.addEventListener('resize', component._resizeEventListener)
}

function removeListener(component) {
    window.removeEventListener('resize', component._resizeEventListener)
}

function noop() { }

function composeEvents(...fns) {
    return (event, ...args) => {
        event.preventDefault()
        fns.forEach(fn => fn && fn(event, ...args))
    }
}

function getParentPosition(element) {
    var xPosition = 0
    var yPosition = 0
    var first = true

    while (element) {
        if (
            !element.offsetParent &&
            element.tagName === 'BODY' &&
            element.scrollLeft === 0 &&
            element.scrollTop === 0
        ) {
            element = document.scrollingElement || element
        }
        xPosition +=
            element.offsetLeft - (first ? 0 : element.scrollLeft) + element.clientLeft
        yPosition +=
            element.offsetTop - (first ? 0 : element.scrollTop) + element.clientTop
        element = element.offsetParent
        first = false
    }
    return { x: xPosition, y: yPosition }
}

function getSumScroll(node) {
    if (node === document.body) {
        return { scrollLeft: 0, scrollTop: 0 }
    } else {
        const parent = getSumScroll(node.parentNode)
        return ({
            scrollLeft: node.scrollLeft + parent.scrollLeft,
            scrollTop: node.scrollTop + parent.scrollTop
        })
    }
}

function getSumOffset(node) {
    if (node === document.body) {
        return { offsetLeft: 0, offsetTop: 0 }
    } else {
        const parent = getSumOffset(node.offsetParent)
        return ({
            offsetLeft: node.offsetLeft + parent.offsetLeft,
            offsetTop: node.offsetTop + parent.offsetTop
        })
    }
}

/**
 * Calculate the ms / pixel ratio of the timeline state
 * @param {number} canvasTimeStart
 * @param {number} canvasTimeEnd
 * @param {number} canvasWidth
 * @returns {number}
 */
function coordinateToTimeRatio(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth
) {
    return (canvasTimeEnd - canvasTimeStart) / canvasWidth
}

/**
 * For a given time, calculate the pixel position given timeline state
 * (timeline width in px, canvas time range)
 * @param {number} canvasTimeStart
 * @param {number} canvasTimeEnd
 * @param {number} canvasWidth
 * @param {number} time
 * @returns {number}
 */
function calculateXPositionForTime(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    time
) {
    const widthToZoomRatio = canvasWidth / (canvasTimeEnd - canvasTimeStart)
    const timeOffset = time - canvasTimeStart

    return timeOffset * widthToZoomRatio
}

/**
 * For a given x position (leftOffset) in pixels, calculate time based on
 * timeline state (timeline width in px, canvas time range)
 * @param {number} canvasTimeStart
 * @param {number} canvasTimeEnd
 * @param {number} canvasWidth
 * @param {number} leftOffset
 * @returns {number}
 */
function calculateTimeForXPosition(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    leftOffset
) {
    const timeToPxRatio = (canvasTimeEnd - canvasTimeStart) / canvasWidth

    const timeFromCanvasTimeStart = timeToPxRatio * leftOffset

    return timeFromCanvasTimeStart + canvasTimeStart
}

function iterateTimes(start, end, unit, timeSteps, callback) {
    let time = moment(start).startOf(unit)

    //if(timeSteps !== undefined){
    //timeSteps = defaultTimeSteps
    if (timeSteps[unit] && timeSteps[unit] > 1) {
        let value = time.get(unit)
        time.set(unit, value - value % timeSteps[unit])
    }
    //}

    while (time.valueOf() < end) {

        let nextTime = moment(time).add(timeSteps[unit] || 1, `${unit}s`)
        callback(time, nextTime)
        time = nextTime
    }
}

/** determine the current rendered time unit based on timeline time span
 *
 * zoom: (in milliseconds) difference between time start and time end of timeline canvas
 * width: (in pixels) pixel width of timeline canvas
 * timeSteps: map of timeDividers with number to indicate step of each divider
 */
const minCellWidth = 17
function getMinUnit(zoom, width, timeSteps) {
    let timeDividers = {
        second: 1000,
        minute: 60,
        hour: 60,
        day: 24,
        month: 30,
        year: 12
    }

    let minUnit = 'year'
    let nextTimeSpanInUnitContext = zoom;
    Object.keys(timeDividers).some(unit => {
        nextTimeSpanInUnitContext = nextTimeSpanInUnitContext / timeDividers[unit]
        const cellsToBeRenderedForCurrentUnit =
            nextTimeSpanInUnitContext / timeSteps[unit]
        const cellWidthToUse =
            timeSteps[unit] && timeSteps[unit] > 1 ? 3 * minCellWidth : minCellWidth
        const minimumCellsToRenderUnit = width / cellWidthToUse
        if (cellsToBeRenderedForCurrentUnit < minimumCellsToRenderUnit) {
            minUnit = unit
            return true
        }
    })

    return minUnit
}

export function getNextUnit(unit) {
    let nextUnits = {
        second: 'minute',
        minute: 'hour',
        hour: 'day',
        day: 'month',
        month: 'year',
        year: 'year'
    }
    if (!nextUnits[unit]) {
        throw new Error(`unit ${unit} in not acceptable`)
    }
    return nextUnits[unit]
}

/**
 * get the new start and new end time of item that is being
 * dragged or resized
 * @param {*} itemTimeStart original item time in milliseconds
 * @param {*} itemTimeEnd original item time in milliseconds
 * @param {*} dragTime new start time if item is dragged in milliseconds
 * @param {*} isDragging is item being dragged
 * @param {*} isResizing is item being resized
 * @param {`right` or `left`} resizingEdge resize edge
 * @param {*} resizeTime new resize time in milliseconds
 */
function calculateInteractionNewTimes({
    itemTimeStart,
    itemTimeEnd,
    dragTime,
    isDragging,
    isResizing,
    resizingEdge,
    resizeTime
}) {
    const originalItemRange = itemTimeEnd - itemTimeStart
    const itemStart =
        isResizing && resizingEdge === 'left' ? resizeTime : itemTimeStart
    const itemEnd =
        isResizing && resizingEdge === 'right' ? resizeTime : itemTimeEnd
    return [
        isDragging ? dragTime : itemStart,
        isDragging ? dragTime + originalItemRange : itemEnd
    ]
}

function calculateDimensions({
    itemTimeStart,
    itemTimeEnd,
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth
}) {
    const itemTimeRange = itemTimeEnd - itemTimeStart

    // restrict startTime and endTime to be bounded by canvasTimeStart and canvasTimeEnd
    const effectiveStartTime = Math.max(itemTimeStart, canvasTimeStart)
    const effectiveEndTime = Math.min(itemTimeEnd, canvasTimeEnd)

    const left = calculateXPositionForTime(
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth,
        effectiveStartTime
    )
    const right = calculateXPositionForTime(
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth,
        effectiveEndTime
    )
    const itemWidth = right - left

    const dimensions = {
        left: left,
        width: Math.max(itemWidth, 3),
        collisionLeft: itemTimeStart,
        collisionWidth: itemTimeRange
    }

    return dimensions
}

/**
 * Get the order of groups based on their keys
 * @param {*} groups array of groups
 * @param {*} keys the keys object
 * @returns Ordered hash of objects with their array index and group
 */
function getGroupOrders(groups, keys) {
    const { groupIdKey } = keys;
    let groupOrders = {};
    for (let i = 0; i < groups.length; i++) {
        groupOrders[_get(groups[i], groupIdKey)] = { index: i, group: groups[i] }
    }
    return groupOrders
}

/**
 * Adds items relevant to each group to the result of getGroupOrders
 * @param {*} items list of all items
 * @param {*} groupOrders the result of getGroupOrders
 */
function getGroupedItems(items, groupOrders) {
    var groupedItems = {}
    var keys = Object.keys(groupOrders)
    for (let i = 0; i < keys.length; i++) {
        const groupOrder = groupOrders[keys[i]]
        groupedItems[i] = {
            index: groupOrder.index,
            group: groupOrder.group,
            items: []
        }
    }
    for (let i = 0; i < items.length; i++) {
        if (items[i].dimensions.order !== undefined) {
            const groupItem = groupedItems[items[i].dimensions.order.index]
            if (groupItem) {
                groupItem.items.push(items[i])
            }
        }
    }

    return groupedItems
}

function getVisibleItems(items, canvasTimeStart, canvasTimeEnd, keys) {
    const { itemTimeStartKey, itemTimeEndKey } = keys

    return items.filter(item => {
        return (
            _get(item, itemTimeStartKey) <= canvasTimeEnd &&
            _get(item, itemTimeEndKey) >= canvasTimeStart
        )
    })
}

const EPSILON = 0.001

function collision(a, b, lineHeight, collisionPadding = EPSILON) {
    var verticalMargin = 0

    return (
        a.collisionLeft + collisionPadding < b.collisionLeft + b.collisionWidth &&
        a.collisionLeft + a.collisionWidth - collisionPadding > b.collisionLeft &&
        a.top - verticalMargin + collisionPadding < b.top + b.height &&
        a.top + a.height + verticalMargin - collisionPadding > b.top
    )
}

/**
 * Calculate the position of a given item for a group that
 * is being stacked
 */
function groupStack(
    lineHeight,
    item,
    group,
    groupHeight,
    groupTop,
    itemIndex
) {
    let curHeight = groupHeight
    let verticalMargin = (lineHeight - item.dimensions.height) / 2
    if (item.dimensions.stack && item.dimensions.top === null) {
        item.dimensions.top = groupTop + verticalMargin
        curHeight = Math.max(curHeight, lineHeight)
        do {
            var collidingItem = null
            for (var j = itemIndex - 1, jj = 0; j >= jj; j--) {
                var other = group[j]
                if (
                    other.dimensions.top !== null &&
                    other.dimensions.stack &&
                    collision(item.dimensions, other.dimensions, lineHeight)
                ) {
                    collidingItem = other
                    break
                } else {
                }
            }

            if (collidingItem != null) {
                item.dimensions.top = collidingItem.dimensions.top + lineHeight
                curHeight = Math.max(
                    curHeight,
                    item.dimensions.top + item.dimensions.height + verticalMargin - groupTop
                )
            }
        } while (collidingItem)
    }
    return {
        groupHeight: curHeight,
        verticalMargin,
        itemTop: item.dimensions.top
    }

}

// Calculate the position of this item for a group that is not being stacked
function groupNoStack(lineHeight, item, groupHeight, groupTop) {
    let verticalMargin = (lineHeight - item.dimensions.height) / 2
    if (item.dimensions.top === null) {
        item.dimensions.top = groupTop + verticalMargin
        groupHeight = Math.max(groupHeight, lineHeight)
    }
    return { groupHeight, verticalMargin: 0, itemTop: item.dimensions.top }
}

function sum(arr = []) {
    return arr.reduce((acc, i) => acc + i, 0)
}

/**
 * Stack all groups
 * @param {*} items items to be stacked
 * @param {*} groupOrders the groupOrders object
 * @param {*} lineHeight
 * @param {*} stackItems should items be stacked?
 */
function stackAll(itemsDimensions, groupOrders, lineHeight, stackItems) {
    var groupHeights = [];
    var groupTops = [];
    var groupedItems = getGroupedItems(itemsDimensions, groupOrders);
    for (var index in groupedItems) {
        const groupItems = groupedItems[index]
        const { items: itemsDimensions, group } = groupItems
        const groupTop = sum(groupHeights)
        const isGroupStacked =
            group.stackItems !== undefined ? group.stackItems : stackItems
        const { groupHeight } = stackGroup(
            itemsDimensions,
            isGroupStacked,
            lineHeight,
            groupTop
        )
        groupTops.push(groupTop)
        if (group.height) {
            groupHeights.push(group.height)
        } else {
            groupHeights.push(Math.max(groupHeight, lineHeight))
        }
    }

    return {
        height: sum(groupHeights),
        groupHeights,
        groupTops
    }
}

/**
 * 
 * @param {*} itemsDimensions 
 * @param {*} isGroupStacked 
 * @param {*} lineHeight 
 * @param {*} groupTop 
 */
function stackGroup(itemsDimensions, isGroupStacked, lineHeight, groupTop) {
    var groupHeight = 0
    var verticalMargin = 0
    // Find positions for each item in group
    for (let itemIndex = 0; itemIndex < itemsDimensions.length; itemIndex++) {
        let r = {}
        if (isGroupStacked) {
            r = groupStack(
                lineHeight,
                itemsDimensions[itemIndex],
                itemsDimensions,
                groupHeight,
                groupTop,
                itemIndex
            )
        } else {
            r = groupNoStack(lineHeight, itemsDimensions[itemIndex], groupHeight, groupTop)
        }
        groupHeight = r.groupHeight
        verticalMargin = r.verticalMargin
    }
    return { groupHeight, verticalMargin }
}

/**
 * Stack the items that will be visible
 * within the canvas area
 * @param {item[]} items
 * @param {group[]} groups
 * @param {number} canvasWidth
 * @param {number} canvasTimeStart
 * @param {number} canvasTimeEnd
 * @param {*} keys
 * @param {number} lineHeight
 * @param {number} itemHeightRatio
 * @param {boolean} stackItems
 * @param {*} draggingItem
 * @param {*} resizingItem
 * @param {number} dragTime
 * @param {left or right} resizingEdge
 * @param {number} resizeTime
 * @param {number} newGroupOrder
 */
function stackTimelineItems(
    items,
    groups,
    canvasWidth,
    canvasTimeStart,
    canvasTimeEnd,
    keys,
    lineHeight,
    itemHeightRatio,
    stackItems,
    draggingItem,
    resizingItem,
    dragTime,
    resizingEdge,
    resizeTime,
    newGroupOrder
) {
    const visibleItems = getVisibleItems(
        items,
        canvasTimeStart,
        canvasTimeEnd,
        keys
    )
    const visibleItemsWithInteraction = visibleItems.map(item =>
        getItemWithInteractions({
            item,
            keys,
            draggingItem,
            resizingItem,
            dragTime,
            resizingEdge,
            resizeTime,
            groups,
            newGroupOrder
        })
    )
    if (groups.length === 0) {
        return {
            dimensionItems: [],
            height: 0,
            groupHeights: [],
            groupTops: []
        }
    }

    const groupOrders = getGroupOrders(groups, keys)
    let dimensionItems = visibleItemsWithInteraction
        .map(item =>
            getItemDimensions({
                item,
                keys,
                canvasTimeStart,
                canvasTimeEnd,
                canvasWidth,
                groupOrders,
                lineHeight,
                itemHeightRatio
            })
        )
        .filter(item => !!item)
    const { height, groupHeights, groupTops } = stackAll(
        dimensionItems,
        groupOrders,
        lineHeight,
        stackItems
    )
    return { dimensionItems, height, groupHeights, groupTops }
}

/**
 * get canvas width from visible width
 * @param {*} width
 * @param {*} buffer
 */
function getCanvasWidth(width, buffer = 3) {
    return width * buffer
}

/**
 * get item's position, dimensions and collisions
 * @param {*} item
 * @param {*} keys
 * @param {*} canvasTimeStart
 * @param {*} canvasTimeEnd
 * @param {*} canvasWidth
 * @param {*} groupOrders
 * @param {*} lineHeight
 * @param {*} itemHeightRatio
 */
function getItemDimensions({
    item,
    keys,
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    groupOrders,
    lineHeight,
    itemHeightRatio
}) {
    const itemId = _get(item, keys.itemIdKey)
    let dimension = calculateDimensions({
        itemTimeStart: _get(item, keys.itemTimeStartKey),
        itemTimeEnd: _get(item, keys.itemTimeEndKey),
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth
    })
    if (dimension) {
        dimension.top = null
        dimension.order = groupOrders[_get(item, keys.itemGroupKey)]
        dimension.stack = !item.isOverlay
        dimension.height = lineHeight * itemHeightRatio
        return {
            id: itemId,
            dimensions: dimension
        }
    }
}

/**
 * get new item with changed  `itemTimeStart` , `itemTimeEnd` and `itemGroupKey` according to user interaction
 * user interaction is dragging an item and resize left and right
 * @param {*} item
 * @param {*} keys
 * @param {*} draggingItem
 * @param {*} resizingItem
 * @param {*} dragTime
 * @param {*} resizingEdge
 * @param {*} resizeTime
 * @param {*} groups
 * @param {*} newGroupOrder
 */
function getItemWithInteractions({
    item,
    keys,
    draggingItem,
    resizingItem,
    dragTime,
    resizingEdge,
    resizeTime,
    groups,
    newGroupOrder
}) {
    if (!resizingItem && !draggingItem) return item
    const itemId = _get(item, keys.itemIdKey)
    const isDragging = itemId === draggingItem
    const isResizing = itemId === resizingItem
    const [itemTimeStart, itemTimeEnd] = calculateInteractionNewTimes({
        itemTimeStart: _get(item, keys.itemTimeStartKey),
        itemTimeEnd: _get(item, keys.itemTimeEndKey),
        isDragging,
        isResizing,
        dragTime,
        resizingEdge,
        resizeTime
    })
    const newItem = {
        ...item,
        [keys.itemTimeStartKey]: itemTimeStart,
        [keys.itemTimeEndKey]: itemTimeEnd,
        [keys.itemGroupKey]: isDragging
            ? _get(groups[newGroupOrder], keys.groupIdKey)
            : _get(item, keys.itemGroupKey)
    }
    return newItem
}

/**
 * get canvas start and end time from visible start and end time
 * @param {number} visibleTimeStart
 * @param {number} visibleTimeEnd
 */
function getCanvasBoundariesFromVisibleTime(
    visibleTimeStart,
    visibleTimeEnd
) {
    const zoom = visibleTimeEnd - visibleTimeStart
    const canvasTimeStart = visibleTimeStart - (visibleTimeEnd - visibleTimeStart)
    const canvasTimeEnd = canvasTimeStart + zoom * 3
    return [canvasTimeStart, canvasTimeEnd]
}

/**
 * Get the the canvas area for a given visible time
 * Will shift the start/end of the canvas if the visible time
 * does not fit within the existing
 * @param {number} visibleTimeStart
 * @param {number} visibleTimeEnd
 * @param {boolean} forceUpdateDimensions
 * @param {*} items
 * @param {*} groups
 * @param {*} props
 * @param {*} state
 */
function calculateScrollCanvas(
    visibleTimeStart,
    visibleTimeEnd,
    forceUpdateDimensions,
    items,
    groups,
    props,
    state
) {
    const oldCanvasTimeStart = state.canvasTimeStart
    const oldZoom = state.visibleTimeEnd - state.visibleTimeStart
    const newZoom = visibleTimeEnd - visibleTimeStart
    const newState = { visibleTimeStart, visibleTimeEnd }
    const canKeepCanvas =
        newZoom === oldZoom &&
        visibleTimeStart >= oldCanvasTimeStart + oldZoom * 0.5 &&
        visibleTimeStart <= oldCanvasTimeStart + oldZoom * 1.5 &&
        visibleTimeEnd >= oldCanvasTimeStart + oldZoom * 1.5 &&
        visibleTimeEnd <= oldCanvasTimeStart + oldZoom * 2.5

    if (!canKeepCanvas || forceUpdateDimensions) {
        const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
            visibleTimeStart,
            visibleTimeEnd
        )
        newState.canvasTimeStart = canvasTimeStart
        newState.canvasTimeEnd = canvasTimeEnd
        const mergedState = {
            ...state,
            ...newState
        }

        const canvasWidth = getCanvasWidth(mergedState.width)

        // The canvas cannot be kept, so calculate the new items position
        Object.assign(
            newState,
            stackTimelineItems(
                items,
                groups,
                canvasWidth,
                mergedState.canvasTimeStart,
                mergedState.canvasTimeEnd,
                props.keys,
                props.lineHeight,
                props.itemHeightRatio,
                props.stackItems,
                mergedState.draggingItem,
                mergedState.resizingItem,
                mergedState.dragTime,
                mergedState.resizingEdge,
                mergedState.resizeTime,
                mergedState.newGroupOrder
            )
        )
    }
    return newState
}

export class AnterosCalendarTimeLine extends Component {
    constructor(props) {
        super(props)

        this.getSelected = this.getSelected.bind(this)
        this.hasSelectedItem = this.hasSelectedItem.bind(this)
        this.isItemSelected = this.isItemSelected.bind(this)

        intervalStyle = this.props.intervalStyle

        let visibleTimeStart = null
        let visibleTimeEnd = null

        if (this.props.defaultTimeStart && this.props.defaultTimeEnd) {
            visibleTimeStart = this.props.defaultTimeStart.valueOf()
            visibleTimeEnd = this.props.defaultTimeEnd.valueOf()
        } else if (this.props.visibleTimeStart && this.props.visibleTimeEnd) {
            visibleTimeStart = this.props.visibleTimeStart
            visibleTimeEnd = this.props.visibleTimeEnd
        } else {
            throw new Error(
                'Você deve fornecer "defaultTimeStart" e "defaultTimeEnd" ou "visibleTimeStart" e "visibleTimeEnd" para inicializar a Linha do tempo '
            )
        }

        const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
            visibleTimeStart,
            visibleTimeEnd
        )

        this.state = {
            width: 1000,
            visibleTimeStart: visibleTimeStart,
            visibleTimeEnd: visibleTimeEnd,
            canvasTimeStart: canvasTimeStart,
            canvasTimeEnd: canvasTimeEnd,
            selectedItem: null,
            dragTime: null,
            dragGroupTitle: null,
            resizeTime: null,
            resizingItem: null,
            resizingEdge: null
        }

        const canvasWidth = getCanvasWidth(this.state.width)

        const {
            dimensionItems,
            height,
            groupHeights,
            groupTops
        } = stackTimelineItems(
            props.items,
            props.groups,
            canvasWidth,
            this.state.canvasTimeStart,
            this.state.canvasTimeEnd,
            props.keys,
            props.lineHeight,
            props.itemHeightRatio,
            props.stackItems,
            this.state.draggingItem,
            this.state.resizingItem,
            this.state.dragTime,
            this.state.resizingEdge,
            this.state.resizeTime,
            this.state.newGroupOrder
        )

        this.state.dimensionItems = dimensionItems
        this.state.height = height
        this.state.groupHeights = groupHeights
        this.state.groupTops = groupTops

        autoBind(this);
    }


    getChildContext() {
        return {
            getTimelineContext: () => {
                return this.getTimelineContext()
            }
        }
    }

    getTimelineContext() {
        const {
            width,
            visibleTimeStart,
            visibleTimeEnd,
            canvasTimeStart,
            canvasTimeEnd
        } = this.state

        return {
            timelineWidth: width,
            visibleTimeStart,
            visibleTimeEnd,
            canvasTimeStart,
            canvasTimeEnd
        }
    }

    componentDidMount() {
        this.resize(this.props)
        if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
            this.props.resizeDetector.addListener(this)
        }
        addListener(this)
        this.lastTouchDistance = null
    }

    componentWillUnmount() {
        if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
            this.props.resizeDetector.removeListener(this)
        }
        removeListener(this)
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { visibleTimeStart, visibleTimeEnd, items, groups } = nextProps
        let derivedState = { items, groups }
        const forceUpdate = items !== prevState.items || groups !== prevState.groups
        if (visibleTimeStart && visibleTimeEnd) {
            Object.assign(
                derivedState,
                calculateScrollCanvas(
                    visibleTimeStart,
                    visibleTimeEnd,
                    forceUpdate,
                    items,
                    groups,
                    nextProps,
                    prevState
                )
            )
        } else if (forceUpdate) {
            const canvasWidth = getCanvasWidth(prevState.width)
            Object.assign(
                derivedState,
                stackTimelineItems(
                    items,
                    groups,
                    canvasWidth,
                    prevState.canvasTimeStart,
                    prevState.canvasTimeEnd,
                    nextProps.keys,
                    nextProps.lineHeight,
                    nextProps.itemHeightRatio,
                    nextProps.stackItems,
                    prevState.draggingItem,
                    prevState.resizingItem,
                    prevState.dragTime,
                    prevState.resizingEdge,
                    prevState.resizeTime,
                    prevState.newGroupOrder
                )
            )
        }

        return derivedState
    }

    componentDidUpdate(prevProps, prevState) {
        const newZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart
        const oldZoom = prevState.visibleTimeEnd - prevState.visibleTimeStart
        if (this.props.onZoom && newZoom !== oldZoom) {
            this.props.onZoom(this.getTimelineContext())
        }
        if (
            this.props.onBoundsChange &&
            this.state.canvasTimeStart !== prevState.canvasTimeStart
        ) {
            this.props.onBoundsChange(
                this.state.canvasTimeStart,
                this.state.canvasTimeStart + newZoom * 3
            )
        }
        const scrollLeft = Math.round(
            this.state.width *
            (this.state.visibleTimeStart - this.state.canvasTimeStart) /
            newZoom
        )
        const componentScrollLeft = Math.round(
            prevState.width *
            (prevState.visibleTimeStart - prevState.canvasTimeStart) /
            oldZoom
        )
        if (componentScrollLeft !== scrollLeft) {
            this.scrollComponent.scrollLeft = scrollLeft;
            this.scrollHeaderRef.scrollLeft = scrollLeft;
        }
    }

    resize(props = this.props) {
        const { width: containerWidth } = this.container.getBoundingClientRect();
        let width = containerWidth - props.sidebarWidth - props.rightSidebarWidth
        const canvasWidth = getCanvasWidth(width)
        const {
            dimensionItems,
            height,
            groupHeights,
            groupTops
        } = stackTimelineItems(
            props.items,
            props.groups,
            canvasWidth,
            this.state.canvasTimeStart,
            this.state.canvasTimeEnd,
            props.keys,
            props.lineHeight,
            props.itemHeightRatio,
            props.stackItems,
            this.state.draggingItem,
            this.state.resizingItem,
            this.state.dragTime,
            this.state.resizingEdge,
            this.state.resizeTime,
            this.state.newGroupOrder
        )
        this.setState({
            width,
            dimensionItems,
            height,
            groupHeights,
            groupTops
        })

        this.scrollComponent.scrollLeft = width
        this.scrollHeaderRef.scrollLeft = width
    }

    onScroll(scrollX) {
        const width = this.state.width;
        const canvasTimeStart = this.state.canvasTimeStart;
        const zoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;
        const visibleTimeStart = canvasTimeStart + zoom * scrollX / width;
        if (
            this.state.visibleTimeStart !== visibleTimeStart ||
            this.state.visibleTimeEnd !== visibleTimeStart + zoom
        ) {
            this.props.onTimeChange(
                visibleTimeStart,
                visibleTimeStart + zoom,
                this.updateScrollCanvas
            );
        }
    }
    updateScrollCanvas = (
        visibleTimeStart,
        visibleTimeEnd,
        forceUpdateDimensions,
        items = this.props.items,
        groups = this.props.groups
    ) => {
        this.setState(
            calculateScrollCanvas(
                visibleTimeStart,
                visibleTimeEnd,
                forceUpdateDimensions,
                items,
                groups,
                this.props,
                this.state
            )
        )
    }

    handleWheelZoom = (speed, xPosition, deltaY) => {
        this.changeZoom(1.0 + speed * deltaY / 500, xPosition / this.state.width)
    }

    changeZoom = (scale, offset = 0.5) => {
        const { minZoom, maxZoom } = this.props
        const oldZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart
        const newZoom = Math.min(
            Math.max(Math.round(oldZoom * scale), minZoom),
            maxZoom
        );
        const newVisibleTimeStart = Math.round(
            this.state.visibleTimeStart + (oldZoom - newZoom) * offset
        );

        this.props.onTimeChange(
            newVisibleTimeStart,
            newVisibleTimeStart + newZoom,
            this.updateScrollCanvas
        );
    }

    showPeriod = (from, to) => {
        let visibleTimeStart = from.valueOf();
        let visibleTimeEnd = to.valueOf();
        let zoom = visibleTimeEnd - visibleTimeStart;
        if (zoom < 360000) {
            return
        }
        this.props.onTimeChange(
            visibleTimeStart,
            visibleTimeStart + zoom,
            this.updateScrollCanvas
        );
    }

    selectItem(item, clickType, e) {
        if (
            this.isItemSelected(item) ||
            (this.props.itemTouchSendsClick && clickType === 'touch')
        ) {
            if (item && this.props.onItemClick) {
                const time = this.timeFromItemEvent(e)
                this.props.onItemClick(item, e, time)
            }
        } else {
            this.setState({ selectedItem: item })
            if (item && this.props.onItemSelect) {
                const time = this.timeFromItemEvent(e)
                this.props.onItemSelect(item, e, time)
            } else if (item === null && this.props.onItemDeselect) {
                this.props.onItemDeselect(e)
            }
        }
    }

    doubleClickItem(item, e) {
        if (this.props.onItemDoubleClick) {
            const time = this.timeFromItemEvent(e)
            this.props.onItemDoubleClick(item, e, time)
        }
    }

    contextMenuClickItem(item, e) {
        if (this.props.onItemContextMenu) {
            const time = this.timeFromItemEvent(e)
            this.props.onItemContextMenu(item, e, time)
        }
    }

    getTimeFromRowClickEvent(e) {
        const { dragSnap } = this.props
        const { width, canvasTimeStart, canvasTimeEnd } = this.state
        const { offsetX } = e.nativeEvent
        let time = calculateTimeForXPosition(
            canvasTimeStart,
            canvasTimeEnd,
            getCanvasWidth(width),
            offsetX
        )
        time = Math.floor(time / dragSnap) * dragSnap;
        return time;
    }

    timeFromItemEvent(e) {
        const { width, visibleTimeStart, visibleTimeEnd } = this.state
        const { dragSnap } = this.props;
        const scrollComponent = this.scrollComponent;
        const { left: scrollX } = scrollComponent.getBoundingClientRect();
        const xRelativeToTimeline = e.clientX - scrollX;
        const relativeItemPosition = xRelativeToTimeline / width;
        const zoom = visibleTimeEnd - visibleTimeStart;
        const timeOffset = relativeItemPosition * zoom;
        let time = Math.round(visibleTimeStart + timeOffset);
        time = Math.floor(time / dragSnap) * dragSnap;
        return time;
    }

    dragItem(item, dragTime, newGroupOrder) {
        let newGroup = this.props.groups[newGroupOrder];
        const keys = this.props.keys;
        this.setState({
            draggingItem: item,
            dragTime: dragTime,
            newGroupOrder: newGroupOrder,
            dragGroupTitle: newGroup ? _get(newGroup, keys.groupLabelKey) : ''
        });
        this.updatingItem({
            eventType: 'move',
            itemId: item,
            time: dragTime,
            newGroupOrder
        });
    }

    dropItem(item, dragTime, newGroupOrder) {
        this.setState({ draggingItem: null, dragTime: null, dragGroupTitle: null })
        if (this.props.onItemMove) {
            this.props.onItemMove(item, dragTime, newGroupOrder)
        }
    }

    resizingItem(item, resizeTime, edge) {
        this.setState({
            resizingItem: item,
            resizingEdge: edge,
            resizeTime: resizeTime
        });
        this.updatingItem({
            eventType: 'resize',
            itemId: item,
            time: resizeTime,
            edge
        });
    }

    resizedItem(item, resizeTime, edge, timeDelta) {
        this.setState({ resizingItem: null, resizingEdge: null, resizeTime: null })
        if (this.props.onItemResize && timeDelta !== 0) {
            this.props.onItemResize(item, resizeTime, edge)
        }
    }

    updatingItem({ eventType, itemId, time, edge, newGroupOrder }) {
        if (this.props.onItemDrag) {
            this.props.onItemDrag({ eventType, itemId, time, edge, newGroupOrder })
        }
    }

    columns(
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth,
        minUnit,
        timeSteps,
        height
    ) {
        return (
            <ColumnsWrapper
                canvasTimeStart={canvasTimeStart}
                canvasTimeEnd={canvasTimeEnd}
                canvasWidth={canvasWidth}
                lineCount={_length(this.props.groups)}
                minUnit={minUnit}
                timeSteps={timeSteps}
                height={height}
                verticalLineClassNamesForTime={this.props.verticalLineClassNamesForTime}
            />
        )
    }

    handleRowClick(e, rowIndex) {
        if (this.hasSelectedItem()) {
            this.selectItem(null)
        }
        if (this.props.onCanvasClick == null) return
        const time = this.getTimeFromRowClickEvent(e)
        const groupId = _get(
            this.props.groups[rowIndex],
            this.props.keys.groupIdKey
        )
        this.props.onCanvasClick(groupId, time, e)
    }

    handleRowDoubleClick(e, rowIndex) {
        if (this.props.onCanvasDoubleClick == null) return;
        const time = this.getTimeFromRowClickEvent(e);
        const groupId = _get(
            this.props.groups[rowIndex],
            this.props.keys.groupIdKey
        );
        this.props.onCanvasDoubleClick(groupId, time, e);
    }

    handleScrollContextMenu(e, rowIndex) {
        if (this.props.onCanvasContextMenu == null) return;
        const timePosition = this.getTimeFromRowClickEvent(e);
        const groupId = _get(
            this.props.groups[rowIndex],
            this.props.keys.groupIdKey
        );
        if (this.props.onCanvasContextMenu) {
            e.preventDefault();
            this.props.onCanvasContextMenu(groupId, timePosition, e);
        }
    }

    rows(canvasWidth, groupHeights, groups) {
        return (
            <GroupRows
                groups={groups}
                canvasWidth={canvasWidth}
                lineCount={_length(this.props.groups)}
                groupHeights={groupHeights}
                clickTolerance={this.props.clickTolerance}
                onRowClick={this.handleRowClick}
                onRowDoubleClick={this.handleRowDoubleClick}
                horizontalLineClassNamesForGroup={
                    this.props.horizontalLineClassNamesForGroup
                }
                onRowContextClick={this.handleScrollContextMenu}
            />
        )
    }

    items(
        canvasTimeStart,
        zoom,
        canvasTimeEnd,
        canvasWidth,
        minUnit,
        dimensionItems,
        groupHeights,
        groupTops
    ) {
        return (
            <Items
                canvasTimeStart={canvasTimeStart}
                canvasTimeEnd={canvasTimeEnd}
                canvasWidth={canvasWidth}
                dimensionItems={dimensionItems}
                groupTops={groupTops}
                items={this.props.items}
                groups={this.props.groups}
                keys={this.props.keys}
                selectedItem={this.state.selectedItem}
                dragSnap={this.props.dragSnap}
                minResizeWidth={this.props.minResizeWidth}
                canChangeGroup={this.props.canChangeGroup}
                canMove={this.props.canMove}
                canResize={this.props.canResize}
                useResizeHandle={this.props.useResizeHandle}
                canSelect={this.props.canSelect}
                moveResizeValidator={this.props.moveResizeValidator}
                itemSelect={this.selectItem}
                itemDrag={this.dragItem}
                itemDrop={this.dropItem}
                onItemDoubleClick={this.doubleClickItem}
                onItemContextMenu={this.contextMenuClickItem}
                itemResizing={this.resizingItem}
                itemResized={this.resizedItem}
                itemRenderer={this.props.itemRenderer}
                selected={this.props.selected}
                scrollRef={this.scrollComponent}
            />
        )
    }

    handleHeaderRef(el) {
        this.scrollHeaderRef = el;
        this.props.headerRef(el);
    }

    sidebar(height, groupHeights) {
        const { sidebarWidth } = this.props
        return (
            sidebarWidth && (
                <Sidebar
                    groups={this.props.groups}
                    groupRenderer={this.props.groupRenderer}
                    keys={this.props.keys}
                    width={sidebarWidth}
                    groupHeights={groupHeights}
                    height={height}
                />
            )
        )
    }

    rightSidebar(height, groupHeights) {
        const { rightSidebarWidth } = this.props
        return (
            rightSidebarWidth && (
                <Sidebar
                    groups={this.props.groups}
                    keys={this.props.keys}
                    groupRenderer={this.props.groupRenderer}
                    isRightSidebar
                    width={rightSidebarWidth}
                    groupHeights={groupHeights}
                    height={height}
                />
            )
        )
    }

    isTimelineHeader(child) {
        if (child.type === undefined) return false
        return child.type.secretKey === AnterosTimelineHeaders.secretKey
    }

    childrenWithProps(
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth,
        dimensionItems,
        groupHeights,
        groupTops,
        height,
        visibleTimeStart,
        visibleTimeEnd,
        minUnit,
        timeSteps
    ) {
        if (!this.props.children) {
            return null
        }
        const childArray = Array.isArray(this.props.children)
            ? this.props.children.filter(c => c)
            : [this.props.children]

        const childProps = {
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            visibleTimeStart: visibleTimeStart,
            visibleTimeEnd: visibleTimeEnd,
            dimensionItems,
            items: this.props.items,
            groups: this.props.groups,
            keys: this.props.keys,
            groupHeights: groupHeights,
            groupTops: groupTops,
            selected: this.getSelected(),
            height: height,
            minUnit: minUnit,
            timeSteps: timeSteps
        }

        return React.Children.map(childArray, child => {
            if (!this.isTimelineHeader(child)) {
                return React.cloneElement(child, childProps)
            } else {
                return null
            }
        })
    }

    renderHeaders = () => {
        if (this.props.children) {
            let headerRenderer
            React.Children.map(this.props.children, child => {
                if (this.isTimelineHeader(child)) {
                    headerRenderer = child
                }
            })
            if (headerRenderer) {
                return headerRenderer
            }
        }

        return (
            <AnterosTimelineHeaders style={this.props.headerStyle}>
                <DateHeaderWrapper unit="primaryHeader" />
                <DateHeaderWrapper />
            </AnterosTimelineHeaders>
        )
    }

    getSelected() {
        return this.state.selectedItem && !this.props.selected
            ? [this.state.selectedItem]
            : this.props.selected || [];
    }

    hasSelectedItem() {
        if (!Array.isArray(this.props.selected)) return !!this.state.selectedItem
        return this.props.selected.length > 0
    }

    isItemSelected(itemId) {
        const selectedItems = this.getSelected()
        return selectedItems.some(i => i === itemId)
    }
    getScrollElementRef(el) {
        this.props.scrollRef(el)
        this.scrollComponent = el
    }

    render() {
        const {
            items,
            groups,
            sidebarWidth,
            rightSidebarWidth,
            timeSteps,
            traditionalZoom
        } = this.props
        const {
            draggingItem,
            resizingItem,
            width,
            visibleTimeStart,
            visibleTimeEnd,
            canvasTimeStart,
            canvasTimeEnd
        } = this.state
        let { dimensionItems, height, groupHeights, groupTops } = this.state

        const zoom = visibleTimeEnd - visibleTimeStart
        const canvasWidth = getCanvasWidth(width)
        const minUnit = getMinUnit(zoom, width, timeSteps)

        const isInteractingWithItem = !!draggingItem || !!resizingItem

        if (isInteractingWithItem) {
            const stackResults = stackTimelineItems(
                items,
                groups,
                canvasWidth,
                this.state.canvasTimeStart,
                this.state.canvasTimeEnd,
                this.props.keys,
                this.props.lineHeight,
                this.props.itemHeightRatio,
                this.props.stackItems,
                this.state.draggingItem,
                this.state.resizingItem,
                this.state.dragTime,
                this.state.resizingEdge,
                this.state.resizeTime,
                this.state.newGroupOrder
            )
            dimensionItems = stackResults.dimensionItems
            height = stackResults.height
            groupHeights = stackResults.groupHeights
            groupTops = stackResults.groupTops
        }

        const outerComponentStyle = {
            height: `${height}px`
        }

        return (
            <TimelineStateProvider
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                canvasTimeStart={canvasTimeStart}
                canvasTimeEnd={canvasTimeEnd}
                canvasWidth={canvasWidth}
                showPeriod={this.showPeriod}
                timelineUnit={minUnit}
                timelineWidth={this.state.width}
            >
                <TimelineMarkersProvider>
                    <TimelineHeadersProvider
                        registerScroll={this.handleHeaderRef}
                        timeSteps={timeSteps}
                        leftSidebarWidth={this.props.sidebarWidth}
                        rightSidebarWidth={this.props.rightSidebarWidth}
                    >
                        <div
                            style={this.props.style}
                            ref={el => (this.container = el)}
                            className="react-calendar-timeline border"
                        >
                            {this.renderHeaders()}
                            <div style={outerComponentStyle} className="rct-outer">
                                {sidebarWidth > 0 ? this.sidebar(height, groupHeights) : null}
                                <ScrollElement
                                    scrollRef={this.getScrollElementRef}
                                    width={width}
                                    height={height}
                                    onZoom={this.changeZoom}
                                    onWheelZoom={this.handleWheelZoom}
                                    traditionalZoom={traditionalZoom}
                                    onScroll={this.onScroll}
                                    isInteractingWithItem={isInteractingWithItem}
                                >
                                    <AnterosMarkerCanvas>
                                        {this.columns(
                                            canvasTimeStart,
                                            canvasTimeEnd,
                                            canvasWidth,
                                            minUnit,
                                            timeSteps,
                                            height
                                        )}
                                        {this.rows(canvasWidth, groupHeights, groups)}
                                        {this.items(
                                            canvasTimeStart,
                                            zoom,
                                            canvasTimeEnd,
                                            canvasWidth,
                                            minUnit,
                                            dimensionItems,
                                            groupHeights,
                                            groupTops
                                        )}
                                        {this.childrenWithProps(
                                            canvasTimeStart,
                                            canvasTimeEnd,
                                            canvasWidth,
                                            dimensionItems,
                                            groupHeights,
                                            groupTops,
                                            height,
                                            visibleTimeStart,
                                            visibleTimeEnd,
                                            minUnit,
                                            timeSteps
                                        )}
                                    </AnterosMarkerCanvas>
                                </ScrollElement>
                                {rightSidebarWidth > 0
                                    ? this.rightSidebar(height, groupHeights)
                                    : null}
                            </div>
                        </div>
                    </TimelineHeadersProvider>
                </TimelineMarkersProvider>
            </TimelineStateProvider>
        )
    }
}


AnterosCalendarTimeLine.propTypes = {
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    sidebarWidth: PropTypes.number,
    rightSidebarWidth: PropTypes.number,
    dragSnap: PropTypes.number,
    minResizeWidth: PropTypes.number,
    stickyHeader: PropTypes.bool,
    lineHeight: PropTypes.number,
    itemHeightRatio: PropTypes.number,

    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,

    clickTolerance: PropTypes.number,

    canChangeGroup: PropTypes.bool,
    canMove: PropTypes.bool,
    canResize: PropTypes.oneOf([true, false, 'left', 'right', 'both']),
    useResizeHandle: PropTypes.bool,
    canSelect: PropTypes.bool,

    stackItems: PropTypes.bool,

    traditionalZoom: PropTypes.bool,

    itemTouchSendsClick: PropTypes.bool,

    horizontalLineClassNamesForGroup: PropTypes.func,

    onItemMove: PropTypes.func,
    onItemResize: PropTypes.func,
    onItemClick: PropTypes.func,
    onItemSelect: PropTypes.func,
    onItemDeselect: PropTypes.func,
    onCanvasClick: PropTypes.func,
    onItemDoubleClick: PropTypes.func,
    onItemContextMenu: PropTypes.func,
    onCanvasDoubleClick: PropTypes.func,
    onCanvasContextMenu: PropTypes.func,
    onZoom: PropTypes.func,
    onItemDrag: PropTypes.func,

    moveResizeValidator: PropTypes.func,

    itemRenderer: PropTypes.func,
    groupRenderer: PropTypes.func,

    style: PropTypes.object,

    keys: PropTypes.shape({
        groupIdKey: PropTypes.string,
        groupTitleKey: PropTypes.string,
        groupLabelKey: PropTypes.string,
        groupRightTitleKey: PropTypes.string,
        itemIdKey: PropTypes.string,
        itemTitleKey: PropTypes.string,
        itemDivTitleKey: PropTypes.string,
        itemGroupKey: PropTypes.string,
        itemTimeStartKey: PropTypes.string,
        itemTimeEndKey: PropTypes.string
    }),
    headerRef: PropTypes.func,
    scrollRef: PropTypes.func,

    timeSteps: PropTypes.shape({
        second: PropTypes.number,
        minute: PropTypes.number,
        hour: PropTypes.number,
        day: PropTypes.number,
        month: PropTypes.number,
        year: PropTypes.number
    }),

    defaultTimeStart: PropTypes.object,
    defaultTimeEnd: PropTypes.object,

    visibleTimeStart: PropTypes.number,
    visibleTimeEnd: PropTypes.number,
    onTimeChange: PropTypes.func,
    onBoundsChange: PropTypes.func,

    selected: PropTypes.array,

    headerLabelFormats: PropTypes.shape({
        yearShort: PropTypes.string,
        yearLong: PropTypes.string,
        monthShort: PropTypes.string,
        monthMedium: PropTypes.string,
        monthMediumLong: PropTypes.string,
        monthLong: PropTypes.string,
        dayShort: PropTypes.string,
        dayLong: PropTypes.string,
        hourShort: PropTypes.string,
        hourMedium: PropTypes.string,
        hourMediumLong: PropTypes.string,
        hourLong: PropTypes.string
    }),

    subHeaderLabelFormats: PropTypes.shape({
        yearShort: PropTypes.string,
        yearLong: PropTypes.string,
        monthShort: PropTypes.string,
        monthMedium: PropTypes.string,
        monthLong: PropTypes.string,
        dayShort: PropTypes.string,
        dayMedium: PropTypes.string,
        dayMediumLong: PropTypes.string,
        dayLong: PropTypes.string,
        hourShort: PropTypes.string,
        hourLong: PropTypes.string,
        minuteShort: PropTypes.string,
        minuteLong: PropTypes.string
    }),

    resizeDetector: PropTypes.shape({
        addListener: PropTypes.func,
        removeListener: PropTypes.func
    }),

    verticalLineClassNamesForTime: PropTypes.func,

    children: PropTypes.node
}

AnterosCalendarTimeLine.defaultProps = {
    sidebarWidth: 150,
    rightSidebarWidth: 0,
    dragSnap: 1000 * 60 * 15, // 15min
    minResizeWidth: 20,
    stickyHeader: true,
    lineHeight: 30,
    itemHeightRatio: 0.65,
    minZoom: 60 * 60 * 1000, // 1 hour
    maxZoom: 5 * 365.24 * 86400 * 1000, // 5 years
    clickTolerance: 3, // how many pixels can we drag for it to be still considered a click?
    canChangeGroup: true,
    canMove: true,
    canResize: 'right',
    useResizeHandle: false,
    canSelect: true,
    stackItems: false,
    traditionalZoom: false,
    horizontalLineClassNamesForGroup: null,
    onItemMove: null,
    onItemResize: null,
    onItemClick: null,
    onItemSelect: null,
    onItemDeselect: null,
    onItemDrag: null,
    onCanvasClick: null,
    onItemDoubleClick: null,
    onItemContextMenu: null,
    onZoom: null,
    verticalLineClassNamesForTime: null,
    moveResizeValidator: null,
    dayBackground: null,
    defaultTimeStart: null,
    defaultTimeEnd: null,
    itemTouchSendsClick: false,
    style: {},
    keys: defaultKeys,
    timeSteps: defaultTimeSteps,
    headerRef: () => { },
    scrollRef: () => { },
    visibleTimeStart: null,
    visibleTimeEnd: null,
    onTimeChange: function (
        visibleTimeStart,
        visibleTimeEnd,
        updateScrollCanvas
    ) {
        updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
    },
    onBoundsChange: null,
    children: null,
    headerLabelFormats: defaultHeaderLabelFormats,
    subHeaderLabelFormats: defaultSubHeaderLabelFormats,
    selected: null
}

AnterosCalendarTimeLine.childContextTypes = {
    getTimelineContext: PropTypes.func
}

const passThroughPropTypes = {
    canvasTimeStart: PropTypes.number.isRequired,
    canvasTimeEnd: PropTypes.number.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    lineCount: PropTypes.number.isRequired,
    minUnit: PropTypes.string.isRequired,
    timeSteps: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired,
    verticalLineClassNamesForTime: PropTypes.func
}

class Columns extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
    shouldComponentUpdate(nextProps) {
        return !(
            nextProps.canvasTimeStart === this.props.canvasTimeStart &&
            nextProps.canvasTimeEnd === this.props.canvasTimeEnd &&
            nextProps.canvasWidth === this.props.canvasWidth &&
            nextProps.lineCount === this.props.lineCount &&
            nextProps.minUnit === this.props.minUnit &&
            nextProps.timeSteps === this.props.timeSteps &&
            nextProps.height === this.props.height &&
            nextProps.verticalLineClassNamesForTime ===
            this.props.verticalLineClassNamesForTime
        )
    }
    render() {
        const {
            canvasTimeStart,
            canvasTimeEnd,
            minUnit,
            timeSteps,
            height,
            verticalLineClassNamesForTime,
            getLeftOffsetFromDate
        } = this.props

        let lines = []

        iterateTimes(
            canvasTimeStart,
            canvasTimeEnd,
            minUnit,
            timeSteps,
            (time, nextTime) => {
                const minUnitValue = time.get(minUnit === 'day' ? 'date' : minUnit)
                const firstOfType = minUnitValue === (minUnit === 'day' ? 1 : 0)

                let classNamesForTime = []
                if (verticalLineClassNamesForTime) {
                    classNamesForTime = verticalLineClassNamesForTime(
                        time.unix() * 1000,
                        nextTime.unix() * 1000 - 1
                    )
                }
                const classNames =
                    'rct-vl' +
                    (firstOfType ? ' rct-vl-first' : '') +
                    (minUnit === 'day' || minUnit === 'hour' || minUnit === 'minute'
                        ? ` rct-day-${time.day()} `
                        : '') +
                    classNamesForTime.join(' ')

                const left = getLeftOffsetFromDate(time.valueOf())
                const right = getLeftOffsetFromDate(nextTime.valueOf())
                lines.push(
                    <div
                        key={`line-${time.valueOf()}`}
                        className={classNames}
                        style={{
                            pointerEvents: 'none',
                            top: '0px',
                            left: `${left}px`,
                            width: `${right - left}px`,
                            height: `${height}px`,
                            background: '#ffffff00',
                            borderWidth: 0
                        }}
                    />
                )
            }
        )

        return <div className="rct-vertical-lines">{lines}</div>
    }
}

Columns.propTypes = {
    ...passThroughPropTypes,
    getLeftOffsetFromDate: PropTypes.func.isRequired
}

const ColumnsWrapper = ({ ...props }) => {
    return (
        <TimelineStateContext.Consumer>
            {({ getLeftOffsetFromDate }) => (
                <Columns getLeftOffsetFromDate={getLeftOffsetFromDate} {...props} />
            )}
        </TimelineStateContext.Consumer>
    )
}

ColumnsWrapper.defaultProps = {
    ...passThroughPropTypes
}


function CustomDateHeader({
    headerContext: { intervals, unit },
    getRootProps,
    getIntervalProps,
    showPeriod,
    data: {
        style,
        intervalRenderer,
        className,
        getLabelFormat,
        unitProp,
        headerData
    },

}) {

    return (
        <div
            data-testid={`dateHeader`}
            className={className}
            {...getRootProps({ style })}
        >
            {intervals.map(interval => {
                const intervalText = getLabelFormat(
                    [interval.startTime, interval.endTime],
                    unit,
                    interval.labelWidth
                )

                return (
                    <Interval
                        key={`label-${interval.startTime.valueOf()}`}
                        unit={unit}
                        interval={interval}
                        showPeriod={showPeriod}
                        intervalText={intervalText}
                        primaryHeader={unitProp === 'primaryHeader'}
                        getIntervalProps={getIntervalProps}
                        intervalRenderer={intervalRenderer}
                        headerData={headerData}

                    />
                )
            })}
        </div>
    )
}

class CustomHeader extends React.Component {
    constructor(props) {
        super(props)
        const {
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            unit,
            timeSteps,
            showPeriod,
            getLeftOffsetFromDate
        } = props

        const intervals = this.getHeaderIntervals({
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            unit,
            timeSteps,
            showPeriod,
            getLeftOffsetFromDate
        })

        this.state = {
            intervals
        }
        autoBind(this);
    }

    shouldComponentUpdate(nextProps) {
        if (
            nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
            nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
            nextProps.canvasWidth !== this.props.canvasWidth ||
            nextProps.unit !== this.props.unit ||
            nextProps.timeSteps !== this.props.timeSteps ||
            nextProps.showPeriod !== this.props.showPeriod ||
            nextProps.children !== this.props.children ||
            nextProps.headerData !== this.props.headerData
        ) {
            return true
        }
        return false
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
            nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
            nextProps.canvasWidth !== this.props.canvasWidth ||
            nextProps.unit !== this.props.unit ||
            nextProps.timeSteps !== this.props.timeSteps ||
            nextProps.showPeriod !== this.props.showPeriod
        ) {
            const {
                canvasTimeStart,
                canvasTimeEnd,
                canvasWidth,
                unit,
                timeSteps,
                showPeriod,
                getLeftOffsetFromDate
            } = nextProps

            const intervals = this.getHeaderIntervals({
                canvasTimeStart,
                canvasTimeEnd,
                canvasWidth,
                unit,
                timeSteps,
                showPeriod,
                getLeftOffsetFromDate
            })

            this.setState({ intervals })
        }
    }

    getHeaderIntervals = ({
        canvasTimeStart,
        canvasTimeEnd,
        unit,
        timeSteps,
        getLeftOffsetFromDate
    }) => {
        const intervals = []
        iterateTimes(
            canvasTimeStart,
            canvasTimeEnd,
            unit,
            timeSteps,
            (startTime, endTime) => {
                const left = getLeftOffsetFromDate(startTime.valueOf())
                const right = getLeftOffsetFromDate(endTime.valueOf())
                const width = right - left
                intervals.push({
                    startTime,
                    endTime,
                    labelWidth: width,
                    left
                })
            }
        )
        return intervals
    }

    getRootProps = (props = {}) => {
        const { style } = props
        return {
            style: Object.assign({}, style ? style : {}, {
                position: 'relative',
                width: this.props.canvasWidth,
                height: this.props.height,
            })
        }
    }

    getIntervalProps = (props = {}) => {
        const { interval, style } = props
        if (!interval)
            throw new Error('você deve fornecer um intervalo para a prop getter')
        const { startTime, labelWidth, left } = interval
        return {
            style: this.getIntervalStyle({
                style,
                startTime,
                labelWidth,
                canvasTimeStart: this.props.canvasTimeStart,
                unit: this.props.unit,
                left
            }),
            key: `label-${startTime.valueOf()}`
        }
    }

    getIntervalStyle = ({ left, labelWidth, style }) => {

        return {
            ...style,
            left,
            width: labelWidth,
            position: 'absolute'
        }
    }

    getStateAndHelpers = () => {
        const {
            canvasTimeStart,
            canvasTimeEnd,
            unit,
            showPeriod,
            timelineWidth,
            visibleTimeStart,
            visibleTimeEnd,
            headerData,
        } = this.props
        return {
            timelineContext: {
                timelineWidth,
                visibleTimeStart,
                visibleTimeEnd,
                canvasTimeStart,
                canvasTimeEnd
            },
            headerContext: {
                unit,
                intervals: this.state.intervals
            },
            getRootProps: this.getRootProps,
            getIntervalProps: this.getIntervalProps,
            showPeriod,
            data: headerData,
        }
    }

    render() {
        const props = this.getStateAndHelpers()
        const Renderer = this.props.children
        return <Renderer {...props} />
    }
}

CustomHeader.propTypes = {
    children: PropTypes.func.isRequired,
    unit: PropTypes.string.isRequired,
    timeSteps: PropTypes.object.isRequired,
    visibleTimeStart: PropTypes.number.isRequired,
    visibleTimeEnd: PropTypes.number.isRequired,
    canvasTimeStart: PropTypes.number.isRequired,
    canvasTimeEnd: PropTypes.number.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    showPeriod: PropTypes.func.isRequired,
    headerData: PropTypes.object,
    getLeftOffsetFromDate: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
}

const CustomHeaderWrapper = ({ children, unit, headerData, height }) => (
    <TimelineStateContext.Consumer>
        {({ getTimelineState, showPeriod, getLeftOffsetFromDate }) => {
            const timelineState = getTimelineState()
            return (
                <TimelineHeadersContext.Consumer>
                    {({ timeSteps }) => (
                        <CustomHeader
                            children={children}
                            timeSteps={timeSteps}
                            showPeriod={showPeriod}
                            unit={unit ? unit : timelineState.timelineUnit}
                            {...timelineState}
                            headerData={headerData}
                            getLeftOffsetFromDate={getLeftOffsetFromDate}
                            height={height}
                        />
                    )}
                </TimelineHeadersContext.Consumer>
            )
        }}
    </TimelineStateContext.Consumer>
)

CustomHeaderWrapper.propTypes = {
    children: PropTypes.func.isRequired,
    unit: PropTypes.string,
    headerData: PropTypes.object,
    height: PropTypes.number,
}

CustomHeaderWrapper.defaultProps = {
    height: 30,
}

class DateHeader extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    getHeaderUnit = () => {
        if (this.props.unit === 'primaryHeader') {

            return getNextUnit(this.props.timelineUnit)

        } else if (this.props.unit) {
            return this.props.unit
        }
        return this.props.timelineUnit
    }

    getRootStyle = memoize(style => {
        return {
            height: 30,
            ...style
        }
    })

    getLabelFormat(interval, unit, labelWidth) {
        const { labelFormat } = this.props
        if (typeof labelFormat === 'string') {
            const startTime = interval[0]
            return startTime.format(labelFormat)
        } else if (typeof labelFormat === 'function') {
            return labelFormat(interval, unit, labelWidth)
        } else {
            throw new Error('labelFormat should be function or string')
        }
    }

    getHeaderData = memoize(
        (
            intervalRenderer,
            style,
            className,
            getLabelFormat,
            unitProp,
            headerData
        ) => {
            return {
                intervalRenderer,
                style,
                className,
                getLabelFormat,
                unitProp,
                headerData
            }
        }
    )

    render() {
        const unit = this.getHeaderUnit()

        const { height } = this.props
        return (
            <CustomHeaderWrapper
                unit={unit}
                height={height}
                headerData={this.getHeaderData(
                    this.props.intervalRenderer,
                    this.getRootStyle(this.props.style),
                    this.props.className,
                    this.getLabelFormat,
                    this.props.unit,
                    this.props.headerData
                )}
                children={CustomDateHeader}
            />
        )
    }
}

DateHeader.propTypes = {
    unit: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    timelineUnit: PropTypes.string,
    labelFormat: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        PropTypes.string
    ]).isRequired,
    intervalRenderer: PropTypes.func,
    headerData: PropTypes.object,
    height: PropTypes.number
}

const DateHeaderWrapper = ({
    unit,
    labelFormat,
    style,
    className,
    intervalRenderer,
    headerData,
    height
}) => (
        <TimelineStateContext.Consumer>
            {({ getTimelineState }) => {
                const timelineState = getTimelineState()
                return (
                    <DateHeader
                        timelineUnit={timelineState.timelineUnit}
                        unit={unit}
                        labelFormat={labelFormat}
                        style={style}
                        className={className}
                        intervalRenderer={intervalRenderer}
                        headerData={headerData}
                        height={height}
                    />
                )
            }}
        </TimelineStateContext.Consumer>
    )

DateHeaderWrapper.propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    unit: PropTypes.string,
    labelFormat: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        PropTypes.string
    ]),
    intervalRenderer: PropTypes.func,
    headerData: PropTypes.object,
    height: PropTypes.number
}

DateHeaderWrapper.defaultProps = {
    labelFormat: formatLabel
}

function formatLabel(
    [timeStart, timeEnd],
    unit,
    labelWidth,
    formatOptions = defaultHeaderFormats
) {
    let format
    if (labelWidth >= 150) {
        format = formatOptions[unit]['long']
    } else if (labelWidth >= 100) {
        format = formatOptions[unit]['mediumLong']
    } else if (labelWidth >= 50) {
        format = formatOptions[unit]['medium']
    } else {
        format = formatOptions[unit]['short']
    }
    return timeStart.format(format)
}

const TimelineHeadersContext = createReactContext({
    registerScroll: () => {
        console.warn('default registerScroll header used')
        return noop
    },
    rightSidebarWidth: 0,
    leftSidebarWidth: 150,
    timeSteps: {}
})


class TimelineHeadersProvider extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    render() {
        const contextValue = {
            rightSidebarWidth: this.props.rightSidebarWidth,
            leftSidebarWidth: this.props.leftSidebarWidth,
            timeSteps: this.props.timeSteps,
            registerScroll: this.props.registerScroll,
        }
        return <TimelineHeadersContext.Provider value={contextValue}>{this.props.children}</TimelineHeadersContext.Provider>
    }
}

TimelineHeadersProvider.propTypes = {
    children: PropTypes.element.isRequired,
    rightSidebarWidth: PropTypes.number,
    leftSidebarWidth: PropTypes.number.isRequired,
    timeSteps: PropTypes.object.isRequired,
    registerScroll: PropTypes.func.isRequired,
}


class Interval extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    onIntervalClick = () => {
        const { primaryHeader, interval, unit, showPeriod } = this.props
        if (primaryHeader) {
            const nextUnit = getNextUnit(unit)
            const newStartTime = interval.startTime.clone().startOf(nextUnit)
            const newEndTime = interval.startTime.clone().endOf(nextUnit)
            showPeriod(newStartTime, newEndTime)
        } else {
            showPeriod(interval.startTime, interval.endTime)
        }
    }

    getIntervalProps = (props = {}) => {

        return {
            ...this.props.getIntervalProps({
                interval: this.props.interval,
                style: this.props.primaryHeader ? null : intervalStyle,
                ...props
            }),
            onClick: composeEvents(this.onIntervalClick, props.onClick)
        }
    }

    render() {
        const { intervalText, interval, intervalRenderer, headerData } = this.props
        const Renderer = intervalRenderer
        if (Renderer) {
            return (
                <Renderer
                    getIntervalProps={this.getIntervalProps}
                    intervalContext={{
                        interval,
                        intervalText
                    }}
                    data={headerData}
                />
            )
        }


        return (
            <div
                data-testid="dateHeaderInterval"
                {...this.getIntervalProps({
                })}
                className={`rct-dateHeader ${this.props.primaryHeader ? 'rct-dateHeader-primary' : ''}`}
            >
                <span>{intervalText}</span>
            </div>
        )
    }
}

Interval.propTypes = {
    intervalRenderer: PropTypes.func,
    unit: PropTypes.string.isRequired,
    interval: PropTypes.object.isRequired,
    showPeriod: PropTypes.func.isRequired,
    intervalText: PropTypes.string.isRequired,
    primaryHeader: PropTypes.bool.isRequired,
    getIntervalProps: PropTypes.func.isRequired,
    headerData: PropTypes.object
}


class AnterosSidebarHeaderTemp extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    getRootProps(props = {}) {
        const { style } = props
        const width =
            this.props.variant === RIGHT_VARIANT
                ? this.props.rightSidebarWidth
                : this.props.leftSidebarWidth
        return {
            style: {
                ...style,
                width,
            }
        }
    }

    getStateAndHelpers() {
        return {
            getRootProps: this.getRootProps,
            data: this.props.headerData,
        }
    }

    render() {
        const props = this.getStateAndHelpers()
        const Renderer = this.props.children
        return <Renderer {...props} />
    }
}

AnterosSidebarHeaderTemp.propTypes = {
    children: PropTypes.func.isRequired,
    rightSidebarWidth: PropTypes.number,
    leftSidebarWidth: PropTypes.number.isRequired,
    variant: PropTypes.string,
    headerData: PropTypes.object
}

export const AnterosSidebarHeader = ({ children, variant, headerData }) => (
    <TimelineHeadersContext.Consumer>
        {({ leftSidebarWidth, rightSidebarWidth }) => {
            return (
                <AnterosSidebarHeaderTemp
                    leftSidebarWidth={leftSidebarWidth}
                    rightSidebarWidth={rightSidebarWidth}
                    children={children}
                    variant={variant}
                    headerData={headerData}
                />
            )
        }}
    </TimelineHeadersContext.Consumer>
)

AnterosSidebarHeader.propTypes = {
    children: PropTypes.func.isRequired,
    variant: PropTypes.string,
    headerData: PropTypes.object
}

AnterosSidebarHeader.defaultProps = {
    variant: LEFT_VARIANT,
    children: ({ getRootProps }) => <div data-testid="sidebarHeader" {...getRootProps()} />
}

AnterosSidebarHeader.secretKey = "AnterosSidebarHeader"


class AnterosTimelineHeadersTemp extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    getRootStyle() {

        return {
            ...this.props.style,
            display: 'flex',
            width: '100%',
            //background:'blue'
        }
    }

    getCalendarHeaderStyle() {
        const {
            leftSidebarWidth,
            rightSidebarWidth,
            calendarHeaderStyle
        } = this.props
        return {
            ...calendarHeaderStyle,
            overflow: 'hidden',
            width: `calc(100% - ${leftSidebarWidth + rightSidebarWidth}px)`
        }
    }

    handleRootRef(element) {
        if (this.props.headerRef) {
            this.props.headerRef(element)
        }
    }

    isSidebarHeader(child) {
        if (child.type === undefined) return false
        return child.type.secretKey === AnterosSidebarHeader.secretKey
    }

    render() {
        let _this = this;
        let rightSidebarHeader
        let leftSidebarHeader
        let calendarHeaders = []
        const children = Array.isArray(this.props.children)
            ? this.props.children.filter(c => c)
            : [this.props.children]
        React.Children.map(children, child => {
            if (_this.isSidebarHeader(child)) {
                if (child.props.variant === RIGHT_VARIANT) {
                    rightSidebarHeader = child
                } else {
                    leftSidebarHeader = child
                }
            } else {
                calendarHeaders.push(child)
            }
        })
        if (!leftSidebarHeader) {
            leftSidebarHeader = <AnterosSidebarHeader />
        }
        if (!rightSidebarHeader && this.props.rightSidebarWidth) {
            rightSidebarHeader = <AnterosSidebarHeader variant="right" />
        }
        return (
            <div
                ref={this.handleRootRef}
                data-testid="headerRootDiv"
                style={this.getRootStyle()}
                className={classNames('rct-header-root', this.props.className)}
            >
                {leftSidebarHeader}
                <div
                    ref={this.props.registerScroll}
                    style={this.getCalendarHeaderStyle()}
                    className={classNames(
                        'rct-calendar-header',
                        this.props.calendarHeaderClassName
                    )}
                    data-testid="headerContainer"
                >
                    {calendarHeaders}
                </div>
                {rightSidebarHeader}
            </div>
        )
    }
}

AnterosTimelineHeadersTemp.propTypes = {
    registerScroll: PropTypes.func.isRequired,
    leftSidebarWidth: PropTypes.number.isRequired,
    rightSidebarWidth: PropTypes.number.isRequired,
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    calendarHeaderStyle: PropTypes.object,
    calendarHeaderClassName: PropTypes.string,
    headerRef: PropTypes.func
}

export const AnterosTimelineHeaders = ({
    children,
    style,
    className,
    calendarHeaderStyle,
    calendarHeaderClassName
}) => (

        <TimelineHeadersContext.Consumer>
            {({ leftSidebarWidth, rightSidebarWidth, registerScroll }) => {
                return (
                    <AnterosTimelineHeadersTemp
                        leftSidebarWidth={leftSidebarWidth}
                        rightSidebarWidth={rightSidebarWidth}
                        registerScroll={registerScroll}
                        style={style}
                        className={className}
                        calendarHeaderStyle={calendarHeaderStyle}
                        calendarHeaderClassName={calendarHeaderClassName}
                    >
                        {children}
                    </AnterosTimelineHeadersTemp>
                )
            }}
        </TimelineHeadersContext.Consumer>
    )

AnterosTimelineHeaders.propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    calendarHeaderStyle: PropTypes.object,
    calendarHeaderClassName: PropTypes.string
}

AnterosTimelineHeaders.secretKey = "AnterosTimelineHeaders"


class PreventClickOnDrag extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    handleMouseDown(evt) {
        this.originClickX = evt.clientX
    }

    handleMouseUp(evt) {
        if (Math.abs(this.originClickX - evt.clientX) > this.props.clickTolerance) {
            this.cancelClick = true
        }
    }

    handleClick(evt) {
        if (!this.cancelClick) {
            this.props.onClick(evt)
        }

        this.cancelClick = false
        this.originClickX = null
    }

    render() {
        const childElement = React.Children.only(this.props.children)
        return React.cloneElement(childElement, {
            onMouseDown: this.handleMouseDown,
            onMouseUp: this.handleMouseUp,
            onClick: this.handleClick
        })
    }
}

PreventClickOnDrag.propTypes = {
    children: PropTypes.element.isRequired,
    onClick: PropTypes.func.isRequired,
    clickTolerance: PropTypes.number.isRequired
}

export const defaultItemRenderer = ({
    item,
    itemContext,
    getItemProps,
    getResizeProps
}) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
    return (
        <div {...getItemProps(item.itemProps)}>
            {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}

            <div
                className="rct-item-content"
                style={{ maxHeight: `${itemContext.dimensions.height}` }}
            >
                {itemContext.title}
            </div>

            {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
        </div>
    )
}

defaultItemRenderer.propTypes = {
    item: PropTypes.any,
    itemContext: PropTypes.any,
    getItemProps: PropTypes.any,
    getResizeProps: PropTypes.any
}


class Item extends Component {
    constructor(props) {
        super(props)

        this.cacheDataFromProps(props)

        this.state = {
            interactMounted: false,

            dragging: null,
            dragStart: null,
            preDragPosition: null,
            dragTime: null,
            dragGroupDelta: null,

            resizing: null,
            resizeEdge: null,
            resizeStart: null,
            resizeTime: null
        }
        autoBind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var shouldUpdate =
            nextState.dragging !== this.state.dragging ||
            nextState.dragTime !== this.state.dragTime ||
            nextState.dragGroupDelta !== this.state.dragGroupDelta ||
            nextState.resizing !== this.state.resizing ||
            nextState.resizeTime !== this.state.resizeTime ||
            nextProps.keys !== this.props.keys ||
            !deepObjectCompare(nextProps.itemProps, this.props.itemProps) ||
            nextProps.selected !== this.props.selected ||
            nextProps.item !== this.props.item ||
            nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
            nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
            nextProps.canvasWidth !== this.props.canvasWidth ||
            (nextProps.order ? nextProps.order.index : undefined) !==
            (this.props.order ? this.props.order.index : undefined) ||
            nextProps.dragSnap !== this.props.dragSnap ||
            nextProps.minResizeWidth !== this.props.minResizeWidth ||
            nextProps.canChangeGroup !== this.props.canChangeGroup ||
            nextProps.canSelect !== this.props.canSelect ||
            nextProps.canMove !== this.props.canMove ||
            nextProps.canResizeLeft !== this.props.canResizeLeft ||
            nextProps.canResizeRight !== this.props.canResizeRight ||
            nextProps.dimensions !== this.props.dimensions
        return shouldUpdate
    }

    cacheDataFromProps(props) {
        this.itemId = _get(props.item, props.keys.itemIdKey)
        this.itemTitle = _get(props.item, props.keys.itemTitleKey)
        this.itemDivTitle = props.keys.itemDivTitleKey
            ? _get(props.item, props.keys.itemDivTitleKey)
            : this.itemTitle
        this.itemTimeStart = _get(props.item, props.keys.itemTimeStartKey)
        this.itemTimeEnd = _get(props.item, props.keys.itemTimeEndKey)
    }

    getTimeRatio() {
        const { canvasTimeStart, canvasTimeEnd, canvasWidth } = this.props
        return coordinateToTimeRatio(canvasTimeStart, canvasTimeEnd, canvasWidth)
    }

    dragTimeSnap(dragTime, considerOffset) {
        const { dragSnap } = this.props
        if (dragSnap) {
            const offset = considerOffset ? moment().utcOffset() * 60 * 1000 : 0
            return Math.round(dragTime / dragSnap) * dragSnap - offset % dragSnap
        } else {
            return dragTime
        }
    }

    resizeTimeSnap(dragTime) {
        const { dragSnap } = this.props
        if (dragSnap) {
            const endTime = this.itemTimeEnd % dragSnap
            return Math.round((dragTime - endTime) / dragSnap) * dragSnap + endTime
        } else {
            return dragTime
        }
    }

    dragTime(e) {
        const startTime = moment(this.itemTimeStart)

        if (this.state.dragging) {
            return this.dragTimeSnap(this.timeFor(e) + this.state.dragStart.offset, true)
        } else {
            return startTime
        }
    }

    timeFor(e) {
        const ratio = coordinateToTimeRatio(this.props.canvasTimeStart, this.props.canvasTimeEnd, this.props.canvasWidth)

        const offset = getSumOffset(this.props.scrollRef).offsetLeft
        const scrolls = getSumScroll(this.props.scrollRef)

        return (e.pageX - offset + scrolls.scrollLeft) * ratio + this.props.canvasTimeStart;
    }

    dragGroupDelta(e) {
        const { groupTops, order } = this.props
        if (this.state.dragging) {
            if (!this.props.canChangeGroup) {
                return 0
            }
            let groupDelta = 0

            const offset = getSumOffset(this.props.scrollRef).offsetTop
            const scrolls = getSumScroll(this.props.scrollRef)

            for (var key of Object.keys(groupTops)) {
                var groupTop = groupTops[key]
                if (e.pageY - offset + scrolls.scrollTop > groupTop) {
                    groupDelta = parseInt(key, 10) - order.index
                } else {
                    break
                }
            }

            if (this.props.order.index + groupDelta < 0) {
                return 0 - this.props.order.index
            } else {
                return groupDelta
            }
        } else {
            return 0
        }
    }

    resizeTimeDelta(e, resizeEdge) {
        const length = this.itemTimeEnd - this.itemTimeStart
        const timeDelta = this.dragTimeSnap(
            (e.pageX - this.state.resizeStart) * this.getTimeRatio()
        )

        if (
            length + (resizeEdge === 'left' ? -timeDelta : timeDelta) <
            (this.props.dragSnap || 1000)
        ) {
            if (resizeEdge === 'left') {
                return length - (this.props.dragSnap || 1000)
            } else {
                return (this.props.dragSnap || 1000) - length
            }
        } else {
            return timeDelta
        }
    }

    mountInteract() {
        const leftResize = this.props.useResizeHandle ? ".rct-item-handler-resize-left" : true
        const rightResize = this.props.useResizeHandle ? ".rct-item-handler-resize-right" : true

        interact(this.item)
            .resizable({
                edges: {
                    left: this.canResizeLeft() && leftResize,
                    right: this.canResizeRight() && rightResize,
                    top: false,
                    bottom: false
                },
                enabled:
                    this.props.selected && (this.canResizeLeft() || this.canResizeRight())
            })
            .draggable({
                enabled: this.props.selected && this.canMove()
            })
            .styleCursor(false)
            .on('dragstart', e => {
                if (this.props.selected) {
                    const clickTime = this.timeFor(e);
                    this.setState({
                        dragging: true,
                        dragStart: {
                            x: e.pageX,
                            y: e.pageY,
                            offset: this.itemTimeStart - clickTime
                        },
                        preDragPosition: { x: e.target.offsetLeft, y: e.target.offsetTop },
                        dragTime: this.itemTimeStart,
                        dragGroupDelta: 0
                    })
                } else {
                    return false
                }
            })
            .on('dragmove', e => {
                if (this.state.dragging) {
                    let dragTime = this.dragTime(e)
                    let dragGroupDelta = this.dragGroupDelta(e)
                    if (this.props.moveResizeValidator) {
                        dragTime = this.props.moveResizeValidator(
                            'move',
                            this.props.item,
                            dragTime
                        )
                    }

                    if (this.props.onDrag) {
                        this.props.onDrag(
                            this.itemId,
                            dragTime,
                            this.props.order.index + dragGroupDelta
                        )
                    }

                    this.setState({
                        dragTime: dragTime,
                        dragGroupDelta: dragGroupDelta
                    })
                }
            })
            .on('dragend', e => {
                if (this.state.dragging) {
                    if (this.props.onDrop) {
                        let dragTime = this.dragTime(e)

                        if (this.props.moveResizeValidator) {
                            dragTime = this.props.moveResizeValidator(
                                'move',
                                this.props.item,
                                dragTime
                            )
                        }

                        this.props.onDrop(
                            this.itemId,
                            dragTime,
                            this.props.order.index + this.dragGroupDelta(e)
                        )
                    }

                    this.setState({
                        dragging: false,
                        dragStart: null,
                        preDragPosition: null,
                        dragTime: null,
                        dragGroupDelta: null
                    })
                }
            })
            .on('resizestart', e => {
                if (this.props.selected) {
                    this.setState({
                        resizing: true,
                        resizeEdge: null, // we don't know yet
                        resizeStart: e.pageX,
                        resizeTime: 0
                    })
                } else {
                    return false
                }
            })
            .on('resizemove', e => {
                if (this.state.resizing) {
                    let resizeEdge = this.state.resizeEdge

                    if (!resizeEdge) {
                        resizeEdge = e.deltaRect.left !== 0 ? 'left' : 'right'
                        this.setState({ resizeEdge })
                    }
                    let resizeTime = this.resizeTimeSnap(this.timeFor(e))

                    if (this.props.moveResizeValidator) {
                        resizeTime = this.props.moveResizeValidator(
                            'resize',
                            this.props.item,
                            resizeTime,
                            resizeEdge
                        )
                    }

                    if (this.props.onResizing) {
                        this.props.onResizing(this.itemId, resizeTime, resizeEdge)
                    }

                    this.setState({
                        resizeTime
                    })
                }
            })
            .on('resizeend', e => {
                if (this.state.resizing) {
                    const { resizeEdge } = this.state
                    let resizeTime = this.resizeTimeSnap(this.timeFor(e))

                    if (this.props.moveResizeValidator) {
                        resizeTime = this.props.moveResizeValidator(
                            'resize',
                            this.props.item,
                            resizeTime,
                            resizeEdge
                        )
                    }

                    if (this.props.onResized) {
                        this.props.onResized(
                            this.itemId,
                            resizeTime,
                            resizeEdge,
                            this.resizeTimeDelta(e, resizeEdge)
                        )
                    }
                    this.setState({
                        resizing: null,
                        resizeStart: null,
                        resizeEdge: null,
                        resizeTime: null
                    })
                }
            })
            .on('tap', e => {
                this.actualClick(e, e.pointerType === 'mouse' ? 'click' : 'touch')
            })

        this.setState({
            interactMounted: true
        })
    }

    canResizeLeft(props = this.props) {
        if (!props.canResizeLeft) {
            return false
        }
        let width = parseInt(props.dimensions.width, 10)
        return width >= props.minResizeWidth
    }

    canResizeRight(props = this.props) {
        if (!props.canResizeRight) {
            return false
        }
        let width = parseInt(props.dimensions.width, 10)
        return width >= props.minResizeWidth
    }

    canMove(props = this.props) {
        return !!props.canMove
    }

    componentDidUpdate(prevProps) {
        this.cacheDataFromProps(this.props)
        let { interactMounted } = this.state
        const couldDrag = prevProps.selected && this.canMove(prevProps)
        const couldResizeLeft =
            prevProps.selected && this.canResizeLeft(prevProps)
        const couldResizeRight =
            prevProps.selected && this.canResizeRight(prevProps)
        const willBeAbleToDrag = this.props.selected && this.canMove(this.props)
        const willBeAbleToResizeLeft =
            this.props.selected && this.canResizeLeft(this.props)
        const willBeAbleToResizeRight =
            this.props.selected && this.canResizeRight(this.props)

        if (!!this.item) {
            if (this.props.selected && !interactMounted) {
                this.mountInteract()
                interactMounted = true
            }
            if (
                interactMounted &&
                (couldResizeLeft !== willBeAbleToResizeLeft ||
                    couldResizeRight !== willBeAbleToResizeRight)
            ) {
                const leftResize = this.props.useResizeHandle ? this.dragLeft : true
                const rightResize = this.props.useResizeHandle ? this.dragRight : true

                interact(this.item).resizable({
                    enabled: willBeAbleToResizeLeft || willBeAbleToResizeRight,
                    edges: {
                        top: false,
                        bottom: false,
                        left: willBeAbleToResizeLeft && leftResize,
                        right: willBeAbleToResizeRight && rightResize
                    }
                })
            }
            if (interactMounted && couldDrag !== willBeAbleToDrag) {
                interact(this.item).draggable({ enabled: willBeAbleToDrag })
            }
        }
        else {
            interactMounted = false;
        }
        this.setState({
            interactMounted,
        })

    }

    onMouseDown(e) {
        if (!this.state.interactMounted) {
            e.preventDefault()
            this.startedClicking = true
        }
    }

    onMouseUp(e) {
        if (!this.state.interactMounted && this.startedClicking) {
            this.startedClicking = false
            this.actualClick(e, 'click')
        }
    }

    onTouchStart(e) {
        if (!this.state.interactMounted) {
            e.preventDefault()
            this.startedTouching = true
        }
    }

    onTouchEnd(e) {
        if (!this.state.interactMounted && this.startedTouching) {
            this.startedTouching = false
            this.actualClick(e, 'touch')
        }
    }

    handleDoubleClick(e) {
        e.stopPropagation()
        if (this.props.onItemDoubleClick) {
            this.props.onItemDoubleClick(this.itemId, e)
        }
    }

    handleContextMenu(e) {
        if (this.props.onContextMenu) {
            e.preventDefault()
            e.stopPropagation()
            this.props.onContextMenu(this.itemId, e)
        }
    }

    actualClick(e, clickType) {
        if (this.props.canSelect && this.props.onSelect) {
            this.props.onSelect(this.itemId, clickType, e)
        }
    }

    getItemRef(el) {
        return (this.item = el);
    }

    getDragLeftRef(el) {
        return (this.dragLeft = el);
    }

    getDragRightRef(el) {
        return (this.dragRight = el);
    }

    getItemProps(props = {}) {
        const classNames =
            'rct-item' +
            (this.props.item.className ? ` ${this.props.item.className}` : '')

        return {
            key: this.itemId,
            ref: this.getItemRef,
            title: this.itemDivTitle,
            className: classNames + ` ${props.className ? props.className : ''}`,
            onMouseDown: composeEvents(this.onMouseDown, props.onMouseDown),
            onMouseUp: composeEvents(this.onMouseUp, props.onMouseUp),
            onTouchStart: composeEvents(this.onTouchStart, props.onTouchStart),
            onTouchEnd: composeEvents(this.onTouchEnd, props.onTouchEnd),
            onDoubleClick: composeEvents(this.handleDoubleClick, props.onDoubleClick),
            onContextMenu: composeEvents(this.handleContextMenu, props.onContextMenu),
            style: Object.assign({}, this.getItemStyle(props))
        }
    }

    getResizeProps(props = {}) {
        let leftName = "rct-item-handler rct-item-handler-left rct-item-handler-resize-left"
        if (props.leftClassName) {
            leftName += ` ${props.leftClassName}`
        }

        let rightName = "rct-item-handler rct-item-handler-right rct-item-handler-resize-right"
        if (props.rightClassName) {
            rightName += ` ${props.rightClassName}`
        }
        return {
            left: {
                ref: this.getDragLeftRef,
                className: leftName,
                style: Object.assign({}, leftResizeStyle, props.leftStyle)
            },
            right: {
                ref: this.getDragRightRef,
                className: rightName,
                style: Object.assign({}, rightResizeStyle, props.rightStyle)
            }
        }
    }

    getItemStyle(props) {
        const dimensions = this.props.dimensions

        const baseStyles = {
            position: 'absolute',
            boxSizing: 'border-box',
            left: `${dimensions.left}px`,
            top: `${dimensions.top}px`,
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            lineHeight: `${dimensions.height}px`
        }

        const finalStyle = Object.assign(
            {},
            overridableStyles,
            this.props.selected ? selectedStyle : {},
            this.props.selected & this.canMove(this.props) ? selectedAndCanMove : {},
            this.props.selected & this.canResizeLeft(this.props)
                ? selectedAndCanResizeLeft
                : {},
            this.props.selected & this.canResizeLeft(this.props) & this.state.dragging
                ? selectedAndCanResizeLeftAndDragLeft
                : {},
            this.props.selected & this.canResizeRight(this.props)
                ? selectedAndCanResizeRight
                : {},
            this.props.selected &
                this.canResizeRight(this.props) &
                this.state.dragging
                ? selectedAndCanResizeRightAndDragRight
                : {},
            props.style,
            baseStyles
        )
        return finalStyle
    }

    render() {
        if (typeof this.props.order === 'undefined' || this.props.order === null) {
            return null
        }

        const timelineContext = this.context.getTimelineContext()
        const itemContext = {
            dimensions: this.props.dimensions,
            useResizeHandle: this.props.useResizeHandle,
            title: this.itemTitle,
            canMove: this.canMove(this.props),
            canResizeLeft: this.canResizeLeft(this.props),
            canResizeRight: this.canResizeRight(this.props),
            selected: this.props.selected,
            dragging: this.state.dragging,
            dragStart: this.state.dragStart,
            dragTime: this.state.dragTime,
            dragGroupDelta: this.state.dragGroupDelta,
            resizing: this.state.resizing,
            resizeEdge: this.state.resizeEdge,
            resizeStart: this.state.resizeStart,
            resizeTime: this.state.resizeTime,
            width: this.props.dimensions.width
        }

        return this.props.itemRenderer({
            item: this.props.item,
            timelineContext,
            itemContext,
            getItemProps: this.getItemProps,
            getResizeProps: this.getResizeProps
        })
    }
}

Item.propTypes = {
    canvasTimeStart: PropTypes.number.isRequired,
    canvasTimeEnd: PropTypes.number.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    order: PropTypes.object,

    dragSnap: PropTypes.number,
    minResizeWidth: PropTypes.number,
    selected: PropTypes.bool,

    canChangeGroup: PropTypes.bool.isRequired,
    canMove: PropTypes.bool.isRequired,
    canResizeLeft: PropTypes.bool.isRequired,
    canResizeRight: PropTypes.bool.isRequired,

    keys: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,

    onSelect: PropTypes.func,
    onDrag: PropTypes.func,
    onDrop: PropTypes.func,
    onResizing: PropTypes.func,
    onResized: PropTypes.func,
    onContextMenu: PropTypes.func,
    itemRenderer: PropTypes.func,

    itemProps: PropTypes.object,
    canSelect: PropTypes.bool,
    dimensions: PropTypes.object,
    groupTops: PropTypes.array,
    useResizeHandle: PropTypes.bool,
    moveResizeValidator: PropTypes.func,
    onItemDoubleClick: PropTypes.func,

    scrollRef: PropTypes.object
}

Item.defaultProps = {
    selected: false,
    itemRenderer: defaultItemRenderer
}

Item.contextTypes = {
    getTimelineContext: PropTypes.func
}

const canResizeLeft = (item, canResize) => {
    const value =
        _get(item, 'canResize') !== undefined ? _get(item, 'canResize') : canResize
    return value === 'left' || value === 'both'
}

const canResizeRight = (item, canResize) => {
    const value =
        _get(item, 'canResize') !== undefined ? _get(item, 'canResize') : canResize
    return value === 'right' || value === 'both' || value === true
}

class Items extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    shouldComponentUpdate(nextProps) {
        return !(
            arraysEqual(nextProps.groups, this.props.groups) &&
            arraysEqual(nextProps.items, this.props.items) &&
            arraysEqual(nextProps.dimensionItems, this.props.dimensionItems) &&
            nextProps.keys === this.props.keys &&
            nextProps.canvasTimeStart === this.props.canvasTimeStart &&
            nextProps.canvasTimeEnd === this.props.canvasTimeEnd &&
            nextProps.canvasWidth === this.props.canvasWidth &&
            nextProps.selectedItem === this.props.selectedItem &&
            nextProps.selected === this.props.selected &&
            nextProps.dragSnap === this.props.dragSnap &&
            nextProps.minResizeWidth === this.props.minResizeWidth &&
            nextProps.canChangeGroup === this.props.canChangeGroup &&
            nextProps.canMove === this.props.canMove &&
            nextProps.canResize === this.props.canResize &&
            nextProps.canSelect === this.props.canSelect
        )
    }

    isSelected(item, itemIdKey) {
        if (!this.props.selected) {
            return this.props.selectedItem === _get(item, itemIdKey)
        } else {
            let target = _get(item, itemIdKey)
            return this.props.selected.includes(target)
        }
    }

    getVisibleItems(canvasTimeStart, canvasTimeEnd) {
        const { keys, items } = this.props

        return getVisibleItems(items, canvasTimeStart, canvasTimeEnd, keys)
    }

    render() {
        const {
            canvasTimeStart,
            canvasTimeEnd,
            dimensionItems,
            keys,
            groups
        } = this.props
        const { itemIdKey, itemGroupKey } = keys

        const groupOrders = getGroupOrders(groups, keys)
        const visibleItems = this.getVisibleItems(
            canvasTimeStart,
            canvasTimeEnd,
            groupOrders
        )
        const sortedDimensionItems = keyBy(dimensionItems, 'id')
        let _this = this;

        return (
            <div className="rct-items">
                {visibleItems
                    .filter(item => sortedDimensionItems[_get(item, itemIdKey)])
                    .map(item => (
                        <Item
                            key={_get(item, itemIdKey)}
                            item={item}
                            keys={_this.props.keys}
                            order={groupOrders[_get(item, itemGroupKey)]}
                            dimensions={
                                sortedDimensionItems[_get(item, itemIdKey)].dimensions
                            }
                            selected={_this.isSelected(item, itemIdKey)}
                            canChangeGroup={
                                _get(item, 'canChangeGroup') !== undefined
                                    ? _get(item, 'canChangeGroup')
                                    : _this.props.canChangeGroup
                            }
                            canMove={
                                _get(item, 'canMove') !== undefined
                                    ? _get(item, 'canMove')
                                    : _this.props.canMove
                            }
                            canResizeLeft={canResizeLeft(item, _this.props.canResize)}
                            canResizeRight={canResizeRight(item, _this.props.canResize)}
                            canSelect={
                                _get(item, 'canSelect') !== undefined
                                    ? _get(item, 'canSelect')
                                    : _this.props.canSelect
                            }
                            useResizeHandle={_this.props.useResizeHandle}
                            groupTops={_this.props.groupTops}
                            canvasTimeStart={_this.props.canvasTimeStart}
                            canvasTimeEnd={_this.props.canvasTimeEnd}
                            canvasWidth={_this.props.canvasWidth}
                            dragSnap={_this.props.dragSnap}
                            minResizeWidth={_this.props.minResizeWidth}
                            onResizing={_this.props.itemResizing}
                            onResized={_this.props.itemResized}
                            moveResizeValidator={_this.props.moveResizeValidator}
                            onDrag={_this.props.itemDrag}
                            onDrop={_this.props.itemDrop}
                            onItemDoubleClick={_this.props.onItemDoubleClick}
                            onContextMenu={_this.props.onItemContextMenu}
                            onSelect={_this.props.itemSelect}
                            itemRenderer={_this.props.itemRenderer}
                            scrollRef={_this.props.scrollRef}
                        />
                    ))}
            </div>
        )
    }
}

Items.propTypes = {
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,

    canvasTimeStart: PropTypes.number.isRequired,
    canvasTimeEnd: PropTypes.number.isRequired,
    canvasWidth: PropTypes.number.isRequired,

    dragSnap: PropTypes.number,
    minResizeWidth: PropTypes.number,
    selectedItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    canChangeGroup: PropTypes.bool.isRequired,
    canMove: PropTypes.bool.isRequired,
    canResize: PropTypes.oneOf([true, false, 'left', 'right', 'both']),
    canSelect: PropTypes.bool,

    keys: PropTypes.object.isRequired,

    moveResizeValidator: PropTypes.func,
    itemSelect: PropTypes.func,
    itemDrag: PropTypes.func,
    itemDrop: PropTypes.func,
    itemResizing: PropTypes.func,
    itemResized: PropTypes.func,

    onItemDoubleClick: PropTypes.func,
    onItemContextMenu: PropTypes.func,

    itemRenderer: PropTypes.func,
    selected: PropTypes.array,

    dimensionItems: PropTypes.array,
    groupTops: PropTypes.array,
    useResizeHandle: PropTypes.bool,
    scrollRef: PropTypes.object
}

Items.defaultProps = {
    selected: []
}




class Sidebar extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
    shouldComponentUpdate(nextProps) {
        return !(
            nextProps.keys === this.props.keys &&
            nextProps.width === this.props.width &&
            nextProps.height === this.props.height &&
            arraysEqual(nextProps.groups, this.props.groups) &&
            arraysEqual(nextProps.groupHeights, this.props.groupHeights)
        )
    }

    renderGroupContent(group, isRightSidebar, groupTitleKey, groupRightTitleKey) {
        if (this.props.groupRenderer) {

            return React.createElement(this.props.groupRenderer, {
                group,
                isRightSidebar
            })
        } else {
            return _get(group, isRightSidebar ? groupRightTitleKey : groupTitleKey)
        }
    }

    render() {
        const { width, groupHeights, height, isRightSidebar } = this.props

        const { groupIdKey, groupTitleKey, groupRightTitleKey } = this.props.keys

        const sidebarStyle = {
            width: `${width}px`,
            height: `${height}px`
        }

        const groupsStyle = {
            width: `${width}px`
        }

        let groupLines = this.props.groups.map((group, index) => {
            const elementStyle = {
                height: `${groupHeights[index]}px`,
                lineHeight: `${groupHeights[index]}px`,
                borderColor: '#f3f3f3'
            }

            return (
                <div
                    key={_get(group, groupIdKey)}
                    className={
                        'rct-sidebar-row rct-sidebar-row-' + (index % 2 === 0 ? 'even' : 'odd')
                    }
                    style={elementStyle}
                >
                    {this.props.groupRenderer ? this.props.groupRenderer({ group }) : this.renderGroupContent(
                        group,
                        isRightSidebar,
                        groupTitleKey,
                        groupRightTitleKey
                    )}


                </div>
            )
        })

        return (
            <div
                className={'rct-sidebar' + (isRightSidebar ? ' rct-sidebar-right' : '')}
                style={sidebarStyle}
            >
                <div style={groupsStyle}>{groupLines}</div>
            </div>
        )
    }
}

Sidebar.propTypes = {
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    groupHeights: PropTypes.array.isRequired,
    keys: PropTypes.object.isRequired,
    groupRenderer: PropTypes.func,
    isRightSidebar: PropTypes.bool,
}



const staticStyles = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
}

class AnterosMarkerCanvasTemp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subscribeToMouseOver: this.handleMouseMoveSubscribe
        }
        autoBind(this);
    }

    handleMouseMove(evt) {
        if (this.subscription != null) {
            const { pageX } = evt
            const { left: containerLeft } = this.containerEl.getBoundingClientRect()
            const canvasX = pageX - containerLeft
            const date = this.props.getDateFromLeftOffsetPosition(canvasX)
            this.subscription({
                leftOffset: canvasX,
                date,
                isCursorOverCanvas: true
            })
        }
    }

    handleMouseLeave() {
        if (this.subscription != null) {
            this.subscription({ leftOffset: 0, date: 0, isCursorOverCanvas: false })
        }
    }

    handleMouseMoveSubscribe(sub) {
        this.subscription = sub;
        let _this = this;
        return () => {
            _this.subscription = null
        }
    }

    render() {
        return (
            <MarkerCanvasContext.Provider value={this.state}>
                <div
                    style={staticStyles}
                    onMouseMove={this.handleMouseMove}
                    onMouseLeave={this.handleMouseLeave}
                    ref={el => (this.containerEl = el)}
                >
                    <TimelineMarkersRenderer />
                    {this.props.children}
                </div>
            </MarkerCanvasContext.Provider>
        )
    }
}

AnterosMarkerCanvasTemp.propTypes = {
    getDateFromLeftOffsetPosition: PropTypes.func.isRequired,
    children: PropTypes.node
}

export const AnterosMarkerCanvas = props => (
    <TimelineStateContext.Consumer>
        {({ getDateFromLeftOffsetPosition }) => (
            <AnterosMarkerCanvasTemp
                getDateFromLeftOffsetPosition={getDateFromLeftOffsetPosition}
                {...props}
            />
        )}
    </TimelineStateContext.Consumer>
)

const MarkerCanvasContext = createReactContext({
    subscribeToMouseOver: () => {
        console.warn('"subscribeToMouseOver" default func is being used')
    }
});

const TimelineMarkersContext = createReactContext({
    markers: [],
    subscribeMarker: () => {
        console.warn('default subscribe marker used')
        return noop
    }
});

let _id = 0
const createId = () => {
    _id += 1
    return _id + 1
}

class TimelineMarkersProvider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            markers: [],
            subscribeMarker: this.handleSubscribeToMarker,
            updateMarker: this.handleUpdateMarker
        }

        autoBind(this);
    }


    handleSubscribeToMarker = newMarker => {
        newMarker = {
            ...newMarker,
            id: createId()
        }

        this.setState(state => {
            return {
                markers: [...state.markers, newMarker]
            }
        })
        return {
            unsubscribe: () => {
                this.setState(state => {
                    return {
                        markers: state.markers.filter(marker => marker.id !== newMarker.id)
                    }
                })
            },
            getMarker: () => {
                return newMarker
            }
        }
    }

    handleUpdateMarker = updateMarker => {
        const markerIndex = this.state.markers.findIndex(
            marker => marker.id === updateMarker.id
        )
        if (markerIndex < 0) return
        this.setState(state => {
            return {
                markers: [
                    ...state.markers.slice(0, markerIndex),
                    updateMarker,
                    ...state.markers.slice(markerIndex + 1)
                ]
            }
        })
    }



    render() {
        return <TimelineMarkersContext.Provider value={this.state}>{this.props.children}</TimelineMarkersContext.Provider>
    }
}

TimelineMarkersProvider.propTypes = {
    children: PropTypes.element.isRequired
}


const TimelineMarkersRenderer = () => {
    return (
        <TimelineStateContext.Consumer>
            {({ getLeftOffsetFromDate }) => (
                <TimelineMarkersContext.Consumer>
                    {({ markers }) => {
                        return markers.map(marker => {
                            switch (marker.type) {
                                case TimelineMarkerType.Today:
                                    return (
                                        <AnterosTodayMarkerImpl
                                            key={marker.id}
                                            getLeftOffsetFromDate={getLeftOffsetFromDate}
                                            renderer={marker.renderer}
                                            interval={marker.interval}
                                        />
                                    )
                                case TimelineMarkerType.Custom:
                                    return (
                                        <AnterosCustomMarkerImpl
                                            key={marker.id}
                                            renderer={marker.renderer}
                                            date={marker.date}
                                            getLeftOffsetFromDate={getLeftOffsetFromDate}
                                        />
                                    )
                                case TimelineMarkerType.Cursor:
                                    return (
                                        <AnterosCursorMarkerImpl
                                            key={marker.id}
                                            renderer={marker.renderer}
                                            getLeftOffsetFromDate={getLeftOffsetFromDate}
                                        />
                                    )
                                default:
                                    return null
                            }
                        })
                    }}
                </TimelineMarkersContext.Consumer>
            )}
        </TimelineStateContext.Consumer>
    )
}

const criticalStyles = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: 'black',
    pointerEvents: 'none'
}

const createMarkerStylesWithLeftOffset = leftOffset => ({
    ...criticalStyles,
    left: leftOffset
})

const createDefaultRenderer = dataTestidValue => {
    return function DefaultMarkerRenderer({ styles }) {
        return <div style={styles} data-testid={dataTestidValue} />
    }
}


class AnterosTodayMarkerImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: Date.now()
        }
        autoBind(this);
    }

    componentDidMount() {
        this.intervalToken = this.createIntervalUpdater(this.props.interval)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.interval !== this.props.interval) {
            clearInterval(this.intervalToken)
            this.intervalToken = this.createIntervalUpdater(this.props.interval)
        }
    }

    createIntervalUpdater(interval) {
        return setInterval(() => {
            this.setState({
                date: Date.now()
            });
        }, interval);
    }

    componentWillUnmount() {
        clearInterval(this.intervalToken)
    }

    render() {
        const { date } = this.state
        const leftOffset = this.props.getLeftOffsetFromDate(date)
        const styles = createMarkerStylesWithLeftOffset(leftOffset)
        return this.props.renderer({ styles, date })
    }
}

AnterosTodayMarkerImpl.propTypes = {
    getLeftOffsetFromDate: PropTypes.func.isRequired,
    renderer: PropTypes.func,
    interval: PropTypes.number.isRequired
}

AnterosTodayMarkerImpl.defaultProps = {
    renderer: createDefaultRenderer('default-today-line')
}

class AnterosCursorMarkerImplTemp extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        const { unsubscribe } = this.props.subscribeMarker({
            type: TimelineMarkerType.Cursor,
            renderer: this.props.children
        })
        this.unsubscribe = unsubscribe
    }

    componentWillUnmount() {
        if (this.unsubscribe != null) {
            this.unsubscribe()
            this.unsubscribe = null
        }
    }
    render() {
        return null
    }
}
AnterosCursorMarkerImplTemp.propTypes = {
    subscribeMarker: PropTypes.func.isRequired,
    children: PropTypes.func
}

const AnterosCursorMarkerImpl = props => {
    return (
        <TimelineMarkersContext.Consumer>
            {({ subscribeMarker }) => (
                <AnterosCursorMarkerImplTemp subscribeMarker={subscribeMarker} {...props} />
            )}
        </TimelineMarkersContext.Consumer>
    )
}



AnterosCursorMarkerImpl.displayName = 'AnterosCursorMarkerImpl';


class AnterosCustomMarkerImplTemp extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.date !== this.props.date && this.getMarker) {
            const marker = this.getMarker()
            this.props.updateMarker({ ...marker, date: this.props.date })
        }
    }

    componentDidMount() {
        const { unsubscribe, getMarker } = this.props.subscribeMarker({
            type: TimelineMarkerType.Custom,
            renderer: this.props.children,
            date: this.props.date
        })
        this.unsubscribe = unsubscribe
        this.getMarker = getMarker
    }

    componentWillUnmount() {
        if (this.unsubscribe != null) {
            this.unsubscribe()
            this.unsubscribe = null
        }
    }

    render() {
        return null
    }
}

AnterosCustomMarkerImplTemp.propTypes = {
    subscribeMarker: PropTypes.func.isRequired,
    updateMarker: PropTypes.func.isRequired,
    children: PropTypes.func,
    date: PropTypes.number.isRequired
}

const AnterosCustomMarkerImpl = props => {
    return (
        <TimelineMarkersContext.Consumer>
            {({ subscribeMarker, updateMarker }) => (
                <AnterosCustomMarkerImplTemp
                    subscribeMarker={subscribeMarker}
                    updateMarker={updateMarker}
                    {...props}
                />
            )}
        </TimelineMarkersContext.Consumer>
    )
}
AnterosCustomMarkerImpl.displayName = 'AnterosCustomMarker';

class AnterosTodayMarkerTemp extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        const { unsubscribe, getMarker } = this.props.subscribeMarker({
            type: TimelineMarkerType.Today,
            renderer: this.props.children,
            interval: this.props.interval
        })
        this.unsubscribe = unsubscribe
        this.getMarker = getMarker
    }

    componentWillUnmount() {
        if (this.unsubscribe != null) {
            this.unsubscribe()
            this.unsubscribe = null
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.interval !== this.props.interval && this.getMarker) {
            const marker = this.getMarker()
            this.props.updateMarker({
                ...marker,
                interval: this.props.interval,
            })
        }
    }

    render() {
        return null
    }
}

AnterosTodayMarkerTemp.propTypes = {
    subscribeMarker: PropTypes.func.isRequired,
    updateMarker: PropTypes.func.isRequired,
    interval: PropTypes.number,
    children: PropTypes.func
}

AnterosTodayMarkerTemp.defaultProps = {
    interval: 1000 * 10
}

const AnterosTodayMarker = props => {
    return (
        <TimelineMarkersContext.Consumer>
            {({ subscribeMarker, updateMarker }) => (
                <AnterosTodayMarkerTemp subscribeMarker={subscribeMarker} updateMarker={updateMarker} {...props} />
            )}
        </TimelineMarkersContext.Consumer>
    )
}

AnterosTodayMarker.displayName = 'AnterosTodayMarker'



class GroupRow extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    render() {
        const {
            onContextMenu,
            onDoubleClick,
            isEvenRow,
            style,
            onClick,
            clickTolerance,
            horizontalLineClassNamesForGroup,
            group
        } = this.props

        let classNamesForGroup = [];
        if (horizontalLineClassNamesForGroup) {
            classNamesForGroup = horizontalLineClassNamesForGroup(group);
        }

        return (
            <PreventClickOnDrag clickTolerance={clickTolerance} onClick={onClick}>
                <div
                    onContextMenu={onContextMenu}
                    onDoubleClick={onDoubleClick}
                    className={(isEvenRow ? 'rct-hl-even ' : 'rct-hl-odd ') + (classNamesForGroup ? classNamesForGroup.join(' ') : '')}
                    style={style}
                />
            </PreventClickOnDrag>
        )
    }
}

GroupRow.propTypes = {
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    onContextMenu: PropTypes.func.isRequired,
    isEvenRow: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
    clickTolerance: PropTypes.number.isRequired,
    group: PropTypes.object.isRequired,
    horizontalLineClassNamesForGroup: PropTypes.func
}

class GroupRows extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    shouldComponentUpdate(nextProps) {
        return !(
            nextProps.canvasWidth === this.props.canvasWidth &&
            nextProps.lineCount === this.props.lineCount &&
            nextProps.groupHeights === this.props.groupHeights &&
            nextProps.groups === this.props.groups
        )
    }

    render() {
        const {
            canvasWidth,
            lineCount,
            groupHeights,
            onRowClick,
            onRowDoubleClick,
            clickTolerance,
            groups,
            horizontalLineClassNamesForGroup,
            onRowContextClick,
        } = this.props
        let lines = []

        for (let i = 0; i < lineCount; i++) {
            lines.push(
                <GroupRow
                    clickTolerance={clickTolerance}
                    onContextMenu={evt => onRowContextClick(evt, i)}
                    onClick={evt => onRowClick(evt, i)}
                    onDoubleClick={evt => onRowDoubleClick(evt, i)}
                    key={`horizontal-line-${i}`}
                    isEvenRow={i % 2 === 0}
                    group={groups[i]}
                    horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
                    style={{
                        width: `${canvasWidth}px`,
                        height: `${groupHeights[i]}px`,
                        borderColor: '#f5f5f5'
                    }}
                />
            )
        }

        return <div className="rct-horizontal-lines">{lines}</div>
    }
}

GroupRows.propTypes = {
    canvasWidth: PropTypes.number.isRequired,
    lineCount: PropTypes.number.isRequired,
    groupHeights: PropTypes.array.isRequired,
    onRowClick: PropTypes.func.isRequired,
    onRowDoubleClick: PropTypes.func.isRequired,
    clickTolerance: PropTypes.number.isRequired,
    groups: PropTypes.array.isRequired,
    horizontalLineClassNamesForGroup: PropTypes.func,
    onRowContextClick: PropTypes.func.isRequired,
}


class ScrollElement extends Component {
    constructor() {
        super()
        this.state = {
            isDragging: false
        }
        autoBind(this);
    }

    handleScroll() {
        const scrollX = this.scrollComponent.scrollLeft
        this.props.onScroll(scrollX)
    }

    refHandler(el) {
        this.scrollComponent = el
        this.props.scrollRef(el)
        if (el) {
            el.addEventListener('wheel', this.handleWheel, { passive: false });
        }
    }


    handleWheel(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) {
            e.preventDefault()
            const parentPosition = getParentPosition(e.currentTarget)
            const xPosition = e.clientX - parentPosition.x;
            const speed = e.ctrlKey ? 10 : e.metaKey ? 3 : 1
            this.props.onWheelZoom(speed, xPosition, e.deltaY)
        } else if (e.shiftKey) {
            e.preventDefault()
            this.props.onScroll(this.scrollComponent.scrollLeft + (e.deltaY || e.deltaX))
        }
    }

    handleMouseDown(e) {
        if (e.button === 0) {
            this.dragStartPosition = e.pageX
            this.dragLastPosition = e.pageX
            this.setState({
                isDragging: true
            })
        }
    }

    handleMouseMove(e) {
        if (this.state.isDragging && !this.props.isInteractingWithItem) {
            this.props.onScroll(this.scrollComponent.scrollLeft + this.dragLastPosition - e.pageX)
            this.dragLastPosition = e.pageX
        }
    }

    handleMouseUp(event) {
        this.dragStartPosition = null
        this.dragLastPosition = null

        this.setState({
            isDragging: false
        })
    }

    handleMouseLeave(event) {
        this.dragStartPosition = null
        this.dragLastPosition = null
        this.setState({
            isDragging: false
        })
    }

    handleTouchStart(e) {
        if (e.touches.length === 2) {
            e.preventDefault()

            this.lastTouchDistance = Math.abs(
                e.touches[0].screenX - e.touches[1].screenX
            )
            this.singleTouchStart = null
            this.lastSingleTouch = null
        } else if (e.touches.length === 1) {
            e.preventDefault()

            let x = e.touches[0].clientX
            let y = e.touches[0].clientY

            this.lastTouchDistance = null
            this.singleTouchStart = { x: x, y: y, screenY: window.pageYOffset }
            this.lastSingleTouch = { x: x, y: y, screenY: window.pageYOffset }
        }
    }

    handleTouchMove(e) {
        const { isInteractingWithItem, width, onZoom } = this.props
        if (isInteractingWithItem) {
            e.preventDefault()
            return
        }
        if (this.lastTouchDistance && e.touches.length === 2) {
            e.preventDefault()
            let touchDistance = Math.abs(e.touches[0].screenX - e.touches[1].screenX)
            let parentPosition = getParentPosition(e.currentTarget)
            let xPosition =
                (e.touches[0].screenX + e.touches[1].screenX) / 2 - parentPosition.x
            if (touchDistance !== 0 && this.lastTouchDistance !== 0) {
                onZoom(this.lastTouchDistance / touchDistance, xPosition / width)
                this.lastTouchDistance = touchDistance
            }
        } else if (this.lastSingleTouch && e.touches.length === 1) {
            e.preventDefault()
            let x = e.touches[0].clientX
            let y = e.touches[0].clientY
            let deltaX = x - this.lastSingleTouch.x
            let deltaX0 = x - this.singleTouchStart.x
            let deltaY0 = y - this.singleTouchStart.y
            this.lastSingleTouch = { x: x, y: y }
            let moveX = Math.abs(deltaX0) * 3 > Math.abs(deltaY0)
            let moveY = Math.abs(deltaY0) * 3 > Math.abs(deltaX0)
            if (deltaX !== 0 && moveX) {
                this.props.onScroll(this.scrollComponent.scrollLeft - deltaX)
            }
            if (moveY) {
                window.scrollTo(
                    window.pageXOffset,
                    this.singleTouchStart.screenY - deltaY0
                )
            }
        }
    }

    handleTouchEnd() {
        if (this.lastTouchDistance) {
            this.lastTouchDistance = null
        }
        if (this.lastSingleTouch) {
            this.lastSingleTouch = null
            this.singleTouchStart = null
        }
    }

    componentWillUnmount() {
        if (this.scrollComponent) {
            this.scrollComponent.removeEventListener('wheel', this.handleWheel);
        }
    }

    render() {
        const { width, height, children } = this.props
        const { isDragging } = this.state

        const scrollComponentStyle = {
            width: `${width}px`,
            height: `${height + 20}px`, //20px to push the scroll element down off screen...?
            cursor: isDragging ? 'move' : 'default',
            position: 'relative'
        }

        return (
            <div
                ref={this.refHandler}
                data-testid="scroll-element"
                className="rct-scroll"
                style={scrollComponentStyle}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseLeave}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
                onScroll={this.handleScroll}
            >
                {children}
            </div>

        )
    }
}

ScrollElement.propTypes = {
    children: PropTypes.element.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    traditionalZoom: PropTypes.bool.isRequired,
    scrollRef: PropTypes.func.isRequired,
    isInteractingWithItem: PropTypes.bool.isRequired,
    onZoom: PropTypes.func.isRequired,
    onWheelZoom: PropTypes.func.isRequired,
    onScroll: PropTypes.func.isRequired
}


const TimelineStateContext = createReactContext({
    getTimelineState: () => {
        console.warn('"getTimelineState" default func is being used')
    },
    getLeftOffsetFromDate: () => {
        console.warn('"getLeftOffsetFromDate" default func is being used')
    },
    getDateFromLeftOffsetPosition: () => {
        console.warn('"getDateFromLeftOffsetPosition" default func is being used')
    },
    showPeriod: () => {
        console.warn('"showPeriod" default func is being used')
    }
})

export class TimelineStateProvider extends React.Component {
    constructor(props) {
        super(props)
        this.getTimelineState = this.getTimelineState.bind(this);
        this.state = {
            timelineContext: {
                getTimelineState: this.getTimelineState,
                getLeftOffsetFromDate: this.getLeftOffsetFromDate,
                getDateFromLeftOffsetPosition: this.getDateFromLeftOffsetPosition,
                showPeriod: this.props.showPeriod,
            }
        }

        autoBind(this);
    }

    getTimelineState() {
        const {
            visibleTimeStart,
            visibleTimeEnd,
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            timelineUnit,
            timelineWidth,
        } = this.props;
        return {
            visibleTimeStart,
            visibleTimeEnd,
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            timelineUnit,
            timelineWidth,
        }
    }

    getLeftOffsetFromDate = (date) => {
        const { canvasTimeStart, canvasTimeEnd, canvasWidth } = this.props
        return calculateXPositionForTime(
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            date
        )
    }

    getDateFromLeftOffsetPosition = (leftOffset) => {
        const { canvasTimeStart, canvasTimeEnd, canvasWidth } = this.props
        return calculateTimeForXPosition(
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            leftOffset
        )
    }

    render() {
        return (
            <TimelineStateContext.Provider value={this.state.timelineContext}>
                {this.props.children}
            </TimelineStateContext.Provider>
        )
    }
}

TimelineStateProvider.propTypes = {
    children: PropTypes.element.isRequired,
    visibleTimeStart: PropTypes.number.isRequired,
    visibleTimeEnd: PropTypes.number.isRequired,
    canvasTimeStart: PropTypes.number.isRequired,
    canvasTimeEnd: PropTypes.number.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    showPeriod: PropTypes.func.isRequired,
    timelineUnit: PropTypes.string.isRequired,
    timelineWidth: PropTypes.number.isRequired,
}

class AnterosCursorMarkerTemp extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        const { unsubscribe } = this.props.subscribeMarker({
            type: TimelineMarkerType.Cursor,
            renderer: this.props.children
        })
        this.unsubscribe = unsubscribe
    }

    componentWillUnmount() {
        if (this.unsubscribe != null) {
            this.unsubscribe()
            this.unsubscribe = null
        }
    }
    render() {
        return null
    }
}

AnterosCursorMarkerTemp.propTypes = {
    subscribeMarker: PropTypes.func.isRequired,
    children: PropTypes.func
}


export const AnterosCursorMarker = props => {
    return (
        <TimelineMarkersContext.Consumer>
            {({ subscribeMarker }) => (
                <AnterosCursorMarkerTemp subscribeMarker={subscribeMarker} {...props} />
            )}
        </TimelineMarkersContext.Consumer>
    )
}

AnterosCursorMarker.displayName = 'AnterosCursorMarker'

class AnterosCustomMarkerTemp extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.date !== this.props.date && this.getMarker) {
            const marker = this.getMarker()
            this.props.updateMarker({ ...marker, date: this.props.date })
        }
    }

    componentDidMount() {
        const { unsubscribe, getMarker } = this.props.subscribeMarker({
            type: TimelineMarkerType.Custom,
            renderer: this.props.children,
            date: this.props.date
        })
        this.unsubscribe = unsubscribe
        this.getMarker = getMarker
    }

    componentWillUnmount() {
        if (this.unsubscribe != null) {
            this.unsubscribe()
            this.unsubscribe = null
        }
    }

    render() {
        return null
    }
}

AnterosCustomMarkerTemp.propTypes = {
    subscribeMarker: PropTypes.func.isRequired,
    updateMarker: PropTypes.func.isRequired,
    children: PropTypes.func,
    date: PropTypes.number.isRequired
}


export const AnterosCustomMarker = props => {
    return (
        <TimelineMarkersContext.Consumer>
            {({ subscribeMarker, updateMarker }) => (
                <AnterosCustomMarkerTemp
                    subscribeMarker={subscribeMarker}
                    updateMarker={updateMarker}
                    {...props}
                />
            )}
        </TimelineMarkersContext.Consumer>
    )
}

AnterosCustomMarker.displayName = 'AnterosCustomMarker'


export const AnterosTimelineMarkers = props => {
    return props.children || null
}
