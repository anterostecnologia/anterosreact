import React, { Children, createElement, Component } from 'react';
import { AnterosUtils } from "@anterostecnologia/anteros-react-core";
import AnterosButton from "./AnterosButton";
import lodash from "lodash";


export default class AnterosButtonGroup extends Component {
    constructor(props) {
        super(props);        
    }


    render() {
        let children = [];
        if (this.props.children) {
            let arrChildren = Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && (child.type.componentName !== 'AnterosButton')) {
                    children.push(child);
                } else {
                    children.push(createElement(AnterosButton, {
                        ...child.props, inline: false, key: lodash.uniqueId('btn')
                    },
                        child.props.children
                    ));
                }
            });
        }

        let className = AnterosUtils.buildClassNames("btn-group", (this.props.large ? "btn-group-lg" : ""), (this.props.small ? "btn-group-sm" : ""));
        return (<div className={className} style={this.props.style}>
            {children}
        </div>);
    }
}