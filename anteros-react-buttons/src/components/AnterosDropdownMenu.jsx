import React, { Children, cloneElement, Component } from 'react';

export default class AnterosDropdownMenu extends Component {
    constructor(props)
    {
        super(props);
        this.buildChildren = this.buildChildren.bind(this);
    }

    componentDidMount(){
    }

    buildChildren(children) {
        let result = [];
        let _this = this;
        let arrChildren = Children.toArray(children);
        arrChildren.forEach(function (child) {
            if (child.type && (child.type.componentName === 'AnterosDropdownMenuItem')) {
                result.push(cloneElement(child, {onClickItem: _this.props.onClickItem}));
            } else {
                result.push(child);
            }
        });
        return result;
    }

    static get componentName(){
        return 'AnterosDropdownMenu';
    }

    render() {
        let children = this.buildChildren(this.props.children);
        let className = "dropdown-menu";
        if (this.props.className) {
            className += " " + this.props.className;
        }
        return (<div className={className}>
            {children}
        </div>);
    }
}



