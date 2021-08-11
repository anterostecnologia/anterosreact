import React, { Component } from 'react';

const classNames = require('classnames');

export class AnterosChatButton extends Component {
    render() {
        return (
            <button
                ref={this.props.buttonRef}
                title={this.props.title}
                className={classNames('chat-button', this.props.type, this.props.className)}
                style={{
                    backgroundColor: this.props.backgroundColor,
                    color: this.props.color,
                    borderColor: this.props.backgroundColor
                }}
                disabled={this.props.disabled}
                onClick={this.props.onClick}>
                {
                    this.props.icon ?
                        <span className='chat-button-icon--container'>
                            {(this.props.icon.float === 'right' || !this.props.icon.float) && <span>{this.props.text}</span>}

                            <span style={{ float: this.props.icon.float, fontSize: this.props.icon.size || 12 }} className='chat-button-icon'>{this.props.icon.component}</span>

                            {this.props.icon.float === 'left' && <span>{this.props.text}</span>}
                        </span>
                        : <span>{this.props.text}</span>
                }
            </button>
        );
    }
}

AnterosChatButton.defaultProps = {
    text: '',
    disabled: false,
    type: null,
    icon: null,
    backgroundColor: '#3979aa',
    color: 'white',
    className: null,
    buttonRef: null,
    title: null,
};

export default AnterosChatButton;
