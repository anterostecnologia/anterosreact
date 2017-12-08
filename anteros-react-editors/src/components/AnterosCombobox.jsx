import React from 'react'
import 'script-loader!chosen-js/chosen.jquery.min.js';
import lodash from 'lodash';
import classNames from "classnames";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosError } from "anteros-react-core";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";

export default class AnterosCombobox extends React.Component {
    constructor(props) {
        super(props);
        this.onChangeSelect = this.onChangeSelect.bind(this);
        this.onDroppedDown = this.onDroppedDown.bind(this);
        this.onCloseUp = this.onCloseUp.bind(this);
        this.rebuildChildrens = this.rebuildChildrens.bind(this);
        this.idSelect = lodash.uniqueId('select');
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.loadData = false;
        this.children = this.rebuildChildrens();
        this.applyChosen = this.applyChosen.bind(this);
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            this.state = { value, update: Math.random() };
        } else {
            this.state = { value: this.props.value, udpate: Math.random() };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }

    componentDidMount() {
        this.applyChosen(this.props);

        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    applyChosen(props){
               let _this = this;
        $(this.select).chosen({
            no_results_text: "Oops, texto não encontrado!",
            placeholder_text_single: props.placeHolder,
            placeholder_text_multiple: props.placeHolder,
            search_contains: true,
            width: this.props.width,
            max_selected_options: props.maxSelectedOptions,
            allow_single_deselect: true,
            disable_search: !props.searchEnabled

        }).change(this.onChangeSelect).on('change', function (e) {
            if (props.multiple) {
                let result = '';
                let appendDelimiter = false;
                $(_this.select).val().forEach(function (value) {
                    if (appendDelimiter)
                        result += ',';
                    result += value;
                    appendDelimiter = true;
                });

                if (props.dataSource) {
                    props.dataSource.setFieldByName(props.dataField, result);
                }

                if (props.onChangeSelect) {
                    props.onChangeSelect(result);
                }
            }
        });

        $('#'+this.idSelect+'_chosen')[0].style.maxWidth = props.maxWidth;
        $('#'+this.idSelect+'_chosen')[0].style.width = props.width;
        $('#'+this.idSelect+'_chosen')[0].style.minWidth = props.minWidth;

        if (props.dataSource) {
            let value = props.dataSource.fieldByName(props.dataField);
            this.state = { value, update: Math.random() };
        } else {
            this.state = { value: props.value, update: Math.random() };
        }
    }

    componentDidUpdate() {
        $(this.select).trigger('chosen:updated');
    }

    componentWillReceiveProps(nextProps) {       
        if (this.props.multiple != nextProps.multiple){
            this.applyChosen(nextProps);
        }
        $(this.select).trigger('chosen:updated');
         this.setState({ ...this.state, value: nextProps.value, update: Math.random() });
    }


    componentWillUnmount() {
        $(this.select).chosen("destroy");

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
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            this.setState({ ...this.state, value, update: Math.random() });
        }
    }


    onChangeSelect(event, selectedValue) {
        if (selectedValue != undefined && selectedValue.selected != undefined && selectedValue.selected != '') {
            if (this.props.dataSource) {
                this.props.dataSource.setFieldByName(this.props.dataField, selectedValue.selected);
            }

            if (this.props.onChangeSelect) {
                this.props.onChangeSelect(selectedValue.selected);
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



    rebuildChildrens() {
        this.children = [];
        let index = 0;
        let _this = this;
        this.children.push(React.createElement(AnterosComboboxOption, {
            key: index,
            label: '',
            group: undefined,
            divider: undefined,
            disabled: false,
            style: undefined,
            className: undefined,
            icon: undefined,
            content: undefined,
            index: index,
            value: ''
        }, ''));
        index++;
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            _this.children.push(React.createElement(AnterosComboboxOption, {
                key: (_this.props.id ? _this.props.id + "_" + index : _this.idSelect + "_" + index),
                label: (child.props.label ? child.props.label : child.props.value),
                group: child.props.group,
                divider: child.props.divider,
                disabled: child.props.disabled,
                style: child.props.style,
                className: child.props.className,
                icon: child.props.icon,
                content: child.props.content,
                index: index,
                value: child.props.value
            }, child.props.children));
            index++;
        });
        return this.children;
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

        let className = classNames((colClasses.length > 0 ? "form-control" : ""),
            (this.props.className ? this.props.className : ""));


        let newChildren = this.rebuildChildrens();

        if (this.props.id) {
            this.idSelect = this.props.id;
        }
        let _multiple = {}
        if (this.props.multiple) {
            _multiple = { multiple: true };
        }

        let newValue = this.state.value;
        if (multiple && newValue) {
            newValue = newValue.replace(/'/g, "");
        }

        if (colClasses.length > 0) {
            return (<div className={classNames(colClasses)}>
                <select {..._multiple} onChange={this.onChangeSelect} readOnly={readOnly} id={this.idSelect} className={className} ref={ref => this.select = ref} value={newValue}>
                    {newChildren}
                </select>
            </div>);
        } else {
            return (<select {..._multiple} onChange={this.onChangeSelect} readOnly={readOnly} id={this.idSelect} className={className} ref={ref => this.select = ref} value={newValue} >
                {newChildren}
            </select>);
        }
    }

}

AnterosCombobox.propTypes = {
    dataSource: React.PropTypes.oneOfType([
        React.PropTypes.instanceOf(AnterosLocalDatasource),
        React.PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: React.PropTypes.string,
    onChangeSelect: React.PropTypes.func,
    onDroppedDown: React.PropTypes.func,
    onCloseUp: React.PropTypes.func,
    multiple: React.PropTypes.bool.isRequired,
    multipleSeparator: React.PropTypes.string.isRequired,
    searchEnabled: React.PropTypes.bool.isRequired,
    maxSelectedOptions: React.PropTypes.number.isRequired,
    placeHolder: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    minWidth: React.PropTypes.string,
    width: React.PropTypes.string,
    primary: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    info: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    success: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    container: React.PropTypes.string,
    dropup: React.PropTypes.bool,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    value: React.PropTypes.string
};

AnterosCombobox.defaultProps = {
    multiple: false,
    multipleSeparator: ', ',
    searchEnabled: false,
    maxSelectedOptions: 0,
    maxShowOptions: 0,
    placeHolder: 'Selecione uma opção',
    selectedTextFormat: 'values',
    showTick: true,
    showMenuArrow: false,
    showActionsBox: false,
    disabled: false,
    primary: false,
    secondary: false,
    info: false,
    danger: false,
    success: false,
    warning: false,
    width: ''
};




export class AnterosComboboxOption extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { divider, group, name, children, disabled, keyWordsToSearch, title, style,
            icon, content, subText, className, label, value } = this.props;

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

AnterosComboboxOption.propTypes = {
    label: React.PropTypes.string,
    group: React.PropTypes.bool,
    divider: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    style: React.PropTypes.string,
    className: React.PropTypes.string,
    icon: React.PropTypes.string,
    content: React.PropTypes.element,
    value: React.PropTypes.string.isRequired
};

AnterosComboboxOption.defaultProps = {
    primary: false,
    secondary: false,
    info: false,
    danger: false,
    success: false,
    warning: false
};


