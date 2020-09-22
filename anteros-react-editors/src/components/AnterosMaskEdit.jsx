import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AnterosError} from "anteros-react-core";
import lodash from "lodash";
import {AnterosUtils} from "anteros-react-core";
import {buildGridClassNames, columnProps} from "anteros-react-layout";
import 'script-loader!jquery.inputmask/dist/jquery.inputmask.bundle.js';
import {AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents} from "anteros-react-datasource";
import {AnterosBaseInputControl} from '@anterostecnologia/anteros-react-containers';

export default class AnterosMaskEdit extends AnterosBaseInputControl {

    constructor(props) {
        super(props);

        if (!props.mask && !props.maskPattern) {
            throw new AnterosError('Informe a máscara ou o padrão de máscara para o AnterosMaskEdit.');
        }
        this.idEdit = lodash.uniqueId("maskEdit");
        this.onChangeValue = this
            .onChangeValue
            .bind(this);
        this.handleBlur = this.handleBlur.bind(this);    
        this.handleChange = this.handleChange.bind(this);
        this.updateComponent = this.updateComponent.bind(this);
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
        this.updateComponent(nextProps);
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

        this.updateComponent(this.props);

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

    updateComponent(props){
        let _this = this;
        if (props.maskPattern == 'cnpj') {
            $(this.inputRef.current).inputmask('99.999.999/9999-99', {
                "alias": props.placeHolder,
                "onincomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncleared": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                }
            });
        } else if (props.maskPattern == 'cpf') {
            $(this.inputRef.current).inputmask('999.999.999-99', {
                "alias": props.placeHolder,
                "onincomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncleared": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                }
            });
        } else if (props.maskPattern == 'cep') {
            $(this.inputRef.current).inputmask('99999-999', {
                "alias": props.placeHolder,
                "onincomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncleared": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                }
            });
        } else if (props.maskPattern == 'placa') {
            $(this.inputRef.current).inputmask('AAA-****', {
                "alias": props.placeHolder,
                "onincomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncleared": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                }
            });
        } else if (props.maskPattern == 'fone') {
            $(this.inputRef.current).inputmask({
                mask: [
                    "(99) 9999-9999", "(99) 99999-9999"
                ],
                keepStatic: true,
                "alias": props.placeHolder,
                "onincomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncleared": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                }
            });
        } else {
            $(this.inputRef.current).inputmask(props.mask, {
                "alias": props.placeHolder,
                "onincomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncleared": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                },
                "oncomplete": function () {
                    let value = $(_this.inputRef.current).inputmask('unmaskedvalue');
                    _this.onChangeValue(value);
                }
            });
        }
    }

    handleBlur(event){
        this._handleBlur(event);
        if (this.props.onBlur){
            this.props.onBlur(event);
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
        this.onChangeValue(event.target.value);
    }

    onChangeValue(value) {
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
        let {required, minLength, maxLength, pattern} = this.props;
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
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            onFocus={this.props.onFocus}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
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

AnterosMaskEdit.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    mask: PropTypes.oneOfType([
        PropTypes.string, PropTypes.arrayOf(PropTypes.string)
    ]),
    maskPattern: PropTypes.oneOf(['cnpj', 'cpf', 'fone', 'cep', 'placa']),
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
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
