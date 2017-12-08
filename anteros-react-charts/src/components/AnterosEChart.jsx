import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {isEqual} from 'lodash';
import {debounce} from 'lodash';
import Resize from 'element-resize-detector';
export var echarts = require('echarts');


export class AnterosEChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fnResize: null,
            resize: null,
            instance: null
        };
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        this._resize = this._resize.bind(this);
        this._getInstance = this._getInstance.bind(this);
        this._bind = this._bind.bind(this);
    }

    componentDidMount() {
        const that = this;
        that._init();
    }
    componentWillReceiveProps(nextProps) {
        const _this = this;
        if (_this.state.instance && (_this.props.loading !== nextProps.loading)) {
            if (nextProps.loading) {
                _this.state.instance.showLoading('default', _this.props.optsLoading);
            } else {
                _this.state.instance.hideLoading();
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const _this = this;
        return (!_this.state.instance
            || !_isEqual(nextProps.options, _this.props.options)
            || (nextProps.group !== _this.props.group)
        );
    }
    componentDidUpdate(prevProps, prevState) {
        const _this = this;
        if (_this.props.options) {
            _this._update();
            _this._resize();
        }
    }

    componentWillUnmount() {
        const _this = this;
        if (_this.state.resize && _this.state.resize.uninstall) {
            const dom = ReactDOM.findDOMNode(_this);
            _this.state.resize.uninstall(dom);
        }
        if (_this.state.fnResize && _this.state.fnResize.cancel) {
            _this.state.fnResize.cancel();
        }
        _this.state.instance.dispose();
    }

    _init() {
        const _this = this;
        if (!_this.state.instance) {
            const dom = ReactDOM.findDOMNode(_this);
            let instance = echarts.getInstanceByDom(dom);
            if (!instance) {
                instance = echarts.init(dom, _this.props.theme, _this.props.initOpts);
            }
            if (_this.props.loading) {
                instance.showLoading('default', _this.props.optsLoading);
            } else {
                instance.hideLoading();
            }
            instance.group = _this.props.group;
            _this._bind(instance);
            let resize = null;
            let fnResize = _this.state.fnResize || debounce(_this._resize, 250, {
                'leading': true,
                'trailing': true
            });
            if (_this.props.resizable) {
                resize = _this.state.resize || Resize({
                    strategy: 'scroll'
                });
                resize.listenTo(dom, function (element) {
                    fnResize();
                });
            }
            _this.props.onReady(instance);
            _this.setState({
                resize: resize,
                fnResize: fnResize,
                instance: instance
            });
        }
    }

    _update() {
        const _this = this;
        _this.state.instance.setOption(_this.props.options, _this.props.notMerge, _this.props.lazyUpdate);
    }
    _resize() {
        const _this = this;
        _this.state.instance.resize();
    }

    _getInstance() {
        const _this = this;
        return echarts.getInstanceByDom(ReactDOM.findDOMNode(_this));
    }

    _bind(instance) {
        const _this = this;
        const _on = function (name, func) {
            if (typeof func === 'function') {
                func = func.bind(instance);
                instance.off(name, func);
                instance.on(name, func);
            }
        };
        for (let e in _this.props.onEvents) {
            if (Array.hasOwnProperty.call(_this.props.onEvents, e)) {
                _on(e.toLowerCase(), _this.props.onEvents[e]);
            }
        }
    }
    render() {
        const { className, style } = this.props;

        return (
            <div className={className} style={style} />
        );
    }

}



AnterosEChart.propTypes = {
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    theme: React.PropTypes.string,
    group: React.PropTypes.string,
    options: React.PropTypes.object.isRequired,
    initOpts: React.PropTypes.object,
    notMerge: React.PropTypes.bool,
    lazyUpdate: React.PropTypes.bool,
    loading: React.PropTypes.bool,
    optsLoading: React.PropTypes.object,
    onReady: React.PropTypes.func,
    resizable: React.PropTypes.bool,
    onEvents: React.PropTypes.object
};

AnterosEChart.defaultProps = {
    className: 'react-echarts',
    style: {
        width: '400px',
        height: '400px'
    },
    notMerge: false,
    lazyUpdate: false,
    onReady: function (instance) { },
    loading: false,
    resizable: false,
    onEvents: {}
};


