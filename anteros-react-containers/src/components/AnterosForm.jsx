import React, { Component } from 'react';
import { If, Then, AnterosError} from "anteros-react-core";
import PropTypes from 'prop-types';
import {AnterosUtils} from 'anteros-react-core';
import { buildGridClassNames, columnProps } from "anteros-react-layout";


export default class AnterosForm extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        const {
    className,            
            inline,
            getRef,
            ...attributes
  } = this.props;

        const classes = AnterosUtils.buildClassNames(
            className,
            inline ? 'form-inline' : false
        );

        return (
            <form {...attributes} ref={getRef} className={classes} />
        );
    }
}

AnterosForm.propTypes = {
    children: PropTypes.node,
    inline: PropTypes.bool,
    getRef: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    className: PropTypes.string
};

AnterosForm.defaultProps = {

};



export class AnterosFormGroup extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const {
            row,
            disabled,
            color,
            check,
            ...attributes
  } = this.props;

        const className = AnterosUtils.buildClassNames(
            this.props.className,
            color ? `has-${color}` : false,
            row ? 'row' : false,
            check ? 'form-check' : 'form-group',
            check && disabled ? 'disabled' : false
        );

        return (
            <div {...attributes} className={className} />
        );
    }
}

AnterosFormGroup.propTypes = {
    children: PropTypes.node,
    check: PropTypes.bool,
    disabled: PropTypes.bool,
    tag: PropTypes.string,
    color: PropTypes.string,
    className: PropTypes.string
};

AnterosFormGroup.defaultProps = {
    disabled: false,
    row: true
};


export class AnterosFormSection extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div>
                <legend><span>{this.props.caption}</span></legend>;
                {this.props.children}
            </div>);
    }
}


export class AnterosInputGroup extends Component {
    constructor(props) {
        super(props);
        this.renderAddOn = this.renderAddOn.bind(this);
        this.buildChildren = this.buildChildren.bind(this);
    }

    getChildContext() {
        return { withinInputGroup: true };
    }

    renderAddOn() {
        if (!this.props.icon && !this.props.image) {
            return null;
        }

        let icon;
        if (this.props.icon) {
            icon = (<i className={this.props.icon} style={{ color: this.props.iconColor }}></i>);
        }
        let classNameImage;
        if (this.props.imageCircle) {
            classNameImage = " img-circle";
        }

        let image;
        if (this.props.image) {
            image = <img className={classNameImage} src={this.props.image} height={this.props.imageHeight} width={this.props.imageWidth} />;
        }

        return (<span className="input-group-addon">
            {icon}{image}{this.props.caption}
        </span>);
    }

    buildChildren(){
        let newChildren = [];
        if (this.props.children) {
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if ((child.type && child.type.name === "AnterosEdit") ||
                    (child.type && child.type.name === "AnterosNumber") ||
                    (child.type && child.type.name === "AnterosTextArea")) {
                    newChildren.push(React.cloneElement(child,{className: AnterosUtils.buildClassNames(child.className,"form-control")}));
                } else {
                    newChildren.push(child);
                }
            });
        }
        return newChildren;
    }


    render() {
        let children = this.buildChildren();

        const colClasses = buildGridClassNames(this.props, false, []);
        let className = AnterosUtils.buildClassNames("input-group", colClasses);

        return (<div className={className}>
            <If condition={this.props.alignRight == false}>
                <Then>
                    {this.renderAddOn()}
                </Then>
            </If>
            {children}
            <If condition={this.props.alignRight == true}>
                <Then>
                    {this.renderAddOn()}
                </Then>
            </If>
        </div>);
    }

}


AnterosInputGroup.childContextTypes = {
    withinInputGroup: React.PropTypes.bool
}

AnterosInputGroup.propTypes = {
    caption: React.PropTypes.string,
    alignRight: React.PropTypes.bool,
    icon: React.PropTypes.string,
    iconColor: React.PropTypes.string,
    image: React.PropTypes.string,
    imageWidth: React.PropTypes.string,
    imageHeight: React.PropTypes.string,
    imageCircle: React.PropTypes.bool,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps
}

AnterosInputGroup.defaultProps = {
    alignRight: false
}


export class AnterosInputGroupAddOn extends Component {
    constructor(props) {
        super(props);
        this.hasButton = this.hasButton.bind(this);
    }

    hasButton() {
        let found = false;
        if (this.props.children) {
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if ((child.type && child.type.name === "AnterosButton") || (child.type && child.type.name === "AnterosDropdownButton")) {
                    found = true;
                }
            });
        }
        return found;
    }


    render() {
        let icon;
        if (this.props.icon) {
            icon = (<i className={this.props.icon} style={{ color: this.props.iconColor }}></i>);
        }
        let classNameImage;
        if (this.props.imageCircle) {
            classNameImage = " img-circle";
        }

        let image;
        if (this.props.image) {
            image = <img className={classNameImage} src={this.props.image} height={this.props.imageHeight} width={this.props.imageWidth} />
        }

        let className="input-group-addon";
        if (this.hasButton()==true){
            className = "input-group-btn";
        }


        return (<span className={className}>
            {icon}{image}{this.props.caption}
            {this.props.children}
        </span>);
    }
}



AnterosInputGroupAddOn.propTypes = {
    caption: PropTypes.string,
    alignRight: PropTypes.bool,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    image: PropTypes.string,
    imageWidth: PropTypes.string,
    imageHeight: PropTypes.string,
    imageCircle: PropTypes.bool
}

AnterosInputGroupAddOn.defaultProps = {
    alignRight: false
}


