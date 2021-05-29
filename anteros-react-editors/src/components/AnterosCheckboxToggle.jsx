import React, { Component } from 'react';
import lodash from "lodash";
import 'script-loader!bootstrap-switch/dist/js/bootstrap-switch.min.js';
import PropTypes from 'prop-types';

export default class AnterosCheckboxToggle extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.idInput = lodash.uniqueId("check");
        this.state = { checked: (this.props.checked ? true : false), disabled: (this.props.disabled ? true : false) }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ checked: (nextProps.checked ? true : false), disabled: (nextProps.disabled ? true : false) });
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
    danger: PropTypes.bool,
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    primary: PropTypes.bool,
    secondary: PropTypes.bool,
    dangerOff: PropTypes.bool,
    successOff: PropTypes.bool,
    infoOff: PropTypes.bool,
    warningOff: PropTypes.bool,
    primaryOff: PropTypes.bool,
    id: PropTypes.string,
    mini: PropTypes.bool,
    small: PropTypes.bool,
    large: PropTypes.bool,
    extraLarge: PropTypes.bool,
    checkedValue: PropTypes.string,
    uncheckedValue: PropTypes.string,
    round: PropTypes.bool,
    square: PropTypes.bool,
    value: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    labelWidth: PropTypes.string,
    display: PropTypes.string
};

AnterosCheckboxToggle.defaultProps = {
    checkedValue: 'ON',
    uncheckedValue: 'OFF',
    disabled: false,
    display: 'inherit'
}