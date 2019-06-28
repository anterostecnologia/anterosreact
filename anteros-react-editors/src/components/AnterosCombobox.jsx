import AutosizeInput from 'react-input-autosize';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import lodash from 'lodash';
import {buildGridClassNames, columnProps} from "anteros-react-layout";
import {AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents} from "anteros-react-datasource";
import {AnterosError, AnterosUtils} from "anteros-react-core";

const trim = str => str.replace(/^\s+|\s+$/g, '');

function blockEvent(event) {
	event.preventDefault();
	event.stopPropagation();
	if ((event.target.tagName !== 'A') || !('href' in event.target)) {
		return;
	}
	if (event.target.target) {
		window.open(event.target.href, event.target.target);
	} else {
		window.location.href = event.target.href;
	}
};


const map = [
	{ 'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g },
	{ 'base':'AA','letters':/[\uA732]/g },
	{ 'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g },
	{ 'base':'AO','letters':/[\uA734]/g },
	{ 'base':'AU','letters':/[\uA736]/g },
	{ 'base':'AV','letters':/[\uA738\uA73A]/g },
	{ 'base':'AY','letters':/[\uA73C]/g },
	{ 'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g },
	{ 'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g },
	{ 'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g },
	{ 'base':'DZ','letters':/[\u01F1\u01C4]/g },
	{ 'base':'Dz','letters':/[\u01F2\u01C5]/g },
	{ 'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g },
	{ 'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g },
	{ 'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g },
	{ 'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g },
	{ 'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g },
	{ 'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g },
	{ 'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g },
	{ 'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g },
	{ 'base':'LJ','letters':/[\u01C7]/g },
	{ 'base':'Lj','letters':/[\u01C8]/g },
	{ 'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g },
	{ 'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g },
	{ 'base':'NJ','letters':/[\u01CA]/g },
	{ 'base':'Nj','letters':/[\u01CB]/g },
	{ 'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g },
	{ 'base':'OI','letters':/[\u01A2]/g },
	{ 'base':'OO','letters':/[\uA74E]/g },
	{ 'base':'OU','letters':/[\u0222]/g },
	{ 'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g },
	{ 'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g },
	{ 'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g },
	{ 'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g },
	{ 'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g },
	{ 'base':'TZ','letters':/[\uA728]/g },
	{ 'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g },
	{ 'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g },
	{ 'base':'VY','letters':/[\uA760]/g },
	{ 'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g },
	{ 'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g },
	{ 'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g },
	{ 'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g },
	{ 'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g },
	{ 'base':'aa','letters':/[\uA733]/g },
	{ 'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g },
	{ 'base':'ao','letters':/[\uA735]/g },
	{ 'base':'au','letters':/[\uA737]/g },
	{ 'base':'av','letters':/[\uA739\uA73B]/g },
	{ 'base':'ay','letters':/[\uA73D]/g },
	{ 'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g },
	{ 'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g },
	{ 'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g },
	{ 'base':'dz','letters':/[\u01F3\u01C6]/g },
	{ 'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g },
	{ 'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g },
	{ 'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g },
	{ 'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g },
	{ 'base':'hv','letters':/[\u0195]/g },
	{ 'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g },
	{ 'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g },
	{ 'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g },
	{ 'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g },
	{ 'base':'lj','letters':/[\u01C9]/g },
	{ 'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g },
	{ 'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g },
	{ 'base':'nj','letters':/[\u01CC]/g },
	{ 'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g },
	{ 'base':'oi','letters':/[\u01A3]/g },
	{ 'base':'ou','letters':/[\u0223]/g },
	{ 'base':'oo','letters':/[\uA74F]/g },
	{ 'base':'p', 'letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g },
	{ 'base':'q', 'letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g },
	{ 'base':'r', 'letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g },
	{ 'base':'s', 'letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g },
	{ 'base':'t', 'letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g },
	{ 'base':'tz','letters':/[\uA729]/g },
	{ 'base':'u', 'letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g },
	{ 'base':'v', 'letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g },
	{ 'base':'vy','letters':/[\uA761]/g },
	{ 'base':'w', 'letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g },
	{ 'base':'x', 'letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g },
	{ 'base':'y', 'letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g },
	{ 'base':'z', 'letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g },
];

const stripDiacritics = str => {
	// for (let i = 0; i < map.length; i++) {
	// 	str = str.replace(map[i].letters, map[i].base);
	// }
	return str;
};

const isValid = value => {
	return typeof (value) !== 'undefined' && value !== null && value !== '';
};

const defaultFilterOptions = (options, filterValue, excludeOptions, props) => {
	if (filterValue===undefined){
		filterValue = '';
	}
	if (props.ignoreAccents) {
		filterValue = stripDiacritics(filterValue);
	}

	if (props.ignoreCase) {
		filterValue = filterValue.toLowerCase();
	}

	if (props.trimFilter) {
		filterValue = trim(filterValue);
	}

	if (excludeOptions) excludeOptions = excludeOptions.map(i => i[props.valueKey]);

	if (!options)
		return [];

	return options.filter(option => {
		if (excludeOptions && excludeOptions.indexOf(option[props.valueKey]) > -1) return false;
		if (props.filterOption) return props.filterOption.call(undefined, option, filterValue);
		if (!filterValue) return true;

		const value = option[props.valueKey];
		const label = option[props.labelKey];
		const hasValue = isValid(value);
		const hasLabel = isValid(label);

		if (!hasValue && !hasLabel) {
			return false;
		}

		let valueTest = hasValue ? String(value) : null;
		let labelTest = hasLabel ? String(label) : null;

		if (props.ignoreAccents) {
			if (valueTest && props.matchProp !== 'label') valueTest = stripDiacritics(valueTest);
			if (labelTest && props.matchProp !== 'value') labelTest = stripDiacritics(labelTest);
		}

		if (props.ignoreCase) {
			if (valueTest && props.matchProp !== 'label') valueTest = valueTest.toLowerCase();
			if (labelTest && props.matchProp !== 'value') labelTest = labelTest.toLowerCase();
		}

		return props.matchPos === 'start' ? (
			(valueTest && props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue) ||
			(labelTest && props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue)
		) : (
			(valueTest && props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0) ||
			(labelTest && props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0)
		);
	});
};

const defaultClearRenderer = () => {
	return (
		<span
			className="Select-clear"
			dangerouslySetInnerHTML={{ __html: '&times;' }}
		/>
	);
};

const defaultArrowRenderer = ({ onMouseDown }) => {
	return (
		<span
			className="Select-arrow"
			onMouseDown={onMouseDown}
		/>
	);
};

defaultArrowRenderer.propTypes = {
	onMouseDown: PropTypes.func,
};

function clone(obj) {
	const copy = {};
	for (let attr in obj) {
		if (obj.hasOwnProperty(attr)) {
			copy[attr] = obj[attr];
		};
	}
	return copy;
}


const isGroup = (option) => {
	return option && Array.isArray(option.options);
};

const defaultMenuRenderer = ({
	focusedOption,
	focusOption,
	inputValue,
	instancePrefix,
	onFocus,
	onOptionRef,
	onSelect,
	optionClassName,
	optionComponent,
	optionGroupComponent,
	optionRenderer,
	options,
	removeValue,
	selectValue,
	valueArray,
	valueKey,
}) => {
	let OptionGroup = optionGroupComponent;
	let Option = optionComponent;
	let renderLabel = optionRenderer;

	const renderOptions = (optionsSubset) => {
		return optionsSubset.map((option, i) => {
			if (isGroup(option)) {
				let optionGroupClass = classNames({
					'Select-option-group': true,
				});

				return (
					<OptionGroup
						className={optionGroupClass}
						key={`option-group-${i}`}
						label={renderLabel(option)}
						option={option}
						optionIndex={i}
						>
						{renderOptions(option.options)}
					</OptionGroup>
				);
			} else {
				let isSelected = valueArray && valueArray.indexOf(option) > -1;
				let isFocused = option === focusedOption;
				let optionRef = isFocused ? 'focused' : null;
				let optionClass = classNames(optionClassName, {
					'Select-option': true,
					'is-selected': isSelected,
					'is-focused': isFocused,
					'is-disabled': option.disabled,
				});

				return (
					<Option
						className={optionClass}
						focusOption={focusOption}
						inputValue={inputValue}
						instancePrefix={instancePrefix}
						isDisabled={option.disabled}
						isFocused={isFocused}
						isSelected={isSelected}
						key={`option-${i}-${option[valueKey]}`}
						onFocus={onFocus}
						onSelect={onSelect}
						option={option}
						optionIndex={i}
						ref={ref => { onOptionRef(ref, isFocused); }}
						removeValue={removeValue}
						selectValue={selectValue}
					>
						{renderLabel(option, i)}
					</Option>
				);
			}
		});
	};

	return renderOptions(options);
};

defaultMenuRenderer.propTypes = {
	focusOption: PropTypes.func,
	focusedOption: PropTypes.object,
	inputValue: PropTypes.string,
	instancePrefix: PropTypes.string,
	onFocus: PropTypes.func,
	onOptionRef: PropTypes.func,
	onSelect: PropTypes.func,
	optionClassName: PropTypes.string,
	optionComponent: PropTypes.func,
	optionRenderer: PropTypes.func,
	options: PropTypes.array,
	removeValue: PropTypes.func,
	selectValue: PropTypes.func,
	valueArray: PropTypes.array,
	valueKey: PropTypes.string,
};

const stringifyValue = value =>
	typeof value === 'string'
		? value
		: (value !== null && JSON.stringify(value)) || '';

const stringOrNode = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.node,
]);
const stringOrNumber = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.number
]);

let instanceId = 1;

const shouldShowValue = (state, props) => {
	const { inputValue, isPseudoFocused, isFocused } = state;
	const { onSelectResetsInput } = props;

	if (!inputValue) return true;

	if (!onSelectResetsInput){
		return !(!isFocused && isPseudoFocused || isFocused && !isPseudoFocused);
	}

	return false;
};

const shouldShowPlaceholder = (state, props, isOpen) => {
	const { inputValue, isPseudoFocused, isFocused } = state;
	const { onSelectResetsInput } = props;

	return !inputValue || !onSelectResetsInput && !isOpen && !isPseudoFocused && !isFocused;
};

const handleRequired = (value, multi) => {
	if (!value) return true;
	return (multi ? value.length === 0 : Object.keys(value).length === 0);
};


class Dropdown extends React.Component {
  render () {
    // This component adds no markup
    return this.props.children;
  }
};

Dropdown.propTypes = {
  children: PropTypes.node,
};



class Option extends React.Component {

	constructor(props) {
		super(props);

		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
		this.handleTouchEnd = this.handleTouchEnd.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.onFocus = this.onFocus.bind(this);
	}

	handleMouseDown (event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	}

	handleMouseEnter (event) {
		this.onFocus(event);
	}

	handleMouseMove (event) {
		this.onFocus(event);
	}

	handleTouchEnd(event){
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if(this.dragging) return;

		this.handleMouseDown(event);
	}

	handleTouchMove () {
		// Set a flag that the view is being dragged
		this.dragging = true;
	}

	handleTouchStart () {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	}

	onFocus (event) {
		if (!this.props.isFocused) {
			this.props.onFocus(this.props.option, event);
		}
	}

	render () {
		const { option, instancePrefix, optionIndex } = this.props;
		const className = classNames(this.props.className, option.className);

		return option.disabled ? (
			<div className={className}
				onMouseDown={blockEvent}
				onClick={blockEvent}>
				{this.props.children}
			</div>
		) : (
			<div className={className}
				style={option.style}
				role="option"
				aria-label={option.label}
				onMouseDown={this.handleMouseDown}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}
				onTouchStart={this.handleTouchStart}
				onTouchMove={this.handleTouchMove}
				onTouchEnd={this.handleTouchEnd}
				id={instancePrefix + '-option-' + optionIndex}
				title={option.title}>
				{this.props.children}
			</div>
		);
	}
}

Option.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,             // className (based on mouse position)
	instancePrefix: PropTypes.string.isRequired,  // unique prefix for the ids (used for aria)
	isDisabled: PropTypes.bool,              // the option is disabled
	isFocused: PropTypes.bool,               // the option is focused
	isSelected: PropTypes.bool,              // the option is selected
	onFocus: PropTypes.func,                 // method to handle mouseEnter on option element
	onSelect: PropTypes.func,                // method to handle click on option element
	onUnfocus: PropTypes.func,               // method to handle mouseLeave on option element
	option: PropTypes.object.isRequired,     // object that is base for that option
	optionIndex: PropTypes.number,           // index of the option, used to generate unique ids for aria
};


class OptionGroup extends React.Component {

	constructor(props) {
		super(props);

		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleTouchEnd = this.handleTouchEnd.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
	}

	blockEvent (event) {
		event.preventDefault();
		event.stopPropagation();
		if ((event.target.tagName !== 'A') || !('href' in event.target)) {
			return;
		}
		if (event.target.target) {
			window.open(event.target.href, event.target.target);
		} else {
			window.location.href = event.target.href;
		}
	}

	handleMouseDown (event) {
		event.preventDefault();
		event.stopPropagation();
	}

	handleTouchEnd(event){
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if(this.dragging) return;

		this.handleMouseDown(event);
	}

	handleTouchMove (event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	}

	handleTouchStart (event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	}

	render () {
		var { option } = this.props;
		var className = classNames(this.props.className, option.className);

		return option.disabled ? (
			<div className={className}
				onMouseDown={this.blockEvent}
				onClick={this.blockEvent}>
				{this.props.children}
			</div>
		) : (
			<div className={className}
				style={option.style}
				onMouseDown={this.handleMouseDown}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}
				onTouchStart={this.handleTouchStart}
				onTouchMove={this.handleTouchMove}
				onTouchEnd={this.handleTouchEnd}
				title={option.title}>
				<div className="Select-option-group-label">
					{this.props.label}
				</div>
				{this.props.children}
			</div>
		);
	}
};

OptionGroup.propTypes = {
	children: PropTypes.any,
	className: PropTypes.string,             // className (based on mouse position)
	label: PropTypes.node,                   // the heading to show above the child options
	option: PropTypes.object.isRequired,     // object that is base for that option group
};



class Value extends React.Component {

	constructor(props) {
		super(props);

		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.handleTouchEndRemove = this.handleTouchEndRemove.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
	}

	handleMouseDown (event) {
		if (event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		if (this.props.onClick) {
			event.stopPropagation();
			this.props.onClick(this.props.value, event);
			return;
		}
		if (this.props.value.href) {
			event.stopPropagation();
		}
	}

	onRemove (event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onRemove(this.props.value);
	}

	handleTouchEndRemove (event){
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if(this.dragging) return;

		// Fire the mouse events
		this.onRemove(event);
	}

	handleTouchMove () {
		// Set a flag that the view is being dragged
		this.dragging = true;
	}

	handleTouchStart () {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	}

	renderRemoveIcon () {
		if (this.props.disabled || !this.props.onRemove) return;
		return (
			<span className="Select-value-icon"
				aria-hidden="true"
				onMouseDown={this.onRemove}
				onTouchEnd={this.handleTouchEndRemove}
				onTouchStart={this.handleTouchStart}
				onTouchMove={this.handleTouchMove}>
				&times;
			</span>
		);
	}

	renderLabel () {
		let className = 'Select-value-label';
		return this.props.onClick || this.props.value.href ? (
			<a className={className} href={this.props.value.href} target={this.props.value.target} onMouseDown={this.handleMouseDown} onTouchEnd={this.handleMouseDown}>
				{this.props.children}
			</a>
		) : (
			<span className={className} role="option" aria-selected="true" id={this.props.id}>
				{this.props.children}
			</span>
		);
	}

	render () {
		return (
			<div className={classNames('Select-value', this.props.value.className)}
				style={this.props.value.style}
				title={this.props.value.title}
				>
				{this.renderRemoveIcon()}
				{this.renderLabel()}
			</div>
		);
	}
}

Value.propTypes = {
	children: PropTypes.node,
	disabled: PropTypes.bool,               // disabled prop passed to ReactSelect
	id: PropTypes.string,                   // Unique id for the value - used for aria
	onClick: PropTypes.func,                // method to handle click on value label
	onRemove: PropTypes.func,               // method to handle removal of the value
	value: PropTypes.object.isRequired,     // the option object for this value
};


export default class AnterosCombobox extends React.Component {
	constructor (props) {
		super(props);
		[
			'clearValue',
			'focusOption',
			'getOptionLabel',
			'handleInputBlur',
			'handleInputChange',
			'handleInputFocus',
			'handleInputValueChange',
			'handleKeyDown',
			'handleMenuScroll',
			'handleMouseDown',
			'handleMouseDownOnArrow',
			'handleMouseDownOnMenu',
			'handleTouchEnd',
			'handleTouchEndClearValue',
			'handleTouchMove',
			'handleTouchOutside',
			'handleTouchStart',
			'handleValueClick',
			'onOptionRef',
			'removeValue',
			'selectValue',
			'buildOptions',
			'onDatasourceEvent'
		].forEach((fn) => this[fn] = this[fn].bind(this));

		this.state = {
			inputValue: '',
			isFocused: false,
			isOpen: false,
			isPseudoFocused: false,
			required: false,
		};
	}

	componentWillMount () {
		this.buildOptions(this.props);
		
		this._instancePrefix = 'react-select-' + (this.props.instanceId || ++instanceId) + '-';
		let value = this.props.value;
		if (this.props.dataSource) {
            value = this.getDataSourceFieldValue(this.props);
        }
		const valueArray = this.getValueArray(value);

		if (this.props.required) {
			this.setState({
				required: handleRequired(valueArray[0], this.props.multi),
			});
		}
	}

	componentDidMount () {
		if (typeof this.props.autofocus !== 'undefined' && typeof console !== 'undefined') {
			console.warn('Warning: The autofocus prop has changed to autoFocus, support will be removed after react-select@1.0');
		}

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

		if (this.props.autoFocus || this.props.autofocus) {
			this.focus();
		}
	}

	buildOptions(props){
		if (props.options){
			this._flatOptions = this.flattenOptions(props.options);
		} else if (props.children){
			this._flatOptions = this.flattenOptions(this.rebuildOptions(props.children));
		}
	}

	componentWillReceiveProps (nextProps) {
		this.buildOptions(nextProps);

		let valueArray=[];
		let value = nextProps.value;
		if (nextProps.dataSource) {
            value = this.getDataSourceFieldValue(nextProps);
		}
		valueArray = this.getValueArray(value, nextProps);

		if (!nextProps.isOpen && this.props.isOpen) {
			this.closeMenu();
		} else if (nextProps.isOpen && !this.props.isOpen) {
			this.setState({ isOpen: true });
		}

		if (nextProps.required) {
			this.setState({
				required: handleRequired(valueArray[0], nextProps.multi),
			});
		} else if (this.props.required) {
			// Used to be required but it's not any more
			this.setState({ required: false });
		}

		if (this.state.inputValue && this.props.value !== nextProps.value && nextProps.onSelectResetsInput) {
			this.setState({ inputValue: this.handleInputValueChange('') });
		}
	}

	componentDidUpdate (prevProps, prevState) {
		// focus to the selected option
		if (this.menu && this.focused && this.state.isOpen && !this.hasScrolledToOption) {
			const focusedOptionNode = findDOMNode(this.focused);
			let menuNode = findDOMNode(this.menu);

			const scrollTop = menuNode.scrollTop;
			const scrollBottom = scrollTop + menuNode.offsetHeight;
			const optionTop = focusedOptionNode.offsetTop;
			const optionBottom = optionTop + focusedOptionNode.offsetHeight;

			if (scrollTop > optionTop || scrollBottom < optionBottom) {
				menuNode.scrollTop = focusedOptionNode.offsetTop;
			}

			// We still set hasScrolledToOption to true even if we didn't
			// actually need to scroll, as we've still confirmed that the
			// option is in view.
			this.hasScrolledToOption = true;
		} else if (!this.state.isOpen) {
			this.hasScrolledToOption = false;
		}

		if (this._scrollToFocusedOptionOnUpdate && this.focused && this.menu) {
			this._scrollToFocusedOptionOnUpdate = false;
			const focusedDOM = findDOMNode(this.focused);
			let menuDOM = findDOMNode(this.menu);
			const focusedRect = focusedDOM.getBoundingClientRect();
			const menuRect = menuDOM.getBoundingClientRect();
			if (focusedRect.bottom > menuRect.bottom) {
				menuDOM.scrollTop = (focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight);
			} else if (focusedRect.top < menuRect.top) {
				menuDOM.scrollTop = focusedDOM.offsetTop;
			}
		}
		if (this.props.scrollMenuIntoView && this.menuContainer) {
			const menuContainerRect = this.menuContainer.getBoundingClientRect();
			if (window.innerHeight < menuContainerRect.bottom + this.props.menuBuffer) {
				window.scrollBy(0, menuContainerRect.bottom + this.props.menuBuffer - window.innerHeight);
			}
		}
		if (prevProps.disabled !== this.props.disabled) {
			this.setState({ isFocused: false }); // eslint-disable-line react/no-did-update-set-state
			this.closeMenu();
		}
		if (prevState.isOpen !== this.state.isOpen) {
			this.toggleTouchOutsideEvent(this.state.isOpen);
			const handler = this.state.isOpen ? this.props.onOpen : this.props.onClose;
			handler && handler();
		}
	}

	componentWillUnmount () {
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
		this.toggleTouchOutsideEvent(false);
	}

	onDatasourceEvent(event, error) {
        if (this.props.dataSource) {
            this.setState({
				...this.state,
				update: Math.random()
			});
			this.closeMenu();
        }
    }

	toggleTouchOutsideEvent (enabled) {
		if (enabled) {
			if (!document.addEventListener && document.attachEvent) {
				document.attachEvent('ontouchstart', this.handleTouchOutside);
			} else {
				document.addEventListener('touchstart', this.handleTouchOutside);
			}
		} else {
			if (!document.removeEventListener && document.detachEvent) {
				document.detachEvent('ontouchstart', this.handleTouchOutside);
			} else {
				document.removeEventListener('touchstart', this.handleTouchOutside);
			}
		}
	}

	handleTouchOutside (event) {
		// handle touch outside on ios to dismiss menu
		if (this.wrapper && !this.wrapper.contains(event.target)) {
			this.closeMenu();
		}
	}

	focus () {
		if (!this.input) return;
		this.input.focus();
	}

	blurInput () {
		if (!this.input) return;
		this.input.blur();
	}

	handleTouchMove () {
		// Set a flag that the view is being dragged
		this.dragging = true;
	}

	handleTouchStart () {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	}

	handleTouchEnd (event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Fire the mouse events
		this.handleMouseDown(event);
	}

	handleTouchEndClearValue (event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Clear the value
		this.clearValue(event);
	}

	handleMouseDown (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
			return;
		}

		if (event.target.tagName === 'INPUT') {
			if (!this.state.isFocused) {
				this._openAfterFocus = this.props.openOnClick;
				this.focus();
			} else if (!this.state.isOpen) {
				this.setState({
					isOpen: true,
					isPseudoFocused: false,
				});
			}

			return;
		}

		// prevent default event handlers
		event.preventDefault();

		// for the non-searchable select, toggle the menu
		if (!this.props.searchable) {
			// This code means that if a select is searchable, onClick the options menu will not appear, only on subsequent click will it open.
			this.focus();
			return this.setState({
				isOpen: !this.state.isOpen,
			});
		}

		if (this.state.isFocused) {
			// On iOS, we can get into a state where we think the input is focused but it isn't really,
			// since iOS ignores programmatic calls to input.focus() that weren't triggered by a click event.
			// Call focus() again here to be safe.
			this.focus();

			let input = this.input;
			let toOpen = true;

			if (typeof input.getInput === 'function') {
				// Get the actual DOM input if the ref is an <AutosizeInput /> component
				input = input.getInput();
			}

			// clears the value so that the cursor will be at the end of input when the component re-renders
			input.value = '';

			if (this._focusAfterClear) {
				toOpen = false;
				this._focusAfterClear = false;
			}

			// if the input is focused, ensure the menu is open
			this.setState({
				isOpen: toOpen,
				isPseudoFocused: false,
				focusedOption: null,
			});
		} else {
			// otherwise, focus the input and open the menu
			this._openAfterFocus = this.props.openOnClick;
			this.focus();
			this.setState({ focusedOption: null });
		}
	}

	handleMouseDownOnArrow (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
			return;
		}

		if (this.state.isOpen) {
			// prevent default event handlers
			event.stopPropagation();
			event.preventDefault();
			// close the menu
			this.closeMenu();
		} else {
			// If the menu isn't open, let the event bubble to the main handleMouseDown
			this.setState({
				isOpen: true,
			});
		}
	}

	handleMouseDownOnMenu (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
			return;
		}

		event.stopPropagation();
		event.preventDefault();

		this._openAfterFocus = true;
		this.focus();
	}

	closeMenu () {
		if(this.props.onCloseResetsInput) {
			this.setState({
				inputValue: this.handleInputValueChange(''),
				isOpen: false,
				isPseudoFocused: this.state.isFocused && !this.props.multi,
			});
		} else {
			this.setState({
				isOpen: false,
				isPseudoFocused: this.state.isFocused && !this.props.multi
			});
		}
		this.hasScrolledToOption = false;
	}

	handleInputFocus (event) {
		if (this.props.disabled) return;

		let toOpen = this.state.isOpen || this._openAfterFocus || this.props.openOnFocus;
		toOpen = this._focusAfterClear ? false : toOpen;  //if focus happens after clear values, don't open dropdown yet.

		if (this.props.onFocus) {
			this.props.onFocus(event);
		}

		this.setState({
			isFocused: true,
			isOpen: !!toOpen,
		});

		this._focusAfterClear = false;
		this._openAfterFocus = false;
	}

	handleInputBlur (event) {
		// The check for menu.contains(activeElement) is necessary to prevent IE11's scrollbar from closing the menu in certain contexts.
		if (this.menu && (this.menu === document.activeElement || this.menu.contains(document.activeElement))) {
			this.focus();
			return;
		}

		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
		let onBlurredState = {
			isFocused: false,
			isOpen: false,
			isPseudoFocused: false,
		};
		if (this.props.onBlurResetsInput) {
			onBlurredState.inputValue = this.handleInputValueChange('');
		}
		this.setState(onBlurredState);
	}

	handleInputChange (event) {
		let newInputValue = event.target.value;

		if (this.state.inputValue !== event.target.value) {
			newInputValue = this.handleInputValueChange(newInputValue);
		}

		this.setState({
			inputValue: newInputValue,
			isOpen: true,
			isPseudoFocused: false,
		});

	}

	setInputValue(newValue) {
		if (this.props.onInputChange) {
			let nextState = this.props.onInputChange(newValue);
			if (nextState != null && typeof nextState !== 'object') {
				newValue = '' + nextState;
			}
		}
		this.setState({
			inputValue: newValue
		});

	}

	handleInputValueChange(newValue) {
		if (this.props.onInputChange) {
			let nextState = this.props.onInputChange(newValue);
			// Note: != used deliberately here to catch undefined and null
			if (nextState != null && typeof nextState !== 'object') {
				newValue = '' + nextState;
			}
		}

		return newValue;
	}

	handleKeyDown (event) {
		if (this.props.disabled) return;

		if (typeof this.props.onInputKeyDown === 'function') {
			this.props.onInputKeyDown(event);
			if (event.defaultPrevented) {
				return;
			}
		}

		switch (event.keyCode) {
			case 8: // backspace
				if (!this.state.inputValue && this.props.backspaceRemoves) {
					event.preventDefault();
					this.popValue();
				}
				break;
			case 9: // tab
				if (event.shiftKey || !this.state.isOpen || !this.props.tabSelectsValue) {
					break;
				}
				event.preventDefault();
				this.selectFocusedOption();
				break;
			case 13: // enter
				event.preventDefault();
				event.stopPropagation();
				if (this.state.isOpen) {
					this.selectFocusedOption();
				} else {
					this.focusNextOption();
				}
				break;
			case 27: // escape
				event.preventDefault();
				if (this.state.isOpen) {
					this.closeMenu();
					event.stopPropagation();
				} else if (this.props.clearable && this.props.escapeClearsValue) {
					this.clearValue(event);
					event.stopPropagation();
				}
				break;
			case 32: // space
				if (this.props.searchable) {
					break;
				}
				event.preventDefault();
				if (!this.state.isOpen) {
					this.focusNextOption();
					break;
				}
				event.stopPropagation();
				this.selectFocusedOption();
				break;
			case 38: // up
				event.preventDefault();
				this.focusPreviousOption();
				break;
			case 40: // down
				event.preventDefault();
				this.focusNextOption();
				break;
			case 33: // page up
				event.preventDefault();
				this.focusPageUpOption();
				break;
			case 34: // page down
				event.preventDefault();
				this.focusPageDownOption();
				break;
			case 35: // end key
				if (event.shiftKey) {
					break;
				}
				event.preventDefault();
				this.focusEndOption();
				break;
			case 36: // home key
				if (event.shiftKey) {
					break;
				}
				event.preventDefault();
				this.focusStartOption();
				break;
			case 46: // delete
				event.preventDefault();
				if (!this.state.inputValue && this.props.deleteRemoves) {
					this.popValue();
				}
				break;
		}
	}

	handleValueClick (option, event) {
		if (!this.props.onValueClick) return;
		this.props.onValueClick(option, event);
	}

	handleMenuScroll (event) {
		if (!this.props.onMenuScrollToBottom) return;
		let { target } = event;
		if (target.scrollHeight > target.offsetHeight && (target.scrollHeight - target.offsetHeight - target.scrollTop) <= 0) {
			this.props.onMenuScrollToBottom();
		}
	}

	getOptionLabel (op) {
		return op[this.props.labelKey];
	}

	/**
	 * Turns a value into an array from the given options
	 * @param {String|Number|Array} value		- the value of the select input
	 * @param {Object}		nextProps	- optionally specify the nextProps so the returned array uses the latest configuration
	 * @returns	{Array}	the value of the select represented in an array
	 */
	getValueArray (value, nextProps = undefined) {
		/** support optionally passing in the `nextProps` so `componentWillReceiveProps` updates will function as expected */
		const props = typeof nextProps === 'object' ? nextProps : this.props;
		if (props.multi) {
			if (typeof value === 'string') {
				value = value.split(props.delimiter);
			}
			if (!Array.isArray(value)) {
				if (value === null || value === undefined) return [];
				value = [value];
			}
			return value.map(value => this.expandValue(value, props)).filter(i => i);
		}
		const expandedValue = this.expandValue(value, props);
		return expandedValue ? [expandedValue] : [];
	}

	/**
	 * Retrieve a value from the given options and valueKey
	 * @param	{String|Number|Array}	value	- the selected value(s)
	 * @param	{Object}		props	- the Select component's props (or nextProps)
	 */
	expandValue (value, props) {
		const valueType = typeof value;
		if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') return value;
		let { labelKey, renderInvalidValues, valueKey } = props;
		let options = this._flatOptions;
    if (!options) return;
		for (let i = 0; i < options.length; i++) {
			if (String(options[i][valueKey]) === String(value)) return options[i];
		}

		// no matching option, return an invalid option if renderInvalidValues is enabled
		if (renderInvalidValues) {
			this._invalidOptions = this._invalidOptions || {};
			this._invalidOptions[value] = this._invalidOptions[value] || {
				invalid: true,
				[labelKey]: value,
				[valueKey]: value
			};
			return this._invalidOptions[value];
		}
	}

	setValue (value) {
		if (this.props.autoBlur) {
			this.blurInput();
		}
		if (this.props.required) {
			const required = handleRequired(value, this.props.multi);
			this.setState({ required });
		}
		if (this.props.simpleValue && value) {
			value = this.props.multi ? value.map(i => i[this.props.valueKey]).join(this.props.delimiter) : value[this.props.valueKey];
		}
		if (this.props.onChange) {
			this.props.onChange(value);
		}
	}

	selectValue (value) {
		// NOTE: we actually add/set the value in a callback to make sure the
		// input value is empty to avoid styling issues in Chrome
		if (this.props.closeOnSelect) {
			this.hasScrolledToOption = false;
		}
		const updatedValue = this.props.onSelectResetsInput ? '' : this.state.inputValue;
		if (this.props.multi) {
			this.setState({
				focusedIndex: null,
				inputValue: this.handleInputValueChange(updatedValue),
				isOpen: !this.props.closeOnSelect,
			}, () => {
				let _value = this.props.value;
				if (this.props.dataSource) {
					_value = this.getDataSourceFieldValue(this.props);
				}
				const valueArray = this.getValueArray(_value);
				if (valueArray.some(i => i[this.props.valueKey] === value[this.props.valueKey])) {
					this.removeValue(value);
				} else {
					this.addValue(value);
				}
			});
		} else {
			this.setState({
				inputValue: this.handleInputValueChange(updatedValue),
				isOpen: !this.props.closeOnSelect,
				isPseudoFocused: this.state.isFocused,
			}, () => {
				this.setValue(value);
			});
		}

		if (value){
		this.setDataSourceFieldValue(value.value);
		}
	}

	addValue (value) {
		let _value = this.props.value;
		if (this.props.dataSource) {
            _value = this.getDataSourceFieldValue(this.props);
        }
		let valueArray = this.getValueArray(_value);
		const visibleOptions = this._visibleOptions.filter(val => !val.disabled);
		const lastValueIndex = visibleOptions.indexOf(value);
		this.setValue(valueArray.concat(value));
		if (visibleOptions.length - 1 === lastValueIndex) {
			// the last option was selected; focus the second-last one
			this.focusOption(visibleOptions[lastValueIndex - 1]);
		} else if (visibleOptions.length > lastValueIndex) {
			// focus the option below the selected one
			this.focusOption(visibleOptions[lastValueIndex + 1]);
		}
	}

	popValue () {
		let value = this.props.value;
		if (this.props.dataSource) {
            value = this.getDataSourceFieldValue(this.props);
        }
		let valueArray = this.getValueArray(value);
		if (!valueArray.length) return;
		if (valueArray[valueArray.length-1].clearableValue === false) return;
		this.setValue(this.props.multi ? valueArray.slice(0, valueArray.length - 1) : null);
	}

	removeValue (value) {
		let _value = this.props.value;
		if (this.props.dataSource) {
            _value = this.getDataSourceFieldValue(this.props);
        }
		let valueArray = this.getValueArray(_value);
		this.setValue(valueArray.filter(i => i[this.props.valueKey] !== value[this.props.valueKey]));
		this.focus();
	}

	clearValue (event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}

		event.preventDefault();

		this.setValue(this.getResetValue());
		this.setState({
			inputValue: this.handleInputValueChange(''),
			isOpen: false,
		}, this.focus);

		if (this.props.dataSource) {
			this
				.props
				.dataSource
				.setFieldByName(this.props.dataField, undefined);
		}

		this._focusAfterClear = true;
	}

	getResetValue () {
		if (this.props.resetValue !== undefined) {
			return this.props.resetValue;
		} else if (this.props.multi) {
			return [];
		} else {
			return null;
		}
	}

	getDataSourceFieldValue(props){
		let _value = '';
		if (props.dataSource){
			 _value = props
						.dataSource
						.fieldByName(props.dataField);
			if (!_value){
				_value = '';
			}
		}
		return _value;
	}

	setDataSourceFieldValue(value){		
		if (this.props.dataSource) {
			this.props.dataSource.setFieldByName(
				this.props.dataField,
				value
			);
		}				
	}

	focusOption (option) {
		this.setState({
			focusedOption: option
		});
	}

	focusNextOption () {
		this.focusAdjacentOption('next');
	}

	focusPreviousOption () {
		this.focusAdjacentOption('previous');
	}

	focusPageUpOption () {
		this.focusAdjacentOption('page_up');
	}

	focusPageDownOption () {
		this.focusAdjacentOption('page_down');
	}

	focusStartOption () {
		this.focusAdjacentOption('start');
	}

	focusEndOption () {
		this.focusAdjacentOption('end');
	}

	focusAdjacentOption (dir) {
		const options = this._visibleOptions
			.map((option, index) => ({ option, index }))
			.filter(option => !option.option.disabled);
		this._scrollToFocusedOptionOnUpdate = true;
		if (!this.state.isOpen) {
			const newState = {
				focusedOption: this._focusedOption || (options.length ? options[dir === 'next' ? 0 : options.length - 1].option : null),
				isOpen: true,
			};
			if (this.props.onSelectResetsInput) {
				newState.inputValue = '';
			}
			this.setState(newState);
			return;
		}
		if (!options.length) return;
		let focusedIndex = -1;
		for (let i = 0; i < options.length; i++) {
			if (this._focusedOption === options[i].option) {
				focusedIndex = i;
				break;
			}
		}
		if (dir === 'next' && focusedIndex !== -1 ) {
			focusedIndex = (focusedIndex + 1) % options.length;
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedIndex = focusedIndex - 1;
			} else {
				focusedIndex = options.length - 1;
			}
		} else if (dir === 'start') {
			focusedIndex = 0;
		} else if (dir === 'end') {
			focusedIndex = options.length - 1;
		} else if (dir === 'page_up') {
			const potentialIndex = focusedIndex - this.props.pageSize;
			if (potentialIndex < 0) {
				focusedIndex = 0;
			} else {
				focusedIndex = potentialIndex;
			}
		} else if (dir === 'page_down') {
			const potentialIndex = focusedIndex + this.props.pageSize;
			if (potentialIndex > options.length - 1) {
				focusedIndex = options.length - 1;
			} else {
				focusedIndex = potentialIndex;
			}
		}

		if (focusedIndex === -1) {
			focusedIndex = 0;
		}

		this.setState({
			focusedIndex: options[focusedIndex].index,
			focusedOption: options[focusedIndex].option
		});
	}

	getFocusedOption () {
		return this._focusedOption;
	}

	selectFocusedOption () {
		if (this._focusedOption) {
			return this.selectValue(this._focusedOption);
		}
	}

	renderLoading () {
		if (!this.props.isLoading) return;
		return (
			<span className="Select-loading-zone" aria-hidden="true">
				<span className="Select-loading" />
			</span>
		);
	}

	renderValue (valueArray, isOpen) {
		let renderLabel = this.props.valueRenderer || this.getOptionLabel;
		let ValueComponent = this.props.valueComponent;
		if (!valueArray.length) {
			const showPlaceholder = shouldShowPlaceholder(this.state, this.props, isOpen);
			return showPlaceholder ? <div className="Select-placeholder">{this.props.placeholder}</div> : null;
		}
		let onClick = this.props.onValueClick ? this.handleValueClick : null;
		if (this.props.multi) {
			return valueArray.map((value, i) => {
				return (
					<ValueComponent
						disabled={this.props.disabled || value.clearableValue === false}
						id={this._instancePrefix + '-value-' + i}
						instancePrefix={this._instancePrefix}
						key={`value-${i}-${value[this.props.valueKey]}`}
						onClick={onClick}
						onRemove={this.removeValue}
						placeholder={this.props.placeholder}
						value={value}
					>
						{renderLabel(value, i)}
						<span className="Select-aria-only">&nbsp;</span>
					</ValueComponent>
				);
			});
		} else if (shouldShowValue(this.state, this.props)) {
			if (isOpen) onClick = null;
			return (
				<ValueComponent
					disabled={this.props.disabled}
					id={this._instancePrefix + '-value-item'}
					instancePrefix={this._instancePrefix}
					onClick={onClick}
					placeholder={this.props.placeholder}
					value={valueArray[0]}
				>
					{renderLabel(valueArray[0])}
				</ValueComponent>
			);
		}
	}

	renderInput (valueArray, focusedOptionIndex) {
		const className = classNames('Select-input', this.props.inputProps.className);
		const isOpen = this.state.isOpen;

		const ariaOwns = classNames({
			[this._instancePrefix + '-list']: isOpen,
			[this._instancePrefix + '-backspace-remove-message']: this.props.multi
				&& !this.props.disabled
				&& this.state.isFocused
				&& !this.state.inputValue
		});

		let value = this.state.inputValue;
		if (value && !this.props.onSelectResetsInput && !this.state.isFocused){
			// it hides input value when it is not focused and was not reset on select
			value= '';
		}

		const inputProps = {
			...this.props.inputProps,
			'aria-activedescendant': isOpen ? this._instancePrefix + '-option-' + focusedOptionIndex : this._instancePrefix + '-value',
			'aria-describedby': this.props['aria-describedby'],
			'aria-expanded': '' + isOpen,
			'aria-haspopup': '' + isOpen,
			'aria-label': this.props['aria-label'],
			'aria-labelledby': this.props['aria-labelledby'],
			'aria-owns': ariaOwns,
			className: className,
			onBlur: this.handleInputBlur,
			onChange: this.handleInputChange,
			onFocus: this.handleInputFocus,
			ref: ref => this.input = ref,
			role: 'combobox',
			required: this.state.required,
			tabIndex: this.props.tabIndex,
			value,
		};

		if (this.props.inputRenderer) {
			return this.props.inputRenderer(inputProps);
		}

		if (this.props.disabled || !this.props.searchable) {
			const { ...divProps } = this.props.inputProps;

			const ariaOwns = classNames({
				[this._instancePrefix + '-list']: isOpen,
			});
			return (

				<div
					{...divProps}
					aria-expanded={isOpen}
					aria-owns={ariaOwns}
					aria-activedescendant={isOpen ? this._instancePrefix + '-option-' + focusedOptionIndex : this._instancePrefix + '-value'}
					aria-disabled={'' + this.props.disabled}
					aria-label={this.props['aria-label']}
					aria-labelledby={this.props['aria-labelledby']}
					className={className}
					onBlur={this.handleInputBlur}
					onFocus={this.handleInputFocus}
					ref={ref => this.input = ref}
					role="combobox"
					style={{ border: 0, width: 1, display:'inline-block' }}
					tabIndex={this.props.tabIndex || 0}
				/>
			);
		}

		if (this.props.autosize) {
			return (
				<AutosizeInput id={this.props.id} {...inputProps} minWidth="5" />
			);
		}
		return (
			<div className={ className } key="input-wrap">
				<input id={this.props.id} {...inputProps} />
			</div>
		);
	}

	renderClear () {
		let value = this.props.value;
		if (this.props.dataSource) {
            value = this.getDataSourceFieldValue(this.props);
        }
		const valueArray = this.getValueArray(value);
		if (!this.props.clearable
			|| !valueArray.length
			|| this.props.disabled
			|| this.props.isLoading) return;
		const ariaLabel = this.props.multi ? this.props.clearAllText : this.props.clearValueText;
		const clear = this.props.clearRenderer();

		return (
			<span
				aria-label={ariaLabel}
				className="Select-clear-zone"
				onMouseDown={this.clearValue}
				onTouchEnd={this.handleTouchEndClearValue}
				onTouchMove={this.handleTouchMove}
				onTouchStart={this.handleTouchStart}
				title={ariaLabel}
			>
				{clear}
			</span>
		);
	}

	renderArrow () {
		if (!this.props.arrowRenderer) return;

		const onMouseDown = this.handleMouseDownOnArrow;
		const isOpen = this.state.isOpen;
		const arrow = this.props.arrowRenderer({ onMouseDown, isOpen });

		if (!arrow) {
			return null;
		}

		return (
			<span
				className="Select-arrow-zone"
				onMouseDown={onMouseDown}
			>
				{arrow}
			</span>
		);
	}

	filterFlatOptions (excludeOptions) {
		const filterValue = this.state.inputValue;
		const flatOptions = this._flatOptions;
		if (this.props.filterOptions) {
			// Maintain backwards compatibility with boolean attribute
			const filterOptions = typeof this.props.filterOptions === 'function'
				? this.props.filterOptions
				: defaultFilterOptions;

			return filterOptions(
				flatOptions,
				filterValue,
				excludeOptions,
				{
					filterOption: this.props.filterOption,
					ignoreAccents: this.props.ignoreAccents,
					ignoreCase: this.props.ignoreCase,
					labelKey: this.props.labelKey,
					matchPos: this.props.matchPos,
					matchProp: this.props.matchProp,
					trimFilter: this.props.trimFilter,
					valueKey: this.props.valueKey,
				}
			);
		} else {
			return flatOptions;
		}
	}

	flattenOptions (options, group) {
		if (!options) return [];
		let flatOptions = [];
		for (let i = 0; i < options.length; i ++) {
			// We clone each option with a pointer to its parent group for efficient unflattening
			const optionCopy = clone(options[i]);
			if (group) {
				optionCopy.group = group;
			}
			if (isGroup(optionCopy)) {
				flatOptions = flatOptions.concat(this.flattenOptions(optionCopy.options, optionCopy));
				optionCopy.options = [];
			} else {
				flatOptions.push(optionCopy);
			}
		}
		return flatOptions;
	}

	unflattenOptions (flatOptions) {
		const groupedOptions = [];
		let parent, child;

		// Remove all ancestor groups from the tree
		flatOptions.forEach((option) => {
			option.isInTree = false;
			parent = option.group;
			while (parent) {
				if (parent.isInTree) {
					parent.options = [];
					parent.isInTree = false;
				}
				parent = parent.group;
			}
		});

		// Now reconstruct the options tree
		flatOptions.forEach((option) => {
			child = option;
			parent = child.group;
			while (parent) {
				if (!child.isInTree) {
					parent.options.push(child);
					child.isInTree = true;
				}

				child = parent;
				parent = child.group;
			}
			if (!child.isInTree) {
				groupedOptions.push(child);
				child.isInTree = true;
			}
		});

		// Remove the isInTree flag we added
		flatOptions.forEach((option) => {
			delete option.isInTree;
		});

		return groupedOptions;
	}

	onOptionRef(ref, isFocused) {
		if (isFocused) {
			this.focused = ref;
		}
	}

	renderMenu (options, valueArray, focusedOption) {
		if (options && options.length) {
			return this.props.menuRenderer({
				focusedOption,
				focusOption: this.focusOption,
				inputValue: this.state.inputValue,
				instancePrefix: this._instancePrefix,
				labelKey: this.props.labelKey,
				onFocus: this.focusOption,
				onOptionRef: this.onOptionRef,
				onSelect: this.selectValue,
				optionClassName: this.props.optionClassName,
				optionComponent: this.props.optionComponent,
				optionGroupComponent: this.props.optionGroupComponent,
				optionRenderer: this.props.optionRenderer || this.getOptionLabel,
				options,
				removeValue: this.removeValue,
				selectValue: this.selectValue,
				valueArray,
				valueKey: this.props.valueKey,
			});
		} else if (this.props.noResultsText) {
			return (
				<div className="Select-noresults">
					{this.props.noResultsText}
				</div>
			);
		} else {
			return null;
		}
	}

	renderHiddenField (valueArray) {
		if (!this.props.name) return;
		if (this.props.joinValues) {
			let value = valueArray.map(i => stringifyValue(i[this.props.valueKey])).join(this.props.delimiter);
			return (
				<input
					disabled={this.props.disabled}
					name={this.props.name}
					ref={ref => this.value = ref}
					type="hidden"
					value={value}
				/>
			);
		}
		return valueArray.map((item, index) => (
			<input
				disabled={this.props.disabled}
				key={'hidden.' + index}
				name={this.props.name}
				ref={'value' + index}
				type="hidden"
				value={stringifyValue(item[this.props.valueKey])}
			/>
		));
	}

	static get componentName() {
		return "AnterosCombobox";
	}

	getFocusableOptionIndex (selectedOption) {
		const options = this._visibleOptions;
		if (!options.length) return null;

		const valueKey = this.props.valueKey;
		let focusedOption = this.state.focusedOption || selectedOption;
		if (focusedOption && !focusedOption.disabled) {
			let focusedOptionIndex = -1;
			options.some((option, index) => {
				const isOptionEqual = option[valueKey] === focusedOption[valueKey];
				if (isOptionEqual) {
					focusedOptionIndex = index;
				}
				return isOptionEqual;
			});
			if (focusedOptionIndex !== -1) {
				return focusedOptionIndex;
			}
		}

		for (let i = 0; i < options.length; i++) {
			if (!options[i].disabled) return i;
		}
		return null;
	}

	renderOuter (options, valueArray, focusedOption) {
		let Dropdown = this.props.dropdownComponent;
		let menu = this.renderMenu(options, valueArray, focusedOption);
		if (!menu) {
			return null;
		}

		return (
			<Dropdown>
				<div ref={ref => this.menuContainer = ref} className="Select-menu-outer" style={this.props.menuContainerStyle}>
					<div
						className="Select-menu"
						id={this._instancePrefix + '-list'}
						onMouseDown={this.handleMouseDownOnMenu}
						onScroll={this.handleMenuScroll}
						ref={ref => this.menu = ref}
						role="listbox"
						style={this.props.menuStyle}
						tabIndex={-1}
					>
						{menu}
					</div>
				</div>
			</Dropdown>
		);
	}


	rebuildOptions(children) {
		let _tempChildren = React.Children.toArray(children);
		let result = [];
		_tempChildren.forEach(function(child) {
			if (child.type && child.type.componentName==='AnterosComboboxOption') {
			  if (child.group && child.group===true){
				result.push({label:child.props.label, disabled: child.props.disabled, options: this.rebuildOptions(child.props.children)});
			  } else {
				result.push({label:child.props.label, disabled: child.props.disabled, value: child.props.value});  
			  }
			}
		  });
		  return result;
    }

	render () {
		let value = this.props.value;
		if (this.props.dataSource) {
            value = this.getDataSourceFieldValue(this.props);
        }
		let valueArray = this.getValueArray(value);
		this._visibleOptions = this.filterFlatOptions(this.props.multi && this.props.removeSelected ? valueArray : null);
		let options = this.unflattenOptions(this._visibleOptions);
		let isOpen = typeof this.props.isOpen === 'boolean' ? this.props.isOpen : this.state.isOpen;
		if (this.props.multi && !options.length && valueArray.length && !this.state.inputValue) isOpen = false;
		const focusedOptionIndex = this.getFocusableOptionIndex(valueArray[0]);

		let focusedOption = null;
		if (focusedOptionIndex !== null) {
			focusedOption = this._focusedOption = this._visibleOptions[focusedOptionIndex];
		} else {
			focusedOption = this._focusedOption = null;
		}
		const colClasses = buildGridClassNames(this.props, false, []);
		let className = classNames('Select', this.props.className, {
			'has-value': valueArray.length,
			'is-clearable': this.props.clearable,
			'is-disabled': this.props.disabled,
			'is-focused': this.state.isFocused,
			'is-loading': this.props.isLoading,
			'is-open': isOpen,
			'is-pseudo-focused': this.state.isPseudoFocused,
			'is-searchable': this.props.searchable,
			'Select--multi': this.props.multi,
			'Select--rtl': this.props.rtl,
			'Select--single': !this.props.multi,
		});

		let removeMessage = null;
		if (this.props.multi &&
			!this.props.disabled &&
			valueArray.length &&
			!this.state.inputValue &&
			this.state.isFocused &&
			this.props.backspaceRemoves) {
			removeMessage = (
				<span id={this._instancePrefix + '-backspace-remove-message'} className="Select-aria-only" aria-live="assertive">
					{this.props.backspaceToRemoveMessage.replace('{label}', valueArray[valueArray.length - 1][this.props.labelKey])}
				</span>
			);
		}

		
		let {            
            disabled,
            width,
            primary,
            secondary,
            info,
            danger,
            success,
            warning,
            required,
            minLength,
            maxLength
		} = this.props;
		
		let dataStyle = this.props.style;
        if (primary) {
            dataStyle = "btn-primary";
        } else if (info) {
            dataStyle = "btn-info";
        } else if (danger) {
            dataStyle = "btn-danger";
        } else if (success) {
            dataStyle = "btn-success";
        } else if (warning) {
            dataStyle = "btn-warning";
		}
		
		let content = <div ref={ref => this.wrapper = ref}
		className={className}
		style={this.props.wrapperStyle}>
	   {this.renderHiddenField(valueArray)}
	   <div ref={ref => this.control = ref}
		   className="Select-control"
		   onKeyDown={this.handleKeyDown}
		   onMouseDown={this.handleMouseDown}
		   onTouchEnd={this.handleTouchEnd}
		   onTouchMove={this.handleTouchMove}
		   onTouchStart={this.handleTouchStart}
		   style={dataStyle}
			>
				<span className="Select-multi-value-wrapper" id={this._instancePrefix + '-value'}>
					{this.renderValue(valueArray, isOpen)}
					{this.renderInput(valueArray, focusedOptionIndex)}
				</span>
				{removeMessage}
				{this.renderLoading()}
				{this.renderClear()}
				{this.renderArrow()}
			</div>
			{isOpen ? this.renderOuter(options, valueArray, focusedOption) : null}
		</div>;

		if (colClasses.length > 0) {
            return (
                <div className={AnterosUtils.buildClassNames(colClasses)}>
					{content}
				</div>
			)
		}			
		else {
				return content;
		}
	}
}

AnterosCombobox.propTypes = {
	'aria-describedby': PropTypes.string, // HTML ID(s) of element(s) that should be used to describe this input (for assistive tech)
	'aria-label': PropTypes.string,       // Aria label (for assistive tech)
	'aria-labelledby': PropTypes.string,  // HTML ID of an element that should be used as the label (for assistive tech)
	arrowRenderer: PropTypes.func,        // Create drop-down caret element
	autoBlur: PropTypes.bool,             // automatically blur the component when an option is selected
	autoFocus: PropTypes.bool,            // autofocus the component on mount
	autofocus: PropTypes.bool,            // deprecated; use autoFocus instead
	autosize: PropTypes.bool,             // whether to enable autosizing or not
	backspaceRemoves: PropTypes.bool,     // whether backspace removes an item if there is no text input
	backspaceToRemoveMessage: PropTypes.string,  // Message to use for screenreaders to press backspace to remove the current item - {label} is replaced with the item label
	className: PropTypes.string,          // className for the outer element
	clearAllText: stringOrNode,           // title for the "clear" control when multi: true
	clearRenderer: PropTypes.func,        // create clearable x element
	clearValueText: stringOrNode,         // title for the "clear" control
	clearable: PropTypes.bool,            // should it be possible to reset value
	closeOnSelect: PropTypes.bool,        // whether to close the menu when a value is selected
	dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
	deleteRemoves: PropTypes.bool,        // whether backspace removes an item if there is no text input
	delimiter: PropTypes.string,          // delimiter to use to join multiple values for the hidden field value
	disabled: PropTypes.bool,             // whether the Select is disabled or not
	dropdownComponent: PropTypes.func,    // dropdown component to render the menu in
	escapeClearsValue: PropTypes.bool,    // whether escape clears the value when the menu is closed
	filterOption: PropTypes.func,         // method to filter a single option (option, filterString)
	filterOptions: PropTypes.any,         // boolean to enable default filtering or function to filter the options array ([options], filterString, [values])
	id: PropTypes.string, 				        // html id to set on the input element for accessibility or tests
	ignoreAccents: PropTypes.bool,        // whether to strip diacritics when filtering
	ignoreCase: PropTypes.bool,           // whether to perform case-insensitive filtering
	inputProps: PropTypes.object,         // custom attributes for the Input
	inputRenderer: PropTypes.func,        // returns a custom input component
	instanceId: PropTypes.string,         // set the components instanceId
	isLoading: PropTypes.bool,            // whether the Select is loading externally or not (such as options being loaded)
	isOpen: PropTypes.bool,               // whether the Select dropdown menu is open or not
	joinValues: PropTypes.bool,           // joins multiple values into a single form field with the delimiter (legacy mode)
	labelKey: PropTypes.string,           // path of the label value in option objects
	matchPos: PropTypes.string,           // (any|start) match the start or entire string when filtering
	matchProp: PropTypes.string,          // (any|label|value) which option property to filter on
	menuBuffer: PropTypes.number,         // optional buffer (in px) between the bottom of the viewport and the bottom of the menu
	menuContainerStyle: PropTypes.object, // optional style to apply to the menu container
	menuRenderer: PropTypes.func,         // renders a custom menu with options
	menuStyle: PropTypes.object,          // optional style to apply to the menu
	multi: PropTypes.bool,                // multi-value input
	name: PropTypes.string,               // generates a hidden <input /> tag with this field name for html forms
	noResultsText: stringOrNode,          // placeholder displayed when there are no matching search results
	onBlur: PropTypes.func,               // onBlur handler: function (event) {}
	onBlurResetsInput: PropTypes.bool,    // whether input is cleared on blur
	onChange: PropTypes.func,             // onChange handler: function (newValue) {}
	onClose: PropTypes.func,              // fires when the menu is closed
	onCloseResetsInput: PropTypes.bool,   // whether input is cleared when menu is closed through the arrow
	onFocus: PropTypes.func,              // onFocus handler: function (event) {}
	onInputChange: PropTypes.func,        // onInputChange handler: function (inputValue) {}
	onInputKeyDown: PropTypes.func,       // input keyDown handler: function (event) {}
	onMenuScrollToBottom: PropTypes.func, // fires when the menu is scrolled to the bottom; can be used to paginate options
	onOpen: PropTypes.func,               // fires when the menu is opened
	onSelectResetsInput: PropTypes.bool,  // whether input is cleared on select (works only for multiselect)
	onValueClick: PropTypes.func,         // onClick handler for value labels: function (value, event) {}
	openOnClick: PropTypes.bool,          // boolean to control opening the menu when the control is clicked
	openOnFocus: PropTypes.bool,          // always open options menu on focus
	optionClassName: PropTypes.string,    // additional class(es) to apply to the <Option /> elements
	optionComponent: PropTypes.func,      // option component to render in dropdown
	optionGroupComponent: PropTypes.func, // option group component to render in dropdown
	optionRenderer: PropTypes.func,       // optionRenderer: function (option) {}
	options: PropTypes.array,             // array of options
	pageSize: PropTypes.number,           // number of entries to page when using page up/down keys
	placeholder: stringOrNode,            // field placeholder, displayed when there's no value
	removeSelected: PropTypes.bool,       // whether the selected option is removed from the dropdown on multi selects
	renderInvalidValues: PropTypes.bool,  // boolean to enable rendering values that do not match any options
	required: PropTypes.bool,             // applies HTML5 required attribute when needed
	resetValue: PropTypes.any,            // value to use when you clear the control
	rtl: PropTypes.bool, 									// set to true in order to use react-select in right-to-left direction
	scrollMenuIntoView: PropTypes.bool,   // boolean to enable the viewport to shift so that the full menu fully visible when engaged
	searchable: PropTypes.bool,           // whether to enable searching feature or not
	simpleValue: PropTypes.bool,          // pass the value to onChange as a simple value (legacy pre 1.0 mode), defaults to false
	style: PropTypes.object,              // optional style to apply to the control
	tabIndex: PropTypes.string,           // optional tab index of the control
	tabSelectsValue: PropTypes.bool,      // whether to treat tabbing out while focused to be value selection
	trimFilter: PropTypes.bool,           // whether to trim whitespace around filter value
	value: PropTypes.any,                 // initial field value
	valueComponent: PropTypes.func,       // value component to render
	valueKey: PropTypes.string,           // path of the label value in option objects
	valueRenderer: PropTypes.func,        // valueRenderer: function (option) {}
	wrapperStyle: PropTypes.object,       // optional style to apply to the component wrapper
	extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps
};

AnterosCombobox.defaultProps = {
	arrowRenderer: defaultArrowRenderer,
	autosize: true,
	backspaceRemoves: true,
	backspaceToRemoveMessage: 'Pressione backSpace p/limpar {label}',
	clearable: true,
	clearAllText: 'Limpar tudo',
	clearRenderer: defaultClearRenderer,
	clearValueText: 'Limpar valor',
	closeOnSelect: true,
	deleteRemoves: true,
	delimiter: ',',
	disabled: false,
	dropdownComponent: Dropdown,
	escapeClearsValue: true,
	filterOptions: defaultFilterOptions,
	ignoreAccents: true,
	ignoreCase: true,
	inputProps: {},
	isLoading: false,
	joinValues: false,
	labelKey: 'label',
	matchPos: 'any',
	matchProp: 'any',
	menuBuffer: 0,
	menuRenderer: defaultMenuRenderer,
	multi: false,
	noResultsText: 'Nenhum resultado encontrado',
	onBlurResetsInput: true,
	onCloseResetsInput: true,
	onSelectResetsInput: true,
	openOnClick: true,
	optionComponent: Option,
	optionGroupComponent: OptionGroup,
	pageSize: 5,
	placeholder: 'Selecione...',
	removeSelected: true,
	required: false,
	rtl: false,
	scrollMenuIntoView: true,
	searchable: true,
	simpleValue: false,
	tabSelectsValue: true,
	trimFilter: true,
	valueComponent: Value,
	valueKey: 'value',
};

 

export class AnterosComboboxOption extends React.Component {
    constructor(props) {
        super(props);
	}
	
	static get componentName() {
		return "AnterosComboboxOption";
	}

    render() {
        return null;
    }
}

AnterosComboboxOption.propTypes = {
    label: PropTypes.string.isRequired,
    group: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
	value: PropTypes.string.isRequired,
};

AnterosComboboxOption.defaultProps = {
    group: false,
    disabled: false
};