import React, { Component } from 'react';
import { AnterosUtils } from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import classNames from "classnames";


class AnterosPanel extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        const colClasses = buildGridClassNames(this.props, false, []);

        let className = AnterosUtils.buildClassNames("panel panel-default",
            (this.props.textCenter ? "text-center" : ""),
            (this.props.textRight ? "text-right" : ""),
            (this.props.success ? (this.props.outline ? "panel-outline-success" : "panel-success") : ""),
            (this.props.danger ? (this.props.outline ? "panel-outline-danger" : "panel-danger") : ""),
            (this.props.info ? (this.props.outline ? "panel-outline-info" : "panel-info") : ""),
            (this.props.primary ? (this.props.outline ? "panel-outline-primary" : "panel-primary") : ""),
            (this.props.warning ? (this.props.outline ? "panel-outline-warning" : "panel-warning") : ""),
            (this.props.className ? this.props.className : ""),
            (this.props.cardInverse ? "panel-inverse" : ""), colClasses);
        return (
            <div id={this.props.id} className={className} style={{ ...this.props.style, height: this.props.height, width: this.props.width, minHeight: this.props.minHeight, minWidth: this.props.minWidth }}>
                {this.props.children}
            </div>
        )
    }
}


AnterosPanel.propTypes = {
    className: React.PropTypes.string,
    danger: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    id: React.PropTypes.string,
    outline: React.PropTypes.bool.isRequired,
    withScroll: React.PropTypes.bool.isRequired,
    minHeight: React.PropTypes.string,
    minWidth: React.PropTypes.string,
    style: React.PropTypes.object,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps
};

AnterosPanel.defaultProps = {
    outline: false,
    withScroll: true
}

export default AnterosPanel;
