import React, { Component, isValidElement } from 'react'
import PropTypes from 'prop-types'
import loadScript from 'load-script'
import merge from 'deepmerge'
import {boundClass} from '@anterostecnologia/anteros-react-core';

const SUPPORTED_PROPS = Object.keys(propTypes)
const SEEK_ON_PLAY_EXPIRY = 5000
let customPlayers = []
const { string, bool, number, array, oneOfType, shape, object, func, node } = PropTypes
const PRELOAD_PLAYERS = [
  {
    Player: AnterosYouTube,
    configKey: 'youtube',
    url: 'https://www.youtube.com/watch?v=GlCmAC4MHek'
  },
  {
    Player: AnterosSoundCloud,
    configKey: 'soundcloud',
    url: 'https://soundcloud.com/seucheu/john-cage-433-8-bit-version'
  },
  {
    Player: AnterosVimeo,
    configKey: 'vimeo',
    url: 'https://vimeo.com/300970506'
  },
  {
    Player: AnterosDailyMotion,
    configKey: 'dailymotion',
    url: 'http://www.dailymotion.com/video/xqdpyk'
  }
]

const MATCH_START_QUERY = /[?&#](?:start|t)=([0-9hms]+)/
const MATCH_END_QUERY = /[?&#]end=([0-9hms]+)/
const MATCH_START_STAMP = /(\d+)(h|m|s)/g
const MATCH_NUMERIC = /^\d+$/

// Parse YouTube URL for a start time param, ie ?t=1h14m30s
// and return the start time in seconds
function parseTimeParam(url, pattern) {
    const match = url.match(pattern)
    if (match) {
        const stamp = match[1]
        if (stamp.match(MATCH_START_STAMP)) {
            return parseTimeString(stamp)
        }
        if (MATCH_NUMERIC.test(stamp)) {
            return parseInt(stamp)
        }
    }
    return undefined
}

function parseTimeString(stamp) {
    let seconds = 0
    let array = MATCH_START_STAMP.exec(stamp)
    while (array !== null) {
        const [, count, period] = array
        if (period === 'h') seconds += parseInt(count, 10) * 60 * 60
        if (period === 'm') seconds += parseInt(count, 10) * 60
        if (period === 's') seconds += parseInt(count, 10)
        array = MATCH_START_STAMP.exec(stamp)
    }
    return seconds
}

function parseStartTime(url) {
    return parseTimeParam(url, MATCH_START_QUERY)
}

function parseEndTime(url) {
    return parseTimeParam(url, MATCH_END_QUERY)
}

function randomString() {
    return Math.random().toString(36).substr(2, 5)
}

function queryString(object) {
    return Object
        .keys(object)
        .map(key => `${key}=${object[key]}`)
        .join('&')
}

const requests = {}
function getSDK(url, sdkGlobal, sdkReady = null, isLoaded = () => true, fetchScript = loadScript) {
    if (window[sdkGlobal] && isLoaded(window[sdkGlobal])) {
        return Promise.resolve(window[sdkGlobal])
    }
    return new Promise((resolve, reject) => {
        if (requests[url]) {
            requests[url].push({ resolve, reject })
            return
        }
        requests[url] = [{ resolve, reject }]
        const onLoaded = sdk => {
            requests[url].forEach(request => request.resolve(sdk))
        }
        if (sdkReady) {
            const previousOnReady = window[sdkReady]
            window[sdkReady] = function () {
                if (previousOnReady) previousOnReady()
                onLoaded(window[sdkGlobal])
            }
        }
        fetchScript(url, err => {
            if (err) {
                requests[url].forEach(request => request.reject(err))
                requests[url] = null
            } else if (!sdkReady) {
                onLoaded(window[sdkGlobal])
            }
        })
    })
}

function getConfig(props, defaultProps, showWarning) {
    let config = merge(defaultProps.config, props.config)
    for (const p of DEPRECATED_CONFIG_PROPS) {
        if (props[p]) {
            const key = p.replace(/Config$/, '')
            config = merge(config, { [key]: props[p] })
            if (showWarning) {
                const link = 'https://github.com/CookPete/react-player#config-prop'
                const message = `ReactPlayer: %c${p} %cis deprecated, please use the config prop instead – ${link}`
                console.warn(message, 'font-weight: bold', '')
            }
        }
    }
    return config
}

function omit(object, ...arrays) {
    const omitKeys = [].concat(...arrays)
    const output = {}
    const keys = Object.keys(object)
    for (const key of keys) {
        if (omitKeys.indexOf(key) === -1) {
            output[key] = object[key]
        }
    }
    return output
}

function callPlayer(method, ...args) {
    if (!this.player || !this.player[method]) {
        let message = `ReactPlayer: ${this.constructor.displayName} player could not call %c${method}%c – `
        if (!this.player) {
            message += 'The player was not available'
        } else if (!this.player[method]) {
            message += 'The method was not available'
        }
        console.warn(message, 'font-weight: bold', '')
        return null
    }
    return this.player[method](...args)
}

function isObject(val) {
    return val !== null && typeof val === 'object'
}

function isEqual(a, b) {
    if (typeof a === 'function' && typeof b === 'function') {
        return true
    }
    if (isValidElement(a) && isValidElement(b)) {
        return true
    }
    if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length) {
            return false
        }
        for (let i = 0; i !== a.length; i++) {
            if (!isEqual(a[i], b[i])) {
                return false
            }
        }
        return true
    }
    if (isObject(a) && isObject(b)) {
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false
        }
        for (const key of Object.keys(a)) {
            if (!isEqual(a[key], b[key])) {
                return false
            }
        }
        return true
    }
    return a === b
}

function isMediaStream(url) {
    return (
        typeof window !== 'undefined' &&
        typeof window.MediaStream !== 'undefined' &&
        url instanceof window.MediaStream
    )
}


const propTypes = {
    url: oneOfType([string, array, object]),
    playing: bool,
    loop: bool,
    controls: bool,
    volume,
    muted: bool,
    playbackRate,
    width: oneOfType([string, number]),
    height: oneOfType([string, number]),
    style: object,
    progressInterval,
    playsinline: bool,
    pip: bool,
    light: oneOfType([bool, string]),
    playIcon,
    wrapper: oneOfType([
        string,
        func,
        shape({ render: func.isRequired })
    ]),
    config: shape({
        soundcloud: shape({
            options: object,
            preload: bool
        }),
        youtube: shape({
            playerVars: object,
            embedOptions: object,
            preload: bool
        }),
        facebook: shape({
            appId: string,
            version: string
        }),
        dailymotion: shape({
            params: object,
            preload: bool
        }),
        vimeo: shape({
            playerOptions: object,
            preload: bool
        }),
        file: shape({
            attributes: object,
            tracks: array,
            forceVideo: bool,
            forceAudio: bool,
            forceHLS: bool,
            forceDASH: bool,
            hlsOptions: object,
            hlsVersion: string,
            dashVersion: string
        }),
        wistia: shape({
            options: object
        }),
        mixcloud: shape({
            options: object
        }),
        twitch: shape({
            options: object
        })
    }),
    onReady: func,
    onStart: func,
    onPlay: func,
    onPause: func,
    onBuffer: func,
    onBufferEnd: func,
    onEnded: func,
    onError: func,
    onDuration: func,
    onSeek: func,
    onProgress: func,
    onEnablePIP: func,
    onDisablePIP: func
}

const defaultProps = {
    playing: false,
    loop: false,
    controls: false,
    volume: null,
    muted: false,
    playbackRate: 1,
    width: '640px',
    height: '360px',
    style: {},
    progressInterval: 1000,
    playsinline: false,
    pip: false,
    light: false,
    wrapper: 'div',
    config: {
        soundcloud: {
            options: {
                visual: true,
                buying: false,
                liking: false,
                download: false,
                sharing: false,
                show_comments: false,
                show_playcount: false
            }
        },
        youtube: {
            playerVars: {
                playsinline: 1,
                showinfo: 0,
                rel: 0,
                iv_load_policy: 3,
                modestbranding: 1
            },
            embedOptions: {},
            preload: false
        },
        facebook: {
            appId: '1309697205772819',
            version: 'v3.3'
        },
        dailymotion: {
            params: {
                api: 1,
                'endscreen-enable': false
            },
            preload: false
        },
        vimeo: {
            playerOptions: {
                autopause: false,
                byline: false,
                portrait: false,
                title: false
            },
            preload: false
        },
        file: {
            attributes: {},
            tracks: [],
            forceVideo: false,
            forceAudio: false,
            forceHLS: false,
            forceDASH: false,
            hlsOptions: {},
            hlsVersion: '0.10.1',
            dashVersion: '2.9.2'
        },
        wistia: {
            options: {}
        },
        mixcloud: {
            options: {
                hide_cover: 1
            }
        },
        twitch: {
            options: {}
        }
    },
    onReady: function () { },
    onStart: function () { },
    onPlay: function () { },
    onPause: function () { },
    onBuffer: function () { },
    onBufferEnd: function () { },
    onEnded: function () { },
    onError: function () { },
    onDuration: function () { },
    onSeek: function () { },
    onProgress: function () { },
    onEnablePIP: function () { },
    onDisablePIP: function () { }
}

const DEPRECATED_CONFIG_PROPS = [
    'soundcloudConfig',
    'youtubeConfig',
    'facebookConfig',
    'dailymotionConfig',
    'vimeoConfig',
    'fileConfig',
    'wistiaConfig'
]




export class AnterosPlayer extends Component {
    constructor(props){
        super(props);
        this.mounted = false;
        this.isReady = false;
        this.isPlaying = false;
        this.isLoading = true;
        this.loadOnReady = null;
        this.startOnPlay = true;
        this.seekOnPlay = null;
        this.onDurationCalled = false;
    }

    get componentName(){
        return "AnterosPlayer";
    }
    componentDidMount() {
        this.mounted = true
        this.player.load(this.props.url)
        this.progress()
    }

    componentWillUnmount() {
        clearTimeout(this.progressTimeout)
        clearTimeout(this.durationCheckTimeout)
        if (this.isReady) {
            this.player.stop()
        }
        if (this.player.disablePIP) {
            this.player.disablePIP()
        }
        this.mounted = false
    }

    componentDidUpdate(prevProps) {
        const { url, playing, volume, muted, playbackRate, pip, loop, activePlayer } = this.props
        if (!isEqual(prevProps.url, url)) {
            if (this.isLoading && !activePlayer.forceLoad) {
                console.warn(`AnterosReactPlayer: a tentativa de carregar $ {url} está sendo adiada até o player carregar`)
                this.loadOnReady = url
                return
            }
            this.isLoading = true
            this.startOnPlay = true
            this.onDurationCalled = false
            this.player.load(url, this.isReady)
        }
        if (!prevProps.playing && playing && !this.isPlaying) {
            this.player.play()
        }
        if (prevProps.playing && !playing && this.isPlaying) {
            this.player.pause()
        }
        if (!prevProps.pip && pip && this.player.enablePIP) {
            this.player.enablePIP()
        }
        if (prevProps.pip && !pip && this.player.disablePIP) {
            this.player.disablePIP()
        }
        if (prevProps.volume !== volume && volume !== null) {
            this.player.setVolume(volume)
        }
        if (prevProps.muted !== muted) {
            if (muted) {
                this.player.mute()
            } else {
                this.player.unmute()
                if (volume !== null) {
                    setTimeout(() => this.player.setVolume(volume))
                }
            }
        }
        if (prevProps.playbackRate !== playbackRate && this.player.setPlaybackRate) {
            this.player.setPlaybackRate(playbackRate)
        }
        if (prevProps.loop !== loop && this.player.setLoop) {
            this.player.setLoop(loop)
        }
    }

    getDuration() {
        if (!this.isReady) return null
        return this.player.getDuration()
    }

    getCurrentTime() {
        if (!this.isReady) return null
        return this.player.getCurrentTime()
    }

    getSecondsLoaded() {
        if (!this.isReady) return null
        return this.player.getSecondsLoaded()
    }

    getInternalPlayer = (key) => {
        if (!this.player) return null
        return this.player[key]
    }

    progress = () => {
        if (this.props.url && this.player && this.isReady) {
            const playedSeconds = this.getCurrentTime() || 0
            const loadedSeconds = this.getSecondsLoaded()
            const duration = this.getDuration()
            if (duration) {
                const progress = {
                    playedSeconds,
                    played: playedSeconds / duration
                }
                if (loadedSeconds !== null) {
                    progress.loadedSeconds = loadedSeconds
                    progress.loaded = loadedSeconds / duration
                }
                if (progress.playedSeconds !== this.prevPlayed || progress.loadedSeconds !== this.prevLoaded) {
                    this.props.onProgress(progress)
                }
                this.prevPlayed = progress.playedSeconds
                this.prevLoaded = progress.loadedSeconds
            }
        }
        this.progressTimeout = setTimeout(this.progress, this.props.progressFrequency || this.props.progressInterval)
    }

    seekTo(amount, type) {
        if (!this.isReady && amount !== 0) {
            this.seekOnPlay = amount
            setTimeout(() => { this.seekOnPlay = null }, SEEK_ON_PLAY_EXPIRY)
            return
        }
        const isFraction = !type ? (amount > 0 && amount < 1) : type === 'fraction'
        if (isFraction) {
            const duration = this.player.getDuration()
            if (!duration) {
                console.warn('AnterosReactPlayer: não foi possível procurar usando a fração - a duração ainda não está disponível')
                return
            }
            this.player.seekTo(duration * amount)
            return
        }
        this.player.seekTo(amount)
    }

    handleReady = () => {
        if (!this.mounted) return
        this.isReady = true
        this.isLoading = false
        const { onReady, playing, volume, muted } = this.props
        onReady()
        if (!muted && volume !== null) {
            this.player.setVolume(volume)
        }
        if (this.loadOnReady) {
            this.player.load(this.loadOnReady, true)
            this.loadOnReady = null
        } else if (playing) {
            this.player.play()
        }
        this.handleDurationCheck()
    }

    handlePlay = () => {
        this.isPlaying = true
        this.isLoading = false
        const { onStart, onPlay, playbackRate } = this.props
        if (this.startOnPlay) {
            if (this.player.setPlaybackRate && playbackRate !== 1) {
                this.player.setPlaybackRate(playbackRate)
            }
            onStart()
            this.startOnPlay = false
        }
        onPlay()
        if (this.seekOnPlay) {
            this.seekTo(this.seekOnPlay)
            this.seekOnPlay = null
        }
        this.handleDurationCheck()
    }

    handlePause = (e) => {
        this.isPlaying = false
        if (!this.isLoading) {
            this.props.onPause(e)
        }
    }

    handleEnded = () => {
        const { activePlayer, loop, onEnded } = this.props
        if (activePlayer.loopOnEnded && loop) {
            this.seekTo(0)
        }
        if (!loop) {
            this.isPlaying = false
            onEnded()
        }
    }

    handleError = (...args) => {
        this.isLoading = false
        this.props.onError(...args)
    }

    handleDurationCheck = () => {
        clearTimeout(this.durationCheckTimeout)
        const duration = this.getDuration()
        if (duration) {
            if (!this.onDurationCalled) {
                this.props.onDuration(duration)
                this.onDurationCalled = true
            }
        } else {
            this.durationCheckTimeout = setTimeout(this.handleDurationCheck, 100)
        }
    }

    handleLoaded = () => {
        this.isLoading = false
    }

    ref = player => {
        if (player) {
            this.player = player
        }
    }

    render() {
        const Player = this.props.activePlayer
        if (!Player) {
            return null
        }
        return (
            <Player
                {...this.props}
                ref={this.ref}
                onReady={this.handleReady}
                onPlay={this.handlePlay}
                onPause={this.handlePause}
                onEnded={this.handleEnded}
                onLoaded={this.handleLoaded}
                onError={this.handleError}
            />
        )
    }
}

AnterosPlayer.propTypes = propTypes;
AnterosPlayer.defaultProps = defaultProps;


export class AnterosReactPlayer extends Component {
    static addCustomPlayer = player => {
        customPlayers.push(player)
    }

    static removeCustomPlayers = () => {
        customPlayers = []
    }

    get componentName(){
        return "AnterosReactPlayer";
    }

    static canPlay = url => {
        for (const Player of [...customPlayers, ...players]) {
            if (Player.canPlay(url)) {
                return true
            }
        }
        return false
    }

    static canEnablePIP = url => {
        for (const Player of [...customPlayers, ...players]) {
            if (Player.canEnablePIP && Player.canEnablePIP(url)) {
                return true
            }
        }
        return false
    }

    config = getConfig(this.props, defaultProps, true)
    state = {
        showPreview: !!this.props.light
    }

    componentDidMount() {
        if (this.props.progressFrequency) {
            const message = 'AnterosReactPlayer: %cprogressFrequency%c está depreciada, por favor use %cprogressInterval%c no lugar.'
            console.warn(message, 'font-weight: bold', '', 'font-weight: bold', '')
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState)
    }

    componentDidUpdate(prevProps) {
        const { light } = this.props
        this.config = getConfig(this.props, defaultProps)
        if (!prevProps.light && light) {
            this.setState({ showPreview: true })
        }
        if (prevProps.light && !light) {
            this.setState({ showPreview: false })
        }
    }

    handleClickPreview = () => {
        this.setState({ showPreview: false })
    }

    showPreview = () => {
        this.setState({ showPreview: true })
    }

    getDuration = () => {
        if (!this.player) return null
        return this.player.getDuration()
    }

    getCurrentTime = () => {
        if (!this.player) return null
        return this.player.getCurrentTime()
    }

    getSecondsLoaded = () => {
        if (!this.player) return null
        return this.player.getSecondsLoaded()
    }

    getInternalPlayer = (key = 'player') => {
        if (!this.player) return null
        return this.player.getInternalPlayer(key)
    }

    seekTo = (fraction, type) => {
        if (!this.player) return null
        this.player.seekTo(fraction, type)
    }

    handleReady = () => {
        this.props.onReady(this)
    }

    getActivePlayer(url) {
        for (const Player of [...customPlayers, ...players]) {
            if (Player.canPlay(url)) {
                return Player
            }
        }
        return FilePlayer
    }

    wrapperRef = wrapper => {
        this.wrapper = wrapper
    }

    activePlayerRef = player => {
        this.player = player
    }

    renderActivePlayer(url, activePlayer) {
        if (!url) return null
        return (
            <AnterosPlayer
                {...this.props}
                key={activePlayer.displayName}
                ref={this.activePlayerRef}
                config={this.config}
                activePlayer={activePlayer}
                onReady={this.handleReady}
            />
        )
    }

    sortPlayers(a, b) {
        if (a && b) {
            return a.key < b.key ? -1 : 1
        }
        return 0
    }

    render() {
        const { url, controls, style, width, height, light, playIcon, wrapper: Wrapper } = this.props
        const showPreview = this.state.showPreview && url
        const otherProps = omit(this.props, SUPPORTED_PROPS, DEPRECATED_CONFIG_PROPS)
        const activePlayer = this.getActivePlayer(url)
        const renderedActivePlayer = this.renderActivePlayer(url, activePlayer)
        const preloadPlayers = renderPreloadPlayers(url, controls, this.config)
        const players = [renderedActivePlayer, ...preloadPlayers].sort(this.sortPlayers)
        const preview = <Preview url={url} light={light} playIcon={playIcon} onClick={this.handleClickPreview} />
        return (
            <Wrapper ref={this.wrapperRef} style={{ ...style, width, height }} {...otherProps}>
                {showPreview ? preview : players}
            </Wrapper>
        )
    }
}

AnterosReactPlayer.propTypes = propTypes;
AnterosReactPlayer.defaultProps = defaultProps

export function createSinglePlayer(activePlayer) {
    return class AnterosSinglePlayer extends Component {
        static displayName = `${activePlayer.displayName}Player`
        static propTypes = propTypes
        static defaultProps = defaultProps
        static canPlay = activePlayer.canPlay

        config = getConfig(this.props, defaultProps, true)
        shouldComponentUpdate(nextProps) {
            return !isEqual(this.props, nextProps)
        }

        componentDidUpdate() {
            this.config = getConfig(this.props, defaultProps)
        }

        getDuration = () => {
            if (!this.player) return null
            return this.player.getDuration()
        }

        getCurrentTime = () => {
            if (!this.player) return null
            return this.player.getCurrentTime()
        }

        getSecondsLoaded = () => {
            if (!this.player) return null
            return this.player.getSecondsLoaded()
        }

        getInternalPlayer = (key = 'player') => {
            if (!this.player) return null
            return this.player.getInternalPlayer(key)
        }

        seekTo = (fraction, type) => {
            if (!this.player) return null
            this.player.seekTo(fraction, type)
        }

        ref = player => {
            this.player = player
        }

        render() {
            const { forceVideo, forceAudio, forceHLS, forceDASH } = this.config.file
            const skipCanPlay = forceVideo || forceAudio || forceHLS || forceDASH
            if (!activePlayer.canPlay(this.props.url) && !skipCanPlay) {
                return null
            }
            const { style, width, height, wrapper: Wrapper } = this.props
            const otherProps = omit(this.props, SUPPORTED_PROPS, DEPRECATED_CONFIG_PROPS)
            return (
                <Wrapper style={{ ...style, width, height }} {...otherProps}>
                    <AnterosPlayer
                        {...this.props}
                        ref={this.ref}
                        activePlayer={activePlayer}
                        config={this.config}
                    />
                </Wrapper>
            )
        }
    }
}


export function renderReactPlayer(container, props) {
    render(<AnterosReactPlayer {...props} />, container)
}

const ICON_SIZE = '64px'

export class Preview extends Component {
  mounted = false
  state = {
    image: null
  }

  get componentName(){
    return "Preview";
  }

  componentDidMount () {
    this.mounted = true
    this.fetchImage(this.props)
  }

  componentDidUpdate (prevProps) {
    const { url, light } = this.props
    if (prevProps.url !== url || prevProps.light !== light) {
      this.fetchImage(this.props)
    }
  }

  componentWillUnmount () {
    this.mounted = false
  }

  fetchImage ({ url, light }) {
    if (typeof light === 'string') {
      this.setState({ image: light })
      return
    }
    this.setState({ image: null })
    return window.fetch(`https://noembed.com/embed?url=${url}`)
      .then(response => response.json())
      .then(data => {
        if (data.thumbnail_url && this.mounted) {
          const image = data.thumbnail_url.replace('height=100', 'height=480')
          this.setState({ image })
        }
      })
  }

  render () {
    const { onClick, playIcon } = this.props
    const { image } = this.state
    const flexCenter = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
    const styles = {
      preview: {
        width: '100%',
        height: '100%',
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: 'pointer',
        ...flexCenter
      },
      shadow: {
        background: 'radial-gradient(rgb(0, 0, 0, 0.3), rgba(0, 0, 0, 0) 60%)',
        borderRadius: ICON_SIZE,
        width: ICON_SIZE,
        height: ICON_SIZE,
        ...flexCenter
      },
      playIcon: {
        borderStyle: 'solid',
        borderWidth: '16px 0 16px 26px',
        borderColor: 'transparent transparent transparent white',
        marginLeft: '7px'
      }
    }
    const defaultPlayIcon = (
      <div style={styles.shadow} className='anteros-react-player__shadow'>
        <div style={styles.playIcon} className='anteros-react-player__play-icon' />
      </div>
    )
    return (
      <div style={styles.preview} className='anteros-react-player__preview' onClick={onClick}>
        {playIcon || defaultPlayIcon}
      </div>
    )
  }
}




export function renderPreloadPlayers (url, controls, config) {
  const players = []

  for (const player of PRELOAD_PLAYERS) {
    if (!player.Player.canPlay(url) && config[player.configKey].preload) {
      players.push(
        <AnterosPlayer
          key={player.Player.displayName}
          activePlayer={player.Player}
          url={player.url}
          controls={controls}
          playing
          muted
          display='none'
        />
      )
    }
  }

  return players
}

const DM_SDK_URL = 'https://api.dmcdn.net/all.js'
const DM_SDK_GLOBAL = 'DM'
const DM_SDK_GLOBAL_READY = 'dmAsyncInit'
const DM_MATCH_URL = /^(?:(?:https?):)?(?:\/\/)?(?:www\.)?(?:(?:dailymotion\.com(?:\/embed)?\/video)|dai\.ly)\/([a-zA-Z0-9]+)(?:_[\w_-]+)?$/

@boundClass
@createSinglePlayer
export class AnterosDailyMotion extends Component {
  static canPlay = url => DM_MATCH_URL.test(url)
  static loopOnEnded = true

  get componentName(){
    return "AnterosDailyMotion";
  }

  callPlayer = callPlayer
  load (url) {
    const { controls, config, onError, playing } = this.props
    const [, id] = url.match(DM_MATCH_URL)
    if (this.player) {
      this.player.load(id, {
        start: parseStartTime(url),
        autoplay: playing
      })
      return
    }
    getSDK(DM_SDK_URL, DM_SDK_GLOBAL, DM_SDK_GLOBAL_READY, DM => DM.player).then(DM => {
      if (!this.container) return
      const Player = DM.player
      this.player = new Player(this.container, {
        width: '100%',
        height: '100%',
        video: id,
        params: {
          controls: controls,
          autoplay: this.props.playing,
          mute: this.props.muted,
          start: parseStartTime(url),
          origin: window.location.origin,
          ...config.dailymotion.params
        },
        events: {
          apiready: this.props.onReady,
          seeked: () => this.props.onSeek(this.player.currentTime),
          video_end: this.props.onEnded,
          durationchange: this.onDurationChange,
          pause: this.props.onPause,
          playing: this.props.onPlay,
          waiting: this.props.onBuffer,
          error: event => onError(event)
        }
      })
    }, onError)
  }

  onDurationChange = () => {
    const duration = this.getDuration()
    this.props.onDuration(duration)
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    
  }

  seekTo (seconds) {
    this.callPlayer('seek', seconds)
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction)
  }

  mute = () => {
    this.callPlayer('setMuted', true)
  }

  unmute = () => {
    this.callPlayer('setMuted', false)
  }

  getDuration () {
    return this.player.duration || null
  }

  getCurrentTime () {
    return this.player.currentTime
  }

  getSecondsLoaded () {
    return this.player.bufferedTime
  }

  ref = container => {
    this.container = container
  }

  render () {
    const { display } = this.props
    const style = {
      width: '100%',
      height: '100%',
      display
    }
    return (
      <div style={style}>
        <div ref={this.ref} />
      </div>
    )
  }
}

const FB_SDK_URL = 'https://connect.facebook.net/en_US/sdk.js'
const FB_SDK_GLOBAL = 'FB'
const FB_SDK_GLOBAL_READY = 'fbAsyncInit'
const FB_MATCH_URL = /facebook\.com\/([^/?].+\/)?video(s|\.php)[/?].*$/
const FB_PLAYER_ID_PREFIX = 'facebook-player-'

@boundClass
@createSinglePlayer
export class AnterosFacebook extends Component {
  get componentName(){
    return "AnterosFacebook";
  }
  static canPlay = url => FB_MATCH_URL.test(url)
  static loopOnEnded = true

  callPlayer = callPlayer
  playerID = FB_PLAYER_ID_PREFIX + randomString()
  load (url, isReady) {
    if (isReady) {
      getSDK(FB_SDK_URL, FB_SDK_GLOBAL, FB_SDK_GLOBAL_READY).then(FB => FB.XFBML.parse())
      return
    }
    getSDK(FB_SDK_URL, FB_SDK_GLOBAL, FB_SDK_GLOBAL_READY).then(FB => {
      FB.init({
        appId: this.props.config.facebook.appId,
        xfbml: true,
        version: this.props.config.facebook.version
      })
      FB.Event.subscribe('xfbml.render', msg => {
        this.props.onLoaded()
      })
      FB.Event.subscribe('xfbml.ready', msg => {
        if (msg.type === 'video' && msg.id === this.playerID) {
          this.player = msg.instance
          this.player.subscribe('startedPlaying', this.props.onPlay)
          this.player.subscribe('paused', this.props.onPause)
          this.player.subscribe('finishedPlaying', this.props.onEnded)
          this.player.subscribe('startedBuffering', this.props.onBuffer)
          this.player.subscribe('finishedBuffering', this.props.onBufferEnd)
          this.player.subscribe('error', this.props.onError)
          if (!this.props.muted) {
            this.callPlayer('unmute')
          }
          this.props.onReady()
          document.getElementById(this.playerID).querySelector('iframe').style.visibility = 'visible'
        }
      })
    })
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    
  }

  seekTo (seconds) {
    this.callPlayer('seek', seconds)
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction)
  }

  mute = () => {
    this.callPlayer('mute')
  }

  unmute = () => {
    this.callPlayer('unmute')
  }

  getDuration () {
    return this.callPlayer('getDuration')
  }

  getCurrentTime () {
    return this.callPlayer('getCurrentPosition')
  }

  getSecondsLoaded () {
    return null
  }

  render () {
    const style = {
      width: '100%',
      height: '100%'
    }
    return (
      <div
        style={style}
        id={this.playerID}
        className='fb-video'
        data-href={this.props.url}
        data-autoplay={this.props.playing ? 'true' : 'false'}
        data-allowfullscreen='true'
        data-controls={this.props.controls ? 'true' : 'false'}
      />
    )
  }
}


const IOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const AUDIO_EXTENSIONS = /\.(m4a|mp4a|mpga|mp2|mp2a|mp3|m2a|m3a|wav|weba|aac|oga|spx)($|\?)/i
const VIDEO_EXTENSIONS = /\.(mp4|og[gv]|webm|mov|m4v)($|\?)/i
const HLS_EXTENSIONS = /\.(m3u8)($|\?)/i
const HLS_SDK_URL = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/VERSION/hls.min.js'
const HLS_GLOBAL = 'Hls'
const DASH_EXTENSIONS = /\.(mpd)($|\?)/i
const DASH_SDK_URL = 'https://cdnjs.cloudflare.com/ajax/libs/dashjs/VERSION/dash.all.min.js'
const DASH_GLOBAL = 'dashjs'
const MATCH_DROPBOX_URL = /www\.dropbox\.com\/.+/

function canPlay (url) {
  if (url instanceof Array) {
    for (const item of url) {
      if (typeof item === 'string' && canPlay(item)) {
        return true
      }
      if (canPlay(item.src)) {
        return true
      }
    }
    return false
  }
  if (isMediaStream(url)) {
    return true
  }
  return (
    AUDIO_EXTENSIONS.test(url) ||
    VIDEO_EXTENSIONS.test(url) ||
    HLS_EXTENSIONS.test(url) ||
    DASH_EXTENSIONS.test(url)
  )
}

function supportsWebKitPresentationMode (video) {
  if (!video) video = document.createElement('video')
  return video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === 'function' && !/iPhone|iPod/.test(navigator.userAgent)
}

function canEnablePIP (url) {
  return canPlay(url) && (!!document.pictureInPictureEnabled || supportsWebKitPresentationMode()) && !AUDIO_EXTENSIONS.test(url)
}

@boundClass
@createSinglePlayer
export class AnterosFilePlayer extends Component {
  static canPlay = canPlay
  static canEnablePIP = canEnablePIP

  get componentName(){
    return "AnterosFilePlayer";
  }

  componentDidMount () {
    this.addListeners(this.player)
    if (IOS) {
      this.player.load()
    }
  }

  componentDidUpdate (prevProps) {
    if (this.shouldUseAudio(this.props) !== this.shouldUseAudio(prevProps)) {
      this.removeListeners(this.prevPlayer)
      this.addListeners(this.player)
    }
  }

  componentWillUnmount () {
    this.removeListeners(this.player)
  }

  addListeners (player) {
    const { playsinline } = this.props
    player.addEventListener('canplay', this.onReady)
    player.addEventListener('play', this.onPlay)
    player.addEventListener('waiting', this.onBuffer)
    player.addEventListener('playing', this.onBufferEnd)
    player.addEventListener('pause', this.onPause)
    player.addEventListener('seeked', this.onSeek)
    player.addEventListener('ended', this.onEnded)
    player.addEventListener('error', this.onError)
    player.addEventListener('enterpictureinpicture', this.onEnablePIP)
    player.addEventListener('leavepictureinpicture', this.onDisablePIP)
    player.addEventListener('webkitpresentationmodechanged', this.onPresentationModeChange)
    if (playsinline) {
      player.setAttribute('playsinline', '')
      player.setAttribute('webkit-playsinline', '')
      player.setAttribute('x5-playsinline', '')
    }
  }

  removeListeners (player) {
    player.removeEventListener('canplay', this.onReady)
    player.removeEventListener('play', this.onPlay)
    player.removeEventListener('waiting', this.onBuffer)
    player.removeEventListener('playing', this.onBufferEnd)
    player.removeEventListener('pause', this.onPause)
    player.removeEventListener('seeked', this.onSeek)
    player.removeEventListener('ended', this.onEnded)
    player.removeEventListener('error', this.onError)
    player.removeEventListener('enterpictureinpicture', this.onEnablePIP)
    player.removeEventListener('leavepictureinpicture', this.onDisablePIP)
    player.removeEventListener('webkitpresentationmodechanged', this.onPresentationModeChange)
  }

  onReady = (...args) => this.props.onReady(...args)
  onPlay = (...args) => this.props.onPlay(...args)
  onBuffer = (...args) => this.props.onBuffer(...args)
  onBufferEnd = (...args) => this.props.onBufferEnd(...args)
  onPause = (...args) => this.props.onPause(...args)
  onEnded = (...args) => this.props.onEnded(...args)
  onError = (...args) => this.props.onError(...args)
  onEnablePIP = (...args) => this.props.onEnablePIP(...args)

  onDisablePIP = e => {
    const { onDisablePIP, playing } = this.props
    onDisablePIP(e)
    if (playing) {
      this.play()
    }
  }

  onPresentationModeChange = e => {
    if (this.player && supportsWebKitPresentationMode(this.player)) {
      const { webkitPresentationMode } = this.player
      if (webkitPresentationMode === 'picture-in-picture') {
        this.onEnablePIP(e)
      } else if (webkitPresentationMode === 'inline') {
        this.onDisablePIP(e)
      }
    }
  }

  onSeek = e => {
    this.props.onSeek(e.target.currentTime)
  }

  shouldUseAudio (props) {
    if (props.config.file.forceVideo) {
      return false
    }
    if (props.config.file.attributes.poster) {
      return false 
    }
    return AUDIO_EXTENSIONS.test(props.url) || props.config.file.forceAudio
  }

  shouldUseHLS (url) {
    return (HLS_EXTENSIONS.test(url) && !IOS) || this.props.config.file.forceHLS
  }

  shouldUseDASH (url) {
    return DASH_EXTENSIONS.test(url) || this.props.config.file.forceDASH
  }

  load (url) {
    const { hlsVersion, dashVersion } = this.props.config.file
    if (this.shouldUseHLS(url)) {
      getSDK(HLS_SDK_URL.replace('VERSION', hlsVersion), HLS_GLOBAL).then(Hls => {
        this.hls = new Hls(this.props.config.file.hlsOptions)
        this.hls.on(Hls.Events.ERROR, (e, data) => {
          this.props.onError(e, data, this.hls, Hls)
        })
        this.hls.loadSource(url)
        this.hls.attachMedia(this.player)
      })
    }
    if (this.shouldUseDASH(url)) {
      getSDK(DASH_SDK_URL.replace('VERSION', dashVersion), DASH_GLOBAL).then(dashjs => {
        this.dash = dashjs.MediaPlayer().create()
        this.dash.initialize(this.player, url, this.props.playing)
        this.dash.on('error', this.props.onError)
        this.dash.getDebug().setLogToBrowserConsole(false)
      })
    }

    if (url instanceof Array) {
      this.player.load()
    } else if (isMediaStream(url)) {
      try {
        this.player.srcObject = url
      } catch (e) {
        this.player.src = window.URL.createObjectURL(url)
      }
    }
  }

  play () {
    const promise = this.player.play()
    if (promise) {
      promise.catch(this.props.onError)
    }
  }

  pause () {
    this.player.pause()
  }

  stop () {
    this.player.removeAttribute('src')
    if (this.hls) {
      this.hls.destroy()
    }
    if (this.dash) {
      this.dash.reset()
    }
  }

  seekTo (seconds) {
    this.player.currentTime = seconds
  }

  setVolume (fraction) {
    this.player.volume = fraction
  }

  mute = () => {
    this.player.muted = true
  }

  unmute = () => {
    this.player.muted = false
  }

  enablePIP () {
    if (this.player.requestPictureInPicture && document.pictureInPictureElement !== this.player) {
      this.player.requestPictureInPicture()
    } else if (supportsWebKitPresentationMode(this.player) && this.player.webkitPresentationMode !== 'picture-in-picture') {
      this.player.webkitSetPresentationMode('picture-in-picture')
    }
  }

  disablePIP () {
    if (document.exitPictureInPicture && document.pictureInPictureElement === this.player) {
      document.exitPictureInPicture()
    } else if (supportsWebKitPresentationMode(this.player) && this.player.webkitPresentationMode !== 'inline') {
      this.player.webkitSetPresentationMode('inline')
    }
  }

  setPlaybackRate (rate) {
    this.player.playbackRate = rate
  }

  getDuration () {
    if (!this.player) return null
    const { duration, seekable } = this.player
    if (duration === Infinity && seekable.length > 0) {
      return seekable.end(seekable.length - 1)
    }
    return duration
  }

  getCurrentTime () {
    if (!this.player) return null
    return this.player.currentTime
  }

  getSecondsLoaded () {
    if (!this.player) return null
    const { buffered } = this.player
    if (buffered.length === 0) {
      return 0
    }
    const end = buffered.end(buffered.length - 1)
    const duration = this.getDuration()
    if (end > duration) {
      return duration
    }
    return end
  }

  getSource (url) {
    const useHLS = this.shouldUseHLS(url)
    const useDASH = this.shouldUseDASH(url)
    if (url instanceof Array || isMediaStream(url) || useHLS || useDASH) {
      return undefined
    }
    if (MATCH_DROPBOX_URL.test(url)) {
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
    }
    return url
  }

  renderSourceElement = (source, index) => {
    if (typeof source === 'string') {
      return <source key={index} src={source} />
    }
    return <source key={index} {...source} />
  }

  renderTrack = (track, index) => {
    return <track key={index} {...track} />
  }

  ref = player => {
    if (this.player) {
      this.prevPlayer = this.player
    }
    this.player = player
  }

  render () {
    const { url, playing, loop, controls, muted, config, width, height } = this.props
    const useAudio = this.shouldUseAudio(this.props)
    const Element = useAudio ? 'audio' : 'video'
    const style = {
      width: width === 'auto' ? width : '100%',
      height: height === 'auto' ? height : '100%'
    }
    return (
      <Element
        ref={this.ref}
        src={this.getSource(url)}
        style={style}
        preload='auto'
        autoPlay={playing || undefined}
        controls={controls}
        muted={muted}
        loop={loop}
        {...config.file.attributes}
      >
        {url instanceof Array &&
          url.map(this.renderSourceElement)}
        {config.file.tracks.map(this.renderTrack)}
      </Element>
    )
  }
}


const MC_SDK_URL = 'https://widget.mixcloud.com/media/js/widgetApi.js'
const MC_SDK_GLOBAL = 'Mixcloud'
const MC_MATCH_URL = /mixcloud\.com\/([^/]+\/[^/]+)/

@boundClass
@createSinglePlayer
export class AnterosMixcloud extends Component {
  static canPlay = url => MC_MATCH_URL.test(url)
  static loopOnEnded = true

  get componentName(){
    return "AnterosMixcloud";
  }

  callPlayer = callPlayer
  duration = null
  currentTime = null
  secondsLoaded = null
  load (url) {
    getSDK(MC_SDK_URL, MC_SDK_GLOBAL).then(Mixcloud => {
      this.player = Mixcloud.PlayerWidget(this.iframe)
      this.player.ready.then(() => {
        this.player.events.play.on(this.props.onPlay)
        this.player.events.pause.on(this.props.onPause)
        this.player.events.ended.on(this.props.onEnded)
        this.player.events.error.on(this.props.error)
        this.player.events.progress.on((seconds, duration) => {
          this.currentTime = seconds
          this.duration = duration
        })
        this.props.onReady()
      })
    }, this.props.onError)
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    
  }

  seekTo (seconds) {
    this.callPlayer('seek', seconds)
  }

  setVolume (fraction) {
    
  }

  mute = () => {
    
  }

  unmute = () => {
    
  }

  getDuration () {
    return this.duration
  }

  getCurrentTime () {
    return this.currentTime
  }

  getSecondsLoaded () {
    return null
  }

  ref = iframe => {
    this.iframe = iframe
  }

  render () {
    const { url, config } = this.props
    const id = url.match(MC_MATCH_URL)[1]
    const style = {
      width: '100%',
      height: '100%'
    }
    const query = queryString({
      ...config.mixcloud.options,
      feed: `/${id}/`
    })
    return (
      <iframe
        key={id}
        ref={this.ref}
        style={style}
        src={`https://www.mixcloud.com/widget/iframe/?${query}`}
        frameBorder='0'
      />
    )
  }
}

const SC_SDK_URL = 'https://w.soundcloud.com/player/api.js'
const SC_SDK_GLOBAL = 'SC'
const SC_MATCH_URL = /(soundcloud\.com|snd\.sc)\/.+$/

@boundClass
@createSinglePlayer
export class AnterosSoundCloud extends Component {
  static canPlay = url => SC_MATCH_URL.test(url)
  static loopOnEnded = true

  get componentName(){
    return "AnterosSoundCloud";
  }

  callPlayer = callPlayer
  duration = null
  currentTime = null
  fractionLoaded = null
  load (url, isReady) {
    getSDK(SC_SDK_URL, SC_SDK_GLOBAL).then(SC => {
      if (!this.iframe) return
      const { PLAY, PLAY_PROGRESS, PAUSE, FINISH, ERROR } = SC.Widget.Events
      if (!isReady) {
        this.player = SC.Widget(this.iframe)
        this.player.bind(PLAY, this.props.onPlay)
        this.player.bind(PAUSE, this.props.onPause)
        this.player.bind(PLAY_PROGRESS, e => {
          this.currentTime = e.currentPosition / 1000
          this.fractionLoaded = e.loadedProgress
        })
        this.player.bind(FINISH, () => this.props.onEnded())
        this.player.bind(ERROR, e => this.props.onError(e))
      }
      this.player.load(url, {
        ...this.props.config.soundcloud.options,
        callback: () => {
          this.player.getDuration(duration => {
            this.duration = duration / 1000
            this.props.onReady()
          })
        }
      })
    })
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    
  }

  seekTo (seconds) {
    this.callPlayer('seekTo', seconds * 1000)
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction * 100)
  }

  mute = () => {
    this.setVolume(0)
  }

  unmute = () => {
    if (this.props.volume !== null) {
      this.setVolume(this.props.volume)
    }
  }

  getDuration () {
    return this.duration
  }

  getCurrentTime () {
    return this.currentTime
  }

  getSecondsLoaded () {
    return this.fractionLoaded * this.duration
  }

  ref = iframe => {
    this.iframe = iframe
  }

  render () {
    const { display } = this.props
    const style = {
      width: '100%',
      height: '100%',
      display
    }
    return (
      <iframe
        ref={this.ref}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(this.props.url)}`}
        style={style}
        frameBorder={0}
        allow='autoplay'
      />
    )
  }
}

const SE_SDK_URL = 'https://cdn.embed.ly/player-0.1.0.min.js'
const SE_SDK_GLOBAL = 'playerjs'
const SE_MATCH_URL = /streamable\.com\/([a-z0-9]+)$/

@boundClass
@createSinglePlayer
export class AnterosStreamable extends Component {
  static canPlay = url => SE_MATCH_URL.test(url)

  get componentName(){
    return "AnterosStreamable";
  }

  callPlayer = callPlayer
  duration = null
  currentTime = null
  secondsLoaded = null
  load (url) {
    getSDK(SE_SDK_URL, SE_SDK_GLOBAL).then(playerjs => {
      if (!this.iframe) return
      this.player = new playerjs.Player(this.iframe)
      this.player.setLoop(this.props.loop)
      this.player.on('ready', this.props.onReady)
      this.player.on('play', this.props.onPlay)
      this.player.on('pause', this.props.onPause)
      this.player.on('seeked', this.props.onSeek)
      this.player.on('ended', this.props.onEnded)
      this.player.on('error', this.props.onError)
      this.player.on('timeupdate', ({ duration, seconds }) => {
        this.duration = duration
        this.currentTime = seconds
      })
      this.player.on('buffered', ({ percent }) => {
        if (this.duration) {
          this.secondsLoaded = this.duration * percent
        }
      })
      if (this.props.muted) {
        this.player.mute()
      }
    }, this.props.onError)
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    
  }

  seekTo (seconds) {
    this.callPlayer('setCurrentTime', seconds)
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction * 100)
  }

  setLoop (loop) {
    this.callPlayer('setLoop', loop)
  }

  mute = () => {
    this.callPlayer('mute')
  }

  unmute = () => {
    this.callPlayer('unmute')
  }

  getDuration () {
    return this.duration
  }

  getCurrentTime () {
    return this.currentTime
  }

  getSecondsLoaded () {
    return this.secondsLoaded
  }

  ref = iframe => {
    this.iframe = iframe
  }

  render () {
    const id = this.props.url.match(SE_MATCH_URL)[1]
    const style = {
      width: '100%',
      height: '100%'
    }
    return (
      <iframe
        ref={this.ref}
        src={`https://streamable.com/o/${id}`}
        frameBorder='0'
        scrolling='no'
        style={style}
        allowFullScreen
      />
    )
  }
}


const TW_SDK_URL = 'https://player.twitch.tv/js/embed/v1.js'
const TW_SDK_GLOBAL = 'Twitch'
const TW_MATCH_VIDEO_URL = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/
const TW_MATCH_CHANNEL_URL = /(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/
const TW_PLAYER_ID_PREFIX = 'twitch-player-'

@boundClass
@createSinglePlayer
export class AnterosTwitch extends Component {
  static canPlay = url => TW_MATCH_VIDEO_URL.test(url) || TW_MATCH_CHANNEL_URL.test(url)
  static loopOnEnded = true

  get componentName(){
    return "AnterosTwitch";
  }

  callPlayer = callPlayer
  playerID = TW_PLAYER_ID_PREFIX + randomString()
  load (url, isReady) {
    const { playsinline, onError, config, controls } = this.props
    const isChannel = TW_MATCH_CHANNEL_URL.test(url)
    const id = isChannel ? url.match(TW_MATCH_CHANNEL_URL)[1] : url.match(TW_MATCH_VIDEO_URL)[1]
    if (isReady) {
      if (isChannel) {
        this.player.setChannel(id)
      } else {
        this.player.setVideo('v' + id)
      }
      return
    }
    getSDK(TW_SDK_URL, TW_SDK_GLOBAL).then(Twitch => {
      this.player = new Twitch.Player(this.playerID, {
        video: isChannel ? '' : id,
        channel: isChannel ? id : '',
        height: '100%',
        width: '100%',
        playsinline: playsinline,
        autoplay: this.props.playing,
        muted: this.props.muted,
        controls: isChannel ? true : controls,
        ...config.twitch.options
      })
      const { READY, PLAYING, PAUSE, ENDED, ONLINE, OFFLINE } = Twitch.Player
      this.player.addEventListener(READY, this.props.onReady)
      this.player.addEventListener(PLAYING, this.props.onPlay)
      this.player.addEventListener(PAUSE, this.props.onPause)
      this.player.addEventListener(ENDED, this.props.onEnded)

      this.player.addEventListener(ONLINE, this.props.onLoaded)
      this.player.addEventListener(OFFLINE, this.props.onLoaded)
    }, onError)
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    this.callPlayer('pause')
  }

  seekTo (seconds) {
    this.callPlayer('seek', seconds)
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction)
  }

  mute = () => {
    this.callPlayer('setMuted', true)
  }

  unmute = () => {
    this.callPlayer('setMuted', false)
  }

  getDuration () {
    return this.callPlayer('getDuration')
  }

  getCurrentTime () {
    return this.callPlayer('getCurrentTime')
  }

  getSecondsLoaded () {
    return null
  }

  render () {
    const style = {
      width: '100%',
      height: '100%'
    }
    return (
      <div style={style} id={this.playerID} />
    )
  }
}

const VM_SDK_URL = 'https://player.vimeo.com/api/player.js'
const VM_SDK_GLOBAL = 'Vimeo'
const VM_MATCH_URL = /vimeo\.com\/.+/
const VM_MATCH_FILE_URL = /vimeo\.com\/external\/[0-9]+\..+/

@boundClass
@createSinglePlayer
export class AnterosVimeo extends Component {
  get componentName(){
    return "AnterosVimeo";
  }
  static forceLoad = true 
  static canPlay = url => {
    if (VM_MATCH_FILE_URL.test(url)) {
      return false
    }
    return VM_MATCH_URL.test(url)
  }

  callPlayer = callPlayer
  duration = null
  currentTime = null
  secondsLoaded = null
  load (url) {
    this.duration = null
    getSDK(VM_SDK_URL, VM_SDK_GLOBAL).then(Vimeo => {
      if (!this.container) return
      this.player = new Vimeo.Player(this.container, {
        url,
        autoplay: this.props.playing,
        muted: this.props.muted,
        loop: this.props.loop,
        playsinline: this.props.playsinline,
        controls: this.props.controls,
        ...this.props.config.vimeo.playerOptions
      })
      this.player.ready().then(() => {
        const iframe = this.container.querySelector('iframe')
        iframe.style.width = '100%'
        iframe.style.height = '100%'
      }).catch(this.props.onError)
      this.player.on('loaded', () => {
        this.props.onReady()
        this.refreshDuration()
      })
      this.player.on('play', () => {
        this.props.onPlay()
        this.refreshDuration()
      })
      this.player.on('pause', this.props.onPause)
      this.player.on('seeked', e => this.props.onSeek(e.seconds))
      this.player.on('ended', this.props.onEnded)
      this.player.on('error', this.props.onError)
      this.player.on('timeupdate', ({ seconds }) => {
        this.currentTime = seconds
      })
      this.player.on('progress', ({ seconds }) => {
        this.secondsLoaded = seconds
      })
    }, this.props.onError)
  }

  refreshDuration () {
    this.player.getDuration().then(duration => {
      this.duration = duration
    })
  }

  play () {
    const promise = this.callPlayer('play')
    if (promise) {
      promise.catch(this.props.onError)
    }
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    this.callPlayer('unload')
  }

  seekTo (seconds) {
    this.callPlayer('setCurrentTime', seconds)
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction)
  }

  setLoop (loop) {
    this.callPlayer('setLoop', loop)
  }

  setPlaybackRate (rate) {
    this.callPlayer('setPlaybackRate', rate)
  }

  mute = () => {
    this.setVolume(0)
  }

  unmute = () => {
    if (this.props.volume !== null) {
      this.setVolume(this.props.volume)
    }
  }

  getDuration () {
    return this.duration
  }

  getCurrentTime () {
    return this.currentTime
  }

  getSecondsLoaded () {
    return this.secondsLoaded
  }

  ref = container => {
    this.container = container
  }

  render () {
    const { display } = this.props
    const style = {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display
    }
    return (
      <div
        key={this.props.url}
        ref={this.ref}
        style={style}
      />
    )
  }
}


const WI_SDK_URL = 'https://fast.wistia.com/assets/external/E-v1.js'
const WI_SDK_GLOBAL = 'Wistia'
const WI_MATCH_URL = /(?:wistia\.com|wi\.st)\/(?:medias|embed)\/(.*)$/

@boundClass
@createSinglePlayer
export class AnterosWistia extends Component {
  get componentName(){
    return "AnterosWistia";
  }

  static canPlay = url => WI_MATCH_URL.test(url)
  static loopOnEnded = true

  callPlayer = callPlayer
  getID (url) {
    return url && url.match(WI_MATCH_URL)[1]
  }

  load (url) {
    const { playing, muted, controls, onReady, onPlay, onPause, onSeek, onEnded, config, onError } = this.props
    getSDK(WI_SDK_URL, WI_SDK_GLOBAL).then(() => {
      window._wq = window._wq || []
      window._wq.push({
        id: this.getID(url),
        options: {
          autoPlay: playing,
          silentAutoPlay: 'allow',
          muted: muted,
          controlsVisibleOnLoad: controls,
          ...config.wistia.options
        },
        onReady: player => {
          this.player = player
          this.unbind()
          this.player.bind('play', onPlay)
          this.player.bind('pause', onPause)
          this.player.bind('seek', onSeek)
          this.player.bind('end', onEnded)
          onReady()
        }
      })
    }, onError)
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  unbind () {
    const { onPlay, onPause, onSeek, onEnded } = this.props
    this.player.unbind('play', onPlay)
    this.player.unbind('pause', onPause)
    this.player.unbind('seek', onSeek)
    this.player.unbind('end', onEnded)
  }

  stop () {
    this.unbind()
    this.callPlayer('remove')
  }

  seekTo (seconds) {
    this.callPlayer('time', seconds)
  }

  setVolume (fraction) {
    this.callPlayer('volume', fraction)
  }

  mute = () => {
    this.callPlayer('mute')
  }

  unmute = () => {
    this.callPlayer('unmute')
  }

  setPlaybackRate (rate) {
    this.callPlayer('playbackRate', rate)
  }

  getDuration () {
    return this.callPlayer('duration')
  }

  getCurrentTime () {
    return this.callPlayer('time')
  }

  getSecondsLoaded () {
    return null
  }

  render () {
    const id = this.getID(this.props.url)
    const className = `wistia_embed wistia_async_${id}`
    const style = {
      width: '100%',
      height: '100%'
    }
    return (
      <div key={id} className={className} style={style} />
    )
  }
}

const YU_SDK_URL = 'https://www.youtube.com/iframe_api'
const YU_SDK_GLOBAL = 'YT'
const YU_SDK_GLOBAL_READY = 'onYouTubeIframeAPIReady'
const YU_MATCH_URL = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=/
const YU_MATCH_PLAYLIST = /list=([a-zA-Z0-9_-]+)/

function parsePlaylist (url) {
  if (YU_MATCH_PLAYLIST.test(url)) {
    const [, playlistId] = url.match(YU_MATCH_PLAYLIST)
    return {
      listType: 'playlist',
      list: playlistId
    }
  }
  return {}
}

@boundClass
@createSinglePlayer
export class AnterosYouTube extends Component {
  get componentName(){
    return "AnterosYouTube";
  }

  static canPlay = url => YU_MATCH_URL.test(url)

  callPlayer = callPlayer
  load (url, isReady) {
    const { playing, muted, playsinline, controls, loop, config, onError } = this.props
    const { playerVars, embedOptions } = config.youtube
    const id = url && url.match(YU_MATCH_URL)[1]
    if (isReady) {
      if (YU_MATCH_PLAYLIST.test(url)) {
        this.player.loadPlaylist(parsePlaylist(url))
        return
      }
      this.player.cueVideoById({
        videoId: id,
        startSeconds: parseStartTime(url) || playerVars.start,
        endSeconds: parseEndTime(url) || playerVars.end
      })
      return
    }
    getSDK(YU_SDK_URL, YU_SDK_GLOBAL, YU_SDK_GLOBAL_READY, YT => YT.loaded).then(YT => {
      if (!this.container) return
      this.player = new YT.Player(this.container, {
        width: '100%',
        height: '100%',
        videoId: id,
        playerVars: {
          autoplay: playing ? 1 : 0,
          mute: muted ? 1 : 0,
          controls: controls ? 1 : 0,
          start: parseStartTime(url),
          end: parseEndTime(url),
          origin: window.location.origin,
          playsinline: playsinline,
          ...parsePlaylist(url),
          ...playerVars
        },
        events: {
          onReady: () => {
            if (loop) {
              this.player.setLoop(true) 
            }
            this.props.onReady()
          },
          onStateChange: this.onStateChange,
          onError: event => onError(event.data)
        },
        ...embedOptions
      })
    }, onError)
  }

  onStateChange = ({ data }) => {
    const { onPlay, onPause, onBuffer, onBufferEnd, onEnded, onReady, loop } = this.props
    const { PLAYING, PAUSED, BUFFERING, ENDED, CUED } = window[YU_SDK_GLOBAL].PlayerState
    if (data === PLAYING) {
      onPlay()
      onBufferEnd()
    }
    if (data === PAUSED) onPause()
    if (data === BUFFERING) onBuffer()
    if (data === ENDED) {
      const isPlaylist = !!this.callPlayer('getPlaylist')
      if (loop && !isPlaylist) {
        this.play() 
      }
      onEnded()
    }
    if (data === CUED) onReady()
  }

  play () {
    this.callPlayer('playVideo')
  }

  pause () {
    this.callPlayer('pauseVideo')
  }

  stop () {
    if (!document.body.contains(this.callPlayer('getIframe'))) return
    this.callPlayer('stopVideo')
  }

  seekTo (amount) {
    this.callPlayer('seekTo', amount)
    if (!this.props.playing) {
      this.pause()
    }
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction * 100)
  }

  mute = () => {
    this.callPlayer('mute')
  }

  unmute = () => {
    this.callPlayer('unMute')
  }

  setPlaybackRate (rate) {
    this.callPlayer('setPlaybackRate', rate)
  }

  setLoop (loop) {
    this.callPlayer('setLoop', loop)
  }

  getDuration () {
    return this.callPlayer('getDuration')
  }

  getCurrentTime () {
    return this.callPlayer('getCurrentTime')
  }

  getSecondsLoaded () {
    return this.callPlayer('getVideoLoadedFraction') * this.getDuration()
  }

  ref = container => {
    this.container = container
  }

  render () {
    const { display } = this.props
    const style = {
      width: '100%',
      height: '100%',
      display
    }
    return (
      <div style={style}>
        <div ref={this.ref} />
      </div>
    )
  }
}

