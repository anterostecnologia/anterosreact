import React, { Component } from 'react';


export default class AnterosIcon extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (<i className={this.props.icon} aria-hidden="true" style={{ paddingRight: "4px", backgroundColor: this.props.backgroundColor, color: this.props.color }}></i>);
    }

}


AnterosIcon.propTypes = {
    backgroundColor: React.PropTypes.string,
    color: React.PropTypes.string,
    icon: React.PropTypes.string
}

