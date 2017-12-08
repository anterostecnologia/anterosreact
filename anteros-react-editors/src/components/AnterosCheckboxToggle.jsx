import React, { Component } from 'react';
import lodash from "lodash";
import 'script-loader!bootstrap-switch/dist/js/bootstrap-switch.min.js';


export default class AnterosCheckboxToggle extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.idInput = lodash.uniqueId("check");
        this.state = { checked: (this.props.checked ? true : false), disabled: (this.props.disabled ? true : false) }
    }

    componentWillReceiveProps(nextProps) {
        this.state = { checked: (nextProps.checked ? true : false), disabled: (nextProps.disabled ? true : false) }
    }

    componentDidMount() {
        if (this.props.square) {
            let options = {};
            options.size = 'small';
            options.onColor = 'default';
            options.animate = true;
            if (this.props.value) {
                options.labelWidth = (this.props.labelWidth ? this.props.labelWidth : "auto");
            }
            options.onSwitchChange = this.onClick;
            if (this.props.checkedValue) {
                options.onText = this.props.checkedValue;
            }
            if (this.props.uncheckedValue) {
                options.offText = this.props.uncheckedValue;
            }
            if (this.props.small) {
                options.size = 'mini';
            }
            if (this.props.large) {
                options.size = 'normal';
            }
            if (this.props.extraLarge) {
                options.size = 'large';
            }
            if (this.props.success) {
                options.onColor = 'success';
            }
            if (this.props.info) {
                options.onColor = 'info';
            }
            if (this.props.warning) {
                options.onColor = 'warning';
            }
            if (this.props.primary) {
                options.onColor = 'primary';
            }
            if (this.props.danger) {
                options.onColor = 'danger';
            }
            if (this.props.successOff) {
                options.offColor = 'success';
            }
            if (this.props.infoOff) {
                options.offColor = 'info';
            }
            if (this.props.warningOff) {
                options.offColor = 'warning';
            }
            if (this.props.primaryOff) {
                options.offColor = 'primary';
            }
            if (this.props.dangerOff) {
                options.offColor = 'danger';
            }
            if (this.props.value) {
                options.labelText = this.props.value;
            }
            if (this.props.disabled) {
                options.disabled = this.props.disabled;
            }
            $(this.input).bootstrapSwitch(options);
        }
    }


    onClick(event) {
        if (!this.state.disabled) {
            let checked = !this.state.checked;
            this.setState({ ...this.state, checked: checked })
            if (this.props.onCheckboxChange) {
                this.props.onCheckboxChange(this.props.value, checked);
            }
        }
    }

    render() {
        const { primary, success, info, danger, warning, large, extraLarge } = this.props;
        let id = this.idInput;
        if (this.props.id) {
            id = this.props.id;
        }
        
        if (this.props.square) {
            return (<input id={id} key={id} type="checkbox" checked={this.state.checked} ref={ref => this.input = ref} onChange={this.onClick} />);
        } else {
            const className = `checkbox-toggle${(primary ? " toggle-primary" : "")}${(success ? " toggle-success" : "")}
        ${(info ? " toggle-info" : "")}${(danger ? " toggle-danger" : "")}${(warning ? " toggle-warning" : "")}
        ${(large ? " -large" : "")}${(extraLarge ? " -extra-large" : "")}`;

            return (<div className={className} onClick={this.onClick}>
                <input id={id} type="checkbox" key={id} checked={this.state.checked} disabled={this.state.disabled} onChange={this.onClick} />
                <label style={{ width: this.props.labelWidth }}>{this.props.value}</label>
            </div>);
        }
    }
}



AnterosCheckboxToggle.propTypes = {
    danger: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    dangerOff: React.PropTypes.bool,
    successOff: React.PropTypes.bool,
    infoOff: React.PropTypes.bool,
    warningOff: React.PropTypes.bool,
    primaryOff: React.PropTypes.bool,
    id: React.PropTypes.string,
    mini: React.PropTypes.bool,
    small: React.PropTypes.bool,
    large: React.PropTypes.bool,
    extraLarge: React.PropTypes.bool,
    checkedValue: React.PropTypes.string,
    uncheckedValue: React.PropTypes.string,
    round: React.PropTypes.bool,
    square: React.PropTypes.bool,
    value: React.PropTypes.string,
    disabled: React.PropTypes.bool.isRequired,
    labelWidth: React.PropTypes.string,
    display: React.PropTypes.string
};

AnterosCheckboxToggle.defaultProps = {
    checkedValue: 'ON',
    uncheckedValue: 'OFF',
    disabled: false,
    display: 'inherit'
}