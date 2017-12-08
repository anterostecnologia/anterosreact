import React, { Component } from 'react';


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
    horizontal: React.PropTypes.bool,
    vertical: React.PropTypes.bool,
    left: React.PropTypes.bool,
    rigth: React.PropTypes.bool,
    top: React.PropTypes.bool,
    bottom: React.PropTypes.bool,
    color: React.PropTypes.string
}

AnterosDivider.defaultProps = {
    vertical: true,
    right: true,
    color: '#cfd8dc'
}