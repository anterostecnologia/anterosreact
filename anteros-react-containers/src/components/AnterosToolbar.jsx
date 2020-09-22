import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {AnterosRow, AnterosCol} from '@anterostecnologia/anteros-react-layout';

export default class AnterosToolbar extends Component {
    constructor(props){
        super(props);
    }

    render(){
        const {children, height, width, margin} = this.props;
        return (<AnterosRow style={{margin, height, width, display: 'inline-flex'}}>
                    {children}
                </AnterosRow>);
    }

}

AnterosToolbar.propTypes = {
    height: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired
}

AnterosToolbar.defaultProps = {
    height: '70px',
    width: '100%',
    margin:'0'
}


export class AnterosToolbarGroup extends Component {
    constructor(props){
        super(props);
    }

    render(){
        const {children, height, width, justifyContent} = this.props;
        let justify = 'flex-start';
        if (justifyContent=='center') {
            justify = 'center';
        } else if (justifyContent=='end') {
            justify = 'flex-end';
        }

        return (
            <AnterosCol className={this.props.colSize} style={{display: 'inline-flex', justifyContent: justify, alignItems: 'center', height:height, width:width}}>
                {children}
            </AnterosCol>
        );
    }
}

AnterosToolbarGroup.propTypes = {
    justifyContent: PropTypes.oneOf(['start', 'center', 'end']),
    height: PropTypes.string,
    colSize: PropTypes.string
}

AnterosToolbarGroup.defaultProps = {
    justifyContent: 'start',
    height:'100%',
    colSize: 'col'
}

