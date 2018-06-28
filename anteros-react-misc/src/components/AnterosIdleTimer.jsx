import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AnterosDateUtils} from "anteros-react-core";

export default class AnterosIdleTimer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            idle: false,
            oldDate: + new Date(),
            lastActive: + new Date(),
            remaining: null,
            pageX: null,
            pageY: null
        };
        this._toggleIdleState = this
            ._toggleIdleState
            .bind(this);
        this._handleEvent = this
            ._handleEvent
            .bind(this);
        this.reset = this
            .reset
            .bind(this);
        this.pause = this
            .pause
            .bind(this);
        this.resume = this
            .resume
            .bind(this);
        this.getRemainingTime = this
            .getRemainingTime
            .bind(this);
        this.getElapsedTime = this
            .getElapsedTime
            .bind(this);
        this.getLastActiveTime = this
            .getLastActiveTime
            .bind(this);
        this.isIdle = this
            .isIdle
            .bind(this);

        this.tId = null;

        console.log(+ new Date());
        console.log(new Date())
    }

    componentWillMount() {
        this
            .props
            .events
            .forEach(e => this.props.element.addEventListener(e, this._handleEvent))
    }

    componentDidMount() {
        if (this.props.startOnLoad) {
            this.reset();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.tId);
        this
            .props
            .events
            .forEach(e => this.props.element.removeEventListener(e, this._handleEvent));
    }

    render() {
        return this.props.children
            ? this.props.children
            : null;
    }

    _toggleIdleState() {
        this.setState({
            idle: !this.state.idle
        });
        if (!this.state.idle) 
            this.props.activeAction();
        else 
            this
                .props
                .idleAction();
        }
    
    _handleEvent(e) {
        if (this.state.remaining) 
            return

        if (e.type === 'mousemove') {
            if (e.pageX === this.state.pageX && e.pageY === this.state.pageY) 
                return
            if (typeof e.pageX === 'undefined' && typeof e.pageY === 'undefined') 
                return
            let elapsed = this.getElapsedTime();
            if (elapsed < 200) 
                return
        }
        clearTimeout(this.tId)
        if (this.state.idle) {
            this._toggleIdleState(e)
        }

        this.setState({
            lastActive: + new Date(),
            pageX: e.pageX,
            pageY: e.pageY
        });

        this.tId = setTimeout(this._toggleIdleState.bind(this), this.props.timeout) // set a new timeout

    }

    reset() {
        clearTimeout(this.tId);
        this.setState({
            idle: false,
            oldDate: + new Date(),
            lastActive: this.state.oldDate,
            remaining: null
        });
        this.tId = setTimeout(this._toggleIdleState.bind(this), this.props.timeout)
    }

    pause() {
        if (this.state.remaining !== null) {
            return
        }
        console.log('pausing');
        clearTimeout(this.tId)
        this.setState({
            remaining: this.getRemainingTime()
        })
    }

    resume() {
        if (this.state.remaining === null) {
            return;
        }

        if (!this.state.idle) {
            this.setState({remaining: null});
            this.tId = setTimeout(this._toggleIdleState.bind(this), this.state.remaining)
        }
    }

    getRemainingTime() {
        if (this.state.idle) {
            return 0
        }
        if (this.state.remaining !== null) {
            return this.state.remaining
        }
        let remaining = this.props.timeout - ((+ new Date()) - this.state.lastActive)
        if (remaining < 0) {
            remaining = 0
        }
        return remaining
    }

    getElapsedTime() {
        return (+ new Date()) - this.state.oldDate
    }

    getLastActiveTime() {
        if (this.props.format && this.state.lastActive) {
            return AnterosDateUtils.formatDate(new Date(this.state.lastActive), this.props.format)
        }
        return this.state.lastActive
    }

    isIdle() {
        return this.state.idle
    }

}

AnterosIdleTimer.propTypes = {
    timeout: PropTypes.number,
    events: PropTypes.arrayOf(PropTypes.string),
    idleAction: PropTypes.func,
    activeAction: PropTypes.func,
    element: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    format: PropTypes.string,
    startOnLoad: PropTypes.bool
};

AnterosIdleTimer.defaultProps = {
    timeout: 1000 * 60 * 20,
    events: [
        'mousemove',
        'keydown',
        'wheel',
        'DOMMouseScroll',
        'mouseWheel',
        'mousedown',
        'touchstart',
        'touchmove',
        'MSPointerDown',
        'MSPointerMove'
    ],
    idleAction: () => {},
    activeAction: () => {},
    element: (typeof window === 'undefined'
        ? 'undefined'
        : typeof(window)) === 'object'
        ? document
        : {},
    startOnLoad: true
};