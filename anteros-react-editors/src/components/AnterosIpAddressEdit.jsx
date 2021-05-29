import React, { Component } from 'react';
import PropTypes from 'prop-types';
import lodash from "lodash";
import {AnterosUtils} from "@anterostecnologia/anteros-react-core";
import {buildGridClassNames, columnProps} from "@anterostecnologia/anteros-react-layout";
import 'script-loader!jquery.maskedinput/src/jquery.maskedinput.js';
import {AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents} from "@anterostecnologia/anteros-react-datasource";
import {AnterosBaseInputControl} from '@anterostecnologia/anteros-react-containers';

export default class AnterosIpAddressEdit extends AnterosBaseInputControl {

    constructor(props) {
        super(props);

        this.idEdit = lodash.uniqueId("ipEdit");
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

        var ipv4Mask = new MaskedInput({format: '000:ip.000:ip.000:ip.000:ip'});
        ipv4Mask
            .$el
            .addClass('ip-field')
            .appendTo(this.inputRef.current);
        ipv4Mask.fieldOption('ip', {
            'type': MaskedInput.PartType.NUMBER,
            'placeholder': '',
            'validator': function (content, part) {
                content = content.replace(/[^-0-9]/g, ''); // Numeric values
                if (part.length > 0 && content.length > part.length) {
                    content = content.substr(0, part.length);
                }
                if (content) {
                    if (parseInt(content, 10) > 255) {
                        return '255';
                    }
                    if (parseInt(content, 10) < 0) {
                        return '0';
                    }
                }
                if (!content) {
                    return false; // Do not accept empty value
                }
                return content;
            },
            'padding': false,
            'wholeNumber': true
        }).resize();

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
        this.setState({
            ...this.state,
            value: value
        });
    }

    handleChange(event) {
        let value = event.target.value;
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this
                .props
                .dataSource
                .setFieldByName(this.props.dataField, value);
        } else {
            this.setState({
                ...this.state,
                value
            });
        }
        if (this.props.onChange) {
            this
                .props
                .onChange(value);
        }

        this.checkError();
    }

    checkError(e) {
        if (this.context.validationForm) {
            if (this.context.validationForm.immediate) {
                let isPristine = this.state.isPristine;
                if (isPristine) 
                    this.setDirty();
                this.buildErrorMessage();
                this.changeInputErrorClass();
            }
        }
    }

    render() {
        let readOnly = this.props.readOnly;
        let {required, minlength, maxlength, pattern} = this.props;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }

        const colClasses = buildGridClassNames(this.props, false, []);
        const className = AnterosUtils.buildClassNames((this.props.className
            ? this.props.className
            : ""), (colClasses.length > 0
            ? "form-control"
            : ""));

        if (this.props.id) {
            this.idEdit = this.props.id;
        }

        const edit = <input
            id={this.idEdit}
            className={className}
            disabled={(this.props.disabled
            ? true
            : false)}
            style={{
            ...this.props.style,
            width: this.props.width
        }}
            readOnly={readOnly}
            required
            minlength
            maxlength
            pattern
            onFocus={this.props.onFocus}
            onChange={this.handleChange}
            onBlur={this._handleBlur}
            value={this.state.value}
            ref={this.inputRef}
            type='text'/>;

        if (colClasses.length > 0) {
            return (
                <div className={AnterosUtils.buildClassNames(colClasses)}>
                    {edit}
                    {this.displayErrorMessage()}
                    {this.displaySuccessMessage()}
                </div>
            );
        } else {
            return (
                <div>{edit}{this.displayErrorMessage()} {this.displaySuccessMessage()}</div>
            );
        }
    }
}

AnterosIpAddressEdit.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    style: PropTypes.object,
    ipv6: PropTypes.bool
};

AnterosIpAddressEdit.defaultProps = {
    disabled: false,
    ipv6: false
}
