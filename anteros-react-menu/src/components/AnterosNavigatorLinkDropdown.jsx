import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AnterosNavigatorLinkDropdown extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.preventDefault();
        if (!this.props.disabled) {
            if (this.props.handleSelectLink) {
                this.props.handleSelectLink(this.props.caption);
            }
            if (this.props.onSelectLink) {
                this.props.onSelectLink(event);
            }
        }
    }

    render() {
        let className = "nav-link dropdown-toggle";
        if (this.props.active) {
            className += " active"
        }

        if (this.props.disabled) {
            className += " disabled";
        }

        let icon;
        if (this.props.icon) {
            icon = (<i className={this.props.icon}></i>);
        }

        let classNameImage;
        if (this.props.imageCircle){
            classNameImage="img-circle";
        }

        let style = {};
        if (this.props.activeBackColor && this.props.activeColor && this.props.active) {
            style = { backgroundColor: this.props.activeBackColor, color: this.props.activeColor };
        }

        if (this.props.backgroundColor && this.props.color && !this.props.active) {
            style = { backgroundColor: this.props.backgroundColor, color: this.props.color };
        }

        return (<li >
            <a style={style} onClick={this.onClick} className={className} data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false" href={this.props.href}>{icon}
                <img className={classNameImage} src={this.props.image} height={this.props.imageHeight} width={this.props.imageWidth} /> {this.props.caption}
            </a>
            {this.props.children}
        </li>);
    }
}


AnterosNavigatorLinkDropdown.propTypes = {
    active: PropTypes.bool,
    href: PropTypes.string,
    disabled: PropTypes.bool,
    caption: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    onSelectLink: PropTypes.func
};

AnterosNavigatorLinkDropdown.defaultProps = {
    active: false,
    href: undefined,
    disabled: false
};


