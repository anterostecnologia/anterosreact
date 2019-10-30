
/* Este componente é um calendário personalizado **/

import React, {Component} from 'react'
import {PropTypes} from 'prop-types'

import Col from 'antd/lib/col'
import Row from 'antd/lib/row'
import Icon from 'antd/lib/icon'
import 'antd/lib/select/style/index.css'
import 'antd/lib/grid/style/index.css'
import Radio from 'antd/lib/radio'
import 'antd/lib/radio/style/index.css'
import Popover from 'antd/lib/popover'
import 'antd/lib/popover/style/index.css'
import Calendar from 'antd/lib/calendar'
import 'antd/lib/calendar/style/index.css'
import { DropTarget } from 'react-dnd'
import { DragSource } from 'react-dnd'
import {RRuleSet,rrulestr} from 'rrule'
import moment from 'moment'
import '../bigshedule.css'

const supportTouch = 'ontouchstart' in window;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

//======================== behaviors ========================

const getSummary = (schedulerData, headerEvents, slotId, slotName, headerStart, headerEnd) => {
    return {text: 'Summary', color: 'red', fontSize: '1.2rem'};
}

//getCustomDate example
const getCustomDate = (schedulerData, num, date = undefined) => {
    const {viewType} = schedulerData;
    let selectDate = schedulerData.startDate;
    if(date != undefined)
        selectDate = date;    
    
    let startDate = num === 0 ? selectDate : 
        schedulerData.localeMoment(selectDate).add(2*num, 'days').format(DATE_FORMAT),
        endDate = schedulerData.localeMoment(startDate).add(1, 'days').format(DATE_FORMAT),
        cellUnit = CellUnits.Hour;
    if(viewType === ViewTypes.Custom1) {
        let monday = schedulerData.localeMoment(selectDate).startOf('week').format(DATE_FORMAT);
        startDate = num === 0 ? monday : schedulerData.localeMoment(monday).add(2*num, 'weeks').format(DATE_FORMAT);
        endDate = schedulerData.localeMoment(startDate).add(1, 'weeks').endOf('week').format(DATE_FORMAT);
        cellUnit = CellUnits.Day;
    } else if(viewType === ViewTypes.Custom2) {
        let firstDayOfMonth = schedulerData.localeMoment(selectDate).startOf('month').format(DATE_FORMAT);
        startDate = num === 0 ? firstDayOfMonth : schedulerData.localeMoment(firstDayOfMonth).add(2*num, 'months').format(DATE_FORMAT);
        endDate = schedulerData.localeMoment(startDate).add(1, 'months').endOf('month').format(DATE_FORMAT);
        cellUnit = CellUnits.Day;
    }
        
    return {
        startDate,
        endDate,
        cellUnit
    };
}

//getNonAgendaViewBodyCellBgColor example
const getNonAgendaViewBodyCellBgColor = (schedulerData, slotId, header) => {
    if(!header.nonWorkingTime) {
        return '#87e8de';
    }

    return undefined;
}

//getDateLabel func example
const getDateLabel = (schedulerData, viewType, startDate, endDate) => {
    let start = schedulerData.localeMoment(startDate);
    let end = schedulerData.localeMoment(endDate);
    let dateLabel = start.format('MMM D, YYYY');

    if(viewType === ViewTypes.Week || (start != end && (
        viewType === ViewTypes.Custom || viewType === ViewTypes.Custom1 || viewType === ViewTypes.Custom2
    ))) {
        dateLabel = `${start.format('MMM D')}-${end.format('D, YYYY')}`;
        if(start.month() !== end.month())
            dateLabel = `${start.format('MMM D')}-${end.format('MMM D, YYYY')}`;
        if(start.year() !== end.year())
            dateLabel = `${start.format('MMM D, YYYY')}-${end.format('MMM D, YYYY')}`;
    }
    else if(viewType === ViewTypes.Month){
        dateLabel = start.format('MMMM YYYY');
    }
    else if(viewType === ViewTypes.Quarter){
        dateLabel = `${start.format('MMM D')}-${end.format('MMM D, YYYY')}`;
    }
    else if(viewType === ViewTypes.Year) {
        dateLabel = start.format('YYYY');
    }

    return dateLabel;
}

const getEventText = (schedulerData, event) => {
    if(!schedulerData.isEventPerspective) return event.title;

    let eventText = event.title;
    schedulerData.resources.forEach((item) => {
        if(item.id === event.resourceId) {
            eventText = item.name;
        }
    })

    return eventText;
}

const getScrollSpecialMoment = (schedulerData, startMoment, endMoment) => {
    // return endMoment;
    const { localeMoment } = schedulerData;
    return localeMoment();
}

const isNonWorkingTime = (schedulerData, time) => {
    const { localeMoment } = schedulerData;
    if(schedulerData.cellUnit === CellUnits.Hour){
        let hour = localeMoment(time).hour();
        if(hour < 9 || hour > 18)
            return true;
    }
    else {
        let dayOfWeek = localeMoment(time).weekday();
        if (dayOfWeek === 0 || dayOfWeek === 6)
            return true;
    }

    return false;
}

const behaviors = {
    //getSummaryFunc: getSummary,
    getSummaryFunc: undefined,
    //getCustomDateFunc: getCustomDate,
    getCustomDateFunc: undefined,
    // getNonAgendaViewBodyCellBgColorFunc: getNonAgendaViewBodyCellBgColor,
    getNonAgendaViewBodyCellBgColorFunc: undefined, 
    getScrollSpecialMomentFunc: getScrollSpecialMoment,
    getDateLabelFunc: getDateLabel,
    getEventTextFunc: getEventText,
    isNonWorkingTimeFunc: isNonWorkingTime,
}



//======================= Event Item ==============================

class EventItem extends Component {
    constructor(props) {
        super(props);

        const {left, top, width} = props;
        this.state = {
            left: left,
            top: top,
            width: width,
        };
        this.startResizer = null;
        this.endResizer = null;
    }

    

    componentWillReceiveProps(np) {
        const {left, top, width} = np;
        this.setState({
            left: left,
            top: top,
            width: width,
        });

        this.subscribeResizeEvent(np);
    }

    componentDidMount() {
        this.subscribeResizeEvent(this.props);
    }

    initStartDrag = (ev) => {
        const {schedulerData, eventItem} = this.props;
        let slotId = schedulerData._getEventSlotId(eventItem);
        let slot = schedulerData.getSlotById(slotId);
        if(!!slot && !!slot.groupOnly) return;
        if(schedulerData._isResizing()) return;

        ev.stopPropagation();
        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) return;
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            if (ev.buttons !== undefined && ev.buttons !== 1) return;
            clientX = ev.clientX;
        }
        this.setState({
            startX: clientX
        });
        schedulerData._startResizing();
        if(supportTouch) {
            this.startResizer.addEventListener('touchmove', this.doStartDrag, false);
            this.startResizer.addEventListener('touchend', this.stopStartDrag, false);
            this.startResizer.addEventListener('touchcancel', this.cancelStartDrag, false);
        } else {
            document.documentElement.addEventListener('mousemove', this.doStartDrag, false);
            document.documentElement.addEventListener('mouseup', this.stopStartDrag, false);
        }
        document.onselectstart = function () {
			return false;
		};
		document.ondragstart = function () {
			return false;
		};
    }

    doStartDrag = (ev) => {
        ev.stopPropagation();

        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) return;
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            clientX = ev.clientX;
        }
        const {left, width, leftIndex, rightIndex, schedulerData} = this.props;
        let cellWidth = schedulerData.getContentCellWidth();
        let offset = leftIndex > 0 ? 5 : 6;
        let minWidth = cellWidth - offset;
        let maxWidth = rightIndex * cellWidth - offset;
        const {startX} = this.state;
        let newLeft = left + clientX - startX;
        let newWidth = width + startX - clientX;
        if (newWidth < minWidth) {
            newWidth = minWidth;
            newLeft = (rightIndex - 1) * cellWidth + (rightIndex - 1 > 0 ? 2 : 3);
        }
        else if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newLeft = 3;
        }

        this.setState({left: newLeft, width: newWidth});
    }

    stopStartDrag = (ev) => {
        ev.stopPropagation();
        if(supportTouch) {
            this.startResizer.removeEventListener('touchmove', this.doStartDrag, false);
            this.startResizer.removeEventListener('touchend', this.stopStartDrag, false);
            this.startResizer.removeEventListener('touchcancel', this.cancelStartDrag, false);
        } else {
            document.documentElement.removeEventListener('mousemove', this.doStartDrag, false);
            document.documentElement.removeEventListener('mouseup', this.stopStartDrag, false);
        }
        document.onselectstart = null;
        document.ondragstart = null;
        const {width, left, top, leftIndex, rightIndex, schedulerData, eventItem, updateEventStart, conflictOccurred} = this.props;
        schedulerData._stopResizing();
        if(this.state.width === width) return;

        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) {
                this.setState({
                    left: left,
                    top: top,
                    width: width,
                });
                return;
            }
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            clientX = ev.clientX;
        }
        const {cellUnit, events, config, localeMoment} = schedulerData;
        let cellWidth = schedulerData.getContentCellWidth();
        let offset = leftIndex > 0 ? 5 : 6;
        let minWidth = cellWidth - offset;
        let maxWidth = rightIndex * cellWidth - offset;
        const {startX} = this.state;
        let newWidth = width + startX - clientX;
        let deltaX = clientX - startX;
        let sign = deltaX < 0 ? -1 : (deltaX === 0 ? 0 : 1);
        let count = (sign > 0 ? Math.floor(Math.abs(deltaX) / cellWidth) : Math.ceil(Math.abs(deltaX) / cellWidth)) * sign;
        if (newWidth < minWidth)
            count = rightIndex - leftIndex - 1;
        else if (newWidth > maxWidth)
            count = -leftIndex;
        let newStart = localeMoment(eventItem.start).add(cellUnit === CellUnits.Hour ? count * config.minuteStep : count, cellUnit === CellUnits.Hour ? 'minutes' : 'days').format(DATETIME_FORMAT);
        if(count !== 0 && cellUnit !== CellUnits.Hour && config.displayWeekend === false) {
            if(count > 0) {
                let tempCount = 0, i = 0;
                while (true) {
                    i++;
                    let tempStart = localeMoment(eventItem.start).add(i, 'days');
                    let dayOfWeek = tempStart.weekday();
                    if(dayOfWeek !== 0 && dayOfWeek !== 6) {
                        tempCount ++;
                        if(tempCount === count) {
                            newStart = tempStart.format(DATETIME_FORMAT);
                            break;
                        }
                    }

                }
            } else {
                let tempCount = 0, i = 0;
                while (true) {
                    i--;
                    let tempStart = localeMoment(eventItem.start).add(i, 'days');
                    let dayOfWeek = tempStart.weekday();
                    if(dayOfWeek !== 0 && dayOfWeek !== 6) {
                        tempCount --;
                        if(tempCount === count) {
                            newStart = tempStart.format(DATETIME_FORMAT);
                            break;
                        }
                    }
                }
            }
        }

        let hasConflict = false;
        let slotId = schedulerData._getEventSlotId(eventItem);
        let slotName = undefined;
        let slot = schedulerData.getSlotById(slotId);
        if(!!slot)
            slotName = slot.name;
        if (config.checkConflict) {
            let start = localeMoment(newStart),
                end = localeMoment(eventItem.end);

            events.forEach((e) => {
                if (schedulerData._getEventSlotId(e) === slotId && e.id !== eventItem.id) {
                    let eStart = localeMoment(e.start),
                        eEnd = localeMoment(e.end);
                    if ((start >= eStart && start < eEnd) || (end > eStart && end <= eEnd) || (eStart >= start && eStart < end) || (eEnd > start && eEnd <= end))
                        hasConflict = true;
                }
            });
        }

        if (hasConflict) {
            this.setState({
                left: left,
                top: top,
                width: width,
            });

            if (conflictOccurred != undefined) {
                conflictOccurred(schedulerData, 'StartResize', eventItem, DnDTypes.EVENT, slotId, slotName, newStart, eventItem.end);
            }
            else {
                console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
            }
            this.subscribeResizeEvent(this.props);
        }
        else {
            if (updateEventStart != undefined)
                updateEventStart(schedulerData, eventItem, newStart);
        }
    }

    cancelStartDrag = (ev) => {
        ev.stopPropagation();

        this.startResizer.removeEventListener('touchmove', this.doStartDrag, false);
        this.startResizer.removeEventListener('touchend', this.stopStartDrag, false);
        this.startResizer.removeEventListener('touchcancel', this.cancelStartDrag, false);
        document.onselectstart = null;
        document.ondragstart = null;
        const {schedulerData, left, top, width} = this.props;
        schedulerData._stopResizing();
        this.setState({
            left: left,
            top: top,
            width: width,
        });
    }

    initEndDrag = (ev) => {
        const {schedulerData, eventItem} = this.props;
        let slotId = schedulerData._getEventSlotId(eventItem);
        let slot = schedulerData.getSlotById(slotId);
        if(!!slot && !!slot.groupOnly) return;
        if(schedulerData._isResizing()) return;

        ev.stopPropagation();
        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) return;
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            if (ev.buttons !== undefined && ev.buttons !== 1) return;
            clientX = ev.clientX;
        }
        this.setState({
            endX: clientX
        });

        schedulerData._startResizing();
        if(supportTouch) {
            this.endResizer.addEventListener('touchmove', this.doEndDrag, false);
            this.endResizer.addEventListener('touchend', this.stopEndDrag, false);
            this.endResizer.addEventListener('touchcancel', this.cancelEndDrag, false);
        } else {
            document.documentElement.addEventListener('mousemove', this.doEndDrag, false);
            document.documentElement.addEventListener('mouseup', this.stopEndDrag, false);
        }
        document.onselectstart = function () {
			return false;
		};
		document.ondragstart = function () {
			return false;
		};
    }

    doEndDrag = (ev) => {
        ev.stopPropagation();
        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) return;
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            clientX = ev.clientX;
        }
        const {width, leftIndex, schedulerData} = this.props;
        const {headers} = schedulerData;
        let cellWidth = schedulerData.getContentCellWidth();
        let offset = leftIndex > 0 ? 5 : 6;
        let minWidth = cellWidth - offset;
        let maxWidth = (headers.length - leftIndex) * cellWidth - offset;
        const {endX} = this.state;

        let newWidth = (width + clientX - endX);
        if (newWidth < minWidth)
            newWidth = minWidth;
        else if (newWidth > maxWidth)
            newWidth = maxWidth;

        this.setState({width: newWidth});
    }

    stopEndDrag = (ev) => {
        ev.stopPropagation();

        if(supportTouch) {
            this.endResizer.removeEventListener('touchmove', this.doEndDrag, false);
            this.endResizer.removeEventListener('touchend', this.stopEndDrag, false);
            this.endResizer.removeEventListener('touchcancel', this.cancelEndDrag, false);
        } else {
            document.documentElement.removeEventListener('mousemove', this.doEndDrag, false);
            document.documentElement.removeEventListener('mouseup', this.stopEndDrag, false);
        }
        document.onselectstart = null;
        document.ondragstart = null;
        const {width, left, top, leftIndex, rightIndex, schedulerData, eventItem, updateEventEnd, conflictOccurred} = this.props;
        schedulerData._stopResizing();
        if(this.state.width === width) return;

        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) {
                this.setState({
                    left: left,
                    top: top,
                    width: width,
                });
                return;
            }
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            clientX = ev.clientX;
        }
        const {headers, cellUnit, events, config, localeMoment} = schedulerData;
        let cellWidth = schedulerData.getContentCellWidth();
        let offset = leftIndex > 0 ? 5 : 6;
        let minWidth = cellWidth - offset;
        let maxWidth = (headers.length - leftIndex) * cellWidth - offset;
        const {endX} = this.state;

        let newWidth = (width + clientX - endX);
        let deltaX = newWidth - width;
        let sign = deltaX < 0 ? -1 : (deltaX === 0 ? 0 : 1);
        let count = (sign < 0 ? Math.floor(Math.abs(deltaX) / cellWidth) : Math.ceil(Math.abs(deltaX) / cellWidth)) * sign;
        if (newWidth < minWidth)
            count = leftIndex - rightIndex + 1;
        else if (newWidth > maxWidth)
            count = headers.length - rightIndex;
        let newEnd = localeMoment(eventItem.end).add(cellUnit === CellUnits.Hour ? count * config.minuteStep : count, cellUnit === CellUnits.Hour ? 'minutes' : 'days').format(DATETIME_FORMAT);
        if(count !== 0 && cellUnit !== CellUnits.Hour && config.displayWeekend === false) {
            if(count > 0) {
                let tempCount = 0, i = 0;
                while (true) {
                    i++;
                    let tempEnd = localeMoment(eventItem.end).add(i, 'days');
                    let dayOfWeek = tempEnd.weekday();
                    if(dayOfWeek !== 0 && dayOfWeek !== 6) {
                        tempCount ++;
                        if(tempCount === count) {
                            newEnd = tempEnd.format(DATETIME_FORMAT);
                            break;
                        }
                    }

                }
            } else {
                let tempCount = 0, i = 0;
                while (true) {
                    i--;
                    let tempEnd = localeMoment(eventItem.end).add(i, 'days');
                    let dayOfWeek = tempEnd.weekday();
                    if(dayOfWeek !== 0 && dayOfWeek !== 6) {
                        tempCount --;
                        if(tempCount === count) {
                            newEnd = tempEnd.format(DATETIME_FORMAT);
                            break;
                        }
                    }
                }
            }
        }

        let hasConflict = false;
        let slotId = schedulerData._getEventSlotId(eventItem);
        let slotName = undefined;
        let slot = schedulerData.getSlotById(slotId);
        if(!!slot)
            slotName = slot.name;
        if (config.checkConflict) {
            let start = localeMoment(eventItem.start),
                end = localeMoment(newEnd);

            events.forEach((e) => {
                if (schedulerData._getEventSlotId(e) === slotId && e.id !== eventItem.id) {
                    let eStart = localeMoment(e.start),
                        eEnd = localeMoment(e.end);
                    if ((start >= eStart && start < eEnd) || (end > eStart && end <= eEnd) || (eStart >= start && eStart < end) || (eEnd > start && eEnd <= end))
                        hasConflict = true;
                }
            });
        }

        if (hasConflict) {
            this.setState({
                left: left,
                top: top,
                width: width,
            });

            if (conflictOccurred != undefined) {
                conflictOccurred(schedulerData, 'EndResize', eventItem, DnDTypes.EVENT, slotId, slotName, eventItem.start, newEnd);
            }
            else {
                console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
            }
            this.subscribeResizeEvent(this.props);
        }
        else {
            if (updateEventEnd != undefined)
                updateEventEnd(schedulerData, eventItem, newEnd);
        }
    }

    cancelEndDrag = (ev) => {
        ev.stopPropagation();

        this.endResizer.removeEventListener('touchmove', this.doEndDrag, false);
        this.endResizer.removeEventListener('touchend', this.stopEndDrag, false);
        this.endResizer.removeEventListener('touchcancel', this.cancelEndDrag, false);
        document.onselectstart = null;
        document.ondragstart = null;
        const {schedulerData, left, top, width} = this.props;
        schedulerData._stopResizing();
        this.setState({
            left: left,
            top: top,
            width: width,
        });
    }

    render() {
        const {eventItem, isStart, isEnd, isInPopover, eventItemClick, schedulerData, isDragging, connectDragSource, connectDragPreview, eventItemTemplateResolver} = this.props;
        const {config, localeMoment} = schedulerData;
        const {left, width, top} = this.state;
        let roundCls = isStart ? (isEnd ? 'round-all' : 'round-head') : (isEnd ? 'round-tail' : 'round-none');
        let bgColor = config.defaultEventBgColor;
        if (!!eventItem.bgColor)
            bgColor = eventItem.bgColor;

        let titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, eventItem);
        let content = (
            <EventItemPopover
                {...this.props}
                eventItem={eventItem}
                title={eventItem.title}
                startTime={eventItem.start}
                endTime={eventItem.end}
                statusColor={bgColor}/>
        );

        let start = localeMoment(eventItem.start);
        let eventTitle = isInPopover ? `${start.format('HH:mm')} ${titleText}` : titleText;
        let startResizeDiv = <div />;
        if (this.startResizable(this.props))
            startResizeDiv = <div className="event-resizer event-start-resizer" ref={(ref) => this.startResizer = ref}></div>;
        let endResizeDiv = <div />;
        if (this.endResizable(this.props))
            endResizeDiv = <div className="event-resizer event-end-resizer" ref={(ref) => this.endResizer = ref}></div>;

        let eventItemTemplate = (
            <div className={roundCls + ' event-item'} key={eventItem.id}
                 style={{height: config.eventItemHeight, backgroundColor: bgColor}}>
                <span style={{marginLeft: '10px', lineHeight: `${config.eventItemHeight}px` }}>{eventTitle}</span>
            </div>
        );
        if(eventItemTemplateResolver != undefined)
            eventItemTemplate = eventItemTemplateResolver(schedulerData, eventItem, bgColor, isStart, isEnd, 'event-item', config.eventItemHeight, undefined);

        let a = <a className="timeline-event" style={{left: left, width: width, top: top}} onClick={() => { if(!!eventItemClick) eventItemClick(schedulerData, eventItem);}}>
            {eventItemTemplate}
            {startResizeDiv}
            {endResizeDiv}
        </a>;

        return (
            isDragging ? null : ( schedulerData._isResizing() || config.eventItemPopoverEnabled == false || eventItem.showPopover == false ?
                    <div>
                        {
                            connectDragPreview(
                                connectDragSource(a)
                            )
                        }
                    </div> :
                    <Popover placement="bottomLeft" content={content} trigger="hover">
                        {
                            connectDragPreview(
                                connectDragSource(a)
                            )
                        }
                    </Popover>
            )
        );
    }

    startResizable = (props) => {
        const {eventItem, isInPopover, schedulerData} = props;
        const {config} = schedulerData;
        return config.startResizable === true && isInPopover === false
            && (eventItem.resizable == undefined || eventItem.resizable !== false)
            && (eventItem.startResizable == undefined || eventItem.startResizable !== false);
    }

    endResizable = (props) => {
        const {eventItem, isInPopover, schedulerData} = props;
        const {config} = schedulerData;
        return config.endResizable === true && isInPopover === false
            && (eventItem.resizable == undefined || eventItem.resizable !== false)
            && (eventItem.endResizable == undefined || eventItem.endResizable !== false);
    }

    subscribeResizeEvent = (props) => {
        if (this.startResizer != undefined) {
            if(supportTouch) {
                // this.startResizer.removeEventListener('touchstart', this.initStartDrag, false);
                // if (this.startResizable(props))
                //     this.startResizer.addEventListener('touchstart', this.initStartDrag, false);
            } else {
                this.startResizer.removeEventListener('mousedown', this.initStartDrag, false);
                if (this.startResizable(props))
                    this.startResizer.addEventListener('mousedown', this.initStartDrag, false);
            }
        }
        if (this.endResizer != undefined) {
            if(supportTouch) {
                // this.endResizer.removeEventListener('touchstart', this.initEndDrag, false);
                // if (this.endResizable(props))
                //     this.endResizer.addEventListener('touchstart', this.initEndDrag, false);
            } else {
                this.endResizer.removeEventListener('mousedown', this.initEndDrag, false);
                if (this.endResizable(props))
                    this.endResizer.addEventListener('mousedown', this.initEndDrag, false);
            }
        }
    }
}

EventItem.propTypes = {
    schedulerData: PropTypes.object.isRequired,
    eventItem: PropTypes.object.isRequired,
    isStart: PropTypes.bool.isRequired,
    isEnd: PropTypes.bool.isRequired,
    left: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    isInPopover: PropTypes.bool.isRequired,
    leftIndex: PropTypes.number.isRequired,
    rightIndex: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    updateEventStart: PropTypes.func,
    updateEventEnd: PropTypes.func,
    moveEvent: PropTypes.func,
    subtitleGetter: PropTypes.func,
    eventItemClick: PropTypes.func,
    viewEventClick: PropTypes.func,
    viewEventText: PropTypes.string,
    viewEvent2Click: PropTypes.func,
    viewEvent2Text: PropTypes.string,
    conflictOccurred: PropTypes.func,
    eventItemTemplateResolver: PropTypes.func,
}



//============================ EventItemPopover ===============================

class EventItemPopover extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        eventItem: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
        statusColor: PropTypes.string.isRequired,
        subtitleGetter: PropTypes.func,
        viewEventClick: PropTypes.func,
        viewEventText:PropTypes.string,
        viewEvent2Click: PropTypes.func,
        viewEvent2Text: PropTypes.string,
        eventItemPopoverTemplateResolver: PropTypes.func
    }

    render(){
        const {schedulerData, eventItem, title, startTime, endTime, statusColor,subtitleGetter, viewEventClick, viewEventText, viewEvent2Click, viewEvent2Text, eventItemPopoverTemplateResolver} = this.props;
        const {localeMoment, config} = schedulerData;
        let start = localeMoment(startTime), end = localeMoment(endTime);

        if (eventItemPopoverTemplateResolver != undefined) {
            return eventItemPopoverTemplateResolver(schedulerData, eventItem, title, start, end, statusColor);
        } else {
            let subtitleRow = <div />;
            if(subtitleGetter !== undefined){
                let subtitle = subtitleGetter(schedulerData, eventItem);
                if(subtitle != undefined){
                    subtitleRow = (
                        <Row type="flex" align="middle">
                            <Col span={2}>
                                <div />
                            </Col>
                            <Col span={22} className="overflow-text">
                                <span className="header2-text" title={subtitle}>{subtitle}</span>
                            </Col>
                        </Row>
                    );
                }
            }

            let opsRow = <div />;
            if(viewEventText !== undefined && viewEventClick !== undefined && (eventItem.clickable1 == undefined || eventItem.clickable1)){
                let col = (
                    <Col span={22}>
                        <span className="header2-text" style={{color: '#108EE9', cursor: 'pointer'}} onClick={() => {viewEventClick(schedulerData, eventItem);}}>{viewEventText}</span>
                    </Col>
                );
                if(viewEvent2Text !== undefined && viewEvent2Click !== undefined && (eventItem.clickable2 == undefined || eventItem.clickable2)) {
                    col = (
                        <Col span={22}>
                            <span className="header2-text" style={{color: '#108EE9', cursor: 'pointer'}} onClick={() => {viewEventClick(schedulerData, eventItem);}}>{viewEventText}</span><span className="header2-text" style={{color: '#108EE9', cursor: 'pointer', marginLeft: '16px'}} onClick={() => {viewEvent2Click(schedulerData, eventItem);}}>{viewEvent2Text}</span>
                        </Col>
                    )
                };
                opsRow = (
                    <Row type="flex" align="middle">
                        <Col span={2}>
                            <div />
                        </Col>
                        {col}
                    </Row>
                );
            }
            else if(viewEvent2Text !== undefined && viewEvent2Click !== undefined && (eventItem.clickable2 == undefined || eventItem.clickable2)) {
                let col = (
                    <Col span={22}>
                        <span className="header2-text" style={{color: '#108EE9', cursor: 'pointer'}} onClick={() => {viewEvent2Click(schedulerData, eventItem);}}>{viewEvent2Text}</span>
                    </Col>
                );
                opsRow = (
                    <Row type="flex" align="middle">
                        <Col span={2}>
                            <div />
                        </Col>
                        {col}
                    </Row>
                );
            }

            let dateFormat = config.eventItemPopoverDateFormat;
            return (
                <div style={{width: '300px'}}>
                    <Row type="flex" align="middle">
                        <Col span={2}>
                            <div className="status-dot" style={{backgroundColor: statusColor}} />
                        </Col>
                        <Col span={22} className="overflow-text">
                            <span className="header2-text" title={title}>{title}</span>
                        </Col>
                    </Row>
                    {subtitleRow}
                    <Row type="flex" align="middle">
                        <Col span={2}>
                            <div />
                        </Col>
                        <Col span={22}>
                            <span className="header1-text">{start.format('HH:mm')}</span><span className="help-text" style={{marginLeft: '8px'}}>{start.format(dateFormat)}</span><span className="header2-text"  style={{marginLeft: '8px'}}>-</span><span className="header1-text" style={{marginLeft: '8px'}}>{end.format('HH:mm')}</span><span className="help-text" style={{marginLeft: '8px'}}>{end.format(dateFormat)}</span>
                        </Col>
                    </Row>
                    {opsRow}
                </div>
            );
        }
    }
}





// ==================== Cells Unit, DateFormat,DndTypes,ViewTypes =============================
const CellUnits = {
    Day: 0,
    Hour: 1
}

const DnDTypes = {
    EVENT: 'event'
};

const ViewTypes = {
    Day: 0,
    Week: 1,
    Month: 2,
    Quarter: 3,
    Year: 4,
    Custom: 5,
    Custom1: 6,
    Custom2: 7
};

function getPos(element) {
    let x = 0, y = 0;
    if(!!element) {
        do {
            x += element.offsetLeft - element.scrollLeft;
            y += element.offsetTop - element.scrollTop;
        } while (element = element.offsetParent);
    }
    return { 'x': x, 'y': y };
}

export {
    getPos
}



//========================== DndContext ==================================

class DnDContext {
    constructor(sources, DecoratedComponent) {
        this.sourceMap = new Map();
        sources.forEach((item) => {
            this.sourceMap.set(item.dndType, item);
        })
        this.DecoratedComponent = DecoratedComponent;
    }

    getDropSpec = () => {
        return {
            drop: (props, monitor, component) =>{
                const {schedulerData, resourceEvents} = props;
                const {cellUnit, localeMoment} = schedulerData;
                const type = monitor.getItemType();
                const pos = getPos(component.eventContainer);
                let cellWidth = schedulerData.getContentCellWidth();
                let initialStartTime = null, initialEndTime = null;
                if(type === DnDTypes.EVENT) {
                    const initialPoint = monitor.getInitialClientOffset();
                    let initialLeftIndex = Math.floor((initialPoint.x - pos.x)/cellWidth);
                    initialStartTime = resourceEvents.headerItems[initialLeftIndex].start;
                    initialEndTime = resourceEvents.headerItems[initialLeftIndex].end;
                    if(cellUnit !== CellUnits.Hour)
                        initialEndTime = localeMoment(resourceEvents.headerItems[initialLeftIndex].start).hour(23).minute(59).second(59).format(DATETIME_FORMAT);
                }
                const point = monitor.getClientOffset();                
                let leftIndex = Math.floor((point.x - pos.x)/cellWidth);
                let startTime = resourceEvents.headerItems[leftIndex].start;
                let endTime = resourceEvents.headerItems[leftIndex].end;
                if(cellUnit !== CellUnits.Hour)
                    endTime = localeMoment(resourceEvents.headerItems[leftIndex].start).hour(23).minute(59).second(59).format(DATETIME_FORMAT);

                return {
                    slotId: resourceEvents.slotId,
                    slotName: resourceEvents.slotName,
                    start: startTime,
                    end: endTime,
                    initialStart: initialStartTime,
                    initialEnd: initialEndTime
                };
            },

            hover: (props, monitor, component) => {
                const {schedulerData, resourceEvents, movingEvent} = props;
                const {cellUnit, config, viewType, localeMoment} = schedulerData;
                const item = monitor.getItem();
                const type = monitor.getItemType();
                const pos = getPos(component.eventContainer);
                let cellWidth = schedulerData.getContentCellWidth();
                let initialStart = null, initialEnd = null;
                if(type === DnDTypes.EVENT) {
                    const initialPoint = monitor.getInitialClientOffset();
                    let initialLeftIndex = Math.floor((initialPoint.x - pos.x)/cellWidth);
                    initialStart = resourceEvents.headerItems[initialLeftIndex].start;
                    initialEnd = resourceEvents.headerItems[initialLeftIndex].end;
                    if(cellUnit !== CellUnits.Hour)
                        initialEnd = localeMoment(resourceEvents.headerItems[initialLeftIndex].start).hour(23).minute(59).second(59).format(DATETIME_FORMAT);
                }
                const point = monitor.getClientOffset();                
                let leftIndex = Math.floor((point.x - pos.x)/cellWidth);
                let newStart = resourceEvents.headerItems[leftIndex].start;
                let newEnd = resourceEvents.headerItems[leftIndex].end;
                if(cellUnit !== CellUnits.Hour)
                    newEnd = localeMoment(resourceEvents.headerItems[leftIndex].start).hour(23).minute(59).second(59).format(DATETIME_FORMAT);
                let slotId = resourceEvents.slotId, slotName = resourceEvents.slotName;
                let action = 'New';
                let isEvent = type === DnDTypes.EVENT;
                if(isEvent) {
                    const event = item;
                    if(config.relativeMove) {
                        newStart = localeMoment(event.start).add(localeMoment(newStart).diff(localeMoment(initialStart)), 'ms').format(DATETIME_FORMAT);
                    } else {
                        if(viewType !== ViewTypes.Day) {
                            let tmpMoment = localeMoment(newStart);
                            newStart = localeMoment(event.start).year(tmpMoment.year()).month(tmpMoment.month()).date(tmpMoment.date()).format(DATETIME_FORMAT);
                        }
                    }
                    newEnd = localeMoment(newStart).add(localeMoment(event.end).diff(localeMoment(event.start)), 'ms').format(DATETIME_FORMAT);

                    //if crossResourceMove disabled, slot returns old value
                    if(config.crossResourceMove === false) {
                        slotId = schedulerData._getEventSlotId(item);
                        slotName = undefined;
                        let slot = schedulerData.getSlotById(slotId);
                        if(!!slot)
                            slotName = slot.name;
                    }

                    action = 'Move';
                }

                if(!!movingEvent) {
                    movingEvent(schedulerData, slotId, slotName, newStart, newEnd, action, type, item);
                }
            },

            canDrop: (props, monitor) => {
                const {schedulerData, resourceEvents} = props;
                const item = monitor.getItem();
                if(schedulerData._isResizing()) return false;
                const {config} = schedulerData;
                return config.movable && !resourceEvents.groupOnly && (item.movable == undefined || item.movable !== false);
            }
        }
    }

    getDropCollect = (connect, monitor) => {
        return {
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver()
        };
    }

    getDropTarget = () => {
        return DropTarget([...this.sourceMap.keys()], this.getDropSpec(), this.getDropCollect)(this.DecoratedComponent);
    }

    getDndSource = (dndType = DnDTypes.EVENT) => {
        return this.sourceMap.get(dndType);
    }
}



//================================ DndSource ================================

class DnDSource {
    constructor(resolveDragObjFunc, DecoratedComponent, dndType = DnDTypes.EVENT) {
        this.resolveDragObjFunc = resolveDragObjFunc;
        this.DecoratedComponent = DecoratedComponent;
        this.dndType = dndType;
        this.dragSource = DragSource(this.dndType, this.getDragSpec(), this.getDragCollect)(this.DecoratedComponent);
    }

    getDragSpec = () => {
        return {
            beginDrag: (props, monitor, component) => {
                return this.resolveDragObjFunc(props);
            },
            endDrag: (props, monitor, component) => {
                if(!monitor.didDrop()) return;

                const {moveEvent, newEvent, schedulerData } = props;
                const {events, config, viewType, localeMoment} = schedulerData;
                const item = monitor.getItem();
                const type = monitor.getItemType();
                const dropResult = monitor.getDropResult();
                let slotId = dropResult.slotId, slotName = dropResult.slotName;
                let newStart = dropResult.start, newEnd = dropResult.end;
                let initialStart = dropResult.initialStart, initialEnd = dropResult.initialEnd;
                let action = 'New';

                let isEvent = type === DnDTypes.EVENT;
                if(isEvent) {
                    const event = item;
                    if(config.relativeMove) {
                        newStart = localeMoment(event.start).add(localeMoment(newStart).diff(localeMoment(initialStart)), 'ms').format(DATETIME_FORMAT);
                    } else {
                        if(viewType !== ViewTypes.Day) {
                            let tmpMoment = localeMoment(newStart);
                            newStart = localeMoment(event.start).year(tmpMoment.year()).month(tmpMoment.month()).date(tmpMoment.date()).format(DATETIME_FORMAT);
                        }
                    }
                    newEnd = localeMoment(newStart).add(localeMoment(event.end).diff(localeMoment(event.start)), 'ms').format(DATETIME_FORMAT);

                    //if crossResourceMove disabled, slot returns old value
                    if(config.crossResourceMove === false) {
                        slotId = schedulerData._getEventSlotId(item);
                        slotName = undefined;
                        let slot = schedulerData.getSlotById(slotId);
                        if(!!slot)
                            slotName = slot.name;
                    }

                    action = 'Move';
                }

                let hasConflict = false;
                if(config.checkConflict) {
                    let start = localeMoment(newStart),
                        end = localeMoment(newEnd);

                    events.forEach((e) =>{
                        if(schedulerData._getEventSlotId(e) === slotId && (!isEvent || e.id !== item.id)) {
                            let eStart = localeMoment(e.start),
                                eEnd = localeMoment(e.end);
                            if((start >= eStart && start < eEnd) || (end > eStart && end <= eEnd) || (eStart >= start && eStart < end) || (eEnd > start && eEnd <= end))
                                hasConflict = true;
                        }
                    });
                }

                if(hasConflict) {
                    const {conflictOccurred} = props;
                    if(conflictOccurred != undefined){
                        conflictOccurred(schedulerData, action, item, type, slotId, slotName, newStart, newEnd);
                    }
                    else {
                        console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
                    }
                }
                else {
                    if(isEvent) {
                        if (moveEvent !== undefined) {
                            moveEvent(schedulerData, item, slotId, slotName, newStart, newEnd);
                        }
                    }
                    else {
                        if(newEvent !== undefined)
                            newEvent(schedulerData, slotId, slotName, newStart, newEnd, type, item);
                    }
                }
            },

            canDrag: (props) => {
                const {schedulerData, resourceEvents} = props;
                const item = this.resolveDragObjFunc(props);
                if(schedulerData._isResizing()) return false;
                const {config} = schedulerData;
                return config.movable && (resourceEvents == undefined || !resourceEvents.groupOnly) && (item.movable == undefined || item.movable !== false);
            }
        }
    }

    getDragCollect = (connect, monitor) => {
        return {
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging(),
            connectDragPreview: connect.dragPreview()
        };
    }

    getDragSource = () => {
        return this.dragSource;
    }
}






//========================================== ResourceView =======================================

class ResourceView extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        contentScrollbarHeight: PropTypes.number.isRequired,
        slotClickedFunc: PropTypes.func,
        slotItemTemplateResolver: PropTypes.func,
        toggleExpandFunc: PropTypes.func
    }

    render() {

        const {schedulerData, contentScrollbarHeight, slotClickedFunc, slotItemTemplateResolver, toggleExpandFunc} = this.props;
        const {renderData} = schedulerData;

        let width = schedulerData.getResourceTableWidth() - 2;
        let paddingBottom = contentScrollbarHeight;
        let displayRenderData = renderData.filter(o => o.render);
        let resourceList = displayRenderData.map((item) => {
            let indents = [];
            for(let i=0;i<item.indent;i++) {
                indents.push(<span key={`es${i}`} className="expander-space"></span>);
            }
            let indent = <span key={`es${item.indent}`} className="expander-space"></span>;
            if(item.hasChildren) {
                indent = item.expanded ? (
                    <Icon type="minus-square" key={`es${item.indent}`} style={{}} className=""
                        onClick={() => {
                            if(!!toggleExpandFunc)
                                toggleExpandFunc(schedulerData, item.slotId);
                        }}/>
                ) : (
                    <Icon type="plus-square" key={`es${item.indent}`} style={{}} className=""
                        onClick={() => {
                            if(!!toggleExpandFunc)
                                toggleExpandFunc(schedulerData, item.slotId);
                        }}/>
                );
            }
            indents.push(indent);
                    
            let a = slotClickedFunc != undefined ? <span className="slot-cell">{indents}<a className="slot-text" onClick={() => {
                slotClickedFunc(schedulerData, item);
            }}>{item.slotName}</a></span>
                : <span className="slot-cell">{indents}<span className="slot-text">{item.slotName}</span></span>;
            let slotItem = (
                <div title={item.slotName} className="overflow-text header2-text" style={{textAlign: "left"}}>
                    {a}
                </div>
            );
            if(!!slotItemTemplateResolver) {
                let temp = slotItemTemplateResolver(schedulerData, item, slotClickedFunc, width, "overflow-text header2-text");
                if(!!temp)
                    slotItem = temp;
            }

            let tdStyle = {height: item.rowHeight};
            if(item.groupOnly) {
                tdStyle = {
                    ...tdStyle,
                    backgroundColor: schedulerData.config.groupOnlySlotColor
                };
            }

            return (
                <tr key={item.slotId}>
                    <td data-resource-id={item.slotId} style={tdStyle}>
                        {slotItem}
                    </td>
                </tr>
            );
        });

        return (
            <div style={{paddingBottom: paddingBottom}}>
                <table className="resource-table">
                    <tbody>
                        {resourceList}
                    </tbody>
                </table>
            </div>
        )
    }
}





// ======================================== HeaderView ====================================

class HeaderView extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        nonAgendaCellHeaderTemplateResolver : PropTypes.func,
    }

    render() {
        const {schedulerData, nonAgendaCellHeaderTemplateResolver} = this.props;
        const {headers, cellUnit, config, localeMoment} = schedulerData;
        let headerHeight = schedulerData.getTableHeaderHeight();
        let cellWidth = schedulerData.getContentCellWidth();
        let minuteStepsInHour = schedulerData.getMinuteStepsInHour();

        let headerList = [];
        let style = {};
        if(cellUnit === CellUnits.Hour){
            headers.forEach((item, index) => {
                if(index % minuteStepsInHour === 0){
                    let datetime = localeMoment(item.time);
                    const isCurrentTime = datetime.isSame(new Date(), 'hour');

                    style = !!item.nonWorkingTime ? {width: cellWidth*minuteStepsInHour, color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor} : {width: cellWidth*minuteStepsInHour};

                    if(index === headers.length - minuteStepsInHour)
                        style = !!item.nonWorkingTime ? {color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor} : {};

                    let pFormattedList = config.nonAgendaDayCellHeaderFormat.split('|').map(item => datetime.format(item));
                    let element;

                    if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
                        element = nonAgendaCellHeaderTemplateResolver(schedulerData, item, pFormattedList, style)
                    }
                    else {
                        const pList = pFormattedList.map((item, index) => (
                            <div key={index}>{item}</div>
                        ));

                        element = (
                            <th key={item.time} className="header3-text" style={style}>
                                <div>
                                    {pList}
                                </div>
                            </th>
                        );
                    }

                    headerList.push(element);
                }
            })
        }
        else {
            headerList = headers.map((item, index) => {
                let datetime = localeMoment(item.time);
                style = !!item.nonWorkingTime ? {width: cellWidth, color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor} : {width: cellWidth};
                if(index === headers.length - 1)
                    style = !!item.nonWorkingTime ? {color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor} : {};

                let pFormattedList = config.nonAgendaOtherCellHeaderFormat.split('|').map(item => datetime.format(item));

                if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
                    return nonAgendaCellHeaderTemplateResolver(schedulerData, item, pFormattedList, style)
                }

                const pList = pFormattedList.map((item, index) => (
                    <div key={index}>{item}</div>
                ));

                return (
                    <th key={item.time} className="header3-text" style={style}>
                        <div>
                            {pList}
                        </div>
                    </th>
                );
            });
        }

        return (
            <thead>
                <tr style={{height: headerHeight}}>
                    {headerList}
                </tr>
            </thead>
        );
    }
}




//============================= BodyView =============================


class BodyView extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
    }

    render() {

        const {schedulerData} = this.props;
        const {renderData, headers, config, behaviors} = schedulerData;
        let cellWidth = schedulerData.getContentCellWidth();

        let displayRenderData = renderData.filter(o => o.render);
        let tableRows = displayRenderData.map((item) => {
            let rowCells = headers.map((header, index) => {
                let key = item.slotId + '_' + header.time;
                let style = index === headers.length - 1 ? {} : {width: cellWidth};
                if(!!header.nonWorkingTime)
                    style = {...style, backgroundColor: config.nonWorkingTimeBodyBgColor};
                if(item.groupOnly)
                    style = {...style, backgroundColor: config.groupOnlySlotColor};
                if(!!behaviors.getNonAgendaViewBodyCellBgColorFunc){
                    let cellBgColor = behaviors.getNonAgendaViewBodyCellBgColorFunc(schedulerData, item.slotId, header);
                    if(!!cellBgColor)
                        style = {...style, backgroundColor: cellBgColor};
                }
                return (
                    <td key={key} style={style}><div></div></td>
                )
            });

            return (
                <tr key={item.slotId} style={{height: item.rowHeight}}>
                    {rowCells}
                </tr>
            );
        });

        return (
            <tbody>
                {tableRows}
            </tbody>
        );
    }
}









//==================================== ResourcesEvent ====================================

class ResourceEvents extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isSelecting: false,
            left: 0,
            width: 0,
        }
    }

    static propTypes = {
        resourceEvents: PropTypes.object.isRequired,
        schedulerData: PropTypes.object.isRequired,
        dndSource: PropTypes.object.isRequired,
        onSetAddMoreState: PropTypes.func,
        updateEventStart: PropTypes.func,
        updateEventEnd: PropTypes.func,
        moveEvent: PropTypes.func,
        movingEvent: PropTypes.func,
        conflictOccurred: PropTypes.func,
        subtitleGetter: PropTypes.func,
        eventItemClick: PropTypes.func,
        viewEventClick: PropTypes.func,
        viewEventText:PropTypes.string,
        viewEvent2Click: PropTypes.func,
        viewEvent2Text: PropTypes.string,
        newEvent: PropTypes.func,
        eventItemTemplateResolver: PropTypes.func,
    }

    componentDidMount() {
        const {schedulerData} = this.props;
        const {config} = schedulerData;
        if(config.creatable === true) {
            if(supportTouch) {
                // this.eventContainer.addEventListener('touchstart', this.initDrag, false);
            } else {
                this.eventContainer.addEventListener('mousedown', this.initDrag, false);
            }            
        }
    }

    componentWillReceiveProps(np) {
        if(supportTouch) {
            // this.eventContainer.removeEventListener('touchstart', this.initDrag, false);
        } else {
            this.eventContainer.removeEventListener('mousedown', this.initDrag, false);
        }        
        if(np.schedulerData.config.creatable) {
            if(supportTouch) {
                // this.eventContainer.addEventListener('touchstart', this.initDrag, false);
            } else {
                this.eventContainer.addEventListener('mousedown', this.initDrag, false);
            }
        }            
    }

    initDrag = (ev) => {
        const { isSelecting } = this.state;
        if(isSelecting) return;
        if((ev.srcElement || ev.target) !== this.eventContainer) return;

        ev.stopPropagation();
        
        const {resourceEvents} = this.props;
        if(resourceEvents.groupOnly) return;
        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) return;
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            if(ev.buttons !== undefined && ev.buttons !== 1) return;
            clientX = ev.clientX;
        }

        const {schedulerData} = this.props;
        let cellWidth = schedulerData.getContentCellWidth();
        let pos = getPos(this.eventContainer);
        let startX = clientX - pos.x;
        let leftIndex = Math.floor(startX/cellWidth);
        let left = leftIndex*cellWidth;
        let rightIndex = Math.ceil(startX/cellWidth);
        let width = (rightIndex - leftIndex)*cellWidth;

        this.setState({
            startX: startX,
            left: left,
            leftIndex: leftIndex,
            width: width,
            rightIndex: rightIndex,
            isSelecting: true
        });

        if(supportTouch) {
            document.documentElement.addEventListener('touchmove', this.doDrag, false);
            document.documentElement.addEventListener('touchend', this.stopDrag, false);
            document.documentElement.addEventListener('touchcancel', this.cancelDrag, false);
        } else {
            document.documentElement.addEventListener('mousemove', this.doDrag, false);
            document.documentElement.addEventListener('mouseup', this.stopDrag, false);
        }
        document.onselectstart = function () {
			return false;
		};
		document.ondragstart = function () {
			return false;
		};
    }

    doDrag = (ev) => {
        ev.stopPropagation();

        let clientX = 0;
        if(supportTouch) {
            if(ev.changedTouches.length == 0) return;
            const touch = ev.changedTouches[0];
            clientX = touch.pageX;
        } else {
            clientX = ev.clientX;
        }
        const { startX } = this.state;
        const {schedulerData} = this.props;
        const {headers} = schedulerData;
        let cellWidth = schedulerData.getContentCellWidth();
        let pos = getPos(this.eventContainer);
        let currentX = clientX - pos.x;
        let leftIndex = Math.floor(Math.min(startX, currentX)/cellWidth);
        leftIndex = leftIndex < 0 ? 0 : leftIndex;
        let left = leftIndex*cellWidth;
        let rightIndex = Math.ceil(Math.max(startX, currentX)/cellWidth);
        rightIndex = rightIndex > headers.length ? headers.length : rightIndex;
        let width = (rightIndex - leftIndex)*cellWidth;

        this.setState({
            leftIndex: leftIndex,
            left: left,
            rightIndex: rightIndex,
            width: width,
            isSelecting: true
        });
    }

    stopDrag = (ev) => {
        ev.stopPropagation();

        const {schedulerData, newEvent, resourceEvents} = this.props;
        const {headers, events, config, cellUnit, localeMoment} = schedulerData;
        const { leftIndex, rightIndex } = this.state;
        if(supportTouch) {
            document.documentElement.removeEventListener('touchmove', this.doDrag, false);
            document.documentElement.removeEventListener('touchend', this.stopDrag, false);
            document.documentElement.removeEventListener('touchcancel', this.cancelDrag, false);
        } else {
            document.documentElement.removeEventListener('mousemove', this.doDrag, false);
            document.documentElement.removeEventListener('mouseup', this.stopDrag, false);
        }
        document.onselectstart = null;
        document.ondragstart = null;

        let startTime = headers[leftIndex].time;
        let endTime = resourceEvents.headerItems[rightIndex - 1].end;
        if(cellUnit !== CellUnits.Hour)
            endTime = localeMoment(resourceEvents.headerItems[rightIndex - 1].start).hour(23).minute(59).second(59).format(DATETIME_FORMAT);
        let slotId = resourceEvents.slotId;
        let slotName = resourceEvents.slotName;

        this.setState({
            startX: 0,
            leftIndex: 0,
            left: 0,
            rightIndex: 0,
            width: 0,
            isSelecting: false
        });

        let hasConflict = false;
        if(config.checkConflict){
            let start = localeMoment(startTime),
                end = localeMoment(endTime);

            events.forEach((e) =>{
                if(schedulerData._getEventSlotId(e) === slotId) {
                    let eStart = localeMoment(e.start),
                        eEnd = localeMoment(e.end);
                    if((start >= eStart && start < eEnd) || (end > eStart && end <= eEnd) || (eStart >= start && eStart < end) || (eEnd > start && eEnd <= end))
                        hasConflict = true;
                }
            });
        }

        if(hasConflict) {
            const {conflictOccurred} = this.props;
            if(conflictOccurred != undefined){
                conflictOccurred(schedulerData, 'New', {
                    id: undefined,
                    start: startTime,
                    end: endTime,
                    slotId: slotId,
                    slotName: slotName,
                    title: undefined,
                }, DnDTypes.EVENT, slotId, slotName, startTime, endTime);
            }
            else {
                console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
            }
        }
        else {
            if(newEvent != undefined)
                newEvent(schedulerData, slotId, slotName, startTime, endTime);
        }
    }

    cancelDrag = (ev) => {
        ev.stopPropagation();

        const { isSelecting } = this.state;
        if(isSelecting) {
            document.documentElement.removeEventListener('touchmove', this.doDrag, false);
            document.documentElement.removeEventListener('touchend', this.stopDrag, false);
            document.documentElement.removeEventListener('touchcancel', this.cancelDrag, false);
            document.onselectstart = null;
            document.ondragstart = null;
            this.setState({
                startX: 0,
                leftIndex: 0,
                left: 0,
                rightIndex: 0,
                width: 0,
                isSelecting: false
            });
        }
    }

    render() {
        const {resourceEvents, schedulerData, connectDropTarget, dndSource} = this.props;
        const {cellUnit, startDate, endDate, config, localeMoment} = schedulerData;
        const {isSelecting, left, width} = this.state;
        let cellWidth = schedulerData.getContentCellWidth();
        let cellMaxEvents = schedulerData.getCellMaxEvents();
        let rowWidth = schedulerData.getContentTableWidth();
        let DnDEventItem = dndSource.getDragSource();

        let selectedArea = isSelecting ? <SelectedArea {...this.props} left={left} width={width} /> : <div />;

        let eventList = [];
        resourceEvents.headerItems.forEach((headerItem, index) => {

            if (headerItem.count > 0 || headerItem.summary != undefined) {

                let isTop = config.summaryPos === SummaryPos.TopRight || config.summaryPos === SummaryPos.Top || config.summaryPos === SummaryPos.TopLeft;
                let marginTop = resourceEvents.hasSummary && isTop ? 1 + config.eventItemLineHeight : 1;
                let renderEventsMaxIndex = headerItem.addMore === 0 ? cellMaxEvents : headerItem.addMoreIndex;

                headerItem.events.forEach((evt, idx) => {
                    if(idx < renderEventsMaxIndex && evt !== undefined && evt.render) {
                        let durationStart = localeMoment(startDate);
                        let durationEnd = localeMoment(endDate).add(1, 'days');
                        if(cellUnit === CellUnits.Hour){
                            durationStart = localeMoment(startDate).add(config.dayStartFrom, 'hours');
                            durationEnd = localeMoment(endDate).add(config.dayStopTo + 1, 'hours');
                        }
                        let eventStart = localeMoment(evt.eventItem.start);
                        let eventEnd = localeMoment(evt.eventItem.end);
                        let isStart = eventStart >= durationStart;
                        let isEnd = eventEnd <= durationEnd;
                        let left = index*cellWidth + (index > 0 ? 2 : 3);
                        let width = (evt.span * cellWidth - (index > 0 ? 5 : 6)) > 0 ? (evt.span * cellWidth - (index > 0 ? 5 : 6)) : 0;
                        let top = marginTop + idx*config.eventItemLineHeight;
                        let eventItem = <DnDEventItem
                                                   {...this.props}
                                                   key={evt.eventItem.id}
                                                   eventItem={evt.eventItem}
                                                   isStart={isStart}
                                                   isEnd={isEnd}
                                                   isInPopover={false}
                                                   left={left}
                                                   width={width}
                                                   top={top}
                                                   leftIndex={index}
                                                   rightIndex={index + evt.span}
                                                   />
                        eventList.push(eventItem);
                    }
                });

                if(headerItem.addMore > 0) {
                    let left = index*cellWidth + (index > 0 ? 2 : 3);
                    let width = cellWidth - (index > 0 ? 5 : 6);
                    let top = marginTop + headerItem.addMoreIndex*config.eventItemLineHeight;
                    let addMoreItem = <AddMore
                                            {...this.props}
                                            key={headerItem.time}
                                            headerItem={headerItem}
                                            number={headerItem.addMore}
                                            left={left}
                                            width={width}
                                            top={top}
                                            clickAction={this.onAddMoreClick}
                                        />;
                    eventList.push(addMoreItem);
                }

                if(headerItem.summary != undefined) {
                    let top = isTop ? 1 : resourceEvents.rowHeight - config.eventItemLineHeight + 1;
                    let left = index*cellWidth + (index > 0 ? 2 : 3);
                    let width = cellWidth - (index > 0 ? 5 : 6);
                    let key = `${resourceEvents.slotId}_${headerItem.time}`;
                    let summary = <Summary key={key} schedulerData={schedulerData} summary={headerItem.summary} left={left} width={width} top={top} />;
                    eventList.push(summary);
                }
            }
        });

        return (
            <tr>
                <td style={{width: rowWidth}}>
                    {
                        connectDropTarget(
                            <div ref={this.eventContainerRef} className="event-container" style={{height: resourceEvents.rowHeight}}>
                                {selectedArea}
                                {eventList}
                            </div>
                        )
                    }
                </td>
            </tr>
        );
    }

    onAddMoreClick = (headerItem) => {
        const {onSetAddMoreState, resourceEvents, schedulerData} = this.props;
        if(!!onSetAddMoreState){
            const {config} = schedulerData;
            let cellWidth = schedulerData.getContentCellWidth();
            let index = resourceEvents.headerItems.indexOf(headerItem);
            if(index !== -1){
                let left = index*(cellWidth -1);
                let pos = getPos(this.eventContainer);
                left = left + pos.x;
                let top = pos.y;
                let height = (headerItem.count + 1) * config.eventItemLineHeight + 20;

                onSetAddMoreState({
                    headerItem: headerItem,
                    left: left,
                    top: top,
                    height: height
                });
            }
        }
    }

    eventContainerRef = (element) => {
        this.eventContainer = element;
    }
}









//=============================== AddMore ================================


class AddMore extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        number: PropTypes.number.isRequired,
        left: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        clickAction: PropTypes.func.isRequired,
        headerItem: PropTypes.object.isRequired,
    }

    render() {
        const {number, left, width, top, clickAction, headerItem, schedulerData} = this.props;
        const {config} = schedulerData;
        let content = '+'+number+'more';

        return (
        <a className="timeline-event" style={{left: left, width: width, top: top}} onClick={() => {clickAction(headerItem);}} >
            <div style={{height: config.eventItemHeight, color: '#999', textAlign: 'center'}}>
                {content}
            </div>
        </a>
        );
    }
}



//==================================== Sumary =================================

class Summary extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        summary: PropTypes.object.isRequired,
        left: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
    }

    render() {
        const {summary, left, width, top, schedulerData} = this.props;
        const {config} = schedulerData;
        let color = config.summaryColor;
        if(summary.color != undefined)
            color = summary.color;
        let textAlign = 'center';
        if(config.summaryPos === SummaryPos.TopRight || config.summaryPos === SummaryPos.BottomRight)
            textAlign = 'right';
        else if(config.summaryPos === SummaryPos.TopLeft || config.summaryPos === SummaryPos.BottomLeft)
            textAlign = 'left';
        let style = {height: config.eventItemHeight, color: color, textAlign: textAlign, marginLeft: '6px', marginRight: '6px'};
        if(summary.fontSize != undefined)
            style = {...style, fontSize: summary.fontSize};

        return (
            <a className="timeline-event header2-text" style={{left: left, width: width, top: top, cursor: 'default'}} >
                <div style={style}>
                    {summary.text}
                </div>
            </a>
        );
    }
}

const SummaryPos = {
    Top: 0,
    TopRight: 1,
    TopLeft: 2,
    Bottom: 3,
    BottomRight: 4,
    BottomLeft: 5
};








//===================================== SelectedArea ===================================

class SelectedArea extends Component {
    constructor(props){
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        left: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
    }

    render() {
        const {left, width, schedulerData} = this.props;
        const {config} = schedulerData;

        return (
            <div className="selected-area" style={{left: left, width: width, top: 0, bottom: 0, backgroundColor: config.selectedAreaColor}}>
            </div>
        );
    }
}






//================================== AgendaView =================================


class AgendaView extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        subtitleGetter: PropTypes.func,
        eventItemClick: PropTypes.func,
        viewEventClick: PropTypes.func,
        viewEventText:PropTypes.string,
        viewEvent2Click: PropTypes.func,
        viewEvent2Text: PropTypes.string,
        slotClickedFunc: PropTypes.func,
    }

    render() {

        const {schedulerData} = this.props;
        const {config} = schedulerData;
        const {renderData} = schedulerData;
        let agendaResourceTableWidth = schedulerData.getResourceTableWidth(), tableHeaderHeight = schedulerData.getTableHeaderHeight();
        let resourceEventsList = renderData.map((item) => {
            return <AgendaResourceEvents
                {...this.props}
                resourceEvents={item}
                key={item.slotId} />
        });
        let resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;
        let agendaViewHeader = config.agendaViewHeader;

        return (
            <tr>
                <td>
                    <table className="scheduler-table">
                        <thead>
                            <tr style={{height: tableHeaderHeight}}>
                                <th style={{width: agendaResourceTableWidth}} className="header3-text">{resourceName}</th>
                                <th className="header3-text">{agendaViewHeader}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resourceEventsList}
                        </tbody>
                    </table>
                </td>
            </tr>
        );
    }
}


//============================= AgendaResourcesEvent =============================

class AgendaResourceEvents extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        resourceEvents: PropTypes.object.isRequired,
        subtitleGetter: PropTypes.func,
        eventItemClick: PropTypes.func,
        viewEventClick: PropTypes.func,
        viewEventText:PropTypes.string,
        viewEvent2Click: PropTypes.func,
        viewEvent2Text: PropTypes.string,
        slotClickedFunc: PropTypes.func,
        slotItemTemplateResolver: PropTypes.func
    }

    render(){
        const {schedulerData, resourceEvents, slotClickedFunc, slotItemTemplateResolver} = this.props;
        const {startDate, endDate, config, localeMoment} = schedulerData;
        let agendaResourceTableWidth = schedulerData.getResourceTableWidth();
        let width = agendaResourceTableWidth - 2;

        let events = [];
        resourceEvents.headerItems.forEach((item) => {
            let start = localeMoment(startDate).format(DATE_FORMAT),
                end = localeMoment(endDate).add(1, 'days').format(DATE_FORMAT),
                headerStart = localeMoment(item.start).format(DATE_FORMAT),
                headerEnd = localeMoment(item.end).format(DATE_FORMAT);

            if(start === headerStart && end === headerEnd) {
                item.events.forEach((evt) => {
                    let durationStart = localeMoment(startDate);
                    let durationEnd = localeMoment(endDate).add(1, 'days');
                    let eventStart = localeMoment(evt.eventItem.start);
                    let eventEnd = localeMoment(evt.eventItem.end);
                    let isStart = eventStart >= durationStart;
                    let isEnd = eventEnd < durationEnd;
                    let eventItem = <AgendaEventItem
                                        {...this.props}
                                        key={evt.eventItem.id}
                                        eventItem={evt.eventItem}
                                        isStart={isStart}
                                        isEnd={isEnd}
                                    />;
                    events.push(eventItem);
                });
            }
        });

        let a = slotClickedFunc != undefined ? <a onClick={() => {
            slotClickedFunc(schedulerData, resourceEvents);
        }}>{resourceEvents.slotName}</a>
            : <span>{resourceEvents.slotName}</span>;
        let slotItem = (
            <div style={{width: width}} title={resourceEvents.slotName} className="overflow-text header2-text">
                {a}
            </div>
        );
        if(!!slotItemTemplateResolver) {
            let temp = slotItemTemplateResolver(schedulerData, resourceEvents, slotClickedFunc, width, "overflow-text header2-text");
            if(!!temp)
                slotItem = temp;
        }

        return (
            <tr style={{minHeight: config.eventItemLineHeight + 2}}>
                <td data-resource-id={resourceEvents.slotId}>
                    {slotItem}
                </td>
                <td>
                    <div className="day-event-container">
                        {events}
                    </div>
                </td>
            </tr>
        );
    }
}



//==================================== AgendaEventItem ===================================

class AgendaEventItem extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        eventItem: PropTypes.object.isRequired,
        isStart: PropTypes.bool.isRequired,
        isEnd: PropTypes.bool.isRequired,
        subtitleGetter: PropTypes.func,
        eventItemClick: PropTypes.func,
        viewEventClick: PropTypes.func,
        viewEventText:PropTypes.string,
        viewEvent2Click: PropTypes.func,
        viewEvent2Text: PropTypes.string,
        eventItemTemplateResolver: PropTypes.func,
    }

    render() {
        const {eventItem, isStart, isEnd, eventItemClick, schedulerData, eventItemTemplateResolver} = this.props;
        const {config} = schedulerData;
        let roundCls = isStart ? (isEnd ? 'round-all' : 'round-head') : (isEnd ? 'round-tail' : 'round-none');
        let bgColor = config.defaultEventBgColor;
        if(!!eventItem.bgColor)
            bgColor = eventItem.bgColor;

        let titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, eventItem);
        let content = (
            <EventItemPopover
                {...this.props}
                title={eventItem.title}
                startTime={eventItem.start}
                endTime={eventItem.end}
                statusColor={bgColor}
            />
        );

        let eventItemTemplate = (
            <div className={roundCls + ' event-item'} key={eventItem.id}
                 style={{height: config.eventItemHeight, maxWidth: config.agendaMaxEventWidth, backgroundColor: bgColor}}>
                <span style={{marginLeft: '10px', lineHeight: `${config.eventItemHeight}px` }}>{titleText}</span>
            </div>
        );
        if(eventItemTemplateResolver != undefined)
            eventItemTemplate = eventItemTemplateResolver(schedulerData, eventItem, bgColor, isStart, isEnd, 'event-item', config.eventItemHeight, config.agendaMaxEventWidth);

        return ( config.eventItemPopoverEnabled ?
                <Popover placement="bottomLeft" content={content} trigger="hover">
                    <a className="day-event" onClick={() => { if(!!eventItemClick) eventItemClick(schedulerData, eventItem);}}>
                        {eventItemTemplate}
                    </a>
                </Popover> :
                <span>
                    <a className="day-event" onClick={() => { if(!!eventItemClick) eventItemClick(schedulerData, eventItem);}}>
                        {eventItemTemplate}
                    </a>
                </span>
        );
    }
}










//======================================== AddMorePopover ==================================

class AddMorePopover extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dndSource: new DnDSource((props) => { return props.eventItem;}, EventItem),
        }
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        headerItem: PropTypes.object.isRequired,
        left: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        closeAction: PropTypes.func.isRequired,
        subtitleGetter: PropTypes.func,
        moveEvent: PropTypes.func,
        eventItemClick: PropTypes.func,
        viewEventClick: PropTypes.func,
        viewEventText:PropTypes.string,
        viewEvent2Click: PropTypes.func,
        viewEvent2Text: PropTypes.string,
        eventItemTemplateResolver: PropTypes.func,
    }

    render() {
        const {headerItem, left, top, height, closeAction, schedulerData} = this.props;
        const {config, localeMoment} = schedulerData;
        const {time, start, end, events} = headerItem;
        let header = localeMoment(time).format(config.addMorePopoverHeaderFormat);
        let durationStart = localeMoment(start);
        let durationEnd = localeMoment(end);
        let eventList = [];
        let i = 0;
        let DnDEventItem = this.state.dndSource.getDragSource();
        events.forEach((evt) => {
            if(evt !== undefined) {
                i++;
                let eventStart = localeMoment(evt.eventItem.start);
                let eventEnd = localeMoment(evt.eventItem.end);
                let isStart = eventStart >= durationStart;
                let isEnd = eventEnd < durationEnd;
                let eventItemLeft = 10;
                let eventItemWidth = 138;
                let eventItemTop = 12 + i*config.eventItemLineHeight;
                let eventItem = <DnDEventItem
                                   {...this.props}
                                   key={evt.eventItem.id}
                                   eventItem={evt.eventItem}
                                   leftIndex={0}
                                   isInPopover={true}
                                   isStart={isStart}
                                   isEnd={isEnd}
                                   rightIndex={1}
                                   left={eventItemLeft}
                                   width={eventItemWidth}
                                   top={eventItemTop}
                                   />
                eventList.push(eventItem);
            }
        });

        return (
            <div className="add-more-popover-overlay"  style={{left: left, top: top, height: height, width: '170px'}}>
                <Row type="flex" justify="space-between" align="middle">
                    <Col span="22">
                        <span className="base-text">{header}</span>
                    </Col>
                    <Col span="2">
                        <span onClick={() => {closeAction(undefined);}}><Icon type="cross"></Icon></span>
                    </Col>
                </Row>
                {eventList}
            </div>
        );
    }
}










//============================================ SchedulerData =================================================

class SchedulerData {
    constructor(date=moment().format(DATE_FORMAT), viewType = ViewTypes.Week,
                showAgenda = false, isEventPerspective = false,
                newConfig = undefined, newBehaviors = undefined,
                localeMoment = undefined) {        
        this.resources = [];
        this.events = [];
        this.eventGroups = [];
        this.eventGroupsAutoGenerated = true;
        this.viewType = viewType;
        this.cellUnit = viewType === ViewTypes.Day ? CellUnits.Hour : CellUnits.Day;
        this.showAgenda = showAgenda;
        this.isEventPerspective = isEventPerspective;
        this.resizing = false;
        this.scrollToSpecialMoment = false;
        this.documentWidth = 0;

        this.localeMoment = moment;
        if(!!localeMoment)
            this.localeMoment = localeMoment;
        this.config = newConfig == undefined ? config : {...config, ...newConfig};
        this._validateMinuteStep(this.config.minuteStep);
        this.behaviors = newBehaviors == undefined ? behaviors : {...behaviors, ...newBehaviors};
        this._resolveDate(0, date);
        this._createHeaders();
        this._createRenderData();
    }

    setLocaleMoment(localeMoment){
        if(!!localeMoment){
            this.localeMoment = localeMoment;
            this._createHeaders();
            this._createRenderData();
        }
    }

    setResources(resources) {
        this._validateResource(resources);
        this.resources = Array.from(new Set(resources));
        this._createRenderData();
        this.setScrollToSpecialMoment(true);
    }

    setEventGroupsAutoGenerated(autoGenerated){
        this.eventGroupsAutoGenerated = autoGenerated;
    }

    //optional
    setEventGroups(eventGroups) {
        this._validateEventGroups(eventGroups);
        this.eventGroups = Array.from(new Set(eventGroups));
        this.eventGroupsAutoGenerated = false;
        this._createRenderData();
        this.setScrollToSpecialMoment(true);
    }

    setMinuteStep(minuteStep) {
        if(this.config.minuteStep !== minuteStep) {
            this._validateMinuteStep(minuteStep);
            this.config.minuteStep = minuteStep;
            this._createHeaders();
            this._createRenderData();
        }
    }

    setBesidesWidth(besidesWidth) {
        if(besidesWidth >= 0) {
            this.config.besidesWidth = besidesWidth;
        }
    }

    getMinuteStepsInHour(){
        return 60 / this.config.minuteStep;
    }

    addResource(resource){
        let existedResources = this.resources.filter(x => x.id === resource.id);
        if(existedResources.length === 0){
            this.resources.push(resource);
            this._createRenderData();
        }
    }

    addEventGroup(eventGroup){
        let existedEventGroups = this.eventGroups.filter(x => x.id === eventGroup.id);
        if(existedEventGroups.length === 0){
            this.eventGroups.push(eventGroup);
            this._createRenderData();
        }
    }

    removeEventGroupById(eventGroupId){
        let index = -1;
        this.eventGroups.forEach((item, idx) => {
            if(item.id === eventGroupId)
                index = idx;
        })
        if(index !== -1)
            this.eventGroups.splice(index, 1);
    }

    containsEventGroupId(eventGroupId){
        let index = -1;
        this.eventGroups.forEach((item, idx) => {
            if(item.id === eventGroupId)
                index = idx;
        })
        return index !== -1;
    }

    setEvents(events) {
        this._validateEvents(events);
        this.events = Array.from(events);
        if(this.eventGroupsAutoGenerated)
            this._generateEventGroups();
        if(this.config.recurringEventsEnabled)
            this._handleRecurringEvents();
        
        this._createRenderData();
    }

    setScrollToSpecialMoment(scrollToSpecialMoment){
        if(this.config.scrollToSpecialMomentEnabled)
            this.scrollToSpecialMoment = scrollToSpecialMoment;
    }

    prev() {
        this._resolveDate(-1);
        this.events = [];
        this._createHeaders();
        this._createRenderData();
    }

    next() {
        this._resolveDate(1);
        this.events = [];
        this._createHeaders();
        this._createRenderData();
    }

    setDate(date=moment().format(DATE_FORMAT)){
        this._resolveDate(0, date);
        this.events = [];
        this._createHeaders();
        this._createRenderData();
    }

    setViewType(viewType = ViewTypes.Week, showAgenda = false, isEventPerspective = false) {
        this.showAgenda = showAgenda;
        this.isEventPerspective = isEventPerspective;
        this.cellUnit = CellUnits.Day;

        if(this.viewType !== viewType) {
            let date = this.startDate;

            if(viewType === ViewTypes.Custom || viewType === ViewTypes.Custom1 || viewType === ViewTypes.Custom2) {
                this.viewType = viewType;
                this._resolveDate(0, date);
            } else {
                if(this.viewType < viewType){
                    if(viewType === ViewTypes.Week) {
                        this.startDate = this.localeMoment(date).startOf('week').format(DATE_FORMAT);
                        this.endDate = this.localeMoment(this.startDate).endOf('week').format(DATE_FORMAT);
                    }
                    else if(viewType === ViewTypes.Month){
                        this.startDate = this.localeMoment(date).startOf('month').format(DATE_FORMAT);
                        this.endDate = this.localeMoment(this.startDate).endOf('month').format(DATE_FORMAT);
                    }
                    else if(viewType === ViewTypes.Quarter){
                        this.startDate = this.localeMoment(date).startOf('quarter').format(DATE_FORMAT);
                        this.endDate = this.localeMoment(this.startDate).endOf('quarter').format(DATE_FORMAT);
                    }
                    else if(viewType === ViewTypes.Year) {
                        this.startDate = this.localeMoment(date).startOf('year').format(DATE_FORMAT);
                        this.endDate = this.localeMoment(this.startDate).endOf('year').format(DATE_FORMAT);
                    }
                }
                else{
                    let start = this.localeMoment(this.startDate);
                    let end = this.localeMoment(this.endDate).add(1, 'days');
    
                    if(this.selectDate !== undefined) {
                        let selectDate = this.localeMoment(this.selectDate);
                        if(selectDate >= start && selectDate < end) {
                            date = this.selectDate;
                        }
                    }
    
                    let now = this.localeMoment();
                    if(now >= start && now < end) {
                        date = now.format(DATE_FORMAT);
                    }
    
                    if(viewType === ViewTypes.Day) {
                        this.startDate = date;
                        this.endDate = this.startDate;
                        this.cellUnit = CellUnits.Hour;
                    }
                    else if(viewType === ViewTypes.Week) {
                        this.startDate = this.localeMoment(date).startOf('week').format(DATE_FORMAT);
                        this.endDate = this.localeMoment(this.startDate).endOf('week').format(DATE_FORMAT);
                    }
                    else if(viewType === ViewTypes.Month){
                        this.startDate = this.localeMoment(date).startOf('month').format(DATE_FORMAT);
                        this.endDate = this.localeMoment(this.startDate).endOf('month').format(DATE_FORMAT);
                    }
                    else if(viewType === ViewTypes.Quarter){
                        this.startDate = this.localeMoment(date).startOf('quarter').format(DATE_FORMAT);
                        this.endDate = this.localeMoment(this.startDate).endOf('quarter').format(DATE_FORMAT);
                    }
                }

                this.viewType = viewType;
            }

            this.events = [];
            this._createHeaders();
            this._createRenderData();
            this.setScrollToSpecialMoment(true);
        }
    }

    setSchedulerMaxHeight(newSchedulerMaxHeight){
        this.config.schedulerMaxHeight = newSchedulerMaxHeight;
    }

    isSchedulerResponsive() {
        return !!this.config.schedulerWidth.endsWith && this.config.schedulerWidth.endsWith("%");
    }

    toggleExpandStatus(slotId) {
        let slotEntered = false;
        let slotIndent = -1;
        let isExpanded = false;
        let expandedMap = new Map();
        this.renderData.forEach((item) => {
            if(slotEntered === false) {
                if(item.slotId === slotId && item.hasChildren) {
                    slotEntered = true;
                    
                    isExpanded = !item.expanded;
                    item.expanded = isExpanded;
                    slotIndent = item.indent;
                    expandedMap.set(item.indent, {
                        expanded: item.expanded,
                        render: item.render,
                    });
                }
            } else {
                if(item.indent > slotIndent) {
                    let expandStatus = expandedMap.get(item.indent - 1);
                    item.render = expandStatus.expanded && expandStatus.render;

                    if(item.hasChildren) {
                        expandedMap.set(item.indent, {
                            expanded: item.expanded,
                            render: item.render,
                        });
                    }
                } else {
                    slotEntered = false;
                }
            }
        });
    }

    isResourceViewResponsive() {
        let resourceTableWidth = this.getResourceTableConfigWidth();
        return !!resourceTableWidth.endsWith && resourceTableWidth.endsWith("%");
    }

    isContentViewResponsive() {
        let contentCellWidth = this.getContentCellConfigWidth();
        return !!contentCellWidth.endsWith && contentCellWidth.endsWith("%");
    }

    getSchedulerWidth() {
        let baseWidth = this.documentWidth - this.config.besidesWidth > 0 ? this.documentWidth - this.config.besidesWidth : 0;
        return this.isSchedulerResponsive() ? parseInt(baseWidth * Number(this.config.schedulerWidth.slice(0,-1)) / 100) : this.config.schedulerWidth;
    }    

    getResourceTableWidth() {
        let resourceTableConfigWidth = this.getResourceTableConfigWidth();
        let schedulerWidth = this.getSchedulerWidth();
        let resourceTableWidth = this.isResourceViewResponsive() ? parseInt(schedulerWidth * Number(resourceTableConfigWidth.slice(0,-1)) / 100)
            : resourceTableConfigWidth;
        if(this.isSchedulerResponsive() && ( this.getContentTableWidth() + resourceTableWidth < schedulerWidth ))
            resourceTableWidth = schedulerWidth - this.getContentTableWidth();
        return resourceTableWidth;
    }

    getContentCellWidth(){
        let contentCellConfigWidth = this.getContentCellConfigWidth();
        let schedulerWidth = this.getSchedulerWidth();
        return this.isContentViewResponsive() ? parseInt(schedulerWidth * Number(contentCellConfigWidth.slice(0,-1)) / 100) : contentCellConfigWidth;
    }    

    getContentTableWidth(){
        return this.headers.length * (this.getContentCellWidth());
    }

    getScrollToSpecialMoment(){
        if(this.config.scrollToSpecialMomentEnabled)
            return this.scrollToSpecialMoment;
        return false;
    }

    getSlots(){
        return this.isEventPerspective ? this.eventGroups : this.resources;
    }

    getSlotById(slotId){
        let slots = this.getSlots();
        let slot = undefined;
        slots.forEach((item) => {
            if(item.id === slotId)
                slot = item;
        })
        return slot;
    }

    getResourceById(resourceId){
        let resource = undefined;
        this.resources.forEach((item) => {
            if(item.id === resourceId)
                resource = item;
        })
        return resource;
    }

    getTableHeaderHeight() {
        return this.config.tableHeaderHeight;
    }

    getSchedulerContentDesiredHeight() {
        let height = 0;
        this.renderData.forEach((item) => {
            if(item.render)
                height += item.rowHeight;
        });
        return height;
    }

    getCellMaxEvents(){
        return this.viewType === ViewTypes.Week ? this.config.weekMaxEvents : (
            this.viewType === ViewTypes.Day ? this.config.dayMaxEvents : (
                this.viewType === ViewTypes.Month ? this.config.monthMaxEvents : (
                    this.viewType === ViewTypes.Year ? this.config.yearMaxEvents : (
                        this.viewType === ViewTypes.Quarter ? this.config.quarterMaxEvents : 
                            this.config.customMaxEvents
                    )
                )
            )
        );
    }

    getDateLabel(){
        let start = this.localeMoment(this.startDate);
        let end = this.localeMoment(this.endDate);
        let dateLabel = start.format('LL');

        if(start != end)
            dateLabel = `${start.format('LL')}-${end.format('LL')}`;

        if(!!this.behaviors.getDateLabelFunc)
            dateLabel = this.behaviors.getDateLabelFunc(this, this.viewType, this.startDate, this.endDate);

        return dateLabel;
    }

    addEvent(newEvent){
        this._attachEvent(newEvent);
        if(this.eventGroupsAutoGenerated)
            this._generateEventGroups();
        this._createRenderData();
    }

    updateEventStart(event, newStart) {
        this._detachEvent(event);
        event.start = newStart;
        this._attachEvent(event);
        this._createRenderData();
    }

    updateEventEnd(event, newEnd) {
        event.end = newEnd;
        this._createRenderData();
    }

    moveEvent(event, newSlotId, newSlotName, newStart, newEnd){
        this._detachEvent(event);
        if(this.isEventPerspective) {
            event.groupId = newSlotId;
            event.groupName = newSlotName;
        }
        else
            event.resourceId = newSlotId;
        event.end = newEnd;
        event.start = newStart;
        this._attachEvent(event);
        this._createRenderData();
    }

    isEventInTimeWindow(eventStart, eventEnd, windowStart, windowEnd) {
        return eventStart < windowEnd && eventEnd >windowStart;
    }

    removeEvent(event) {
        let index = this.events.indexOf(event);
        if(index !== -1) {
            this.events.splice(index, 1);
            this._createRenderData();
        }
    }

    removeEventById(eventId) {
        let index = -1;
        this.events.forEach((item, idx) => {
            if(item.id === eventId)
                index = idx;
        })
        if(index !== -1) {
            this.events.splice(index, 1);
            this._createRenderData();
        }
    }

    getResourceTableConfigWidth() {
        if(this.showAgenda) return this.config.agendaResourceTableWidth;

        return this.viewType === ViewTypes.Week ? this.config.weekResourceTableWidth : (
            this.viewType === ViewTypes.Day ? this.config.dayResourceTableWidth : (
                this.viewType === ViewTypes.Month ? this.config.monthResourceTableWidth : (
                    this.viewType === ViewTypes.Year ? this.config.yearResourceTableWidth : (
                        this.viewType === ViewTypes.Quarter ? this.config.quarterResourceTableWidth : 
                            this.config.customResourceTableWidth
                    )
                )
            )
        );
    }

    getContentCellConfigWidth() {
        return this.viewType === ViewTypes.Week ? this.config.weekCellWidth : (
            this.viewType === ViewTypes.Day ? this.config.dayCellWidth : (
                this.viewType === ViewTypes.Month ? this.config.monthCellWidth : (
                    this.viewType === ViewTypes.Year ? this.config.yearCellWidth : (
                        this.viewType === ViewTypes.Quarter ? this.config.quarterCellWidth : 
                            this.config.customCellWidth
                    )
                )
            )
        );
    }

    _setDocumentWidth(documentWidth) {
        if(documentWidth >= 0) {
            this.documentWidth = documentWidth;
        }
    }

    _detachEvent(event) {
        let index = this.events.indexOf(event);
        if(index !== -1)
            this.events.splice(index, 1);
    }

    _attachEvent(event) {
        let pos = 0;
        let eventStart = this.localeMoment(event.start);
        this.events.forEach((item, index) => {
            let start = this.localeMoment(item.start);
            if(eventStart >= start)
                pos = index + 1;
        });
        this.events.splice(pos, 0, event);
    }

    _handleRecurringEvents(){
        let recurringEvents = this.events.filter(x => !!x.rrule);
        recurringEvents.forEach((item) => {
            this._detachEvent(item);
        });
        
        recurringEvents.forEach((item) => {
            let windowStart = this.localeMoment(this.startDate),
                windowEnd = this.localeMoment(this.endDate).add(1, 'days'),
                oldStart = this.localeMoment(item.start),
                oldEnd = this.localeMoment(item.end),
                rule = rrulestr(item.rrule),
                oldDtstart = undefined;
            if(!!rule.origOptions.dtstart) {
                oldDtstart = this.localeMoment(rule.origOptions.dtstart);
            }
            //rule.origOptions.dtstart = oldStart.toDate();
            if(!rule.origOptions.until || windowEnd < this.localeMoment(rule.origOptions.until)) {
                rule.origOptions.until = windowEnd.toDate();
            }
                
            //reload
            rule = rrulestr(rule.toString());
            if (item.exdates || item.exrule)
            {
                const rruleSet = new RRuleSet()    
                rruleSet.rrule(rule); 
                if(item.exrule) {
                    rruleSet.exrule(rrulestr(item.exrule));
                }
                if(item.exdates) {
                    item.exdates.forEach((exdate) => 
                    {
                        rruleSet.exdate(this.localeMoment(exdate).toDate());
                    });
                }
                rule = rruleSet;
            }
            
            let all = rule.all();
            let newEvents = all.map((time, index) => {
                return {
                    ...item,
                    recurringEventId: item.id,
                    recurringEventStart: item.start,
                    recurringEventEnd: item.end,
                    id: `${item.id}-${index}`,
                    start: rule.origOptions.tzid
                      ? this.localeMoment.utc(time).utcOffset(this.localeMoment().utcOffset(), true).format(DATETIME_FORMAT)
                      : this.localeMoment(time).format(DATETIME_FORMAT),
                    end: rule.origOptions.tzid
                      ? this.localeMoment.utc(time).utcOffset(this.localeMoment().utcOffset(), true).add(oldEnd.diff(oldStart), 'ms').format(DATETIME_FORMAT)
                      : this.localeMoment(time).add(oldEnd.diff(oldStart), 'ms').format(DATETIME_FORMAT)
                };
            });
            newEvents.forEach((newEvent) => {
                let eventStart = this.localeMoment(newEvent.start),
                    eventEnd = this.localeMoment(newEvent.end);
                if(this.isEventInTimeWindow(eventStart, eventEnd, windowStart, windowEnd) && (!oldDtstart || eventStart >= oldDtstart)) {
                    this._attachEvent(newEvent);
                }
            });
        });
    }

    _resolveDate(num, date = undefined){
        if(date != undefined)
            this.selectDate = this.localeMoment(date).format(DATE_FORMAT);

        if(this.viewType === ViewTypes.Week) {
            this.startDate = date != undefined ? this.localeMoment(date).startOf('week').format(DATE_FORMAT)
                : this.localeMoment(this.startDate).add(num, 'weeks').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('week').format(DATE_FORMAT);
        }
        else if(this.viewType === ViewTypes.Day) {
            this.startDate = date != undefined ? this.selectDate
                : this.localeMoment(this.startDate).add(num, 'days').format(DATE_FORMAT);
            this.endDate = this.startDate;
        }
        else if(this.viewType === ViewTypes.Month) {
            this.startDate = date != undefined ? this.localeMoment(date).startOf('month').format(DATE_FORMAT)
                : this.localeMoment(this.startDate).add(num, 'months').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('month').format(DATE_FORMAT);
        }
        else if(this.viewType === ViewTypes.Quarter) {
            this.startDate = date != undefined ? this.localeMoment(date).startOf('quarter').format(DATE_FORMAT)
                : this.localeMoment(this.startDate).add(num, 'quarters').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('quarter').format(DATE_FORMAT);
        }
        else if(this.viewType === ViewTypes.Year) {
            this.startDate = date != undefined ? this.localeMoment(date).startOf('year').format(DATE_FORMAT)
                : this.localeMoment(this.startDate).add(num, 'years').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('year').format(DATE_FORMAT);
        }
        else if(this.viewType === ViewTypes.Custom || this.viewType === ViewTypes.Custom1 || this.viewType === ViewTypes.Custom2) {
            if(this.behaviors.getCustomDateFunc != undefined){
                let customDate = this.behaviors.getCustomDateFunc(this, num, date);
                this.startDate = customDate.startDate;
                this.endDate = customDate.endDate;
                if(!!customDate.cellUnit)
                    this.cellUnit = customDate.cellUnit;
            } else {
                throw new Error('This is custom view type, set behaviors.getCustomDateFunc func to resolve the time window(startDate and endDate) yourself');
            }
        }
    }

    _createHeaders() {
        let headers = [],
            start = this.localeMoment(this.startDate),
            end = this.localeMoment(this.endDate),
            header = start;

        if(this.showAgenda){
            headers.push({time: header.format(DATETIME_FORMAT), nonWorkingTime: false});
        }
        else {
            if (this.cellUnit === CellUnits.Hour) {
                start = start.add(this.config.dayStartFrom, 'hours');
                end = end.add(this.config.dayStopTo, 'hours');
                header = start;

                while (header >= start && header <= end) {
                    let minuteSteps = this.getMinuteStepsInHour();
                    for(let i=0; i<minuteSteps; i++){
                        let hour = header.hour();
                        if(hour >= this.config.dayStartFrom && hour <= this.config.dayStopTo) {
                            let time = header.format(DATETIME_FORMAT);
                            let nonWorkingTime = this.behaviors.isNonWorkingTimeFunc(this, time);
                            headers.push({ time: time, nonWorkingTime: nonWorkingTime });
                        }
    
                        header = header.add(this.config.minuteStep, 'minutes');
                    }
                }
            }
            else {
                while (header >= start && header <= end) {
                    let time = header.format(DATETIME_FORMAT);
                    let dayOfWeek = header.weekday();
                    if( this.config.displayWeekend || (dayOfWeek !== 0 && dayOfWeek !== 6))
                    {
                        let nonWorkingTime = this.behaviors.isNonWorkingTimeFunc(this, time);
                        headers.push({ time: time, nonWorkingTime: nonWorkingTime });
                    }

                    header = header.add(1, 'days');
                }
            }
        }

        this.headers = headers;
    }

    _createInitHeaderEvents(header) {
        let start = this.localeMoment(header.time),
            startValue = start.format(DATETIME_FORMAT);
        let endValue = this.showAgenda ? (this.viewType === ViewTypes.Week ? start.add(1, 'weeks').format(DATETIME_FORMAT) : (
            this.viewType === ViewTypes.Day ? start.add(1, 'days').format(DATETIME_FORMAT) : (
                this.viewType === ViewTypes.Month ? start.add(1, 'months').format(DATETIME_FORMAT) : (
                    this.viewType === ViewTypes.Year ? start.add(1, 'years').format(DATETIME_FORMAT) : (
                        this.viewType === ViewTypes.Quarter ? start.add(1, 'quarters').format(DATETIME_FORMAT) :
                            this.localeMoment(this.endDate).add(1, 'days').format(DATETIME_FORMAT)
                    )
                )
            )
        )) : (this.cellUnit === CellUnits.Hour ?  start.add(this.config.minuteStep, 'minutes').format(DATETIME_FORMAT)
            : start.add(1, 'days').format(DATETIME_FORMAT));
        return {
            time:  header.time,
            nonWorkingTime: header.nonWorkingTime,
            start: startValue,
            end:   endValue,
            count: 0,
            addMore: 0,
            addMoreIndex: 0,
            events: [,,,],
        };
    }

    _createHeaderEvent(render, span, eventItem) {
        return {
            render: render,
            span: span,
            eventItem: eventItem
        };
    }

    _getEventSlotId(event){
        return this.isEventPerspective ? this._getEventGroupId(event) : event.resourceId;
    }

    _getEventGroupId(event){
        return !!event.groupId ? event.groupId.toString() : event.id.toString();
    }

    _getEventGroupName(event){
        return !!event.groupName ? event.groupName : event.title;
    }

    _generateEventGroups(){
        let eventGroups = [];
        let set = new Set();
        this.events.forEach((item) => {
            let groupId = this._getEventGroupId(item);
            let groupName = this._getEventGroupName(item);

            if(!set.has(groupId)){
                eventGroups.push({
                    id: groupId,
                    name: groupName,
                    state: item,
                });
                set.add(groupId);
            }
        })
        this.eventGroups = eventGroups;
    }

    _createInitRenderData(isEventPerspective, eventGroups, resources, headers) {
        let slots = isEventPerspective ? eventGroups : resources;
        let slotTree = [],
            slotMap = new Map();
        slots.forEach((slot) => {
            let headerEvents = headers.map((header) => {
                return this._createInitHeaderEvents(header);
            });

            let slotRenderData = {
                slotId: slot.id,
                slotName: slot.name,
                parentId: slot.parentId,
                groupOnly: slot.groupOnly,
                hasSummary: false,
                rowMaxCount: 0,
                rowHeight: this.config.nonAgendaSlotMinHeight !== 0 ? this.config.nonAgendaSlotMinHeight : this.config.eventItemLineHeight + 2,
                headerItems: headerEvents,
                indent: 0,
                hasChildren: false,
                expanded: true,
                render: true,
            };
            let id = slot.id;
            let value = undefined;
            if(slotMap.has(id)) {
                value = slotMap.get(id);
                value.data = slotRenderData;
            } else {
                value = {
                    data: slotRenderData,
                    children: [],
                };
                slotMap.set(id, value);
            }

            let parentId = slot.parentId;
            if(!parentId || parentId === id) {
                slotTree.push(value);
            } else {
                let parentValue = undefined;
                if(slotMap.has(parentId)) {
                    parentValue = slotMap.get(parentId);
                } else {
                    parentValue = {
                        data: undefined,
                        children: [],
                    };
                    slotMap.set(parentId, parentValue);
                }

                parentValue.children.push(value);
            }
        });

        let slotStack = [];
        let i;
        for(i=slotTree.length-1; i>=0; i--) {
            slotStack.push(slotTree[i]);
        }
        let initRenderData = [];
        let currentNode = undefined;
        while(slotStack.length > 0) {
            currentNode = slotStack.pop();
            if(currentNode.data.indent > 0) {
                currentNode.data.render = this.config.defaultExpanded;
            }
            if(currentNode.children.length > 0) {
                currentNode.data.hasChildren = true;
                currentNode.data.expanded = this.config.defaultExpanded;
            }
            initRenderData.push(currentNode.data);
            
            for(i=currentNode.children.length -1; i>=0; i--) {
                currentNode.children[i].data.indent = currentNode.data.indent + 1;
                slotStack.push(currentNode.children[i]);
            }
        }

        return initRenderData;
    }

    _getSpan(startTime, endTime, headers){
        if(this.showAgenda) return 1;

        let start = this.localeMoment(startTime),
            end = this.localeMoment(endTime),
            span = 0;

        for(let header of headers) {
            let spanStart = this.localeMoment(header.time),
            spanEnd = this.cellUnit === CellUnits.Hour ? this.localeMoment(header.time).add(this.config.minuteStep, 'minutes') 
                : this.localeMoment(header.time).add(1, 'days');
            
                if(spanStart < end && spanEnd > start) {
                    span++;
                }
        }

        return span;
    }

    _validateResource(resources){
        if(Object.prototype.toString.call(resources) !== "[object Array]") {
            throw new Error('Resources should be Array object');
        }

        resources.forEach((item, index) => {
            if(item == undefined) {
                console.error(`Resource undefined: ${index}`);
                throw new Error(`Resource undefined: ${index}`);
            }
            if(item.id == undefined || item.name == undefined)
            {
                console.error('Resource property missed', index, item);
                throw new Error(`Resource property undefined: ${index}`);
            }
        });
    }

    _validateEventGroups(eventGroups){
        if(Object.prototype.toString.call(eventGroups) !== "[object Array]") {
            throw new Error('Event groups should be Array object');
        }

        eventGroups.forEach((item, index) => {
            if(item == undefined) {
                console.error(`Event group undefined: ${index}`);
                throw new Error(`Event group undefined: ${index}`);
            }
            if(item.id == undefined || item.name == undefined)
            {
                console.error('Event group property missed', index, item);
                throw new Error(`Event group property undefined: ${index}`);
            }
        });
    }

    _validateEvents(events){
        if(Object.prototype.toString.call(events) !== "[object Array]") {
            throw new Error('Events should be Array object');
        }

        events.forEach((e, index) => {
            if(e == undefined) {
                console.error(`Event undefined: ${index}`);
                throw new Error(`Event undefined: ${index}`);
            }
            if(e.id == undefined || e.resourceId == undefined || e.title == undefined || e.start == undefined || e.end == undefined)
            {
                console.error('Event property missed', index, e);
                throw new Error(`Event property undefined: ${index}`);
            }
        });
    }

    _validateMinuteStep(minuteStep) {
        if (60 % minuteStep !== 0) {
            console.error('Minute step is not set properly - 60 minutes must be divisible without remainder by this number');
            throw new Error('Minute step is not set properly - 60 minutes must be divisible without remainder by this number');
        }
    }

    _compare(event1, event2){
        let start1 = this.localeMoment(event1.start), start2 = this.localeMoment(event2.start);
        if(start1 !== start2) return start1 < start2 ? -1 : 1;

        let end1 = this.localeMoment(event1.end), end2 = this.localeMoment(event2.end);
        if(end1 !== end2) return end1 < end2 ? -1 : 1;

        return event1.id < event2.id ? -1 : 1;
    }

    _createRenderData() {
        let initRenderData = this._createInitRenderData(this.isEventPerspective, this.eventGroups, this.resources, this.headers);
        //this.events.sort(this._compare);
        let cellMaxEventsCount = this.getCellMaxEvents();        
        const cellMaxEventsCountValue = 30;

        this.events.forEach((item) => {
            let resourceEventsList = initRenderData.filter(x => x.slotId === this._getEventSlotId(item));
            if(resourceEventsList.length > 0) {
                let resourceEvents = resourceEventsList[0];
                let span = this._getSpan(item.start, item.end, this.headers);
                let eventStart = this.localeMoment(item.start), eventEnd = this.localeMoment(item.end);
                let pos = -1;

                resourceEvents.headerItems.forEach((header, index) => {
                    let headerStart = this.localeMoment(header.start), headerEnd = this.localeMoment(header.end);
                    if(headerEnd > eventStart && headerStart < eventEnd) {
                        header.count = header.count + 1;
                        if(header.count > resourceEvents.rowMaxCount) {
                            resourceEvents.rowMaxCount = header.count;
                            let rowsCount = (cellMaxEventsCount <= cellMaxEventsCountValue && resourceEvents.rowMaxCount > cellMaxEventsCount) ? cellMaxEventsCount : resourceEvents.rowMaxCount;
                            let newRowHeight = rowsCount * this.config.eventItemLineHeight + (this.config.creatable && this.config.checkConflict === false ? 20 : 2);
                            if(newRowHeight > resourceEvents.rowHeight)
                                resourceEvents.rowHeight = newRowHeight;
                        }

                        if(pos === -1)
                        {
                            let tmp = 0;
                            while (header.events[tmp] !== undefined)
                                tmp++;

                            pos = tmp;
                        }
                        let render = headerStart <= eventStart || index === 0;
                        if(render === false){
                            let previousHeader = resourceEvents.headerItems[index - 1];
                            let previousHeaderStart = this.localeMoment(previousHeader.start), previousHeaderEnd = this.localeMoment(previousHeader.end);
                            if(previousHeaderEnd <= eventStart || previousHeaderStart >= eventEnd)
                                render = true;
                        }
                        header.events[pos] = this._createHeaderEvent(render, span, item);
                    }
                });
            }
        });

        if(cellMaxEventsCount <= cellMaxEventsCountValue || this.behaviors.getSummaryFunc !== undefined) {
            initRenderData.forEach((resourceEvents) => {
                let hasSummary = false;

                resourceEvents.headerItems.forEach((headerItem) => {
                    if(cellMaxEventsCount <= cellMaxEventsCountValue) {
                        let renderItemsCount = 0, addMoreIndex = 0, index = 0;
                        while (index < cellMaxEventsCount - 1) {
                            if(headerItem.events[index] !== undefined) {
                                renderItemsCount++;
                                addMoreIndex = index + 1;
                            }
        
                            index++;
                        }
        
                        if(headerItem.events[index] !== undefined) {
                            if(renderItemsCount + 1 < headerItem.count) {
                                headerItem.addMore = headerItem.count - renderItemsCount;
                                headerItem.addMoreIndex = addMoreIndex;
                            }
                        }
                        else {
                            if(renderItemsCount < headerItem.count) {
                                headerItem.addMore = headerItem.count - renderItemsCount;
                                headerItem.addMoreIndex = addMoreIndex;
                            }
                        }
                    }                    
    
                    if(this.behaviors.getSummaryFunc !== undefined){
                        let events = [];
                        headerItem.events.forEach((e) => {
                            if(!!e && !!e.eventItem)
                                events.push(e.eventItem);
                        });
    
                        headerItem.summary = this.behaviors.getSummaryFunc(this, events, resourceEvents.slotId, resourceEvents.slotName, headerItem.start, headerItem.end);
                        if(!!headerItem.summary && headerItem.summary.text != undefined)
                            hasSummary = true;
                    }
                });
    
                resourceEvents.hasSummary = hasSummary;
                if(hasSummary) {
                    let rowsCount = (cellMaxEventsCount <= cellMaxEventsCountValue && resourceEvents.rowMaxCount > cellMaxEventsCount) ? cellMaxEventsCount : resourceEvents.rowMaxCount;
                    let newRowHeight = (rowsCount + 1) * this.config.eventItemLineHeight + (this.config.creatable && this.config.checkConflict === false ? 20 : 2);
                    if(newRowHeight > resourceEvents.rowHeight)
                        resourceEvents.rowHeight = newRowHeight;
                }
            });
        }

        this.renderData = initRenderData;
    }

    _startResizing() {
        this.resizing = true;
    }

    _stopResizing() {
        this.resizing = false;
    }

    _isResizing() {
        return this.resizing;
    }
}




//================================= config ========================================

const config = {
    schedulerWidth: '100%',
    besidesWidth: 20,
    schedulerMaxHeight: 0,
    tableHeaderHeight: 40,

    agendaResourceTableWidth: 160,
    agendaMaxEventWidth: 100,

    dayResourceTableWidth: 160,
    weekResourceTableWidth: '16%',
    monthResourceTableWidth: 160,
    quarterResourceTableWidth: 160,
    yearResourceTableWidth: 160,
    customResourceTableWidth: 160,

    dayCellWidth: 30,
    weekCellWidth: '12%',
    monthCellWidth: 80,
    quarterCellWidth: 80,
    yearCellWidth: 80,
    customCellWidth: 80,

    dayMaxEvents: 99,
    weekMaxEvents: 99,
    monthMaxEvents: 99,
    quarterMaxEvents: 99,
    yearMaxEvents: 99,
    customMaxEvents: 99,

    eventItemHeight: 22,
    eventItemLineHeight: 24,
    nonAgendaSlotMinHeight: 0,
    dayStartFrom: 0,
    dayStopTo: 23,
    defaultEventBgColor: '#80C5F6',
    selectedAreaColor: '#7EC2F3',
    nonWorkingTimeHeadColor: '#999999',
    nonWorkingTimeHeadBgColor: '#fff0f6',
    nonWorkingTimeBodyBgColor: '#fff0f6',
    summaryColor: '#666',
    summaryPos: SummaryPos.TopRight,
    groupOnlySlotColor: '#F8F8F8',

    startResizable: true,
    endResizable: true,
    movable: true,
    creatable: true,
    crossResourceMove: true,
    checkConflict: false,
    scrollToSpecialMomentEnabled: true,
    eventItemPopoverEnabled: true,
    calendarPopoverEnabled: true,
    recurringEventsEnabled: true,
    headerEnabled: true,
    displayWeekend: true,
    relativeMove: true,
    defaultExpanded: true,

    resourceName: 'Resource Name',
    taskName: 'Task Name',
    agendaViewHeader: 'Agenda',
    addMorePopoverHeaderFormat: 'MMM D, YYYY dddd',
    eventItemPopoverDateFormat: 'MMM D',
    nonAgendaDayCellHeaderFormat: 'ha',
    nonAgendaOtherCellHeaderFormat: 'ddd M/D',

    minuteStep: 30,

    views: [
        {viewName: 'Day', viewType: ViewTypes.Day, showAgenda: false, isEventPerspective: false},
        {viewName: 'Week', viewType: ViewTypes.Week, showAgenda: false, isEventPerspective: false},
        {viewName: 'Month', viewType: ViewTypes.Month, showAgenda: false, isEventPerspective: false},
        {viewName: 'Quarter', viewType: ViewTypes.Quarter, showAgenda: false, isEventPerspective: false},
        {viewName: 'Year', viewType: ViewTypes.Year, showAgenda: false, isEventPerspective: false},
    ],
}









//================================= Demodata ===============================
const DemoData = {
    resources: [
        {
            id: 'r0',
            name: 'Resource0',
            groupOnly: true,
        },
        {
            id: 'r1',
            name: 'Resource1',
            parentId: 'r0',
        },
        {
            id: 'r2',
            name: 'Resource2',
            parentId: 'r3',
        },
        {
            id: 'r3',
            name: 'Resource3',
            parentId: 'r1',
        },
        {
            id: 'r4',
            name: 'Resource4',
        },
        {
            id: 'r5',
            name: 'Resource5',
        },
        {
            id: 'r6',
            name: 'Resource6',
        },
        {
            id: 'r7',
            name: 'Resource7Resource7Resource7Resource7Resource7',
        }
    ],
    events: [
        {
            id: 1,
            start: '2017-12-18 09:30:00',
            end: '2017-12-19 23:30:00',
            resourceId: 'r1',
            title: 'I am finished',
            bgColor: '#D9D9D9',
            showPopover: false
        },
        {
            id: 2,
            start: '2017-12-18 12:30:00',
            end: '2017-12-26 23:30:00',
            resourceId: 'r2',
            title: 'I am not resizable',
            resizable: false
        },
        {
            id: 3,
            start: '2017-12-19 12:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r3',
            title: 'I am not movable',
            movable: false
        },
        {
            id: 4,
            start: '2017-12-19 14:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r4',
            title: 'I am not start-resizable',
            startResizable: false,
        },
        {
            id: 5,
            start: '2017-12-19 15:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r5',
            title: 'I am not end-resizable',
            endResizable: false
        },
        {
            id: 6,
            start: '2017-12-19 15:35:00',
            end: '2017-12-19 23:30:00',
            resourceId: 'r6',
            title: 'I am normal'
        },
        {
            id: 7,
            start: '2017-12-19 15:40:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r7',
            title: 'I am exceptional',
            bgColor: '#FA9E95'
        },
        {
            id: 8,
            start: '2017-12-19 15:50:00',
            end: '2017-12-19 23:30:00',
            resourceId: 'r1',
            title: 'I am locked',
            movable: false,
            resizable: false,
            bgColor: 'red'
        },
        {
            id: 9,
            start: '2017-12-19 16:30:00',
            end: '2017-12-27 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 1'
        },
        {
            id: 10,
            start: '2017-12-19 17:30:00',
            end: '2017-12-19 23:30:00',
            resourceId: 'r1',
            title: 'R1 has recurring tasks every week on Tuesday, Friday',
            rrule: 'FREQ=WEEKLY;DTSTART=20171219T013000Z;BYDAY=TU,FR',
            bgColor: '#f759ab'
        },
        {
            id: 11,
            start: '2017-12-19 18:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 3'
        },
        {
            id: 12,
            start: '2017-12-20 18:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 4'
        },
        {
            id: 13,
            start: '2017-12-21 18:30:00',
            end: '2017-12-24 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 5'
        },
        {
            id: 14,
            start: '2017-12-23 18:30:00',
            end: '2017-12-27 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 6'
        },
    ],
    eventsForTaskView: [
        {
            id: 1,
            start: '2017-12-18 09:30:00',
            end: '2017-12-18 23:30:00',
            resourceId: 'r1',
            title: 'I am finished',
            bgColor: '#D9D9D9',
            groupId: 1,
            groupName: 'Task1'
        },
        {
            id: 2,
            start: '2017-12-18 12:30:00',
            end: '2017-12-26 23:30:00',
            resourceId: 'r2',
            title: 'I am not resizable',
            resizable: false,
            groupId: 2,
            groupName: 'Task2'
        },
        {
            id: 3,
            start: '2017-12-19 12:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r3',
            title: 'I am not movable',
            movable: false,
            groupId: 3,
            groupName: 'Task3'
        },
        {
            id: 7,
            start: '2017-12-19 15:40:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r7',
            title: 'I am exceptional',
            bgColor: '#FA9E95',
            groupId: 4,
            groupName: 'Task4'
        },
        {
            id: 4,
            start: '2017-12-20 14:30:00',
            end: '2017-12-21 23:30:00',
            resourceId: 'r4',
            title: 'I am not start-resizable',
            startResizable: false,
            groupId: 1,
            groupName: 'Task1'
        },
        {
            id: 5,
            start: '2017-12-21 15:30:00',
            end: '2017-12-22 23:30:00',
            resourceId: 'r5',
            title: 'I am not end-resizable',
            endResizable: false,
            groupId: 3,
            groupName: 'Task3'
        },
        {
            id: 9,
            start: '2017-12-21 16:30:00',
            end: '2017-12-21 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks',
            groupId: 4,
            groupName: 'Task4'
        },
        {
            id: 6,
            start: '2017-12-22 15:35:00',
            end: '2017-12-23 23:30:00',
            resourceId: 'r6',
            title: 'I am normal',
            groupId: 1,
            groupName: 'Task1'
        },
        {
            id: 8,
            start: '2017-12-25 15:50:00',
            end: '2017-12-26 23:30:00',
            resourceId: 'r1',
            title: 'I am locked',
            movable: false,
            resizable: false,
            bgColor: 'red',
            groupId: 1,
            groupName: 'Task1'
        },
        {
            id: 10,
            start: '2017-12-26 18:30:00',
            end: '2017-12-26 23:30:00',
            resourceId: 'r2',
            title: 'R2 has many tasks',
            groupId: 4,
            groupName: 'Task4'
        },
        {
            id: 11,
            start: '2017-12-27 18:30:00',
            end: '2017-12-27 23:30:00',
            resourceId: 'r14',
            title: 'R4 has many tasks',
            groupId: 4,
            groupName: 'Task4'
        },
        {
            id: 12,
            start: '2017-12-28 18:30:00',
            end: '2017-12-28 23:30:00',
            resourceId: 'r6',
            title: 'R6 has many tasks',
            groupId: 3,
            groupName: 'Task3'
        },
    ],
    eventsForCustomEventStyle: [
        {
            id: 1,
            start: '2017-12-18 09:30:00',
            end: '2017-12-19 23:30:00',
            resourceId: 'r1',
            title: 'I am finished',
            bgColor: '#D9D9D9',
            type: 1
        },
        {
            id: 2,
            start: '2017-12-18 12:30:00',
            end: '2017-12-26 23:30:00',
            resourceId: 'r2',
            title: 'I am not resizable',
            resizable: false,
            type: 2
        },
        {
            id: 3,
            start: '2017-12-19 12:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r3',
            title: 'I am not movable',
            movable: false,
            type: 3
        },
        {
            id: 4,
            start: '2017-12-19 14:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r4',
            title: 'I am not start-resizable',
            startResizable: false,
            type: 1
        },
        {
            id: 5,
            start: '2017-12-19 15:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r5',
            title: 'I am not end-resizable',
            endResizable: false,
            type: 2
        },
        {
            id: 6,
            start: '2017-12-19 15:35:00',
            end: '2017-12-19 23:30:00',
            resourceId: 'r6',
            title: 'I am normal',
            type: 3
        },
        {
            id: 7,
            start: '2017-12-19 15:40:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r7',
            title: 'I am exceptional',
            bgColor: '#FA9E95',
            type: 1
        },
        {
            id: 8,
            start: '2017-12-19 15:50:00',
            end: '2017-12-19 23:30:00',
            resourceId: 'r1',
            title: 'I am locked',
            movable: false,
            resizable: false,
            bgColor: 'red',
            type: 2
        },
        {
            id: 9,
            start: '2017-12-19 16:30:00',
            end: '2017-12-27 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 1',
            type: 3
        },
        {
            id: 10,
            start: '2017-12-20 18:30:00',
            end: '2017-12-20 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 2',
            type: 1
        },
        {
            id: 11,
            start: '2017-12-21 18:30:00',
            end: '2017-12-22 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 3',
            type: 2
        },
        {
            id: 12,
            start: '2017-12-23 18:30:00',
            end: '2017-12-27 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 4',
            type: 3
        },
    ],
}

class Scheduler extends Component {

    constructor(props) {
        super(props);

        const {schedulerData, dndSources} = props;
        let sources = [];
        sources.push(new DnDSource((props) => {
            return props.eventItem;
        }, EventItem));
        if (dndSources !== undefined && dndSources.length > 0) {
            sources = [...sources, ...dndSources];
        }
        let dndContext = new DnDContext(sources, ResourceEvents);

        this.currentArea = -1;
        schedulerData._setDocumentWidth(document.documentElement.clientWidth);
        this.state = {
            visible: false,
            dndContext: dndContext,
            contentHeight: schedulerData.getSchedulerContentDesiredHeight(),
            contentScrollbarHeight: 17,
            contentScrollbarWidth: 17,
            resourceScrollbarHeight: 17,
            resourceScrollbarWidth: 17,
            scrollLeft: 0,
            scrollTop: 0,
            documentWidth: document.documentElement.clientWidth,
            documentHeight: document.documentElement.clientHeight,
        };

        if(schedulerData.isSchedulerResponsive())
            window.onresize = this.onWindowResize;
    }

    onWindowResize = (e) => {
        const {schedulerData} = this.props;
        schedulerData._setDocumentWidth(document.documentElement.clientWidth);
        this.setState({
            documentWidth: document.documentElement.clientWidth,
            documentHeight: document.documentElement.clientHeight,
        });
    }

    

    componentDidMount(props, state){
        this.resolveScrollbarSize();
    }

    componentDidUpdate(props, state) {
        this.resolveScrollbarSize();

        const { schedulerData } = this.props;
        const { localeMoment, behaviors } = schedulerData;
        if(schedulerData.getScrollToSpecialMoment() && !!behaviors.getScrollSpecialMomentFunc){
            if(!!this.schedulerContent && this.schedulerContent.scrollWidth > this.schedulerContent.clientWidth){
                let start = localeMoment(schedulerData.startDate).startOf('day'),
                    end = localeMoment(schedulerData.endDate).endOf('day'),
                    specialMoment = behaviors.getScrollSpecialMomentFunc(schedulerData, start, end);
                if(specialMoment>= start && specialMoment <= end){
                    let index = 0;
                    schedulerData.headers.forEach((item) => {
                        let header = localeMoment(item.time);
                        if(specialMoment >= header)
                            index ++;
                    })
                    this.schedulerContent.scrollLeft = (index - 1) * schedulerData.getContentCellWidth();

                    schedulerData.setScrollToSpecialMoment(false);
                }
            }
        }
    }

    render() {
        const { schedulerData, leftCustomHeader, rightCustomHeader } = this.props;
        const { renderData, viewType, showAgenda, isEventPerspective, config } = schedulerData;
        const width = schedulerData.getSchedulerWidth();
        const calendarPopoverEnabled = config.calendarPopoverEnabled;

        let dateLabel = schedulerData.getDateLabel();
        let defaultValue = `${viewType}${showAgenda ? 1 : 0}${isEventPerspective ? 1 : 0}`;
        let radioButtonList = config.views.map(item => {
            return <RadioButton key={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
                                value={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}><span
                style={{margin: "0px 8px"}}>{item.viewName}</span></RadioButton>
        })

        let tbodyContent = <tr />;
        if (showAgenda) {
            tbodyContent = <AgendaView
                                {...this.props}
                            />
        }
        else {
            let resourceTableWidth = schedulerData.getResourceTableWidth();
            let schedulerContainerWidth = width - resourceTableWidth + 1;
            let schedulerWidth = schedulerData.getContentTableWidth() - 1;
            let DndResourceEvents = this.state.dndContext.getDropTarget();
            let eventDndSource = this.state.dndContext.getDndSource();

            let displayRenderData = renderData.filter(o => o.render);
            let resourceEventsList = displayRenderData.map((item) => {
                return <DndResourceEvents
                                {...this.props}
                                key={item.slotId}
                                resourceEvents={item}
                                dndSource={eventDndSource}
                />
            });

            let contentScrollbarHeight = this.state.contentScrollbarHeight,
                contentScrollbarWidth = this.state.contentScrollbarWidth,
                resourceScrollbarHeight = this.state.resourceScrollbarHeight,
                resourceScrollbarWidth = this.state.resourceScrollbarWidth,
                contentHeight = this.state.contentHeight;
            let resourcePaddingBottom = resourceScrollbarHeight === 0 ? contentScrollbarHeight : 0;
            let contentPaddingBottom = contentScrollbarHeight === 0 ? resourceScrollbarHeight : 0;
            let schedulerContentStyle = {overflow: 'auto', margin: "0px", position: "relative", paddingBottom: contentPaddingBottom};
            let resourceContentStyle = {overflowX: "auto", overflowY: "auto", width: resourceTableWidth + resourceScrollbarWidth - 2, margin: `0px -${contentScrollbarWidth}px 0px 0px`};
            if (config.schedulerMaxHeight > 0) {
                schedulerContentStyle = {
                    ...schedulerContentStyle,
                    maxHeight: config.schedulerMaxHeight - config.tableHeaderHeight
                };
                resourceContentStyle = {
                    ...resourceContentStyle,
                    maxHeight: config.schedulerMaxHeight - config.tableHeaderHeight
                };
            }

            let resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;
            tbodyContent = (
                <tr>
                    <td style={{width: resourceTableWidth, verticalAlign: 'top'}}>
                        <div className="resource-view">
                            <div style={{overflow: "hidden", borderBottom: "1px solid #e9e9e9", height: config.tableHeaderHeight}}>
                                <div style={{overflowX: "scroll", overflowY: "hidden", margin: `0px 0px -${contentScrollbarHeight}px`}}>
                                    <table className="resource-table">
                                        <thead>
                                        <tr style={{height: config.tableHeaderHeight}}>
                                            <th className="header3-text">
                                                {resourceName}
                                            </th>
                                        </tr>
                                        </thead>
                                    </table>
                                </div>
                            </div>
                            <div style={resourceContentStyle} ref={this.schedulerResourceRef} onMouseOver={this.onSchedulerResourceMouseOver} onMouseOut={this.onSchedulerResourceMouseOut} onScroll={this.onSchedulerResourceScroll}>
                                <ResourceView
                                    {...this.props}
                                    contentScrollbarHeight={resourcePaddingBottom}
                                />
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="scheduler-view" style={{width: schedulerContainerWidth, verticalAlign: 'top'}}>
                            <div style={{overflow: "hidden", borderBottom: "1px solid #e9e9e9", height: config.tableHeaderHeight}}>
                                <div style={{overflowX: "scroll", overflowY: "hidden", margin: `0px 0px -${contentScrollbarHeight}px`}} ref={this.schedulerHeadRef} onMouseOver={this.onSchedulerHeadMouseOver} onMouseOut={this.onSchedulerHeadMouseOut} onScroll={this.onSchedulerHeadScroll}>
                                    <div style={{paddingRight: `${contentScrollbarWidth}px`, width: schedulerWidth + contentScrollbarWidth}}>
                                        <table className="scheduler-bg-table">
                                            <HeaderView {...this.props}/>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div style={schedulerContentStyle} ref={this.schedulerContentRef} onMouseOver={this.onSchedulerContentMouseOver} onMouseOut={this.onSchedulerContentMouseOut} onScroll={this.onSchedulerContentScroll} >
                                <div style={{width: schedulerWidth, height: contentHeight}}>
                                    <div className="scheduler-content">
                                        <table className="scheduler-content-table" >
                                            <tbody>
                                                {resourceEventsList}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="scheduler-bg">
                                        <table className="scheduler-bg-table" style={{width: schedulerWidth}} ref={this.schedulerContentBgTableRef} >
                                            <BodyView {...this.props}/>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            );
        };

        let popover = <div className="popover-calendar"><Calendar fullscreen={false} onSelect={this.onSelect}/></div>;
        let schedulerHeader = <div />;
        if(config.headerEnabled) {
            schedulerHeader = (
                <Row type="flex" align="middle" justify="space-between" style={{marginBottom: '24px'}}>
                    {leftCustomHeader}
                    <Col>
                        <div className='header2-text'>
                            <Icon type="left" style={{marginRight: "8px"}} className="icon-nav"
                                    onClick={this.goBack}/>
                            {
                            calendarPopoverEnabled
                                ?
                                <Popover content={popover} placement="bottom" trigger="click"
                                        visible={this.state.visible}
                                        onVisibleChange={this.handleVisibleChange}>
                                <span className={'header2-text-label'} style={{cursor: 'pointer'}}>{dateLabel}</span>
                                </Popover>
                                : <span className={'header2-text-label'}>{dateLabel}</span>
                            }
                            <Icon type="right" style={{marginLeft: "8px"}} className="icon-nav"
                                    onClick={this.goNext}/>
                        </div>
                    </Col>
                    <Col>
                        <RadioGroup defaultValue={defaultValue} size="default" onChange={this.onViewChange}>
                            {radioButtonList}
                        </RadioGroup>
                    </Col>
                    {rightCustomHeader}
                </Row>
            );
        }

        return (
            <table id="RBS-Scheduler-root" className="scheduler" style={{width: `${width}px`}}>
                <thead>
                <tr>
                    <td colSpan="2">
                        {schedulerHeader}
                    </td>
                </tr>
                </thead>
                <tbody>
                {tbodyContent}
                </tbody>
            </table>
        )
    }

    resolveScrollbarSize = () => {
        const { schedulerData } = this.props;
        let contentScrollbarHeight = 17, 
            contentScrollbarWidth = 17, 
            resourceScrollbarHeight = 17,
            resourceScrollbarWidth = 17,
            contentHeight = schedulerData.getSchedulerContentDesiredHeight();
        if (!!this.schedulerContent) {
            contentScrollbarHeight = this.schedulerContent.offsetHeight - this.schedulerContent.clientHeight;
            contentScrollbarWidth = this.schedulerContent.offsetWidth - this.schedulerContent.clientWidth;
        }
        if(!!this.schedulerResource) {
            resourceScrollbarHeight = this.schedulerResource.offsetHeight - this.schedulerResource.clientHeight;
            resourceScrollbarWidth = this.schedulerResource.offsetWidth - this.schedulerResource.clientWidth;
        }
        if(!!this.schedulerContentBgTable && !!this.schedulerContentBgTable.offsetHeight){
            contentHeight = this.schedulerContentBgTable.offsetHeight;
        }

        let tmpState = {};
        let needSet = false;
        if (contentScrollbarHeight !== this.state.contentScrollbarHeight) {
            tmpState = {...tmpState, contentScrollbarHeight: contentScrollbarHeight};
            needSet = true;
        }
        if (contentScrollbarWidth !== this.state.contentScrollbarWidth) {
            tmpState = {...tmpState, contentScrollbarWidth: contentScrollbarWidth};
            needSet = true;
        }
        if(contentHeight !== this.state.contentHeight){
            tmpState = {...tmpState, contentHeight: contentHeight};
            needSet = true;
        }
        if (resourceScrollbarHeight !== this.state.resourceScrollbarHeight) {
            tmpState = {...tmpState, resourceScrollbarHeight: resourceScrollbarHeight};
            needSet = true;
        }
        if (resourceScrollbarWidth !== this.state.resourceScrollbarWidth) {
            tmpState = {...tmpState, resourceScrollbarWidth: resourceScrollbarWidth};
            needSet = true;
        }
        if (needSet)
            this.setState(tmpState);
    }

    schedulerHeadRef = (element) => {
        this.schedulerHead = element;
    }

    onSchedulerHeadMouseOver = () => {
        this.currentArea = 2;
    }

    onSchedulerHeadMouseOut = () => {
        this.currentArea = -1;
    }

    onSchedulerHeadScroll = (proxy, event) => {
         if((this.currentArea === 2 || this.currentArea === -1) && this.schedulerContent.scrollLeft !== this.schedulerHead.scrollLeft)
             this.schedulerContent.scrollLeft = this.schedulerHead.scrollLeft;
    }

    schedulerResourceRef = (element) => {
        this.schedulerResource = element;
    }

    onSchedulerResourceMouseOver = () => {
        this.currentArea = 1;
    }

    onSchedulerResourceMouseOut = () => {
        this.currentArea = -1;
    }

    onSchedulerResourceScroll = (proxy, event) => {
         if((this.currentArea === 1 || this.currentArea === -1) && this.schedulerContent.scrollTop !== this.schedulerResource.scrollTop)
             this.schedulerContent.scrollTop = this.schedulerResource.scrollTop;
    }

    schedulerContentRef = (element) => {
        this.schedulerContent = element;
    }

    schedulerContentBgTableRef = (element) => {
        this.schedulerContentBgTable = element;
    }

    onSchedulerContentMouseOver = () => {
        this.currentArea = 0;
    }

    onSchedulerContentMouseOut = () => {
        this.currentArea = -1;
    }

    onSchedulerContentScroll = (proxy, event) => {
        if(this.currentArea === 0 || this.currentArea === -1) {
            if (this.schedulerHead.scrollLeft !== this.schedulerContent.scrollLeft)
                this.schedulerHead.scrollLeft = this.schedulerContent.scrollLeft;
            if (this.schedulerResource.scrollTop !== this.schedulerContent.scrollTop)
                this.schedulerResource.scrollTop = this.schedulerContent.scrollTop;
        }

        const {schedulerData, onScrollLeft, onScrollRight, onScrollTop, onScrollBottom } = this.props;
        const {scrollLeft, scrollTop} = this.state;
        if(this.schedulerContent.scrollLeft !== scrollLeft) {
            if(this.schedulerContent.scrollLeft === 0 && onScrollLeft !== undefined) {
                onScrollLeft(schedulerData, this.schedulerContent, this.schedulerContent.scrollWidth - this.schedulerContent.clientWidth);
            }
            if(this.schedulerContent.scrollLeft === this.schedulerContent.scrollWidth - this.schedulerContent.clientWidth && onScrollRight !== undefined) {
                onScrollRight(schedulerData, this.schedulerContent, this.schedulerContent.scrollWidth - this.schedulerContent.clientWidth);
            }
        } else if(this.schedulerContent.scrollTop !== scrollTop) {
            if(this.schedulerContent.scrollTop === 0 && onScrollTop !== undefined) {
                onScrollTop(schedulerData, this.schedulerContent, this.schedulerContent.scrollHeight - this.schedulerContent.clientHeight);
            }
            if(this.schedulerContent.scrollTop === this.schedulerContent.scrollHeight - this.schedulerContent.clientHeight && onScrollBottom !== undefined) {
                onScrollBottom(schedulerData, this.schedulerContent, this.schedulerContent.scrollHeight - this.schedulerContent.clientHeight);
            }
        }
        this.setState({
            scrollLeft: this.schedulerContent.scrollLeft,
            scrollTop: this.schedulerContent.scrollTop
        });
    }

    onViewChange = (e) => {
        const {onViewChange, schedulerData} = this.props;
        let viewType = parseInt(e.target.value.charAt(0));
        let showAgenda = e.target.value.charAt(1) === '1';
        let isEventPerspective = e.target.value.charAt(2) === '1';
        onViewChange(schedulerData, {viewType: viewType, showAgenda: showAgenda, isEventPerspective: isEventPerspective});
    }

    goNext = () => {
        const {nextClick, schedulerData} = this.props;
        nextClick(schedulerData);
    }

    goBack = () => {
        const {prevClick, schedulerData} = this.props;
        prevClick(schedulerData);
    }

    handleVisibleChange = (visible) => {
        this.setState({visible});
    }

    onSelect = (date) => {
        this.setState({
            visible: false,
        });

        const {onSelectDate, schedulerData} = this.props;
        onSelectDate(schedulerData, date);
    }
}

Scheduler.propTypes = {
    /* Dados a serem preenchidos no calendario **/
    schedulerData: PropTypes.object.isRequired,
    /* Funçao acionada pelo botao 'voltar' do calendario **/
    prevClick: PropTypes.func.isRequired,
    /* Funçao acionada pelo botao 'próximo' do calendario **/
    nextClick: PropTypes.func.isRequired,
    /* Funçao acionada quando o item do calendario for alterado **/
    onViewChange: PropTypes.func.isRequired,
    /* Funçao acionada quando o item do calendario for selecionado **/
    onSelectDate: PropTypes.func.isRequired,
    onSetAddMoreState: PropTypes.func,
    updateEventStart: PropTypes.func,
    updateEventEnd: PropTypes.func,
    moveEvent: PropTypes.func,
    movingEvent: PropTypes.func,
    leftCustomHeader: PropTypes.object,
    rightCustomHeader: PropTypes.object,
    newEvent: PropTypes.func,
    subtitleGetter: PropTypes.func,
    eventItemClick: PropTypes.func,
    viewEventClick: PropTypes.func,
    viewEventText: PropTypes.string,
    viewEvent2Click: PropTypes.func,
    viewEvent2Text: PropTypes.string,
    conflictOccurred: PropTypes.func,
    eventItemTemplateResolver: PropTypes.func,
    dndSources: PropTypes.array,
    slotClickedFunc: PropTypes.func,
    toggleExpandFunc: PropTypes.func,
    slotItemTemplateResolver: PropTypes.func,
    nonAgendaCellHeaderTemplateResolver: PropTypes.func,
    onScrollLeft: PropTypes.func,
    onScrollRight: PropTypes.func,
    onScrollTop: PropTypes.func,
    onScrollBottom: PropTypes.func,
}



export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export {SchedulerData, ViewTypes, CellUnits, SummaryPos, DnDSource, DnDContext, AddMorePopover, DemoData}
export default Scheduler