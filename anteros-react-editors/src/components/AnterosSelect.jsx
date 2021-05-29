import React, { createElement, Children, Component } from 'react';
import 'script-loader!bootstrap-select/dist/js/bootstrap-select.min.js'
import lodash from 'lodash';
import { buildGridClassNames, columnProps } from "@anterostecnologia/anteros-react-layout";
import { AnterosError, AnterosUtils } from "@anterostecnologia/anteros-react-core";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "@anterostecnologia/anteros-react-datasource";
import PropTypes from 'prop-types';


export default class AnterosSelect extends Component {
    constructor(props) {
        super(props);
        this.onChangeSelect = this.onChangeSelect.bind(this);
        this.onDroppedDown = this.onDroppedDown.bind(this);
        this.onCloseUp = this.onCloseUp.bind(this);
        this.buildChildrensFromDataSource = this.buildChildrensFromDataSource.bind(this);
        this.rebuildChildrens = this.rebuildChildrens.bind(this);
        this.idSelect = lodash.uniqueId('select');
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.updateSelect = this.updateSelect.bind(this);
    }

    componentDidMount() {
        this.updateSelect();
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

    updateSelect() {
        $(this.select).selectpicker('destroy');
        $(this.select).selectpicker({
            selectAllText: 'Todos',
            deselectAllText: 'Nenhum',
            multipleSeparator: this.props.multipleSeparator
        });
        $(this.select).on('changed.bs.select', this.onChangeSelect);
        $(this.select).on('show.bs.select', this.onDroppedDown)
        $(this.select).on('hide.bs.select', this.onCloseUp);

        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            $(this.select).val(value).trigger('change.select2');
        } else {
            $(this.select).val(this.props.value).trigger('change.select2');
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            $(this.select).val(value).trigger('change.select2');
        } else {
            $(this.select).val(nextProps.value).trigger('change.select2');
        }
    }

    componentWillUnmount() {
        $(this.select).selectpicker('destroy');
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
        if (event == dataSourceEvents.AFTER_OPEN || event == dataSourceEvents.AFTER_CLOSE) {
            updateSelect();
            $(this.select).val('').trigger('change.select2');
        } else {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            $(this.select).val(value).trigger('change.select2');
        }
    }

    onChangeSelect(event, clickedIndex, newValue, oldValue) {
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, newValue);
        } else {
            this.setState({ value: newValue });
        }

        if (this.props.onChangeSelect) {
            this.props.onChangeSelect(clickedIndex, newValue, oldValue);
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
        this.props.dataSource.first();
        do {
            let record = this.props.dataSource.getCurrentRecord();

            if (!record.hasOwnProperty(_this.props.dataFieldId) || (!record[_this.props.dataFieldId])) {
                throw new AnterosError("Foi encontrado um registro sem ID no dataSource passado para o Select.");
            }
            if (!record.hasOwnProperty(_this.props.dataFieldText) || (!record[_this.props.dataFieldText])) {
                throw new AnterosError("Foi encontrado um registro sem o texto no dataSource passado para o Select.");
            }

            children.push(createElement(AnterosSelectOption, {
                key: record[_this.props.dataFieldId] + "_" + index,
                label: (record.label ? record.label : record[_this.props.dataFieldText]),
                text: record[_this.props.dataFieldText],
                subText: record.subText,
                group: record.group,
                divider: record.divider,
                disabled: record.disabled,
                keyWordsToSearch: record.keyWordsToSearch,
                title: record.title,
                style: record.style,
                className: record.className,
                icon: record.icon,
                content: record.content,
                index: index
            }, record[_this.props.dataFieldText]));
            index++;
            if (this.props.dataSource.hasNext()){
                this.props.dataSource().next();
            } else {
                break;
            }
        } while (true)
        return children;
    }

    rebuildChildrens() {
        let children = [];
        let index = 0;
        let _this = this;
        let arrChildren = Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            children.push(createElement(AnterosSelectOption, {
                key: (_this.props.id ? _this.props.id + "_" + index : _this.idSelect + "_" + index),
                label: child.props.label,
                subText: child.props.subText,
                group: child.props.group,
                divider: child.props.divider,
                disabled: child.props.disabled,
                keyWordsToSearch: child.props.keyWordsToSearch,
                title: child.props.title,
                style: child.props.style,
                className: child.props.className,
                icon: child.props.icon,
                content: child.props.content,
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

        let options = {
            "multiple": multiple,
            "data-live-search": searchEnabled,
            "data-max-options": maxSelectedOptions,
            "data-actions-box": showActionsBox,
            "title": placeHolder,
            "data-selected-text-format": selectedTextFormat,
            "data-width": width,
            "data-size": maxShowOptions,
            "data-actions-box": showActionsBox,
            "data-header": captionHeader,
            "disabled": disabled,
            "data-container": container,
            "data-style": dataStyle
        };

        let className = AnterosUtils.buildClassNames("selectpicker",
            (showTick ? "show-tick" : ""),
            (showMenuArrow ? "show-menu-arrow" : ""),
            (dropup ? "dropup" : ""),
            (colClasses.length > 0 ? "form-control" : ""),
            (this.props.className ? this.props.className : ""));


        let newChildren;
        if (this.props.dataSource) {
            newChildren = this.buildChildrensFromDataSource();
        } else if (this.props.children) {
            newChildren = this.rebuildChildrens();
        }

        if (this.props.id) {
            this.idSelect = this.props.id;
        }

        if (colClasses.length > 0) {
            return (<div className={AnterosUtils.buildClassNames(colClasses)}>
                <select readOnly={readOnly} id={this.idSelect} className={className} ref={ref => this.select = ref} {...options}>
                    {newChildren}
                </select>
            </div>);
        } else {
            return (<select readOnly={readOnly} id={this.idSelect} className={className} ref={ref => this.select = ref} {...options}>
                {newChildren}
            </select>);
        }
    }

}

AnterosSelect.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    onChangeSelect: PropTypes.func,
    onDroppedDown: PropTypes.func,
    onCloseUp: PropTypes.func,
    multiple: PropTypes.bool.isRequired,
    multipleSeparator: PropTypes.string.isRequired,
    searchEnabled: PropTypes.bool.isRequired,
    maxSelectedOptions: PropTypes.number.isRequired,
    maxShowOptions: PropTypes.number.isRequired,
    placeHolder: PropTypes.string.isRequired,
    captionHeader: PropTypes.string,
    selectedTextFormat: PropTypes.string.isRequired,
    showActionsBox: PropTypes.bool.isRequired,
    showTick: PropTypes.bool.isRequired,
    showMenuArrow: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    width: PropTypes.string,
    primary: PropTypes.bool,
    secondary: PropTypes.bool,
    info: PropTypes.bool,
    danger: PropTypes.bool,
    success: PropTypes.bool,
    warning: PropTypes.bool,
    container: PropTypes.string,
    dropup: PropTypes.bool,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    dataFieldText: PropTypes.string,
    dataFieldId: PropTypes.string,
    value: PropTypes.string
};

AnterosSelect.defaultProps = {
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
    dataFieldId: 'id',
    dataFieldText: 'text'
};




export class AnterosSelectOption extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { divider, group, name, children, disabled, keyWordsToSearch, title, style,
            icon, content, subText, className, label } = this.props;
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
                <option data-tokens={keyWordsToSearch} title={title} data-subtext={subText}
                    disabled={disabled} data-content={content}
                    data-icon={icon} style={style} className={className}>
                    {children}
                </option>
            );
        }
    }
}

AnterosSelectOption.propTypes = {
    label: PropTypes.string,
    subText: PropTypes.string,
    group: PropTypes.bool,
    divider: PropTypes.bool,
    disabled: PropTypes.bool,
    keyWordsToSearch: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.string,
    className: PropTypes.string,
    icon: PropTypes.string,
    content: PropTypes.element
};

AnterosSelectOption.defaultProps = {
    primary: false,
    secondary: false,
    info: false,
    danger: false,
    success: false,
    warning: false
};


