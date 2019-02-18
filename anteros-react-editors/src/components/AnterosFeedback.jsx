import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { AnterosUtils } from "anteros-react-core";


export default class AnterosFeedback extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let classNameFeedback = AnterosUtils.buildClassNames(
            (this.props.classNameFeedback ? this.props.classNameFeedback : ""),
            (this.props.primary ? "btn-primary" : ""),
            (this.props.succes ? "btn-success" : ""),
            (this.props.info ? "btn-info" : ""),
            (this.props.danger ? "btn-danger" : ""),
            (this.props.warning ? "btn-warning" : ""),
            (this.props.secondary ? "btn-secondary" : ""),
            (this.props.default ? "" : ""));

        if (this.props.when) {
            if (this.props.inputValue) {
                const result = this
                    .props
                    .when(this.props.inputValue);
                if (result === true) {
                    return (
                        <div style={this.props.style} className={classNameFeedback}>
                            {this.props.children}
                        </div>
                    )
                }
            }
        }
        return null;
    }

}

AnterosFeedback.PropTypes = {
    style : PropTypes.style,
    when : PropTypes.object,
    inputValue: PropTypes.any,
    primary : PropTypes.bool,
    info : PropTypes.bool,
    danger : PropTypes.bool,
    warning : PropTypes.bool,
    secondary : PropTypes.bool,
    default : PropTypes.bool
}

AnterosFeedback.defaultProps = {
    primary : false,
    info : false,
    danger : false,
    warning : false,
    secondary : false,
    default : false
}