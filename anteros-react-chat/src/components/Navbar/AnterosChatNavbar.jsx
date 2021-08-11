import React, { Component } from 'react';


const classNames = require('classnames');

export class AnterosChatNavbar extends Component {
    render() {
        return (
            <div className={classNames('chat-navbar', this.props.type, this.props.className)}>
                <div className="chat-navbar-item chat-navbar-item__left">
                    {this.props.left}
                </div>
                <div className="chat-navbar-item chat-navbar-item__center">
                    {this.props.center}
                </div>
                <div className="chat-navbar-item chat-navbar-item__right">
                    {this.props.right}
                </div>
            </div>
        );
    }
}

AnterosChatNavbar.defaultProps = {
    left: null,
    center: null,
    right: null,
    type:'light'
};

export default AnterosChatNavbar;
