import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class AnterosBadge extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.stopPropagation();
        if (this.props.onClick) {
            this.props.onClick(event, this);
        }
    }

    render() {
        let className = "badge";
    
        if (this.props.className){
            className += " "+this.props.className;
        }

        if (this.props.large) {
            className += " badge-lg";
        } else if (this.props.small) {
            className += " badge-sm";
        } else if (this.props.medium) {
            className += " badge-md";
        }

        if (this.props.primary) {
            className += " badge-primary";
        } else if (this.props.success) {
            className += " badge-success";
        } else if (this.props.info) {
            className += " badge-info";
        } else if (this.props.warning) {
            className += " badge-warning";
        } else if (this.props.danger) {
            className += " badge-danger";
        } else if (this.props.dark) {
            className += " badge-dark";
        }

        if (this.props.topRight){
            className += ' badge-top-right'
        }

        if (this.props.pillFormat) {
            className += " badge-pill";
        } else if (this.props.radiusFormat) {
            className += " badge-radius";
        }

        let style = { ...this.props.style };
        if (this.props.backgroundColor) {
            style = { ...style, backgroundColor: this.props.backgroundColor };
        }
        if (this.props.color) {
            style = { ...style, color: this.props.color };
        }

        if (this.props.light || this.props.color=='light') {
            className += ' badge-light';
            if (this.props.color=='light'){
                style.color = undefined;
            }
        } else if (this.props.dark || this.props.color=='dark') {
            className += ' badge-dark';
            if (this.props.color=='dark'){
                style.color = undefined;
            }
        } else if (this.props.lightYellow || this.props.color=='light-yellow') {
            className += ' badge-light-yellow';
            if (this.props.color=='light-yellow'){
                style.color = undefined;
            }
        } else if (this.props.twitter || this.props.color=='twitter') {
            className += ' badge-twitter';
            if (this.props.color=='twitter'){
                style.color = undefined;
            }
        } else if (this.props.facebook || this.props.color=='facebook') {
            className += ' badge-facebook';
            if (this.props.color=='facebook'){
                style.color = undefined;
            }
        } else if (this.props.google || this.props.color=='google') {
            className += ' badge-google';
            if (this.props.color=='google'){
                style.color = undefined;
            }
        } else if (this.props.pinterest || this.props.color=='pinterest') {
            className += ' badge-pinterest';
            if (this.props.color=='pinterest'){
                style.color = undefined;
            }
        } else if (this.props.instagram || this.props.color=='instagram') {
            className += ' badge-instagram';
            if (this.props.color=='instagram'){
                style.color = undefined;
            }
        } else if (this.props.rss || this.props.color=='rss') {
            className += ' badge-rss';
            if (this.props.color=='rss'){
                style.color = undefined;
            }
        } else if (this.props.tumblr || this.props.color=='tumblr') {
            className += ' badge-tumblr';
            if (this.props.color=='tumblr'){
                style.color = undefined;
            }
        } else if (this.props.linkedin || this.props.color=='linkedin') {
            className += ' badge-linkedin';
            if (this.props.color=='linkedin'){
                style.color = undefined;
            }
        } else if (this.props.dribbble || this.props.color=='dribbble') {
            className += ' badge-dribbble';
            if (this.props.color=='dribbble'){
                style.color = undefined;
            }
        } else if (this.props.youtube || this.props.color=='youtube') {
            className += ' badge-youtube';
            if (this.props.color=='youtube'){
                style.color = undefined;
            }
        } else if (this.props.github || this.props.color=='github') {
            className += ' badge-github';
            if (this.props.color=='github'){
                style.color = undefined;
            }
        } else if (this.props.skype || this.props.color=='skype') {
            className += ' badge-skype';
            if (this.props.color=='skype'){
                style.color = undefined;
            }
        } else if (this.props.orange || this.props.color=='orange') {
            className += ' badge-orange';
            if (this.props.color=='orange'){
                style.color = undefined;
            }
        } else if (this.props.purple || this.props.color=='purple') {
            className += ' badge-purple';
            if (this.props.color=='purple'){
                style.color = undefined;
            }
        }  
        style = {...style, display:'flex', alignItems:'center'};
       
        return (<span style={style} onClick={this.onClick} className={className}>{this.props.caption}</span>);
    }
}

AnterosBadge.propTypes = {
    caption: PropTypes.string.isRequired,
    primary: PropTypes.bool,
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    danger: PropTypes.bool,
    dark: PropTypes.bool,
    light: PropTypes.bool,
    lightYellow: PropTypes.bool,
    twitter: PropTypes.bool,
    facebook: PropTypes.bool,
    google: PropTypes.bool,
    pinterest: PropTypes.bool,
    instagram: PropTypes.bool,
    rss: PropTypes.bool,
    tumblr: PropTypes.bool,
    linkedin: PropTypes.bool,
    dribbble: PropTypes.bool,
    youtube: PropTypes.bool,
    github: PropTypes.bool,
    skype: PropTypes.bool,
    orange: PropTypes.bool,
    purple: PropTypes.bool,
    pillFormat: PropTypes.bool,
    radiusFormat: PropTypes.bool,
    large: PropTypes.bool,
    medium: PropTypes.bool,
    small: PropTypes.bool,
    backgroundColor: PropTypes.string,
    color: PropTypes.string,
    topRight: PropTypes.bool,
}

AnterosBadge.defaultProps = {
    primary: false,
    success: false,
    info: false,
    warning: false,
    danger: false,
    dark: false,
    light: false,
    lightYellow: false,
    twitter: false,
    facebook: false,
    google: false,
    pinterest: false,
    instagram: false,
    rss: false,
    tumblr: false,
    linkedin: false,
    dribbble: false,
    youtube: false,
    github: false,
    skype: false,
    orange: false,
    purple: false,
    pillFormat: false,
    radiusFormat: false,
    large: false,
    meidum: false,
    small: false,
    backgroundColor: undefined,
    color: undefined,
    topRight: false
}





