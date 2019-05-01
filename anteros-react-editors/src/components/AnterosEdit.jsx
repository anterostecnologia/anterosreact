import React, {Component} from 'react';
import 'script-loader!bootstrap-maxlength/bootstrap-maxlength.min.js'
import lodash from "lodash";
import {AnterosUtils} from "anteros-react-core";
import {buildGridClassNames, columnProps} from "anteros-react-layout";
import {AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents} from "anteros-react-datasource";
import PropTypes from 'prop-types';
import {AnterosBaseInputControl} from 'anteros-react-containers';
import AnterosFeedback from './AnterosFeedback';

export default class AnterosEdit extends AnterosBaseInputControl {
    constructor(props) {
        super(props);
        this.idEdit = lodash.uniqueId("edit");
        this.handleChange = this
            .handleChange
            .bind(this);
        this.onKeyDown = this
            .onKeyDown
            .bind(this);
        this.onKeyPress = this
            .onKeyPress
            .bind(this);
        this.setFocus = this.setFocus.bind(this);
        if (this.props.dataSource) {
            let value = this
                .props
                .dataSource
                .fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            this.state = {
                value: value
            };
        } else {
            this.state = {
                value: this.props.value
            };
        }
        this.onDatasourceEvent = this
            .onDatasourceEvent
            .bind(this);
    }

    get componentName(){
        return "AnterosEdit";
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps
                .dataSource
                .fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            this.setState({value: value});
        } else {
            this.setState({value: nextProps.value});
        }
    }

    componentDidMount() {
        this._componentDidMount();
        let _this = this;
        if (this.props.maxLength > 0) {
            $(this.input).maxlength({alwaysShow: true, warningClass: "label label-input-success", limitReachedClass: "label label-input-danger"});
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
    }

    componentWillUnmount() {
        this._componentWillUnmount();
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
        let value = this
            .props
            .dataSource
            .fieldByName(this.props.dataField);
        if (!value) {
            value = '';
        }
        this.setState({value: value});
    }

    handleChange(event) {
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this
                .props
                .dataSource
                .setFieldByName(this.props.dataField, event.target.value);
        } else {
            this.setState({value: event.target.value});
        }
        
        if (this.props.onChange) {
            this
                .props
                .onChange(event, event.target.value);
        }

        this.checkError();
    }

    onKeyPress(event) {
        if (this.props.onKeyPress) {
            this
                .props
                .onKeyPress(event);
        }
    }

    onKeyDown(event) {
        if (this.props.onKeyDown) {
            this
                .props
                .onKeyDown(event);
        }
    }

    buildChildrens() {
        let children = [];
        let _this = this;
        if (this.props.children) {
            let arrChildren = React
                .Children
                .toArray(this.props.children);
            arrChildren.forEach(function (child, index) {
                if (child.type && child.type.componentName === 'AnterosFeedback') {
                    children.push(React.createElement(AnterosFeedback, {
                        key: (_this.props.id
                            ? _this.props.id + "_" + index
                            : _this.idEdit + "_" + index),
                        style: child.props.style,
                        inputValue: _this.state.value,
                        index: index,
                        id: child.props.id,
                        warning: child.props.warning,
                        primary: child.props.primary,
                        info: child.props.info,
                        danger: child.props.danger,
                        warning: child.props.warning,
                        secondary: child.props.secondary,
                        default: child.props.default,
                        when: child.props.when
                    }, child.props.children));
                } else {
                    children.push(child);
                }
            });
        }
        return children;
    }

    setFocus(value){
        if (value){
            this.inputRef.current.focus();
        } else {
            this.inputRef.current.blur();
        }
    }

    render() {
        let readOnly = this.props.readOnly;
        let {required, minLength, maxLength, pattern} = this.props;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);

        if (this.props.id) {
            this.idEdit = this.props.id;
        }
        let className = AnterosUtils.buildClassNames("input-group", (this.props.className
            ? this.props.className
            : ""), colClasses);

        let width = this.props.width;
        if (colClasses.length > 0) {
            width = "";
        }

        let icon;
        if (this.props.icon) {
            icon = (
                <i
                    data-user={this.props.dataUser}
                    onClick={this.onButtonClick}
                    className={this.props.icon}
                    style={{
                    color: this.props.iconColor
                }}></i>
            );
        }

        let classNameAddOn = AnterosUtils.buildClassNames("input-group-addon", (this.props.primary || this.props.fullPrimary
            ? "btn btn-primary"
            : ""), (this.props.success || this.props.fullSucces
            ? "btn btn-success"
            : ""), (this.props.info || this.props.fullInfo
            ? "btn btn-info"
            : ""), (this.props.danger || this.props.fullDanger
            ? "btn btn-danger"
            : ""), (this.props.warning || this.props.fullWarning
            ? "btn btn-warning"
            : ""), (this.props.secondary || this.props.fullSecondary
            ? "btn btn-secondary"
            : ""), (this.props.default || this.props.fullDefault
            ? ""
            : ""));

        let classNameInput = AnterosUtils.buildClassNames((colClasses.length > 0 || icon
            ? "form-control"
            : ""), (this.props.classNameInput
            ? this.props.classNameInput
            : ""), (this.props.fullPrimary
            ? "btn-primary"
            : ""), (this.props.fullSucces
            ? "btn-success"
            : ""), (this.props.fullInfo
            ? "btn-info"
            : ""), (this.props.fullDanger
            ? "btn-danger"
            : ""), (this.props.fullWarning
            ? "btn-warning"
            : ""), (this.props.fullSecondary
            ? "btn-secondary"
            : ""), (this.props.fullDefault
            ? ""
            : ""));

        if (this.props.icon) {
            return (
                <div
                    className={className}
                    style={{
                    ...this.props.style,
                    width: width
                }}
                    ref={ref => this.divInput = ref}>
                    <input
                        disabled={(this.props.disabled
                        ? true
                        : false)}
                        id={this.idEdit}
                        required={required}
                        minLength={minLength}
                        pattern={pattern}
                        ref={this.inputRef}
                        type="text"
                        value={this.state.value}
                        className={classNameInput}
                        onChange={this.handleChange}
                        onBlur={this._handleBlur}
                        onFocus={this.props.onFocus}
                        onKeyDown={this.onKeyDown}
                        onKeyPress={this.onKeyPress}
                        readOnly={readOnly}
                        maxLength={this.props.maxLength}
                        placeholder={this.props.placeHolder}/>
                    <div className={classNameAddOn} onClick={this.props.onButtonClick}>
                        <span>{icon}<img src={this.props.image} onClick={this.props.onButtonClick}/></span>
                    </div>
                    {this.displayErrorMessage()}
                    {this.displaySuccessMessage()}
                </div>
            );
        } else {
            const edit = <div
                // className="input-group"
                style={{
                width: this.props.width
            }}>
                <input
                    disabled={(this.props.disabled
                    ? true
                    : false)}
                    id={this.idEdit}
                    ref={this.inputRef}
                    type="text"
                    required={required}
                    minLength={minLength}
                    pattern={pattern}
                    value={this.state.value}
                    style={{
                    ...this.props.style,
                    width: (this.props.width
                        ? "100%"
                        : null)
                }}
                    className={classNameInput}
                    onFocus={this.props.onFocus}
                    readOnly={readOnly}
                    onKeyDown={this.onKeyDown}
                    onKeyPress={this.onKeyPress}
                    onChange={this.handleChange}
                    onBlur={this._handleBlur}
                    maxLength={this.props.maxLength}
                    placeholder={this.props.placeHolder}/> {this.displayErrorMessage()}
                {this.displaySuccessMessage()}
            </div>;
            if (colClasses.length > 0) {
                return (
                    <div className={AnterosUtils.buildClassNames(colClasses)}>
                        {edit}
                    </div>
                );
            } else {
                return edit
            }
        }
    }
}

AnterosEdit.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    value: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,
    maxLength: PropTypes.string,
    minLength: PropTypes.string,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    onButtonClick: PropTypes.func,
    onFocus: PropTypes.func,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    image: PropTypes.string,
    style: PropTypes.object,
    readOnly: PropTypes.bool.isRequired,
    classNameInput: PropTypes.string,
    pattern: PropTypes.string
};

AnterosEdit.defaultProps = {
    value: '',
    placeHolder: "",
    readOnly: false
}