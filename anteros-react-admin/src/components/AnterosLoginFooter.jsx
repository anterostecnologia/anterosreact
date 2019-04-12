import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class AnterosLoginFooter extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading : false
        }
    }

    render(){
         return (<footer>
                    {this.props.children}
                </footer>);
    }

}