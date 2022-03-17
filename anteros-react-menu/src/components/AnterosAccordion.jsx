import React, { Component } from "react";
import { AnterosError } from "@anterostecnologia/anteros-react-core";
import PropTypes from "prop-types";

export default class AnterosAccordion extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.id) {
      throw new AnterosError("O accordion deve ter um ID único.");
    }

    let children = [];
    let _this = this;
    let arrChildren = React.Children.toArray(this.props.children);
    arrChildren.forEach(function (child) {
      if (
        !(child.type && child.type.componentName === "AnterosAccordionItem")
      ) {
        throw new AnterosError(
          "Apenas componentes do tipo AnterosAccordionItem podem ser usados como filhos de AnterosAccordion."
        );
      }
      if (!child.props.id) {
        throw new AnterosError(
          "Todos os itens do Accordion devem conter um ID."
        );
      }
      children.push(
        React.createElement(
          AnterosAccordionItem,
          {
            key: child.props.id,
            blockStyle: child.props.blockStyle,
            headerStyle: child.props.headerStyle,
            disabled: child.props.disabled,
            id: child.props.id,
            success: child.props.success
              ? child.props.success
              : _this.props.success,
            warning: child.props.warning
              ? child.props.warning
              : _this.props.warning,
            danger: child.props.danger
              ? child.props.danger
              : _this.props.danger,
            info: child.props.info ? child.props.info : _this.props.info,
            outline: child.props.outline
              ? child.props.outline
              : _this.props.outline,
            backgroundColor:
              child.props.backgroundColor == undefined
                ? _this.props.backgroundColor
                : child.props.backgroundColor,
            color:
              child.props.color == undefined
                ? _this.props.color
                : child.props.color,
            icon: child.props.icon,
            iconColor: child.props.iconColor
              ? child.props.iconColor
              : _this.props.color,
            image: child.props.image,
            caption: child.props.caption,
            ownerId: _this.props.id,
            onSelectAccordionItem:
              child.props.onSelectAccordionItem == undefined
                ? _this.props.onSelectAccordionItem
                : child.props.onSelectAccordionItem,
          },
          child.props.children
        )
      );
    });
    return (
      <div
        style={this.props.style}
        id={this.props.id}
        className="accordion"
        role="tablist"
        aria-multiselectable="true"
      >
        {children}
      </div>
    );
  }
}

AnterosAccordion.propTypes = {
  style: PropTypes.object,
};

AnterosAccordion.defaultProps = {
  style: {},
};

export class AnterosAccordionItem extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  static get componentName() {
    return "AnterosAccordionItem";
  }

  onClick(event) {
    if (this.props.disabled===true){
      event.preventDefault();
    } else {
      if (this.props.onSelectAccordionItem) {
        this.props.onSelectAccordionItem(event, this);
      }
    }
  }

  render() {
    let className = "card card-default";
    if (this.props.success) {
      className = "card card-success";
      if (this.props.outline) {
        className = "card card-outline-success";
      }
    } else if (this.props.info) {
      className = "card card-info";
      if (this.props.outline) {
        className = "card card-outline-info";
      }
    } else if (this.props.warning) {
      className = "card card-warning";
      if (this.props.outline) {
        className = "card card-outline-warning";
      }
    } else if (this.props.danger) {
      className = "card card-danger";
      if (this.props.outline) {
        className = "card card-outline-danger";
      }
    } else if (this.props.primary) {
      className = "card card-primary";
      if (this.props.outline) {
        className = "card card-outline-primary";
      }
    }

    let icon;
    if (this.props.icon) {
      icon = (
        <i
          className={this.props.icon}
          style={{ color: this.props.iconColor }}
        ></i>
      );
    }
    let classNameImage;
    if (this.props.imageCircle) {
      classNameImage = "img-circle";
    }

    return (
      <div className={className} style={{opacity:this.props.disabled?0.5:1}} onClick={this.onClick}>
        <div
          className="card-header justify-content-between"
          style={this.props.headerStyle}
          role="tab"
          id={this.props.ownerId + "_heading" + this.props.id}
          data-toggle="collapse"
          data-parent={"#" + this.props.ownerId}
          href={"#" + this.props.ownerId + "_collapse" + this.props.id}
          aria-expanded="false"
          aria-controls={this.props.ownerId + "_collapse" + this.props.id}
        >
          <a className="title">
            {icon}{" "}
            <img
              style={{ marginLeft: "3px", marginRight: "3px" }}
              className={classNameImage}
              src={this.props.image}
              height={this.props.imageHeight}
              width={this.props.imageWidth}
            />{" "}
            {this.props.caption}
          </a>
          <i className="title fa fa-chevron-down" />
        </div>
        <div
          id={this.props.ownerId + "_collapse" + this.props.id}
          className="collapse "
          role="tabpanel"
          aria-labelledby={this.props.ownerId + "_heading" + this.props.id}
        >
          <div className="card-block" style={this.props.blockStyle}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

AnterosAccordionItem.propTypes = {
  disabled: PropTypes.bool,
  id: PropTypes.string,
  success: PropTypes.bool,
  warning: PropTypes.bool,
  danger: PropTypes.bool,
  info: PropTypes.bool,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  image: PropTypes.string,
  caption: PropTypes.string, 
  blockStyle: PropTypes.object,
  headerStyle: PropTypes.object,
  onSelectAccordionItem: PropTypes.func,
};
