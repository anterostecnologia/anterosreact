import React, { Component } from 'react';
const classNames = require('classnames');

class AnterosChatReplyMessage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            photoURL,
            title,
            titleColor,
            message,
            onClick,
        } = this.props;

        return (
            <div
                className={classNames("chat-mbox-reply", {
                    'chat-mbox-reply-border': !!titleColor
                })}
                style={titleColor && { borderColor: titleColor }}
                onClick={onClick}>
                <div className="chat-mbox-reply-left">
                    <div
                        style={titleColor && { color: titleColor }}
                        className="chat-mbox-reply-owner">
                        {title || 'Desconhecido'}
                    </div>
                    <div className="chat-mbox-reply-message">
                        {message || '...'}
                    </div>
                </div>
                {
                    photoURL &&
                    <div className="chat-mbox-reply-right">
                        <img src={photoURL} alt=""/>
                    </div>
                }
            </div>
        );
    } 
}

AnterosChatReplyMessage.defaultProps = {
    photoURL: null,
    title: null,
    titleColor: null,
    message: null,
    onClick: () => void(0),
}

export default AnterosChatReplyMessage;
