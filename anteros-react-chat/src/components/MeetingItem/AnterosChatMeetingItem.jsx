import React, { Component } from 'react';

import AnterosChatAvatar from '../Avatar/AnterosChatAvatar';
import {AnterosIcon} from '@anterostecnologia/anteros-react-image';

import {
    format,
} from'timeago.js';

import classNames from 'classnames';

export class AnterosChatMeetingItem extends Component {

    render() {
        const statusColorType = this.props.statusColorType;
        const AVATAR_LIMIT = this.props.avatarLimit;

        const dateText = this.props.date && !isNaN(this.props.date) && (
            this.props.dateString ||
            format(this.props.date)
        );

        const subject = this.props.subject.substring(0, this.props.subjectLimit) + (this.props.subject.length > this.props.subjectLimit ? '...' : '');

        return (
            <div
                className={classNames('chat-container-mtitem', this.props.className)}
                onClick={this.props.onClick}
                onContextMenu={this.props.onContextMenu}>

                <audio
                    autoPlay
                    loop
                    muted={this.props.audioMuted}
                    src={this.props.audioSource}/>

                <div className="chat-mtitem">
                    <div className="chat-mtitem-top">
                        <div className="chat-mtitem-subject">
                            {subject}
                        </div>
                        <div
                            className="chat-mtitem-share"
                            onClick={this.props.onShareClick}>
                            <AnterosIcon icon="fal fa-link"/>
                        </div>
                    </div>
                    <div className="chat-mtitem-body">
                        <div className="chat-mtitem-body--avatars">
                            {
                                this.props.avatars.slice(0, AVATAR_LIMIT).map((x, i) => x instanceof Avatar ? x : (
                                    <AnterosChatAvatar
                                        key={i}
                                        src={x.src}
                                        alt={x.alt}
                                        className={x.statusColorType === 'encircle' ? 'chat-mtitem-avatar-encircle-status' : ''}
                                        size={'small'}
                                        letterItem={x.letterItem}
                                        sideElement={
                                            x.statusColor &&
                                            <span
                                                className='chat-mtitem-status'
                                                style={statusColorType === 'encircle' ? {
                                                    boxShadow: `inset 0 0 0 2px ${x.statusColor}, inset 0 0 0 5px #FFFFFF`
                                                } : {
                                                    backgroundColor: x.statusColor,
                                                }}>
                                                {x.statusText}
                                            </span>
                                        }
                                        onError={this.props.onAvatarError}
                                        lazyLoadingImage={this.props.lazyLoadingImage}
                                        type={classNames('circle', {'flexible': this.props.avatarFlexible})}/>
                                ))
                            }

                            {
                                this.props.avatars.length > AVATAR_LIMIT &&
                                <div className='chat-avatar-container circle small chat-mtitem-letter'>
                                    <span>
                                        {'+' + (this.props.avatars.length - AVATAR_LIMIT)}
                                    </span>
                                </div>
                            }
                        </div>
                        <div className="chat-mtitem-body--functions">
                            {
                                this.props.closable &&
                                <div
                                    className="chat-mtitem-closable"
                                    onClick={this.props.onCloseClick}>
                                    <AnterosIcon icon="fal fa-phone-square-alt" />
                                </div>
                            }
                            <div
                                className='chat-mtitem-button'
                                onClick={this.props.onMeetingClick}>
                                <AnterosIcon name="fal fa-video"/>
                            </div>
                        </div>
                    </div>
                    <div className="chat-mtitem-footer">
                        <span className='chat-mtitem-date'>
                            {dateText}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

AnterosChatMeetingItem.defaultProps = {
    id: '',
    subject: '',
    subjectLimit: 60,
    onClick: null,
    avatarFlexible: false,
    alt: '',
    title: '',
    subtitle: '',
    date: new Date(),
    dateString: '',
    lazyLoadingImage: undefined,
    avatarLimit: 5,
    avatars: [],
    audioMuted: true,
    audioSource: null,
    onAvatarError: () => void(0),
    onMeetingClick: () => void(0),
    onShareClick: () => void(0),
}

export default AnterosChatMeetingItem;
