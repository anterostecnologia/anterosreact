import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosError } from "@anterostecnologia/anteros-react-core";


export default class AnterosMenuItem extends Component {

    constructor(props, context) {
        super(props);
        this.toggleExpanded = this.toggleExpanded.bind(this);
        this.onSelectMenuItem = this.onSelectMenuItem.bind(this);
        if (!(this.props.id)) {
            throw new AnterosError('Informe um ID para o component AnterosMenuItem.');
        }
    }

    toggleExpanded(event) {
        if (!this.props.disabled) {
            let expanded = false;
            if (this.props.isExpanded) {
                expanded = !this.props.isExpanded(this.props.id);
                if (expanded) {
                    this.props.onExpandId(this.props.id)
                } else {
                    this.props.onCollapseId(this.props.id);
                }

                this.props.setActiveId(this.props.id);

                if (this.props.onSelectMenuItem) {
                    this.props.onSelectMenuItem(this);
                }
            }
        }
        event.stopPropagation();
    }

    onSelectMenuItem(event) {
        if (!this.props.disabled) {
            if (this.props.onSelectMenuItem) {
                this.props.onSelectMenuItem(this);
            }
        }
        event.stopPropagation();
    }

    static get componentName() {
        return 'AnterosMenuItem';
    }

    render() {
        let newChildren = [];
        if (this.props.children) {
            let _this = this;
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.componentName === 'AnterosMenuItem') {
                    if (child.props.visible) {
                        newChildren.push(React.createElement(AnterosMenuItem, {
                            key: child.props.id,
                            icon: child.props.icon,
                            iconColor: child.props.iconColor,
                            route: child.props.route,
                            image: child.props.image,
                            imageWidth: child.props.imageWidth,
                            imageHeight: child.props.imageHeight,
                            disabled: child.props.disabled,
                            disabledColor: child.props.disabledColor,
                            id: child.props.id,
                            caption: child.props.caption,
                            onSelectMenuItem: child.props.onSelectMenuItem,
                            getActiveId: _this.props.getActiveId,
                            setActiveId: _this.props.setActiveId,
                            onExpandId: _this.props.onExpandId,
                            onCollapseId: _this.props.onCollapseId,
                            isExpanded: _this.props.isExpanded,
                            level: _this.props.level + 1
                        },
                            child.props.children
                        ));
                    }
                } else {
                    newChildren.push(child);
                }
            });
        }

        let classItem;
        if (this.props.getActiveId && this.props.getActiveId() === this.props.id) {
            classItem = "active";
        }

        let icon;
        if (this.props.icon) {
            icon = (<i style={{ color: this.props.iconColor }} className={this.props.icon}></i>);
        }

        let arrowIcon;
        let children;
        let styleItem = {};
        if (this.props.disabled) {
            styleItem = { color: this.props.disabledColor, pointerEvents: 'none' };
        }

        if (this.context.horizontal) {
            if (newChildren && newChildren.length > 0) {
                return (<li onClick={this.onSelectMenuItem}>
                    <span style={styleItem}>
                        {/* eslint-disable-next-line */}
                        {icon}<img style={{ marginLeft: "2px", marginRight: "2px" }} src={this.props.image} height={this.props.imageHeight} width={this.props.imageWidth} />
                        {this.props.caption}
                    </span>
                    <ul className={"submenu"}>
                        {newChildren}
                    </ul>
                </li>);
            } else {
                return (<li onClick={this.onSelectMenuItem}>
                    <span style={styleItem}>
                        {/* eslint-disable-next-line */}
                        {icon}<img style={{ marginLeft: "2px", marginRight: "2px" }} src={this.props.image} height={this.props.imageHeight} width={this.props.imageWidth} />
                        {this.props.caption}
                    </span>
                </li>);
            }
        } else {
            if (newChildren && newChildren.length > 0) {
                arrowIcon = (<i className="fa arrow" style={{ float: "right", marginRight: "5px" }} />);
                if (this.props.isExpanded && this.props.isExpanded(this.props.id)) {
                    classItem = "open";
                    children = (<ul>{newChildren}</ul>);
                }
            }
            return (
                <li className={classItem} onClick={this.toggleExpanded} id={this.props.id} >
                    <a href={this.props.href} style={{ ...styleItem, paddingLeft: (((this.props.level - 1) * 10) + 10) + "px" }}>
                        {/* eslint-disable-next-line */}
                        {icon}<img style={{ marginLeft: "2px", marginRight: "2px" }} src={this.props.image} height={this.props.imageHeight} width={this.props.imageWidth} /> {this.props.caption} {arrowIcon}
                    </a>
                    {children}
                </li>
            )
        }


    }
}


AnterosMenuItem.propTypes = {
    active: PropTypes.bool,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    disabledColor: PropTypes.string,
    disabled: PropTypes.bool,
    image: PropTypes.string,
    imageWidth: PropTypes.string,
    imageHeight: PropTypes.string,
    caption: PropTypes.string,
    onSelectMenuItem: PropTypes.func,
    href: PropTypes.string,
    visible: PropTypes.bool,
    divider: PropTypes.bool
};

AnterosMenuItem.defaultProps = {
    active: false,
    icon: undefined,
    image: undefined,
    caption: undefined,
    href: undefined,
    visible: true,
    disabled: false,
    divider: false,
    disabledColor: 'silver'
};

AnterosMenuItem.contextTypes = {
    horizontal: PropTypes.bool
};
