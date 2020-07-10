import React, { Component } from 'react';
import 'script-loader!bootstrap-maxlength/src/bootstrap-maxlength.js'
import lodash from "lodash";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import { AnterosJacksonParser,AnterosStringUtils,AnterosObjectUtils, AnterosUtils } from "anteros-react-core";
import PropTypes from 'prop-types';



export default class AnterosLookupEdit extends React.Component {
    constructor(props) {
        super(props);
        this.idEdit = lodash.uniqueId("lkpEdit");
        this.handleChange = this.handleChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onBlur = this.onBlur.bind(this);
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.lookupField);
            if (!value) {
                value = '';
            }
            this.state = { value: value };
        } else {
            let value = '';
            if (this.props.value)
               value = this.props.value;
            this.state = { value: value };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.lookupField);
            if (!value) {
                value = '';
            }
            this.setState({ ...this.state, value: value });
        } else {
            let value = '';
            if (nextProps.value)
               value = this.props.value;
            this.setState({ ...this.state, value: nextProps.value });
        }
    }

    componentDidMount() {
        let _this = this;
        if (this.props.maxLenght > 0) {
            $(this.input).maxlength({
                alwaysShow: true,
                warningClass: "label label-input-success",
                limitReachedClass: "label label-input-danger"
            });
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
        let value = this.props.dataSource.fieldByName(this.props.lookupField);
        if (!value) {
            value = '';
        }
        this.setState({ value: value });
    }

    handleChange(event) {
        let _this = this;
        let value = event.target.value;
        if (!value) {
            value = '';
        }
        this.setState({ value: value });
        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    onBlur(event){
        const value = this.state?this.state.value:'';
        let _this = this;
        if (_this.props.dataSource && this.props.dataSource.getState() != 'dsBrowse') {
            if (value != _this.props.dataSource.fieldByName(this.props.lookupField)) {
                if (value != "" && value != "0") {
                    let promise = this.props.onLookupData(value);
                    if (!promise instanceof Promise) {
                        throw new AnterosError('onLookupData deve retornar um objeto Promise. AnterosLookupEdit.');
                    }
                    promise.then(function (data) {
                        if ((data == "") || (data == undefined) || (data == null)) {
                            if (_this.props.validateOnExit == true) {
                                if (_this.props.onLookupDataError) {
                                    _this.props.onLookupDataError(AnterosStringUtils.format(_this.props.validateMessage, value));
                                }
                            }
                        }

                        let newData = AnterosJacksonParser.convertJsonToObject(data);
                        if (_this.props.onLookupResult) {
                            _this.props.onLookupResult(newData);
                        }

                        if ((newData == "") || (newData == undefined)){
                            newData = null;
                        }
                        _this.props.dataSource.setFieldByName(_this.props.dataField, newData);

                    }, function (err) {
                        _this.props.onLookupDataError(err.message);
                        _this.input.focus();
                    });
                } else {
                    _this.props.dataSource.setFieldByName(_this.props.dataField, "");
                }
            }
        } else {
            if (value != "") {
                let promise = _this.props.onLookupData(value);
                if (!promise instanceof Promise) {
                    throw new AnterosError('onLookupData deve retornar um objeto Promise. AnterosLookupEdit.');
                }
                promise.then(function (data) {
                    if ((data == "") || (data == undefined) || (data == null)) {
                        if (_this.props.validateOnExit == true) {
                            if (_this.props.onLookupDataError) {
                                _this.props.onLookupDataError(AnterosStringUtils.format(_this.props.validateMessage, value));
                            }
                        }
                    }
                    let newData = AnterosJacksonParser.convertJsonToObject(data);
                    if (_this.props.onLookupResult) {
                        _this.props.onLookupResult(newData);
                    }
                    let newValue = AnterosObjectUtils.getNestedProperty(newData, _this.props.lookupField);
                    if (!newValue) {
                        newValue = '';
                    }
                    _this.setState({ value: newValue });
                }, function (err) {
                    _this.props.onLookupDataError(err.message);
                    _this.input.focus();
                });
            }
        }
    }

    onKeyPress(event) {
        if (this.props.onKeyPress) {
            this.props.onKeyPress(event);
        }
    }

    onKeyDown(event) {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(event);
        }
    }

    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);

        if (this.props.id) {
            this.idEdit = this.props.id;
        }
        let className = AnterosUtils.buildClassNames("input-group",
            (this.props.className ? this.props.className : ""),
            colClasses);

        let width = this.props.width;
        if (colClasses.length > 0) {
            width = "";
        }

        let icon;
        if (this.props.icon) {
            icon = (<i data-user={this.props.dataUser}
                onClick={this.onButtonClick}
                className={this.props.icon}
                style={{ color: this.props.iconColor }}></i>);
        }

        let classNameAddOn = AnterosUtils.buildClassNames("input-group-addon",
            (this.props.primary || this.props.fullPrimary ? "btn btn-primary" : ""),
            (this.props.success || this.props.fullSucces ? "btn btn-success" : ""),
            (this.props.info || this.props.fullInfo ? "btn btn-info" : ""),
            (this.props.danger || this.props.fullDanger ? "btn btn-danger" : ""),
            (this.props.warning || this.props.fullWarning ? "btn btn-warning" : ""),
            (this.props.secondary || this.props.fullSecondary ? "btn btn-secondary" : ""),
            (this.props.default || this.props.fullDefault ? "" : ""));

        let classNameInput = AnterosUtils.buildClassNames((colClasses.length > 0 || this.context.withinInputGroup || icon ? "form-control" : ""),
            (this.props.fullPrimary ? "btn-primary" : ""),
            (this.props.fullSucces ? "btn-success" : ""),
            (this.props.fullInfo ? "btn-info" : ""),
            (this.props.fullDanger ? "btn-danger" : ""),
            (this.props.fullWarning ? "btn-warning" : ""),
            (this.props.fullSecondary ? "btn-secondary" : ""),
            (this.props.fullDefault ? "" : ""));


        if (this.props.icon) {
            return (<div className={className} style={{ ...this.props.style, width: width }} 
            ref={ref => this.divInput = ref}>
                <input
                    disabled={(this.props.disabled ? true : false)}
                    id={this.idEdit} ref={ref => this.input = ref}
                    type="text" value={this.state?this.state.value:''}
                    style={{margin: 0}} 
                    className={classNameInput}
                    onChange={this.handleChange}
                    onKeyDown={this.onKeyDown}
                    onKeyPress={this.onKeyPress}
                    onBlur={this.onBlur}
                    readOnly={readOnly}
                />
                <div className={classNameAddOn} style={{margin: 0}} onClick={this.props.onButtonClick}>
                    <span>{icon}<img src={this.props.image} onClick={this.props.onButtonClick} /></span></div>
            </div>);
        } else {
            const edit = <input
                disabled={(this.props.disabled ? true : false)}
                id={this.idEdit} ref={ref => this.input = ref}
                type="text" value={this.state?this.state.value:''}
                style={{ ...this.props.style, width: this.props.width }}
                className={classNameInput}
                readOnly={readOnly}
                onKeyDown={this.onKeyDown}
                onKeyPress={this.onKeyPress}
                onBlur={this.onBlur}
                onChange={this.handleChange}
            />;
            if (colClasses.length > 0) {
                return (<div className={AnterosUtils.buildClassNames(colClasses)}>
                    {edit}
                </div>);
            } else {
                return edit
            }
        }
    }
}

AnterosLookupEdit.contextTypes = {
    withinInputGroup: PropTypes.bool
};


AnterosLookupEdit.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string.isRequired,
    lookupField: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,
    maxLenght: PropTypes.number.isRequired,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    onButtonClick: PropTypes.func,
    onLookupData: PropTypes.func.isRequired,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    image: PropTypes.string,
    style: PropTypes.object,
    readOnly: PropTypes.bool.isRequired,
    validateOnExit: PropTypes.bool.isRequired,
    validateMessage: PropTypes.string.isRequired
};

AnterosLookupEdit.defaultProps = {
    value: '',
    maxLenght: 0,
    readOnly: false,
    validateOnExit: true,
    validateMessage: 'Registro não encontrado.'
}