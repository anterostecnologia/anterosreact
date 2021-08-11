import React from 'react';

import {AnterosIcon} from '@anterostecnologia/anteros-react-image';
import AnterosChatPhotoMessage from '../PhotoMessage/AnterosChatPhotoMessage';
import AnterosChatFileMessage from '../FileMessage/AnterosChatFileMessage';
import AnterosChatSystemMessage from '../SystemMessage/AnterosChatSystemMessage';
import AnterosChatLocationMessage from '../LocationMessage/AnterosChatLocationMessage';
import AnterosChatSpotifyMessage from '../SpotifyMessage/AnterosChatSpotifyMessage';
import AnterosChatReplyMessage from '../ReplyMessage/AnterosChatReplyMessage';
import AnterosChatMeetingMessage from '../MeetingMessage/AnterosChatMeetingMessage';
import AnterosChatVideoMessage from '../VideoMessage/AnterosChatVideoMessage';
import AnterosChatAudioMessage from '../AudioMessage/AnterosChatAudioMessage';

import AnterosChatAvatar from '../Avatar/AnterosChatAvatar';

import {
    format,
} from 'timeago.js';

import classNames from 'classnames';

export class AnterosChatMessageBox extends React.PureComponent {
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.focus !== this.props.focus && nextProps.focus === true) {
            if (this.refs['message']) {
                this.refs['message'].scrollIntoView({
                    block: "center",
                    behavior: 'smooth'
                })

                this.props.onMessageFocused(nextProps);
            }
        }
    }

    render() {
        var positionCls = classNames('chat-mbox', { 'chat-mbox-right': this.props.position === 'right' });
        var thatAbsoluteTime = !/(text|video|file|meeting|audio)/g.test(this.props.type) && !(this.props.type === 'location' && this.props.text);

        const dateText = this.props.date && !isNaN(this.props.date) && (
            this.props.dateString ||
            format(this.props.date)
        );

        return (
            <div
                ref='message'
                className={classNames('chat-container-mbox', this.props.className)}
                onClick={this.props.onClick}>
                {
                    this.props.renderAddCmp instanceof Function &&
                    this.props.renderAddCmp()
                }
                {
                    this.props.type === 'system' ?
                        <AnterosChatSystemMessage
                            text={this.props.text} />
                        :
                        <div
                            className={classNames(
                                positionCls,
                                {'chat-mbox--clear-padding': thatAbsoluteTime},
                                {'chat-mbox--clear-notch': !this.props.notch},
                                { 'message-focus': this.props.focus},
                            )}>
                            <div
                                className='chat-mbox-body'
                                onContextMenu={this.props.onContextMenu}>
                                {
                                    !this.props.retracted &&
                                    this.props.forwarded === true &&
                                    <div
                                        className={classNames(
                                            'chat-mbox-forward',
                                            { 'chat-mbox-forward-right': this.props.position === 'left' },
                                            { 'chat-mbox-forward-left': this.props.position === 'right' }
                                        )}
                                        onClick={this.props.onForwardClick}>
                                            <AnterosIcon icon="fal fa-share-square" />
                                    </div>
                                }

                                {
                                    !this.props.retracted &&
                                    this.props.replyButton === true &&
                                    <div
                                        className={this.props.forwarded !== true ? classNames(
                                            'chat-mbox-forward',
                                            { 'chat-mbox-forward-right': this.props.position === 'left' },
                                            { 'chat-mbox-forward-left': this.props.position === 'right' }
                                        ) : classNames(
                                            'chat-mbox-forward',
                                            { 'chat-mbox-reply-btn-right': this.props.position === 'left' },
                                            { 'chat-mbox-reply-btn-left': this.props.position === 'right' }
                                        )}
                                        onClick={this.props.onReplyClick}>
                                            <AnterosIcons name="fal fa-comment-alt-lines" />
                                    </div>
                                }

                                {
                                    !this.props.retracted &&
                                    this.props.removeButton === true &&
                                    <div
                                        className={this.props.forwarded === true ? classNames(
                                            'chat-mbox-remove',
                                            { 'chat-mbox-remove-right': this.props.position === 'left' },
                                            { 'chat-mbox-remove-left': this.props.position === 'right' }
                                        ) : classNames(
                                            'chat-mbox-forward',
                                            { 'chat-mbox-reply-btn-right': this.props.position === 'left' },
                                            { 'chat-mbox-reply-btn-left': this.props.position === 'right' }
                                        )}
                                        onClick={this.props.onRemoveMessageClick}>
                                            <AnterosIcon icon="fal fa-comment-alt-times" />
                                    </div>
                                }

                                {
                                    (this.props.title || this.props.avatar) &&
                                    <div
                                        style={this.props.titleColor && { color: this.props.titleColor }}
                                        onClick={this.props.onTitleClick}
                                        className={classNames('chat-mbox-title', {
                                            'chat-mbox-title--clear': this.props.type === 'text',
                                        })}>
                                        {
                                            this.props.avatar &&
                                            <AnterosChatAvatar
                                                letterItem={this.props.letterItem}
                                                src={this.props.avatar}/>
                                        }
                                        {
                                            this.props.title &&
                                            <span>{this.props.title}</span>
                                        }
                                    </div>
                                }

                                {
                                    this.props.reply &&
                                    <AnterosChatReplyMessage
                                        photoURL={this.props.reply.photoURL}
                                        title={this.props.reply.title}
                                        titleColor={this.props.reply.titleColor}
                                        message={this.props.reply.message}
                                        onClick={this.props.onReplyMessageClick}/>
                                }

                                {
                                    this.props.type === 'text' &&
                                    <div className={classNames('chat-mbox-text', {
                                        'chat-mbox-text-retracted': this.props.retracted,
                                        'left': this.props.position === 'left',
                                        'right': this.props.position === 'right',
                                    })}>
                                        {
                                            this.props.retracted &&
                                            <AnterosIcon icon="fal fa-stop" />
                                        }
                                        {this.props.text}
                                    </div>
                                }

                                {
                                    this.props.type === 'location' &&
                                    <AnterosChatLocationMessage
                                        onOpen={this.props.onOpen}
                                        data={this.props.data}
                                        target={this.props.target}
                                        href={this.props.href}
                                        apiKey={this.props.apiKey}
                                        src={this.props.src}
                                        zoom={this.props.zoom}
                                        markerColor={this.props.markerColor}
                                        text={this.props.text} />
                                }

                                {
                                    this.props.type === 'photo' &&
                                    <AnterosChatPhotoMessage
                                        onOpen={this.props.onOpen}
                                        onDownload={this.props.onDownload}
                                        onLoad={this.props.onLoad}
                                        onPhotoError={this.props.onPhotoError}
                                        data={this.props.data}
                                        width={this.props.width}
                                        height={this.props.height}
                                        text={this.props.text} />
                                }

                                {
                                    this.props.type === 'video' &&
                                    <AnterosChatVideoMessage
                                        onOpen={this.props.onOpen}
                                        onDownload={this.props.onDownload}
                                        onLoad={this.props.onLoad}
                                        onPhotoError={this.props.onPhotoError}
                                        data={this.props.data}
                                        width={this.props.width}
                                        height={this.props.height}
                                        text={this.props.text} />
                                }

                                {
                                    this.props.type === 'file' &&
                                    <AnterosChatFileMessage
                                        onOpen={this.props.onOpen}
                                        onDownload={this.props.onDownload}
                                        data={this.props.data}
                                        text={this.props.text} />
                                }

                                {
                                    this.props.type === 'spotify' &&
                                    <AnterosChatSpotifyMessage
                                        width={this.props.width}
                                        height={this.props.height}
                                        theme={this.props.theme}
                                        view={this.props.view}
                                        data={this.props.data}
                                        uri={this.props.uri || this.props.text} />
                                }

                                {
                                    this.props.type === 'meeting' &&
                                    this.props.meeting &&
                                    <AnterosChatMeetingMessage
                                        subject={this.props.meeting.subject}
                                        title={this.props.meeting.title}
                                        date={this.props.meeting.date}
                                        dateString={this.props.meeting.dateString}
                                        collapseTitle={this.props.meeting.collapseTitle}
                                        participants={this.props.meeting.participants}
                                        moreItems={this.props.meeting.moreItems}
                                        dataSource={this.props.meeting.dataSource}
                                        onClick={this.props.onMeetingMessageClick}
                                        onMeetingMoreSelect={this.props.onMeetingMoreSelect}
                                        onMeetingVideoLinkClick={this.props.onMeetingVideoLinkClick}
                                        onMeetingTitleClick={this.props.onMeetingTitleClick} />
                                }
                                {
                                    this.props.type === 'audio' &&
                                    <AnterosChatAudioMessage
                                        onOpen={this.props.onOpen}
                                        onDownload={this.props.onDownload}
                                        onLoad={this.props.onLoad}
                                        data={this.props.data}
                                        text={this.props.text} />
                                }

                                <div
                                    className={classNames(
                                        'chat-mbox-time',
                                        { 'chat-mbox-time-block': thatAbsoluteTime },
                                        { 'non-copiable': !this.props.copiableDate },
                                    )}
                                    data-text={this.props.copiableDate ? undefined : dateText}>
                                    {
                                        this.props.copiableDate &&
                                        this.props.date &&
                                        !isNaN(this.props.date) &&
                                        (
                                            this.props.dateString ||
                                            format(this.props.date)
                                        )
                                    }
                                    {
                                        this.props.status &&
                                        <span className='chat-mbox-status'>
                                            {
                                                this.props.status === 'waiting' &&
                                                <AnterosIcon icon="fal fa-clock" />
                                            }

                                            {
                                                this.props.status === 'sent' &&
                                                <AnterosIcons icon="fal fa-check" />
                                            }

                                            {
                                                this.props.status === 'received' &&
                                                <AnterosIcon icon="fal fa-check-double" />
                                            }

                                            {
                                                this.props.status === 'read' &&
                                                <AnterosIcon icon="fal fa-check-double" color='#4FC3F7'/>
                                            }
                                        </span>
                                    }
                                </div>
                            </div>

                            {
                                this.props.notch &&
                                (this.props.position === 'right' ?
                                    <svg className={classNames(
                                        "chat-mbox-right-notch",
                                        { 'message-focus': this.props.focus},
                                    )} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M0 0v20L20 0" />
                                    </svg>
                                    :
                                    <div>
                                        <svg className={classNames(
                                                "chat-mbox-left-notch",
                                                { 'message-focus': this.props.focus},
                                            )} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <defs>
                                                <filter id="filter1" x="0" y="0">
                                                    <feOffset result="offOut" in="SourceAlpha" dx="-2" dy="-5" />
                                                    <feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" />
                                                    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                                                </filter>
                                            </defs>
                                            <path d="M20 0v20L0 0" filter="url(#filter1)" />
                                        </svg>
                                    </div>
                                )
                            }
                        </div>
                }
            </div>
        );
    }
}

AnterosChatMessageBox.defaultProps = {
    position: 'left',
    type: 'text',
    text: '',
    title: null,
    titleColor: null,
    onTitleClick: null,
    onForwardClick: null,
    onReplyClick: null,
    onRemoveMessageClick: null,
    onReplyMessageClick: null,
    date: new Date(),
    data: {},
    onClick: null,
    onOpen: null,
    onDownload: null,
    onLoad: null,
    onPhotoError: null,
    forwarded: false,
    reply: false,
    status: null,
    dateString: null,
    notch: true,
    avatar: null,
    renderAddCmp: null,
    copiableDate: false,
    onContextMenu: null,
    focus: false,
    onMessageFocused: null,
};


export default AnterosChatMessageBox;
