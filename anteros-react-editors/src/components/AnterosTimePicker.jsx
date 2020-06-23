import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import Fit from 'react-fit';
import {
    getHours,
    getMinutes,
    getSeconds,
    getHoursMinutes,
    getHoursMinutesSeconds,
} from '@wojtekmaj/date-utils';
import updateInputWidth, { getFontShorthand } from 'update-input-width';
import getUserLocale from 'get-user-locale';
import {AnterosClock} from "anteros-react-calendar";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import { AnterosDateUtils, autoBind } from 'anteros-react-core';


const baseClassName = 'react-time-picker';
const outsideActionEvents = ['mousedown', 'focusin', 'touchstart'];

function Divider({ children }) {
    return (
      <span className="react-time-picker__inputGroup__divider">
        {children}
      </span>
    );
  }
  
  Divider.propTypes = {
    children: PropTypes.node,
  };

function hoursAreDifferent(date1, date2) {
    return (
        (date1 && !date2)
        || (!date1 && date2)
        || (date1 && date2 && date1 !== date2) // TODO: Compare 11:22:00 and 11:22 properly
    );
}

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



/* eslint-disable jsx-a11y/no-autofocus */

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

const allViews = ['hour', 'minute', 'second'];
const allValueTypes = [...allViews];

const hourOptionalSecondsRegExp = /^(([0-1])?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;

/**
 * Calls a function, if it's defined, with specified arguments
 * @param {Function} fn
 * @param {Object} args
 */
export const callIfDefined = (fn, ...args) => {
    if (fn && typeof fn === 'function') {
        fn(...args);
    }
};

const nines = ['9', '٩'];
const ninesRegExp = new RegExp(`[${nines.join('')}]`);
const amPmFormatter = getFormatter({ hour: 'numeric' });

export function getAmPmLabels(locale) {
    const amString = amPmFormatter(locale, new Date(2017, 0, 1, 9));
    const pmString = amPmFormatter(locale, new Date(2017, 0, 1, 21));

    const [am1, am2] = amString.split(ninesRegExp);
    const [pm1, pm2] = pmString.split(ninesRegExp);

    if (pm2 !== undefined) {
        // If pm2 is undefined, nine was not found in pmString - this locale is not using 12-hour time
        if (am1 !== pm1) {
            return [am1, pm1].map(el => el.trim());
        }

        if (am2 !== pm2) {
            return [am2, pm2].map(el => el.trim());
        }
    }

    // Fallback
    return ['AM', 'PM'];
}

function isValidNumber(num) {
    return num !== null && num !== false && !Number.isNaN(Number(num));
}

export function safeMin(...args) {
    return Math.min(...args.filter(isValidNumber));
}

export function safeMax(...args) {
    return Math.max(...args.filter(isValidNumber));
}

export const isTime = (props, propName, componentName) => {
    const { [propName]: time } = props;

    if (time) {
        if (!hourOptionalSecondsRegExp.test(time)) {
            return new Error(`Invalid prop \`${propName}\` of type \`${typeof minDate}\` supplied to \`${componentName}\`, expected time in HH:mm(:ss) format.`);
        }
    }

    // Everything is fine
    return null;
};

export const isValueType = PropTypes.oneOf(allValueTypes);

export function convert12to24(hour12, amPm) {
    let hour24 = parseInt(hour12, 10);

    if (amPm === 'am' && hour24 === 12) {
        hour24 = 0;
    } else if (amPm === 'pm' && hour24 < 12) {
        hour24 += 12;
    }

    return hour24;
}

export function convert24to12(hour24) {
    const hour12 = hour24 % 12 || 12;

    return [hour12, hour24 < 12 ? 'am' : 'pm'];
}

export function getFormatter(options) {
    return (locale, date) => date.toLocaleString(locale || getUserLocale(), options);
}

export function SecondInput({
    hour,
    maxTime,
    minTime,
    minute,
    showLeadingZeros = true,
    ...otherProps
}) {
    function isSameMinute(date) {
        return date && hour === getHours(date) && minute === getMinutes(date);
    }

    const maxSecond = safeMin(59, isSameMinute(maxTime) && getSeconds(maxTime));
    const minSecond = safeMax(0, isSameMinute(minTime) && getSeconds(minTime));

    return (
        <Input
            max={maxSecond}
            min={minSecond}
            name="second"
            showLeadingZeros={showLeadingZeros}
            {...otherProps}
        />
    );
}

SecondInput.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    hour: PropTypes.number,
    itemRef: PropTypes.func,
    maxTime: isTime,
    minTime: isTime,
    minute: PropTypes.number,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.number,
};

export function NativeInput({
    ariaLabel,
    disabled,
    maxTime,
    minTime,
    name,
    onChange,
    required,
    value,
    valueType,
}) {
    const nativeValueParser = (() => {
        switch (valueType) {
            case 'hour':
                return receivedValue => `${getHours(receivedValue)}:00`;
            case 'minute':
                return getHoursMinutes;
            case 'second':
                return getHoursMinutesSeconds;
            default:
                throw new Error('Invalid valueType.');
        }
    })();

    const step = (() => {
        switch (valueType) {
            case 'hour':
                return 3600;
            case 'minute':
                return 60;
            case 'second':
                return 1;
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
            max={maxTime ? nativeValueParser(maxTime) : null}
            min={minTime ? nativeValueParser(minTime) : null}
            name={name}
            onChange={onChange}
            onFocus={stopPropagation}
            required={required}
            step={step}
            style={{
                visibility: 'hidden',
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
            }}
            type="time"
            value={value ? nativeValueParser(value) : ''}
        />
    );
}

NativeInput.propTypes = {
    ariaLabel: PropTypes.string,
    disabled: PropTypes.bool,
    maxTime: isTime,
    minTime: isTime,
    name: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
    valueType: isValueType,
};

export function MinuteInput({
    hour,
    maxTime,
    minTime,
    showLeadingZeros = true,
    ...otherProps
}) {
    function isSameHour(date) {
        return date && hour === getHours(date);
    }

    const maxMinute = safeMin(59, isSameHour(maxTime) && getMinutes(maxTime));
    const minMinute = safeMax(0, isSameHour(minTime) && getMinutes(minTime));

    return (
        <Input
            max={maxMinute}
            min={minMinute}
            name="minute"
            showLeadingZeros={showLeadingZeros}
            {...otherProps}
        />
    );
}

MinuteInput.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    hour: PropTypes.number,
    itemRef: PropTypes.func,
    maxTime: isTime,
    minTime: isTime,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.number,
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
    placeholder = '--',
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
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    itemRef: PropTypes.func,
    max: PropTypes.number,
    min: PropTypes.number,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    step: PropTypes.number,
    value: PropTypes.number,
};


export function Hour24Input({
    hour,
    maxTime,
    minTime,
    ...otherProps
}) {
    const maxHour = safeMin(23, maxTime && getHours(maxTime));
    const minHour = safeMax(0, minTime && getHours(minTime));

    return (
        <Input
            max={maxHour}
            min={minHour}
            name="hour24"
            nameForClass="hour"
            {...otherProps}
        />
    );
}

Hour24Input.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    hour: PropTypes.number,
    itemRef: PropTypes.func,
    maxTime: isTime,
    minTime: isTime,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.number,
};

export function Hour12Input({
    amPm,
    hour,
    maxTime,
    minTime,
    value,
    ...otherProps
}) {
    const maxHour = safeMin(12, maxTime && (() => {
        const [maxHourResult, maxAmPm] = convert24to12(getHours(maxTime));

        if (maxAmPm !== amPm) {
            // pm is always after am, so we should ignore validation
            return null;
        }

        return maxHourResult;
    })());

    const minHour = safeMax(1, minTime && (() => {
        const [minHourResult, minAmPm] = convert24to12(getHours(minTime));

        if (
            // pm is always after am, so we should ignore validation
            minAmPm !== amPm
            // If minHour is 12 am/pm, user should be able to enter 12, 1, ..., 11.
            || minHourResult === 12
        ) {
            return null;
        }

        return minHourResult;
    })());

    const value12 = value !== null ? convert24to12(value)[0] : null;

    return (
        <Input
            max={maxHour}
            min={minHour}
            name="hour12"
            nameForClass="hour"
            value={value12}
            {...otherProps}
        />
    );
}

Hour12Input.propTypes = {
    amPm: PropTypes.string,
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    hour: PropTypes.number,
    itemRef: PropTypes.func,
    maxTime: isTime,
    minTime: isTime,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    showLeadingZeros: PropTypes.bool,
    value: PropTypes.number,
};


export function AmPm({
    ariaLabel,
    className,
    disabled,
    itemRef,
    locale,
    maxTime,
    minTime,
    onChange,
    required,
    value,
}) {
    const amDisabled = minTime && convert24to12(getHours(minTime))[1] === 'pm';
    const pmDisabled = maxTime && convert24to12(getHours(maxTime))[1] === 'am';

    const name = 'amPm';
    const [amLabel, pmLabel] = getAmPmLabels(locale);

    return (
        <select
            aria-label={ariaLabel}
            className={mergeClassNames(
                `${className}__input`,
                `${className}__${name}`,
            )}
            disabled={disabled}
            name={name}
            onChange={onChange}
            ref={(ref) => {
                if (itemRef) {
                    itemRef(ref, name);
                }
            }}
            required={required}
            value={value !== null ? value : ''}
        >
            {!value && (
                <option value="">
                    --
        </option>
            )}
            <option disabled={amDisabled} value="am">
                {amLabel}
            </option>
            <option disabled={pmDisabled} value="pm">
                {pmLabel}
            </option>
        </select>
    );
}

AmPm.propTypes = {
    ariaLabel: PropTypes.string,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    itemRef: PropTypes.func,
    locale: PropTypes.string,
    maxTime: isTime,
    minTime: isTime,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    value: PropTypes.oneOf(['am', 'pm']),
};

export class TimeInput extends PureComponent {
    static getDerivedStateFromProps(nextProps, prevState) {
        const nextState = {};

        /**
         * If isClockOpen flag has changed, we have to update it.
         * It's saved in state purely for use in getDerivedStateFromProps.
         */
        if (nextProps.isClockOpen !== prevState.isClockOpen) {
            nextState.isClockOpen = nextProps.isClockOpen;
        }

        /**
         * If the next value is different from the current one  (with an exception of situation in
         * which values provided are limited by minDate and maxDate so that the dates are the same),
         * get a new one.
         */
        const nextValue = nextProps.value;
        if (
            // Toggling calendar visibility resets values
            nextState.isClockOpen // Flag was toggled
            || hoursAreDifferent(nextValue, prevState.value)
        ) {
            if (nextValue) {
                [, nextState.amPm] = convert24to12(getHours(nextValue));
                nextState.hour = getHours(nextValue);
                nextState.minute = getMinutes(nextValue);
                nextState.second = getSeconds(nextValue);
            } else {
                nextState.amPm = null;
                nextState.hour = null;
                nextState.minute = null;
                nextState.second = null;
            }
            nextState.value = nextValue;
        }

        return nextState;
    }

    state = {
        amPm: null,
        hour: null,
        minute: null,
        second: null,
    };

    get formatTime() {
        const { maxDetail } = this.props;

        const options = { hour: 'numeric' };
        const level = allViews.indexOf(maxDetail);
        if (level >= 1) {
            options.minute = 'numeric';
        }
        if (level >= 2) {
            options.second = 'numeric';
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
        const processFunction = (() => {
            switch (this.valueType) {
                case 'hour':
                case 'minute': return getHoursMinutes;
                case 'second': return getHoursMinutesSeconds;
                default: throw new Error('Invalid valueType.');
            }
        })();

        return processFunction(value);
    }

    /**
     * Returns value type that can be returned with currently applied settings.
     */
    get valueType() {
        const { maxDetail } = this.props;

        return maxDetail;
    }

    get divider() {
        return this.placeholder.match(/[^0-9a-z]/i)[0];
    }

    get placeholder() {
        const { format, locale } = this.props;

        if (format) {
            return format;
        }

        const hour24 = 21;
        const hour12 = 9;
        const minute = 13;
        const second = 14;
        const date = new Date(2017, 0, 1, hour24, minute, second);

        return (
            this.formatTime(locale, date)
                .replace(this.formatNumber(locale, hour12), 'h')
                .replace(this.formatNumber(locale, hour24), 'H')
                .replace(this.formatNumber(locale, minute), 'mm')
                .replace(this.formatNumber(locale, second), 'ss')
                .replace(new RegExp(getAmPmLabels(locale).join('|')), 'a')
        );
    }

    get commonInputProps() {
        const {
            className,
            disabled,
            isClockOpen,
            maxTime,
            minTime,
            required,
        } = this.props;

        return {
            className,
            disabled,
            itemRef: (ref, name) => {
                // Save a reference to each input field
                this[`${name}Input`] = ref;
            },
            maxTime,
            minTime,
            onChange: this.onChange,
            onKeyDown: this.onKeyDown,
            onKeyUp: this.onKeyUp,
            placeholder: '--',
            // This is only for showing validity when editing
            required: required || isClockOpen,
        };
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

        switch (name) {
            case 'hour12': {
                this.setState(
                    prevState => ({
                        hour: value ? convert12to24(parseInt(value, 10), prevState.amPm) : null,
                    }),
                    this.onChangeExternal,
                );
                break;
            }
            case 'hour24': {
                this.setState(
                    { hour: value ? parseInt(value, 10) : null },
                    this.onChangeExternal,
                );
                break;
            }
            default: {
                this.setState(
                    { [name]: value ? parseInt(value, 10) : null },
                    this.onChangeExternal,
                );
            }
        }
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

            return value;
        })();

        onChange(processedValue, false);
    }

    onChangeAmPm = (event) => {
        const { value } = event.target;

        this.setState(
            ({ amPm: value }),
            this.onChangeExternal,
        );
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

        const formElements = [
            this.hour12Input,
            this.hour24Input,
            this.minuteInput,
            this.secondInput,
            this.amPmInput,
        ].filter(Boolean);

        const formElementsWithoutSelect = formElements.slice(0, -1);

        const values = {};
        formElements.forEach((formElement) => {
            values[formElement.name] = formElement.value;
        });

        if (formElementsWithoutSelect.every(formElement => !formElement.value)) {
            onChange(null, false);
        } else if (
            formElements.every(formElement => formElement.value && formElement.validity.valid)
        ) {
            const hour = parseInt(values.hour24 || convert12to24(values.hour12, values.amPm) || 0, 10);
            const minute = parseInt(values.minute || 0, 10);
            const second = parseInt(values.second || 0, 10);

            const padStart = num => `0${num}`.slice(-2);
            const proposedValue = `${padStart(hour)}:${padStart(minute)}:${padStart(second)}`;
            const processedValue = this.getProcessedValue(proposedValue);
            onChange(processedValue, false);
        }
    }

    renderHour = (currentMatch, index) => {
        if (/h/.test(currentMatch)) {
            return this.renderHour12(currentMatch, index);
        }

        return this.renderHour24(currentMatch, index);
    };

    renderHour12 = (currentMatch, index) => {
        const { autoFocus, hourAriaLabel, hourPlaceholder } = this.props;
        const { amPm, hour } = this.state;

        if (currentMatch && currentMatch.length > 2) {
            throw new Error(`Unsupported token: ${currentMatch}`);
        }

        const showLeadingZeros = currentMatch && currentMatch.length === 2;

        return (
            <Hour12Input
                key="hour12"
                {...this.commonInputProps}
                amPm={amPm}
                ariaLabel={hourAriaLabel}
                autoFocus={index === 0 && autoFocus}
                placeholder={hourPlaceholder}
                showLeadingZeros={showLeadingZeros}
                value={hour}
            />
        );
    }

    renderHour24 = (currentMatch, index) => {
        const { autoFocus, hourAriaLabel, hourPlaceholder } = this.props;
        const { hour } = this.state;

        if (currentMatch && currentMatch.length > 2) {
            throw new Error(`Unsupported token: ${currentMatch}`);
        }

        const showLeadingZeros = currentMatch && currentMatch.length === 2;

        return (
            <Hour24Input
                key="hour24"
                {...this.commonInputProps}
                ariaLabel={hourAriaLabel}
                autoFocus={index === 0 && autoFocus}
                placeholder={hourPlaceholder}
                showLeadingZeros={showLeadingZeros}
                value={hour}
            />
        );
    }

    renderMinute = (currentMatch, index) => {
        const { autoFocus, minuteAriaLabel, minutePlaceholder } = this.props;
        const { hour, minute } = this.state;

        if (currentMatch && currentMatch.length > 2) {
            throw new Error(`Unsupported token: ${currentMatch}`);
        }

        const showLeadingZeros = currentMatch && currentMatch.length === 2;

        return (
            <MinuteInput
                key="minute"
                {...this.commonInputProps}
                ariaLabel={minuteAriaLabel}
                autoFocus={index === 0 && autoFocus}
                hour={hour}
                placeholder={minutePlaceholder}
                showLeadingZeros={showLeadingZeros}
                value={minute}
            />
        );
    }

    renderSecond = (currentMatch, index) => {
        const { autoFocus, secondAriaLabel, secondPlaceholder } = this.props;
        const { hour, minute, second } = this.state;

        if (currentMatch && currentMatch.length > 2) {
            throw new Error(`Unsupported token: ${currentMatch}`);
        }

        const showLeadingZeros = currentMatch ? currentMatch.length === 2 : true;

        return (
            <SecondInput
                key="second"
                {...this.commonInputProps}
                ariaLabel={secondAriaLabel}
                autoFocus={index === 0 && autoFocus}
                hour={hour}
                minute={minute}
                placeholder={secondPlaceholder}
                showLeadingZeros={showLeadingZeros}
                value={second}
            />
        );
    }

    renderAmPm = (currentMatch, index) => {
        const { amPmAriaLabel, autoFocus, locale } = this.props;
        const { amPm } = this.state;

        return (
            <AmPm
                key="ampm"
                {...this.commonInputProps}
                ariaLabel={amPmAriaLabel}
                autoFocus={index === 0 && autoFocus}
                locale={locale}
                onChange={this.onChangeAmPm}
                value={amPm}
            />
        );
    }

    renderCustomInputs() {
        const { placeholder } = this;
        const { format } = this.props;

        const elementFunctions = {
            h: this.renderHour,
            H: this.renderHour,
            m: this.renderMinute,
            s: this.renderSecond,
            a: this.renderAmPm,
        };

        const allowMultipleInstances = typeof format !== 'undefined';
        return renderCustomInputs(placeholder, elementFunctions, allowMultipleInstances);
    }

    renderNativeInput() {
        const {
            disabled,
            maxTime,
            minTime,
            name,
            nativeInputAriaLabel,
            required,
            value,
        } = this.props;

        return (
            <NativeInput
                key="time"
                ariaLabel={nativeInputAriaLabel}
                disabled={disabled}
                maxTime={maxTime}
                minTime={minTime}
                name={name}
                onChange={this.onChangeNative}
                required={required}
                value={value}
                valueType={this.valueType}
            />
        );
    }

    render() {
        const { className } = this.props;

        /* eslint-disable jsx-a11y/click-events-have-key-events */
        /* eslint-disable jsx-a11y/no-static-element-interactions */
        return (
            <div
                className={className}
                onClick={this.onClick}
            >
                {this.renderNativeInput()}
                {this.renderCustomInputs()}
            </div>
        );
    }
}

TimeInput.defaultProps = {
    maxDetail: 'minute',
    name: 'time',
};

TimeInput.propTypes = {
    amPmAriaLabel: PropTypes.string,
    autoFocus: PropTypes.bool,
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    format: PropTypes.string,
    hourAriaLabel: PropTypes.string,
    hourPlaceholder: PropTypes.string,
    isClockOpen: PropTypes.bool,
    locale: PropTypes.string,
    maxDetail: PropTypes.oneOf(allViews),
    maxTime: isTime,
    minTime: isTime,
    minuteAriaLabel: PropTypes.string,
    minutePlaceholder: PropTypes.string,
    name: PropTypes.string,
    nativeInputAriaLabel: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    secondAriaLabel: PropTypes.string,
    secondPlaceholder: PropTypes.string,
    value: PropTypes.oneOfType([
        isTime,
        PropTypes.instanceOf(Date),
    ]),
};

export default class AnterosTimePicker extends PureComponent {
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpenProps) {
            return {
                isOpen: nextProps.isOpen,
                isOpenProps: nextProps.isOpen,
            };
        }

        return null;
    }

    constructor(props){
        super(props);
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            this.state = { value: value };
        } else {
            this.state = { value: this.props.value };
        }
        autoBind(this);
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
        const { onClockClose, onClockOpen } = this.props;

        if (isOpen !== prevState.isOpen) {
            this.handleOutsideActionListeners();
            callIfDefined(isOpen ? onClockOpen : onClockClose);
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
        this.setState({ value: value });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            this.setState({ value: value });
        } else {
            this.setState({ value: nextProps.value });
        }
    }

    get eventProps() {
        return makeEventProps(this.props);
    }

    onOutsideAction = (event) => {
        if (this.wrapper && !this.wrapper.contains(event.target)) {
            this.closeClock();
        }
    }

    // eslint-disable-next-line react/destructuring-assignment
    onChange = (value, closeClock = this.props.closeClock) => {
        const { onChange } = this.props;

        if (closeClock) {
            this.closeClock();
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

    onFocus = (event) => {
        const { disabled, onFocus } = this.props;

        if (onFocus) {
            onFocus(event);
        }

        // Internet Explorer still fires onFocus on disabled elements
        if (disabled) {
            return;
        }

        this.openClock();
    }

    openClock = () => {
        this.setState({ isOpen: true });
    }

    closeClock = () => {
        this.setState((prevState) => {
            if (!prevState.isOpen) {
                return null;
            }

            return { isOpen: false };
        });
    }

    toggleClock = () => {
        this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }

    stopPropagation = event => event.stopPropagation();

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
            amPmAriaLabel,
            autoFocus,
            clearAriaLabel,
            clearIcon,
            clockAriaLabel,
            clockIcon,
            disableClock,
            disabled,
            format,
            hourAriaLabel,
            hourPlaceholder,
            isOpen,
            locale,
            maxDetail,
            maxTime,
            minTime,
            minuteAriaLabel,
            minutePlaceholder,
            name,
            nativeInputAriaLabel,
            required,
            secondAriaLabel,
            secondPlaceholder,
            value,
        } = this.props;

        const [valueFrom] = [].concat(this.state.value);

        const ariaLabelProps = {
            amPmAriaLabel,
            hourAriaLabel,
            minuteAriaLabel,
            nativeInputAriaLabel,
            secondAriaLabel,
        };

        const placeholderProps = {
            hourPlaceholder,
            minutePlaceholder,
            secondPlaceholder,
        };

        return (
            <div className={`${baseClassName}__wrapper`}>
                <TimeInput
                    {...ariaLabelProps}
                    {...placeholderProps}
                    autoFocus={autoFocus}
                    className={`${baseClassName}__inputGroup`}
                    disabled={disabled}
                    format={format}
                    isClockOpen={isOpen}
                    locale={locale}
                    maxDetail={maxDetail}
                    maxTime={maxTime}
                    minTime={minTime}
                    name={name}
                    onChange={this.onChange}
                    placeholder={this.placeholder}
                    required={required}
                    value={valueFrom}
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
                {clockIcon !== null && !disableClock && (
                    <button
                        aria-label={clockAriaLabel}
                        className={`${baseClassName}__clock-button ${baseClassName}__button`}
                        disabled={disabled}
                        onBlur={this.resetValue}
                        onClick={this.toggleClock}
                        onFocus={this.stopPropagation}
                        type="button"
                    >
                        {clockIcon}
                    </button>
                )}
            </div>
        );
    }

    renderClock() {
        const { disableClock } = this.props;
        const { isOpen } = this.state;

        if (isOpen === null || disableClock) {
            return null;
        }

        const {
            clockClassName,
            className: timePickerClassName, // Unused, here to exclude it from clockProps
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
                <div className={mergeClassNames(className, `${className}--${isOpen ? 'open' : 'closed'}`)}>
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
        const { isOpen } = this.state;

        return (
            <div onBlur={this.onBlur}
                className={mergeClassNames(
                    baseClassName,
                    `${baseClassName}--${isOpen ? 'open' : 'closed'}`,
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

const ClockIcon = (
    <svg
        {...iconProps}
        className={`${baseClassName}__clock-button__icon ${baseClassName}__button__icon`}
        fill="none"
    >
        <circle cx="9.5" cy="9.5" r="7.5" />
        <path d="M9.5 4.5 v5 h4" />
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

AnterosTimePicker.defaultProps = {
    clearIcon: ClearIcon,
    clockIcon: ClockIcon,
    closeClock: true,
    isOpen: null,
    maxDetail: 'minute',
};

const isValue = PropTypes.oneOfType([
    isTime,
    PropTypes.instanceOf(Date),
]);

AnterosTimePicker.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    amPmAriaLabel: PropTypes.string,
    autoFocus: PropTypes.bool,
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    clearAriaLabel: PropTypes.string,
    clearIcon: PropTypes.node,
    clockAriaLabel: PropTypes.string,
    clockClassName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    clockIcon: PropTypes.node,
    closeClock: PropTypes.bool,
    disableClock: PropTypes.bool,
    disabled: PropTypes.bool,
    format: PropTypes.string,
    hourAriaLabel: PropTypes.string,
    hourPlaceholder: PropTypes.string,
    isOpen: PropTypes.bool,
    locale: PropTypes.string,
    maxDetail: PropTypes.oneOf(allViews),
    maxTime: isTime,
    minTime: isTime,
    minuteAriaLabel: PropTypes.string,
    minutePlaceholder: PropTypes.string,
    name: PropTypes.string,
    nativeInputAriaLabel: PropTypes.string,
    onChange: PropTypes.func,
    onClockClose: PropTypes.func,
    onClockOpen: PropTypes.func,
    onFocus: PropTypes.func,
    required: PropTypes.bool,
    secondAriaLabel: PropTypes.string,
    secondPlaceholder: PropTypes.string,
    value: PropTypes.oneOfType([
        isValue,
        PropTypes.arrayOf(isValue),
    ]),
};