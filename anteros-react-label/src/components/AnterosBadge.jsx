import React, { Component } from 'react';



export default class AnterosBadge extends Component {
    render() {
        let className = "badge";

        if (this.props.large) {
            className += " badge-lg";
        } else if (this.props.small) {
            className += " badge-sm";
        }

        if (this.props.primary) {
            className += " badge-primary";
        } else if (this.props.success) {
            className += " badge-success";
        } else if (this.props.info) {
            className += " badge-info";
        } else if (this.props.warning) {
            className += " badge-warning";
        } else if (this.props.danger) {
            className += " badge-danger";
        } else if (this.props.dark) {
            className += " badge-dark";
        } else {
            className += " badge-anteros-default";
        }

        if (this.props.pillFormat) {
            className += " badge-pill";
        } else if (this.props.radiusFormat) {
            className += " badge-radius";
        }

        let style = {...this.props.style};
        if (this.props.backgroundColor) {
            style = { backgroundColor: this.props.backgroundColor };
        }
        if (this.props.color) {
            style = { ...style, color: this.props.color };
        }

        return (<span style={style} className={className}>{this.props.caption}</span>);
    }
}

AnterosBadge.propTypes = {
    caption: React.PropTypes.string.isRequired,
    primary: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    dark: React.PropTypes.bool,
    pillFormat: React.PropTypes.bool,
    radiusFormat: React.PropTypes.bool,
    large: React.PropTypes.bool,
    small: React.PropTypes.bool,
    backgroundColor: React.PropTypes.string,
    color: React.PropTypes.string,
}

AnterosBadge.defaultProps = {
    primary: false,
    success: false,
    info: false,
    warning: false,
    danger: false,
    dark: false,
    pillFormat: false,
    radiusFormat: false,
    large: false,
    small: false,
    backgroundColor: undefined,
    color: undefined
}