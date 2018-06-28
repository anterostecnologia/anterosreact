import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from 'anteros-react-core';

let readyCheck;


const loadGoogleRecaptcha = function (url, success, error) {
  if (window.grecaptcha) {
    success();
  } else {
    loadScript(url, err => {
      const callback = err ? error : success;
      callback(err);
    });
  }
};

const isReady = () => typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined';


export default class AnterosRecaptcha extends Component {

  constructor(props) {
    super(props);
    this._renderGrecaptcha = this._renderGrecaptcha.bind(this);
    this._updateReadyState = this._updateReadyState.bind(this);

    this.reset = this.reset.bind(this);
    this.state = {
      ready: isReady(),
      widget: null,
    };

    if (!this.state.ready) {
      readyCheck = setInterval(this._updateReadyState, 1000);
    }

  }

  _updateReadyState() {
    if (isReady()) {
      this.setState({
        ready: true,
      });
      this._renderGrecaptcha();
      clearInterval(readyCheck);
    }
  }

  componentDidMount() {
    loadGoogleRecaptcha(`https://www.google.com/recaptcha/api.js?hl=${this.props.locale}`, () => {
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { render, onloadCallback } = this.props;

    if (render === 'explicit' && onloadCallback && this.state.ready && !prevState.ready) {
      this._renderGrecaptcha();
    }
  }

  componentWillUnmount() {
    clearInterval(readyCheck);
  }

  reset() {
    const { ready, widget } = this.state;
    if (ready && widget !== null) {
      grecaptcha.reset(widget);
    }
  }


  _renderGrecaptcha() {
    this.state.widget = grecaptcha.render(this.props.elementID, {
      sitekey: this.props.sitekey,
      callback: (this.props.verifyCallback) ? this.props.verifyCallback : undefined,
      theme: this.props.theme,
      type: this.props.type,
      size: this.props.size,
      tabindex: this.props.tabindex,
      hl: this.props.language,
      badge: this.props.badge,
      'expired-callback': (this.props.expiredCallback) ? this.props.expiredCallback : undefined,
    });

    if (this.props.onloadCallback) {
      this.props.onloadCallback();
    }
  }

  render() {
    if (this.props.render === 'explicit' && this.props.onloadCallback) {
      return (
        <div id={this.props.elementID}
          data-onloadcallbackname={this.props.onloadCallbackName}
          data-verifycallbackname={this.props.verifyCallbackName}>
        </div>
      );
    }

    return (
      <div id={this.props.elementID}
        className="g-recaptcha"
        data-sitekey={this.props.sitekey}
        data-theme={this.props.theme}
        data-type={this.props.type}
        data-size={this.props.size}
        data-badge={this.props.badge}
        data-tabindex={this.props.tabindex}
      />
    );
  }
}

AnterosRecaptcha.propTypes = {
  className: PropTypes.string,
  onloadCallbackName: PropTypes.string,
  elementID: PropTypes.string,
  onloadCallback: PropTypes.func,
  verifyCallback: PropTypes.func,
  expiredCallback: PropTypes.func,
  render: PropTypes.string,
  sitekey: PropTypes.string,
  theme: PropTypes.string,
  type: PropTypes.string,
  verifyCallbackName: PropTypes.string,
  expiredCallbackName: PropTypes.string,
  size: PropTypes.string,
  tabindex: PropTypes.string,
  badge: PropTypes.string,
  locale: PropTypes.string
};

AnterosRecaptcha.defaultProps = {
  elementID: 'g-recaptcha',
  onloadCallback: undefined,
  onloadCallbackName: 'onloadCallback',
  verifyCallback: undefined,
  verifyCallbackName: 'verifyCallback',
  expiredCallback: undefined,
  expiredCallbackName: 'expiredCallback',
  render: 'onload',
  theme: 'light',
  type: 'image',
  size: 'normal',
  tabindex: '0',
  badge: 'bottomright',
  locale: 'pt-br'
};