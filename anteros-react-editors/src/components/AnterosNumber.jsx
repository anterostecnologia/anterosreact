import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import lodash from "lodash";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import { AnterosUtils } from "anteros-react-core";


Number.parseFloat = parseFloat;

class AnterosNumber extends Component {
    constructor(props) {
        super(props);
        this.prepareProps = this.prepareProps.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.state = this.prepareProps(this.props);
        this.inputSelectionStart = 0;
        this.inputSelectionEnd = 0;
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.idNumber = lodash.uniqueId("number");
    }

    get componentName(){
        return "AnterosNumber";
    }

    getMaskedValue() {
        return this.state.maskedValue;
    }

    prepareProps(props) {
        let customProps = { ...props };
        delete customProps.onChangeValue;
        delete customProps.value;
        delete customProps.decimalSeparator;
        delete customProps.thousandSeparator;
        delete customProps.precision;
        delete customProps.inputType;
        delete customProps.allowNegative;
        delete customProps.allowEmpty;
        delete customProps.prefix;
        delete customProps.suffix;

        let initialValue = props.value;

        if (props.dataSource) {
            initialValue = props.dataSource.fieldByName(props.dataField);
            if (!initialValue) {
                initialValue = '';
            }
        }

        if (initialValue === null) {
            initialValue = props.allowEmpty ? null : '';
        } else {

            if (typeof initialValue == 'string') {
                if (props.thousandSeparator === ".") {
                    initialValue = initialValue.replace(/\./g, '');
                }
                if (props.decimalSeparator != ".") {
                    initialValue = initialValue.replace(new RegExp(props.decimalSeparator, 'g'), '.');
                }
                initialValue = initialValue.replace(/[^0-9-.]/g, '');
                initialValue = Number.parseFloat(initialValue);
            }
            initialValue = Number(initialValue).toLocaleString(undefined, {
                style: 'decimal',
                minimumFractionDigits: props.precision,
                maximumFractionDigits: props.precision
            })

        }

        const { maskedValue, value } = formatNumber(
            initialValue,
            props.precision,
            props.decimalSeparator,
            props.thousandSeparator,
            props.allowNegative,
            props.prefix,
            props.suffix
        );

        return { maskedValue, value, customProps };
    }


    componentWillReceiveProps(nextProps) {
        this.setState(this.prepareProps(nextProps));
    }


    componentDidMount() {
        if (this.props.dataSource) {
            this
                .props
                .dataSource
                .addEventListener([
                    dataSourceEvents.AFTER_CLOSE, dataSourceEvents.AFTER_OPEN, dataSourceEvents.AFTER_GOTO_PAGE, dataSourceEvents.AFTER_CANCEL, dataSourceEvents.AFTER_SCROLL
                ], this.onDatasourceEvent);
            this
                .props
                .dataSource
                .addEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }


        let node = ReactDOM.findDOMNode(this.theInput);
        let selectionEnd = Math.min(node.selectionEnd, this.theInput.value.length - this.props.suffix.length);
        let selectionStart = Math.min(node.selectionStart, selectionEnd);
        node.setSelectionRange(selectionStart, selectionEnd);
    }

    componentWillUpdate() {
        let node = ReactDOM.findDOMNode(this.theInput);
        this.inputSelectionStart = node.selectionStart;
        this.inputSelectionEnd = node.selectionEnd;
    }

    componentDidUpdate(prevProps, prevState) {
        let node = ReactDOM.findDOMNode(this.theInput);
        let isNegative = (this.theInput.value.match(/-/g) || []).length % 2 === 1;
        let minPos = this.props.prefix.length + (isNegative ? 1 : 0);
        let selectionEnd = Math.max(minPos, Math.min(this.inputSelectionEnd, this.theInput.value.length - this.props.suffix.length));
        let selectionStart = Math.max(minPos, Math.min(this.inputSelectionEnd, selectionEnd));

        let regexEscapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
        let separatorsRegex = new RegExp(this.props.decimalSeparator.replace(regexEscapeRegex, '\\$&') + '|' + this.props.thousandSeparator.replace(regexEscapeRegex, '\\$&'), 'g');
        let currSeparatorCount = (this.state.maskedValue.match(separatorsRegex) || []).length;
        let prevSeparatorCount = (prevState.maskedValue.match(separatorsRegex) || []).length;
        let adjustment = Math.max(currSeparatorCount - prevSeparatorCount, 0);

        selectionEnd = selectionEnd + adjustment;
        selectionStart = selectionStart + adjustment;

        let baselength = this.props.suffix.length
            + this.props.prefix.length
            + this.props.decimalSeparator.length
            + Number(this.props.precision)
            + 1;

        if (this.state.maskedValue.length == baselength) {
            selectionEnd = this.theInput.value.length - this.props.suffix.length;
            selectionStart = selectionEnd;
        }

        node.setSelectionRange(selectionStart, selectionEnd);
        this.inputSelectionStart = selectionStart;
        this.inputSelectionEnd = selectionEnd;
    }

    componentWillUnmount(){
        if ((this.props.dataSource)) {
            this
                .props
                .dataSource
                .removeEventListener([
                    dataSourceEvents.AFTER_CLOSE, dataSourceEvents.AFTER_OPEN, dataSourceEvents.AFTER_GOTO_PAGE, dataSourceEvents.AFTER_CANCEL, dataSourceEvents.AFTER_SCROLL
                ], this.onDatasourceEvent);
            this
                .props
                .dataSource
                .removeEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    handleChange(event) {
        event.preventDefault();
        let { maskedValue, value } = formatNumber(
            event.target.value,
            this.props.precision,
            this.props.decimalSeparator,
            this.props.thousandSeparator,
            this.props.allowNegative,
            this.props.prefix,
            this.props.suffix
        );

        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, value);
        }

        event.persist();
        this.setState({ maskedValue, value }, () => {
            this.props.onChangeValue(event, maskedValue, value);
        });
    }


    onDatasourceEvent(event, error) {
        let value = this.props.dataSource.fieldByName(this.props.dataField);
        if (!value) {
            value = '';
        }
        const { newMaskedValue, newValue } = formatNumber(
            value,
            this.props.precision,
            this.props.decimalSeparator,
            this.props.thousandSeparator,
            this.props.allowNegative,
            this.props.prefix,
            this.props.suffix
        );

        this.setState({ ...this.state, newMaskedValue, newValue });
    }

    handleFocus(event) {
        let selectionEnd = this.theInput.value.length - this.props.suffix.length;
        let isNegative = (this.theInput.value.match(/-/g) || []).length % 2 === 1;
        let selectionStart = this.props.prefix.length + (isNegative ? 1 : 0);
        event.target.setSelectionRange(selectionStart, selectionEnd);
        this.inputSelectionStart = selectionStart;
        this.inputSelectionEnd = selectionEnd;
    }

    handleBlur(event) {
        this.inputSelectionStart = 0;
        this.inputSelectionEnd = 0;
    }

    onKeyPress(event) {
        if (this.props.onKeyPress) {
            this.props.onKeyPress(event);
        }
    }

    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);
        const className = AnterosUtils.buildClassNames(
            (this.props.className ? this.props.className : ""), (colClasses.length > 0 ? "form-control" : ""));

        if (this.props.id) {
            this.idNumber = this.props.id;
        }

        const number = (<input disabled={(this.props.disabled ? true : false)}
            style={{ ...this.props.style, textAlign: "right" }}
            className={className}
            id={this.idNumber}
            ref={(input) => { this.theInput = input; }}
            type={this.props.inputType}
            value={this.state.maskedValue}
            readOnly={readOnly}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onMouseUp={this.handleFocus}
            onKeyPress={this.onKeyPress}
            onKeyUp={this.onKeyPress}
        />);

        if (colClasses.length > 0) {
            return (<div style={{...this.props.divStyle}} className={AnterosUtils.buildClassNames(colClasses)}>
                {number}
            </div>);
        } else {
            return number;
        }
    }
}

AnterosNumber.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    style: PropTypes.object,
    readOnly: PropTypes.bool.isRequired,
    onChangeValue: PropTypes.func,
    onKeyPress: PropTypes.func,
    onFocus: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    decimalSeparator: PropTypes.string,
    thousandSeparator: PropTypes.string,
    precision: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inputType: PropTypes.string,
    allowNegative: PropTypes.bool,
    allowEmpty: PropTypes.bool,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    integer: PropTypes.bool
};


AnterosNumber.defaultProps = {
    onChangeValue: function (maskValue, value, event) { },
    value: '0',
    decimalSeparator: ',',
    thousandSeparator: '.',
    precision: '2',
    inputType: 'text',
    allowNegative: false,
    prefix: '',
    suffix: '',
    readOnly: false,
    integer : false
};




function formatNumber(value, precision = 2, decimalSeparator = '.', thousandSeparator = ',', allowNegative = false, prefix = '', suffix = '') {
    if (precision < 0) { precision = 0; }
    if (precision > 20) { precision = 20; }
    if (value === null || value === undefined) {
        return {
            value: 0,
            maskedValue: ''
        };
    }
    value = String(value);
    if (value.length == 0) {
        return {
            value: 0,
            maskedValue: ''
        };
    }
    let digits = value.match(/\d/g) || ['0'];
    let numberIsNegative = false;
    if (allowNegative) {
        let negativeSignCount = (value.match(/-/g) || []).length;
        numberIsNegative = negativeSignCount % 2 === 1;
        let allDigitsAreZero = true;
        for (let idx = 0; idx < digits.length; idx += 1) {
            if (digits[idx] !== '0') {
                allDigitsAreZero = false;
                break;
            }
        }
        if (allDigitsAreZero) {
            numberIsNegative = false;
        }
    }
    while (digits.length <= precision) { digits.unshift('0'); }
    if (precision > 0) {
        digits.splice(digits.length - precision, 0, ".");
    }
    digits = Number(digits.join('')).toFixed(precision).split('');
    let raw = Number(digits.join(''));
    let decimalpos = digits.length - precision - 1;
    if (precision > 0) {
        digits[decimalpos] = decimalSeparator;
    } else {
        decimalpos = digits.length;
    }
    for (let x = decimalpos - 3; x > 0; x = x - 3) {
        digits.splice(x, 0, thousandSeparator);
    }
    if (prefix.length > 0) { digits.unshift(prefix); }
    if (suffix.length > 0) { digits.push(suffix); }
    if (allowNegative && numberIsNegative) {
        digits.unshift('-');
        raw = -raw;
    }
    return {
        value: raw,
        maskedValue: digits.join('').trim()
    };
}


export default AnterosNumber