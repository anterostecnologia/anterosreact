import React, { Component } from "react";
import PropTypes from "prop-types";
import AnterosFullScreen from "./AnterosFullScreen";
import {
  AnterosMenu,
  AnterosNavigatorLink,
  AnterosNavigatorLinkDropdown
} from "anteros-react-menu";

export default class AnterosHeader extends Component {
  constructor(props) {
    super(props);
    this.onSidebarCollapseButtonClick = this.onSidebarCollapseButtonClick.bind(
      this
    );
  }

  onSidebarCollapseButtonClick() {
    event.preventDefault();
    $("#app").toggleClass("sidebar-open");
  }

  static get componentName() {
    return "AnterosHeader";
  }

  render() {
    let newNavigatorLinks = [];
    let menu;
    if (this.props.children) {
      let _this = this;
      let arrChildren = React.Children.toArray(this.props.children);
      arrChildren.forEach(function(child) {
        if (child.type && child.type.componentName ==='AnterosNavigatorLink') {
          newNavigatorLinks.push(child);
        } else if (
          child.type &&
          child.type.componentName === 'AnterosNavigatorLinkDropdown'
        ) {
          newNavigatorLinks.push(child);
        } else if (child.type && child.type.componentName === 'AnterosFullScreen') {
          newNavigatorLinks.push(child);
        } else if (child.type && child.type.componentName === 'AnterosMenu') {
          menu = child;
        }
      });
    }
    return (
      <header className="header">
        <div className="header-sidebar">
          <div className="brand hidden-sm-down">
            <img src={this.props.logo} />
          </div>
        </div>
        <div className="header-block header-block-collapse hidden-lg-up">
          <button
            className="collapse-btn"
            id="sidebar-collapse-btn"
            style={{ color: "#969696" }}
            onClick={this.onSidebarCollapseButtonClick}
          >
            <i className="fa fa-bars" />
          </button>
        </div>
        {menu}
        <div className="header-block header-block-search hidden-sm-down">
          <form role="search">
            <div className="input-container">
              {" "}
              <i className="fa fa-search" />{" "}
              <input type="search" placeholder="Localizar" />
              <div className="underline" />
            </div>
          </form>
        </div>
        <div className="header-block header-block-buttons" />
        <div className="header-block header-block-nav">
          <ul className="nav-profile ">{newNavigatorLinks}</ul>
        </div>
      </header>
    );
  }
}
