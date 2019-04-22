import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {AnterosUtils} from 'anteros-react-core';

export default class AnterosContainer extends Component {
    constructor(props){
        super(props);
    }

    render(){
        const {width, height, className, style} = this.props;
        let classes = AnterosUtils.buildClassNames('container',className);
        let newStyle = {};
        if (style){
            newStyle = {...style}; 
        }
        return (
            <div style={{...newStyle, width: width, height:height}} className={classes}>
                {this.props.children}
            </div>
        )
    }
}

AnterosContainer.propTypes = {
    width : PropTypes.string,
    height : PropTypes.string,
    className : PropTypes.string,
    style : PropTypes.object
}