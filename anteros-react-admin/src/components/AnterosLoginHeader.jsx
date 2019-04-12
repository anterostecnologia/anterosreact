import React, {Component} from 'react';
import PropTypes from 'prop-types';


export default class AnterosLoginHeader extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading : false
        }
    }

    render(){
         return (<header>
                    {this.props.children}
                </header>);
    }

}