import React, { Component } from 'react';
import { AnterosError } from "anteros-react-core";
import classNames from "classnames";
import { buildGridClassNames, columnProps } from "anteros-react-layout";

export default class AnterosRadioGroup extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.getValue = this.getValue.bind(this);
        this.getCheckedIndex = this.getCheckedIndex.bind(this);

        var index = -1;
        var value = undefined;
        if (!this.props.name) {
            throw new AnterosError("Informe um nome para o RadioGroup.");
        }
        let _this = this;
        if (this.props.children) {
            this.props.children.forEach(function findIndex(element, index) {
                if (element.props.value == _this.props.value) {
                    _this.index = index;
                    _this.value = element.value;
                }

            });
        }
        this.state = { checkedIndex: this.index, value: this.value };
    }

    componentWillReceiveProps(nextProps) {
        this.value = undefined;
        this.index = -1;
        let _this = this;
        if (nextProps.children) {
            nextProps.children.forEach(function findIndex(element, index) {
                if (element.props.value == nextProps.props.value) {
                    _this.value = element.value;
                    _this.index = index;
                }
            });
        }
        this.state = { checkedIndex: this.index, value: this.value };
    }

    getValue() {
        return this.state.value;
    }

    getCheckedIndex() {
        return this.state.checkedIndex;
    }

    onChange(index) {
        const { onRadioChange, children } = this.props;
        const child = children[index];
        if (!child) return;

        this.setState({ checkedIndex: index, value: child.props.value });
        onRadioChange && onRadioChange(child.props.value || '', index);
    }

    renderChild(child, index, checked) {
        const { children, horizontal, onRadioChange, ...rest } = this.props;
        return React.cloneElement(child, {
            horizontal, index, checked,
            key: index,
            last: index === children.length - 1,
            onChange: this.onChange, ...rest
        });
    }

    render() {
        const colClasses = buildGridClassNames(this.props, false, []);

        let className = classNames("d-flex flex-column form-control",
            (this.props.className ? this.props.className : ""));

        const { checkedIndex } = this.state;
        const { horizontal, children, extraSmall: columnProps, small, medium, large, extraLarge, onRadioChange, ...props } = this.props;
        const style = horizontal ? { display: 'inline-flex', width: '100%' } : {};

        let radio = <div className={className} {...props}>
            {children.map((c, i) => (this.renderChild(c, i, i === checkedIndex)))}
        </div>;

        if (colClasses.length > 0) {
            return (<div className={classNames(colClasses)}>
                {radio}
            </div>);
        } else {
            return radio
        }
    }
}

AnterosRadioGroup.propTypes = {
    horizontal: React.PropTypes.bool,
    children: React.PropTypes.node,
    value: React.PropTypes.string,
    onRadioChange: React.PropTypes.func,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps
};

export class AnterosRadio extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        const { onChange, checked, index } = this.props;
        onChange && onChange(index);
    }

    render() {
        const { label, checked, disabled } = this.props;
        return (<label onClick={this.onClick}>
            <input className="radio" name="radios" type="radio" defaultChecked={checked} disabled={disabled} />
            <span>{this.props.label}</span>
        </label>);
    }
}

AnterosRadio.propTypes = {
    value: React.PropTypes.string,
    label: React.PropTypes.string,
    checked: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func
};

AnterosRadio.defaultProps = {
    disabled: false,
    checked: false
}

