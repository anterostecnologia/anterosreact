import React, { PureComponent, Component } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import { AnterosCalendar } from 'anteros-react-calendar';
import { AnterosDateUtils, autoBind } from 'anteros-react-core';
import Fit from 'react-fit';
import {
    getYear, getMonthHuman, getDate, getDaysInMonth,
    getCenturyStart,
    getCenturyEnd,

    getDecadeStart,
    getDecadeEnd,

    getYearStart,
    getYearEnd,

    getMonthStart,
    getMonthEnd,

    getDayStart,
    getDayEnd,
    getISOLocalDate,
    getISOLocalMonth,
} from '@wojtekmaj/date-utils';
import getUserLocale from 'get-user-locale';
import updateInputWidth, { getFontShorthand } from 'update-input-width';
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import { AnterosUtils } from 'anteros-react-core';

const defaultMinDate = new Date(-8.64e15);
const defaultMaxDate = new Date(8.64e15);
const allViews = ['century', 'decade', 'year', 'month'];
const allValueTypes = [...allViews.slice(1), 'day'];
const isValueType = PropTypes.oneOf(allValueTypes);


/**
 * Returns a value no smaller than min and no larger than max.
 *
 * @param {*} value Value to return.
 * @param {*} min Minimum return value.
 * @param {*} max Maximum return value.
 */
function between(value, min, max) {
    if (min && min > value) {
        return min;
    }
    if (max && max < value) {
        return max;
    }
    return value;
}

/**
 * Calls a function, if it's defined, with specified arguments
 * @param {Function} fn
 * @param {Object} args
 */
function callIfDefined(fn, ...args) {
    if (fn && typeof fn === 'function') {
        fn(...args);
    }
}

function isValidNumber(num) {
    return num !== null && num !== false && !Number.isNaN(Number(num));
}

function safeMin(...args) {
    return Math.min(...args.filter(isValidNumber));
}

function safeMax(...args) {
    return Math.max(...args.filter(isValidNumber));
}

const isMinDate = (props, propName, componentName) => {
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

const isMaxDate = (props, propName, componentName) => {
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


/**
 * Returns the beginning of a given range.
 *
 * @param {String} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */
function getBegin(rangeType, date) {
    switch (rangeType) {
        case 'century': return getCenturyStart(date);
        case 'decade': return getDecadeStart(date);
        case 'year': return getYearStart(date);
        case 'month': return getMonthStart(date);
        case 'day': return getDayStart(date);
        default: throw new Error(`Invalid rangeType: ${rangeType}`);
    }
}

/**
 * Returns the end of a given range.
 *
 * @param {String} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */
function getEnd(rangeType, date) {
    switch (rangeType) {
        case 'century': return getCenturyEnd(date);
        case 'decade': return getDecadeEnd(date);
        case 'year': return getYearEnd(date);
        case 'month': return getMonthEnd(date);
        case 'day': return getDayEnd(date);
        default: throw new Error(`Invalid rangeType: ${rangeType}`);
    }
}

function getFormatter(options) {
    return (locale, date) => date.toLocaleString(locale || getUserLocale(), options);
}

/**
 * Changes the hour in a Date to ensure right date formatting even if DST is messed up.
 * Workaround for bug in WebKit and Firefox with historical dates.
 * For more details, see:
 * https://bugs.chromium.org/p/chromium/issues/detail?id=750465
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1385643
 *
 * @param {Date} date Date.
 */
function toSafeHour(date) {
    const safeDate = new Date(date);
    return new Date(safeDate.setHours(12));
}

function getSafeFormatter(options) {
    return (locale, date) => getFormatter(options)(locale, toSafeHour(date));
}

const formatMonthOptions = { month: 'long' };
const formatShortMonthOptions = { month: 'short' };

const formatMonth = getSafeFormatter(formatMonthOptions);
const formatShortMonth = getSafeFormatter(formatShortMonthOptions);


function Divider({ children }) {
    return (
        <span className="react-date-picker__inputGroup__divider">
            {children}
        </span>
    );
}

Divider.propTypes = {
    children: PropTypes.node,
};

const baseClassName = 'react-date-picker';
const outsideActionEvents = ['mousedown', 'focusin', 'touchstart'];


export default class AnterosDatePicker extends Component {
    constructor(props) {
        super(props);
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            if (!(value instanceof Date)) {
                value = AnterosDateUtils.parseDateWithFormat(value, this.props.format);
            }
            this.state = { value: value };
        } else {
            this.state = { value: this.props.value };
        }
        autoBind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpenProps) {
            return {
                isOpen: nextProps.isOpen,
                isOpenProps: nextProps.isOpen,
            };
        }

        return null;
    }


    componentDidMount() {
        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }

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
        if ((this.props.dataSource)) {
            this.props.dataSource.removeEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    onDatasourceEvent(event, error) {
        let value = this.props.dataSource.fieldByName(this.props.dataField);
        if (!value) {
            value = '';
        }
        if (!(value instanceof Date)) {
            value = AnterosDateUtils.parseDateWithFormat(value, this.props.format);
        }
        this.setState({ value: value });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            if (!(value instanceof Date)) {
                value = AnterosDateUtils.parseDateWithFormat(value, this.props.format);
            }
            this.setState({ value: value });
        } else {
            this.setState({ value: nextProps.value });
        }
    }

    get eventProps() {
        return makeEventProps(this.props);
    }

    onOutsideAction(event) {
        if (this.wrapper && !this.wrapper.contains(event.target)) {
            this.closeCalendar();
        }
    }

    // eslint-disable-next-line react/destructuring-assignment
    onChange(value, closeCalendar = this.props.closeCalendar) {
        const { onChange } = this.props;

        if (closeCalendar) {
            this.closeCalendar();
        }

        this.setState({ value });

        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, value);
        }

        if (onChange) {
            onChange(value);
        }
    }

    onBlur(event) {
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, this.state.value);
        }
    }

    onFocus(event) {
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

    openCalendar() {
        this.setState({ isOpen: true });
    }

    closeCalendar() {
        this.setState((prevState) => {
            if (!prevState.isOpen) {
                return null;
            }

            return { isOpen: false };
        });
    }

    toggleCalendar() {
        if (!this.props.disabled)
            this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    clear() {
        this.onChange(null);
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, undefined);
        }
    }

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
            required,
            returnValue,
            showLeadingZeros,
            yearAriaLabel,
            yearPlaceholder,
        } = this.props;
        const { isOpen } = this.state;

        const [valueFrom] = [].concat(this.state.value);

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

        let icon = "fa fa-calendar";
        if (this.props.icon) {
            icon = this.props.icon;
        }

        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() === 'dsBrowse');
        }
        let classNameAddOn = AnterosUtils.buildClassNames("input-group-addon",
            (disabled || readOnly ? "disabled" : ""),
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

        let style = this.props.style;
        if (disabled || readOnly) {
            style = {
                ...style, backgroundColor: '#e9ecef !important',
                opacity: 1
            };
        }

        return (
            <div className={`${baseClassName}__wrapper`}>
                <DateInput
                    {...ariaLabelProps}
                    {...placeholderProps}
                    autoFocus={autoFocus}
                    className={`${baseClassName}__inputGroup`}
                    classNameInput={classNameInput}
                    style={style}
                    disabled={disabled || readOnly}
                    format={format}
                    isCalendarOpen={isOpen}
                    locale={locale}
                    maxDate={maxDate}
                    maxDetail={maxDetail}
                    minDate={minDate}
                    name={name}
                    onChange={this.onChange}
                    required={required}
                    returnValue={returnValue}
                    showLeadingZeros={showLeadingZeros}
                    value={valueFrom}
                />
                {clearIcon !== null && (
                    <button
                        aria-label={clearAriaLabel}
                        className={`${baseClassName}__clear-button ${baseClassName}__button`}
                        disabled={disabled || readOnly}
                        onClick={this.clear}
                        onFocus={this.stopPropagation}
                        type="button"
                    >
                        {clearIcon}
                    </button>
                )}
                {calendarIcon !== null && (!disableCalendar || !readOnly) && (
                    <div className={classNameAddOn} onBlur={this.resetValue}
                        onClick={this.toggleCalendar}
                        onFocus={this.stopPropagation}
                        disabled={disabled || readOnly}
                        style={{ margin: 0, height: '38px', width: '38px' }}>
                        <span><i className={icon} /><img alt="" src={this.props.image} /></span></div>
                )}
            </div>
        );
    }

    renderCalendar() {
        const { disableCalendar } = this.props;
        const { isOpen } = this.state;

        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() === 'dsBrowse');
        }

        if (isOpen === null || disableCalendar || readOnly) {
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
                        value={value || null}
                        {...calendarProps}
                    />
                </div>
            </Fit>
        );
    }

    render() {
        const { disabled } = this.props;
        const { isOpen } = this.state;

        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() === 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);

        let className = AnterosUtils.buildClassNames(
            (this.props.className ? this.props.className : ""),
            colClasses);

        let width = this.props.width;
        if (colClasses.length > 0) {
            width = "";
        }
        return (
            <div className={className} onBlur={this.onBlur}>
                <div
                    className={mergeClassNames(
                        baseClassName,
                        `${baseClassName}--${isOpen ? 'open' : 'closed'}`,
                        `${baseClassName}--${disabled || readOnly ? 'disabled' : 'enabled'}`
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

AnterosDatePicker.defaultProps = {
    calendarIcon: CalendarIcon,
    clearIcon: ClearIcon,
    closeCalendar: true,
    isOpen: null,
    returnValue: 'start',
    width: "auto",
    primary: true,
    showLeadingZeros: false,
    format: 'd/M/y',
};

const isValue = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
]);

AnterosDatePicker.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
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





function datesAreDifferent(date1, date2) {
    return (
        (date1 && !date2)
        || (!date1 && date2)
        || (date1 && date2 && date1.getTime() !== date2.getTime())
    );
}

/**
 * Returns value type that can be returned with currently applied settings.
 */
function getValueType(maxDetail) {
    return allValueTypes[allViews.indexOf(maxDetail)];
}

function getValue(value, index) {
    if (!value) {
        return null;
    }

    const rawValue = value instanceof Array && value.length === 2 ? value[index] : value;

    if (!rawValue) {
        return null;
    }

    const valueDate = new Date(rawValue);

    if (isNaN(valueDate.getTime())) {
        throw new Error(`Invalid date: ${value}`);
    }

    return valueDate;
}

function getDetailValue({
    value, minDate, maxDate, maxDetail,
}, index) {
    const valuePiece = getValue(value, index);

    if (!valuePiece) {
        return null;
    }

    const valueType = getValueType(maxDetail);
    const detailValueFrom = [getBegin, getEnd][index](valueType, valuePiece);

    return between(detailValueFrom, minDate, maxDate);
}

const getDetailValueFrom = args => getDetailValue(args, 0);

const getDetailValueTo = args => getDetailValue(args, 1);

const getDetailValueArray = (args) => {
    const { value } = args;

    if (value instanceof Array) {
        return value;
    }

    return [getDetailValueFrom, getDetailValueTo].map(fn => fn(args));
};

function isValidInput(element) {
    return element.tagName === 'INPUT' && element.type === 'number';
}

function findInput(element, property) {
    let nextElement = element;
    do {
        nextElement = nextElement[property];
    } while (nextElement && !isValidInput(nextElement));
    return nextElement;
}

function focus(element) {
    if (element) {
        element.focus();
    }
}

function renderCustomInputs(placeholder, elementFunctions, allowMultipleInstances) {
    const usedFunctions = [];
    const pattern = new RegExp(
        Object.keys(elementFunctions).map(el => `${el}+`).join('|'), 'g',
    );
    const matches = placeholder.match(pattern);

    return placeholder.split(pattern)
        .reduce((arr, element, index) => {
            const divider = element && (
                // eslint-disable-next-line react/no-array-index-key
                <Divider key={`separator_${index}`}>
                    {element}
                </Divider>
            );
            const res = [...arr, divider];
            const currentMatch = matches && matches[index];

            if (currentMatch) {
                const renderFunction = (
                    elementFunctions[currentMatch]
                    || elementFunctions[
                    Object.keys(elementFunctions)
                        .find(elementFunction => currentMatch.match(elementFunction))
                    ]
                );

                if (!allowMultipleInstances && usedFunctions.includes(renderFunction)) {
                    res.push(currentMatch);
                } else {
                    res.push(renderFunction(currentMatch, index));
                    usedFunctions.push(renderFunction);
                }
            }
            return res;
        }, []);
}

function onFocus(event) {
    const { target } = event;

    requestAnimationFrame(() => target.select());
}

function updateInputWidthOnFontLoad(element) {
    if (!document.fonts) {
        return;
    }

    const font = getFontShorthand(element);

    if (!font) {
        return;
    }

    const isFontLoaded = document.fonts.check(font);

    if (isFontLoaded) {
        return;
    }

    function onLoadingDone() {
        updateInputWidth(element);
    }

    document.fonts.addEventListener('loadingdone', onLoadingDone);
}

function getSelectionString() {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.getSelection().toString();
}

const numberRegExp = /[0-9]/;

function makeOnKeyPress(maxLength) {
    return function onKeyPress(event) {
        const selection = getSelectionString();
        const { value } = event.target;

        if (numberRegExp.test(event.key) && (selection || value.length < maxLength)) {
            return;
        }

        event.preventDefault();
    };
}

export function YearInput({
    maxDate,
    minDate,
    placeholder = '    ',
    valueType,
    disabled,
    ...otherProps
}) {
    const maxYear = safeMin(275760, maxDate && getYear(maxDate));
    const minYear = safeMax(1, minDate && getYear(minDate));

    const yearStep = (() => {
        if (valueType === 'century') {
            return 10;
        }

        return 1;
    })();

    return (
        <Input
            max={maxYear}
            min={minYear}
            name="year"
            placeholder={placeholder}
            step={yearStep}
            disabled={disabled}
            {...otherProps}
        />
    );
}

YearInput.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    itemRef: PropTypes.func,
    maxDate: isMaxDate,
    minDate: isMinDate,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    value: PropTypes.number,
    valueType: isValueType,
};

export function NativeInput({
    ariaLabel,
    disabled,
    maxDate,
    minDate,
    name,
    onChange,
    required,
    value,
    valueType,
}) {
    const nativeInputType = (() => {
        switch (valueType) {
            case 'decade':
            case 'year':
                return 'number';
            case 'month':
                return 'month';
            case 'day':
                return 'date';
            default:
                throw new Error('Invalid valueType.');
        }
    })();

    const nativeValueParser = (() => {
        switch (valueType) {
            case 'century':
            case 'decade':
            case 'year':
                return getYear;
            case 'month':
                return getISOLocalMonth;
            case 'day':
                return getISOLocalDate;
            default:
                throw new Error('Invalid valueType.');
        }
    })();

    function stopPropagation(event) {
        event.stopPropagation();
    }

    return (
        <input
            aria-label={ariaLabel}
            disabled={disabled}
            max={maxDate ? nativeValueParser(maxDate) : null}
            min={minDate ? nativeValueParser(minDate) : null}
            name={name}
            onChange={onChange}
            onFocus={stopPropagation}
            required={required}
            style={{
                visibility: 'hidden',
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
            }}
            type={nativeInputType}
            value={value ? nativeValueParser(value) : ''}
        />
    );
}

NativeInput.propTypes = {
    ariaLabel: PropTypes.string,
    disabled: PropTypes.bool,
    maxDate: isMaxDate,
    minDate: isMinDate,
    name: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
    valueType: isValueType,
};

export function MonthSelect({
    ariaLabel,
    className,
    itemRef,
    locale,
    maxDate,
    minDate,
    placeholder = '  ',
    short,
    value,
    year,
    disabled,
    ...otherProps
}) {
    function isSameYear(date) {
        return date && year === getYear(date);
    }

    const maxMonth = safeMin(12, isSameYear(maxDate) && getMonthHuman(maxDate));
    const minMonth = safeMax(1, isSameYear(minDate) && getMonthHuman(minDate));
    const dates = [...Array(12)].map((el, index) => new Date(2019, index, 1));
    const name = 'month';
    const formatter = short ? formatShortMonth : formatMonth;

    return (
        <select
            aria-label={ariaLabel}
            className={mergeClassNames(
                `${className}__input`,
                `${className}__${name}`,
            )}
            name={name}
            ref={(ref) => {
                if (itemRef) {
                    itemRef(ref, name);
                }
            }}
            value={value !== null ? value : ''}
            disabled={disabled}
            {...otherProps}
        >
            {!value && (
                <option value="">
                    {placeholder}
                </option>
            )}
            {dates.map((date) => {
                const month = getMonthHuman(date);
                const disabled = month < minMonth || month > maxMonth;

                return (
                    <option
                        key={month}
                        disabled={disabled}
                        value={month}
                    >
                        {formatter(locale, date)}
                    </option>
                );
            })}
        </select>
    );
}

MonthSelect.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    itemRef: PropTypes.func,
    locale: PropTypes.string,
    maxDate: isMaxDate,
    minDate: isMinDate,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    short: PropTypes.bool,
    value: PropTypes.number,
    year: PropTypes.number,
};

export function MonthInput({
    maxDate,
    minDate,
    year,
    disabled,
    ...otherProps
}) {
    function isSameYear(date) {
        return date && year === getYear(date);
    }

    const maxMonth = safeMin(12, isSameYear(maxDate) && getMonthHuman(maxDate));
    const minMonth = safeMax(1, isSameYear(minDate) && getMonthHuman(minDate));

    return (
        <Input
            max={maxMonth}
            min={minMonth}
            name="month"
            disabled={disabled}
            {...otherProps}
        />
    );
}

MonthInput.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    itemRef: PropTypes.func,
    maxDate: isMaxDate,
    minDate: isMinDate,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.number,
    year: PropTypes.number,
};

export function Input({
    ariaLabel,
    autoFocus,
    className,
    disabled,
    itemRef,
    max,
    min,
    name,
    nameForClass,
    onChange,
    onKeyDown,
    onKeyUp,
    placeholder = '  ',
    required,
    showLeadingZeros,
    step,
    value,
}) {
    const hasLeadingZero = showLeadingZeros && value !== null && value < 10;
    const maxLength = max.toString().length;

    return [
        (hasLeadingZero && <span key="leadingZero" className={`${className}__leadingZero`}>0</span>),
        <input
            key="input"
            aria-label={ariaLabel}
            autoComplete="off"
            autoFocus={autoFocus}
            className={mergeClassNames(
                `${className}__input`,
                `${className}__${nameForClass || name}`,
                hasLeadingZero && `${className}__input--hasLeadingZero`,
            )}
            disabled={disabled}
            max={max}
            min={min}
            name={name}
            onChange={onChange}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onKeyPress={makeOnKeyPress(maxLength)}
            onKeyUp={(event) => {
                updateInputWidth(event.target);

                if (onKeyUp) {
                    onKeyUp(event);
                }
            }}
            placeholder={placeholder}
            ref={(ref) => {
                if (ref) {
                    updateInputWidth(ref);
                    updateInputWidthOnFontLoad(ref);
                }

                if (itemRef) {
                    itemRef(ref, name);
                }
            }}
            required={required}
            step={step}
            type="number"
            value={value !== null ? value : ''}
        />,
    ];
}

Input.propTypes = {
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    itemRef: PropTypes.func,
    max: PropTypes.number,
    min: PropTypes.number,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    step: PropTypes.number,
    value: PropTypes.number,
};

export function DayInput({
    maxDate,
    minDate,
    month,
    year,
    disabled,
    ...otherProps
}) {
    const currentMonthMaxDays = (() => {
        if (!month) {
            return 31;
        }

        return getDaysInMonth(new Date(year, month - 1, 1));
    })();

    function isSameMonth(date) {
        return date && year === getYear(date) && month === getMonthHuman(date);
    }

    const maxDay = safeMin(currentMonthMaxDays, isSameMonth(maxDate) && getDate(maxDate));
    const minDay = safeMax(1, isSameMonth(minDate) && getDate(minDate));

    return (
        <Input
            max={maxDay}
            min={minDay}
            name="day"
            disabled={disabled}
            {...otherProps}
        />
    );
}

DayInput.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    itemRef: PropTypes.func,
    maxDate: isMaxDate,
    minDate: isMinDate,
    month: PropTypes.number,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.number,
    year: PropTypes.number,
};

export class DateInput extends PureComponent {
    static getDerivedStateFromProps(nextProps, prevState) {
        const {
            minDate, maxDate, maxDetail,
        } = nextProps;

        const nextState = {};

        /**
         * If isCalendarOpen flag has changed, we have to update it.
         * It's saved in state purely for use in getDerivedStateFromProps.
         */
        if (nextProps.isCalendarOpen !== prevState.isCalendarOpen) {
            nextState.isCalendarOpen = nextProps.isCalendarOpen;
        }

        /**
         * If the next value is different from the current one  (with an exception of situation in
         * which values provided are limited by minDate and maxDate so that the dates are the same),
         * get a new one.
         */
        const nextValue = getDetailValueFrom({
            value: nextProps.value, minDate, maxDate, maxDetail,
        });
        const values = [nextValue, prevState.value];
        if (
            // Toggling calendar visibility resets values
            nextState.isCalendarOpen // Flag was toggled
            || datesAreDifferent(
                ...values.map(value => getDetailValueFrom({
                    value, minDate, maxDate, maxDetail,
                })),
            )
            || datesAreDifferent(
                ...values.map(value => getDetailValueTo({
                    value, minDate, maxDate, maxDetail,
                })),
            )
        ) {
            if (nextValue) {
                nextState.year = getYear(nextValue);
                nextState.month = getMonthHuman(nextValue);
                nextState.day = getDate(nextValue);
            } else {
                nextState.year = null;
                nextState.month = null;
                nextState.day = null;
            }
            nextState.value = nextValue;
        }

        return nextState;
    }

    state = {
        year: null,
        month: null,
        day: null,
    };

    get formatDate() {
        const { maxDetail } = this.props;

        const options = { year: 'numeric' };
        const level = allViews.indexOf(maxDetail);
        if (level >= 2) {
            options.month = 'numeric';
        }
        if (level >= 3) {
            options.day = 'numeric';
        }

        return getFormatter(options);
    }

    // eslint-disable-next-line class-methods-use-this
    get formatNumber() {
        const options = { useGrouping: false };

        return getFormatter(options);
    }

    /**
     * Gets current value in a desired format.
     */
    getProcessedValue(value) {
        const {
            minDate, maxDate, maxDetail, returnValue,
        } = this.props;

        const processFunction = (() => {
            switch (returnValue) {
                case 'start': return getDetailValueFrom;
                case 'end': return getDetailValueTo;
                case 'range': return getDetailValueArray;
                default: throw new Error('Invalid returnValue.');
            }
        })();

        return processFunction({
            value, minDate, maxDate, maxDetail,
        });
    }

    get divider() {
        return this.placeholder.match(/[^0-9a-z]/i)[0];
    }

    get placeholder() {
        const { format, locale } = this.props;

        if (format) {
            return format;
        }

        const year = 2017;
        const monthIndex = 11;
        const day = 11;

        const date = new Date(year, monthIndex, day);

        return (
            this.formatDate(locale, date)
                .replace(this.formatNumber(locale, year), 'y')
                .replace(this.formatNumber(locale, monthIndex + 1), 'M')
                .replace(this.formatNumber(locale, day), 'd')
        );
    }

    get commonInputProps() {
        const {
            className,
            disabled,
            isCalendarOpen,
            maxDate,
            minDate,
            required,
        } = this.props;

        return {
            className,
            disabled,
            maxDate: maxDate || defaultMaxDate,
            minDate: minDate || defaultMinDate,
            onChange: this.onChange,
            onKeyDown: this.onKeyDown,
            onKeyUp: this.onKeyUp,
            // This is only for showing validity when editing
            required: required || isCalendarOpen,
            itemRef: (ref, name) => {
                // Save a reference to each input field
                this[`${name}Input`] = ref;
            },
        };
    }

    get valueType() {
        const { maxDetail } = this.props;

        return getValueType(maxDetail);
    }

    onClick = (event) => {
        if (event.target === event.currentTarget) {
            // Wrapper was directly clicked
            const firstInput = event.target.children[1];
            focus(firstInput);
        }
    }

    onKeyDown = (event) => {
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case this.divider: {
                event.preventDefault();

                const { target: input } = event;
                const property = event.key === 'ArrowLeft' ? 'previousElementSibling' : 'nextElementSibling';
                const nextInput = findInput(input, property);
                focus(nextInput);
                break;
            }
            default:
        }
    }

    onKeyUp = (event) => {
        const { key, target: input } = event;

        const isNumberKey = !isNaN(parseInt(key, 10));

        if (!isNumberKey) {
            return;
        }

        const { value } = input;
        const max = input.getAttribute('max');

        /**
         * Given 1, the smallest possible number the user could type by adding another digit is 10.
         * 10 would be a valid value given max = 12, so we won't jump to the next input.
         * However, given 2, smallers possible number would be 20, and thus keeping the focus in
         * this field doesn't make sense.
         */
        if ((value * 10 > max) || (value.length >= max.length)) {
            const property = 'nextElementSibling';
            const nextInput = findInput(input, property);
            focus(nextInput);
        }
    }

    /**
     * Called when non-native date input is changed.
     */
    onChange = (event) => {
        const { name, value } = event.target;

        this.setState(
            { [name]: value ? parseInt(value, 10) : null },
            this.onChangeExternal,
        );
    }

    /**
     * Called when native date input is changed.
     */
    onChangeNative = (event) => {
        const { onChange } = this.props;
        const { value } = event.target;

        if (!onChange) {
            return;
        }

        const processedValue = (() => {
            if (!value) {
                return null;
            }

            const [yearString, monthString, dayString] = value.split('-');
            const year = parseInt(yearString, 10);
            const monthIndex = parseInt(monthString, 10) - 1 || 0;
            const day = parseInt(dayString, 10) || 1;

            const proposedValue = new Date();
            proposedValue.setFullYear(year, monthIndex, day);
            proposedValue.setHours(0, 0, 0, 0);

            return proposedValue;
        })();

        onChange(processedValue, false);
    }

    /**
     * Called after internal onChange. Checks input validity. If all fields are valid,
     * calls props.onChange.
     */
    onChangeExternal = () => {
        const { onChange } = this.props;

        if (!onChange) {
            return;
        }

        const formElements = [this.dayInput, this.monthInput, this.yearInput].filter(Boolean);

        const values = {};
        formElements.forEach((formElement) => {
            values[formElement.name] = formElement.value;
        });

        if (formElements.every(formElement => !formElement.value)) {
            onChange(null, false);
        } else if (
            formElements.every(formElement => formElement.value && formElement.validity.valid)
        ) {
            const year = parseInt(values.year, 10);
            const monthIndex = parseInt(values.month, 10) - 1 || 0;
            const day = parseInt(values.day || 1, 10);

            const proposedValue = new Date();
            proposedValue.setFullYear(year, monthIndex, day);
            proposedValue.setHours(0, 0, 0, 0);
            const processedValue = this.getProcessedValue(proposedValue);
            onChange(processedValue, false);
        }
    }

    renderDay = (currentMatch, index) => {
        const {
            autoFocus,
            dayAriaLabel,
            dayPlaceholder,
            showLeadingZeros,
        } = this.props;
        const { day, month, year } = this.state;

        if (currentMatch && currentMatch.length > 2) {
            throw new Error(`Unsupported token: ${currentMatch}`);
        }

        const showLeadingZerosFromFormat = currentMatch && currentMatch.length === 2;

        return (
            <DayInput
                key="day"
                {...this.commonInputProps}
                ariaLabel={dayAriaLabel}
                autoFocus={index === 0 && autoFocus}
                month={month}
                placeholder={dayPlaceholder}
                showLeadingZeros={showLeadingZerosFromFormat || showLeadingZeros}
                value={day}
                year={year}
            />
        );
    }

    renderMonth = (currentMatch, index) => {
        const {
            autoFocus,
            locale,
            monthAriaLabel,
            monthPlaceholder,
            showLeadingZeros,
        } = this.props;
        const { month, year } = this.state;

        if (currentMatch && currentMatch.length > 4) {
            throw new Error(`Unsupported token: ${currentMatch}`);
        }

        if (currentMatch.length > 2) {
            return (
                <MonthSelect
                    key="month"
                    {...this.commonInputProps}
                    ariaLabel={monthAriaLabel}
                    autoFocus={index === 0 && autoFocus}
                    locale={locale}
                    placeholder={monthPlaceholder}
                    short={currentMatch.length === 3}
                    value={month}
                    year={year}
                />
            );
        }

        const showLeadingZerosFromFormat = currentMatch && currentMatch.length === 2;

        return (
            <MonthInput
                key="month"
                {...this.commonInputProps}
                ariaLabel={monthAriaLabel}
                autoFocus={index === 0 && autoFocus}
                placeholder={monthPlaceholder}
                showLeadingZeros={showLeadingZerosFromFormat || showLeadingZeros}
                value={month}
                year={year}
            />
        );
    }

    renderYear = (currentMatch, index) => {
        const { autoFocus, yearAriaLabel, yearPlaceholder } = this.props;
        const { year } = this.state;

        return (
            <YearInput
                key="year"
                {...this.commonInputProps}
                ariaLabel={yearAriaLabel}
                autoFocus={index === 0 && autoFocus}
                placeholder={yearPlaceholder}
                value={year}
                valueType={this.valueType}
            />
        );
    }

    renderCustomInputs() {
        const { placeholder } = this;
        const { format } = this.props;

        const elementFunctions = {
            d: this.renderDay,
            M: this.renderMonth,
            y: this.renderYear,
        };

        const allowMultipleInstances = typeof format !== 'undefined';
        return renderCustomInputs(placeholder, elementFunctions, allowMultipleInstances);
    }

    renderNativeInput() {
        const {
            disabled,
            maxDate,
            minDate,
            name,
            nativeInputAriaLabel,
            required,
        } = this.props;
        const { value } = this.state;

        return (
            <NativeInput
                key="date"
                ariaLabel={nativeInputAriaLabel}
                disabled={disabled}
                maxDate={maxDate || defaultMaxDate}
                minDate={minDate || defaultMinDate}
                name={name}
                onChange={this.onChangeNative}
                required={required}
                value={value}
                valueType={this.valueType}
            />
        );
    }

    render() {
        const { className, classNameInput, style } = this.props;

        /* eslint-disable jsx-a11y/click-events-have-key-events */
        /* eslint-disable jsx-a11y/no-static-element-interactions */
        return (
            <div
                className={`${classNameInput} ${className}`}
                style={style}
                onClick={this.onClick}
            >
                {this.renderNativeInput()}
                {this.renderCustomInputs()}
            </div>
        );
    }
}

DateInput.defaultProps = {
    maxDetail: 'month',
    name: 'date',
    returnValue: 'start',
};


DateInput.propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string.isRequired,
    dayAriaLabel: PropTypes.string,
    dayPlaceholder: PropTypes.string,
    disabled: PropTypes.bool,
    format: PropTypes.string,
    isCalendarOpen: PropTypes.bool,
    locale: PropTypes.string,
    maxDate: isMaxDate,
    maxDetail: PropTypes.oneOf(allViews),
    minDate: isMinDate,
    monthAriaLabel: PropTypes.string,
    monthPlaceholder: PropTypes.string,
    name: PropTypes.string,
    nativeInputAriaLabel: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    returnValue: PropTypes.oneOf(['start', 'end', 'range']),
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.oneOfType([
        isValue,
        PropTypes.arrayOf(isValue),
    ]),
    yearAriaLabel: PropTypes.string,
    yearPlaceholder: PropTypes.string,
};