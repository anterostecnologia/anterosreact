import React, { Component } from 'react';
import lodash from 'lodash';
import classNames from "classnames";

export default class AnterosRadioButton extends Component {
    constructor(props) {
        super(props);
        this.toggleRadioButtonChange = this.toggleRadioButtonChange.bind(this);
        this.idRadio = lodash.uniqueId('radio');
        let arrChildren = React.Children.toArray(this.props.children);
        let _this = this;
        arrChildren.forEach(function (child, index) {
            if (child.props.checked)
                _this.state = { activeIndex: index};
        });
    }

    toggleRadioButtonChange(activeIndex) {
        this.setState({ activeIndex });
        if (this.props.onChange) {
            this.props.onChange(activeIndex);
        }
        if (this.props.onRadioChange){
            this.props.onRadioChange(activeIndex);
        }
    }

    render() {
        let newChildren = [];
        let arrChildren = React.Children.toArray(this.props.children);
        let _this = this;
        arrChildren.forEach(function (child, index) {
            newChildren.push(React.cloneElement(child, {
                checked: _this.state.activeIndex == index, onChange: _this.toggleRadioButtonChange, index: index,
                success: _this.props.success,
                info: _this.props.info,
                warning: _this.props.warning,
                large: _this.props.large,
                small: _this.props.small,
                primary: _this.props.primary,
                danger: _this.props.danger,
                secondary: _this.props.secondary,
            }));
        });
        return (<div className="btn-group" data-toggle="buttons">
            {newChildren}
        </div>);
    }

}

AnterosRadioButton.propTypes = {
    onChange: React.PropTypes.func,
    onRadioChange: React.PropTypes.func,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    large: React.PropTypes.bool,
    small: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    secondary: React.PropTypes.bool
}


export class AnterosRadioButtonItem extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount() {
        $(this.button).tooltip();
    }

    onClick(event) {
        event.preventDefault();
        const { onChange, checked, index } = this.props;
        onChange && onChange(index, !checked);
    }

    render() {
        const { value, checked, disabled, index } = this.props;

        let className = classNames("btn", (this.props.checked ? "active focus" : ""));

        if (this.props.oval) {
            className += " btn-oval";
        }

        if (this.props.circle) {
            className += " btn-circle";
        }

        if (this.props.success) {
            className += " btn-success";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.large) {
            className += " btn-lg";
        }

        if (this.props.small) {
            className += " btn-sm";
        }

        if (this.props.primary) {
            className += " btn-primary";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.danger) {
            className += " btn-danger";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.info) {
            className += " btn-info";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.link) {
            className += " btn-link";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.warning) {
            className += " btn-warning";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        if (this.props.secondary) {
            className += " btn-secondary";
            if (this.props.outline) {
                className += "-outline";
            }
        }

        let icon;
        if (this.props.icon) {
            icon = (<i data-user={this.props.dataUser} onClick={this.onClick} className={this.props.icon} style={{ color: this.props.iconColor }}></i>);
        }

        return (<label className={className} onClick={this.onClick} aria-pressed={checked} title={this.props.hint} data-placement={this.props.hintPosition}
            ref={ref => this.button = ref}>
            <input onClick={this.onClick} type="radio" name="radios" id={index} />{icon}<img data-user={this.props.dataUser} onClick={this.onClick} src={this.props.image} /> {this.props.caption}
        </label>);
    }
}



AnterosRadioButtonItem.propTypes = {
    checked: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    oval: React.PropTypes.bool,
    success: React.PropTypes.bool,
    info: React.PropTypes.bool,
    link: React.PropTypes.bool,
    warning: React.PropTypes.bool,
    large: React.PropTypes.bool,
    small: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    default: React.PropTypes.bool,
    pillLeft: React.PropTypes.bool,
    pillRight: React.PropTypes.bool,
    block: React.PropTypes.bool,
    backgroundColor: React.PropTypes.string,
    borderColor: React.PropTypes.string,
    color: React.PropTypes.string,
    dropdown: React.PropTypes.bool,
    icon: React.PropTypes.string,
    iconColor: React.PropTypes.string,
    image: React.PropTypes.string,
    caption: React.PropTypes.string,
    hint: React.PropTypes.string,
    hintPosition: React.PropTypes.oneOf(['top', 'right', 'left', 'bottom']),
};

AnterosRadioButtonItem.defaultProps = {
    disabled: false,
    oval: false,
    success: false,
    warning: false,
    info: false,
    large: false,
    small: false,
    primary: true,
    danger: false,
    secondary: false,
    backgroundColor: undefined,
    borderColor: undefined,
    color: undefined,
    icon: undefined,
    image: undefined,
    caption: undefined,
    hintPosition: 'top',
    checked: false
}





