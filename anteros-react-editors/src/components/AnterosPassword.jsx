import React, { Component } from 'react';
import lodash from "lodash";
import { If, Then, AnterosUtils } from "anteros-react-core";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import PropTypes from 'prop-types';


export default class AnterosPassword extends React.Component {
    constructor(props) {
        super(props);
        this.idPassword = lodash.uniqueId("password");
        this.handleChange = this.handleChange.bind(this);
        this.handleCheckChange = this.handleCheckChange.bind(this);
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            this.state = { value: value, reveal: this.props.reveal };
        } else {
            this.state = { value: this.props.value, reveal: this.props.reveal };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            this.setState({ value: value, reveal: nextProps.reveal });
        } else {
            this.setState({ value: nextProps.value, reveal: nextProps.reveal });
        }
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
        this.setState({ ...this.state, value: value });
    }

    handleChange(event) {
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, event.target.value);
        } else {
            this.setState({ ...this.state, value: event.target.value });
        }
        if (this.props.onChange) {
            this.props.onChange(event, event.target.value);
        }
    }

    handleCheckChange(event) {
        this.setState({ ...this.state, reveal: !this.state.reveal })
    }

    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);

        let className = AnterosUtils.buildClassNames("form-control",
            (this.props.className ? this.props.className : ""),
            (this.props.inputGridSize ? " col-sm-" + this.props.inputGridSize : "")
            );

        if (this.props.id) {
            this.idPassword = this.props.id;
        }
        let classNameLabel = AnterosUtils.buildClassNames("control-label", (this.props.labelGridSize ? "col-sm-" + this.props.labelGridSize : ""));

        let edit = <div>
            <If condition={this.props.label != undefined}>
                <Then>
                    <label className={classNameLabel}>{this.props.label}</label>
                </Then>
            </If>
            <div className="input-group" style={{ width: this.props.width }}>
                <input data-toggle="password"
                    id={this.idPassword}
                    data-placement="before"
                    className={className}
                    type={this.state.reveal ? 'text' : 'password'}
                    disabled={(this.props.disabled ? true : false)}
                    style={{ ...this.props.style }}
                    maxLength={this.props.maxLenght}
                    value={this.state.value}
                    placeholder={this.props.placeHolder}
                    readOnly={readOnly}
                    required={this.props.required}
                    onChange={this.handleChange}
                />
                <div id="showPassword" className="input-group-addon" onClick={this.handleCheckChange.bind(this)}>
                    <i className={this.state.checked ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
                </div>
            </div>
        </div>;

        if (colClasses.length > 0) {
            return (<div className={AnterosUtils.buildClassNames(colClasses)}>
                {edit}
            </div>);
        } else {
            return edit
        }
    }
}


AnterosPassword.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    value: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,
    maxLenght: PropTypes.number,
    reveal: PropTypes.bool.isRequired,
    label: PropTypes.string,
    inputGridSize: PropTypes.number,
    labelGridSize: PropTypes.number,
    required: PropTypes.bool.isRequired,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
};

AnterosPassword.defaultProps = {
    value: '',
    placeHolder: '',
    reveal: false,
    required: true
}