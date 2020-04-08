import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosUtils, AnterosStringMask, AnterosDateUtils, Anteros } from 'anteros-react-core';


/* MASK

https://github.com/the-darc/string-mask

Character	Description
0	Any numbers
9	Any numbers (Optional)
#	Any numbers (recursive)
A	Any alphanumeric character
a	Any alphanumeric character (Optional) Not implemented yet
S	Any letter
U	Any letter (All lower case character will be mapped to uppercase)
L	Any letter (All upper case character will be mapped to lowercase)
$	Escape character, used to escape any of the special formatting characters.

*/

export default class AnterosText extends Component {

    constructor(props) {
        super(props);
    }
    render() {
        let { textAlign, className, style, text, color, fontWeight, fontFamily,
            fontSize, h1, h2, h3, h4, h5, h6, display, backgroundColor,
            muted, center, right, white, truncate, mask, maskPattern, currencyPrefix } = this.props;

        let Tag = 'span';

        if (h1) {
            Tag = 'h1';
        } else if (h2) {
            Tag = 'h2';
        } else if (h3) {
            Tag = 'h3';
        } else if (h4) {
            Tag = 'h4';
        } else if (h5) {
            Tag = 'h5';
        } else if (h6) {
            Tag = 'h6';
        }

        let _className = AnterosUtils.buildClassNames(
            className ? className : '',
            display ? 'display-' + display : '',
            muted ? 'text-muted' : '',
            center ? 'text-center' : '',
            right ? 'text-right' : '',
            white ? 'text-white' : '',
            truncate ? 'text-truncate' : '');

        let newText = text;
        if (maskPattern == 'cnpj') {
            mask = '99.999.999/9999-99';
        } else if (maskPattern == 'cpf') {
            mask = '999.999.999-99';
        } else if (maskPattern == 'cep') {
            mask = '99999-999';
        } else if (maskPattern == 'fone') {
            mask = "(99) 99999-9999";
        } else if (maskPattern == 'currency') {
            newText = AnterosUtils.formatNumber(text, "###.###.##0,00");
            if (currencyPrefix) {
                newText = currencyPrefix + newText
            }
        } else if (maskPattern === "datetime") {
            let dt = AnterosDateUtils.parseDateWithFormat(text, Anteros.dataSourceDatetimeFormat);
            if (dt instanceof Date) {
                newText = AnterosDateUtils.formatDate(dt, Anteros.displayDatetimeFormat);
            }
        } else if (maskPattern === "date") {
            let dt = AnterosDateUtils.parseDateWithFormat(text, Anteros.dataSourceDatetimeFormat);
            if (dt instanceof Date) {
                newText = AnterosDateUtils.formatDate(AnterosDateUtils.parseDateWithFormat(text, Anteros.dataSourceDatetimeFormat), Anteros.displayDateFormat);
            }
        } else if (maskPattern === "time") {
            let dt = AnterosDateUtils.parseDateWithFormat(text, Anteros.dataSourceDatetimeFormat);
            if (dt instanceof Date) {
                newText = AnterosDateUtils.formatDate(AnterosDateUtils.parseDateWithFormat(text, Anteros.dataSourceDatetimeFormat), Anteros.displayTimeFormat);
            }
        } else if (mask) {
            var _mask = new AnterosStringMask(mask);
            newText = _mask.apply(newText);
        }
        return (<Tag style={{ backgroundColor, color, fontFamily, fontWeight, fontSize, textAlign, ...style }} className={_className}>{newText}</Tag>);
    }
}

AnterosText.propTypes = {
    text: PropTypes.string.isRequired,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    color: PropTypes.string,
    fontFamily: PropTypes.string,
    fontSize: PropTypes.string,
    fontWeight: PropTypes.string,
    h1: PropTypes.bool.isRequired,
    h2: PropTypes.bool.isRequired,
    h3: PropTypes.bool.isRequired,
    h4: PropTypes.bool.isRequired,
    h5: PropTypes.bool.isRequired,
    h6: PropTypes.bool.isRequired,
    muted: PropTypes.bool.isRequired,
    center: PropTypes.bool.isRequired,
    right: PropTypes.bool.isRequired,
    truncate: PropTypes.bool.isRequired,
    display: PropTypes.oneOf([1, 2, 3, 4]),
    mask: PropTypes.string,
    maskPatten: PropTypes.oneOf(['cnpj', 'cpf', 'cep', 'fone', 'currency', 'date', 'datetime', 'time']),
    currencyPrefix: PropTypes.string
}

AnterosText.defaultProps = {
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    h5: false,
    h6: false,
    muted: false,
    center: false,
    right: false,
    truncate: false,
    currencyPrefix: undefined
}


