import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { boundClass } from 'anteros-react-core';
import AnterosAudioSpectrum from './AnterosAudioSpectrum';

@boundClass
class AnterosAudioPlayer extends Component {
    constructor(props){
        super(props);
        this.audioId = this.props.id || this.getRandomId(20);
    }
    componentDidMount() {
        const audio = this.audioEl;

        this.updateVolume(this.props.volume);

        audio.addEventListener('error', (e) => {
            this.props.onError(e);
        });

        audio.addEventListener('canplay', (e) => {
            this.props.onCanPlay(e);
        });

        audio.addEventListener('canplaythrough', (e) => {
            this.props.onCanPlayThrough(e);
        });

        audio.addEventListener('play', (e) => {
            this.setListenTrack();
            this.props.onPlay(e);
        });

        audio.addEventListener('abort', (e) => {
            this.clearListenTrack();
            this.props.onAbort(e);
        });

        audio.addEventListener('ended', (e) => {
            this.clearListenTrack();
            this.props.onEnded(e);
        });

        audio.addEventListener('pause', (e) => {
            this.clearListenTrack();
            this.props.onPause(e);
        });

        audio.addEventListener('seeked', (e) => {
            this.props.onSeeked(e);
        });

        audio.addEventListener('loadedmetadata', (e) => {
            this.props.onLoadedMetadata(e);
        });

        audio.addEventListener('volumechange', (e) => {
            this.props.onVolumeChanged(e);
        });
    }

    componentWillReceiveProps(nextProps) {
        this.updateVolume(nextProps.volume);
    }

    setListenTrack() {
        if (!this.listenTracker) {
            const listenInterval = this.props.listenInterval;
            this.listenTracker = setInterval(() => {
                this.props.onListen(this.audioEl.currentTime);
            }, listenInterval);
        }
    }

    updateVolume(volume) {
        if (typeof volume === 'number' && volume !== this.audioEl.volume) {
            this.audioEl.volume = volume;
        }
    }

    clearListenTrack() {
        if (this.listenTracker) {
            clearInterval(this.listenTracker);
            this.listenTracker = null;
        }
    }

    getRandomId(len) {
        let str = '1234567890-qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
        let strLen = str.length
        let res = ''
        for (let i = 0; i < len; i++) {
            let randomIndex = Math.floor((Math.random() * strLen))
            res += str[randomIndex]
        }
        return res
    }

    render() {
        const incompatibilityMessage = this.props.children || (
            <p>Seu navegador não suporta elemento de <code>audio</code>.</p>
        );
        const controls = !(this.props.controls === false);
        const title = this.props.title ? this.props.title : this.props.src;
        const conditionalProps = {};
        if (this.props.controlsList) {
            conditionalProps.controlsList = this.props.controlsList;
        }
        return (
            <div style={{ justifyContent: "center", display: "grid" }}>
                {this.props.showSpectrum?<AnterosAudioSpectrum
                    height={100}
                    width={300}
                    audioId={this.audioId}
                    capColor={'red'}
                    capHeight={2}
                    meterWidth={2}
                    meterCount={512}
                    meterColor={[
                        { stop: 0, color: '#f00' },
                        { stop: 0.5, color: '#0CD7FD' },
                        { stop: 1, color: 'red' }
                    ]}
                    gap={4}
                />:null}
                <audio
                    autoPlay={this.props.autoPlay}
                    className={`react-audio-player ${this.props.className}`}
                    controls={controls}
                    crossOrigin={this.props.crossOrigin}
                    id={this.audioId}
                    loop={this.props.loop}
                    muted={this.props.muted}
                    onPlay={this.onPlay}
                    preload={this.props.preload}
                    ref={(ref) => { this.audioEl = ref; }}
                    src={this.props.src}
                    style={this.props.style}
                    tabIndex={-1}
                    title={title}
                    {...conditionalProps}
                >
                    {incompatibilityMessage}
                </audio>
            </div>
        );
    }
}

AnterosAudioPlayer.defaultProps = {
    autoPlay: false,
    children: null,
    className: '',
    controls: true,
    controlsList: '',
    crossOrigin: null,
    id: '',
    listenInterval: 10000,
    loop: false,
    muted: false,
    onAbort: () => { },
    onCanPlay: () => { },
    onCanPlayThrough: () => { },
    onEnded: () => { },
    onError: () => { },
    onListen: () => { },
    onPause: () => { },
    onPlay: () => { },
    onSeeked: () => { },
    onVolumeChanged: () => { },
    onLoadedMetadata: () => { },
    preload: 'metadata',
    src: null,
    style: {},
    title: '',
    volume: 1.0,
    showSpectrum: true
};

AnterosAudioPlayer.propTypes = {
    autoPlay: PropTypes.bool,
    children: PropTypes.element,
    className: PropTypes.string,
    controls: PropTypes.bool,
    controlsList: PropTypes.string,
    crossOrigin: PropTypes.string,
    id: PropTypes.string,
    listenInterval: PropTypes.number,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    onAbort: PropTypes.func,
    onCanPlay: PropTypes.func,
    onCanPlayThrough: PropTypes.func,
    onEnded: PropTypes.func,
    onError: PropTypes.func,
    onListen: PropTypes.func,
    onLoadedMetadata: PropTypes.func,
    onPause: PropTypes.func,
    onPlay: PropTypes.func,
    onSeeked: PropTypes.func,
    onVolumeChanged: PropTypes.func,
    preload: PropTypes.oneOf(['', 'none', 'metadata', 'auto']),
    src: PropTypes.string,
    style: PropTypes.objectOf(PropTypes.string),
    title: PropTypes.string,
    volume: PropTypes.number,
    showSpectrum: PropTypes.bool.isRequired
};

export default AnterosAudioPlayer;