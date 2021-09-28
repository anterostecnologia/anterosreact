import * as React from 'react';
import './AnterosGantt.scss';
import dayjs from 'dayjs';
import memoize from "memoize-one";
import ResizeObserver from "resize-observer-polyfill";
import { boundClass } from '@anterostecnologia/anteros-react-core';

const SCROLL_BAR_WIDTH = 17;
const DEFAUT_HEADER = `welcome R-gantt-chart`;


const cacheParseTime = function () {
    let cacheString = {}
    let cacheValue = {}

    return function (timeName, timeString) {

        if (cacheString[timeName] !== timeString) {
            cacheString[timeName] = timeString;
            cacheValue[timeName] = parseTime(timeString)
        }

        return cacheValue[timeName]
    }
}()

function throttle(fn, interval = 100) {
    var _self = fn,
        timer,
        firstTime = true;
    return function () {
        var args = arguments,
            _me = this;
        if (firstTime) {
            _self.apply(_me, args);
            return firstTime = false;
        }
        if (timer) {
            return false;
        }
        timer = setTimeout(function () {
            clearTimeout(timer);
            timer = null;
            _self.apply(_me, args);
        }, interval);
    }
}

const scaleList = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60, 120, 180,
    240,
    360, 720, 1440
]

function validateScale(scale) {
    if (!scaleList.includes(scale)) {
        throw new RangeError(
            `错误的scale值，输入值为${scale},可用的scale值为${scaleList.join(',')}`)
    }
    return true;
}


function getBeginTimeOfTimeLine(start, scale = 60) {
    validateScale(scale)
    let timeBlocks;
    let startClone = start.clone();
    let rate = scale / 60;
    if (scale > 60) {
        timeBlocks = Math.floor(start.hour() / rate);
        startClone = startClone.hour(timeBlocks * rate).minute(0).second(0);
    } else {
        timeBlocks = Math.floor(start.minute() / scale);
        startClone = startClone.minute(timeBlocks * scale).second(0);
    }

    return startClone;
}

function isUndef(v) {
    return v === undefined || v === null
}

function isDef(v) {
    return v !== undefined && v !== null
}

function warn(str) {
    // eslint-disable-next-line
    console.warn(str)
}

function calcScalesAbout2Times(timeStart, timeEnd, scale = 60) {
    if (timeStart.isAfter(timeEnd)) {
        throw new TypeError('错误的参数顺序，函数calcScalesAbout2Times的第一个时间参数必须大于第二个时间参数')
    }

    validateScale(scale);

    let startBlocksTime = getBeginTimeOfTimeLine(timeStart, scale);
    let count = 0;
    while (!startBlocksTime.isAfter(timeEnd)) {
        count++;
        startBlocksTime = startBlocksTime.add(scale, "minute")
    }

    return count;

}

function _getWidthAbout2Times(start, end, arg) {
    let {
        scale,
        cellWidth
    } = arg;
    let pStart = cacheParseTime('pStart', start);
    let pEnd = parseTime(end)
    return diffTimeByMinutes(pStart, pEnd) / scale * cellWidth;
}


function _getPositionOffset(time, beginTimeOfTimeLine, arg) {
    let {
        scale,
        cellWidth,
    } = arg;
    let pTime = cacheParseTime('pStart', time);
    let pBeginTimeOfTimeLine = cacheParseTime('pBeginTimeOfTimeLine', beginTimeOfTimeLine);
    return diffTimeByMinutes(pBeginTimeOfTimeLine, pTime) / scale * cellWidth;
}

function parseTime(time) {
    return new Date(time)
}

function diffTimeByMinutes(start, end) {
    let diff = end.getTime() - start.getTime()
    return (diff / 1000 / 60)
}

class DynamicRender extends React.Component {
    static defaultProps = { preload: 1 };

    currentTopIndex = () => {
        const { scrollTop, cellHeight } = this.props
        return Math.ceil(scrollTop / cellHeight);
    }


    getRangeAndTopSpace = () => {
        const { cellHeight, preload, heightOfRenderAera } = this.props;
        const currentIndex = this.currentTopIndex();
        if (heightOfRenderAera === 0 || cellHeight === 0) {
            return [0, 0]
        }

        if (preload === 0) {
            return [-Infinity, Infinity, 0]
        }

        const end = currentIndex + Math.ceil(heightOfRenderAera / cellHeight) +
            preload;
        const start = currentIndex - preload > 0 ? currentIndex - preload : 0;
        const topSpace = start * cellHeight
        return [start, end, topSpace]
    }
}

@boundClass
class AnterosGantt extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            heightOfRenderAera: 0,
            widthOfRenderAera: 0,
            scrollTop: 0,
            scrollLeft: 0,
            startTimeOfRenderArea: undefined,
            endTimeOfRenderArea: undefined
        }

        this.start = memoize((startTime) => dayjs(startTime));

        this.end = memoize((startTime, endTime, widthOfRenderAera, scale, cellWidth) => {
            const start = this.start(this.props.startTime);
            let end = dayjs(endTime);
            const totalWidth = calcScalesAbout2Times(start, end, scale) * cellWidth;
            if (start.isAfter(end) || totalWidth <= widthOfRenderAera) {
                end = start.add((widthOfRenderAera / cellWidth) * scale, "minute");
            }
            return end;
        });

        this.calcScalesAbout2Times = memoize(calcScalesAbout2Times);

        this.getBeginTimeOfTimeLine = memoize(getBeginTimeOfTimeLine);

        this.headerTimelineRef = React.createRef();
        this.marklineAreaRef = React.createRef();
        this.leftbarWrapperRef = React.createRef();
        this.blocksWrapperRef = React.createRef();
        this.scrollYBarRef = React.createRef();
        this.scrollXBarRef = React.createRef();
    }

    getStartAndEnd = () => {
        const { startTime, endTime, scale, cellWidth } = this.props
        const { widthOfRenderAera } = this.state
        const start = this.start(startTime)
        const end = this.end(startTime, endTime, widthOfRenderAera, scale, cellWidth)
        return {
            start,
            end
        }
    }

    scrollToTime = (newV) => {
        const { start, end } = this.getStartAndEnd();
        const time = dayjs(newV);
        if (!(time.isAfter(start) && time.isBefore(end))) {
            warn(`当前滚动至${newV}不在${start}和${end}的范围之内`);
            return;
        }

        const { cellWidth, scale } = this.props;
        const beginTimeOfTimeLine = this.getBeginTimeOfTimeLine(start, scale)
        const beginTimeOfTimeLineToString = beginTimeOfTimeLine.toString()

        const getPositionOffset = (date) => {
            return _getPositionOffset(date, beginTimeOfTimeLineToString, {
                scale,
                cellWidth
            });
        }
        const offset = getPositionOffset(newV);
        this.syncScrollX(
            {
                target: {
                    scrollLeft: offset
                }
            },
            true
        )
    }

    scrollToPosition = (position) => {
        if (!position) {
            return;
        }
        const x = Number.isNaN(position.x) ? undefined : position.x;
        const y = Number.isNaN(position.y) ? undefined : position.y;
        const { scrollLeft, scrollTop } = this.state
        if (isDef(x) && x !== scrollLeft) {
            this.syncScrollX({ target: { scrollLeft: x } }, true);
        }
        if (isDef(y) && y !== scrollTop) {
            this.syncScrollY({ target: { scrollTop: y } }, true);
        }
    }

    componentDidMount = () => {
        const observeContainer = throttle(entries => {
            entries.forEach(entry => {
                const cr = entry.contentRect;
                this.setState({
                    heightOfRenderAera: cr.height,
                    widthOfRenderAera: cr.width
                })
            });
        });
        const observer = new ResizeObserver(observeContainer);
        observer.observe(this.blocksWrapperRef.current);
    }



    wheelHandle = (event) => {
        const { deltaX, deltaY } = event;
        const {
            scrollTop,
            scrollLeft,
            widthOfRenderAera,
            heightOfRenderAera
        } = this.state;

        const { startTime, endTime, scale, cellWidth, datas, cellHeight } = this.props

        const start = this.start(startTime)
        const end = this.end(startTime, endTime, widthOfRenderAera, scale, cellWidth)
        const totalScale = this.calcScalesAbout2Times(start, end, scale)
        const totalWidth = totalScale * cellWidth
        const totalHeight = datas.length * cellHeight
        const avialableScrollLeft = totalWidth - widthOfRenderAera - 1
        const avialableScrollTop = totalHeight - heightOfRenderAera - 1

        if (deltaY !== 0) {
            if (
                scrollTop + deltaY >= avialableScrollTop &&
                scrollTop !== avialableScrollTop
            ) {
                this.syncScrollY(
                    { target: { scrollTop: avialableScrollTop } },
                    true
                );
            } else if (
                scrollTop + deltaY < 0 &&
                scrollTop !== 0
            ) {
                this.syncScrollY({ target: { scrollTop: 0 } }, true);
            } else {
                this.syncScrollY(
                    { target: { scrollTop: scrollTop + deltaY } },
                    true
                );
            }
        }
        if (deltaX !== 0) {
            if (
                scrollLeft + deltaX >= avialableScrollLeft &&
                scrollLeft !== avialableScrollLeft
            ) {
                this.syncScrollX(
                    { target: { scrollLeft: avialableScrollLeft } },
                    true
                );
            } else if (
                scrollLeft + deltaX < 0 &&
                scrollLeft !== 0
            ) {
                this.syncScrollX({ target: { scrollLeft: 0 } }, true);
            } else {
                this.syncScrollX(
                    { target: { scrollLeft: scrollLeft + deltaX } },
                    true
                );
            }
        }

    }

    syncScrollY = (event, fake = false) => {
        const { leftbarWrapperRef, blocksWrapperRef, scrollYBarRef } = this;
        const topValue = event.target.scrollTop;
        if (fake) {
            scrollYBarRef.current.scrollTop = topValue;
            return;
        }
        leftbarWrapperRef.current.scrollTop = topValue;
        blocksWrapperRef.current.scrollTop = topValue;
        this.setState({
            scrollTop: topValue
        })
    }

    syncScrollX = (event, fake = false) => {
        const {
            blocksWrapperRef,
            headerTimelineRef,
            marklineAreaRef,
            scrollXBarRef
        } = this;
        const leftValue = event.target.scrollLeft;
        if (fake) {
            scrollXBarRef.current.scrollLeft = leftValue;
            return;
        }
        blocksWrapperRef.current.scrollLeft = leftValue;
        headerTimelineRef.current.scrollLeft = leftValue;
        marklineAreaRef.current.style.left = "-" + leftValue + "px";
        this.setState({
            scrollLeft: leftValue
        })
    }


    render() {
        const { startTime, endTime, scale, cellHeight, cellWidth, titleHeight, titleWidth, datas, showCurrentTime, hideYScrollBar, hideXScrollBar, hideHeader, dataKey, renderLeftBar, renderBlock, renderHeader, timelines } = this.props
        const { widthOfRenderAera, heightOfRenderAera, scrollLeft, scrollTop } = this.state
        const start = this.start(startTime)
        const end = this.end(startTime, endTime, widthOfRenderAera, scale, cellWidth)
        const totalScale = this.calcScalesAbout2Times(start, end, scale)
        const totalWidth = totalScale * cellWidth
        const totalHeight = datas.length * cellHeight
        // const totalHeight = 10000;
        const scrollYBarWidth = hideYScrollBar ? 0 : SCROLL_BAR_WIDTH
        const scrollXBarHeight = hideXScrollBar ? 0 : SCROLL_BAR_WIDTH
        const actualHeaderHeight = hideHeader ? 0 : titleHeight;
        const beginTimeOfTimeLine = this.getBeginTimeOfTimeLine(start, scale)
        const beginTimeOfTimeLineToString = beginTimeOfTimeLine.toString()

        const startTimeOfRenderArea = beginTimeOfTimeLine
            .add((scrollLeft / cellWidth) * scale, "minute")
            .toDate()
            .getTime();

        const endTimeOfRenderArea = beginTimeOfTimeLine
            .add(((scrollLeft + widthOfRenderAera) / cellWidth) * scale, "minute")
            .toDate()
            .getTime()

        const getPositionOffset = (date) => {
            return _getPositionOffset(date, beginTimeOfTimeLineToString, {
                scale,
                cellWidth
            });
        }

        const getWidthAbout2Times = (time1, time2) => {
            return _getWidthAbout2Times(time1, time2, {
                scale,
                cellWidth
            });
        }

        return (
            <div className="gantt-chart"
                onWheel={this.wheelHandle}>
                <div className="gantt-container"
                    style={{
                        height: `calc(100% - ${scrollXBarHeight}px)`, width: `calc(100% - ${scrollYBarWidth}px)`
                    }}>
                    <div
                        className="gantt-header"
                        style={{ display: hideHeader ? 'none' : 'flex', width: `calc(100% + ${scrollYBarWidth}px)` }}
                    >
                        <div className="gantt-header-title"
                            style={{ lineHeight: titleHeight + 'px', height: titleHeight, width: titleWidth }}
                        >{renderHeader ? renderHeader() : DEFAUT_HEADER}
                        </div>
                        <div ref={this.headerTimelineRef}
                            className="gantt-header-timeline"
                            style={{ width: `calc(100% - ${titleWidth}px)` }}>
                            <div className="gantt-timeline-wrapper"
                                style={{ width: totalWidth + scrollYBarWidth }}
                            >
                                <Timeline start={start}
                                    end={end}
                                    scale={scale}
                                    cellWidth={cellWidth}
                                    titleHeight={titleHeight} />
                            </div>
                        </div>
                    </div>

                    <div className="gantt-body"
                        style={{ height: `calc(100% - ${actualHeaderHeight}px)` }}
                    >
                        <div className="gantt-table">
                            <div ref={this.marklineAreaRef}
                                className="gantt-markline-area"
                                style={{ marginLeft: titleWidth }}>
                                {
                                    showCurrentTime && <CurrentTime getPositionOffset={getPositionOffset} />
                                }
                                {
                                    timelines.map((timeline, index) => {
                                        return <Markline key={index}
                                            getPositionOffset={getPositionOffset}
                                            bgc={timeline.color}
                                            markLineTime={timeline.time} />
                                    })
                                }
                            </div>
                            <div ref={this.leftbarWrapperRef}
                                className="gantt-leftbar-wrapper"
                                style={{ 'width': titleWidth, height: `calc(100% + ${scrollXBarHeight}px)` }}
                            >
                                <Leftbar
                                    dataKey={dataKey}
                                    cellHeight={cellHeight}
                                    datas={datas}
                                    heightOfRenderAera={heightOfRenderAera}
                                    scrollTop={scrollTop}
                                    visualHeight={totalHeight + scrollXBarHeight}
                                    renderLeftBar={renderLeftBar}
                                />
                            </div>
                            <div ref={this.blocksWrapperRef}
                                style={{ width: `calc(100% - ${titleWidth}px)` }}
                                className="gantt-blocks-wrapper">
                                <Block
                                    dataKey={dataKey}
                                    cellHeight={cellHeight}
                                    cellWidth={cellWidth}
                                    datas={datas}
                                    widthOfRenderAera={widthOfRenderAera}
                                    heightOfRenderAera={heightOfRenderAera}
                                    scrollLeft={scrollLeft}
                                    scrollTop={scrollTop}
                                    endTimeOfRenderArea={endTimeOfRenderArea}
                                    startTimeOfRenderArea={startTimeOfRenderArea}
                                    getPositionOffset={getPositionOffset}
                                    getWidthAbout2Times={getWidthAbout2Times}
                                    renderBlock={renderBlock}
                                    totalWidth={totalWidth} />
                            </div>
                        </div>
                    </div>
                </div>

                <div ref={this.scrollYBarRef}
                    className="gantt-scroll-y"
                    style={{
                        width: `${scrollYBarWidth}px`,
                        height: `calc(100% - ${actualHeaderHeight}px`, marginTop: `${actualHeaderHeight}px`
                    }}
                    onScroll={this.syncScrollY}
                >
                    <div style={{ height: totalHeight + 'px' }} ></div>
                </div>

                <div ref={this.scrollXBarRef}
                    className="gantt-scroll-x"
                    style={{
                        height: `${scrollXBarHeight}px`,
                        width: `calc(100% - ${titleWidth}px )`, marginLeft: titleWidth + 'px'
                    }}
                    onScroll={this.syncScrollX}
                >
                    <div style={{ width: totalWidth + 'px' }} ></div>
                </div>

            </div>
        );
    }
}

AnterosGantt.defaultProps = {
    startTime: dayjs().toString(),
    endTime: dayjs().toString(),
    scale: 60,
    cellWidth: 50,
    cellHeight: 40,
    titleHeight: 40,
    titleWidth: 200,
    showCurrentTime: false,
    hideHeader: false,
    hideXScrollBar: false,
    hideYScrollBar: false,
    datas: [],
    timelines: []
}


class Block extends DynamicRender {

    isInRenderingTimeRange = (time) => {
        if (this.props.heightOfRenderAera === 0) {
            return false;
        }

        const { startTimeOfRenderArea, endTimeOfRenderArea } = this.props;
        if (isUndef(startTimeOfRenderArea) || isUndef(endTimeOfRenderArea)) {
            return false;
        }

        const timeToMs = new Date(time).getTime();
        if (startTimeOfRenderArea <= timeToMs && timeToMs <= endTimeOfRenderArea) {
            return true;
        }
        return false;
    }

    render() {
        const { cellWidth, cellHeight, datas, dataKey, totalWidth, renderBlock, getWidthAbout2Times, getPositionOffset, startTimeOfRenderArea, endTimeOfRenderArea } = this.props
        const blockHeight = datas.length * cellHeight;
        const blockStyle = {
            backgroundSize: `${cellWidth}px ${cellHeight}px`,
            height: `${cellHeight}px`
        };
        const [startNum, endNum, topSpace] = this.getRangeAndTopSpace()
        const showDatas = datas.slice(startNum, endNum)

        return (
            <div className="gantt-blocks"
                style={{ height: blockHeight, width: totalWidth }}>
                <div className="gantt-block gantt-block-top-space"
                    style={{ height: topSpace + 'px' }}>
                </div>
                {
                    showDatas.map((data, index) => {
                        return (
                            <div className="gantt-block"
                                style={blockStyle}
                                key={dataKey ? data[dataKey] : index}>
                                {
                                    renderBlock ? renderBlock(data, getPositionOffset, getWidthAbout2Times, this.isInRenderingTimeRange, startTimeOfRenderArea, endTimeOfRenderArea) : 'need renderBlock'
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

class Leftbar extends DynamicRender {

    render() {
        const { cellHeight, datas, dataKey, visualHeight, renderLeftBar } = this.props
        const [startNum, endNum, topSpace] = this.getRangeAndTopSpace()
        const showDatas = datas.slice(startNum, endNum)

        return (
            <div className="gantt-leftbar" style={
                { height: visualHeight }
            }>
                <div className="gantt-leftbar-item gantt-block-top-space"
                    style={{ height: topSpace + 'px' }}>
                </div>
                {
                    showDatas.map((data, index) => {
                        return (
                            <div className="gantt-leftbar-item"
                                style={{ height: cellHeight }}
                                key={dataKey ? data[dataKey] : index}
                            >
                                {
                                    renderLeftBar ? renderLeftBar(data) : <div className="gantt-leftbar-defalutItem">need slot</div>
                                }

                            </div>
                        )
                    })
                }

            </div>
        )
    }
}

class Markline extends React.Component {

    render() {
        const { bgc, getPositionOffset, markLineTime } = this.props
        return (
            <div
                className="gantt-markline"
                style={{ backgroundColor: bgc, 'left': getPositionOffset(markLineTime) + 'px' }}>
                <div className="gantt-markline-label"
                    style={{ backgroundColor: bgc }}>
                    {dayjs(markLineTime).format("HH:mm:ss")}</div>
            </div>
        )
    }

}

class CurrentTime extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentTime: dayjs()
        }
        this.timerID = undefined;
    }

    componentDidMount() {
        this.timerID = setInterval(() => {
            this.setState({
                currentTime: dayjs()
            })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        const { bgc, getPositionOffset, } = this.props
        const time = this.state.currentTime.toString()
        return (
            <Markline bgc={bgc || 'rgba(255,0,0,.4)'} getPositionOffset={getPositionOffset}
                markLineTime={time} />
        )
    }
}

const START_DAY = Symbol();
const MIDDLE_DAY = Symbol();
const END_DAY = Symbol();

function isSameDay(one, two) {
    return one.isSame(two, "day");
}


function getTimeScales(date, start, end, scale) {
    if (isSameDay(date, start)) {
        return generateTimeScale(START_DAY, start, end, scale);
    } else if (isSameDay(date, end)) {
        return generateTimeScale(END_DAY, start, end, scale);
    } else {
        return generateTimeScale(MIDDLE_DAY, start, end, scale);
    }
}


function generateTimeScale(type, start, end, scale) {
    const totalblock = [];
    let a;
    let b;
    switch (type) {
        case START_DAY:
            a = getBeginTimeOfTimeLine(start, scale);
            if (isSameDay(start, end)) {
                b = end;
            } else {
                b = start.endOf("day");
            }
            break;
        case END_DAY:
            a = end.startOf("day");
            b = end;
            break;
        case MIDDLE_DAY:
            a = start.startOf("day");
            b = start.endOf("day");
            break;
        default:
            throw new TypeError("错误的计算类型");
    }
    while (!a.isAfter(b)) {
        if (scale >= 60) {
            totalblock.push(a.format("HH"));
        } else {
            totalblock.push(a.format("HH:mm"));
        }
        a = a.add(scale, "minute");
    }

    return totalblock;
}


function getDays(start, end) {
    const temp = [];
    let tempS = start.clone()
    for (; !isSameDay(tempS, end); tempS = tempS.add(1, "day")) {
        temp.push(tempS);
    }
    temp.push(tempS);
    return temp;
}

class Timeline extends React.PureComponent {
    render() {
        const { cellWidth, titleHeight, start, end, scale } = this.props
        const cellWidthStyle = {
            width: cellWidth
        };

        const heightStyle = {
            height: titleHeight / 2,
            lineHeight: titleHeight / 2 + 'px'
        };
        return (
            <div className="gantt-timeline"
                style={{ marginLeft: -cellWidth / 2 }} >
                {
                    getDays(start, end).map((day, index) => {
                        const scales = getTimeScales(day, start, end, scale)
                        return (
                            <div className="gantt-timeline-block" key={index} style={{ width: scales.length * cellWidth }}>
                                <div className="gantt-timeline-day "
                                    style={heightStyle}>{day.format("MM/DD")}</div>
                                <div className="gantt-timeline-scale "
                                    style={heightStyle}>
                                    {
                                        scales.map((hour, hkey) => {
                                            return <div key={hkey} style={cellWidthStyle}>{hour}</div>
                                        })
                                    }
                                </div>

                            </div>
                        )
                    })
                }
            </div>
        )
    }
}



export { AnterosGantt }