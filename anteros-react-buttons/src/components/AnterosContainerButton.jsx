import React, { Component } from 'react';
import lodash from 'lodash';
import classNames from "classnames";

export default class AnterosContainerButton extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (<div className="container-button">
            {this.props.children}
        </div>);
    }

}

