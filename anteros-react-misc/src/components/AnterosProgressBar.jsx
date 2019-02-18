import React, { Component } from 'react';
import { AnterosUtils } from "anteros-react-core";
import PropTypes from 'prop-types';

export default class AnterosProgressBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        let className = AnterosUtils.buildClassNames("progress-bar",
            (this.props.success ? "bg-success" : ""),
            (this.props.info ? "bg-info" : ""),
            (this.props.warning ? "bg-warning" : ""),
            (this.props.primary ? "bg-primary" : ""),
            (this.props.danger ? "bg-danger" : ""),
            (this.props.striped ? "progress-bar-striped" : ""),
            (this.props.animated ? "progress-bar-animated" : "")
        );

        return (<div className="progress">
            <div className={className} role="progressbar" style={{ width: this.props.value + "%", height: this.props.height + "px", backgroundColor: this.props.backgroundColor}} aria-valuenow={this.props.value} aria-valuemin={this.props.min} aria-valuemax={this.props.max}>
                <span style={{ color: this.props.color, verticalAlign: "middle" }}>{this.props.showText == true ? this.props.value + "%" : ""}</span>
            </div>
        </div>)
    }
}

AnterosProgressBar.propTypes = {
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    striped: PropTypes.bool,
    animated: PropTypes.bool,
    showText: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number.isRequired,
    height: PropTypes.number
};

AnterosProgressBar.defaultProps = {
    showText: false,
    min: 0,
    max: 100,
    value: 0,
    height: 20
}