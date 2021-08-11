import React from 'react';

import {AnterosIcon} from '@anterostecnologia/anteros-react-image';

import {
    format,
} from'timeago.js';

import AnterosChatAvatar from '../Avatar/AnterosChatAvatar';
import AnterosChatDropdown from '../Dropdown/AnterosChatDropdown';

import classNames from 'classnames';

export class AnterosChatMeetingMessage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            toogle: false,
        };
    }

    toggleClick() {
        this.setState({
            toogle: !this.state.toogle,
        })
    }

    render() {
        const {
            date,
            dateString,
            title,
            subject,
            collapseTitle,
            moreItems,
            participants,
            dataSource,

            onClick,
            onMeetingTitleClick,
            onMeetingVideoLinkClick,
            onMeetingMoreSelect,
        } = this.props;

        const PARTICIPANT_LIMIT = this.props.participantsLimit;

        const dateText = dateString ? dateString : (date && !isNaN(date) && (format(date)));

        return (
            <div className="chat-mbox-mtmg">
                <div className="chat-mtmg">
                    <div
                        className="chat-mtmg-subject">
                        {subject || 'Unknown Meeting'}
                    </div>
                    <div
                        className="chat-mtmg-body"
                        onClick={onClick}>
                        <div className="chat-mtmg-item">
                            <AnterosIcon icon="fal fa-calendar" />
                            <div className="chat-mtmg-content">
                                <span className="chat-mtmg-title">
                                    {title}
                                </span>
                                <span className='chat-mtmg-date'>
                                    {dateText}
                                </span>
                            </div>
                        </div>

                        {
                            moreItems &&
                            moreItems.length > 0 &&
                            <div>
                                <AnterosChatDropdown
                                    animationType="bottom"
                                    animationPosition="norteast"
                                    buttonProps={{
                                        className:'chat-mtmg-right-icon',
                                        icon: {
                                            component: <AnterosIcon icon="fal fa-ellipsis-h" size="24"/>,
                                            size: 24,
                                        },
                                    }}
                                    items={moreItems}
                                    onSelect={onMeetingMoreSelect}/>
                            </div>
                        }
                    </div>
                    <div
                        className="chat-mtmg-body-bottom"
                        onClick={() => this.toggleClick()}>
                        {
                            this.state.toogle === true ?
                            <div className="chat-mtmg-bottom--tptitle">
                                <AnterosIcon icon="fal fa-caret-down"/>
                                <span>{collapseTitle}</span>
                            </div>
                            :
                            <div className="chat-mtmg-body-bottom--bttitle">
                                <AnterosIcon icon="fal fa-caret-right"/>
                                <span>
                                    {
                                        participants.slice(0, PARTICIPANT_LIMIT).map(x => x.title || 'Unknow').join(', ')
                                    }
                                    {
                                        participants.length > PARTICIPANT_LIMIT &&
                                            `, +${(participants.length - PARTICIPANT_LIMIT)}`
                                    }
                                </span>
                            </div>
                        }
                    </div>
                    <div
                        className={classNames(
                            'chat-mtmg-toogleContent',
                            {'chat-mtmg-toogleContent--click': this.state.toogle === true}
                        )}>
                        {
                            dataSource &&
                            dataSource.map((x, i) => {
                                return (
                                    <div key={i}>
                                        {
                                            !x.event &&
                                            <div className="chat-mitem">
                                                <div
                                                    className={classNames(
                                                        'chat-mitem avatar',
                                                        {'chat-mitem no-avatar': !x.avatar}
                                                    )}>
                                                    {
                                                        x.avatar ?
                                                            <AnterosChatAvatar src={x.avatar}/>
                                                            : <AnterosIcons icon="fal fa-comment-alt" />
                                                    }
                                                </div>
                                                <div className="chat-mitem-body">
                                                    <div className="chat-mitem-body--top">
                                                        <div
                                                            className="chat-mitem-body--top-title"
                                                            onClick={(e) => onMeetingTitleClick(x, i, e)}>
                                                            {x.title}
                                                        </div>
                                                        <div className="chat-mitem-body--top-time">
                                                            {
                                                                x.dateString ? x.dateString : (x.date &&
                                                                !isNaN(x.date) &&
                                                                (format(x.date)))
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="chat-mitem-body--bottom">
                                                        <div
                                                            className="chat-mitem-body--bottom-title" >
                                                            {x.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }

                                        {
                                            x.event &&
                                            <div className="chat-mitem-event">
                                                <div className="chat-mitem-bottom-body">
                                                    <div className="chat-mitem-body avatar">
                                                        <AnterosIcon icon="fal fa-video" />
                                                    </div>
                                                    <div className="chat-mitem-bottom-body-top">
                                                        {x.event.title}
                                                        <div className="chat-mitem-body--top-time">
                                                            {
                                                                x.dateString ? x.dateString : (x.date &&
                                                                !isNaN(x.date) &&
                                                                (format(x.date)))
                                                            }
                                                        </div>
                                                        <div className="chat-mitem-avatar-content">
                                                            {
                                                                <div className="chat-mitem-avatar">
                                                                    {
                                                                        x.event.avatars &&
                                                                        x.event.avatars.slice(0, x.event.avatarsLimit).map((x, i) => x instanceof Avatar ? x : (
                                                                            <AnterosChatAvatar
                                                                                key={i}
                                                                                src={x.src} />
                                                                        ))
                                                                    }
                                                                    {
                                                                        x.event.avatars && x.event.avatarsLimit &&
                                                                        x.event.avatars.length > x.event.avatarsLimit &&
                                                                        <div className='chat-mitem-length chat-mitem-tooltip' tooltip={x.event.avatars.slice(x.event.avatarsLimit, x.event.avatars.length).map(avatar => avatar.title).join(",")}>
                                                                            <span className="chat-mitem-tooltip-text" >
                                                                                {'+' + (x.event.avatars.length - x.event.avatarsLimit)}
                                                                            </span>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            }
                                                        </div>
                                                        {
                                                            x.record &&
                                                            <div className="chat-mtmg-call-record">
                                                                <div className="chat-mtmg-call-body">
                                                                    <div
                                                                        onClick={(e) => onMeetingVideoLinkClick(x, i, e)}
                                                                        className="chat-mtmg-call-avatars">
                                                                        <AnterosChatAvatar
                                                                            className={'chat-mtmg-call-avatars'}
                                                                            src={x.record.avatar}/>
                                                                        <div className={'chat-mtmg-record-time'}>
                                                                            {x.record.time}
                                                                        </div>
                                                                    </div>
                                                                    <div className="chat-mtmg-call-body-title">
                                                                        <span>
                                                                            {x.record.title}
                                                                        </span>
                                                                        <div className="chat-mtmg-call-body-bottom">
                                                                            {x.record.savedBy}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

AnterosChatMeetingMessage.defaultProps = {
    date: new Date(),
    dateString: '',
    title: '',
    subject: '',
    collapseTitle: '',
    participantsLimit: 3,
    avatarFlexible: false,
    moreItems: [],
    dataSource: [],
    participants: [],
    onClick: () => void(0),
    onMeetingMoreSelect: () => void(0),
    onMeetingTitleClick: () => void(0),
    onMeetingVideoLinkClick: () => void(0),
    onAvatarError: () => void(0),
};

export default AnterosChatMeetingMessage;
