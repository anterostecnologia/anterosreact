import React, { Children, cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import {AnterosUtils} from "@anterostecnologia/anteros-react-core";

export class AnterosRadioButton extends Component {
    constructor(props) {
        super(props);
        this.toggleRadioButtonChange = this.toggleRadioButtonChange.bind(this);
        this.idRadio = lodash.uniqueId('radio');
        let arrChildren = Children.toArray(this.props.children);
        let _this = this;
        _this.state = {activeIndex : -1}; 
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
        let arrChildren = Children.toArray(this.props.children);
        let _this = this;
        arrChildren.forEach(function (child, index) {
            newChildren.push(cloneElement(child, {
                checked: _this.state.activeIndex == index, onChange: _this.toggleRadioButtonChange, index: index,
                success: _this.props.success,
                info: _this.props.info,
                warning: _this.props.warning,
                large: _this.props.large,
                small: _this.props.small,
                primary: _this.props.primary,
                danger: _this.props.danger,
                secondary: _this.props.secondary,
                checkedBorderColor: _this.props.checkedBorderColor
            }));
        });
        return (<div className="btn-group" data-toggle="buttons">
            {newChildren}
        </div>);
    }

}

AnterosRadioButton.propTypes = {
    onChange: PropTypes.func,
    onRadioChange: PropTypes.func,
    success: PropTypes.bool,
    info: PropTypes.bool,
    warning: PropTypes.bool,
    large: PropTypes.bool,
    small: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    secondary: PropTypes.bool,
    checkedBorderColor: PropTypes.string
}

AnterosRadioButton.defaultProps = {
    checkedBorderColor: 'yellow'
}


export class AnterosRadioButtonItem extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount() {
        // $(this.button).tooltip();
    }

    onClick(event) {
        event.preventDefault();
        const { onChange, checked, index } = this.props;
        onChange && onChange(index, !checked);
    }

    render() {
        const { value, checked, disabled, index } = this.props;

        let className = AnterosUtils.buildClassNames("btn", (this.props.checked ? "active focus" : ""));

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

        let border;
        if (this.props.checkedBorderColor && this.props.checked){
            border = "1px solid "+this.props.checkedBorderColor;
        }

        return (<label tabIndex={-1} className={className} style={{...this.props.style, border}} onClick={this.onClick} aria-pressed={checked} title={this.props.hint} data-placement={this.props.hintPosition}
            ref={ref => this.button = ref}>
            <input tabIndex={-1} onClick={this.onClick} type="radio" name="radios" id={index} />{icon}<img data-user={this.props.dataUser} onClick={this.onClick} src={this.props.image} /> {this.props.caption}
        </label>);
    }
}



AnterosRadioButtonItem.propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    oval: PropTypes.bool,
    success: PropTypes.bool,
    info: PropTypes.bool,
    link: PropTypes.bool,
    warning: PropTypes.bool,
    large: PropTypes.bool,
    small: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    secondary: PropTypes.bool,
    default: PropTypes.bool,
    pillLeft: PropTypes.bool,
    pillRight: PropTypes.bool,
    block: PropTypes.bool,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    color: PropTypes.string,
    dropdown: PropTypes.bool,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    image: PropTypes.string,
    caption: PropTypes.string,
    hint: PropTypes.string,
    style: PropTypes.object,
    checkedBorderColor: PropTypes.string,
    hintPosition: PropTypes.oneOf(['top', 'right', 'left', 'bottom']),
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
    checked: false,
    style: {}
}





