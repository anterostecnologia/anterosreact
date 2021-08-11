import React, { Component } from 'react';


import AnterosChatMeetingItem from '../MeetingItem/AnterosChatMeetingItem';

const classNames = require('classnames');

export class AnterosChatMeetingList extends Component {

    onClick(item, i, e) {
        if (this.props.onClick instanceof Function)
            this.props.onClick(item, i, e);
    }

    onContextMenu(item, i, e) {
        e.preventDefault();
        if (this.props.onContextMenu instanceof Function)
            this.props.onContextMenu(item, i, e);
    }

    onAvatarError(item, i, e) {
        if (this.props.onAvatarError instanceof Function)
            this.props.onAvatarError(item, i, e);
    }

    onMeetingClick(item, i, e) {
        if (this.props.onMeetingClick instanceof Function)
            this.props.onMeetingClick(item, i, e);
    }

    onShareClick(item, i, e) {
        if (this.props.onShareClick instanceof Function)
            this.props.onShareClick(item, i, e);
    }

    onCloseClick(item, i, e) {
        if (this.props.onCloseClick instanceof Function)
            this.props.onCloseClick(item, i, e);
    }

    render() {
        return (
            <div
                ref={this.props.cmpRef}
                className={classNames('chat-container-mtlist', this.props.className)}>
                {
                    this.props.dataSource.map((x, i) => (
                        <AnterosChatMeetingItem
                            id={x.id || i}
                            key={i}
                            lazyLoadingImage={this.props.lazyLoadingImage}
                            {...x}
                            onAvatarError={(e) => this.onAvatarError(x, i, e)}
                            onContextMenu={(e) => this.onContextMenu(x, i, e)}
                            onClick={(e) => this.onClick(x, i, e)}
                            onMeetingClick={(e) => this.onMeetingClick(x, i, e)}
                            onShareClick={(e) => this.onShareClick(x, i, e)}
                            onCloseClick={(e) => this.onCloseClick(x, i, e)}/>
                    ))
                }
            </div>
        );
    }
}

AnterosChatMeetingList.defaultProps = {
    dataSource: [],
    onClick: null,
    lazyLoadingImage: undefined,
};

export default AnterosChatMeetingList;
