import React, { Component } from 'react';
import {AnterosButton} from "anteros-react-buttons";
import { AnterosUtils } from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";



class AnterosCard extends Component {
    render() {

        const colClasses = buildGridClassNames(this.props, false, []);

        let newChildren = [];
        let headerActions;
        let footerActions;
        if (this.props.children) {
            let _this = this;
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.name == "HeaderActions") {
                    headerActions = child.props.children;
                } else if (child.type && child.type.name == "FooterActions") {
                    footerActions = child.props.children;
                } else {
                    newChildren.push(child);
                }
            });
        }

        let className = AnterosUtils.buildClassNames("card card-default",
            (this.props.textCenter ? "text-center" : ""),
            (this.props.textRight ? "text-right" : ""),
            (this.props.success ? (this.props.outline ? "card-outline-success" : "card-success") : ""),
            (this.props.danger ? (this.props.outline ? "card-outline-danger" : "card-danger") : ""),
            (this.props.info ? (this.props.outline ? "card-outline-info" : "card-info") : ""),
            (this.props.primary ? (this.props.outline ? "card-outline-primary" : "card-primary") : ""),
            (this.props.warning ? (this.props.outline ? "card-outline-warning" : "card-warning") : ""),
            (this.props.className ? this.props.className : ""),
            (this.props.cardInverse ? "card-inverse" : ""), colClasses);

        let imageTop, imageBottom;
        if (this.props.image && (this.props.imageTop || this.props.imageOverlay)) {
            imageTop = <img src={this.props.image} className={this.props.imageOverlay ? "card-img" : "card-image-top"} />;
        } else if (this.props.image && this.props.imageBottom) {
            imageBottom = <img src={this.props.image} className="card-image-bottom" />;
        } else if (this.props.image) {
            imageTop = <img src={this.props.image} className="card-image-top" />;
        }
        let style = { ...this.props.style, height: this.props.height, width: this.props.width, minHeight: this.props.minHeight, minWidth: this.props.minWidth };
        if (!this.props.visible) {
            style = { ...style, display: "none" };
        }

        return (
            <div id={this.props.id} className={className} style={style} >
                {this.props.showHeader == true ? (<div className="card-header">
                    <div className="header-block">
                        <div className="caption">
                            <p className="title"> {this.props.caption} </p>
                        </div>

                        <div className="actions" style={style}>
                            {headerActions}
                        </div>
                    </div>
                </div>) : null}
                {imageTop}
                <div className={this.props.imageOverlay ? "card-img-overlay" : (this.props.withScroll == false ? "card-block-without-scroll" : "card-block")}>
                    {(this.props.title ? <h4 className="card-title">{this.props.title}</h4> : null)}
                    {(this.props.subTitle ? <h6 className="card-subtitle">{this.props.subTitle}</h6> : null)}
                    {(this.props.text ? <p className="card-text">{this.props.text}</p> : null)}
                    {newChildren}
                </div>
                {imageBottom}
                {(footerActions && this.props.showFooter) ? <div className="card-footer">{footerActions}</div> : false}
            </div>
        )
    }
}


AnterosCard.propTypes = {
    className: React.PropTypes.string,
    danger: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    image: React.PropTypes.string,
    imageTop: React.PropTypes.bool,
    imageBottom: React.PropTypes.bool,
    cardInverse: React.PropTypes.bool,
    title: React.PropTypes.string,
    subTitle: React.PropTypes.string,
    caption: React.PropTypes.string,
    text: React.PropTypes.string,
    textCenter: React.PropTypes.bool,
    textRight: React.PropTypes.bool,
    id: React.PropTypes.string,
    outline: React.PropTypes.bool.isRequired,
    withScroll: React.PropTypes.bool.isRequired,
    showHeader: React.PropTypes.bool.isRequired,
    showFooter: React.PropTypes.bool.isRequired,
    minHeight: React.PropTypes.string,
    minWidth: React.PropTypes.string,
    style: React.PropTypes.object,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    visible: React.PropTypes.bool

};

AnterosCard.defaultProps = {
    showHeader: true,
    showFooter: true,
    outline: false,
    cardInverse: false,
    withScroll: true,
    visible: true
}

export class HeaderActions extends Component {
    render() {
        return (<div>{this.props.children}</div>);
    }
}

export class FooterActions extends Component {
    render() {
        return (<div>{this.props.children}</div>);
    }
}

export class AnterosCardGroup extends Component {
    render() {
        return (<div className="card-group">{this.props.children}</div>);
    }
}

export class AnterosCardDeck extends Component {
    render() {
        return (<div className="card-deck">{this.props.children}</div>);
    }
}


export default AnterosCard;
