import React, { Component } from 'react';
import 'script-loader!bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min.js'
import 'bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css';
import lodash from "lodash";
import classNames from "classnames";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";

export default class AnterosColorPicker extends React.Component {
    constructor(props) {
        super(props);
        this.idColorPicker = lodash.uniqueId("colorPicker");
        this.handleChange = this.handleChange.bind(this);
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
        $(this.divInput).colorpicker({
            format: _this.props.format
        });

        $(this.divInput).on('changeColor.colorpicker', function (event) {
            let value = "";
            if (_this.props.format == "rgb") {
                value = $(_this.divInput).data('colorpicker').color.toRGB();
            } else if (_this.props.format == "hex") {
                value = $(_this.divInput).data('colorpicker').color.toHex()
            } else {
                value = $(_this.divInput).data('colorpicker').color.toHSL()
            }

            if (_this.props.dataSource && _this.props.dataSource.getState !== 'dsBrowse') {
                _this.props.dataSource.setFieldByName(_this.props.dataField, value);
            } else {
                _this.setState({ value: value });
            }
            if (_this.props.onChange) {
                _this.props.onChange(event);
            }
        });

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
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, event.target.value);
        } else {
            this.setState({ value: event.target.value });
        }
        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }
        const colClasses = buildGridClassNames(this.props, false, []);
        let className = classNames("input-group colorpicker-component colorpicker-element",
            (this.props.className ? this.props.className : ""), colClasses);

        if (this.props.id) {
            this.idColorPicker = this.props.id;
        }
        return (
            <div id={this.idColorPicker} className={className} ref={ref => this.divInput = ref} style={{ ...this.props.style, width: this.props.width }}>
                <input disabled={(this.props.disabled ? true : false)} ref={ref => this.input = ref} type="text" value={this.state.value} className="form-control" onChange={this.handleChange} readOnly={readOnly} />
                <span className="input-group-addon"><i style={{ backgroundColor: this.props.value }} ></i></span>
            </div>
        );
    }
}


AnterosColorPicker.propTypes = {
    dataSource: React.PropTypes.oneOfType([
        React.PropTypes.instanceOf(AnterosLocalDatasource),
        React.PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: React.PropTypes.string,
    value: React.PropTypes.string.isRequired,
    format: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    onChange: React.PropTypes.func
};

AnterosColorPicker.defaultProps = {
    value: '',
    format: 'hex'
}