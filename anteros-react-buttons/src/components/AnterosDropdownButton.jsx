import React, { Component } from "react";
import AnterosButton from "./AnterosButton";
import lodash from "lodash";
import PropTypes from "prop-types";
import { AnterosClickOutside } from "@anterostecnologia/anteros-react-core";

export default class AnterosDropdownButton extends Component {
    constructor(props) {
        super(props);
        this.idButton = lodash.uniqueId("btn");
        this.buildChildren = this.buildChildren.bind(this);
        this.onClickItem = this.onClickItem.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
    }

    componentDidMount() {
        $("#" + this.idButton).removeClass("show");
        $("#" + this.idButton)
            .find(".dropdown-menu")
            .removeClass("show");
    }

    onClickItem(event) {
        $("#" + this.idButton).removeClass("show");
        $("#" + this.idButton)
            .find(".dropdown-menu")
            .removeClass("show");
    }

    buildChildren(children) {
        let result = [];
        let _this = this;
        let arrChildren = React.Children.toArray(children);
        arrChildren.forEach(function (child) {
            if (child.type && child.type.componentName === "AnterosDropdownMenu") {
                result.push(
                    React.cloneElement(child, { onClickItem: _this.onClickItem })
                );
            } else {
                result.push(child);
            }
        });
        return result;
    }
    onClickOutside(event) {
        if (this.idButton) {
            $("#" + this.idButton).removeClass("show");
            $("#" + this.idButton)
                .find(".dropdown-menu")
                .removeClass("show");
            this.dropped = false;
        }
    }

    render() {
        let { children, className, disabled, ...rest } = this.props;
        children = this.buildChildren(children);
        if (this.props.id) {
            this.idButton = this.props.id;
        }

        return (
            <AnterosClickOutside onClickOutside={this.onClickOutside}>
                <div className="btn-group" id={this.idButton}>
                    <AnterosButton className={className + (disabled ? ' disabled' : '')} disabled={disabled} {...rest} dropdown onButtonClick={this.props.onButtonClick} />
                    {children}
                </div>
            </AnterosClickOutside>
        );
    }
}

AnterosDropdownButton.propTypes = {
    oval: PropTypes.bool,
    success: PropTypes.bool,
    large: PropTypes.bool,
    small: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    secondary: PropTypes.bool,
    pillLeft: PropTypes.bool,
    pillRight: PropTypes.bool,
    block: PropTypes.bool,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
    iconSize: PropTypes.string,
    image: PropTypes.string,
    caption: PropTypes.string,
    onClickButton: PropTypes.func,
    hint: PropTypes.string,
    hintPosition: PropTypes.string,
    hintSize: PropTypes.string,
    onButtonClick: PropTypes.func
};

AnterosDropdownButton.defaultProps = {
    oval: false,
    success: false,
    large: false,
    small: false,
    primary: false,
    danger: false,
    secondary: false,
    pillLeft: false,
    pillRight: false,
    block: false,
    backgroundColor: undefined,
    borderColor: undefined,
    color: undefined,
    icon: undefined,
    iconSize: undefined,
    image: undefined,
    caption: undefined
};
