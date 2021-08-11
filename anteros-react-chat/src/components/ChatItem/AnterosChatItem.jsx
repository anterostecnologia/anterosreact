import React, { Component } from 'react';

import AnterosChatAvatar from '../Avatar/AnterosChatAvatar';

import {
    format,
} from'timeago.js';

import classNames from 'classnames';

export class AnterosChatItem extends Component {

    render() {
        const statusColorType = this.props.statusColorType;

        return (
            <div
                className={classNames('chat-container-citem', this.props.className)}
                onClick={this.props.onClick}
                onContextMenu={this.props.onContextMenu}>
                <div className="chat-citem">
                    <div className={classNames(
                            "chat-citem-avatar",
                            {
                                'chat-citem-status-encircle': statusColorType === 'encircle',
                            }
                        )}>
                        <AnterosChatAvatar
                            src={this.props.avatar}
                            alt={this.props.alt}
                            className={statusColorType === 'encircle' ? 'chat-citem-avatar-encircle-status' : ''}
                            size="large"
                            letterItem={this.props.letterItem}
                            sideElement={
                                this.props.statusColor &&
                                <span
                                    className='chat-citem-status'
                                    style={statusColorType === 'encircle' ? {
                                        boxShadow: `inset 0 0 0 2px ${this.props.statusColor}, inset 0 0 0 5px #FFFFFF`
                                    } : {
                                        backgroundColor: this.props.statusColor,
                                    }}>
                                    {this.props.statusText}
                                </span>
                            }
                            onError={this.props.onAvatarError}
                            lazyLoadingImage={this.props.lazyLoadingImage}
                            type={classNames('circle', {'flexible': this.props.avatarFlexible})}/>
                    </div>

                    <div className="chat-citem-body">
                        <div className="chat-citem-body--top">
                            <div className="chat-citem-body--top-title">
                                {this.props.title}
                            </div>
                            <div className="chat-citem-body--top-time">
                                {
                                    this.props.date &&
                                    !isNaN(this.props.date) &&
                                    (
                                        this.props.dateString ||
                                        format(this.props.date)
                                    )
                                }
                            </div>
                        </div>

                        <div className="chat-citem-body--bottom">
                            <div className="chat-citem-body--bottom-title">
                                {this.props.subtitle}
                            </div>
                            <div className="chat-citem-body--bottom-status">
                                {
                                    this.props.unread > 0 &&
                                    <span>{this.props.unread}</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

AnterosChatItem.defaultProps = {
    id: '',
    onClick: null,
    avatar: '',
    avatarFlexible: false,
    alt: '',
    title: '',
    subtitle: '',
    date: new Date(),
    unread: 0,
    statusColor: null,
    statusColorType: 'badge',
    statusText: null,
    dateString: null,
    lazyLoadingImage: undefined,
    onAvatarError: () => void(0),
}

export default AnterosChatItem;
