import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import {AnterosCalendar} from 'anteros-react-calendar';
import Fit from 'react-fit';
import { DateInput } from './AnterosDatePicker';
import { columnProps } from "anteros-react-layout";
import { AnterosUtils } from 'anteros-react-core';
const baseClassName = 'react-daterange-picker';
const outsideActionEvents = ['mousedown', 'focusin', 'touchstart'];
const allViews = ['century', 'decade', 'year', 'month'];

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

export default class AnterosDateRangePicker extends PureComponent {
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpenProps) {
            return {
                isOpen: nextProps.isOpen,
                isOpenProps: nextProps.isOpen,
            };
        }

        return null;
    }

    state = {};

    componentDidMount() {
        this.handleOutsideActionListeners();
    }

    componentDidUpdate(prevProps, prevState) {
        const { isOpen } = this.state;
        const { onCalendarClose, onCalendarOpen } = this.props;

        if (isOpen !== prevState.isOpen) {
            this.handleOutsideActionListeners();
            callIfDefined(isOpen ? onCalendarOpen : onCalendarClose);
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
            this.closeCalendar();
        }
    }

    // eslint-disable-next-line react/destructuring-assignment
    onChange = (value, closeCalendar = this.props.closeCalendar) => {
        const { onChange } = this.props;

        if (closeCalendar) {
            this.closeCalendar();
        }

        if (onChange) {
            onChange(value);
        }
    }

    onChangeFrom = (valueFrom, closeCalendar) => {
        const { value } = this.props;
        const [, valueTo] = [].concat(value);
        this.onChange([valueFrom, valueTo], closeCalendar);
    }

    onChangeTo = (valueTo, closeCalendar) => {
        const { value } = this.props;
        const [valueFrom] = [].concat(value);
        this.onChange([valueFrom, valueTo], closeCalendar);
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

        this.openCalendar();
    }

    openCalendar = () => {
        this.setState({ isOpen: true });
    }

    closeCalendar = () => {
        this.setState((prevState) => {
            if (!prevState.isOpen) {
                return null;
            }

            return { isOpen: false };
        });
    }

    toggleCalendar = () => {
        this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }

    stopPropagation = event => event.stopPropagation();

    clear = () => this.onChange(null);

    handleOutsideActionListeners(shouldListen) {
        const { isOpen } = this.state;

        const shouldListenWithFallback = typeof shouldListen !== 'undefined' ? shouldListen : isOpen;
        const fnName = shouldListenWithFallback ? 'addEventListener' : 'removeEventListener';
        outsideActionEvents.forEach(eventName => document[fnName](eventName, this.onOutsideAction));
    }

    renderInputs() {
        const {
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
            locale,
            maxDate,
            maxDetail,
            minDate,
            monthAriaLabel,
            monthPlaceholder,
            name,
            nativeInputAriaLabel,
            rangeDivider,
            required,
            showLeadingZeros,
            value,
            yearAriaLabel,
            yearPlaceholder,
        } = this.props;
        const { isOpen } = this.state;

        const [valueFrom, valueTo] = [].concat(value);

        const ariaLabelProps = {
            dayAriaLabel,
            monthAriaLabel,
            nativeInputAriaLabel,
            yearAriaLabel,
        };

        const placeholderProps = {
            dayPlaceholder,
            monthPlaceholder,
            yearPlaceholder,
        };

        const commonProps = {
            ...ariaLabelProps,
            ...placeholderProps,
            className: `${baseClassName}__inputGroup`,
            disabled,
            format,
            isCalendarOpen: isOpen,
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
                {!this.props.disableInput ? <DateInput
                    {...commonProps}
                    autoFocus={autoFocus}
                    className={`${baseClassName}__inputGroup`}
                    classNameInput={classNameInput}
                    name={`${name}_from`}
                    onChange={this.onChangeFrom}
                    returnValue="start"
                    value={valueFrom}
                /> : null}
                {!this.props.disableInput ? <div style={{
                    paddingRight: '20px',
                    width: '80px',
                    color: '#a12f2f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span className={`far fa-arrow-right`}>
                    </span>
                </div> : null}
                {!this.props.disableInput ? <DateInput
                    {...commonProps}
                    className={`${baseClassName}__inputGroup`}
                    classNameInput={classNameInput}
                    name={`${name}_to`}
                    onChange={this.onChangeTo}
                    returnValue="end"
                    value={valueTo}
                /> : null}
                {clearIcon !== null && (
                    !this.props.disableInput ? <button
                        aria-label={clearAriaLabel}
                        className={`${baseClassName}__clear-button ${baseClassName}__button`}
                        disabled={disabled}
                        onClick={this.clear}
                        onFocus={this.stopPropagation}
                        type="button"
                    >
                        {clearIcon}
                    </button> : null
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
        const { isOpen } = this.state;

        if (isOpen === null || disableCalendar) {
            return null;
        }

        const {
            calendarClassName,
            className: datePickerClassName, // Unused, here to exclude it from calendarProps
            onChange,
            value,
            ...calendarProps
        } = this.props;

        const className = `${baseClassName}__calendar`;

        return (
            <Fit>
                <div className={mergeClassNames(className, `${className}--${isOpen ? 'open' : 'closed'}`)}>
                    <AnterosCalendar
                        className={calendarClassName}
                        onChange={this.onChange}
                        selectRange
                        value={value || null}
                        {...calendarProps}
                    />
                </div>
            </Fit>
        );
    }

    render() {
        const { className, disabled, width } = this.props;
        const { isOpen } = this.state;

        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() === 'dsBrowse');
        }

        return (
            <div
                className={mergeClassNames(
                    baseClassName,
                    `${baseClassName}--${isOpen ? 'open' : 'closed'}`,
                    `${baseClassName}--${disabled || readOnly? 'disabled' : 'enabled'}`,
                    className,
                )}
                {...this.eventProps}
                style={{ width: width }}
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

AnterosDateRangePicker.defaultProps = {
    calendarIcon: CalendarIcon,
    clearIcon: ClearIcon,
    closeCalendar: true,
    isOpen: null,
    name: 'daterange',
    rangeDivider: ' ',
    primary: true,
    width: "auto",
};

const isValue = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
]);

AnterosDateRangePicker.propTypes = {
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
    closeCalendar: PropTypes.bool,
    dayAriaLabel: PropTypes.string,
    dayPlaceholder: PropTypes.string,
    disableCalendar: PropTypes.bool,
    disabled: PropTypes.bool,
    format: PropTypes.string,
    isOpen: PropTypes.bool,
    locale: PropTypes.string,
    maxDate: isMaxDate,
    maxDetail: PropTypes.oneOf(allViews),
    minDate: isMinDate,
    monthAriaLabel: PropTypes.string,
    monthPlaceholder: PropTypes.string,
    name: PropTypes.string,
    nativeInputAriaLabel: PropTypes.string,
    onCalendarClose: PropTypes.func,
    onCalendarOpen: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    rangeDivider: PropTypes.node,
    required: PropTypes.bool,
    returnValue: PropTypes.oneOf(['start', 'end', 'range']),
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