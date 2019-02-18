import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AnterosStatusMark extends Component {
    render() {
        let className = "status-mark";
        if (this.props.primary) {
            className += " status-mark" + (this.props.onlyBorder ? "-border" : "") + "-primary";
        } else if (this.props.success) {
            className += " status-mark" + (this.props.onlyBorder ? "-border" : "") + "-success";
        } else if (this.props.info) {
            className += " status-mark" + (this.props.onlyBorder ? "-border" : "") + "-info";
        } else if (this.props.warning) {
            className += " status-mark" + (this.props.onlyBorder ? "-border" : "") + "-warning";
        } else if (this.props.danger) {
            className += " status-mark" + (this.props.onlyBorder ? "-border" : "") + "-danger";
        } else {
            className += " status-mark" + (this.props.onlyBorder ? "-border" : "") + "-default";
        }

        if (this.props.topLeft)
            className += " top-left";
        else if (this.props.bottomRight)
            className += " bottom-right";
        else if (this.props.bottomLeft)
            className += " bottom-left";
        else
            className += " top-right";

        if (this.props.pillFormat) {
            className += " status-mark-pill";
        }

        let style = {};
        if (this.props.backgroundColor) {
            style = { backgroundColor: this.props.backgroundColor };
        }
        if (this.props.color) {
            style = { ...style, color: this.props.color };
        }

        if (this.props.borderColor) {
            style = { ...style, border: "2px solid " + this.props.borderColor };
        }

        if (this.props.width) {
            style = { ...style, width: this.props.width };
        }

        if (this.props.height) {
            style = { ...style, height: this.props.height };
        }

        return (<span style={style} className={className}></span>);
    }
}



AnterosStatusMark.propTypes = {
    primary: PropTypes.string,
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    danger: PropTypes.bool,
    pillFormat: PropTypes.bool,
    backgroundColor: PropTypes.string,
    color: PropTypes.string,
    onlyBorder: PropTypes.bool.isRequired,
    borderColor: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    topRight: PropTypes.bool.isRequired,
    topLeft: PropTypes.bool.isRequired,
    bottomRight: PropTypes.bool.isRequired,
    bottomLeft: PropTypes.bool.isRequired


}

AnterosStatusMark.defaultProps = {
    onlyBorder: false,
    topRight: false,
    topLeft: false,
    bottomRight: false,
    bottomLeft: false
}