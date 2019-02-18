import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AnterosRibbon extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let className = "ribbon";

        if (this.props.reverse) {
            className += " ribbon-reverse";
        } else if (this.props.vertical) {
            className += " ribbon-vertical";
        }

        if (this.props.danger) {
            className += " ribbon-danger";
        } else if (this.props.success) {
            className += " ribbon-success";
        } else if (this.props.primary) {
            className += " ribbon-primary";
        } else if (this.props.info) {
            className += " ribbon-info";
        } else if (this.props.warning) {
            className += " ribbon-warning";
        }

        let spanValue;
        if (this.props.vertical) {
            spanValue = <i className={this.props.icon} aria-hidden="true"></i>;
        } else {
            spanValue = this.props.caption;
        }

        return (
            <div className="ribbon-container">
                <div className={className}>
                    <span className="ribbon-inner">{spanValue}</span>
                </div>
                {this.props.children}
            </div>
        )
    }
}

AnterosRibbon.propTypes = {
    danger: PropTypes.bool,
    success: PropTypes.bool,
    primary: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    icon: PropTypes.string,
    caption: PropTypes.string,
    text: PropTypes.string,
    reverse: PropTypes.bool,
    vertical: PropTypes.bool,
};

AnterosRibbon.defaultProps = {
    danger: false,
    success: false,
    primary: false,
    info: false,
    warning: false,
    icon: undefined,
    caption: undefined,
    text: undefined,
    reverse: false,
    vertical: false,
};