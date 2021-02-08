import { PureComponent, Component } from 'react';
import * as React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Grid, AutoSizer, defaultCellRangeRenderer } from 'react-virtualized';
import moment from 'moment';
import interact from 'interactjs';
import _ from 'lodash';
// startsWith polyfill for IE11 support
import 'core-js/fn/string/starts-with';

class Marker extends PureComponent {
    render() {
        const { height, left, top } = this.props;
        return <div className="rct9k-marker-overlay" style={{ height, left, top }} />;
    };
}

Marker.propTypes = {
    height: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired
};


class DefaultItemRenderer extends PureComponent {
    render() {
        const { item, ...rest } = this.props;
        return (
            <span {...rest}>
                <span className="rct9k-item-renderer-inner">{item.title}</span>
            </span>
        );
    }
}

/**
 * Default group (row) renderer class
 * @param {object} props - Component props
 * @param {object} props.group - The group to be rendered
 * @param {string} props.group.title - The group's title
 * @param {string} props.group.id - The group's id
 * @param {?...object} props.rest - Any other arguments for the span tag
 */
class DefaultGroupRenderer extends PureComponent {
    render() {
        const { group, ...rest } = this.props;
        return (
            <span data-group-index={group.id} {...rest}>
                <span>{group.title}</span>
            </span>
        );
    }
}


const timebarFormat = {
    majorLabels: {
        minute: {
            short: 'mm', //01
            long: 'HH:mm' //12:01
        },
        hour: {
            short: 'HH', //13
            long: 'HH:mm' //13:00
        },
        day: {
            short: 'Do', //1st
            long: 'ddd, LL' //Sun, July 3, 2018
        },
        month: {
            short: 'MMM', //Jan
            long: 'MMMM YYYY' //January 2018
        },
        year: {
            short: 'YYYY', //2018
            long: 'YYYY' //2018
        }
    },
    minorLabels: {
        minute: {
            short: 'mm', //01
            long: 'HH:mm' //12:01
        },
        hour: {
            short: 'HH', //13
            long: 'HH:mm' //13:00
        },
        day: {
            short: 'D', //1
            long: 'ddd Do' //Sun 1st
        },
        month: {
            short: 'MM', //02
            long: 'MMMM' //January
        },
        year: {
            short: 'YYYY', //2018
            long: 'YYYY' //2018
        }
    }
};

/**
 * Add int pixels to a css style (left or top generally)
 * @param  {string} style Style string in css format
 * @param  {number} diff The pixels to add/subtract
 * @returns {string} Style as string for css use
 */
function sumStyle(style, diff) {
    return intToPix(pixToInt(style) + diff);
}
/**
 * Converts a pixel string to an int
 * @param  {string} pix Pixel string
 * @return {number} Integer value of the pixel string
 */
function pixToInt(pix) {
    return parseInt(pix.replace('px', ''));
}
/**
 * Convert integer to pixel string.
 * If not an integer the input is returned as is
 * @param  {number} int Integer value
 * @returns {string} Pixel string
 */
function intToPix(int) {
    if (int === Number(int)) return int + 'px';
    return int;
}

/**
 * Render all items in a row
 * @external {moment} http://momentjs.com/
 * @param  {Object[]} items List of items to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 */
function rowItemsRenderer(items, vis_start, vis_end, total_width, itemHeight, itemRenderer, selectedItems = []) {
    const start_end_min = vis_end.diff(vis_start, 'minutes');
    const pixels_per_min = total_width / start_end_min;
    let filtered_items = _.sortBy(
        _.filter(items, i => {
            // if end not before window && start not after window
            return !i.end.isBefore(vis_start) && !i.start.isAfter(vis_end);
        }),
        i => -i.start.unix()
    ); // sorted in reverse order as we iterate over the array backwards
    let displayItems = [];
    let rowOffset = 0;
    while (filtered_items.length > 0) {
        let lastEnd = null;
        for (let i = filtered_items.length - 1; i >= 0; i--) {
            if (lastEnd === null || filtered_items[i].start >= lastEnd) {
                let item = _.clone(filtered_items[i]);
                item.rowOffset = rowOffset;
                displayItems.push(item);
                filtered_items.splice(i, 1);
                lastEnd = item.end;
            }
        }
        rowOffset++;
    }
    return _.map(displayItems, i => {
        const { color } = i;
        const Comp = itemRenderer;
        let top = itemHeight * i['rowOffset'];
        let item_offset_mins = i.start.diff(vis_start, 'minutes');
        let item_duration_mins = i.end.diff(i.start, 'minutes');
        let left = Math.round(item_offset_mins * pixels_per_min);
        let width = Math.round(item_duration_mins * pixels_per_min);
        let compClassnames = 'rct9k-items-inner';
        let outerClassnames = 'rct9k-items-outer item_draggable';
        let style = { backgroundColor: color };
        let isSelected = selectedItems.indexOf(Number(i.key)) > -1;

        if (isSelected) {
            compClassnames += ' rct9k-items-selected';
            outerClassnames += ' rct9k-items-outer-selected';
            style = {};
        }

        return (
            <span
                key={i.key}
                data-item-index={i.key}
                className={outerClassnames}
                style={{ left, width, top, backgroundColor: 'transparent' }}>
                <Comp key={i.key} item={i} className={compClassnames} style={style} />
            </span>
        );
    });
}

/**
 * Render row layers
 * @param  {Object[]} layers List of layers to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 * @param  {number} itemHeight The layer height in px
 */
function rowLayerRenderer(layers, vis_start, vis_end, total_width, itemHeight) {
    const start_end_min = vis_end.diff(vis_start, 'minutes');
    const pixels_per_min = total_width / start_end_min;
    let filtered_items = _.sortBy(
        _.filter(layers, i => {
            return !i.end.isBefore(vis_start) && !i.start.isAfter(vis_end);
        }),
        i => -i.start.unix()
    ); // sorted in reverse order as we iterate over the array backwards
    let displayItems = [];
    let rowOffset = 0;
    while (filtered_items.length > 0) {
        let lastEnd = null;
        for (let i = filtered_items.length - 1; i >= 0; i--) {
            if (lastEnd === null || filtered_items[i].start >= lastEnd) {
                let item = _.clone(filtered_items[i]);
                item.rowOffset = rowOffset;
                displayItems.push(item);
                filtered_items.splice(i, 1);
                lastEnd = item.end;
            }
        }
        rowOffset++;
    }
    return _.map(displayItems, i => {
        const { style, rowNumber } = i;
        let top = itemHeight * i['rowOffset'];
        let item_offset_mins = i.start.diff(vis_start, 'minutes');
        let item_duration_mins = i.end.diff(i.start, 'minutes');
        let left = Math.round(item_offset_mins * pixels_per_min);
        let width = Math.round(item_duration_mins * pixels_per_min);
        let height = itemHeight - (rowNumber === 0 ? 2 : 1); // for border
        let outerClassnames = 'rct9k-row-layer';

        return (
            <div
                key={`r-${rowNumber}-${i.start.unix()}`}
                data-item-index={i.key}
                className={outerClassnames}
                style={{ ...style, left, width, top, height }}
            />
        );
    });
}
/**
 * Gets the row number for a given x and y pixel location
 * @param  {number} x The x coordinate of the pixel location
 * @param  {number} y The y coordinate of the pixel location
 * @param  {Object} topDiv Div to search under
 * @returns {number} The row number
 */
function getNearestRowHeight(x, y, topDiv = document) {
    let elementsAtPixel = document.elementsFromPoint(x, y);
    let targetRow = _.find(elementsAtPixel, e => {
        const inDiv = topDiv.contains(e);
        return inDiv && e.hasAttribute('data-row-index');
    });
    return targetRow ? targetRow.getAttribute('data-row-index') : 0;
}

/**
 * Use to find the height of a row, given a set of items
 * @param  {Object[]} items List of items
 * @returns {number} Max row height
 */
function getMaxOverlappingItems(items) {
    let max = 0;
    let sorted_items = _.sortBy(items, i => -i.start.unix());

    while (sorted_items.length > 0) {
        let lastEnd = null;
        for (let i = sorted_items.length - 1; i >= 0; i--) {
            if (lastEnd === null || sorted_items[i].start >= lastEnd) {
                lastEnd = sorted_items[i].end;
                sorted_items.splice(i, 1);
            }
        }
        max++;
    }
    return Math.max(max, 1);
}

/**
 * Snaps a moment object to the given resolution
 * @param {moment} time The moment to snap
 * @param {number} snapSeconds The snap time in seconds
 * @returns {moment} Snapped moment
 */
function timeSnap(time, snapSeconds) {
    if (snapSeconds === 0) {
        const newTime = time.clone();
        newTime.set('millisecond', 0);
        return newTime;
    }
    const newUnix = Math.round(time.unix() / snapSeconds) * snapSeconds;
    return moment(newUnix * 1000);
}

/**
 * Get the pixels per minute
 * @param {moment} vis_start The moment specifying the start of the visible timeline range
 * @param {moment} vis_end The moment specifying the end of the visible timeline range
 * @param {number} total_width The width of the timeline in pixels
 * @returns {float} The pixels per minute
 */
function pixelsPerMinute(vis_start, vis_end, total_width) {
    const start_end_min = vis_end.diff(vis_start, 'minutes');
    return total_width / start_end_min;
}

/**
 *
 * @param {number} delta the delta distance in pixels
 * @param {moment} vis_start the visible start of the timeline
 * @param {moment} vis_end  the visible end of the timeline
 * @param {number} total_width  the pixel width of the timeline
 * @param {number} snapMinutes the number of minutes to snap to
 */
function getSnapPixelFromDelta(delta, vis_start, vis_end, total_width, snapMinutes = 0) {
    const pixelsPerSnapSegment = pixelsPerMinute(vis_start, vis_end, total_width) * snapMinutes;
    return Math.round(delta / pixelsPerSnapSegment) * pixelsPerSnapSegment;
}

/**
 * Get the time at a pixel location
 * @param {number} pixel_location the pixel location (generally from left css style)
 * @param {moment} vis_start The visible start of the timeline
 * @param {moment} vis_end The visible end of the timeline
 * @param {number} total_width The pixel width of the timeline (row portion)
 * @param {number} snapMinutes The snap resolution (in mins)
 * @returns {moment} Moment object
 */
function getTimeAtPixel(pixel_location, vis_start, vis_end, total_width, snapMinutes = 0) {
    let min_offset = pixel_location / pixelsPerMinute(vis_start, vis_end, total_width);
    let timeAtPix = vis_start.clone().add(min_offset, 'minutes');
    if (snapMinutes !== 0) timeAtPix = timeSnap(timeAtPix, snapMinutes * 60);
    return timeAtPix;
}
/**
 * Get the pixel location at a specific time
 * @param  {objects} time The time (moment) object
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width The width in pixels of the grid
 * @returns {number} The pixel offset
 */
function getPixelAtTime(time, vis_start, vis_end, total_width) {
    const min_from_start = time.diff(vis_start, 'minutes');
    return min_from_start * pixelsPerMinute(vis_start, vis_end, total_width);
}
/**
 * Returns the duration from the {@link vis_start}
 * @param  {number} pixels
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width The width in pixels of the grid
 * @returns {moment} Moment duration
 */
function getDurationFromPixels(pixels, vis_start, vis_end, total_width) {
    const start_end_min = vis_end.diff(vis_start, 'minutes');
    if (start_end_min === 0) return moment.duration(0, 'minutes');
    const pixels_per_min = total_width / start_end_min;
    let mins = pixels / pixels_per_min;
    return moment.duration(mins, 'minutes');
}





/**
 * AnterosResourceTimeline class
 * @reactProps {!number} items - this is prop1
 * @reactProps {string} prop2 - this is prop2
 */
export default class AnterosResourceTimeline extends React.Component {
    constructor(props) {
        super(props);
        this.selecting = false;
        this.state = { selection: [], cursorTime: null };
        this.setTimeMap(this.props.items);

        this.cellRenderer = this.cellRenderer.bind(this);
        this.rowHeight = this.rowHeight.bind(this);
        this.setTimeMap = this.setTimeMap.bind(this);
        this.getItem = this.getItem.bind(this);
        this.changeGroup = this.changeGroup.bind(this);
        this.setSelection = this.setSelection.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.getTimelineWidth = this.getTimelineWidth.bind(this);
        this.itemFromElement = this.itemFromElement.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.grid_ref_callback = this.grid_ref_callback.bind(this);
        this.select_ref_callback = this.select_ref_callback.bind(this);
        this.throttledMouseMoveFunc = _.throttle(this.throttledMouseMoveFunc.bind(this), 20);
        this.mouseMoveFunc = this.mouseMoveFunc.bind(this);
        this.getCursor = this.getCursor.bind(this);

        const canSelect = AnterosResourceTimeline.isBitSet(AnterosResourceTimeline.TIMELINE_MODES.SELECT, this.props.timelineMode);
        const canDrag = AnterosResourceTimeline.isBitSet(AnterosResourceTimeline.TIMELINE_MODES.DRAG, this.props.timelineMode);
        const canResize = AnterosResourceTimeline.isBitSet(AnterosResourceTimeline.TIMELINE_MODES.RESIZE, this.props.timelineMode);
        this.setUpDragging(canSelect, canDrag, canResize);
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillReceiveProps(nextProps) {
        this.setTimeMap(nextProps.items, nextProps.startDate, nextProps.endDate);
        // @TODO
        // investigate if we need this, only added to refresh the grid
        // when double click -> add an item
        this.refreshGrid();
    }

    componentWillUnmount() {
        if (this._itemInteractable) this._itemInteractable.unset();
        if (this._selectRectangleInteractable) this._selectRectangleInteractable.unset();

        window.removeEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState) {
        const { timelineMode, selectedItems } = this.props;
        const selectionChange = !_.isEqual(prevProps.selectedItems, selectedItems);
        const timelineModeChange = !_.isEqual(prevProps.timelineMode, timelineMode);

        if (timelineModeChange || selectionChange) {
            const canSelect = AnterosResourceTimeline.isBitSet(AnterosResourceTimeline.TIMELINE_MODES.SELECT, timelineMode);
            const canDrag = AnterosResourceTimeline.isBitSet(AnterosResourceTimeline.TIMELINE_MODES.DRAG, timelineMode);
            const canResize = AnterosResourceTimeline.isBitSet(AnterosResourceTimeline.TIMELINE_MODES.RESIZE, timelineMode);
            this.setUpDragging(canSelect, canDrag, canResize);
        }
    }

    /**
     * Re-renders the grid when the window or container is resized
     */
    updateDimensions() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.forceUpdate();
            this._grid.recomputeGridSize();
        }, 100);
    }

    /**
     * Sets the internal maps used by the component for looking up item & row data
     * @param {Object[]} items The items to be displayed in the grid
     * @param {moment} startDate The visible start date of the timeline
     * @param {moment} endDate The visible end date of the timeline
     */
    setTimeMap(items, startDate, endDate) {
        if (!startDate || !endDate) {
            startDate = this.props.startDate;
            endDate = this.props.endDate;
        }
        this.itemRowMap = {}; // timeline elements (key) => (rowNo).
        this.rowItemMap = {}; // (rowNo) => timeline elements
        this.rowHeightCache = {}; // (rowNo) => max number of stacked items
        let visibleItems = _.filter(items, i => {
            return i.end > startDate && i.start < endDate;
        });
        let itemRows = _.groupBy(visibleItems, 'row');
        _.forEach(itemRows, (visibleItems, row) => {
            const rowInt = parseInt(row);
            if (this.rowItemMap[rowInt] === undefined) this.rowItemMap[rowInt] = [];
            _.forEach(visibleItems, item => {
                this.itemRowMap[item.key] = rowInt;
                this.rowItemMap[rowInt].push(item);
            });
            this.rowHeightCache[rowInt] = getMaxOverlappingItems(visibleItems);
        });
    }

    /**
     * Returns an item given its DOM element
     * @param {Object} e the DOM element of the item
     * @return {Object} Item details
     * @prop {number|string} index The item's index
     * @prop {number} rowNo The row number the item is in
     * @prop {number} itemIndex Not really used - gets the index of the item in the row map
     * @prop {Object} item The provided item object
     */
    itemFromElement(e) {
        const index = e.getAttribute('data-item-index');
        const rowNo = this.itemRowMap[index];
        const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == index);
        const item = this.rowItemMap[rowNo][itemIndex];

        return { index, rowNo, itemIndex, item };
    }

    /**
     * Gets an item given its ID
     * @param {number} id item id
     * @return {Object} Item object
     */
    getItem(id) {
        // This is quite stupid and shouldn't really be needed
        const rowNo = this.itemRowMap[id];
        const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == id);
        return this.rowItemMap[rowNo][itemIndex];
    }

    /**
     * Move an item from one row to another
     * @param {object} item The item object whose groups is to be changed
     * @param {number} curRow The item's current row index
     * @param {number} newRow The item's new row index
     */
    changeGroup(item, curRow, newRow) {
        item.row = newRow;
        this.itemRowMap[item.key] = newRow;
        this.rowItemMap[curRow] = this.rowItemMap[curRow].filter(i => i.key !== item.key);
        this.rowItemMap[newRow].push(item);
    }

    /**
     * Set the currently selected time ranges (for the timebar to display)
     * @param {Object[]} selections Of the form `[[start, end], [start, end], ...]`
     */
    setSelection(selections) {
        let newSelection = _.map(selections, s => {
            return { start: s[0].clone(), end: s[1].clone() };
        });
        this.setState({ selection: newSelection });
    }

    /**
     * Clears the currently selected time range state
     */
    clearSelection() {
        this.setState({ selection: [] });
    }

    /**
     * Get the width of the timeline NOT including the left group list
     * @param {?number} totalWidth Total timeline width. If not supplied we use the timeline ref
     * @returns {number} The width in pixels
     */
    getTimelineWidth(totalWidth) {
        const { groupOffset } = this.props;
        if (totalWidth !== undefined) return totalWidth - groupOffset;
        return this._grid.props.width - groupOffset;
    }

    /**
     * re-computes the grid's row sizes
     * @param {Object?} config Config to pass wo react-virtualized's compute func
     */
    refreshGrid = (config = {}) => {
        this._grid.recomputeGridSize(config);
    };

    setUpDragging(canSelect, canDrag, canResize) {
        const topDivClassId = `rct9k-id-${this.props.componentId}`;
        const selectedItemSelector = '.rct9k-items-outer-selected';
        if (this._itemInteractable) this._itemInteractable.unset();
        if (this._selectRectangleInteractable) this._selectRectangleInteractable.unset();

        this._itemInteractable = interact(`.${topDivClassId} .item_draggable`);
        this._selectRectangleInteractable = interact(`.${topDivClassId} .parent-div`);

        this._itemInteractable.on('tap', e => {
            this._handleItemRowEvent(e, this.props.onItemClick, this.props.onRowClick);
        });

        if (canDrag) {
            this._itemInteractable
                .draggable({
                    enabled: true,
                    allowFrom: selectedItemSelector,
                    restrict: {
                        restriction: `.${topDivClassId}`,
                        elementRect: { left: 0, right: 1, top: 0, bottom: 1 }
                    }
                })
                .on('dragstart', e => {
                    let selections = [];
                    const animatedItems = this.props.onInteraction(
                        AnterosResourceTimeline.changeTypes.dragStart,
                        null,
                        this.props.selectedItems
                    );

                    _.forEach(animatedItems, id => {
                        let domItem = this._gridDomNode.querySelector("span[data-item-index='" + id + "'");
                        if (domItem) {
                            selections.push([this.getItem(id).start, this.getItem(id).end]);
                            domItem.setAttribute('isDragging', 'True');
                            domItem.setAttribute('drag-x', 0);
                            domItem.setAttribute('drag-y', 0);
                            domItem.style['z-index'] = 4;
                        }
                    });
                    this.setSelection(selections);
                })
                .on('dragmove', e => {
                    const target = e.target;
                    let animatedItems = this._gridDomNode.querySelectorAll("span[isDragging='True'") || [];

                    let dx = (parseFloat(target.getAttribute('drag-x')) || 0) + e.dx;
                    let dy = (parseFloat(target.getAttribute('drag-y')) || 0) + e.dy;
                    let selections = [];

                    // Snap the movement to the current snap interval
                    const snapDx = getSnapPixelFromDelta(
                        dx,
                        this.props.startDate,
                        this.props.endDate,
                        this.getTimelineWidth(),
                        this.props.snapMinutes
                    );

                    _.forEach(animatedItems, domItem => {
                        const { item } = this.itemFromElement(domItem);
                        let itemDuration = item.end.diff(item.start);
                        let newPixelOffset = pixToInt(domItem.style.left) + snapDx;
                        let newStart = getTimeAtPixel(
                            newPixelOffset,
                            this.props.startDate,
                            this.props.endDate,
                            this.getTimelineWidth(),
                            this.props.snapMinutes
                        );

                        let newEnd = newStart.clone().add(itemDuration);
                        selections.push([newStart, newEnd]);

                        // Translate the new start time back to pixels, so we can animate the snap
                        domItem.style.webkitTransform = domItem.style.transform = 'translate(' + snapDx + 'px, ' + dy + 'px)';
                    });

                    target.setAttribute('drag-x', dx);
                    target.setAttribute('drag-y', dy);

                    this.setSelection(selections);
                })
                .on('dragend', e => {
                    const { item, rowNo } = this.itemFromElement(e.target);
                    let animatedItems = this._gridDomNode.querySelectorAll("span[isDragging='True'") || [];

                    this.setSelection([[item.start, item.end]]);
                    this.clearSelection();

                    // Change row
                    // console.log('From row', rowNo);
                    let newRow = getNearestRowHeight(e.clientX, e.clientY);
                    // console.log('To row', newRow);

                    let rowChangeDelta = newRow - rowNo;
                    // Update time
                    let newPixelOffset = pixToInt(e.target.style.left) + (parseFloat(e.target.getAttribute('drag-x')) || 0);
                    let newStart = getTimeAtPixel(
                        newPixelOffset,
                        this.props.startDate,
                        this.props.endDate,
                        this.getTimelineWidth(),
                        this.props.snapMinutes
                    );

                    const timeDelta = newStart.clone().diff(item.start, 'minutes');
                    const changes = { rowChangeDelta, timeDelta };
                    let items = [];

                    // Default, all items move by the same offset during a drag
                    _.forEach(animatedItems, domItem => {
                        const { item, rowNo } = this.itemFromElement(domItem);

                        let itemDuration = item.end.diff(item.start);
                        let newStart = item.start.clone().add(timeDelta, 'minutes');
                        let newEnd = newStart.clone().add(itemDuration);
                        item.start = newStart;
                        item.end = newEnd;
                        if (rowChangeDelta < 0) {
                            item.row = Math.max(0, item.row + rowChangeDelta);
                        } else if (rowChangeDelta > 0) {
                            item.row = Math.min(this.props.groups.length - 1, item.row + rowChangeDelta);
                        }

                        items.push(item);
                    });

                    this.props.onInteraction(AnterosResourceTimeline.changeTypes.dragEnd, changes, items);

                    // Reset the styles
                    animatedItems.forEach(domItem => {
                        domItem.style.webkitTransform = domItem.style.transform = 'translate(0px, 0px)';
                        domItem.setAttribute('drag-x', 0);
                        domItem.setAttribute('drag-y', 0);
                        domItem.style['z-index'] = 3;
                        domItem.style['top'] = intToPix(
                            this.props.itemHeight * Math.round(pixToInt(domItem.style['top']) / this.props.itemHeight)
                        );
                        domItem.removeAttribute('isDragging');
                    });

                    this._grid.recomputeGridSize({ rowIndex: 0 });
                });
        }
        if (canResize) {
            this._itemInteractable
                .resizable({
                    allowFrom: selectedItemSelector,
                    edges: { left: true, right: true, bottom: false, top: false }
                })
                .on('resizestart', e => {
                    const selected = this.props.onInteraction(AnterosResourceTimeline.changeTypes.resizeStart, null, this.props.selectedItems);
                    _.forEach(selected, id => {
                        let domItem = this._gridDomNode.querySelector("span[data-item-index='" + id + "'");
                        if (domItem) {
                            domItem.setAttribute('isResizing', 'True');
                            domItem.setAttribute('initialWidth', pixToInt(domItem.style.width));
                            domItem.style['z-index'] = 4;
                        }
                    });
                })
                .on('resizemove', e => {
                    let animatedItems = this._gridDomNode.querySelectorAll("span[isResizing='True'") || [];

                    let dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
                    dx += e.deltaRect.left;

                    let dw = e.rect.width - Number(e.target.getAttribute('initialWidth'));

                    const minimumWidth =
                        pixelsPerMinute(this.props.startDate, this.props.endDate, this.getTimelineWidth()) * this.props.snapMinutes;

                    const snappedDx = getSnapPixelFromDelta(
                        dx,
                        this.props.startDate,
                        this.props.endDate,
                        this.getTimelineWidth(),
                        this.props.snapMinutes
                    );

                    const snappedDw = getSnapPixelFromDelta(
                        dw,
                        this.props.startDate,
                        this.props.endDate,
                        this.getTimelineWidth(),
                        this.props.snapMinutes
                    );

                    _.forEach(animatedItems, item => {
                        item.style.width = intToPix(Number(item.getAttribute('initialWidth')) + snappedDw + minimumWidth);
                        item.style.webkitTransform = item.style.transform = 'translate(' + snappedDx + 'px, 0px)';
                    });
                    e.target.setAttribute('delta-x', dx);
                })
                .on('resizeend', e => {
                    let animatedItems = this._gridDomNode.querySelectorAll("span[isResizing='True'") || [];
                    // Update time
                    const dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
                    const isStartTimeChange = dx != 0;

                    let items = [];
                    let minRowNo = Infinity;

                    let durationChange = null;
                    // Calculate the default item positions
                    _.forEach(animatedItems, domItem => {
                        let startPixelOffset = pixToInt(domItem.style.left) + dx;
                        const { item, rowNo } = this.itemFromElement(domItem);

                        minRowNo = Math.min(minRowNo, rowNo);

                        if (isStartTimeChange) {
                            let newStart = getTimeAtPixel(
                                startPixelOffset,
                                this.props.startDate,
                                this.props.endDate,
                                this.getTimelineWidth(),
                                this.props.snapMinutes
                            );
                            if (durationChange === null) durationChange = item.start.diff(newStart, 'minutes');
                            item.start = newStart;
                        } else {
                            let endPixelOffset = startPixelOffset + pixToInt(domItem.style.width);
                            let newEnd = getTimeAtPixel(
                                endPixelOffset,
                                this.props.startDate,
                                this.props.endDate,
                                this.getTimelineWidth(),
                                this.props.snapMinutes
                            );
                            if (durationChange === null) durationChange = item.end.diff(newEnd, 'minutes');

                            item.end = newEnd;
                        }

                        // Check row height doesn't need changing
                        let new_row_height = getMaxOverlappingItems(
                            this.rowItemMap[rowNo],
                            this.props.startDate,
                            this.props.endDate
                        );
                        if (new_row_height !== this.rowHeightCache[rowNo]) {
                            this.rowHeightCache[rowNo] = new_row_height;
                        }

                        //Reset styles
                        domItem.removeAttribute('isResizing');
                        domItem.removeAttribute('initialWidth');
                        domItem.style['z-index'] = 3;
                        domItem.style.webkitTransform = domItem.style.transform = 'translate(0px, 0px)';

                        items.push(item);
                    });
                    if (durationChange === null) durationChange = 0;
                    const changes = { isStartTimeChange, timeDelta: -durationChange };

                    this.props.onInteraction(AnterosResourceTimeline.changeTypes.resizeEnd, changes, items);

                    e.target.setAttribute('delta-x', 0);
                    this._grid.recomputeGridSize({ rowIndex: minRowNo });
                });
        }

        if (canSelect) {
            this._selectRectangleInteractable
                .draggable({
                    enabled: true,
                    ignoreFrom: '.item_draggable, .rct9k-group'
                })
                .styleCursor(false)
                .on('dragstart', e => {
                    this._selectBox.start(e.clientX, e.clientY);
                })
                .on('dragmove', e => {
                    this._selectBox.move(e.clientX, e.clientY);
                })
                .on('dragend', e => {
                    let { top, left, width, height } = this._selectBox.end();
                    //Get the start and end row of the selection rectangle
                    const topRow = Number(getNearestRowHeight(left, top));
                    const bottomRow = Number(getNearestRowHeight(left + width, top + height));
                    // console.log('top', topRow, 'bottom', bottomRow);
                    //Get the start and end time of the selection rectangle
                    left = left - this.props.groupOffset;
                    let startOffset = width > 0 ? left : left + width;
                    let endOffset = width > 0 ? left + width : left;
                    const startTime = getTimeAtPixel(
                        startOffset,
                        this.props.startDate,
                        this.props.endDate,
                        this.getTimelineWidth(),
                        this.props.snapMinutes
                    );
                    const endTime = getTimeAtPixel(
                        endOffset,
                        this.props.startDate,
                        this.props.endDate,
                        this.getTimelineWidth(),
                        this.props.snapMinutes
                    );
                    // console.log('Start', startTime.format(), 'End', endTime.format());
                    //Get items in these ranges
                    let selectedItems = [];
                    for (let r = Math.min(topRow, bottomRow); r <= Math.max(topRow, bottomRow); r++) {
                        selectedItems.push(
                            ..._.filter(this.rowItemMap[r], i => {
                                return i.start.isBefore(endTime) && i.end.isAfter(startTime);
                            })
                        );
                    }
                    this.props.onInteraction(AnterosResourceTimeline.changeTypes.itemsSelected, selectedItems);
                });
        }
    }

    _handleItemRowEvent = (e, itemCallback, rowCallback) => {
        e.preventDefault();
        // Skip click handler if selecting with selection box
        if (this.selecting) {
            return;
        }
        if (e.target.hasAttribute('data-item-index') || e.target.parentElement.hasAttribute('data-item-index')) {
            let itemKey = e.target.getAttribute('data-item-index') || e.target.parentElement.getAttribute('data-item-index');
            itemCallback && itemCallback(e, Number(itemKey));
        } else {
            let row = e.target.getAttribute('data-row-index');
            let clickedTime = getTimeAtPixel(
                e.clientX - this.props.groupOffset,
                this.props.startDate,
                this.props.endDate,
                this.getTimelineWidth()
            );

            //const roundedStartMinutes = Math.round(clickedTime.minute() / this.props.snapMinutes) * this.props.snapMinutes; // I dont know what this does
            let snappedClickedTime = timeSnap(clickedTime, this.props.snapMinutes * 60);
            rowCallback && rowCallback(e, row, clickedTime, snappedClickedTime);
        }
    };

    /**
     * @param {number} width container width (in px)
     */
    cellRenderer(width) {
        /**
         * @param  {} columnIndex Always 1
         * @param  {} key Unique key within array of cells
         * @param  {} parent Reference to the parent Grid (instance)
         * @param  {} rowIndex Vertical (row) index of cell
         * @param  {} style Style object to be applied to cell (to position it);
         */
        const { timelineMode, onItemHover, onItemLeave, rowLayers } = this.props;
        const canSelect = AnterosResourceTimeline.isBitSet(AnterosResourceTimeline.TIMELINE_MODES.SELECT, timelineMode);
        return ({ columnIndex, key, parent, rowIndex, style }) => {
            let itemCol = 1;
            if (itemCol == columnIndex) {
                let itemsInRow = this.rowItemMap[rowIndex];
                const layersInRow = rowLayers.filter(r => r.rowNumber === rowIndex);
                let rowHeight = this.props.itemHeight;
                if (this.rowHeightCache[rowIndex]) {
                    rowHeight = rowHeight * this.rowHeightCache[rowIndex];
                }
                return (
                    <div
                        key={key}
                        style={style}
                        data-row-index={rowIndex}
                        className="rct9k-row"
                        onClick={e => this._handleItemRowEvent(e, AnterosResourceTimeline.no_op, this.props.onRowClick)}
                        onMouseDown={e => (this.selecting = false)}
                        onMouseMove={e => (this.selecting = true)}
                        onMouseOver={e => {
                            this.selecting = false;
                            return this._handleItemRowEvent(e, onItemHover, null);
                        }}
                        onMouseLeave={e => {
                            this.selecting = false;
                            return this._handleItemRowEvent(e, onItemLeave, null);
                        }}
                        onContextMenu={e =>
                            this._handleItemRowEvent(e, this.props.onItemContextClick, this.props.onRowContextClick)
                        }
                        onDoubleClick={e => this._handleItemRowEvent(e, this.props.onItemDoubleClick, this.props.onRowDoubleClick)}>
                        {rowItemsRenderer(
                            itemsInRow,
                            this.props.startDate,
                            this.props.endDate,
                            width,
                            this.props.itemHeight,
                            this.props.itemRenderer,
                            canSelect ? this.props.selectedItems : []
                        )}
                        {rowLayerRenderer(layersInRow, this.props.startDate, this.props.endDate, width, rowHeight)}
                    </div>
                );
            } else {
                const GroupComp = this.props.groupRenderer;
                let group = _.find(this.props.groups, g => g.id == rowIndex);
                return (
                    <div data-row-index={rowIndex} key={key} style={style} className="rct9k-group">
                        <GroupComp group={group} />
                    </div>
                );
            }
        };
    }

    getCursor() {
        const { showCursorTime, cursorTimeFormat } = this.props;
        const { cursorTime } = this.state;
        return showCursorTime && cursorTime ? cursorTime.clone().format(cursorTimeFormat) : null;
    }

    /**
     * Helper for react virtuaized to get the row height given a row index
     */
    rowHeight({ index }) {
        let rh = this.rowHeightCache[index] ? this.rowHeightCache[index] : 1;
        return rh * this.props.itemHeight;
    }

    /**
     * Set the grid ref.
     * @param {Object} reactComponent Grid react element
     */
    grid_ref_callback(reactComponent) {
        this._grid = reactComponent;
        this._gridDomNode = ReactDOM.findDOMNode(this._grid);
    }

    /**
     * Set the select box ref.
     * @param {Object} reactComponent Selectbox react element
     */
    select_ref_callback(reactComponent) {
        this._selectBox = reactComponent;
    }

    /**
     * Event handler for onMouseMove.
     * Only calls back if a new snap time is reached
     */
    throttledMouseMoveFunc(e) {
        const { componentId } = this.props;
        const leftOffset = document.querySelector(`.rct9k-id-${componentId} .parent-div`).getBoundingClientRect().left;
        const cursorSnappedTime = getTimeAtPixel(
            e.clientX - this.props.groupOffset - leftOffset,
            this.props.startDate,
            this.props.endDate,
            this.getTimelineWidth(),
            this.props.snapMinutes
        );
        if (!this.mouse_snapped_time || this.mouse_snapped_time.unix() !== cursorSnappedTime.unix()) {
            if (cursorSnappedTime.isSameOrAfter(this.props.startDate)) {
                this.mouse_snapped_time = cursorSnappedTime;
                this.setState({ cursorTime: this.mouse_snapped_time });
                this.props.onInteraction(
                    AnterosResourceTimeline.changeTypes.snappedMouseMove,
                    { snappedTime: this.mouse_snapped_time.clone() },
                    null
                );
            }
        }
    }

    mouseMoveFunc(e) {
        e.persist();
        this.throttledMouseMoveFunc(e);
    }

    render() {
        const {
            onInteraction,
            groupOffset,
            showCursorTime,
            timebarFormat,
            componentId,
            groupTitleRenderer,
            shallowUpdateCheck,
            forceRedrawFunc,
            startDate,
            endDate
        } = this.props;

        const divCssClass = `rct9k-timeline-div rct9k-id-${componentId}`;
        let varTimebarProps = {};
        if (timebarFormat) varTimebarProps['timeFormats'] = timebarFormat;

        function columnWidth(width) {
            return ({ index }) => {
                if (index === 0) return groupOffset;
                return width - groupOffset;
            };
        }
        // Markers (only current time marker atm)
        const markers = [];
        if (showCursorTime && this.mouse_snapped_time) {
            const cursorPix = getPixelAtTime(this.mouse_snapped_time, startDate, endDate, this.getTimelineWidth());
            markers.push({
                left: cursorPix + this.props.groupOffset,
                key: 1
            });
        }
        return (
            <div className={divCssClass}>
                <AutoSizer className="rct9k-autosizer" onResize={this.refreshGrid}>
                    {({ height, width }) => (
                        <div className="parent-div" onMouseMove={this.mouseMoveFunc}>
                            <SelectBox ref={this.select_ref_callback} />
                            <Timebar
                                cursorTime={this.getCursor()}
                                start={this.props.startDate}
                                end={this.props.endDate}
                                width={width}
                                leftOffset={groupOffset}
                                selectedRanges={this.state.selection}
                                groupTitleRenderer={groupTitleRenderer}
                                {...varTimebarProps}
                            />
                            {markers.map(m => <Marker key={m.key} height={height} top={0} left={m.left} />)}
                            <TimelineBody
                                width={width}
                                columnWidth={columnWidth(width)}
                                height={height}
                                rowHeight={this.rowHeight}
                                rowCount={this.props.groups.length}
                                cellRenderer={this.cellRenderer(this.getTimelineWidth(width))}
                                grid_ref_callback={this.grid_ref_callback}
                                shallowUpdateCheck={shallowUpdateCheck}
                                forceRedrawFunc={forceRedrawFunc}
                            />
                        </div>
                    )}
                </AutoSizer>
            </div>
        );
    }
}

AnterosResourceTimeline.TIMELINE_MODES = Object.freeze({
    SELECT: 1,
    DRAG: 2,
    RESIZE: 4
});

AnterosResourceTimeline.propTypes = {
    /** Recebe um array de objetos com as propriedades dos items */
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    /** Recebe um array de objetos com as propriedades do grupo (id e title) */
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    /** Altera a largura do container do grupo */
    groupOffset: PropTypes.number.isRequired,
    /** Recebe um array de objetos com as propriedades das linhas */
    rowLayers: PropTypes.arrayOf(
        PropTypes.shape({
            start: PropTypes.object.isRequired,
            end: PropTypes.object.isRequired,
            rowNumber: PropTypes.number.isRequired,
            style: PropTypes.object.isRequired
        })
    ),
    /** Recebe um array de numeros com o identificador de cada item selecionado */
    selectedItems: PropTypes.arrayOf(PropTypes.number),
    /** Data inicial da linha do tempo */
    startDate: PropTypes.object.isRequired,
    /** Data final da linha do tempo */
    endDate: PropTypes.object.isRequired,
    /** Indica a variação em minutos do tamanho do item no momento de redimensionar */
    snapMinutes: PropTypes.number,
    /** Indica se a linha vermelha estará visivel */
    showCursorTime: PropTypes.bool,
    cursorTimeFormat: PropTypes.string,
    componentId: PropTypes.string, // A unique key to identify the component. Only needed when 2 grids are mounted
    /** Altura ocupada por cada item */
    itemHeight: PropTypes.number,
    timelineMode: PropTypes.number,
    timebarFormat: PropTypes.object,
    /** Funçao acionada quando um item é clicado */
    onItemClick: PropTypes.func,
    /** Funçao acionada quando um item recebe um duplo clique */
    onItemDoubleClick: PropTypes.func,
    onItemContext: PropTypes.func,
    onInteraction: PropTypes.func.isRequired,
    /** Funçao acionada quando uma linha é clicada */
    onRowClick: PropTypes.func,
    onRowContext: PropTypes.func,
    /** Funçao acionada quando uma linha recebe um duplo clique */
    onRowDoubleClick: PropTypes.func,
    onItemHover: PropTypes.func,
    onItemLeave: PropTypes.func,
    /** Recebe uma função que retorna um objeto com as propriedades do item */
    itemRenderer: PropTypes.func,
    /** Recebe uma função que retorna um objeto com as propriedades do container do grupo */
    groupRenderer: PropTypes.func,
    /** Recebe uma função que retorna um objeto que preenche o título da tabela */
    groupTitleRenderer: PropTypes.func,
    shallowUpdateCheck: PropTypes.bool,
    forceRedrawFunc: PropTypes.func
};

AnterosResourceTimeline.defaultProps = {
    rowLayers: [],
    groupOffset: 150,
    itemHeight: 40,
    snapMinutes: 15,
    cursorTimeFormat: 'D MMM YYYY HH:mm',
    componentId: 'r9k1',
    showCursorTime: true,
    groupRenderer: DefaultGroupRenderer,
    itemRenderer: DefaultItemRenderer,
    groupTitleRenderer: () => <div />,
    timelineMode: AnterosResourceTimeline.TIMELINE_MODES.SELECT | AnterosResourceTimeline.TIMELINE_MODES.DRAG | AnterosResourceTimeline.TIMELINE_MODES.RESIZE,
    shallowUpdateCheck: false,
    forceRedrawFunc: null,
    onItemHover() { },
    onItemLeave() { }
};


/**
    * The types of interactions - see {@link onInteraction}
    */
AnterosResourceTimeline.changeTypes = {
    resizeStart: 'resizeStart',
    resizeEnd: 'resizeEnd',
    dragEnd: 'dragEnd',
    dragStart: 'dragStart',
    itemsSelected: 'itemsSelected',
    snappedMouseMove: 'snappedMouseMove'
};

/**
 * Checks if the given bit is set in the given mask
 * @param {number} bit Bit to check
 * @param {number} mask Mask to check against
 * @returns {boolean} True if bit is set; else false
 */
AnterosResourceTimeline.isBitSet = function (bit, mask) {
    return (bit & mask) === bit;
}

/**
 * Alias for no op function
 */
AnterosResourceTimeline.no_op = () => { };


/**
* Timebar component - displays the current time on top of the timeline
*/
class Timebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.guessResolution = this.guessResolution.bind(this);
        this.renderBar = this.renderBar.bind(this);
        this.renderTopBar = this.renderTopBar.bind(this);
        this.renderBottomBar = this.renderBottomBar.bind(this);
    }

    componentWillMount() {
        this.guessResolution();
    }
    /**
     * On new props we check if a resolution is given, and if not we guess one
     * @param {Object} nextProps Props coming in
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.top_resolution && nextProps.bottom_resolution) {
            this.setState({ resolution: { top: nextProps.top_resolution, bottom: nextProps.bottom_resolution } });
        } else {
            this.guessResolution(nextProps.start, nextProps.end);
        }
    }

    /**
     * Attempts to guess the resolution of the top and bottom halves of the timebar based on the viewable date range.
     * Sets resolution to state.
     * @param {moment} start Start date for the timebar
     * @param {moment} end End date for the timebar
     */
    guessResolution(start, end) {
        if (!start || !end) {
            start = this.props.start;
            end = this.props.end;
        }
        const durationSecs = end.diff(start, 'seconds');
        //    -> 1h
        if (durationSecs <= 60 * 60) this.setState({ resolution: { top: 'hour', bottom: 'minute' } });
        // 1h -> 3d
        else if (durationSecs <= 24 * 60 * 60 * 3) this.setState({ resolution: { top: 'day', bottom: 'hour' } });
        // 1d -> 30d
        else if (durationSecs <= 30 * 24 * 60 * 60) this.setState({ resolution: { top: 'month', bottom: 'day' } });
        //30d -> 1y
        else if (durationSecs <= 365 * 24 * 60 * 60) this.setState({ resolution: { top: 'year', bottom: 'month' } });
        // 1y ->
        else this.setState({ resolution: { top: 'year', bottom: 'year' } });
    }

    /**
     * Renderer for top bar.
     * @returns {Object} JSX for top menu bar - based of time format & resolution
     */
    renderTopBar() {
        let res = this.state.resolution.top;
        return this.renderBar({ format: this.props.timeFormats.majorLabels[res], type: res });
    }
    /**
     * Renderer for bottom bar.
     * @returns {Object} JSX for bottom menu bar - based of time format & resolution
     */
    renderBottomBar() {
        let res = this.state.resolution.bottom;
        return this.renderBar({ format: this.props.timeFormats.minorLabels[res], type: res });
    }
    /**
     * Gets the number of pixels per segment of the timebar section (using the resolution)
     * @param {moment} date The date being rendered. This is used to figure out how many days are in the month
     * @param {string} resolutionType Timebar section resolution [Year; Month...]
     * @returns {number} The number of pixels per segment
     */
    getPixelIncrement(date, resolutionType, offset = 0) {
        const { start, end } = this.props;
        const width = this.props.width - this.props.leftOffset;

        const start_end_min = end.diff(start, 'minutes');
        const pixels_per_min = width / start_end_min;
        function isLeapYear(year) {
            return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
        }
        const daysInYear = isLeapYear(date.year()) ? 366 : 365;
        let inc = width;
        switch (resolutionType) {
            case 'year':
                inc = pixels_per_min * 60 * 24 * (daysInYear - offset);
                break;
            case 'month':
                inc = pixels_per_min * 60 * 24 * (date.daysInMonth() - offset);
                break;
            case 'day':
                inc = pixels_per_min * 60 * (24 - offset);
                break;
            case 'hour':
                inc = pixels_per_min * (60 - offset);
                break;
            case 'minute':
                inc = pixels_per_min - offset;
                break;
            default:
                break;
        }
        return Math.min(inc, width);
    }
    /**
     * Renders an entire segment of the timebar (top or bottom)
     * @param {string} resolution The resolution to render at [Year; Month...]
     * @returns {Object[]} A list of sections (making up a segment) to be rendered
     * @property {string} label The text displayed in the section (usually the date/time)
     * @property {boolean} isSelected Whether the section is being 'touched' when dragging/resizing
     * @property {number} size The number of pixels the segment will take up
     * @property {number|string} key Key for react
     */
    renderBar(resolution) {
        const { start, end, selectedRanges } = this.props;
        const width = this.props.width - this.props.leftOffset;

        let currentDate = start.clone();
        let timeIncrements = [];
        let pixelsLeft = width;
        let labelSizeLimit = 60;

        function _addTimeIncrement(initialOffset, offsetType, stepFunc) {
            let offset = null;
            while (currentDate.isBefore(end) && pixelsLeft > 0) {
                // if this is the first 'block' it may be cut off at the start
                if (pixelsLeft === width) {
                    offset = initialOffset;
                } else {
                    offset = moment.duration(0);
                }
                let pixelIncrements = Math.min(
                    this.getPixelIncrement(currentDate, resolution.type, offset.as(offsetType)),
                    pixelsLeft
                );
                const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
                let label = currentDate.format(resolution.format[labelSize]);
                let isSelected = _.some(selectedRanges, s => {
                    return (
                        currentDate.isSameOrAfter(s.start.clone().startOf(resolution.type)) &&
                        currentDate.isSameOrBefore(s.end.clone().startOf(resolution.type))
                    );
                });
                timeIncrements.push({ label, isSelected, size: pixelIncrements, key: pixelsLeft });
                stepFunc(currentDate, offset);
                pixelsLeft -= pixelIncrements;
            }
        }

        const addTimeIncrement = _addTimeIncrement.bind(this);

        if (resolution.type === 'year') {
            const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('year')));
            addTimeIncrement(offset, 'months', (currentDt, offst) => currentDt.subtract(offst).add(1, 'year'));
        } else if (resolution.type === 'month') {
            const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('month')));
            addTimeIncrement(offset, 'days', (currentDt, offst) => currentDt.subtract(offst).add(1, 'month'));
        } else if (resolution.type === 'day') {
            const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('day')));
            addTimeIncrement(offset, 'hours', (currentDt, offst) => currentDt.subtract(offst).add(1, 'days'));
        } else if (resolution.type === 'hour') {
            const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('hour')));
            addTimeIncrement(offset, 'minutes', (currentDt, offst) => currentDt.subtract(offst).add(1, 'hours'));
        } else if (resolution.type === 'minute') {
            addTimeIncrement(moment.duration(0), 'minutes', (currentDt, offst) => currentDt.add(1, 'minutes'));
        }
        return timeIncrements;
    }

    /**
     * Renders the timebar
     * @returns {Object} Timebar component
     */
    render() {
        const { cursorTime } = this.props;
        const topBarComponent = this.renderTopBar();
        const bottomBarComponent = this.renderBottomBar();
        const GroupTitleRenderer = this.props.groupTitleRenderer;

        // Only show the cursor on 1 of the top bar segments
        // Pick the segment that has the biggest size
        let topBarCursorKey = null;
        if (topBarComponent.length > 1 && topBarComponent[1].size > topBarComponent[0].size)
            topBarCursorKey = topBarComponent[1].key;
        else if (topBarComponent.length > 0) topBarCursorKey = topBarComponent[0].key;

        return (
            <div className="rct9k-timebar">
                <div className="rct9k-timebar-group-title" style={{ width: this.props.leftOffset }}>
                    <GroupTitleRenderer />
                </div>
                <div className="rct9k-timebar-outer" style={{ width: this.props.width, paddingLeft: this.props.leftOffset }}>
                    <div className="rct9k-timebar-inner rct9k-timebar-inner-top">
                        {_.map(topBarComponent, i => {
                            let topLabel = i.label;
                            if (cursorTime && i.key === topBarCursorKey) {
                                topLabel += ` [${cursorTime}]`;
                            }
                            let className = 'rct9k-timebar-item';
                            if (i.isSelected) className += ' rct9k-timebar-item-selected';
                            return (
                                <span className={className} key={i.key} style={{ width: intToPix(i.size) }}>
                                    {topLabel}
                                </span>
                            );
                        })}
                    </div>
                    <div className="rct9k-timebar-inner rct9k-timebar-inner-bottom">
                        {_.map(bottomBarComponent, i => {
                            let className = 'rct9k-timebar-item';
                            if (i.isSelected) className += ' rct9k-timebar-item-selected';
                            return (
                                <span className={className} key={i.key} style={{ width: intToPix(i.size) }}>
                                    {i.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

Timebar.propTypes = {
    cursorTime: PropTypes.any,
    groupTitleRenderer: PropTypes.func,
    start: PropTypes.object.isRequired, //moment
    end: PropTypes.object.isRequired, //moment
    width: PropTypes.number.isRequired,
    leftOffset: PropTypes.number,
    top_resolution: PropTypes.string,
    bottom_resolution: PropTypes.string,
    selectedRanges: PropTypes.arrayOf(PropTypes.object), // [start: moment ,end: moment (end)]
    timeFormats: PropTypes.object
};
Timebar.defaultProps = {
    selectedRanges: [],
    groupTitleRenderer: () => <div />,
    leftOffset: 0,
    timeFormats: timebarFormat
};

class SelectBox extends React.Component {
    constructor(props) {
        super(props);
        this.curX = 0;
        this.curY = 0;
        this.startX = 0;
        this.startY = 0;
    }

    /**
     * Create the selection box
     * @param {number} x Starting x coordinate for selection box
     * @param {number} y Starting y coordinate for selection box
     */
    start(x, y) {
        this.startX = x;
        this.startY = y;
        this.curX = 0;
        this.curY = 0;
    }

    /**
     * Update the selection box as the mouse moves
     * @param {number} x The current X coordinate of the mouse
     * @param {number} y The current Y coordinate of the mouse
     */
    move(x, y) {
        this.curX = x;
        this.curY = y;
        this.forceUpdate();
    }

    /**
     * Generally on mouse up.
     * Finish the selection box and return the rectangle created
     * @returns {Object} The selection rectangle
     * @property {number} top The top y coordinate
     * @property {number} left The left x coordinate
     * @property {number} width The width of the box
     * @property {number} height The height of the box
     */
    end() {
        const { startX, startY, curX, curY } = this;
        const left = Math.min(startX, curX);
        const top = Math.min(startY, curY);
        const width = Math.abs(startX - curX);
        const height = Math.abs(startY - curY);
        let toReturn = { left, top, width, height };

        this.startX = 0;
        this.startY = 0;
        this.curX = 0;
        this.curY = 0;
        this.forceUpdate();
        return toReturn;
    }

    /**
     * @ignore
     */
    render() {
        const { startX, startY, curX, curY } = this;
        const left = Math.min(startX, curX);
        const top = Math.min(startY, curY);
        const width = Math.abs(startX - curX);
        const height = Math.abs(startY - curY);
        let style = { left, top, width, height };
        return <div className="rct9k-selector-outer" style={style} />;
    }
}

class TimelineBody extends Component {
    componentDidMount() {
        this.forceUpdate();
    }
    shouldComponentUpdate(nextProps) {
        const { props } = this;
        if (!props.shallowUpdateCheck) {
            return true;
        }

        // prettier-ignore
        const shallowChange = props.height !== nextProps.height
            || props.width !== nextProps.width
            || props.rowCount !== nextProps.rowCount;

        if (props.forceRedrawFunc) {
            return shallowChange || props.forceRedrawFunc(props, nextProps);
        }

        return shallowChange;
    }
    render() {
        const { width, columnWidth, height, rowHeight, rowCount } = this.props;
        const { grid_ref_callback, cellRenderer } = this.props;

        return (
            <Grid
                ref={grid_ref_callback}
                autoContainerWidth
                cellRenderer={cellRenderer}
                columnCount={2}
                columnWidth={columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={width}
            />
        );
    }
}

TimelineBody.propTypes = {
    width: PropTypes.number.isRequired,
    columnWidth: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    rowHeight: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired,
    grid_ref_callback: PropTypes.func.isRequired,
    cellRenderer: PropTypes.func.isRequired,
    shallowUpdateCheck: PropTypes.bool,
    forceRedrawFunc: PropTypes.func
};

TimelineBody.defaultProps = {
    shallowUpdateCheck: false,
    forceRedrawFunc: null
};