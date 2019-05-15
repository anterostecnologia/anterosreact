import React from 'react'
import PropTypes from "prop-types";
import 'chosen-js/chosen.jquery.js';
import lodash from 'lodash';
import classNames from "classnames";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosError } from "anteros-react-core";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";


export default class AnterosLookupCombobox extends React.Component {
    constructor(props) {
        super(props);
        this.onChangeSelect = this.onChangeSelect.bind(this);
        this.onDroppedDown = this.onDroppedDown.bind(this);
        this.onCloseUp = this.onCloseUp.bind(this);
        this.buildChildrensFromDataSource = this.buildChildrensFromDataSource.bind(this);
        this.rebuildChildrens = this.rebuildChildrens.bind(this);
        this.idSelect = lodash.uniqueId('select');
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.onLookupDatasourceEvent = this.onLookupDatasourceEvent.bind(this);
        this.updateSelect = this.updateSelect.bind(this);
        this.loadData = false;
        let value = this.props.value;
        if (this.props.dataSource) {
            value = this.props.dataSource.fieldByName(this.props.dataField);
            if (value)
            value = value[this.props.dataFieldId];
        }
        this.state = { value, update: true };

        if (this.props.lookupDataSource && this.props.lookupDataSource.locate({ [`window.${this.props.lookupDataFieldId}`]: this.state.value })) {
            if (this.props.dataSource) {
                this.props.dataSource.setFieldByName(this.props.dataField, this.props.lookupDataSource.getCurrentRecord());
            }
            if (this.props.onChangeSelect) {
                this.props.onChangeSelect(this.state.value, this.props.lookupDataSource.getCurrentRecord());
            }
        }
    }

    componentDidMount() {
        let options = {
			no_results_text: "Oops, texto não encontrado!",
			placeholder_text_single: this.props.placeHolder,
			placeholder_text_multiple: this.props.placeHolder,
			search_contains: true,
			allow_single_deselect: true,
			max_selected_options: this.props.maxSelectedOptions,
			allow_single_deselect: true,
			disable_search: !this.props.searchEnabled
		};
		const colClasses = buildGridClassNames(this.props, false, []);
		if (colClasses && colClasses.length > 0) {
			options = {
				...options,
				width: "100%"
			};
		} else if (this.props.width) {
			options = {
				...options,
				width: this.props.width,
				"min-width": this.props.width
			};
		}
		window.$(this.select)
			.chosen(options).change(this.onChangeSelect);

        if (this.props.lookupDataSource) {
            this.props.lookupDataSource.addEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_POST,
                dataSourceEvents.AFTER_DELETE,
                dataSourceEvents.AFTER_OPEN], this.onLookupDatasourceEvent);
        }

        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_POST,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    updateSelect() {
        window.$(this.select).trigger("chosen:updated");
    }

    componentWillReceiveProps(nextProps) {
        let value = nextProps.value;
        if (nextProps.dataSource) {
            value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (value)
            value = value[nextProps.lookupDataFieldText];
        }
        this.setState({ ...this.state, value });
        this.updateSelect();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.loadData) {
            this.loadData = false;
        }
        this.updateSelect();
    }

    componentWillUnmount() {
        window.$(this.select).chosen("destroy");
        if ((this.props.lookupDataSource)) {
            this.props.lookupDataSource.removeEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_POST,
                dataSourceEvents.AFTER_DELETE,
                dataSourceEvents.AFTER_OPEN], this.onLookupDatasourceEvent);
        }

        if ((this.props.dataSource)) {
            this.props.dataSource.removeEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_POST,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    onDatasourceEvent(event, error) {
        if (this.props.dataSource) {
            let value = this.props.value;
            if (this.props.dataSource) {
                value = this.props.dataSource.fieldByName(this.props.dataField);
                if (value)
                value = value[this.props.lookupDataFieldText];
            }
            this.setState({ ...this.state, value });
        }
    }

    onLookupDatasourceEvent(event, error) {
        if (event == dataSourceEvents.AFTER_OPEN || event == dataSourceEvents.AFTER_POST || event == dataSourceEvents.AFTER_DELETE) {
            this.loadData = true;
            this.setState({ ...this.state, update: Math.random() });
        }
    }

    onChangeSelect(event, selectedValue) {
        if (selectedValue != undefined && selectedValue.selected != undefined && selectedValue.selected != '') {
            if (this.props.lookupDataSource.locate({ [`${this.props.lookupDataFieldId}`]: selectedValue.selected })) {
                if (this.props.dataSource) {
                    this.props.dataSource.setFieldByName(this.props.dataField, this.props.lookupDataSource.getCurrentRecord());
                }
                if (this.props.onChangeSelect) {
                    this.props.onChangeSelect(selectedValue.selected, this.props.lookupDataSource.getCurrentRecord());
                }
            }
        } else {
            if (this.props.dataSource) {
                this.props.dataSource.setFieldByName(this.props.dataField, undefined);
            }

            if (this.props.onChangeSelect) {
                this.props.onChangeSelect();
            }
        }
    }

    onDroppedDown() {
        if (this.props.onDroppedDown) {
            this.props.onDroppedDown();
        }
    }

    onCloseUp() {
        if (this.props.onCloseUp) {
            this.props.onCloseUp();
        }
    }

    buildChildrensFromDataSource() {
        let children = [];
        let index = 0;
        let _this = this;
        children.push(React.createElement(AnterosLookupComboboxOption, {
            key: index,
            label: '',
            group: undefined,
            divider: undefined,
            disabled: false,
            style: undefined,
            className: undefined,
            icon: undefined,
            content: undefined,
            index: index
        }, ''));
        index++;

        this.props.lookupDataSource.getData().map(record => {

            if (!record.hasOwnProperty(_this.props.lookupDataFieldId) || (!record[_this.props.lookupDataFieldId])) {
                throw new AnterosError("Foi encontrado um registro sem ID no dataSource passado para o Select.");
            }
            if (!record.hasOwnProperty(_this.props.lookupDataFieldText) || (!record[_this.props.lookupDataFieldText])) {
                throw new AnterosError("Foi encontrado um registro sem o texto no dataSource passado para a Select.");
            }

            children.push(React.createElement(AnterosLookupComboboxOption, {
                key: record[_this.props.lookupDataFieldId] + "_" + index,
                label: (record.label ? record.label : record[_this.props.lookupDataFieldText]),
                text: record[_this.props.lookupDataFieldText],
                group: record.group,
                divider: record.divider,
                disabled: record.disabled,
                style: record.style,
                className: record.className,
                icon: record.icon,
                content: record.content,
                index: index,
                value: record[_this.props.lookupDataFieldId]
            }, record[_this.props.lookupDataFieldText]));
            index++;
        });
        return children;
    }

    rebuildChildrens() {
        let children = [];
        let index = 0;
        let _this = this;
        children.push(React.createElement(AnterosLookupComboboxOption, {
            key: index,
            label: '',
            text: '',
            group: undefined,
            divider: undefined,
            disabled: false,
            style: undefined,
            className: undefined,
            icon: undefined,
            content: undefined,
            index: index
        }, ''));
        index++;

        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            children.push(React.createElement(AnterosLookupComboboxOption, {
                key: (_this.props.id ? _this.props.id + "_" + index : _this.idSelect + "_" + index),
                label: child.props.label,
                group: child.props.group,
                divider: child.props.divider,
                disabled: child.props.disabled,
                style: child.props.style,
                className: child.props.className,
                icon: child.props.icon,
                content: child.props.content,
                value: child.props.value,
                index: index
            }, child.props.children));
            index++;
        });
        return children;
    }

    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);
        let { onChangeSelect, onDroppedDown, onCloseUp, multiple, searchEnabled, maxSelectedOptions,
            maxShowOptions, placeHolder, captionHeader, selectedTextFormat, showActionsBox, showTick, dataSource,
            showMenuArrow, disabled, width, primary, secondary, info, danger, success, warning, container, dropup } = this.props;

        let dataStyle;
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

        let className = classNames(
            (colClasses.length > 0 ? "form-control" : ""),
            (this.props.className ? this.props.className : ""));


        let newChildren;
        if (this.props.lookupDataSource) {
            newChildren = this.buildChildrensFromDataSource();
        } else if (this.props.children) {
            newChildren = this.rebuildChildrens();
        }

        if (this.props.id) {
            this.idSelect = this.props.id;
        }

        if (colClasses.length > 0) {
            return (<div className={classNames(colClasses)}>
                <select onChange={this.onChangeSelect} readOnly={readOnly} id={this.idSelect} className={className} ref={ref => this.select = ref} value={this.state.value}>
                    {newChildren}
                </select>
            </div>);
        } else {
            return (<select onChange={this.onChangeSelect} readOnly={readOnly} id={this.idSelect} className={className} ref={ref => this.select = ref} value={this.state.value} >
                {newChildren}
            </select>);
        }
    }

}

AnterosLookupCombobox.propTypes = {
    lookupDataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    lookupDataFieldText: PropTypes.string,
    lookupDataFieldId: PropTypes.string,

    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataFieldId: PropTypes.string,

    dataField: PropTypes.string,
    onChangeSelect: PropTypes.func,
    multiple: PropTypes.bool.isRequired,
    searchEnabled: PropTypes.bool.isRequired,
    maxSelectedOptions: PropTypes.number.isRequired,
    placeHolder: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    width: PropTypes.string,
    primary: PropTypes.bool,
    secondary: PropTypes.bool,
    info: PropTypes.bool,
    danger: PropTypes.bool,
    success: PropTypes.bool,
    warning: PropTypes.bool,
    container: PropTypes.string,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    value: PropTypes.any
};

AnterosLookupCombobox.defaultProps = {
    multiple: false,
    multipleSeparator: ', ',
    searchEnabled: false,
    maxSelectedOptions: 0,
    placeHolder: 'Selecione uma opção',
    disabled: false,
    primary: false,
    secondary: false,
    info: false,
    danger: false,
    success: false,
    warning: false,
    lookupDataFieldText: 'id',
    lookupDataFieldId: 'text',
    value: ''
};




export class AnterosLookupComboboxOption extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { divider, group, name, children, disabled, style,
            icon, content, className, label, value } = this.props;
        if (group) {
            return (
                <optgroup label={label}>
                    {children}
                </optgroup>
            );
        } else if (divider) {
            return (<option data-divider={true} />);
        } else {
            return (
                <option
                    disabled={disabled}
                    value={value}
                    style={style} className={className}>
                    {children && children.length > 0 ? children : label}
                </option>
            );
        }
    }
}

AnterosLookupComboboxOption.propTypes = {
    label: PropTypes.string,
    value: PropTypes.any,
    subText: PropTypes.string,
    group: PropTypes.bool,
    divider: PropTypes.bool,
    disabled: PropTypes.bool,
    title: PropTypes.string,
    style: PropTypes.string,
    className: PropTypes.string,
    icon: PropTypes.string,
    content: PropTypes.element
};

AnterosLookupComboboxOption.defaultProps = {
    primary: false,
    secondary: false,
    info: false,
    danger: false,
    success: false,
    warning: false
};


