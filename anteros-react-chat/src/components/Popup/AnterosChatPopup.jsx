import React, { Component } from "react";

import AnterosChatButton from "../Button/AnterosChatButton";

const classNames = require("classnames");

class AnterosChatPopup extends Component {
  render() {
    if (this.props.show === true) {
      return (
        <div
          className={classNames(
            "chat-popup-wrapper",
            this.props.type,
            this.props.className
          )}
        >
          <div className="chat-popup">
            {this.props.renderHeader ? (
              <div className="chat-popup-header">
                {this.props.renderHeader()}
              </div>
            ) : (
              <div className="chat-popup-header">
                <span>{this.props.header}</span>
                {this.props.header &&
                  this.props.headerButtons.map((x, i) => (
                    <AnterosChatButton key={i} {...x} />
                  ))}
              </div>
            )}
            <div
              className="chat-popup-content"
              style={{ color: this.props.color }}
            >
              {this.props.renderContent
                ? this.props.renderContent()
                : this.props.text}
            </div>
            <div className="chat-popup-footer">
              {this.props.renderFooter
                ? this.props.renderFooter()
                : this.props.footerButtons.map((x, i) => (
                    <AnterosChatButton key={i} {...x} />
                  ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

AnterosChatPopup.defaultProps = {
  show: false,
  header: null,
  text: null,
  headerButtons: [],
  footerButtons: [],
  renderHeader: null,
  renderContent: null,
  renderFooter: null,
  color: "#333",
};

export default AnterosChatPopup;
