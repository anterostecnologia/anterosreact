import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class AnterosScrollButton extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.state = {
        element: null,
        visible: true
    }
  }

  onClick(event) {
    event.stopPropagation();
    event.preventDefault();
    let element = this.scrollRef.parentElement
    if (!(element.scrollHeight - element.scrollTop === element.clientHeight) && element.overflowY !== 'hidden') {
      window.$(this.scrollRef.parentElement).animate(
        {
          scrollTop: element.clientHeight
        },
        200
      );
      this.setState({
          ...this.state,
          visible: false
      })
    }
    if (!this.props.disabled && this.props.onClick) {
      this.props.onClick(event, this);
    }
  }


  static get componentName() {
    return 'AnterosScrollButton';
  }

  render() {
    let className = 'anteros-scrollButton';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }

    let style = this.props.style;

    return (
        <Fragment>
            <div
                id="scrollDown"
                className={className}
                style={{...style, display: this.state.visible ? 'block' : 'none' }}
                ref={ref => (this.scrollRef = ref)}
                >
                <a
                    href="#down"
                    onClick={this.onClick}
                    style={{
                        font:"inherit"
                    }}
                >
                <span
                    className="arrow"
                    style={{
                        borderLeft: "1px solid " + this.props.color,
                        borderBottom: "1px solid " + this.props.color,
                    }}
                />
                <div style={{ ...this.props.captionStyle, padding: ".6vh 2.2vw .6vh 2.2vw" }}>
                    <span className="caption">{this.props.caption}</span>
                </div>
                </a>
            </div>
        </Fragment>
    );
  }
}

AnterosScrollButton.propTypes = {
  disabled: PropTypes.bool,
  borderColor: PropTypes.string,
  color: PropTypes.string,
  caption: PropTypes.string,
  captionStyle: PropTypes.object,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

AnterosScrollButton.defaultProps = {
  disabled: false,
  borderColor: undefined,
  color: undefined,
  caption: undefined
};
