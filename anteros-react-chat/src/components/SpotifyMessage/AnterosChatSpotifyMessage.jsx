import React from 'react';

const classNames = require('classnames');

export class AnterosChatSpotifyMessage extends React.PureComponent {
    toUrl() {
        var formBody = [];
        var data = {
            uri: this.props.uri,
            theme: this.props.theme,
            view: this.props.view,
        };
        for (var property in data) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        return formBody;
    }

    render() {
        if (!this.props.uri)
            return null;
        return (
            <div className="chat-mbox-spotify">
                <iframe
                    src={"https://open.spotify.com/embed?" + this.toUrl()}
                    width={this.props.width}
                    height={this.props.height}
                    frameBorder="0"
                    allowtransparency="true"></iframe>
            </div>
        );
    }
}

AnterosChatSpotifyMessage.defaultProps = {
    uri: '',
    theme: 'black',
    view: 'list',
    width: 300,
    height: 380,
}

export default AnterosChatSpotifyMessage;
