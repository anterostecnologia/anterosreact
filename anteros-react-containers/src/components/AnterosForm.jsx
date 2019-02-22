import React, {Component} from 'react';
import {If, Then, AnterosError} from "anteros-react-core";
import PropTypes from 'prop-types';
import {AnterosUtils} from 'anteros-react-core';
import {buildGridClassNames, columnProps} from "anteros-react-layout";

export class AnterosBaseInputControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPristine: true,
            errorMessage: ""
        }
        if (React.createRef) this.inputRef = React.createRef();
        else this.inputRef = (element) => {
            //Before React 16.3
            this.inputRefLegacy = element;
        }
        this.setError = this.setError.bind(this);
        this.getInputRef = this.getInputRef.bind(this);
        this.clearError = this.clearError.bind(this);
        this.buildErrorMessage = this.buildErrorMessage.bind(this);
        this.displayErrorMessage = this.displayErrorMessage.bind(this);
        this.displaySuccessMessage = this.displaySuccessMessage.bind(this);
        this.checkError = this.checkError.bind(this);
        this.changeInputErrorClass = this.changeInputErrorClass.bind(this);
        this._handleBlur = this._handleBlur.bind(this);
        this._handleChange = this._handleChange.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.setDirty = this.setDirty.bind(this);
        this.filterProps = this.filterProps.bind(this);
        this._componentDidMount = this._componentDidMount.bind(this);
        this._componentWillUnmount = this._componentWillUnmount.bind(this);
    }

    

    _componentDidMount() {
        if (this.context.validationForm){
            this.context.validationForm.attachToForm(this);
        }
    }

    _componentWillUnmount() {
        if (this.context.validationForm){
            this.context.validationForm.detachFromForm(this);
        }
    }

    getInputRef() {
        return this.inputRefLegacy || this.inputRef.current;
    }

    setError(errorMessage){
        this.getInputRef().setCustomValidity(errorMessage);
        this.setState({ errorMessage });
    }

    clearError(){
      this.setError("");
    }

    buildErrorMessage() {
        let map = {
            valueMissing: "required",
            customError: "",
            stepMismatch:"step",
            patternMismatch: "pattern",
            rangeUnderflow: "min",
            rangeOverflow: "max",
            typeMismatch: "type"
        }

        let { errorMessage } = this.props;
        let defaultErrorMessage = this.context.validationForm.defaultErrorMessage || {};
        if (typeof (errorMessage) === "string") errorMessage = { required: errorMessage };
        errorMessage = Object.assign({}, AnterosForm.defaultErrorMessage, defaultErrorMessage, errorMessage);
        let input = this.getInputRef();
        if (input) {
            
            input.checkValidity();
            let validityState = input.validity;
            let newErrorMessage = "";
            for (let prop in validityState) {
                if (validityState[prop]) {
                    if (prop === "customError") newErrorMessage = input.validationMessage;
                    else newErrorMessage = errorMessage[map[prop]];
                    break;
                }
            }

            if (this.props.minLength) {
                if (input.value.length < +this.props.minLength) {
                    input.setCustomValidity(errorMessage["minLength"]);
                    newErrorMessage = errorMessage["minLength"].replace("{minLength}", this.props.minLength);
                } else {
                    if (newErrorMessage === errorMessage["minLength"]) {
                        input.setCustomValidity("");
                        newErrorMessage = "";
                    }
                }
            }

            if (typeof this.props.validator === "function") {
                let validatorFn = this.props.validator;
                let value = input.value;
                if (!validatorFn(value)) {
                    input.setCustomValidity(errorMessage.validator);
                    newErrorMessage = errorMessage.validator;
                } else {
                    input.setCustomValidity("");
                    newErrorMessage = "";
                }
            }

            this.setState({ errorMessage: newErrorMessage });
        }
    }

    displayErrorMessage() {
        return this.state.errorMessage ? <div className="invalid-feedback">{this.state.errorMessage}</div>:null;
    }

    displaySuccessMessage(displayBlock) {
        return (!this.state.isPristine && !this.state.errorMessage && this.props.successMessage) ?
            <div className={"valid-feedback" + (displayBlock?" d-block":"")}>{this.props.successMessage}</div> : null;
    }

    checkError(e) {
        let isPristine = this.state.isPristine;
        if (isPristine) this.setDirty();
        this.buildErrorMessage();
        this.changeInputErrorClass();
    }

    changeInputErrorClass() {
        const inputRef = this.getInputRef();
        if (inputRef.type !== "radio") {
            if (!inputRef.validity.valid) {
                inputRef.classList.add("is-invalid")
                inputRef.classList.remove("is-valid");
            } else {
                inputRef.classList.remove("is-invalid")
                inputRef.classList.add("is-valid");
            }
        }
    }

    _handleBlur(e) {
        if (this.context.validationForm.immediate) return;
        this.checkError();
    }

    _handleChange(e) {
        if (this.props.onChange) this.props.onChange(e);
        if (!this.context.validationForm.immediate) return;
        this.checkError();
    }

    validateInput(){
        this.setDirty();
        this.checkError();
        this.buildErrorMessage();
    }

    setDirty(){
        this.setState({...this.state, isPristine: false });
    }

    filterProps(){
        let {
           errorMessage, successMessage, validator, defaultErrorMessage,
            attachToForm, detachFromForm, setFormDirty, label, immediate,
            ...rest
       } = this.props;
        return rest;
    }
}

AnterosBaseInputControl.propTypes = {
    name: PropTypes.string.isRequired,
    errorMessage: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
}

AnterosBaseInputControl.contextTypes = {
    validationForm: PropTypes.object
}


export default class AnterosForm extends Component {

    constructor(props) {
        super(props);
        this.inputs = {};
        this.attachToForm = this.attachToForm.bind(this);
        this.detachFromForm = this.detachFromForm.bind(this);
        this.getChildContext = this.getChildContext.bind(this);
        this.isBaseFormControl = this.isBaseFormControl.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
        this.setFormDirty = this.setFormDirty.bind(this);
        this.getFormData = this.getFormData.bind(this);
        this.mapInputs = this.mapInputs.bind(this);
        this.findFirstErrorInput = this.findFirstErrorInput.bind(this);
        this.getErrorInputs = this.getErrorInputs.bind(this);
        this.validate = this.validate.bind(this);
        this.resetValidationState = this.resetValidationState.bind(this);
    }


    attachToForm(component){
        this.inputs[component.props.name] = component;
    }

    detachFromForm(component){
        delete this.inputs[component.props.name]
    }

    getChildContext() {
        return {
          validationForm: {
            attachToForm: this.attachToForm,
            detachFromForm: this.detachFromForm,
            immediate: this.props.immediate,
            defaultErrorMessage: this.props.defaultErrorMessage
          }
        }
    }

    isBaseFormControl(element) {
        if (typeof element !== "function") return false;
        while (Object.getPrototypeOf(element) !== Object.prototype) {
            if (Object.getPrototypeOf(element) === AnterosBaseInputControl) {
                return true;
            }
            element = Object.getPrototypeOf(element);
        }
        return false;
    }

    validateInputs() {
        for (let prop in this.inputs) {
            this.inputs[prop].validateInput();
        }
    }

    setFormDirty() {
        let form = this.refs.form;
        if (!form.classList.contains('was-validated')) form.classList.add('was-validated');
    }


    getFormData() {
        let model = {};
        for (let name in this.inputs) {
            let inputRef = this.inputs[name].getInputRef();
            let value = null;
            switch (inputRef.type) {
                case "checkbox":
                    value = inputRef.checked;
                    break;
                case "radio":
                    let radios = document.querySelectorAll(`[name="${this.props.name}"]`);
                    for (let i = 0; i < radios.length; i++) {
                        if (radios[i].checked) {
                            value = radios[i].value;
                            break;
                        }
                    }
                    break;
                case "file":
                    value = inputRef.files[0];
                    break;
                default:
                    value = inputRef.value;
            }
            model[name] = value;
        };
        return model;
    }

    mapInputs(inputs) {
        let arr = Object.keys(inputs).map(prop => inputs[prop]);
        return arr;
    }

    findFirstErrorInput(inputs){
        return inputs.find(input => !input.getInputRef().validity.valid);
    }

    getErrorInputs(inputs){
        let map = {};
        inputs.forEach(input => {
            let inputRef = input.getInputRef();
            let validityState = inputRef.validity;
            if (!validityState.valid) map[inputRef.name] = input;
        })
        return map;
    }

    validate() {
        let form = this.refs.form;
        let formData = this.getFormData();
        let inputArr = this.mapInputs(this.inputs);
        this.setFormDirty();
        this.validateInputs();

        if (form.checkValidity() === false) {
            if (this.props.onErrorValidate) this.props.onErrorValidate(formData, this.getErrorInputs(inputArr));
            if (this.props.setFocusOnError) {
                let firstErrorInput = this.findFirstErrorInput(inputArr);
                firstErrorInput.getInputRef().focus();
            }
        }
        else {
            if (this.props.onValidated) this.props.onValidated(formData, inputArr);
        }
    }

    resetValidationState(isClearValue){
        for (let prop in this.inputs) {
            this.inputs[prop].setState({...this.inputs[prop].state, errorMessage: "", isPristine: true });
            let inputRef = this.inputs[prop].getInputRef();
            inputRef.classList.remove("is-valid");
            inputRef.classList.remove("is-invalid");
            inputRef.setCustomValidity("");
            if (isClearValue) {
                if (inputRef.type == "checkbox") inputRef.checked = false;
                inputRef.value = "";
            }
        }
        this.refs.form.classList.remove("was-validated");
    }

    render() {
        const {
            className,
            inline,
            onSubmit, onErrorSubmit, immediate, setFocusOnError, defaultErrorMessage,
            ...attributes
        } = this.props;

        const classes = AnterosUtils.buildClassNames(className, inline
            ? 'form-inline'
            : false);

        return (<form {...attributes} ref="form" className={classes}/>);
    }
}

AnterosForm.propTypes = {
    children: PropTypes.node,
    inline: PropTypes.bool,
    className: PropTypes.string,
    defaultErrorMessage: PropTypes.object,
    setFocusOnError: PropTypes.bool,
    immediate: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    onErrorSubmit: PropTypes.func
};

AnterosForm.defaultProps = {
    className: "needs-validation",
    setFocusOnError: true,
    immediate: true,
    defaultErrorMessage: {}
};

AnterosForm.childContextTypes = {
    validationForm: PropTypes.object
};

AnterosForm.defaultErrorMessage = {
    required: "Este campo deve ser preenchido",
    pattern: "O valor de entrada não corresponde ao padrão",
    type: "O valor de entrada não corresponde ao tipo",
    step: "Passo incorreto",
    minLength: "Por favor, insira pelo menos {minLength} caracteres",
    min: "O número é muito baixo",
    max: "O número é muito alto",
    fileType: "Tipo de arquivo incorreto",
    maxFileSize: "Tamanho do arquivo excedido",
    validator: "A verificação do validador falhou"
}

export class AnterosFormGroup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            row,
            disabled,
            color,
            check,
            ...attributes
        } = this.props;

        const className = AnterosUtils.buildClassNames(this.props.className, color
            ? `has-${color}`
            : false, row
            ? 'row'
            : false, check
            ? 'form-check'
            : 'form-group', check && disabled
            ? 'disabled'
            : false);

        return (<div {...attributes} className={className}/>);
    }
}

AnterosFormGroup.propTypes = {
    children: PropTypes.node,
    check: PropTypes.bool,
    disabled: PropTypes.bool,
    tag: PropTypes.string,
    color: PropTypes.string,
    className: PropTypes.string
};

AnterosFormGroup.defaultProps = {
    disabled: false,
    row: true
};

export class AnterosFormSection extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <legend>
                    <span>{this.props.caption}</span>
                </legend>; {this.props.children}
            </div>
        );
    }
}

export class AnterosInputGroup extends Component {
    constructor(props) {
        super(props);
        this.renderAddOn = this
            .renderAddOn
            .bind(this);
        this.buildChildren = this
            .buildChildren
            .bind(this);
    }

    getChildContext() {
        return {withinInputGroup: true};
    }

    renderAddOn() {
        if (!this.props.icon && !this.props.image) {
            return null;
        }

        let icon;
        if (this.props.icon) {
            icon = (
                <i
                    className={this.props.icon}
                    style={{
                    color: this.props.iconColor
                }}></i>
            );
        }
        let classNameImage;
        if (this.props.imageCircle) {
            classNameImage = " img-circle";
        }

        let image;
        if (this.props.image) {
            image = <img
                className={classNameImage}
                src={this.props.image}
                height={this.props.imageHeight}
                width={this.props.imageWidth}/>;
        }

        return (
            <span className="input-group-addon">
                {icon}{image}{this.props.caption}
            </span>
        );
    }

    buildChildren() {
        let newChildren = [];
        if (this.props.children) {
            let arrChildren = React
                .Children
                .toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if ((child.type && child.type.name === "AnterosEdit") || (child.type && child.type.name === "AnterosNumber") || (child.type && child.type.name === "AnterosTextArea")) {
                    newChildren.push(React.cloneElement(child, {
                        className: AnterosUtils.buildClassNames(child.className, "form-control")
                    }));
                } else {
                    newChildren.push(child);
                }
            });
        }
        return newChildren;
    }

    render() {
        let children = this.buildChildren();

        const colClasses = buildGridClassNames(this.props, false, []);
        let className = AnterosUtils.buildClassNames("input-group", colClasses);

        return (
            <div className={className}>
                <If condition={this.props.alignRight == false}>
                    <Then>
                        {this.renderAddOn()}
                    </Then>
                </If>
                {children}
                <If condition={this.props.alignRight == true}>
                    <Then>
                        {this.renderAddOn()}
                    </Then>
                </If>
            </div>
        );
    }

}

AnterosInputGroup.childContextTypes = {
    withinInputGroup: PropTypes.bool
}

AnterosInputGroup.propTypes = {
    caption: PropTypes.string,
    alignRight: PropTypes.bool,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    image: PropTypes.string,
    imageWidth: PropTypes.string,
    imageHeight: PropTypes.string,
    imageCircle: PropTypes.bool,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps
}

AnterosInputGroup.defaultProps = {
    alignRight: false
}

export class AnterosInputGroupAddOn extends Component {
    constructor(props) {
        super(props);
        this.hasButton = this
            .hasButton
            .bind(this);
    }

    hasButton() {
        let found = false;
        if (this.props.children) {
            let arrChildren = React
                .Children
                .toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if ((child.type && child.type.name === "AnterosButton") || (child.type && child.type.name === "AnterosDropdownButton")) {
                    found = true;
                }
            });
        }
        return found;
    }

    render() {
        let icon;
        if (this.props.icon) {
            icon = (
                <i
                    className={this.props.icon}
                    style={{
                    color: this.props.iconColor
                }}></i>
            );
        }
        let classNameImage;
        if (this.props.imageCircle) {
            classNameImage = " img-circle";
        }

        let image;
        if (this.props.image) {
            image = <img
                className={classNameImage}
                src={this.props.image}
                height={this.props.imageHeight}
                width={this.props.imageWidth}/>
        }

        let className = "input-group-addon";
        if (this.hasButton() == true) {
            className = "input-group-btn";
        }

        return (
            <span className={className}>
                {icon}{image}{this.props.caption} {this.props.children}
            </span>
        );
    }
}

AnterosInputGroupAddOn.propTypes = {
    caption: PropTypes.string,
    alignRight: PropTypes.bool,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    image: PropTypes.string,
    imageWidth: PropTypes.string,
    imageHeight: PropTypes.string,
    imageCircle: PropTypes.bool
}

AnterosInputGroupAddOn.defaultProps = {
    alignRight: false
}
