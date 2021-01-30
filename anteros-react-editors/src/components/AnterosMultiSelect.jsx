import PropTypes from 'prop-types'
import { createElement, Children, Component } from 'react';
import lodash from 'lodash'
import {buildGridClassNames, columnProps} from "@anterostecnologia/anteros-react-layout";
import {AnterosError, AnterosUtils} from "@anterostecnologia/anteros-react-core";
import {AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents} from "@anterostecnologia/anteros-react-datasource";
var multi = require('./AnterosMultiSelect.js');

var trigger_event = function( type, el ) {
    var e = document.createEvent( 'HTMLEvents' );
    e.initEvent( type, false, true );
    el.dispatchEvent( e );
};

class AnterosMultiSelect extends Component {
    constructor(props) {
        super(props)
        this.buildChildrensFromDataSource = this
            .buildChildrensFromDataSource
            .bind(this);
        this.rebuildChildrens = this
            .rebuildChildrens
            .bind(this);
        this.idSelect = lodash.uniqueId('multiSelect');
        this.onDatasourceEvent = this
            .onDatasourceEvent
            .bind(this);
        this.updateSelect = this
            .updateSelect
            .bind(this);
        this.onChangeSelect = this
            .onChangeSelect
            .bind(this);
        this.getSelectedValues = this
            .getSelectedValues
            .bind(this);
        this.setSelectedValues = this.setSelectedValues.bind(this);   

    }

    componentDidMount() {
        this.updateSelect();
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
    }
    onChangeSelect(event) {
        let newValue = this.getSelectedValues();
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, newValue);        
        }

        if (this.props.onChangeSelect) {
            this.props.onChangeSelect(newValue);
        }
    }

    getSelectedValues() {
        let result = '';
        let appendSeparator = false;
        if (this.select) {
            for(var i = 0; i < this.select.options.length; i++) {
                var option = this.select.options[i];
                if (option.selected) {
                    if (appendSeparator) {
                        result += this.props.multipleSeparator;
                    }
                    result = result + option.value;
                    appendSeparator = true;
                }
            }
        }
        return result;
    }

    setSelectedValues(values) {
        if (this.select && values) {
            for(var i = 0; i < this.select.options.length; i++) {
                var option = this.select.options[i];
                for(var j=0; j < values.length; j++){
                    if (values[j]==option.value){
                        option.selected = true;
                    }
                }
            }
        }
    }

    updateSelect() {
        let options = {
            "enable_search": this.props.searchEnabled,
            "search_placeholder": this.props.searchPlaceHolder,
            "non_selected_header": this.props.nonSelectedHeader,
            "selected_header": this.props.selectedHeader
        };

        $(this.select, options).multi(options);
        $(this.select).on('change', this.onChangeSelect);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps
                .dataSource
                .fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
        } else {}
    }

    componentWillUnmount() {
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

    onDatasourceEvent(event, error) {
        if (event == dataSourceEvents.AFTER_OPEN || event == dataSourceEvents.AFTER_CLOSE) {
            this.updateSelect();

        } else {
            let value = this
                .props
                .dataSource
                .fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            setSelectedValues(value);
            trigger_event( 'change', this.select );
        }
    }

    buildChildrensFromDataSource() {
        let children = [];
        let index = 0;
        let _this = this;
        this
            .props
            .dataSourceSelect
            .first();
        do {
            let record = this
                .props
                .dataSourceSelect
                .getCurrentRecord();

            if (!record.hasOwnProperty(_this.props.dataFieldId) || (!record[_this.props.dataFieldId])) {
                throw new AnterosError("Foi encontrado um registro sem ID no dataSource passado para o MultiSelect.");
            }
            if (!record.hasOwnProperty(_this.props.dataFieldText) || (!record[_this.props.dataFieldText])) {
                throw new AnterosError("Foi encontrado um registro sem o texto no dataSource passado para o MultiSelect.");
            }

            children.push(createElement(AnterosMultiSelectOption, {
                key: record[_this.props.dataFieldId] + "_" + index,
                label: (record.label
                    ? record.label
                    : record[_this.props.dataFieldText]),
                value: record[_this.props.dataFieldText],
                subText: record.subText,
                group: record.group,
                divider: record.divider,
                disabled: record.disabled,
                title: record.title,
                style: record.style,
                className: record.className,
                icon: record.icon,
                content: record.content,
                index: index
            }, record[_this.props.dataFieldText]));
            index++;
            if (this.props.dataSourceSelect.hasNext()) {
                this
                    .props
                    .dataSource()
                    .next();
            } else {
                break;
            }
        } while (true)return children;
    }

    rebuildChildrens() {
        let children = [];
        let index = 0;
        let _this = this;
        let arrChildren = Children
            .toArray(this.props.children);
        arrChildren.forEach(function (child) {
            children.push(createElement(AnterosMultiSelectOption, {
                key: (_this.props.id
                    ? _this.props.id + "_" + index
                    : _this.idSelect + "_" + index),
                label: (child.props
                    ? child.props.label
                    : ''),
                value: child.props.value,    
                divider: (child.props
                    ? child.props.divider
                    : ''),
                disabled: (child.props
                    ? child.props.disabled
                    : false),
                title: (child.props
                    ? child.props.title
                    : ''),
                style: (child.props
                    ? child.props.style
                    : undefined),
                className: (child.props
                    ? child.props.className
                    : undefined),
                icon: (child.props
                    ? child.props.icon
                    : undefined),
                content: (child.props
                    ? child.props.content
                    : undefined),
                index: index
            }, (child.props
                ? child.props.children
                : null)));
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
        let {
            dataSource,
            searchEnabled,
            searchPlaceHolder,
            nonSelectedHeader,
            selectedHeader,
            disabled,
            primary,
            secondary,
            info,
            danger,
            success,
            warning
        } = this.props;

        let dataStyle;

        let className = AnterosUtils.buildClassNames((colClasses.length > 0
            ? "form-control"
            : ""), (this.props.className
            ? this.props.className
            : ""));

        let newChildren;
        if (this.props.dataSourceSelect) {
            newChildren = this.buildChildrensFromDataSource();
        } else if (this.props.children) {
            newChildren = this.rebuildChildrens();
        }

        if (this.props.id) {
            this.idSelect = this.props.id;
        }

        if (colClasses.length > 0) {
            return (
                <div className={AnterosUtils.buildClassNames(colClasses)}>
                    <select
                        readOnly={readOnly}
                        id={this.idSelect}
                        className={className}
                        multiple={true}
                        ref={ref => this.select = ref}>
                        {newChildren}
                    </select>
                </div>
            );
        } else {
            return (
                <select
                    readOnly={readOnly}
                    id={this.idSelect}
                    className={className}
                    multiple={true}
                    ref={ref => this.select = ref}>
                    {newChildren}
                </select>
            );
        }
    }

}

AnterosMultiSelect.propTypes = {
    dataSource: PropTypes
        .oneOfType([
            PropTypes
                .instanceOf(AnterosLocalDatasource),
            PropTypes
                .instanceOf(AnterosRemoteDatasource)
        ]),
    dataField: PropTypes.string,
    onChangeSelect: PropTypes.func,
    multipleSeparator: PropTypes.string.isRequired,
    searchEnabled: PropTypes.bool.isRequired,
    searchPlaceHolder: PropTypes.string.isRequired,
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
    dataSourceSelect : 
    PropTypes
    .oneOfType([
        PropTypes
            .instanceOf(AnterosLocalDatasource),
        PropTypes
            .instanceOf(AnterosRemoteDatasource)
    ]),
    dataFieldText: PropTypes.string,
    dataFieldId: PropTypes.string,
    value: PropTypes.string
};

AnterosMultiSelect.defaultProps = {
    multipleSeparator: ',',
    searchEnabled: false,
    placeHolder: 'Selecione uma opção',
    searchPlaceHolder: 'Filtro',
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

class AnterosMultiSelectOption extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
    }

    render() {
        const {
            divider,
            group,
            name,
            children,
            disabled,
            title,
            style,
            icon,
            content,
            subText,
            className,
            label,
            value
        } = this.props;

        if (group) {
            return (
                <optgroup label={label}>
                    {children}
                </optgroup>
            );
        } else if (divider) {
            return (<option data-divider={true}/>);
        } else {
            return (
                <option
                    title={title}
                    data-subtext={subText}
                    disabled={disabled}
                    data-content={content}
                    data-icon={icon}
                    value={value}
                    style={style}
                    className={className}>
                    {label}
                </option>
            );
        }
    }
}

AnterosMultiSelectOption.propTypes = {
    label: PropTypes.string,
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

AnterosMultiSelectOption.defaultProps = {
    primary: false,
    secondary: false,
    info: false,
    danger: false,
    success: false,
    warning: false
};

export {AnterosMultiSelect, AnterosMultiSelectOption};