import React, { Component } from 'react';
import classNames from "classnames";
import { buildGridClassNames, columnProps } from "anteros-react-layout";

export default class AnterosLabel extends Component {

    constructor(props) {
        super(props);
    }
    render() {
        const colClasses = buildGridClassNames(this.props, false, []);
        let className;
        if (colClasses.length > 0)
            className = classNames("control-label", colClasses);
            
        return (<label style={{ textAlign: this.props.textAlign }} className={className}>{this.props.caption}</label>);
    }
}

AnterosLabel.propTypes = {
    caption: React.PropTypes.string.isRequired,
    textAlign: React.PropTypes.oneOf(['left', 'right']),
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps
}

AnterosLabel.defaultProps = {
}



