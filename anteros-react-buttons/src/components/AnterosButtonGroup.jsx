import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosUtils } from "anteros-react-core";
import AnterosButton from "./AnterosButton";
import lodash from "lodash";


export default class AnterosButtonGroup extends Component {
    constructor(props) {
        super(props);        
    }


    render() {
        let children = [];
        if (this.props.children) {
            let _this = this;
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.name != "AnterosButton") {
                    children.push(child);
                } else {
                    children.push(React.createElement(AnterosButton, {
                        ...child.props, inline: false, key: lodash.uniqueId('btn')
                    },
                        child.props.children
                    ));
                }
            });
        }

        let className = AnterosUtils.buildClassNames("btn-group", (this.props.large ? "btn-group-lg" : ""), (this.props.small ? "btn-group-sm" : ""));
        return (<div className={className}>
            {children}
        </div>);
    }
}