import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class AnterosFullScreen extends Component {

    constructor(props) {
        super(props);
        this.handleToggle = this.handleToggle.bind(this);
    }

    handleToggle() {
        var body = document.body;
        if ((body.className + " ").indexOf("full-screen") == -1) {
            var b = document.getElementsByTagName('body')[0];
            b.className += 'full-screen';
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            var b = document.getElementsByTagName('body')[0];
            b.className = b.className.replace(/\bfull-screen\b/, '');
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }

    }

    render() {
        return (
            <li>
                <a data-toggle="dropdown" onClick={this.handleToggle} className={this.props.className}> <i className="fa fa-arrows-alt"></i> <sup></sup></a>
            </li>
        )
    }
}

