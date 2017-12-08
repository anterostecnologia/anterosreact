import React, { Component } from 'react';
import classNames from "classnames";

export default class AnterosCustomLabel extends Component {

    constructor(props) {
        super(props);
    }
    render() {
        let className = "label-custom";

        if (this.props.large) {
            className += " label-lg";
        } else if (this.props.small) {
            className += " label-sm";
        }

        if (this.props.primary) {
            className += (this.props.outline ? " label-outline-primary" : " label-primary");
        } else if (this.props.success) {
            className += (this.props.outline ? " label-outline-success" : " label-success");
        } else if (this.props.info) {
            className += (this.props.outline ? " label-outline-info" : " label-info");
        } else if (this.props.warning) {
            className += (this.props.outline ? " label-outline-warning" : " label-warning");
        } else if (this.props.danger) {
            className += (this.props.outline ? " label-outline-danger" : " label-danger");
        } else if (this.props.dark) {
            className += (this.props.outline ? " label-outline-dark" : " label-dark");
        } else {
            className += (this.props.outline ? " label-outline-default" : " label-default");
        }

        if (this.props.pillFormat) {
            className += " label-pill";
        }

        return (<label className={className}>{this.props.caption}</label>);
    }
}

AnterosCustomLabel.propTypes = {
    primary: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    dark: React.PropTypes.bool,
    pillFormat: React.PropTypes.bool,
    outline: React.PropTypes.bool,
    large: React.PropTypes.bool,
    small: React.PropTypes.bool,
    caption: React.PropTypes.string.isRequired
}

AnterosCustomLabel.defaultProps = {
    primary: false,
    success: false,
    info: false,
    warning: false,
    danger: false,
    dark: false,
    pillFormat: false,
    outline: false,
    large: false,
    small: false,
    textAlign: 'left'
}



