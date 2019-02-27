import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosUtils } from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";



class AnterosCard extends Component {
    constructor(props){
        super(props);
        this.cardBlock = undefined;
    }

    getCardBlockWidth(){
        return this.cardBlock.clientWidth;
    }

    getCardBlockHeight(){
        return this.cardBlock.clientHeight;
    }

    render() {

        const colClasses = buildGridClassNames(this.props, false, []);

        let newChildren = [];
        let headerActions;
        let footerActions;
        let childFooterActions = undefined;
        let footerActionsVisible = true;
        let headerActionsVisible = true;
        if (this.props.children) {
            let _this = this;
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.name == "HeaderActions") {
                    headerActions = child.props.children;
                    headerActionsVisible = child.props.visible;
                } else if (child.type && child.type.name == "FooterActions") {
                    footerActionsVisible = child.props.visible;
                    footerActions = child.props.children;
                    childFooterActions = child;
                } else {
                    newChildren.push(child);
                }
            });
        }

        let classNameFooterActions = AnterosUtils.buildClassNames("card-footer",(childFooterActions?childFooterActions.props.className:null));
        let styleFooterActions = (childFooterActions?childFooterActions.props.style:null);
        if (!footerActionsVisible){
            styleFooterActions = {...styleFooterActions,display:"none"};
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
            imageTop = <img style={this.props.imageStyle} src={this.props.image} className={this.props.imageOverlay ? "card-img" : "card-image-top"} />;
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
            <div id={this.props.id} className={className} style={style} onClick={this.props.onCardClick}>
                {this.props.showHeader == true ? (<div className="card-header">
                    <div className="header-block">
                        <div className="caption">
                            <p className="title"> {this.props.caption} </p>
                        </div>

                        <div className="actions">
                            {headerActions}
                        </div>
                    </div>
                </div>) : null}
                {imageTop}
                <div ref={ref => (this.cardBlock = ref)} style={this.props.styleBlock}
                    className={this.props.imageOverlay ? "card-img-overlay" : (this.props.withScroll == false ? "card-block-without-scroll" : "card-block")}>
                    {(this.props.title ? <h4 className="card-title">{this.props.title}</h4> : null)}
                    {(this.props.subTitle ? <h6 className="card-subtitle">{this.props.subTitle}</h6> : null)}
                    {(this.props.text ? <p className="card-text">{this.props.text}</p> : null)}
                    {newChildren}
                </div>
                {imageBottom}
                {(footerActions && this.props.showFooter) ? <div className={classNameFooterActions} style={styleFooterActions}>{footerActions}</div> : false}
            </div>
        )
    }
}


AnterosCard.propTypes = {
    className: PropTypes.string,
    danger: PropTypes.bool,
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    primary: PropTypes.bool,
    secondary: PropTypes.bool,
    image: PropTypes.string,
    imageStyle : PropTypes.style,
    imageTop: PropTypes.bool,
    imageBottom: PropTypes.bool,
    cardInverse: PropTypes.bool,
    title: PropTypes.string,
    subTitle: PropTypes.string,
    caption: PropTypes.string,
    text: PropTypes.string,
    textCenter: PropTypes.bool,
    textRight: PropTypes.bool,
    id: PropTypes.string,
    outline: PropTypes.bool.isRequired,
    withScroll: PropTypes.bool.isRequired,
    showHeader: PropTypes.bool.isRequired,
    showFooter: PropTypes.bool.isRequired,
    minHeight: PropTypes.string,
    minWidth: PropTypes.string,
    style: PropTypes.object,
    styleBlock: PropTypes.object,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    visible: PropTypes.bool,
    onCardClick: PropTypes.func
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

HeaderActions.propTypes = {
    visible: PropTypes.func
 };
 
 HeaderActions.defaultProps = {
     visible: true
 }

export class FooterActions extends Component {
    render() {
        return (<div>{this.props.children}</div>);
    }
}

FooterActions.propTypes = {
   visible: PropTypes.func
};

FooterActions.defaultProps = {
    visible: true
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
