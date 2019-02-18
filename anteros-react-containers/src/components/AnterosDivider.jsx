import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AnterosDivider extends Component {
    constructor(props){
        super(props);
    }

    render() {
        let style = {...this.props.style};
        if (this.props.vertical) {
            style = { ...style, display: "inline-block" };
            if (this.props.right) {
                style = { ...style, borderRight: "2px solid " + this.props.color, paddingRight: "10px", marginRight: "10px" };
            } else if (this.props.left) {
                style = { ...style, borderLeft: "2px  solid " + this.props.color, paddingRight: "10px", marginRight: "10px" };
            }
        } else if (this.props.horizontal) {
            style = { ...style, display: "inline-block" };
            if (this.props.top) {
                style = { ...style, borderTop: "2px solid " + this.props.color, paddingTop: "10px", marginTop: "10px" };
            } else if (this.props.bottom) {
                style = { ...style, borderBottom: "2px solid " + this.props.color, paddingBottom: "10px", marginBottom: "10px" };
            }
        }

        return (
            <div style={style} >{this.props.children}</div>
        );
    }
}


AnterosDivider.propTypes = {
    horizontal: PropTypes.bool,
    vertical: PropTypes.bool,
    left: PropTypes.bool,
    rigth: PropTypes.bool,
    top: PropTypes.bool,
    bottom: PropTypes.bool,
    color: PropTypes.string
}

AnterosDivider.defaultProps = {
    vertical: true,
    right: true,
    color: '#cfd8dc'
}