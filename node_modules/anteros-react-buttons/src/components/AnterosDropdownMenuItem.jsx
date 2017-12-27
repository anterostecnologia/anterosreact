import React, { Component } from 'react';
import lodash from "lodash";


export default class AnterosDropdownMenuItem extends Component {
    constructor(props, context) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.idItem1 = lodash.uniqueId('mnitem');
        this.idItem2 = lodash.uniqueId('mnitem');
        this.idItem3 = lodash.uniqueId('mnitem');
        this.idItem4 = lodash.uniqueId('mnitem');
    }

    componentDidMount() {
        let _this = this;
        $(document).on('click', function event(e) {
            if ((e.target.id == _this.idItem1) ||
                (e.target.id == _this.idItem2) ||
                (e.target.id == _this.idItem3) ||
                (e.target.id == _this.idItem4)) {
                _this.onClick(e);
            }
        });

    }

    onClick(event) {
        event.preventDefault();
        if (!this.props.disabled && this.props.onSelectMenuItem) {
            this.props.onSelectMenuItem(this, event);
        }
        if (this.props.onClickItem) {
            this.props.onClickItem(event);
        }
    }

    render() {
        let icon;
        if (this.props.icon) {
            icon = (<i className={"icon " + this.props.icon} id={this.idItem3}></i>);
        }

        let _className = "dropdown-item";
        if (this.props.disabled) {
            _className += " disabled";
        }

        return (<div id={this.idItem1}><a href={this.props.href}
            className={_className} id={this.idItem2}>
            {icon}<img src={this.props.image} id={this.idItem4}/> {this.props.caption}
        </a></div>);
    }
}


AnterosDropdownMenuItem.propTypes = {
    disabled: React.PropTypes.bool,
    icon: React.PropTypes.string,
    image: React.PropTypes.string,
    caption: React.PropTypes.string,
    onSelectMenuItem: React.PropTypes.func,
    href: React.PropTypes.string
};

AnterosDropdownMenuItem.defaultProps = {
    disabled: false,
    icon: undefined,
    image: undefined,
    caption: undefined,
    href: undefined
}