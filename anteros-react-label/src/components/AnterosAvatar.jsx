'use strict';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import retina from 'is-retina';
import md5 from 'md5';

export const CACHE_PREFIX = 'anteros-avatar/';
export const CACHE_KEY_FAILING = 'failing';
const IS_RETINA = retina();


export function createRedirectSource(network, property) {
    return class AvatarRedirectSource {

        static propTypes = {
            [property]: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ])
        }

        props = null;

        constructor(props) {
            this.props = props;
        }

        isCompatible = () => {
            return !!this.props.avatarRedirectUrl && !!this.props[property];
        }

        get = (setState) => {
            const { size, avatarRedirectUrl } = this.props;

            const baseUrl = avatarRedirectUrl.replace(/\/*$/, '/');
            const id = this.props[property];

            const query = size ? '' : `size=${size}`;
            const src = `${baseUrl}${network}/${id}?${query}`;

            setState({ source: 'network', src });
        }
    };
}

export const RedirectSource = createRedirectSource;
export const GoogleSource = createRedirectSource('google', 'googleId');
export const InstagramSource = createRedirectSource('instagram', 'instagramId');
export const TwitterSource = createRedirectSource('twitter', 'twitterHandle');

export class ValueSource {

    static propTypes = {
        color: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.string,
        email: PropTypes.string,
        maxInitials: PropTypes.number,
        initials: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func
        ])
    }

    props = null

    constructor(props) {
        this.props = props;
    }

    isCompatible = () => {
        return !!(this.props.name || this.props.value || this.props.email);
    }

    getInitials() {
        const { name, initials } = this.props;

        if (typeof initials === 'string')
            return initials;

        if (typeof initials === 'function')
            return initials(name, this.props);

        return defaultInitials(name, this.props);
    }

    getValue() {
        if (this.props.name)
            return this.getInitials();

        if (this.props.value)
            return this.props.value;

        return null;
    }

    getColor() {
        const { color, colors, name, email, value } = this.props;
        const colorValue = name || email || value;
        return color || getRandomColor(colorValue, colors);
    }

    get = (setState) => {
        const value = this.getValue();

        if (!value)
            return setState(null);

        setState({
            sourceName: 'text',
            value: value,
            color: this.getColor()
        });
    }
}

export class SrcSource {

    static propTypes = {
        src: PropTypes.string
    }

    props = null

    constructor(props) {
        this.props = props;
    }

    isCompatible = () => !!this.props.src;

    get = (setState) => {
        setState({
            sourceName: 'src',
            src: this.props.src
        });
    }
}

export class SkypeSource {

    static propTypes = {
        skypeId: PropTypes.string
    }

    props = null;

    constructor(props) {
        this.props = props;
    }

    isCompatible = () => !!this.props.skypeId

    get = (setState) => {
        const { skypeId } = this.props;
        const url = `https://api.skype.com/users/${skypeId}/profile/avatar`;

        setState({
            sourceName: 'skype',
            src: url
        });
    }
}

export class IconSource {

    props = null
    icon = '✷'

    static propTypes = {
        color: PropTypes.string
    }

    constructor(props) {
        this.props = props;
    }

    isCompatible = () => true

    get = (setState) => {
        const { color, colors } = this.props;
        setState({
            sourceName: 'icon',
            value: this.icon,
            color: color || getRandomColor(this.icon, colors)
        });
    }
}

export class GravatarSource {

    static propTypes = {
        email: PropTypes.string,
        md5Email: PropTypes.string
    }

    props = null;

    constructor(props) {
        this.props = props;
    }

    isCompatible = () => {
        return !!this.props.email || !!this.props.md5Email;
    }

    get = (setState) => {
        const { props } = this;
        const email = props.md5Email || md5(props.email);
        const size = IS_RETINA ? props.size * 2 : props.size;
        const url = `https://secure.gravatar.com/avatar/${email}?s=${size}&d=404`;

        setState({
            sourceName: 'gravatar',
            src: url
        });
    }
}

export class GithubSource {

    static propTypes = {
        githubHandle: PropTypes.string
    }

    props = null;

    constructor(props) {
        this.props = props;
    }

    isCompatible = () => !!this.props.githubHandle

    get = (setState) => {
        const { size, githubHandle } = this.props;
        const url = `https://avatars.githubusercontent.com/${githubHandle}?v=4&s=${size}`;

        setState({
            sourceName: 'github',
            src: url
        });
    }
}

export class FacebookSource {

    static propTypes = {
        facebookId: PropTypes.string
    }

    props = null;

    constructor(props) {
        this.props = props;
    }

    isCompatible = () => !!this.props.facebookId

    get = (setState) => {
        const { size, facebookId } = this.props;
        const url = 'https://graph.facebook.com/' +
            `${facebookId}/picture?width=${size}&height=${size}`;

        setState({
            sourceName: 'facebook',
            src: url
        });
    }
}

export class InternalState {
    constructor() {
        this.sourcePointer = 0;
        this.active = true;
        this.fetch = null;
    }
    isActive(state = {}) {
        if (state.internal !== this)
            return false;

        if (!this.fetch)
            return false;

        if (this.active !== true)
            return false;

        return true;
    }
}

export
    function fetch(url, successCb, errorCb) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                const data = JSON.parse(request.responseText);
                successCb(data);
            } else {
                errorCb(request.status);
            }
        }
    };
    request.open('GET', url, true);
    request.send();
}

export
    function fetchJSONP(url, successCb, errorCb) {
    const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());

    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);

    script.onerror = function () {
        errorCb();
    };

    window[callbackName] = function (data) {
        delete window[callbackName];
        document.body.removeChild(script);
        successCb(data);
    };
}

export
const defaultColors = [
    '#5E005E',
    '#AB2F52',
    '#E55D4A',
    '#E88554',
    '#4194A6',
    '#82CCD9',
    '#FFCC6B',
    '#F2855C',
    '#7D323B'
];

const reSize = /^([-+]?(?:\d+(?:\.\d+)?|\.\d+))([a-z]{2,4}|%)?$/;

function _stringAsciiPRNG(value, m) {
    const charCodes = [...value].map(letter => letter.charCodeAt(0));
    const len = charCodes.length;

    const a = (len % (m - 1)) + 1;
    const c = charCodes.reduce((current, next) => current + next) % m;

    let random = charCodes[0] % m;
    for (let i = 0; i < len; i++)
        random = ((a * random) + c) % m;

    return random;
}

export
    function getRandomColor(value, colors = defaultColors) {
    if (!value)
        return 'transparent';
    const colorIndex = _stringAsciiPRNG(value, colors.length);
    return colors[colorIndex];
}

export
    function parseSize(size) {
    size = '' + size;

    const [,
        value = 0,
        unit = 'px'
    ] = reSize.exec(size) || [];

    return {
        value: parseFloat(value),
        str: value + unit,
        unit
    };
}

export
    function defaultInitials(name, { maxInitials }) {
    return name.split(/\s/)
        .map(part => part.substring(0, 1).toUpperCase())
        .filter(v => !!v)
        .slice(0, maxInitials)
        .join('');
}

const timeoutGroups = {};

export
    function setGroupedTimeout(fn, ttl) {
    if (timeoutGroups[ttl]) {
        timeoutGroups[ttl].push(fn);
        return;
    }

    const callbacks = timeoutGroups[ttl] = [fn];
    setTimeout(() => {
        delete timeoutGroups[ttl];
        callbacks.forEach(cb => cb());
    }, ttl);
}

const defaults = {
    cache: cache,
    colors: defaultColors,
    initials: defaultInitials,
    avatarRedirectUrl: null
};

const contextKeys = Object.keys(defaults);

const ConfigContext = React.createContext && React.createContext();
const ConfigConsumer = ConfigContext ? ConfigContext.Consumer : null;

export const withConfig = (Component) => {
    function withAvatarConfig(props, context = {}) {
        const { reactAvatar } = context;

        if (!ConfigConsumer)
            return (<Component {...defaults} {...reactAvatar} {...props} />);
        /* eslint-disable react/display-name */
        return (
            <ConfigConsumer>
                {config => (<Component {...defaults} {...config} {...props} />)}
            </ConfigConsumer>
        );
        /* eslint-enable react/display-name */
    }

    withAvatarConfig.contextTypes = {
        reactAvatar: PropTypes.object
    };

    return withAvatarConfig;
};

export class ConfigProvider extends React.Component {

    static displayName = 'ConfigProvider';

    static propTypes = {
        cache: PropTypes.object,
        colors: PropTypes.arrayOf(PropTypes.string),
        initials: PropTypes.func,
        avatarRedirectUrl: PropTypes.string,

        children: PropTypes.node
    }

    static childContextTypes = {
        reactAvatar: PropTypes.object
    }

    getChildContext() {
        return {
            reactAvatar: this._getContext()
        };
    }

    _getContext() {
        const context = {};

        contextKeys.forEach(key => {
            if (typeof this.props[key] !== 'undefined')
                context[key] = this.props[key];
        });

        return context;
    }

    render() {
        const { children } = this.props;

        if (!ConfigContext)
            return React.Children.only(children);

        return (
            <ConfigContext.Provider value={this._getContext()}>
                {React.Children.only(children)}
            </ConfigContext.Provider>
        );
    }

}

const _hasLocalStorage = (function isLocalStorageAvailable() {
    try {
        return ('localStorage' in window && window['localStorage']);
    } catch (err) {
        return false;
    }
}());


class Cache {

    constructor(options = {}) {
        const {
            cachePrefix = CACHE_PREFIX,
            sourceTTL = 7 * 24 * 3600 * 1000,
            sourceSize = 20
        } = options;

        this.cachePrefix = cachePrefix;
        this.sourceTTL = sourceTTL;
        this.sourceSize = sourceSize;
    }

    set(key, value) {
        if (!_hasLocalStorage)
            return;
        value = JSON.stringify(value);
        try {
            localStorage.setItem(this.cachePrefix + key, value);
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
        }
    }

    get(key) {
        if (!_hasLocalStorage)
            return null;

        const value = localStorage.getItem(this.cachePrefix + key);

        if (value)
            return JSON.parse(value);

        return null;
    }

    sourceFailed(source) {
        let cacheList = this.get(CACHE_KEY_FAILING) || [];
        cacheList = cacheList.filter(entry => {
            const hasExpired = entry.expires > 0 && entry.expires < Date.now();
            const isMatch = entry === source || entry.url == source;

            return !hasExpired && !isMatch;
        });
        cacheList.unshift({
            url: source,
            expires: Date.now() + this.sourceTTL
        });
        cacheList = cacheList.slice(0, this.sourceSize - 1);
        return this.set(CACHE_KEY_FAILING, cacheList);
    }

    hasSourceFailedBefore(source) {
        const cacheList = this.get(CACHE_KEY_FAILING) || [];

        return cacheList.some(entry => {
            const hasExpired = entry.expires > 0 && entry.expires < Date.now();
            const isMatch = entry === source || entry.url == source;

            return isMatch && !hasExpired;
        });
    }
}

const cache = new Cache();

export { cache };

function matchSource(Source, props, cb) {
    const { cache } = props;
    const instance = new Source(props);

    if (!instance.isCompatible(props))
        return cb();

    instance.get((state) => {
        const failedBefore = state && state.src &&
            cache.hasSourceFailedBefore(state.src);

        if (!failedBefore && state) {
            cb(state);
        } else {
            cb();
        }
    });
}

export function createAvatarComponent({ sources = [] }) {
    const sourcePropTypes = sources.reduce((r, s) => Object.assign(r, s.propTypes), {});

    class Avatar extends React.Component {

        static displayName = 'AnterosAvatar'

        static propTypes = {
            ...sourcePropTypes,

            alt: PropTypes.string,
            title: PropTypes.string,
            className: PropTypes.string,
            fgColor: PropTypes.string,
            color: PropTypes.string,
            colors: PropTypes.arrayOf(PropTypes.string),
            round: PropTypes.oneOfType([
                PropTypes.bool,
                PropTypes.string
            ]),
            style: PropTypes.object,
            size: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ]),
            textSizeRatio: PropTypes.number,
            textMarginRatio: PropTypes.number,
            unstyled: PropTypes.bool,
            cache: PropTypes.object,
            onClick: PropTypes.func,
            cache: PropTypes.any

        }

        static defaultProps = {
            className: '',
            fgColor: '#FFF',
            round: false,
            size: 100,
            textSizeRatio: 3,
            textMarginRatio: .15,
            unstyled: false,
            cache: cache,
        }

        constructor(props) {
            super(props);

            this.state = {
                internal: null,
                src: null,
                value: null,
                color: props.color
            };
        }

        componentDidMount() {
            this.mounted = true;
            this.fetch();
        }

        componentDidUpdate(prevProps) {
            let needsUpdate = false;
            for (const prop in sourcePropTypes)
                needsUpdate = needsUpdate || (prevProps[prop] !== this.props[prop]);

            if (needsUpdate)
                setTimeout(this.fetch, 0);
        }

        componentWillUnmount() {
            this.mounted = false;
            if (this.state.internal) {
                this.state.internal.active = false;
            }
        }

        static getRandomColor = getRandomColor

        static Cache = Cache;
        static ConfigProvider = ConfigProvider

        _createFetcher = (internal) => (errEvent) => {
            const { cache } = this.props;

            if (!internal.isActive(this.state))
                return;
            if (errEvent && errEvent.type === 'error')
                cache.sourceFailed(errEvent.target.src);

            const pointer = internal.sourcePointer;
            if (sources.length === pointer)
                return;

            const source = sources[pointer];

            internal.sourcePointer++;

            matchSource(source, this.props, (nextState) => {
                if (!nextState)
                    return setTimeout(internal.fetch, 0);

                if (!internal.isActive(this.state))
                    return;
                nextState = {
                    src: null,
                    value: null,
                    color: null,

                    ...nextState
                };

                this.setState(state => {
                    return internal.isActive(state) ? nextState : {};
                });
            });
        }

        fetch = () => {
            const internal = new InternalState();
            internal.fetch = this._createFetcher(internal);

            this.setState({ internal }, internal.fetch);
        };

        _scaleTextNode = (node, retryTTL = 16) => {
            const { unstyled, textSizeRatio, textMarginRatio } = this.props;

            if (!node || unstyled || this.state.src || !this.mounted)
                return;

            const spanNode = node.parentNode;
            const tableNode = spanNode.parentNode;

            const {
                width: containerWidth,
                height: containerHeight
            } = spanNode.getBoundingClientRect();

            if (containerWidth == 0 && containerHeight == 0) {
                const ttl = Math.min(retryTTL * 1.5, 500);
                setGroupedTimeout(() => this._scaleTextNode(node, ttl), ttl);
                return;
            }

            if (!tableNode.style.fontSize) {
                const baseFontSize = containerHeight / textSizeRatio;
                tableNode.style.fontSize = `${baseFontSize}px`;
            }
            spanNode.style.fontSize = null;
            const { width: textWidth } = node.getBoundingClientRect();
            if (textWidth < 0)
                return;
            const maxTextWidth = containerWidth * (1 - (2 * textMarginRatio));
            if (textWidth > maxTextWidth)
                spanNode.style.fontSize = `calc(1em * ${maxTextWidth / textWidth})`;
        }

        _renderAsImage() {
            const { className, round, unstyled, alt, title, name, value } = this.props;
            const { internal } = this.state;
            const size = parseSize(this.props.size);

            const imageStyle = unstyled ? null : {
                maxWidth: '100%',
                width: size.str,
                height: size.str,
                borderRadius: (round === true ? '100%' : round)
            };

            return (
                <img className={className + ' sb-avatar__image'}
                    width={size.str}
                    height={size.str}
                    style={imageStyle}
                    src={this.state.src}
                    alt={alt || name || value}
                    title={title || name || value}
                    onError={internal && internal.fetch} />
            );
        }

        _renderAsText() {
            const { className, round, unstyled, title, name, value } = this.props;
            const size = parseSize(this.props.size);

            const initialsStyle = unstyled ? null : {
                width: size.str,
                height: size.str,
                lineHeight: 'initial',
                textAlign: 'center',
                textTransform: 'uppercase',
                color: this.props.fgColor,
                background: this.state.color,
                borderRadius: (round === true ? '100%' : round)
            };

            const tableStyle = unstyled ? null : {
                display: 'table',
                tableLayout: 'fixed',
                width: '100%',
                height: '100%'
            };

            const spanStyle = unstyled ? null : {
                display: 'table-cell',
                verticalAlign: 'middle',
                fontSize: '100%',
                whiteSpace: 'nowrap'
            };

            const key = [
                this.state.value,
                this.props.size
            ].join('');

            return (
                <div className={className + ' sb-avatar__text'}
                    style={initialsStyle}
                    title={title || name || value}>
                    <div style={tableStyle}>
                        <span style={spanStyle}>
                            <span ref={this._scaleTextNode} key={key}>
                                {this.state.value}
                            </span>
                        </span>
                    </div>
                </div>
            );
        }

        render() {
            const { className, unstyled, round, style, onClick } = this.props;
            const { src, sourceName } = this.state;
            const size = parseSize(this.props.size);

            const hostStyle = unstyled ? null : {
                display: 'inline-block',
                verticalAlign: 'middle',
                width: size.str,
                height: size.str,
                borderRadius: (round === true ? '100%' : round),
                fontFamily: 'Helvetica, Arial, sans-serif',
                ...style
            };

            const classNames = [className, 'sb-avatar'];

            if (sourceName) {
                const source = sourceName.toLowerCase()
                    .replace(/[^a-z0-9-]+/g, '-') // only allow alphanumeric
                    .replace(/^-+|-+$/g, ''); // trim `-`
                classNames.push('sb-avatar--' + source);
            }

            return (
                <div className={classNames.join(' ')}
                    onClick={onClick}
                    style={hostStyle}>
                    {src ? this._renderAsImage() : this._renderAsText()}
                </div>
            );
        }
    }

    return Object.assign(withConfig(Avatar), {
        getRandomColor,
        ConfigProvider,
        Cache
    });
}

const facebookSource = FacebookSource;
const googleSource = GoogleSource;
const githubSource = GithubSource;
const twitterSource = TwitterSource;
const instagramSource = InstagramSource;
const skypeSource = SkypeSource;
const gravatarSource = GravatarSource;
const srcSource = SrcSource;
const valueSource = ValueSource;
const iconSource = IconSource;

const SOURCES = [
    facebookSource,
    googleSource,
    githubSource,
    twitterSource,
    instagramSource,
    skypeSource,
    gravatarSource,
    srcSource,
    valueSource,
    iconSource
];


export default createAvatarComponent({
    sources: SOURCES
});
