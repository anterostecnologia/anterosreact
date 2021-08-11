import React from 'react';

const classNames = require('classnames');

const STATIC_URL = 'https://maps.googleapis.com/maps/api/staticmap?markers=color:MARKER_COLOR|LATITUDE,LONGITUDE&zoom=ZOOM&size=270x200&scale=2&key=KEY';
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=LATITUDE,LONGITUDE&zoom=ZOOM';

export class AnterosChatLocationMessage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.className = this.className.bind(this);
    }

    buildURL(url) {
        var center = this.props.data || {};

        return url.replace(/LATITUDE/g, center.latitude)
                  .replace(/LONGITUDE/g, center.longitude)
                  .replace('MARKER_COLOR', this.props.markerColor)
                  .replace('ZOOM', this.props.zoom)
                  .replace('KEY', this.props.apiKey);
    }

    className() {
        var className = classNames('chat-mbox-location', this.props.className);

        if (this.props.text) {
            className = classNames(className, 'chat-mbox-location-has-text');
        }

        return className;
    }

    render() {
        const data = this.props.data || {};

        return (
            <div className='chat-container-lmsg'>
                <a
                    onClick={this.props.onOpen}
                    target={this.props.target}
                    href={this.props.href || this.props.src || this.buildURL(data.mapURL || MAP_URL)}
                    className={this.className()}>
                    <img
                        onError={this.props.onError}
                        className='chat-mbox-location-img'
                        src={
                            this.props.src ||
                            this.buildURL(data.staticURL || STATIC_URL)
                        }/>
                </a>
                {
                    this.props.text &&
                    <div className="chat-mbox-text chat-mbox-location-text">
                        {this.props.text}
                    </div>
                }
            </div>
        );
    }
}

AnterosChat.defaultProps = {
    target: '_blank',
    apiKey: '',
    zoom: 14,
    markerColor: 'red',
    onError: () => void(0),
}

export default AnterosChat;
