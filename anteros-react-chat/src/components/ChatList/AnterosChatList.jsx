import React, { Component } from 'react';

import AnterosChatItem from '../ChatItem/AnterosChatItem';

const classNames = require('classnames');

export class AnterosChatList extends Component {

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

    render() {
        return (
            <div
                ref={this.props.cmpRef}
                className={classNames('chat-container-clist', this.props.className)}>
                {
                    this.props.dataSource.map((x, i) => (
                        <AnterosChatItem
                            id={x.id || i}
                            key={i}
                            lazyLoadingImage={this.props.lazyLoadingImage}
                            {...x}
                            onAvatarError={(e) => this.onAvatarError(x, i, e)}
                            onContextMenu={(e) => this.onContextMenu(x, i, e)}
                            onClick={(e) => this.onClick(x, i, e)}/>
                    ))
                }
            </div>
        );
    }
}

AnterosChatList.defaultProps = {
    dataSource: [],
    onClick: null,
    lazyLoadingImage: undefined,
};

export default AnterosChatList;
