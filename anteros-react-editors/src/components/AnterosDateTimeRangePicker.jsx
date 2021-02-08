import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import { AnterosCalendar, AnterosClock } from '@anterostecnologia/anteros-react-calendar';
import Fit from 'react-fit';
import { DateTimeInput } from './AnterosDatetimePicker';
import {  columnProps } from "@anterostecnologia/anteros-react-layout";
import { AnterosUtils } from '@anterostecnologia/anteros-react-core';
/**
 * Calls a function, if it's defined, with specified arguments
 * @param {Function} fn
 * @param {Object} args
 */
export function callIfDefined(fn, ...args) {
    if (fn && typeof fn === 'function') {
        fn(...args);
    }
}

export const isMinDate = (props, propName, componentName) => {
    const { [propName]: minDate } = props;

    if (!minDate) {
        return null;
    }

    if (!(minDate instanceof Date)) {
        return new Error(`Invalid prop \`${propName}\` of type \`${typeof minDate}\` supplied to \`${componentName}\`, expected instance of \`Date\`.`);
    }

    const { maxDate } = props;

    if (maxDate && minDate > maxDate) {
        return new Error(`Invalid prop \`${propName}\` of type \`${typeof minDate}\` supplied to \`${componentName}\`, minDate cannot be larger than maxDate.`);
    }

    return null;
};

export const isMaxDate = (props, propName, componentName) => {
    const { [propName]: maxDate } = props;

    if (!maxDate) {
        return null;
    }

    if (!(maxDate instanceof Date)) {
        return new Error(`Invalid prop \`${propName}\` of type \`${typeof maxDate}\` supplied to \`${componentName}\`, expected instance of \`Date\`.`);
    }

    const { minDate } = props;

    if (minDate && maxDate < minDate) {
        return new Error(`Invalid prop \`${propName}\` of type \`${typeof maxDate}\` supplied to \`${componentName}\`, maxDate cannot be smaller than minDate.`);
    }

    return null;
};

const allViews = ['hour', 'minute', 'second'];
const baseClassName = 'react-datetimerange-picker';
const outsideActionEvents = ['mousedown', 'focusin', 'touchstart'];

export default class AnterosDatetimeRangePicker extends PureComponent {
    static getDerivedStateFromProps(nextProps, prevState) {
        const nextState = {};

        if (nextProps.isCalendarOpen !== prevState.isCalendarOpenProps) {
            nextState.isCalendarOpen = nextProps.isCalendarOpen;
            nextState.isCalendarOpenProps = nextProps.isCalendarOpen;
        }

        if (nextProps.isClockOpen !== prevState.isClockOpenProps) {
            nextState.isClockOpen = nextProps.isClockOpen;
            nextState.isClockOpenProps = nextProps.isClockOpen;
        }

        return nextState;
    }

    state = {};

    componentDidMount() {
        this.handleOutsideActionListeners();
    }

    componentDidUpdate(prevProps, prevState) {
        const { isCalendarOpen, isClockOpen } = this.state;
        const {
            onCalendarClose,
            onCalendarOpen,
            onClockClose,
            onClockOpen,
        } = this.props;

        const isWidgetOpen = isCalendarOpen || isClockOpen;
        const prevIsWidgetOpen = prevState.isCalendarOpen || prevState.isClockOpen;

        if (isWidgetOpen !== prevIsWidgetOpen) {
            this.handleOutsideActionListeners();
        }

        if (isCalendarOpen !== prevState.isCalendarOpen) {
            callIfDefined(isCalendarOpen ? onCalendarOpen : onCalendarClose);
        }

        if (isClockOpen !== prevState.isClockOpen) {
            callIfDefined(isClockOpen ? onClockOpen : onClockClose);
        }
    }

    componentWillUnmount() {
        this.handleOutsideActionListeners(false);
    }

    get eventProps() {
        return makeEventProps(this.props);
    }

    onOutsideAction = (event) => {
        if (this.wrapper && !this.wrapper.contains(event.target)) {
            this.closeWidgets();
        }
    }

    onDateChange = ([valueFrom, valueTo], closeWidgets = true) => {
        const { value } = this.props;
        const [prevValueFrom, prevValueTo] = [].concat(value);

        const nextValueFrom = (() => {
            if (!prevValueFrom) {
                return valueFrom;
            }

            const valueWithHour = new Date(valueFrom);
            valueWithHour.setHours(
                prevValueFrom.getHours(),
                prevValueFrom.getMinutes(),
                prevValueFrom.getSeconds(),
                prevValueFrom.getMilliseconds(),
            );

            return valueWithHour;
        })();

        const nextValueTo = (() => {
            if (!prevValueTo) {
                return valueTo;
            }

            const valueWithHour = new Date(valueTo);
            valueWithHour.setHours(
                prevValueTo.getHours(),
                prevValueTo.getMinutes(),
                prevValueTo.getSeconds(),
                prevValueTo.getMilliseconds(),
            );

            return valueWithHour;
        })();

        this.onChange([nextValueFrom, nextValueTo], closeWidgets);
    }

    // eslint-disable-next-line react/destructuring-assignment
    onChange = (value, closeWidgets = this.props.closeWidgets) => {
        const { onChange } = this.props;

        if (closeWidgets) {
            this.closeWidgets();
        }

        if (onChange) {
            onChange(value);
        }
    }

    onChangeFrom = (valueFrom, closeWidgets) => {
        const { value } = this.props;
        const [, valueTo] = [].concat(value);
        this.onChange([valueFrom, valueTo], closeWidgets);
    }

    onChangeTo = (valueTo, closeWidgets) => {
        const { value } = this.props;
        const [valueFrom] = [].concat(value);
        this.onChange([valueFrom, valueTo], closeWidgets);
    }

    onFocus = (event) => {
        const { disabled, onFocus } = this.props;

        if (onFocus) {
            onFocus(event);
        }

        // Internet Explorer still fires onFocus on disabled elements
        if (disabled) {
            return;
        }

        switch (event.target.name) {
            case 'day':
            case 'month':
            case 'year':
                this.openCalendar();
                break;
            case 'hour12':
            case 'hour24':
            case 'minute':
            case 'second':
                this.openClock();
                break;
            default:
        }
    }

    openClock = () => {
        this.setState({
            isCalendarOpen: false,
            isClockOpen: true,
        });
    }

    openCalendar = () => {
        this.setState({
            isCalendarOpen: true,
            isClockOpen: false,
        });
    }

    toggleCalendar = () => {
        this.setState(prevState => ({
            isCalendarOpen: !prevState.isCalendarOpen,
            isClockOpen: false,
        }));
    }

    closeWidgets = () => {
        this.setState((prevState) => {
            if (!prevState.isCalendarOpen && !prevState.isClockOpen) {
                return null;
            }

            return {
                isCalendarOpen: false,
                isClockOpen: false,
            };
        });
    }

    stopPropagation = event => event.stopPropagation();

    clear = () => this.onChange(null);

    handleOutsideActionListeners(shouldListen) {
        const { isCalendarOpen, isClockOpen } = this.state;
        const isWidgetOpen = isCalendarOpen || isClockOpen;

        const shouldListenWithFallback = typeof shouldListen !== 'undefined' ? shouldListen : isWidgetOpen;
        const fnName = shouldListenWithFallback ? 'addEventListener' : 'removeEventListener';
        outsideActionEvents.forEach(eventName => document[fnName](eventName, this.onOutsideAction));
    }

    renderInputs() {
        const {
            amPmAriaLabel,
            autoFocus,
            calendarAriaLabel,
            calendarIcon,
            clearAriaLabel,
            clearIcon,
            dayAriaLabel,
            dayPlaceholder,
            disableCalendar,
            disabled,
            format,
            hourAriaLabel,
            hourPlaceholder,
            locale,
            maxDate,
            maxDetail,
            minDate,
            minuteAriaLabel,
            minutePlaceholder,
            monthAriaLabel,
            monthPlaceholder,
            name,
            nativeInputAriaLabel,
            rangeDivider,
            required,
            secondAriaLabel,
            secondPlaceholder,
            showLeadingZeros,
            value,
            yearAriaLabel,
            yearPlaceholder,
        } = this.props;

        const { isCalendarOpen, isClockOpen } = this.state;

        const [valueFrom, valueTo] = [].concat(value);

        const ariaLabelProps = {
            amPmAriaLabel,
            dayAriaLabel,
            hourAriaLabel,
            minuteAriaLabel,
            monthAriaLabel,
            nativeInputAriaLabel,
            secondAriaLabel,
            yearAriaLabel,
        };

        const placeholderProps = {
            dayPlaceholder,
            hourPlaceholder,
            minutePlaceholder,
            monthPlaceholder,
            secondPlaceholder,
            yearPlaceholder,
        };

        const commonProps = {
            ...ariaLabelProps,
            ...placeholderProps,
            className: `${baseClassName}__inputGroup`,
            disabled,
            format,
            isWidgetOpen: isCalendarOpen || isClockOpen,
            locale,
            maxDate,
            maxDetail,
            minDate,
            required,
            showLeadingZeros,
        };

        let icon = "fa fa-calendar";
        if (this.props.icon) {
            icon = this.props.icon;
        }

        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() === 'dsBrowse');
        }
        let classNameAddOn = AnterosUtils.buildClassNames("input-group-addon",
            (this.props.primary || this.props.fullPrimary ? "btn btn-primary" : ""),
            (this.props.success || this.props.fullSucces ? "btn btn-success" : ""),
            (this.props.info || this.props.fullInfo ? "btn btn-info" : ""),
            (this.props.danger || this.props.fullDanger ? "btn btn-danger" : ""),
            (this.props.warning || this.props.fullWarning ? "btn btn-warning" : ""),
            (this.props.secondary || this.props.fullSecondary ? "btn btn-secondary" : ""),
            (this.props.default || this.props.fullDefault ? "" : ""));

        let classNameInput = AnterosUtils.buildClassNames("form-control",
            (this.props.fullPrimary ? "btn-primary" : ""),
            (this.props.fullSucces ? "btn-success" : ""),
            (this.props.fullInfo ? "btn-info" : ""),
            (this.props.fullDanger ? "btn-danger" : ""),
            (this.props.fullWarning ? "btn-warning" : ""),
            (this.props.fullSecondary ? "btn-secondary" : ""),
            (this.props.fullDefault ? "" : ""));

        return (
            <div className={`${baseClassName}__wrapper`}>
                <DateTimeInput
                    {...commonProps}
                    autoFocus={autoFocus}
                    className={`${baseClassName}__inputGroup`}
                    classNameInput={classNameInput}
                    name={`${name}_from`}
                    onChange={this.onChangeFrom}
                    returnValue="start"
                    value={valueFrom}
                />
                <div style={{
                    paddingRight: '20px',
                    width: '80px',
                    color: '#a12f2f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span className={`far fa-arrow-right`}>
                    </span>
                </div>
                <DateTimeInput
                    {...commonProps}
                    className={`${baseClassName}__inputGroup`}
                    classNameInput={classNameInput}
                    name={`${name}_to`}
                    onChange={this.onChangeTo}
                    returnValue="end"
                    value={valueTo}
                />
                {clearIcon !== null && (
                    <button
                        aria-label={clearAriaLabel}
                        className={`${baseClassName}__clear-button ${baseClassName}__button`}
                        disabled={disabled}
                        onClick={this.clear}
                        onFocus={this.stopPropagation}
                        type="button"
                    >
                        {clearIcon}
                    </button>
                )}
                {calendarIcon !== null && !disableCalendar && (
                    <div className={classNameAddOn} onBlur={this.resetValue}
                        onClick={this.toggleCalendar}
                        disabled={disabled}
                        onFocus={this.stopPropagation}
                        style={{ margin: 0, height: '38px', width: '38px' }}>
                        <span><i className={icon} /><img alt="" src={this.props.image} /></span></div>
                )}
            </div>
        );
    }

    renderCalendar() {
        const { disableCalendar } = this.props;
        const { isCalendarOpen } = this.state;

        if (isCalendarOpen === null || disableCalendar) {
            return null;
        }

        const {
            calendarClassName,
            className: dateTimeRangePickerClassName, // Unused, here to exclude it from calendarProps
            maxDetail: dateTimeRangePickerMaxDetail, // Unused, here to exclude it from calendarProps
            onChange,
            value,
            ...calendarProps
        } = this.props;

        const className = `${baseClassName}__calendar`;

        return (
            <Fit>
                <div className={mergeClassNames(className, `${className}--${isCalendarOpen ? 'open' : 'closed'}`)}>
                    <AnterosCalendar
                        className={calendarClassName}
                        onChange={this.onDateChange}
                        selectRange
                        value={value || null}
                        {...calendarProps}
                    />
                </div>
            </Fit>
        );
    }

    renderClock() {
        const { disableClock } = this.props;
        const { isClockOpen } = this.state;

        if (isClockOpen === null || disableClock) {
            return null;
        }

        const {
            clockClassName,
            className: dateTimeRangePickerClassName, // Unused, here to exclude it from clockProps
            maxDetail,
            onChange,
            value,
            ...clockProps
        } = this.props;

        const className = `${baseClassName}__clock`;
        const [valueFrom] = [].concat(value);

        const maxDetailIndex = allViews.indexOf(maxDetail);

        return (
            <Fit>
                <div className={mergeClassNames(className, `${className}--${isClockOpen ? 'open' : 'closed'}`)}>
                    <AnterosClock
                        className={clockClassName}
                        renderMinuteHand={maxDetailIndex > 0}
                        renderSecondHand={maxDetailIndex > 1}
                        value={valueFrom}
                        {...clockProps}
                    />
                </div>
            </Fit>
        );
    }

    render() {
        const { className, disabled } = this.props;
        const { isCalendarOpen, isClockOpen } = this.state;

        return (
            <div
                className={mergeClassNames(
                    baseClassName,
                    `${baseClassName}--${isCalendarOpen || isClockOpen ? 'open' : 'closed'}`,
                    `${baseClassName}--${disabled ? 'disabled' : 'enabled'}`,
                    className,
                )}
                {...this.eventProps}
                onFocus={this.onFocus}
                ref={(ref) => {
                    if (!ref) {
                        return;
                    }

                    this.wrapper = ref;
                }}
            >
                {this.renderInputs()}
                {this.renderCalendar()}
                {this.renderClock()}
            </div>
        );
    }
}

const iconProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 19,
    height: 19,
    viewBox: '0 0 19 19',
    stroke: 'black',
    strokeWidth: 2,
};

const CalendarIcon = (
    <svg
        {...iconProps}
        className={`${baseClassName}__calendar-button__icon ${baseClassName}__button__icon`}
    >
        <rect fill="none" height="15" width="15" x="2" y="2" />
        <line x1="6" x2="6" y1="0" y2="4" />
        <line x1="13" x2="13" y1="0" y2="4" />
    </svg>
);

const ClearIcon = (
    <svg
        {...iconProps}
        className={`${baseClassName}__clear-button__icon ${baseClassName}__button__icon`}
    >
        <line x1="4" x2="15" y1="4" y2="15" />
        <line x1="15" x2="4" y1="4" y2="15" />
    </svg>
);

AnterosDatetimeRangePicker.defaultProps = {
    calendarIcon: CalendarIcon,
    clearIcon: ClearIcon,
    closeWidgets: true,
    isCalendarOpen: null,
    isClockOpen: null,
    maxDetail: 'minute',
    name: 'datetimerange',
    rangeDivider: ' ',
    primary: true
};

const isValue = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
]);

AnterosDatetimeRangePicker.propTypes = {
    amPmAriaLabel: PropTypes.string,
    autoFocus: PropTypes.bool,
    calendarAriaLabel: PropTypes.string,
    calendarClassName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    calendarIcon: PropTypes.node,
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    clearAriaLabel: PropTypes.string,
    clearIcon: PropTypes.node,
    clockClassName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    closeWidgets: PropTypes.bool,
    dayAriaLabel: PropTypes.string,
    dayPlaceholder: PropTypes.string,
    disableCalendar: PropTypes.bool,
    disableClock: PropTypes.bool,
    disabled: PropTypes.bool,
    format: PropTypes.string,
    hourAriaLabel: PropTypes.string,
    hourPlaceholder: PropTypes.string,
    isCalendarOpen: PropTypes.bool,
    isClockOpen: PropTypes.bool,
    locale: PropTypes.string,
    maxDate: isMaxDate,
    maxDetail: PropTypes.oneOf(allViews),
    minDate: isMinDate,
    minuteAriaLabel: PropTypes.string,
    minutePlaceholder: PropTypes.string,
    monthAriaLabel: PropTypes.string,
    monthPlaceholder: PropTypes.string,
    name: PropTypes.string,
    nativeInputAriaLabel: PropTypes.string,
    onCalendarClose: PropTypes.func,
    onCalendarOpen: PropTypes.func,
    onChange: PropTypes.func,
    onClockClose: PropTypes.func,
    onClockOpen: PropTypes.func,
    onFocus: PropTypes.func,
    rangeDivider: PropTypes.node,
    required: PropTypes.bool,
    secondAriaLabel: PropTypes.string,
    secondPlaceholder: PropTypes.string,
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.oneOfType([
        isValue,
        PropTypes.arrayOf(isValue),
    ]),
    yearAriaLabel: PropTypes.string,
    yearPlaceholder: PropTypes.string,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    primary: PropTypes.bool,
    success: PropTypes.bool,
    info: PropTypes.bool,
    danger: PropTypes.bool,
    warning: PropTypes.bool,
    secondary: PropTypes.bool,
    default: PropTypes.bool,
    fullPrimary: PropTypes.bool,
    fullSuccess: PropTypes.bool,
    fullInfo: PropTypes.bool,
    fullDanger: PropTypes.bool,
    fullWarning: PropTypes.bool,
    fullSecondary: PropTypes.bool,
    style: PropTypes.object,
};