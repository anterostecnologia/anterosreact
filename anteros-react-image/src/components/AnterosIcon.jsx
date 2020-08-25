import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class AnterosIcon extends Component {
    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this);
    }

    onClick(event){
        if (this.props.onClick){
            this.props.onClick(event,this);
        }
    }

    render() {
        return (<i onDoubleClick={this.props.onDoubleClick}
            className={this.props.icon?this.props.icon:this.props.name}    
            onClick={this.onClick}         
            aria-hidden="true" style={{ paddingRight: "4px", 
            backgroundColor: this.props.backgroundColor,             
            color: this.props.color, fontSize:this.props.size,...this.props.style }}></i>);
    }

}


AnterosIcon.propTypes = {
    backgroundColor: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
    name: PropTypes.string,
    size: PropTypes.string,
    onClick: PropTypes.func
}


