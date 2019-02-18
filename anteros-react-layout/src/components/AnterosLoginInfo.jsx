import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AnterosLoginInfo extends Component {

    componentWillMount() {

    }

    render() {
        return (
            <div className="login-info">
                <span>
                    <img src={this.props.picture} alt="me"
                        className="online" /><span>{this.props.username}</span><i className="fa fa-angle-down" />
                </span>
            </div>
        )
    }
}
