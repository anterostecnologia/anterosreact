import React from 'react';

const classNames = require('classnames');

export class AnterosChatSystemMessage extends React.PureComponent {
    render() {
        return (
            <div className={classNames("chat-container-smsg", this.props.className)}>
                <div
                    className='chat-smsg'>
                    <div className="chat-smsg-text">
                        {this.props.text}
                    </div>
                </div>
            </div>
        );
    }
}

export default AnterosChatSystemMessage;
