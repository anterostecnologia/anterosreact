import React, { Component } from 'react';


const classNames = require('classnames');

export class AnterosChatSideBar extends Component {
    render() {
        return (
            <div className={classNames('chat-sbar', this.props.type, this.props.className)}>
                <div className="chat-sbar-item">
                    {this.props.top}
                </div>
                <div className="chat-sbar-item chat-sbar-item__center">
                    {this.props.center}
                </div>
                <div className="chat-sbar-item">
                    {this.props.bottom}
                </div>
            </div>
        );
    }
}

AnterosChatSideBar.defaultProps = {
    top: null,
    center: null,
    bottom: null,
    type: 'dark',
}

export default AnterosChatSideBar;
