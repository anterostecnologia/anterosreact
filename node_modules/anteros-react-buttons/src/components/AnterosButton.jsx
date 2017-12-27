import React, { Component } from 'react';
import lodash from "lodash";


export default class AnterosButton extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.idButton = lodash.uniqueId("btn");
    }

    componentDidMount() {
        $(this.button).tooltip();
    }

    onClick(event) {
        event.stopPropagation();
        if (!this.props.disabled && this.props.onButtonClick) {
            this.props.onButtonClick(event, this);
        }

        if (!this.props.disabled && this.props.onClick) {
            this.props.onClick(event, this);
        }
    }

    render() {
        let className = "btn";
        if (this.props.oval) {
            className += " btn-oval";
        }

        if (this.props.circle) {
            className += " btn-circle";
        }

        if (this.props.success) {
            className += " btn-success";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.large) {
            className += " btn-lg";
        }

        if (this.props.small) {
            className += " btn-sm";
        }

        if (this.props.primary) {
            className += " btn-primary";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.danger) {
            className += " btn-danger";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.info) {
            className += " btn-info";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.link) {
            className += " btn-link";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.warning) {
            className += " btn-warning";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.secondary) {
            className += " btn-secondary";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.default) {
            className += " btn-default";
        }

        if (this.props.inline) {
            className += " btn-inline";
        }

        if (this.props.pillLeft) {
            className += " btn-pill-left";
        }

        if (this.props.pillRight) {
            className += " btn-pill-right";
        }

        if (this.props.block) {
            className += " btn-block";
        }

        if (this.props.disabled) {
            className += " disabled";
        }

        let customIcon = this.props.icon;

        if (this.props.facebook) {
            className += " btn-facebook";
            customIcon = "fa fa-facebook";
        }

        if (this.props.twitter) {
            className += " btn-twitter";
            customIcon = "fa fa-twitter";
        }

        if (this.props.googlePlus) {
            className += " btn-googleplus";
            customIcon = "fa fa-google-plus";
        }

        if (this.props.linkedin) {
            className += " btn-linkedin";
            customIcon = "fa fa-linkedin";
        }

        if (this.props.instagram) {
            className += " btn-instagram";
            customIcon = "fa fa-instagram";
        }

        if (this.props.pinterest) {
            className += " btn-pinterest";
            customIcon = "fa fa-pinterest";
        }

        if (this.props.dribbble) {
            className += " btn-dribbble";
            customIcon = "fa fa-dribbble";
        }

        if (this.props.youtube) {
            className += " btn-youtube";
            customIcon = "fa fa-youtube";
        }

        if (this.props.pullRight){
            className += " pull-right";
        }

        let style = this.props.style;

        if (this.props.backgroundColor) {
            style = { ...style, backgroundColor: this.props.backgroundColor };
        }

        if (this.props.borderColor) {
            style = { ...style, borderColor: this.props.borderColor };
        }

        if (this.props.color) {
            style = { ...style, color: this.props.color };
        }

        if (!this.props.visible){
            style = {...style, display: "none"};
        }

        let dataToggle, ariaHaspopup, ariaExpanded, ariaControls, href;
        if (this.props.dropdown) {
            dataToggle = "dropdown";
            ariaHaspopup = "true";
            ariaExpanded = "true";
            className += " dropdown-toggle";
        }

        if (this.props.collapseContent) {
            dataToggle = "collapse";
            ariaExpanded = "true";
            ariaControls = this.props.collapseContent;
            href = "#" + this.props.collapseContent;
            className += " collapsed";
        }

        let icon;
        if (customIcon) {
            icon = (<i data-user={this.props.dataUser} onClick={this.onClick} className={customIcon} style={{ color: this.props.iconColor }}></i>);
        }

        return (
            <button id={this.props.id ? this.props.id : this.idButton} title={this.props.hint} data-placement={this.props.hintPosition} data-user={this.props.dataUser} data-toggle={dataToggle} aria-haspopup={ariaHaspopup} aria-expanded={ariaExpanded} aria-controls={ariaControls} href={href}
                onClick={this.onClick} style={style}
                ref={ref => this.button = ref}
                type="button" className={className}>
                {icon}<img data-user={this.props.dataUser} onClick={this.onClick} src={this.props.image} /> {this.props.caption}{this.props.children}
            </button>
        )
    }
}

AnterosButton.propTypes = {
    disabled: React.PropTypes.bool,
    oval: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    link: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    large: React.PropTypes.bool,
    small: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    default: React.PropTypes.bool,
    pillLeft: React.PropTypes.bool,
    pillRight: React.PropTypes.bool,
    pullRight: React.PropTypes.bool,
    block: React.PropTypes.bool,
    backgroundColor: React.PropTypes.string,
    borderColor: React.PropTypes.string,
    color: React.PropTypes.string,
    dropdown: React.PropTypes.bool,
    icon: React.PropTypes.string,
    iconColor: React.PropTypes.string,
    image: React.PropTypes.string,
    caption: React.PropTypes.string,
    onButtonClick: React.PropTypes.func,
    hint: React.PropTypes.string,
    hintPosition: React.PropTypes.oneOf(['top', 'right', 'left', 'bottom']),
    facebook: React.PropTypes.bool,
    twitter: React.PropTypes.bool,
    googlePlus: React.PropTypes.bool,
    linkedin: React.PropTypes.bool,
    instagram: React.PropTypes.bool,
    pinterest: React.PropTypes.bool,
    dribbble: React.PropTypes.bool,
    youtube: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    dataUser: React.PropTypes.string,
    route: React.PropTypes.string,
    visible : React.PropTypes.bool.isRequired,
    collapseContent : React.PropTypes.string
};

AnterosButton.defaultProps = {
    disabled: false,
    oval: false,
    success: false,
    warning: false,
    info: false,
    large: false,
    small: false,
    primary: false,
    danger: false,
    secondary: false,
    pillLeft: false,
    pillRight: false,
    pullRight: false,
    block: false,
    backgroundColor: undefined,
    borderColor: undefined,
    color: undefined,
    dropdown: false,
    icon: undefined,
    image: undefined,
    caption: undefined,
    hintPosition: 'top',
    inline: true,
    visible: true
};


