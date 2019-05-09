import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class AnterosScrollButton extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.state = {
        isUp: this.props.isUp
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      isUp: nextProps.isUp
    })
  }

  onClick(event) {
    event.stopPropagation();
    event.preventDefault();
    let parent = this.scrollRef.parentElement
    if (!isUp && parent.overflowY !== 'hidden') {
      window.$(parent).animate(
        {
          scrollTop: parent.clientHeight
        },
        200
      );
      this.setState({
          ...this.state,
          isUp: true
      })
    } else if (isUp && parent.overflowY !== 'hidden') {
      window.$(parent).animate(
        {
          scrollTop: 0
        },
        200
      );
      this.setState({
          ...this.state,
          isUp: false
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
                style={{...style, display: this.props.visible ? 'block' : 'none' }}
                ref={ref => (this.scrollRef = ref)}
                >
                <a
                    href="#down"
                    className={this.state.isUp ? "up":"down"}
                    onClick={this.onClick}
                    style={{
                        font:"inherit"
                    }}
                >
                <div style={{ ...this.props.captionStyle, color: this.props.color, padding: ".6vh 2.2vw .6vh 2.2vw" }}>
                  {this.state.isUp ? this.props.captionUp : this.props.captionDown}
                  <span>
                    <i
                      className={this.state.isUp ? "arrow-up":"arrow-down"}
                      style={{
                        border: "solid " + this.props.color,
                        borderWidth: "0 0 1.5px 1.5px",
                        display: "inline-block",
                        padding: "4px",
                      }}
                    >
                    </i>
                  </span>
                </div>
                </a>
            </div>
        </Fragment>
    );
  }
}

AnterosScrollButton.propTypes = {
  disabled: PropTypes.bool,
  visible: PropTypes.bool,
  isUp: PropTypes.bool,
  borderColor: PropTypes.string,
  color: PropTypes.string,
  captionUp: PropTypes.string,
  captionDown: PropTypes.string,
  captionStyle: PropTypes.object,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

AnterosScrollButton.defaultProps = {
  disabled: false,
  visible: true,
  isUp: false,
  borderColor: undefined,
  color: undefined,
  captionUp: undefined,
  captionDown: undefined
};
