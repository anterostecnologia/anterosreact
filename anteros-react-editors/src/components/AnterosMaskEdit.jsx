import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosError } from "anteros-react-core";
import lodash from "lodash";
import {AnterosUtils} from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import 'script-loader!jquery.inputmask/dist/jquery.inputmask.bundle.js';
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";



export default class AnterosMaskEdit extends Component {

    constructor(props) {
        super(props);

        if (!props.mask && !props.maskPattern) {
            throw new AnterosError('Informe a máscara ou o padrão de máscara para o AnterosMaskEdit.');
        }
        this.idEdit = lodash.uniqueId("maskEdit");
        this.onComplete = this.onComplete.bind(this);
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            this.state = { value: value };
        } else {
            this.state = { value: this.props.value };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            this.state = { value: value };
        } else {
            this.state = { value: nextProps.value };
        }
    }

    componentDidMount() {
        let _this = this;
        if (this.props.maskPattern == 'cnpj') {
            $(this.input).inputmask('99.999.999/9999-99', { "alias": this.props.placeHolder,"oncomplete": function(){ 
                _this.onComplete(_this.input.inputmask.unmaskedvalue());
            } });
        } else if (this.props.maskPattern == 'cpf') {
            $(this.input).inputmask('999.999.999-99', { "alias": this.props.placeHolder,"oncomplete": function(event){ 
                _this.onComplete(_this.input.inputmask.unmaskedvalue());
            } });
        } else if (this.props.maskPattern == 'cep') {
            $(this.input).inputmask('99999-999', { "alias": this.props.placeHolder, "oncomplete": function(event){ 
                _this.onComplete(_this.input.inputmask.unmaskedvalue());
            } });
        } else if (this.props.maskPattern == 'fone') {
            $(this.input).inputmask({
                mask: ["(99) 9999-9999", "(99) 99999-9999",],
                keepStatic: true, "alias": this.props.placeHolder, "oncomplete": function(event){ 
                _this.onComplete(_this.input.inputmask.unmaskedvalue());
            }
            });
        } else {
            $(this.input).inputmask(this.props.mask, { "alias": this.props.placeHolder, "oncomplete": function(event){ 
                _this.onComplete(_this.input.inputmask.unmaskedvalue());
            } });
        }

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

    componentWillUnmount() {
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

    handleChange(event) {
        onComplete(event.target.value);
    }

    onComplete(value){
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, value);
        } else {
            this.setState({ value });
        }
        if (this.props.onChange) {
            this.props.onChange(value);
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
            this.idEdit = this.props.id;
        }

        const edit = <input id={this.idEdit}
            className={className}
            disabled={(this.props.disabled ? true : false)}
            style={{ ...this.props.style, width: this.props.width }}
            readOnly={readOnly}
            onFocus={this.props.onFocus}
            onChange={this.handleChange}
            value={this.state.value}
            ref={ref => (this.input = ref)} type='text' />;


        if (colClasses.length > 0) {
            return (<div className={AnterosUtils.buildClassNames(colClasses)}>
                {edit}
            </div>);
        } else {
            return edit
        }
    }
}


AnterosMaskEdit.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    mask: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    maskPattern: PropTypes.oneOf(['cnpj', 'cpf', 'fone', 'cep']),
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    onFocus: PropTypes.func,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    style: PropTypes.object
};

AnterosMaskEdit.defaultProps = {
    disabled: false
}

