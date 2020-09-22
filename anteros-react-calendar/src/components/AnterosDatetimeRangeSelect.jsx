import React from 'react';
import Fragment from 'react-dot-fragment';
import moment from 'moment';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { AnterosIcon } from '@anterostecnologia/anteros-react-image';
import { AnterosInputGroup, AnterosInputGroupAddOn } from '@anterostecnologia/anteros-react-containers';
import { AnterosLabel } from '@anterostecnologia/anteros-react-label';
export const mobileBreakPoint = 680;
import { findDOMNode } from 'react-dom';

const ModeEnum = Object.freeze({ start: 'start', end: 'end' });
let momentFormat = 'DD-MM-YYYY HH:mm';

const browserVersion = () => {
    let ua = navigator.userAgent,
        tem,
        M =
            ua.match(
                /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
            ) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return `IE ${tem[1] || ''}`;
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null)
            return tem
                .slice(1)
                .join(' ')
                .replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
};

const isFirefoxBelow53 = () => {
    let browser = browserVersion();
    if (!browser) {
        return false;
    }
    let browserSplit = browser.split(' ');
    if (browserSplit.length !== 2) {
        return false;
    }
    if (browserSplit[0] !== 'Firefox') {
        return false;
    }
    try {
        let versionNumber = Number.parseInt(browserSplit[1]);
        if (versionNumber <= 52) {
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
};

const getCalendarGridClassName = () => {
    let firefoxBelow35 = isFirefoxBelow53();
    if (firefoxBelow35) {
        return 'calendarGridFirefoxBelow35';
    } else {
        return 'calendarGrid';
    }
};

const getCalendarGridHeaderClassName = () => {
    let firefoxBelow35 = isFirefoxBelow53();
    if (firefoxBelow35) {
        return 'calendarGridHeaderFirefoxBelow35';
    } else {
        return;
    }
};

const getCalendarGridCellClassName = () => {
    let firefoxBelow35 = isFirefoxBelow53();
    if (firefoxBelow35) {
        return 'calendarCellFirefoxBelow35';
    } else {
        return 'calendarCell';
    }
};

const createYears = (userDefinedYears, descendingYears) => {
    let years = [];
    if (!userDefinedYears) {
        //Range from 1900 to 25 years into the future
        let past = moment('19000101', 'YYYYMMDD');
        let yearsToGetFuture = 10;
        let endYear = moment()
            .add(yearsToGetFuture, 'years')
            .get('year');
        let addedCurrentYear = false;
        while (!addedCurrentYear) {
            if (past.get('years') === endYear) {
                addedCurrentYear = true;
            }
            years.push(past.year());
            past.add(1, 'years');
        }
    } else {
        let start = userDefinedYears[0];
        let end = userDefinedYears[1];
        for (let i = start; i <= end; i++) {
            years.push(i);
        }
    }
    return sortYears(years, descendingYears);
};

const sortYears = (years, descendingYears) => {
    if (descendingYears) {
        return years.reverse();
    }
    return years;
};

const propValidation = props => {
    if (props.years) {
        if (!Array.isArray(props.years)) {
            return 'Year props should be an array e.g. [2019, 2020]';
        }
        if (props.years.length !== 2) {
            return 'Year props should be an array of 2, with the first number being the start date and the second being the end';
        }
        let { start, end, years } = props;
        if (years[0] > years[1]) {
            return 'Start year must be before the end';
        }
        // Start year defined must be between the custom user defined dates
        let isStartYearBetweenUserDefinedYears =
            start.year() >= years[0] && start.year() <= years[1];
        // End year defined must be between the custom user defined dates
        let isEndYearBetweenUserDefinedYears =
            end.year() >= years[0] && end.year() <= years[1];
        if (!isStartYearBetweenUserDefinedYears) {
            return 'Start year should be in the custom years defined';
        }
        if (!isEndYearBetweenUserDefinedYears) {
            return 'End year should be in the custom years defined';
        }
    }
    return true;
};

const datePicked = (startDate, endDate, newDate, startMode, smartMode) => {
    if (startMode) {
        return newDateStartMode(newDate, endDate, smartMode, startDate);
    } else {
        return newDateEndMode(newDate, startDate, smartMode, endDate);
    }
};

const newDateStartMode = (newDate, endDate, smartMode, startDate) => {
    // Create a new moment object which combines the new date and the original start date as newDate
    // doesnt contain time info which is important to determining equality
    let newDateWithTime = createNewDateWithTime(newDate, startDate.hour(), startDate.minute(), startDate.second());
    if (newDateWithTime.isSameOrBefore(endDate, 'seconds')) {
        return returnDateObject(newDate, endDate);
    } else if (smartMode) {
        let newEnd = moment(newDate);
        newEnd.add(1, 'days');
        return returnDateObject(newDate, newEnd);
    } else {
        return returnDateObject(startDate, endDate);
    }
};

const newDateEndMode = (newDate, startDate, smartMode, endDate) => {
    // Create a new moment object which combines the new date and the original end date as newDate
    // doesnt contain time info which is important to determining equality
    let newDateWithTime = createNewDateWithTime(newDate, endDate.hour(), endDate.minute(), endDate.second());
    if (newDateWithTime.isSameOrAfter(startDate, 'seconds')) {
        return returnDateObject(startDate, newDate);
    } else if (smartMode) {
        let newStart = moment(newDate);
        newStart.subtract(1, 'days');
        return returnDateObject(newStart, newDate);
    } else {
        return returnDateObject(startDate, endDate);
    }
};

const createNewDateWithTime = (newDate, hour, minute, second) => {
    let newDateTmp = [newDate.year(), newDate.month(), newDate.date()];
    let newDateWithTime = moment(newDateTmp);
    newDateWithTime.hour(hour);
    newDateWithTime.minute(minute);
    newDateWithTime.second(second);
    return newDateWithTime;
};

const returnDateObject = (startDate, endDate) => {
    let returnValues = {};
    returnValues.startDate = startDate;
    returnValues.endDate = endDate;
    return returnValues;
};

const pastMaxDate = (currentDate, maxDate, minuteMode) => {
    if (!maxDate) {
        return false;
    }
    if (minuteMode && maxDate && currentDate.isAfter(maxDate, 'seconds')) {
        return true;
    }
    if (maxDate && currentDate.isAfter(maxDate, 'day')) {
        return true;
    }
    return false;
};

const generateHours = () => {
    let hours = [];
    for (let i = 0; i < 24; i++) {
        hours.push(i);
    }
    return hours;
};

const generateMinutes = () => {
    let minutes = [];
    for (let i = 0; i < 60; i++) {
        if (i < 10) {
            minutes.push(`0${i.toString()}`);
        } else {
            minutes.push(i.toString());
        }
    }
    return minutes;
};

function workOutMonthYear(date, secondDate, mode, pastSearchFriendly, smartMode) {
    // If both months are different months then
    // allow normal display in the calendar
    let selectedMonth = date.month();
    let otherMonth = secondDate.month();
    if (selectedMonth !== otherMonth) {
        return date;
    }
    // If pastSearch Friendly mode is on and both months are the same and the same year
    // have "end"/right as the month and "start"/left as -1 month
    else if (date.year() === secondDate.year() && mode === ModeEnum.start && pastSearchFriendly && smartMode) {
        let lastMonth = JSON.parse(JSON.stringify(date));
        lastMonth = moment(lastMonth);
        lastMonth.subtract(1, 'month');
        return lastMonth;
    }
    // If pastSearch Friendly mode is off and both months are the same and the same year
    // have "end"/right as the month and "start"/left as +1 month
    else if (date.year() === secondDate.year() && mode === ModeEnum.end && !pastSearchFriendly && smartMode) {
        let lastMonth = JSON.parse(JSON.stringify(date));
        lastMonth = moment(lastMonth);
        lastMonth.add(1, 'month');
        return lastMonth;
    } else {
        return date;
    }
}

const getMonth = (date, secondDate, mode, pastSearchFriendly, smartMode) =>
    workOutMonthYear(date, secondDate, mode, pastSearchFriendly, smartMode).month();

const getYear = (date, secondDate, mode, pastSearchFriendly, smartMode) =>
    workOutMonthYear(date, secondDate, mode, pastSearchFriendly, smartMode).year();

const getDaysBeforeStartMonday = firstDayOfMonth => {
    let fourtyTwoDays = [];
    let dayBeforeFirstDayOfMonth = firstDayOfMonth.day() - 1; // We dont want to include the first day of the new month
    // Case whereby day before is a Saturday (6) and we require Saturday back to Monday for that week
    if (dayBeforeFirstDayOfMonth === -1) {
        for (let i = 6; i > 0; i--) {
            let firstDayOfMonthCopy = firstDayOfMonth.clone();
            firstDayOfMonthCopy = firstDayOfMonthCopy.subtract(i, 'd');
            fourtyTwoDays.push(firstDayOfMonthCopy);
        }
    }
    // Case Whereby day before first day is the Sunday (0), therefore we want the entire previous week
    if (dayBeforeFirstDayOfMonth === 0) {
        for (let i = 7; i > 0; i--) {
            let firstDayOfMonthCopy = firstDayOfMonth.clone();
            firstDayOfMonthCopy = firstDayOfMonthCopy.subtract(i, 'd');
            fourtyTwoDays.push(firstDayOfMonthCopy);
        }
    }
    // Every other day
    else {
        for (let i = dayBeforeFirstDayOfMonth; i > 0; i--) {
            let firstDayOfMonthCopy = firstDayOfMonth.clone();
            firstDayOfMonthCopy = firstDayOfMonthCopy.subtract(i, 'd');
            fourtyTwoDays.push(firstDayOfMonthCopy);
        }
    }
    return fourtyTwoDays;
};

const getDaysBeforeStartSunday = firstDayOfMonth => {
    let fourtyTwoDays = [];
    let dayBeforeFirstDayOfMonth = firstDayOfMonth.day() - 1; // We dont want to include the first day of the new month

    // Case whereby we need all previous week days
    if (dayBeforeFirstDayOfMonth === -1) {
        for (let i = 7; i > 0; i--) {
            let firstDayOfMonthCopy = firstDayOfMonth.clone();
            firstDayOfMonthCopy = firstDayOfMonthCopy.subtract(i, 'd');
            fourtyTwoDays.push(firstDayOfMonthCopy);
        }
    }
    // Every other day
    else {
        for (let i = dayBeforeFirstDayOfMonth + 1; i > 0; i--) {
            let firstDayOfMonthCopy = firstDayOfMonth.clone();
            firstDayOfMonthCopy = firstDayOfMonthCopy.subtract(i, 'd');
            fourtyTwoDays.push(firstDayOfMonthCopy);
        }
    }
    return fourtyTwoDays;
};

const getDaysBeforeStart = (firstDayOfMonth, sundayFirst) => {
    if (!sundayFirst) {
        return getDaysBeforeStartMonday(firstDayOfMonth);
    } else {
        return getDaysBeforeStartSunday(firstDayOfMonth);
    }
};

const getFourtyTwoDays = (initMonth, initYear, sundayFirst) => {
    let fourtyTwoDays = [];
    let firstDayOfMonth = moment(new Date(initYear, initMonth, 1));

    fourtyTwoDays = getDaysBeforeStart(firstDayOfMonth, sundayFirst);
    // Add in all days this month
    for (let i = 0; i < firstDayOfMonth.daysInMonth(); i++) {
        fourtyTwoDays.push(firstDayOfMonth.clone().add(i, 'd'));
    }
    // Add in all days at the end of the month until last day of week seen
    let lastDayOfMonth = moment(new Date(initYear, initMonth, firstDayOfMonth.daysInMonth()));
    let toAdd = 1;
    let gotAllDays = false;
    while (!gotAllDays) {
        if (fourtyTwoDays.length >= 42) {
            gotAllDays = true;
            break;
        }
        fourtyTwoDays.push(lastDayOfMonth.clone().add(toAdd, 'd'));
        toAdd++;
    }
    return fourtyTwoDays;
};

const isInbetweenDates = (isStartDate, dayToFindOut, start, end) => {
    let isInBetweenDates;
    if (isStartDate) {
        isInBetweenDates = dayToFindOut.isAfter(start) && dayToFindOut.isBefore(end);
    } else {
        isInBetweenDates = dayToFindOut.isBefore(start) && dayToFindOut.isAfter(end);
    }
    return isInBetweenDates;
};

const isValidTimeChange = (mode, date, start, end) => {
    let modeStartAndDateSameOrBeforeStart = mode === 'start' && date.isSameOrBefore(end);
    let modeEndAndDateSameOrAfterEnd = mode === 'end' && date.isSameOrAfter(start);
    return modeStartAndDateSameOrBeforeStart || modeEndAndDateSameOrAfterEnd;
};

const startDateStyle = () => ({
    borderRadius: '4px 0 0 4px',
    borderColour: 'transparent',
    color: '#fff',
    backgroundColor: '#357abd',
    cursor: 'pointer',
});

const endDateStyle = () => ({
    borderRadius: '0 4px 4px 0',
    borderColour: 'transparent',
    color: '#fff',
    backgroundColor: '#357abd',
    cursor: 'pointer',
});

const inBetweenStyle = () => ({
    borderRadius: '0',
    borderColour: 'transparent',
    color: '#000',
    backgroundColor: '#ebf4f8',
    cursor: 'pointer',
});

const normalCellStyle = darkMode => {
    let color = darkMode ? 'white' : 'black';
    return {
        borderRadius: '0 0 0 0',
        borderColour: 'transparent',
        color: color,
        backgroundColor: '',
    };
};

const hoverCellStyle = (between, darkMode) => {
    let borderRadius = '4px 4px 4px 4px';
    let color = darkMode ? 'white' : 'black';
    let backgroundColor = darkMode ? 'rgb(53, 122, 189)' : '#eee';
    if (between) {
        borderRadius = '0 0 0 0';
    }
    return {
        borderRadius: borderRadius,
        borderColour: 'transparent',
        color: color,
        backgroundColor: backgroundColor,
        cursor: 'pointer',
    };
};

const greyCellStyle = darkMode => {
    let color = darkMode ? '#ffffff' : '#999';
    let backgroundColor = darkMode ? '#777777' : '#fff';
    let opacity = darkMode ? '0.5' : '0.25';
    let borderRadius = '4px 4px 4px 4px';
    return {
        borderRadius: borderRadius,
        borderColour: 'transparent',
        color: color,
        backgroundColor: backgroundColor,
        cursor: 'pointer',
        opacity: opacity,
    };
};

const invalidStyle = darkMode => {
    let style = greyCellStyle(darkMode);
    style.cursor = 'not-allowed';
    return style;
};

const rangeButtonSelectedStyle = () => ({
    color: '#f5f5f5',
    fontSize: '13px',
    border: '1px solid #f5f5f5',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '8px',
    marginLeft: '4px',
    marginRight: '4px',
    marginTop: '4px',
    backgroundColor: '#08c',
});

const rangeButtonStyle = () => ({
    color: '#08c',
    fontSize: '13px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #f5f5f5',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '8px',
    marginLeft: '4px',
    marginRight: '4px',
    marginTop: '4px',
});

const addFocusStyle = (focused, currentStyle) => {
    let style = JSON.parse(JSON.stringify(currentStyle));
    if (focused) {
        style.outline = 'cornflowerblue';
        style.outlineStyle = 'auto';
    } else {
        style.outlineStyle = '';
    }
    return style;
};

const white = '#FFFFFF';
const black = '#161617';
const lightTheme = {
    background: white,
    color: black,
};

const darkTheme = {
    background: black,
    color: white,
};

class DateField extends React.Component {
    constructor(props) {
        super(props);

        this.onChangeDateTextHandler = this.onChangeDateTextHandler.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onChangeDateTextHandler(event) {
        this.props.onChangeDateTextHandlerCallback(
            event.target.value,
            this.props.mode,
        );
    }

    onBlur() {
        this.props.dateTextFieldCallback(this.props.mode);
    }

    onClick() {
        if (this.props.mode === 'start') {
            this.props.changeSelectingModeCallback(true);
        } else {
            this.props.changeSelectingModeCallback(false);
        }
    }

    render() {
        let glyphColor = this.props.darkMode ? '#FFFFFF' : '#555';
        let theme = this.props.darkMode ? darkTheme : lightTheme;
        return (
            <AnterosInputGroup onClick={this.onClick} style={{ cursor: 'pointer' }}>
                <AnterosInputGroupAddOn className="calendarAddon">
                    <AnterosIcon style={{ color: glyphColor }} icon="fal fa-calendar-alt" />
                </AnterosInputGroupAddOn>
                <input
                    className="form-control inputDate"
                    id={"DateTimeInput_" + this.props.mode}
                    style={theme}
                    type="text"
                    value={this.props.dateLabel}
                    onChange={this.onChangeDateTextHandler}
                    onBlur={this.onBlur}
                />
            </AnterosInputGroup>
        );
    }
}

DateField.propTypes = {
    changeSelectingModeCallback: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    dateLabel: PropTypes.string.isRequired,
    dateTextFieldCallback: PropTypes.func.isRequired,
    onChangeDateTextHandlerCallback: PropTypes.func.isRequired,
    darkMode: PropTypes.bool,
};

class ActiveNotifier extends React.Component {
    getDotDiv(text, style, id) {
        return (
            <div className="activeNotifier" id={id}>
                {text} <span className="dot" style={style} />
            </div>
        );
    }

    render() {
        let selectingModeFrom = this.props.selectingModeFrom;
        let mode = this.props.mode;
        let startDotStyle =
            this.props.style && this.props.style.fromDot ? this.props.style.fromDot : { backgroundColor: '#12bc00' };
        let endDotStyle =
            this.props.style && this.props.style.toDot ? this.props.style.toDot : { backgroundColor: '#D70022' };
        let startNotifierID = 'startNotifierID';
        let endNotifierID = 'endNotifierID';
        let local = this.props.local;
        if (this.props.smartMode) {
            if (selectingModeFrom && mode === 'start') {
                let label = local && local.selectingFrom ? local.selectingFrom : 'Selecting From';
                return this.getDotDiv(`${label} `, startDotStyle, startNotifierID);
            } else if (!selectingModeFrom && mode === 'end') {
                let label = local && local.selectingTo ? local.selectingTo : 'Selecting To';
                return this.getDotDiv(`${label} `, endDotStyle, endNotifierID);
            }
        } else {
            if (mode === 'start') {
                let label = local && local.fromDate ? local.fromDate : 'From Date';
                return this.getDotDiv(`${label} `, startDotStyle, startNotifierID);
            } else if (mode === 'end') {
                let label = local && local.toDate ? local.toDate : 'To Date';
                return this.getDotDiv(`${label} `, endDotStyle, endNotifierID);
            }
        }
        return <div />;
    }
}

ActiveNotifier.propTypes = {
    mode: PropTypes.string.isRequired,
    selectingModeFrom: PropTypes.bool.isRequired,
    smartMode: PropTypes.bool,
    style: PropTypes.object,
    local: PropTypes.object,
};

class ApplyCancelButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverColourApply: '#5cb85c',
            hoverColourCancel: '#fff',
            applyFocus: false,
            cancelFocus: false,
        };
        this.bindToFunctions();
    }

    bindToFunctions() {
        this.mouseEnterApply = this.mouseEnterApply.bind(this);
        this.mouseLeaveApply = this.mouseLeaveApply.bind(this);
        this.mouseEnterCancel = this.mouseEnterCancel.bind(this);
        this.mouseLeaveCancel = this.mouseLeaveCancel.bind(this);
        this.cancelPressed = this.cancelPressed.bind(this);
        this.applyPressed = this.applyPressed.bind(this);
        this.applyOnKeyPress = this.applyOnKeyPress.bind(this);
        this.cancelOnKeyPress = this.cancelOnKeyPress.bind(this);
        this.applyOnFocus = this.applyOnFocus.bind(this);
        this.applyOnBlur = this.applyOnBlur.bind(this);
        this.cancelOnBlur = this.cancelOnBlur.bind(this);
        this.cancelOnFocus = this.cancelOnFocus.bind(this);
    }

    mouseEnterApply() {
        this.setState({ hoverColourApply: '#3e8e41' });
    }

    mouseLeaveApply() {
        this.setState({ hoverColourApply: '#5cb85c' });
    }

    mouseEnterCancel() {
        this.setState({ hoverColourCancel: 'rgb(192, 185, 185)' });
    }

    mouseLeaveCancel() {
        this.setState({ hoverColourCancel: '#fff' });
    }

    cancelPressed() {
        this.props.changeVisibleState();
    }

    applyPressed() {
        this.props.applyCallback();
    }

    applyOnFocus() {
        this.setState({ applyFocus: true });
    }

    applyOnBlur() {
        this.setState({ applyFocus: false });
    }

    cancelOnFocus() {
        this.setState({ cancelFocus: true });
    }

    cancelOnBlur() {
        this.setState({ cancelFocus: false });
    }

    isSpaceBarOrEnterPressed(e) {
        if (e.keyCode === 32 || e.keyCode === 13) {
            return true;
        }
        return false;
    }

    applyOnKeyPress(e) {
        if (this.isSpaceBarOrEnterPressed(e)) {
            this.props.applyCallback();
        }
    }

    cancelOnKeyPress(e) {
        if (this.isSpaceBarOrEnterPressed(e)) {
            this.props.changeVisibleState();
        }
    }

    renderButton(
        className,
        onMouseEnter,
        onMouseLeave,
        onClick,
        style,
        onKeyDown,
        onFocus,
        onBlur,
        text,
    ) {
        let styleLocal;
        if (text === 'Apply') {
            styleLocal = addFocusStyle(this.state.applyFocus, style);
        } else {
            styleLocal = addFocusStyle(this.state.cancelFocus, style);
        }
        return (
            <div
                className={className}
                role="button"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
                style={styleLocal}
                onKeyDown={onKeyDown}
                tabIndex={0}
                onFocus={onFocus}
                onBlur={onBlur}
            >
                {text}
            </div>
        );
    }

    getMaxDateBox() {
        if (this.props.maxDate) {
            let label = (this.props.local && this.props.local.maxDate ? this.props.local.maxDate : 'Max Date')
            return (
                <div className="maxDateLabel">
                    {label}: {this.props.maxDate.format(this.props.local.format)}
                </div>
            );
        }
    }

    renderButtons() {
        let applyButton;
        let closeButtonText = (this.props.local && this.props.local.close) ? this.props.local.close : 'Close';
        if (!this.props.autoApply) {
            applyButton = this.renderButton(
                'buttonSeperator applyButton',
                this.mouseEnterApply,
                this.mouseLeaveApply,
                this.applyPressed,
                { backgroundColor: this.state.hoverColourApply },
                this.applyOnKeyPress,
                this.applyOnFocus,
                this.applyOnBlur,
                (this.props.local && this.props.local.apply) ? this.props.local.apply : 'Apply'
            );
            closeButtonText = (this.props.local && this.props.local.cancel) ? this.props.local.cancel : 'Cancel';
        }
        let closeButton = this.renderButton(
            'buttonSeperator cancelButton',
            this.mouseEnterCancel,
            this.mouseLeaveCancel,
            this.cancelPressed,
            { backgroundColor: this.state.hoverColourCancel },
            this.cancelOnKeyPress,
            this.cancelOnFocus,
            this.cancelOnBlur,
            closeButtonText,
        );
        return (
            <Fragment>
                {applyButton}
                {!this.props.standalone ? closeButton : null}
            </Fragment>
        );
    }

    render() {
        let maxDateBox = this.getMaxDateBox();
        let buttons = this.renderButtons();
        let style = undefined;
        if (this.props.standalone) {
            style = { position: 'unset', float: 'right' };
        }
        return (
            <div id="buttonContainer" className="buttonContainer" style={style}>
                {maxDateBox}
                {buttons}
            </div>
        );
    }
}

ApplyCancelButtons.propTypes = {
    local: PropTypes.object,
    maxDate: momentPropTypes.momentObj,
    applyCallback: PropTypes.func.isRequired,
    changeVisibleState: PropTypes.func.isRequired,
    autoApply: PropTypes.bool,
    standalone: PropTypes.bool,
};



class MonthYearSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            monthFocus: false,
            yearFocus: false,
        };

        this.monthFocus = this.monthFocus.bind(this);
        this.yearFocus = this.yearFocus.bind(this);
        this.monthBlur = this.monthBlur.bind(this);
        this.yearBlur = this.yearBlur.bind(this);
    }

    createCalendarMonths(months) {
        return this.mapToOption(months);
    }

    createYears(years) {
        return this.mapToOption(years);
    }

    monthFocus() {
        this.setState({ monthFocus: true });
    }

    monthBlur() {
        this.setState({ monthFocus: false });
    }

    yearFocus() {
        this.setState({ yearFocus: true });
    }

    yearBlur() {
        this.setState({ yearFocus: false });
    }

    mapToOption(variableArray) {
        return variableArray.map(function (varInstance, i) {
            return <option key={i}>{varInstance}</option>;
        });
    }

    createGlyph(icon, onClickHandler, previous, next) {
        return (
            <AnterosIcon
                icon={icon}
                style={{ cursor: 'pointer' }}
                onClick={() => onClickHandler(previous, next)}
            />
        );
    }

    render() {
        let months = this.createCalendarMonths(this.props.months);
        let years = this.createYears(this.props.years);
        let theme = this.props.darkMode ? darkTheme : lightTheme;
        let leftArrow = this.createGlyph(
            'fas fa-chevron-left',
            this.props.changeMonthArrowsCallback,
            true,
            false,
        );
        let rightArrow = this.createGlyph(
            'fas fa-chevron-right',
            this.props.changeMonthArrowsCallback,
            false,
            true,
        );
        let monthFocusStyle = {};
        monthFocusStyle = addFocusStyle(this.state.monthFocus, monthFocusStyle);
        let yearFocusStyle = {};
        yearFocusStyle = addFocusStyle(this.state.yearFocus, yearFocusStyle);

        return (
            <div className="monthYearContainer">
                <div className="multipleContentOnLine leftChevron">{leftArrow}</div>
                <div
                    className="multipleContentOnLine"
                    onFocus={this.monthFocus}
                    onBlur={this.monthBlur}
                    style={monthFocusStyle}
                >
                    <select
                        id={'MonthSelector_' + this.props.mode}
                        value={this.props.months[this.props.month]}
                        onChange={this.props.changeMonthCallback}
                        style={theme}
                    >
                        {months}
                    </select>
                </div>
                <div
                    className="multipleContentOnLine"
                    onFocus={this.yearFocus}
                    onBlur={this.yearBlur}
                    style={yearFocusStyle}
                >
                    <select
                        id={'YearSelector_' + this.props.mode}
                        value={this.props.year}
                        onChange={this.props.changeYearCallback}
                        style={theme}
                    >
                        {years}
                    </select>
                </div>
                <div className="multipleContentOnLine rightChevron">{rightArrow}</div>
            </div>
        );
    }
}

MonthYearSelector.propTypes = {
    months: PropTypes.array.isRequired,
    years: PropTypes.array.isRequired,
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
    changeMonthCallback: PropTypes.func.isRequired,
    changeYearCallback: PropTypes.func.isRequired,
    changeMonthArrowsCallback: PropTypes.func.isRequired,
    darkMode: PropTypes.bool,
};

class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.state = { style: {} };

        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentDidUpdate(oldProps) {
        if (!this.props.date.isSame(oldProps.date) || !this.props.otherDate.isSame(oldProps.otherDate)) {
            this.styleCellNonMouseEnter();
        }
        if (!this.props.cellDay.isSame(oldProps.cellDay)) {
            this.styleCellNonMouseEnter();
        }

        // If a Cell is Selected
        // If the focusDate is this cell
        // and its not a gray cell
        // Then Focus on this cell
        let cellFocused = false;
        let focusDateIsCellDate =
            typeof this.props.focusDate === 'object' && this.props.focusDate.isSame(this.props.cellDay, 'day');
        let activeElement = document.activeElement.id;
        if (activeElement && activeElement.indexOf('_cell_') !== -1) {
            cellFocused = true;
        }
        if (cellFocused && focusDateIsCellDate && !this.isCellMonthSameAsPropMonth(this.props.cellDay)) {
            this.cell.focus();
            this.props.focusOnCallback(false);
        }
    }

    pastMaxDatePropsChecker(isCellDateProp, days) {
        if (isCellDateProp) {
            if (pastMaxDate(moment(this.props.date).add(days, 'days'), this.props.maxDate, true)) {
                return true;
            }
        } else {
            if (pastMaxDate(moment(this.props.otherDate).add(days, 'days'), this.props.maxDate, true)) {
                return true;
            }
        }
        return false;
    }

    keyDown(e) {
        let componentFocused = document.activeElement === findDOMNode(this.cell);
        if (componentFocused && e.keyCode >= 37 && e.keyCode <= 40) {
            e.preventDefault();
            let newDate = moment(this.props.cellDay);
            // Check to see if this cell is the date prop
            let isCellDateProp = this.props.cellDay.isSame(this.props.date, 'day');
            if (e.keyCode === 38) {
                // Up Key
                newDate.subtract(7, 'days');
            } else if (e.keyCode === 40) {
                // Down Key
                if (this.pastMaxDatePropsChecker(isCellDateProp, 7)) {
                    return;
                }
                newDate.add(7, 'days');
            } else if (e.keyCode === 37) {
                // Left Key
                newDate.subtract(1, 'days');
            } else if (e.keyCode === 39) {
                // Right Key
                if (this.pastMaxDatePropsChecker(isCellDateProp, 1)) {
                    return;
                }
                newDate.add(1, 'days');
            }
            let isSuccessfulCallback = this.props.keyboardCellCallback(this.props.cellDay, newDate);
            if (isSuccessfulCallback) {
                this.props.focusOnCallback(newDate);
            }
        }
    }

    onClick() {
        if (pastMaxDate(this.props.cellDay, this.props.maxDate, false)) {
            return;
        }
        this.props.dateSelectedNoTimeCallback(this.props.cellDay, this.props.mode);
    }

    mouseEnter() {
        // If Past Max Date Style Cell Out of Use
        if (this.checkAndSetMaxDateStyle(this.props.cellDay)) {
            return;
        }
        // If smart mode disabled check cell dates to ensure not past end in start mode and not before start in end mode
        if (!this.props.smartMode && this.nonSmartModePastStartAndEndChecks(this.props.cellDay)) {
            return;
        }
        // Custom hover cell styling
        if (this.props.style && this.props.style.hoverCell) {
            let style = Object.assign(hoverCellStyle(false, this.props.darkMode), this.props.style.hoverCell);
            return this.setState({ style: style });
        }
        // Hover Style Cell, Different if inbetween start and end date
        let isDateStart = this.props.date.isSameOrBefore(this.props.otherDate, 'second');
        if (isInbetweenDates(isDateStart, this.props.cellDay, this.props.date, this.props.otherDate)) {
            this.setState({ style: hoverCellStyle(true, this.props.darkMode) });
        } else {
            this.setState({ style: hoverCellStyle(false, this.props.darkMode) });
        }
    }

    mouseLeave() {
        this.styleCellNonMouseEnter();
    }

    onFocus() {
        this.props.cellFocusedCallback(this.props.cellDay);
        this.setState({ focus: true });
    }

    onBlur() {
        this.setState({ focus: false });
    }

    isCellMonthSameAsPropMonth(cellDay) {
        let month = this.props.month;
        let cellDayMonth = cellDay.month();
        if (month !== cellDayMonth) {
            return true;
        }
    }

    shouldStyleCellStartEnd(cellDay, date, otherDate, startCheck, endCheck) {
        let isCellDateProp = cellDay.isSame(date, 'day');
        let isCellOtherDateProp = cellDay.isSame(otherDate, 'day');
        let isDateStart = date.isSameOrBefore(otherDate, 'second');
        let isOtherDateStart = otherDate.isSameOrBefore(date, 'second');

        if (startCheck) {
            return (isCellDateProp && isDateStart) || (isCellOtherDateProp && isOtherDateStart);
        } else if (endCheck) {
            return (isCellDateProp && !isDateStart) || (isCellOtherDateProp && !isOtherDateStart);
        }
    }

    checkAndSetMaxDateStyle(cellDate) {
        // If Past Max Date Style Cell Out of Use
        if (pastMaxDate(cellDate, this.props.maxDate, false)) {
            this.setState({ style: invalidStyle(this.props.darkMode) });
            return true;
        }
        return false;
    }

    nonSmartModePastStartAndEndChecks(cellDate) {
        // If in start mode and cellDate past end date style as unavailable. If in end mode and cellDate before start date style as unavailable
        if (this.props.mode === ModeEnum.start) {
            // We know now the date prop is the start date and the otherDate is the end date in non smart mode
            // If this cell is after end date then invalid cell as this is the start mode
            if (cellDate.isAfter(this.props.otherDate, 'day')) {
                this.setState({ style: invalidStyle(this.props.darkMode) });
                return true;
            }
        } else if (this.props.mode === ModeEnum.end) {
            // We know now the date prop is the end date and the otherDate is the start date in non smart mode
            // If this cell is before start date then invalid cell as this is the end mode
            if (cellDate.isBefore(this.props.otherDate, 'day')) {
                this.setState({ style: invalidStyle(this.props.darkMode) });
                return true;
            }
        }
        return false;
    }

    styleCellNonMouseEnter() {
        let cellDay = this.props.cellDay;
        let date = this.props.date;
        let otherDate = this.props.otherDate;

        // If Past Max Date Style Cell Out of Use
        if (this.checkAndSetMaxDateStyle(cellDay)) {
            return;
        }

        // If smart mode disabled check cell dates to ensure not past end in start mode and not before start in end mode
        if (!this.props.smartMode && this.nonSmartModePastStartAndEndChecks(cellDay)) {
            return;
        }

        // Anything cellDay month that is before or after the cell prop month style grey
        if (this.isCellMonthSameAsPropMonth(cellDay)) {
            this.setState({ style: greyCellStyle(this.props.darkMode) });
            return;
        }

        let isDateStart = date.isSameOrBefore(otherDate, 'second');
        let inbetweenDates = isInbetweenDates(isDateStart, cellDay, date, otherDate);
        let isStart = this.shouldStyleCellStartEnd(cellDay, date, otherDate, true, false);
        let isEnd = this.shouldStyleCellStartEnd(cellDay, date, otherDate, false, true);
        // If start, end or inbetween date then style according to user input or use default
        if (isStart || isEnd || inbetweenDates) {
            let style;
            if (isStart && this.props.style && this.props.style.fromDate) {
                style = Object.assign(startDateStyle(), this.props.style.fromDate);
            } else if (isStart) {
                style = startDateStyle();
            } else if (isEnd && this.props.style && this.props.style.toDate) {
                style = Object.assign(endDateStyle(), this.props.style.toDate);
            } else if (isEnd) {
                style = endDateStyle();
            } else if (inbetweenDates && this.props.style && this.props.style.betweenDates) {
                style = Object.assign(inBetweenStyle(), this.props.style.betweenDates);
            } else {
                style = inBetweenStyle();
            }
            this.setState({ style: style });
        } else if (inbetweenDates) {
            this.setState({ style: inBetweenStyle() });
        } else {
            this.setState({ style: normalCellStyle(this.props.darkMode) });
        }
    }

    isStartOrEndDate() {
        let cellDay = this.props.cellDay;
        let date = this.props.date;
        let otherDate = this.props.otherDate;
        if (
            this.shouldStyleCellStartEnd(cellDay, date, otherDate, true, false) ||
            this.shouldStyleCellStartEnd(cellDay, date, otherDate, false, true)
        ) {
            return true;
        }
        return false;
    }

    render() {
        let className = getCalendarGridCellClassName();
        let dateFormatted = this.props.cellDay.format('D');
        let tabIndex = -1;
        if (this.isStartOrEndDate() && !this.isCellMonthSameAsPropMonth(this.props.cellDay)) {
            document.addEventListener('keydown', this.keyDown, false);
            tabIndex = 0;
        } else {
            document.removeEventListener('keydown', this.keyDown, false);
        }
        let style = addFocusStyle(this.state.focus, this.state.style);
        return (
            <div
                ref={cell => {
                    this.cell = cell;
                }}
                className={className}
                tabIndex={tabIndex}
                style={style}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
                onClick={this.onClick}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                id={`row_${this.props.row}_cell_${this.props.id}_${this.props.mode}`}
            >
                {dateFormatted}
            </div>
        );
    }
}

Cell.propTypes = {
    id: PropTypes.number.isRequired,
    cellDay: momentPropTypes.momentObj.isRequired,
    date: momentPropTypes.momentObj.isRequired,
    otherDate: momentPropTypes.momentObj,
    maxDate: momentPropTypes.momentObj,
    dateSelectedNoTimeCallback: PropTypes.func.isRequired,
    keyboardCellCallback: PropTypes.func.isRequired,
    focusOnCallback: PropTypes.func.isRequired,
    focusDate: PropTypes.any.isRequired,
    month: PropTypes.number.isRequired,
    cellFocusedCallback: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    smartMode: PropTypes.bool,
    style: PropTypes.object,
    darkMode: PropTypes.bool,
};

class CalendarRow extends React.Component {
    generateCells() {
        let cells = [];
        let daysSize = this.props.rowDays.length;
        for (let i = 0; i < daysSize; i++) {
            cells.push(
                <Cell
                    key={i}
                    id={i}
                    row={this.props.row}
                    cellDay={this.props.rowDays[i]}
                    date={this.props.date}
                    otherDate={this.props.otherDate}
                    maxDate={this.props.maxDate}
                    month={this.props.month}
                    year={this.props.year}
                    dateSelectedNoTimeCallback={this.props.dateSelectedNoTimeCallback}
                    keyboardCellCallback={this.props.keyboardCellCallback}
                    focusOnCallback={this.props.focusOnCallback}
                    focusDate={this.props.focusDate}
                    cellFocusedCallback={this.props.cellFocusedCallback}
                    mode={this.props.mode}
                    smartMode={this.props.smartMode}
                    style={this.props.style}
                    darkMode={this.props.darkMode}
                />,
            );
        }
        return cells;
    }

    render() {
        let cells = this.generateCells();
        let className = getCalendarGridClassName();
        return <div className={className}>{cells}</div>;
    }
}

CalendarRow.propTypes = {
    row: PropTypes.number.isRequired,
    rowDays: PropTypes.array.isRequired,
    date: momentPropTypes.momentObj.isRequired,
    otherDate: momentPropTypes.momentObj,
    maxDate: momentPropTypes.momentObj,
    dateSelectedNoTimeCallback: PropTypes.func.isRequired,
    keyboardCellCallback: PropTypes.func.isRequired,
    focusOnCallback: PropTypes.func.isRequired,
    focusDate: PropTypes.any.isRequired,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    cellFocusedCallback: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    smartMode: PropTypes.bool,
    style: PropTypes.object,
    darkMode: PropTypes.bool,
};


class CalendarRows extends React.Component {
    generateDays() {
        let calendarRows = [];
        for (let i = 0; i < 6; i++) {
            let startIndex = i * 7;
            let endIndex = (i + 1) * 7;
            let rowDays = this.props.fourtyTwoDays.slice(startIndex, endIndex);
            calendarRows.push(
                <CalendarRow
                    key={i}
                    row={i}
                    rowDays={rowDays}
                    date={this.props.date}
                    otherDate={this.props.otherDate}
                    maxDate={this.props.maxDate}
                    month={this.props.month}
                    year={this.props.year}
                    dateSelectedNoTimeCallback={this.props.dateSelectedNoTimeCallback}
                    keyboardCellCallback={this.props.keyboardCellCallback}
                    focusOnCallback={this.props.focusOnCallback}
                    focusDate={this.props.focusDate}
                    cellFocusedCallback={this.props.cellFocusedCallback}
                    mode={this.props.mode}
                    smartMode={this.props.smartMode}
                    style={this.props.style}
                    darkMode={this.props.darkMode}
                />,
            );
        }
        return calendarRows;
    }

    render() {
        let calendarRows = this.generateDays();
        return <div>{calendarRows}</div>;
    }
}

CalendarRows.propTypes = {
    date: momentPropTypes.momentObj,
    fourtyTwoDays: PropTypes.array.isRequired,
    otherDate: momentPropTypes.momentObj,
    maxDate: momentPropTypes.momentObj,
    dateSelectedNoTimeCallback: PropTypes.func.isRequired,
    keyboardCellCallback: PropTypes.func.isRequired,
    focusOnCallback: PropTypes.func.isRequired,
    focusDate: PropTypes.any.isRequired,
    cellFocusedCallback: PropTypes.func.isRequired,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    mode: PropTypes.string.isRequired,
    smartMode: PropTypes.bool,
    style: PropTypes.object,
    darkMode: PropTypes.bool,
};

class CalendarHeader extends React.Component {
    mapHeaderToDiv(headers) {
        let className = getCalendarGridHeaderClassName();
        return headers.map(function (header, i) {
            return (
                <div key={i} className={className}>
                    {header}
                </div>
            );
        });
    }

    render() {
        let headerDivs = this.mapHeaderToDiv(this.props.headers);
        let className = getCalendarGridClassName();
        return <div className={className}>{headerDivs}</div>;
    }
}

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            month: 0,
            year: 0,
        };

        this.changeMonthCallback = this.changeMonthCallback.bind(this);
        this.changeYearCallback = this.changeYearCallback.bind(this);
        this.changeMonthArrowsCallback = this.changeMonthArrowsCallback.bind(this);
    }

    componentDidMount() {
        this.updateMonthYear();
    }

    componentDidUpdate(previousProps) {
        if (!previousProps.date.isSame(this.props.date) || !previousProps.otherDate.isSame(this.props.otherDate)) {
            this.updateMonthYear();
        }
    }

    updateMonthYear() {
        let newMonth = getMonth(
            this.props.date,
            this.props.otherDate,
            this.props.mode,
            this.props.pastSearchFriendly,
            this.props.smartMode,
        );
        let newYear = getYear(
            this.props.date,
            this.props.otherDate,
            this.props.mode,
            this.props.pastSearchFriendly,
            this.props.smartMode,
        );
        this.setState({
            month: newMonth,
            year: newYear,
        });
    }

    createMonths(local) {
        if (local && local.months) {
            return local.months;
        }
        let months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return months;
    }

    changeMonthCallback(event) {
        for (let i = 0; i < event.target.length; i++) {
            if (event.target[i].value === event.target.value) {
                this.setState({ month: i });
            }
        }
    }

    changeMonthArrowsCallback(isPreviousChange, isNextChange) {
        let years = createYears(this.props.years, this.props.descendingYears);
        let monthLocal = parseInt(this.state.month);
        let yearLocal = parseInt(this.state.year);

        let newMonthYear;
        if (isPreviousChange) {
            newMonthYear = this.getPreviousMonth(monthLocal, yearLocal, years);
        }
        if (isNextChange) {
            newMonthYear = this.getNextMonth(monthLocal, yearLocal, years);
        }

        this.setState({
            year: newMonthYear.yearLocal,
            month: newMonthYear.monthLocal,
        });
    }

    getPreviousMonth(monthLocal, yearLocal, years) {
        let isStartOfMonth = monthLocal === 0;
        let isFirstYear = parseInt(yearLocal) === years[0];

        if (!(isStartOfMonth && isFirstYear)) {
            if (monthLocal === 0) {
                monthLocal = 11;
                yearLocal -= 1;
            } else {
                monthLocal -= 1;
            }
        }
        return { monthLocal, yearLocal };
    }

    getNextMonth(monthLocal, yearLocal, years) {
        let isEndOfMonth = monthLocal === 11;
        let isLastYear = parseInt(yearLocal) === years[years.length - 1];
        if (!(isEndOfMonth && isLastYear)) {
            if (monthLocal === 11) {
                monthLocal = 0;
                yearLocal += 1;
            } else {
                monthLocal += 1;
            }
        }
        return { monthLocal, yearLocal };
    }

    changeYearCallback(event) {
        this.setState({ year: parseInt(event.target.value) });
    }

    render() {
        let months = this.createMonths(this.props.local);
        let years = createYears(this.props.years, this.props.descendingYears);
        let headers = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        let sundayFirst = false;
        if (this.props.local) {
            if (this.props.local.days) {
                headers = this.props.local.days;
            }
            if (this.props.local.sundayFirst) {
                sundayFirst = true;
                headers.unshift(headers.pop());
            }
        }

        let fourtyTwoDays = getFourtyTwoDays(this.state.month, this.state.year, sundayFirst);
        return (
            <div>
                <MonthYearSelector
                    months={months}
                    years={years}
                    month={this.state.month}
                    year={this.state.year}
                    mode={this.props.mode}
                    changeMonthCallback={this.changeMonthCallback}
                    changeYearCallback={this.changeYearCallback}
                    changeMonthArrowsCallback={this.changeMonthArrowsCallback}
                    darkMode={this.props.darkMode}
                />
                <CalendarHeader headers={headers} />
                <CalendarRows
                    fourtyTwoDays={fourtyTwoDays}
                    date={this.props.date}
                    mode={this.props.mode}
                    otherDate={this.props.otherDate}
                    maxDate={this.props.maxDate}
                    month={this.state.month}
                    year={this.state.year}
                    dateSelectedNoTimeCallback={this.props.dateSelectedNoTimeCallback}
                    keyboardCellCallback={this.props.keyboardCellCallback}
                    focusOnCallback={this.props.focusOnCallback}
                    focusDate={this.props.focusDate}
                    cellFocusedCallback={this.props.cellFocusedCallback}
                    smartMode={this.props.smartMode}
                    style={this.props.style}
                    darkMode={this.props.darkMode}
                />
            </div>
        );
    }
}

Calendar.propTypes = {
    date: momentPropTypes.momentObj,
    mode: PropTypes.string.isRequired,
    otherDate: momentPropTypes.momentObj,
    maxDate: momentPropTypes.momentObj,
    dateSelectedNoTimeCallback: PropTypes.func.isRequired,
    keyboardCellCallback: PropTypes.func.isRequired,
    focusOnCallback: PropTypes.func.isRequired,
    focusDate: PropTypes.any.isRequired,
    descendingYears: PropTypes.bool,
    years: PropTypes.array,
    pastSearchFriendly: PropTypes.bool,
    smartMode: PropTypes.bool,
    cellFocusedCallback: PropTypes.func.isRequired,
    local: PropTypes.object,
    style: PropTypes.object,
    darkMode: PropTypes.bool,
};

class RangeButton extends React.Component {
    constructor(props) {
        super(props);

        if (props.index === props.selectedRange) {
            this.state = {
                style: rangeButtonSelectedStyle(),
            };
        } else {
            this.state = {
                style: rangeButtonStyle(),
            };
        }

        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.keyDown = this.keyDown.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let focused = nextProps.focused[nextProps.index];
        // If selected index or focused set to selected style
        if (nextProps.index === nextProps.selectedRange || focused) {
            this.setRangeSelectedStyle();
        } else {
            this.setRangeButtonStyle();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let isComponentViewing = this.props.index === this.props.viewingIndex;
        let focused = this.props.focused;
        let focusedOnARange = false;
        for (let i = 0; i < focused.length; i++) {
            if (focused[i] === true) {
                focusedOnARange = true;
                break;
            }
        }
        // If the component we are currently on is the selected viewing component
        // and we are focused on it according to our focused matrix.
        // Then add an event listener for this button and set it as focused
        if (isComponentViewing && focusedOnARange) {
            document.addEventListener('keydown', this.keyDown, false);
            this.button.focus();
        }
    }

    setRangeSelectedStyle() {
        let style;
        if (this.props.style && this.props.style.customRangeSelected) {
            style = Object.assign(rangeButtonSelectedStyle(), this.props.style.customRangeSelected);
        } else {
            style = rangeButtonSelectedStyle();
        }
        this.setState({
            style: style,
        });
    }

    setRangeButtonStyle() {
        let style;
        if (this.props.style && this.props.style.customRangeButtons) {
            style = Object.assign(rangeButtonStyle(), this.props.style.customRangeButtons);
        } else {
            style = rangeButtonStyle();
        }
        this.setState({
            style: style,
        });
    }

    mouseEnter() {
        // Set hover style
        this.setRangeSelectedStyle();
    }

    mouseLeave(focused) {
        let isFocused;
        if (typeof focused === 'boolean') {
            isFocused = focused;
        } else {
            isFocused = this.state.focused;
        }
        let isSelected = this.props.index === this.props.selectedRange;
        // If not selected and not focused then on mouse leave set to normal style
        if (!isSelected && !isFocused) {
            this.setRangeButtonStyle();
        }
    }

    onFocus() {
        this.setState({ focused: true });
        this.props.setFocusedCallback(this.props.index, true);
        this.mouseEnter(true);
    }

    onBlur() {
        this.setState({ focused: false });
        this.props.setFocusedCallback(this.props.index, false);
        this.mouseLeave(false);
        document.removeEventListener('keydown', this.keyDown, false);
    }

    keyDown(e) {
        let componentFocused = document.activeElement === ReactDOM.findDOMNode(this.button);
        // Up Key
        if (e.keyCode === 38 && componentFocused) {
            e.preventDefault();
            this.props.viewingIndexChangeCallback(this.props.index - 1);
        }
        // Down Key
        else if (e.keyCode === 40 && componentFocused) {
            e.preventDefault();
            this.props.viewingIndexChangeCallback(this.props.index + 1);
        }
        // Space Bar and Enter
        else if (e.keyCode === 32 || e.keyCode === 13) {
            this.props.rangeSelectedCallback(this.props.index, this.props.label);
        }
    }

    render() {
        let isViewingIndex = this.props.viewingIndex === this.props.index;
        let tabIndex;
        if (isViewingIndex) {
            tabIndex = 0;
        } else {
            tabIndex = -1;
        }
        let style = {};
        style = addFocusStyle(this.state.focused, style);
        style = Object.assign(style, this.state.style);
        return (
            <div
                ref={button => {
                    this.button = button;
                }}
                id={"rangeButton" + this.props.index}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                tabIndex={tabIndex}
                style={style}
                onMouseDown={() => {
                    this.props.rangeSelectedCallback(this.props.index, this.props.label);
                    this.onFocus();
                }}
            >
                <div className="rangebuttontextstyle">{this.props.label}</div>
            </div>
        );
    }
}

RangeButton.propTypes = {
    selectedRange: PropTypes.number.isRequired,
    rangeSelectedCallback: PropTypes.func.isRequired,
    viewingIndexChangeCallback: PropTypes.func.isRequired,
    setFocusedCallback: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    viewingIndex: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    focused: PropTypes.array.isRequired,
    style: PropTypes.object,
};

class Ranges extends React.Component {
    constructor(props) {
        super(props);

        let focused = [];
        let ranges = Object.keys(this.props.ranges).map(
            key => this.props.ranges[key],
        );
        for (let i = 0; i < ranges.length; i++) {
            focused.push(false);
        }

        this.state = {
            viewingIndex: this.props.selectedRange,
            focused: focused,
        };

        this.viewingIndexChangeCallback = this.viewingIndexChangeCallback.bind(
            this,
        );
        this.setFocusedCallback = this.setFocusedCallback.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedRange !== nextProps.selectedRange) {
            this.setState({
                viewingIndex: nextProps.selectedRange,
            });
        }
    }

    viewingIndexChangeCallback(newIndex) {
        let length = this.state.focused.length;
        if (newIndex >= 0 && newIndex < length) {
            this.setState({
                viewingIndex: newIndex,
            });
        }
    }

    setFocusedCallback(index, focusedInput) {
        let focused = this.state.focused;
        focused[index] = focusedInput;
        this.setState({
            focused: focused,
        });
    }

    render() {
        let mobileModeActive = !this.props.noMobileMode;
        let mobileModeForce = this.props.forceMobileMode;
        let displayI = '';
        if ((this.props.screenWidthToTheRight < mobileBreakPoint && mobileModeActive) || mobileModeForce) {
            displayI = 'contents';
        }
        return (
            <div className="rangecontainer" style={{ display: displayI }}>
                {Object.keys(this.props.ranges).map((range, i) => (
                    <RangeButton
                        key={i}
                        index={i}
                        label={range}
                        value={this.props.ranges[range]}
                        selectedRange={this.props.selectedRange}
                        rangeSelectedCallback={this.props.rangeSelectedCallback}
                        viewingIndex={this.state.viewingIndex}
                        viewingIndexChangeCallback={this.viewingIndexChangeCallback}
                        focused={this.state.focused}
                        setFocusedCallback={this.setFocusedCallback}
                        style={this.props.style}
                    />
                ))}
            </div>
        );
    }
}

Ranges.propTypes = {
    ranges: PropTypes.object.isRequired,
    screenWidthToTheRight: PropTypes.number.isRequired,
    selectedRange: PropTypes.number.isRequired,
    rangeSelectedCallback: PropTypes.func.isRequired,
    style: PropTypes.object,
    noMobileMode: PropTypes.bool,
    forceMobileMode: PropTypes.bool,
};

class DatePicker extends React.Component {
    render() {
        //If button property present display buttons
        let buttons;
        if (this.props.enableButtons) {
            buttons = (
                <ApplyCancelButtons
                    changeVisibleState={this.props.changeVisibleState}
                    applyCallback={this.props.applyCallback}
                    local={this.props.local}
                    maxDate={this.props.maxDate}
                    autoApply={this.props.autoApply}
                    standalone={this.props.standalone}
                />
            );
        }
        return (
            <div className="fromDateTimeContainer">
                <div className="fromDateHourContainer">
                    <AnterosLabel caption={this.props.label} />
                    <DateField
                        date={moment(this.props.date)}
                        dateTextFieldCallback={this.props.dateTextFieldCallback}
                        onChangeDateTextHandlerCallback={
                            this.props.onChangeDateTextHandlerCallback
                        }
                        dateLabel={this.props.dateLabel}
                        mode={this.props.mode}
                        changeSelectingModeCallback={this.props.changeSelectingModeCallback}
                        darkMode={this.props.darkMode}
                    />
                    <TimeField
                        date={this.props.date}
                        timeChangeCallback={this.props.timeChangeCallback}
                        mode={this.props.mode}
                        darkMode={this.props.darkMode}
                    />
                </div>
                <Calendar
                    date={this.props.date}
                    mode={this.props.mode}
                    otherDate={this.props.otherDate}
                    maxDate={this.props.maxDate}
                    dateSelectedNoTimeCallback={this.props.dateSelectedNoTimeCallback}
                    keyboardCellCallback={this.props.keyboardCellCallback}
                    focusOnCallback={this.props.focusOnCallback}
                    focusDate={this.props.focusDate}
                    cellFocusedCallback={this.props.cellFocusedCallback}
                    local={this.props.local}
                    descendingYears={this.props.descendingYears}
                    years={this.props.years}
                    pastSearchFriendly={this.props.pastSearchFriendly}
                    smartMode={this.props.smartMode}
                    style={this.props.style}
                    darkMode={this.props.darkMode}
                />
                <ActiveNotifier
                    selectingModeFrom={this.props.selectingModeFrom}
                    mode={this.props.mode}
                    smartMode={this.props.smartMode}
                    style={this.props.style}
                    local={this.props.local}
                />
                {buttons}
            </div>
        );
    }
}

DatePicker.propTypes = {
    local: PropTypes.object,
    date: momentPropTypes.momentObj.isRequired,
    otherDate: momentPropTypes.momentObj,
    mode: PropTypes.string.isRequired,
    maxDate: momentPropTypes.momentObj,
    applyCallback: PropTypes.func.isRequired,
    dateSelectedNoTimeCallback: PropTypes.func.isRequired,
    keyboardCellCallback: PropTypes.func.isRequired,
    cellFocusedCallback: PropTypes.func.isRequired,
    focusOnCallback: PropTypes.func.isRequired,
    focusDate: PropTypes.any.isRequired,
    selectingModeFrom: PropTypes.bool.isRequired,
    changeVisibleState: PropTypes.func,
    timeChangeCallback: PropTypes.func.isRequired,
    changeSelectingModeCallback: PropTypes.func.isRequired,
    onChangeDateTextHandlerCallback: PropTypes.func.isRequired,
    dateTextFieldCallback: PropTypes.func.isRequired,
    dateLabel: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    descendingYears: PropTypes.bool,
    years: PropTypes.array,
    pastSearchFriendly: PropTypes.bool,
    smartMode: PropTypes.bool,
    enableButtons: PropTypes.bool,
    autoApply: PropTypes.bool,
    style: PropTypes.object,
    darkMode: PropTypes.bool,
    standalone: PropTypes.bool,
};

class TimeField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hourFocus: false,
            minuteFocus: false,
        };
        this.handleHourChange = this.handleHourChange.bind(this);
        this.handleMinuteChange = this.handleMinuteChange.bind(this);
        this.hourFocus = this.hourFocus.bind(this);
        this.minuteFocus = this.minuteFocus.bind(this);
        this.hourBlur = this.hourBlur.bind(this);
        this.minuteBlur = this.minuteBlur.bind(this);
    }

    generateHourSelectValues() {
        let hours = generateHours();
        let selectValues = [];
        for (let i = 0; i < hours.length; i++) {
            selectValues.push(
                <option key={i} value={i}>
                    {i}
                </option>,
            );
        }
        return selectValues;
    }

    generateMinuteSelectValues() {
        let minutes = generateMinutes();
        let selectValues = [];
        for (let i = 0; i < minutes.length; i++) {
            selectValues.push(
                <option key={i} value={i}>
                    {minutes[i]}
                </option>,
            );
        }
        return selectValues;
    }

    handleHourChange(event) {
        this.props.timeChangeCallback(
            parseInt(event.target.value),
            this.props.date.minute(),
            this.props.mode,
        );
    }

    handleMinuteChange(event) {
        this.props.timeChangeCallback(
            this.props.date.hour(),
            parseInt(event.target.value),
            this.props.mode,
        );
    }

    hourFocus() {
        this.setState({ hourFocus: true });
    }

    hourBlur() {
        this.setState({ hourFocus: false });
    }

    minuteFocus() {
        this.setState({ minuteFocus: true });
    }

    minuteBlur() {
        this.setState({ minuteFocus: false });
    }

    renderSelectField(valueInput, onChangeInput, optionsInput, id) {
        let theme = this.props.darkMode ? darkTheme : lightTheme;
        return (
            <select id={id + '_' + this.props.mode} style={theme} value={valueInput} onChange={onChangeInput}>
                {optionsInput}
            </select>
        );
    }

    render() {
        let glyphColor = this.props.darkMode ? '#FFFFFF' : '#555';
        let hours = this.generateHourSelectValues();
        let minutes = this.generateMinuteSelectValues();
        let hour = this.props.date.hour();
        let minute = this.props.date.minute();
        let hourFocusStyle = {};
        hourFocusStyle = addFocusStyle(this.state.hourFocus, hourFocusStyle);
        let minuteFocusStyle = {};
        minuteFocusStyle = addFocusStyle(this.state.minuteFocus, minuteFocusStyle);

        return (
            <div className="timeContainer">
                <div className="timeSelectContainer">
                    <div
                        className="multipleContentOnLine"
                        onFocus={this.hourFocus}
                        onBlur={this.hourBlur}
                        style={hourFocusStyle}
                    >
                        {this.renderSelectField(hour, this.handleHourChange, hours, 'Hour')}
                    </div>
                    <div className="multipleContentOnLine">:</div>
                    <div
                        className="multipleContentOnLine"
                        onFocus={this.minuteFocus}
                        onBlur={this.minuteBlur}
                        style={minuteFocusStyle}
                    >
                        {this.renderSelectField(minute, this.handleMinuteChange, minutes, 'Minutes')}
                    </div>
                </div>
                <AnterosIcon style={{ color: glyphColor }} className="timeIconStyle" icon="fas fa-clock" />
            </div>
        );
    }
}

TimeField.propTypes = {
    timeChangeCallback: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    date: momentPropTypes.momentObj,
    darkMode: PropTypes.bool,
};

class DateTimeRangePicker extends React.Component {
    constructor(props) {
        super(props);
        let ranges = {};
        let customRange = { 'Custom Range': 'Custom Range' };
        Object.assign(ranges, this.props.ranges, customRange);
        let localMomentFormat = 'DD-MM-YYYY HH:mm';

        if (this.props.local && this.props.local.format) {
            momentFormat = this.props.local.format;
            localMomentFormat = this.props.local.format;
        }

        this.state = {
            selectedRange: 0,
            selectingModeFrom: true,
            ranges: ranges,
            start: this.props.start,
            startLabel: this.props.start.format(localMomentFormat),
            end: this.props.end,
            endLabel: this.props.end.format(localMomentFormat),
            focusDate: false,
            momentFormat: localMomentFormat,
        };
        this.bindToFunctions();
    }

    bindToFunctions() {
        this.rangeSelectedCallback = this.rangeSelectedCallback.bind(this);
        this.dateSelectedNoTimeCallback = this.dateSelectedNoTimeCallback.bind(this);
        this.timeChangeCallback = this.timeChangeCallback.bind(this);
        this.dateTextFieldCallback = this.dateTextFieldCallback.bind(this);
        this.onChangeDateTextHandlerCallback = this.onChangeDateTextHandlerCallback.bind(this);
        this.changeSelectingModeCallback = this.changeSelectingModeCallback.bind(this);
        this.applyCallback = this.applyCallback.bind(this);
        this.keyboardCellCallback = this.keyboardCellCallback.bind(this);
        this.focusOnCallback = this.focusOnCallback.bind(this);
        this.cellFocusedCallback = this.cellFocusedCallback.bind(this);
    }

    componentDidMount() {
        this.setToRangeValue(this.state.start, this.state.end);
    }

    componentDidUpdate(prevProps) {
        if (!this.props.start.isSame(prevProps.start) || !this.props.end.isSame(prevProps.end)) {
            this.updateStartEndAndLabels(this.props.start, this.props.end);
        }
    }

    applyCallback() {
        this.props.applyCallback(this.state.start, this.state.end);
        this.props.changeVisibleState();
    }

    checkAutoApplyActiveApplyIfActive(startDate, endDate) {
        if (this.props.autoApply) {
            this.props.applyCallback(startDate, endDate);
        }
    }

    rangeSelectedCallback(index, value) {
        let start;
        let end;
        if (value !== 'Custom Range') {
            start = this.state.ranges[value][0];
            end = this.state.ranges[value][1];
            if (pastMaxDate(start, this.props.maxDate, true) || pastMaxDate(end, this.props.maxDate, true)) {
                return false;
            }
        }
        this.setState({ selectedRange: index });
        if (value !== 'Custom Range') {
            this.updateStartEndAndLabels(start, end);
        }
        if (this.props.rangeCallback) {
            this.props.rangeCallback(index, value);
        }

        if (value !== 'Custom Range') {
            this.checkAutoApplyActiveApplyIfActive(start, end);
        }
    }

    setToRangeValue(startDate, endDate) {
        let rangesArray = Object.keys(this.state.ranges).map(key => this.state.ranges[key]);
        for (let i = 0; i < rangesArray.length; i++) {
            if (rangesArray[i] === 'Custom Range') {
                continue;
            } else if (rangesArray[i][0].isSame(startDate, 'minutes') && rangesArray[i][1].isSame(endDate, 'minutes')) {
                this.setState({ selectedRange: i });
                return;
            }
        }
        this.setToCustomRange();
    }

    setToCustomRange() {
        let rangesArray = Object.keys(this.state.ranges).map(key => this.state.ranges[key]);
        for (let i = 0; i < rangesArray.length; i++) {
            if (rangesArray[i] === 'Custom Range') {
                this.setState({ selectedRange: i });
            }
        }
    }

    updateStartEndAndLabels(newStart, newEnd) {
        this.setState({
            start: newStart,
            startLabel: newStart.format(this.state.momentFormat),
            end: newEnd,
            endLabel: newEnd.format(this.state.momentFormat),
        });
    }

    dateSelectedNoTimeCallback(cellDate, cellMode) {
        let isSelectingModeFrom;
        if (this.props.smartMode) {
            isSelectingModeFrom = this.state.selectingModeFrom;
        } else if (cellMode === ModeEnum.start) {
            isSelectingModeFrom = true;
        } else {
            isSelectingModeFrom = false;
        }

        let newDates = datePicked(this.state.start, this.state.end, cellDate, isSelectingModeFrom, this.props.smartMode);
        let startDate = newDates.startDate;
        let endDate = newDates.endDate;
        let newStart = this.duplicateMomentTimeFromState(startDate, true);
        let newEnd = this.duplicateMomentTimeFromState(endDate, false);
        this.updateStartEndAndLabels(newStart, newEnd);
        this.setToRangeValue(newStart, newEnd);
        if (this.props.smartMode) {
            this.setState(prevState => ({
                selectingModeFrom: !prevState.selectingModeFrom,
            }));
        }
        this.checkAutoApplyActiveApplyIfActive(newStart, newEnd);
    }

    changeSelectingModeCallback(selectingModeFromParam) {
        if (this.props.smartMode) {
            this.setState({ selectingModeFrom: selectingModeFromParam });
        }
    }

    duplicateMomentTimeFromState(date, startDate) {
        let state;
        if (startDate) {
            state = this.state.start;
        } else {
            state = this.state.end;
        }
        let newDate = [date.year(), date.month(), date.date(), state.hours(), state.minutes(), state.seconds()];
        return moment(newDate);
    }

    timeChangeCallback(newHour, newMinute, mode) {
        if (mode === 'start') {
            this.updateStartTime(newHour, newMinute, mode);
        } else if (mode === 'end') {
            this.updateEndTime(newHour, newMinute, mode);
        }
    }

    updateStartTime(newHour, newMinute, mode) {
        this.updateTime(this.state.start, newHour, newMinute, mode, 'start', 'startLabel');
    }

    updateEndTime(newHour, newMinute, mode) {
        this.updateTime(this.state.end, newHour, newMinute, mode, 'end', 'endLabel');
    }

    updateTime(origDate, newHour, newMinute, mode, stateDateToChangeName, stateLabelToChangeName) {
        let date = moment(origDate);
        date.hours(newHour);
        date.minutes(newMinute);
        if (pastMaxDate(date, this.props.maxDate, true)) {
            return false;
        }
        if (isValidTimeChange(mode, date, this.state.start, this.state.end)) {
            this.setState({
                [stateDateToChangeName]: date,
                [stateLabelToChangeName]: date.format(this.state.momentFormat),
            });
            this.updateTimeCustomRangeUpdator(stateDateToChangeName, date);
            if (stateDateToChangeName === 'end') {
                this.checkAutoApplyActiveApplyIfActive(this.state.start, date);
            } else {
                this.checkAutoApplyActiveApplyIfActive(date, this.state.end);
            }
        } else if (this.props.smartMode) {
            let newDate = moment(date);
            if (mode === 'start') {
                newDate.add(1, 'minute');
                this.updateStartEndAndLabels(date, newDate);
                this.setToRangeValue(date, newDate);
                this.checkAutoApplyActiveApplyIfActive(date, newDate);
            } else {
                newDate.subtract(1, 'minute');
                this.updateStartEndAndLabels(newDate, date);
                this.setToRangeValue(newDate, date);
                this.checkAutoApplyActiveApplyIfActive(newDate, date);
            }
        } else {
            this.updateStartEndAndLabels(this.state.start, this.state.end);
            this.setToRangeValue(this.state.start, this.state.end);
            this.checkAutoApplyActiveApplyIfActive(this.state.start, this.state.end);
        }
    }

    updateTimeCustomRangeUpdator(stateDateToChangeName, date) {
        if (stateDateToChangeName === 'start') {
            this.setToRangeValue(date, this.state.end);
        } else {
            this.setToRangeValue(this.state.start, date);
        }
    }

    dateTextFieldCallback(mode) {
        if (mode === 'start') {
            let newDate = moment(this.state.startLabel, this.state.momentFormat);
            let isValidNewDate = newDate.isValid();
            let isSameOrBeforeEnd = newDate.isSameOrBefore(this.state.end, 'second');
            let isAfterEndDate = newDate.isAfter(this.state.end);
            this.updateDate(mode, newDate, isValidNewDate, isSameOrBeforeEnd, isAfterEndDate, 'start', 'startLabel');
        } else {
            let newDate = moment(this.state.endLabel, this.state.momentFormat);
            let isValidNewDate = newDate.isValid();
            let isBeforeStartDate = newDate.isBefore(this.state.start);
            let isSameOrAfterStartDate = newDate.isSameOrAfter(this.state.start, 'second');
            this.updateDate(mode, newDate, isValidNewDate, isSameOrAfterStartDate, isBeforeStartDate, 'end', 'endLabel');
        }
    }

    updateDate(
        mode,
        newDate,
        isValidNewDate,
        isValidDateChange,
        isInvalidDateChange,
        stateDateToChangeName,
        stateLabelToChangeName,
    ) {
        if (pastMaxDate(newDate, this.props.maxDate, true)) {
            this.updateStartEndAndLabels(this.state.start, this.state.end);
            return false;
        }
        if (isValidNewDate && isValidDateChange) {
            this.setState({
                [stateDateToChangeName]: newDate,
                [stateLabelToChangeName]: newDate.format(this.state.momentFormat),
            });
            this.updateTimeCustomRangeUpdator(stateDateToChangeName, newDate);
            if (stateDateToChangeName === 'end') {
                this.checkAutoApplyActiveApplyIfActive(this.state.start, newDate);
            } else {
                this.checkAutoApplyActiveApplyIfActive(newDate, this.state.end);
            }
        }
        else if (isValidNewDate && isInvalidDateChange && this.props.smartMode) {
            this.updateInvalidDate(mode, newDate);
        } else {
            this.updateStartEndAndLabels(this.state.start, this.state.end);
        }
    }

    updateInvalidDate(mode, newDate) {
        if (mode === 'start') {
            let newEndDate = moment(newDate).add(1, 'day');
            this.updateLabelsAndRangeValues(newDate, newEndDate);
            this.checkAutoApplyActiveApplyIfActive(newDate, newEndDate);
        } else {
            let newStartDate = moment(newDate).subtract(1, 'day');
            this.updateStartEndAndLabels(newStartDate, newDate);
            this.checkAutoApplyActiveApplyIfActive(newStartDate, newDate);
        }
    }

    updateLabelsAndRangeValues(startDate, endDate) {
        this.updateStartEndAndLabels(startDate, endDate);
        this.setToRangeValue(startDate, endDate);
    }

    onChangeDateTextHandlerCallback(newValue, mode) {
        if (mode === 'start') {
            this.setState({
                startLabel: newValue,
            });
        } else if (mode === 'end') {
            this.setState({
                endLabel: newValue,
            });
        }
    }

    keyboardCellCallback(originalDate, newDate) {
        let startDate;
        let endDate;
        if (
            originalDate.isSame(this.state.start, 'day') &&
            originalDate.isSame(this.state.end, 'day') &&
            !this.props.smartMode
        ) {
            let activeElement = document.activeElement.id;
            if (activeElement && activeElement.includes('_cell_') && activeElement.includes('_end')) {
                startDate = moment(this.state.start);
                endDate = this.duplicateMomentTimeFromState(newDate, false);
                if (!startDate.isSameOrBefore(endDate, 'second')) {
                    startDate = this.duplicateMomentTimeFromState(newDate, true);
                    endDate = moment(this.state.end);
                }
            } else if (activeElement && activeElement.includes('_cell_') && activeElement.includes('_start')) {
                startDate = this.duplicateMomentTimeFromState(newDate, true);
                endDate = moment(this.state.end);
            }
        }

        if (!startDate && !endDate) {
            if (originalDate.isSame(this.state.start, 'day')) {
                startDate = this.duplicateMomentTimeFromState(newDate, true);
                endDate = moment(this.state.end);
                if (!this.props.smartMode && startDate.isAfter(endDate, 'second')) {
                    return false;
                }
            }
            else {
                startDate = moment(this.state.start);
                endDate = this.duplicateMomentTimeFromState(newDate, false);
                if (!this.props.smartMode && startDate.isAfter(endDate, 'second')) {
                    return false;
                }
            }
        }

        if (startDate.isSameOrBefore(endDate, 'second')) {
            this.updateStartEndAndLabels(startDate, endDate);
            this.checkAutoApplyActiveApplyIfActive(startDate, endDate);
        } else {
            this.updateStartEndAndLabels(endDate, startDate);
            this.checkAutoApplyActiveApplyIfActive(endDate, startDate);
        }

        return true;
    }

    focusOnCallback(date) {
        if (date) {
            this.setState({
                focusDate: date,
            });
        } else {
            this.setState({
                focusDate: false,
            });
        }
    }

    cellFocusedCallback(date) {
        if (date.isSame(this.state.start, 'day')) {
            this.changeSelectingModeCallback(true);
        } else if (date.isSame(this.state.end, 'day')) {
            this.changeSelectingModeCallback(false);
        }
    }

    renderStartDate(local) {
        let label = (local && local.fromDate) ? local.fromDate : "From Date";
        return (
            <DatePicker
                label={label}
                date={this.state.start}
                otherDate={this.state.end}
                mode={ModeEnum.start}
                dateSelectedNoTimeCallback={this.dateSelectedNoTimeCallback}
                timeChangeCallback={this.timeChangeCallback}
                dateTextFieldCallback={this.dateTextFieldCallback}
                keyboardCellCallback={this.keyboardCellCallback}
                focusOnCallback={this.focusOnCallback}
                focusDate={this.state.focusDate}
                cellFocusedCallback={this.cellFocusedCallback}
                onChangeDateTextHandlerCallback={this.onChangeDateTextHandlerCallback}
                dateLabel={this.state.startLabel}
                selectingModeFrom={this.state.selectingModeFrom}
                changeSelectingModeCallback={this.changeSelectingModeCallback}
                applyCallback={this.applyCallback}
                maxDate={this.props.maxDate}
                local={this.props.local}
                descendingYears={this.props.descendingYears}
                years={this.props.years}
                pastSearchFriendly={this.props.pastSearchFriendly}
                smartMode={this.props.smartMode}
                style={this.props.style}
                darkMode={this.props.darkMode}
                standalone={this.props.standalone}
            />
        );
    }

    renderEndDate(local) {
        let label = (local && local.toDate) ? local.toDate : "To Date";
        return (
            <DatePicker
                label={label}
                date={this.state.end}
                otherDate={this.state.start}
                mode={ModeEnum.end}
                dateSelectedNoTimeCallback={this.dateSelectedNoTimeCallback}
                timeChangeCallback={this.timeChangeCallback}
                dateTextFieldCallback={this.dateTextFieldCallback}
                keyboardCellCallback={this.keyboardCellCallback}
                focusOnCallback={this.focusOnCallback}
                focusDate={this.state.focusDate}
                cellFocusedCallback={this.cellFocusedCallback}
                onChangeDateTextHandlerCallback={this.onChangeDateTextHandlerCallback}
                dateLabel={this.state.endLabel}
                changeVisibleState={this.props.changeVisibleState}
                selectingModeFrom={this.state.selectingModeFrom}
                changeSelectingModeCallback={this.changeSelectingModeCallback}
                applyCallback={this.applyCallback}
                maxDate={this.props.maxDate}
                local={this.props.local}
                descendingYears={this.props.descendingYears}
                years={this.props.years}
                pastSearchFriendly={this.props.pastSearchFriendly}
                smartMode={this.props.smartMode}
                enableButtons
                autoApply={this.props.autoApply}
                style={this.props.style}
                darkMode={this.props.darkMode}
                standalone={this.props.standalone}
            />
        );
    }

    render() {
        return (
            <Fragment>
                <Ranges
                    ranges={this.state.ranges}
                    selectedRange={this.state.selectedRange}
                    rangeSelectedCallback={this.rangeSelectedCallback}
                    screenWidthToTheRight={this.props.screenWidthToTheRight}
                    style={this.props.style}
                    noMobileMode={this.props.noMobileMode}
                    forceMobileMode={this.props.forceMobileMode}
                />
                {this.renderStartDate(this.props.local)}
                {this.renderEndDate(this.props.local)}
            </Fragment>
        );
    }
}

DateTimeRangePicker.propTypes = {
    ranges: PropTypes.object.isRequired,
    start: momentPropTypes.momentObj.isRequired,
    end: momentPropTypes.momentObj.isRequired,
    local: PropTypes.object.isRequired,
    applyCallback: PropTypes.func.isRequired,
    rangeCallback: PropTypes.func,
    autoApply: PropTypes.bool,
    maxDate: momentPropTypes.momentObj,
    descendingYears: PropTypes.bool,
    years: PropTypes.array,
    pastSearchFriendly: PropTypes.bool,
    smartMode: PropTypes.bool,
    changeVisibleState: PropTypes.func.isRequired,
    screenWidthToTheRight: PropTypes.number.isRequired,
    style: PropTypes.object,
    darkMode: PropTypes.bool,
    noMobileMode: PropTypes.bool,
    forceMobileMode: PropTypes.bool,
    standalone: PropTypes.bool,
};


class AnterosDatetimeRangeSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            x: 0,
            y: 0,
            screenWidthToTheRight: 0,
            containerClassName: '',
        };
        let propValidationReturn = propValidation(this.props);
        if (propValidationReturn !== true) {
            alert(propValidationReturn);
        }
        this.resize = this.resize.bind(this);
        this.onClickContainerHandler = this.onClickContainerHandler.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.changeVisibleState = this.changeVisibleState.bind(this);
        this.keyDown = this.keyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize);
        document.addEventListener('keydown', this.keyDown, false);
        this.resize();
    }

    componentWillMount() {
        window.removeEventListener('resize', this.resize);
        document.removeEventListener('keydown', this.keyDown, false);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.leftMode != this.props.leftMode) {
            this.resize();
        }
    }

    resize() {
        const domNode = findDOMNode(this).children[0];
        const mobileModeActive = !this.props.noMobileMode;
        const mobileModeForce = this.props.forceMobileMode;
        let boundingClientRect = domNode.getBoundingClientRect();
        let widthRightOfThis = window.innerWidth - boundingClientRect.x;
        if ((widthRightOfThis < mobileBreakPoint && mobileModeActive) || mobileModeForce) {
            let childMiddle = boundingClientRect.width / 2;
            let containerMiddle = 144;
            let newY = childMiddle - containerMiddle;
            this.setState({
                x: boundingClientRect.height + 5,
                y: newY,
                screenWidthToTheRight: widthRightOfThis,
                containerClassName: 'daterangepicker',
            });
        } else if (this.props.leftMode) {
            this.setState({
                x: boundingClientRect.height + 5,
                y: -660,
                screenWidthToTheRight: widthRightOfThis,
                containerClassName: 'daterangepicker daterangepickerleft',
            });
        } else {
            this.setState({
                x: boundingClientRect.height + 5,
                y: 0,
                screenWidthToTheRight: widthRightOfThis,
                containerClassName: 'daterangepicker',
            });
        }
    }

    keyDown(e) {
        if (e.keyCode === 27) {
            this.setState({ visible: false });
            document.removeEventListener('keydown', this.keyDown, false);
        }
    }

    onClickContainerHandler(event) {
        if (!this.state.visible) {
            document.addEventListener('click', this.handleOutsideClick, false);
            document.addEventListener('keydown', this.keyDown, false);
            this.changeVisibleState();
        }
    }

    handleOutsideClick(e) {
        if (this.state.visible) {
            if (this.container.contains(e.target)) {
                return;
            }
            document.removeEventListener('click', this.handleOutsideClick, false);
            this.changeVisibleState();
        }
    }

    changeVisibleState() {
        this.setState(prevState => ({
            visible: !prevState.visible,
        }));
    }

    shouldShowPicker() {
        let mobileModeActive = !this.props.noMobileMode;
        let mobileModeForce = this.props.forceMobileMode;
        if (
            this.state.visible &&
            ((this.state.screenWidthToTheRight < mobileBreakPoint && mobileModeActive) || mobileModeForce)
        ) {
            return 'block';
        } else if (this.state.visible) {
            return 'flex';
        } else {
            return 'none';
        }
    }

    renderPicker() {
        return (
            <DateTimeRangePicker
                ranges={this.props.ranges}
                start={this.props.start}
                end={this.props.end}
                local={this.props.local}
                applyCallback={this.props.applyCallback}
                rangeCallback={this.props.rangeCallback}
                autoApply={this.props.autoApply}
                changeVisibleState={this.changeVisibleState}
                screenWidthToTheRight={this.state.screenWidthToTheRight}
                maxDate={this.props.maxDate}
                descendingYears={this.props.descendingYears}
                years={this.props.years}
                pastSearchFriendly={this.props.pastSearchFriendly}
                smartMode={this.props.smartMode}
                style={this.props.style}
                darkMode={this.props.darkMode}
                noMobileMode={this.props.noMobileMode}
                forceMobileMode={this.props.forceMobileMode}
                standalone={this.props.standalone}
            />
        );
    }

    render() {
        let showPicker = this.shouldShowPicker();
        let x = this.state.x;
        let y = this.state.y;
        let theme = this.props.darkMode ? darkTheme : lightTheme;

        if (this.props.standalone && this.props.style && this.props.style.standaloneLayout) {
            return <div style={this.props.style.standaloneLayout}>{this.renderPicker()}</div>;
        }

        return (
            <div
                id="DateRangePickerContainer"
                className="daterangepickercontainer"
                onClick={this.onClickContainerHandler}
                ref={container => {
                    this.container = container;
                }}
            >
                {this.props.children && <div id="DateRangePickerChildren">{this.props.children}</div>}
                <div>
                    <div
                        id="daterangepicker"
                        className={this.state.containerClassName}
                        style={{ top: x, left: y, display: showPicker, ...theme }}
                    >
                        {this.renderPicker()}
                    </div>
                </div>
            </div>
        );
    }
}

AnterosDatetimeRangeSelect.propTypes = {
    ranges: PropTypes.object.isRequired,
    start: momentPropTypes.momentObj,
    end: momentPropTypes.momentObj,
    local: PropTypes.object.isRequired,
    applyCallback: PropTypes.func.isRequired,
    rangeCallback: PropTypes.func,
    autoApply: PropTypes.bool,
    maxDate: momentPropTypes.momentObj,
    descendingYears: PropTypes.bool,
    pastSearchFriendly: PropTypes.bool,
    years: PropTypes.array,
    smartMode: PropTypes.bool,
    darkMode: PropTypes.bool,
    noMobileMode: PropTypes.bool,
    forceMobileMode: PropTypes.bool,
    style: PropTypes.object,
    children: PropTypes.any,
    leftMode: PropTypes.bool,
    standalone: PropTypes.bool,
};


export { AnterosDatetimeRangeSelect };