import React, { Component } from 'react';
// import './AnterosImage.css';
import { If, Then, Else, AnterosUtils } from "anteros-react-core";
import PropTypes from 'prop-types';


export default class AnterosImage extends Component {
    constructor(props) {
        super(props);

        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.state = { hover: false };
    }

    componentDidMount() {
    }

    onMouseOver(event) {
        this.setState({ hover: true });
    }

    onMouseOut(event) {
        this.setState({ hover: false });
    }

    render() {
        let scale = 1;
        if (this.state.hover) {
            scale = (this.props.zoomScale ? this.props.zoomScale : 1);
        }

        let className = (this.props.className ? this.props.className : "");
        className = AnterosUtils.buildClassNames(
            (this.props.rounded ? "anterosimg-rounded" : ""),
            (this.props.thumbnail ? "anterosimg-thumbnail" : ""),
            (this.props.circle ? "anterosimg-circle" : ""),
            (this.props.square ? "anterosimg-square" : ""),
            (this.props.bordered ? "anterosimg-bordered" : ""),
            (this.props.bordered && this.props.primary ? "anterosimg-bordered-primary" : ""),
            (this.props.bordered && this.props.info ? "anterosimg-bordered-info" : ""),
            (this.props.bordered && this.props.warning ? "anterosimg-bordered-warning" : ""),
            (this.props.bordered && this.props.danger ? "anterosimg-bordered-danger" : ""),
            (this.props.bordered && this.props.success ? "anterosimg-bordered-success" : ""),
            (this.props.bordered && this.props.orangle ? "anterosimg-bordered-orange" : ""),
            (this.props.bordered && this.props.purple ? "anterosimg-bordered-purple" : ""),
            (this.props.bordered && this.props.green ? "anterosimg-bordered-green" : ""),
            (this.props.bordered &&this.props.red ? "anterosimg-bordered-red" : "")
        );

        if (this.props.effect) {

            let width = (this.props.width ? this.props.width : (this.props.circle ? "200px" : "300px"));
            let height = (this.props.height ? this.props.height : "200px");

            let style = {
                width: width,
                height: height,
                margin: this.props.margin
            };
            if (this.props.marginBottom) {
                style = { ...style, marginBottom: this.props.marginBottom }
            }
            if (this.props.marginTop) {
                style = { ...style, marginBottom: this.props.marginTop }
            }
            if (this.props.marginLeft) {
                style = { ...style, marginBottom: this.props.marginLeft }
            }
            if (this.props.marginRight) {
                style = { ...style, marginBottom: this.props.marginRight }
            }

            let className = AnterosUtils.buildClassNames("ih-item ",
                (this.props.circle ? "anterosimg-circle" : ""),
                (this.props.square ? "anterosimg-square" : ""),
                " effect" + this.props.effect,
                (this.props.colored ? "colored" : ""),
                (this.props.leftToRight ? "left_to_right" : ""),
                (this.props.rightToLeft ? "right_to_left" : ""),
                (this.props.topToBottom ? "top_to_bottom" : ""),
                (this.props.bottomToTop ? "bottom_to_top" : ""),
                (this.props.scaleUp ? "scale_up" : ""),
                (this.props.fromTopAndBottom?"from_top_and_bottom":""),
                (this.props.scaleDown ? "scale_down" : ""),
                (this.props.scaleDownUp ? "scale_down_up" : ""),
                (this.props.fromLeftAndRight ? "from_left_and_right" : ""),
                (this.props.leftAndRight ? "left_and_right" : "")
            );

            return (<div style={style}>
                <div className={className}>
                    <a href="#">
                        {this.props.effect == 1 && this.props.circle ? <div className="spinner"></div> : null}
                        <If condition={this.props.effect == 8}>
                            <Then>
                                <div>
                                    <div className="img-container">
                                        <div className="img"><img ref={ref => this.image = ref} src={this.props.src} alt="img" />
                                        </div>
                                    </div>
                                    <div className="info-container">
                                        <div className="info">
                                            <div className="info-back">
                                                {this.props.children}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Then>
                            <Else>
                                <div>
                                    <div className="img">
                                        <img style={{backgroundColor: "transparent"}} ref={ref => this.image = ref} src={this.props.src} alt="img" />
                                    </div>
                                    <div className="info">
                                        <div className="info-back">
                                            {this.props.children}
                                        </div>
                                    </div>
                                </div>
                            </Else>
                        </If>
                    </a>
                </div>
            </div>);
        } else {
            let style = {
                width: this.props.width,
                height: this.props.height,
                maxWidth: this.props.maxWidth,
                maxHeight: this.props.maxHeight,
                margin: this.props.margin,
                backgroundColor: "transparent",
                WebkitTransition: "0.4s ease",
                transition: "0.4s ease",
                transform: "scale(" + scale + ")",
                WebkitTransform: "scale(" + scale + ")"
            };
            if (this.props.marginBottom) {
                style = { ...style, marginBottom: this.props.marginBottom }
            }
            if (this.props.marginTop) {
                style = { ...style, marginTop: this.props.marginTop }
            }
            if (this.props.marginLeft) {
                style = { ...style, marginLeft: this.props.marginLeft }
            }
            if (this.props.marginRight) {
                style = { ...style, marginRight: this.props.marginRight }
            }
            return (
            <div>
                <img ref={ref => this.image = ref}
                className={AnterosUtils.buildClassNames(className,"img-status-mark")}
                src={this.props.src}
                style={style}
                onMouseOut={this.onMouseOut}
                onMouseOver={this.onMouseOver}/>
                {this.props.children}            
            </div>
            );
        }
    }
}

AnterosImage.propTypes = {
    maxWidth: PropTypes.string,
    maxHeight: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    margin: PropTypes.string,
    scale: PropTypes.number,
    marginBottom: PropTypes.string,
    marginLeft: PropTypes.string,
    marginRight: PropTypes.string,
    marginTop: PropTypes.string,
    src: PropTypes.string.isRequired,
    circle: PropTypes.bool,
    square: PropTypes.bool,
    effect: PropTypes.number,
    colored: PropTypes.bool,
    leftToRight: PropTypes.bool,
    rightToLeft: PropTypes.bool,
    topToBottom: PropTypes.bool,
    bottomToTop: PropTypes.bool,
    scaleUp: PropTypes.bool,
    fromTopAndBottom: PropTypes.bool,
    scaleDown: PropTypes.bool,
    scaleDownUp: PropTypes.bool,
    fromLeftAndRight: PropTypes.bool,
    leftAndRight: PropTypes.bool,
    bordered: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    success: PropTypes.bool
}






