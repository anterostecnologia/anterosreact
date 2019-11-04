import React, {Component} from 'react';
import PropTypes from 'prop-types';


const styleBackground = {
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    left: '0',
    position: 'fixed',
    right: '0',
    height: '100%',
    overflowY: 'hidden',
    overflowX: 'hidden'
}

export default class AnterosFullBackground extends Component {
    constructor(props){
        super(props);
    }

    render(){
        let newStyle = {...styleBackground};
        if (this.props.color){
            newStyle = {...newStyle, backgroundColor: this.props.color};
        }
        if (this.props.image){
            newStyle = {...newStyle, backgroundImage:'url('+this.props.image+')'};
        }
        if (this.props.custom){
            newStyle = {...newStyle, background:this.props.custom};
        }
        if (this.props.style){
            newStyle = {...newStyle, ...this.props.style};
        }
        return (
            <div style={newStyle}>
                {this.props.children}
            </div>
        );
    }
}

AnterosFullBackground.propTypes = {
    color: PropTypes.string,
    image: PropTypes.object,
    custom: PropTypes.string
}