import { Component } from 'react';
import PropTypes from 'prop-types';

export default class AnterosCheckboxSlide extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = { checked: (this.props.checked ? true : false), disabled: (this.props.disabled ? true : false) }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ checked: (nextProps.checked ? true : false), disabled: (nextProps.disabled ? true : false) });
    }

    onClick(event) {
        event.preventDefault();
        if (!this.state.disabled) {
            let checked = !this.state.checked;
            this.setState({ ...this.state, checked: checked })
            if (this.props.onCheckboxChange) {
                this.props.onCheckboxChange(this.props.value, checked);
            }
        }

    }

    render() {
        return (<div className="checkbox-slide" onClick={this.onClick}>
            <input type="checkbox" checked={this.state.checked} disabled={this.state.disabled} onChange={this.onClick} />
            <label>{this.props.value}</label>
        </div>);
    }
}