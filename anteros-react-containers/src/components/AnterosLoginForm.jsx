import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class AnterosLoginForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading : false
        }
    }

    render(){
         return (<div style={{transform: 'translate3d(0%, 10%, 0)', paddingBottom: '1.875rem'}}>
                    {this.props.children}
                </div>);
    }

}