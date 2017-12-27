import React, { Component } from 'react';
import lodash from "lodash";
import { AnterosUtils} from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";


export default class AnterosBoxInfo extends Component {

    constructor(props) {
        super(props);
        this.idBoxInfo = lodash.uniqueId("boxInfo");
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.stopPropagation();
        if (this.props.onBoxClick) {
            this.props.onBoxClick(event, this);
        }
    }

    render() {
        const colClasses = buildGridClassNames(this.props, false, []);

        if (this.props.id) {
            this.idBoxInfo = this.props.idBoxInfo;
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
            (this.props.cardInverse ? "card-inverse" : ""),
            this.props.className);


        return (
            <div className={AnterosUtils.buildClassNames(colClasses)} id={this.props.id}>
                <div className={className} onClick={this.onClick} style={{ ...this.props.style, backgroundColor: this.props.backgroundColor }}>
                    <div className="card-block" style={{ cursor: this.props.cursor, overflow: "hidden", backgroundColor: this.props.backgroundColor }}>
                        <h6 style={{ color: this.props.textColor }} className="text-uppercase">{this.props.title}</h6>
                        <div className="col">
                            <div className="row justify-content-between ">
                                <h1 style={{ color: this.props.textColor }} className="display-4">{this.props.value}</h1>
                                <i className={this.props.icon + " align-self-end box-info"}></i>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

AnterosBoxInfo.propTypes = {
    id: React.PropTypes.string,
    className: React.PropTypes.string,
    danger: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    icon: React.PropTypes.string.isRequired,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    onBoxClick: React.PropTypes.func,
    cursor: React.PropTypes.string,
    textColor: React.PropTypes.string,
}

AnterosBoxInfo.defaultProps = {
    cursor: "default",
    textColor: "white"
}