import React, { Component } from 'react';
import 'script-loader!jquery-asSpinner/dist/jquery-asSpinner.min.js'
import 'jquery-asSpinner/dist/css/asSpinner.min.css';
import lodash from "lodash";
import { If, Then, Else, AnterosUtils } from "anteros-react-core";
import PropTypes from 'prop-types';

export default class AnterosSpinner extends Component {
    constructor(props) {
        super(props);
        this.idSpinner = lodash.uniqueId("spinner");
        this.state = { value: this.props.value };
        this.handleChange = this.handleChange.bind(this);
    }
    componentDidMount() {
        let _this = this;
        $(this.input).asSpinner({
            disabled: _this.props.disabled,
            min: _this.props.min,
            max: _this.props.max,
            step: _this.props.step,
            precision: _this.props.precision,
            looping: _this.props.looping,
            namespace: 'anteros-spinner',
            mousewheel: _this.props.mouseWheel
        });

    }

    componentWillUnmount() {
        $(this.input).asSpinner('destroy');
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    render() {
        let className = AnterosUtils.buildClassNames("form-control",
            (this.props.className ? this.props.className : ""),
            (this.props.inputGridSize ? " col-sm-" + this.props.inputGridSize : ""));

        if (this.props.id) {
            this.idSpinner = this.props.id;
        }
        let classNameLabel = AnterosUtils.buildClassNames("control-label",(this.props.labelGridSize ? "col-sm-" + this.props.labelGridSize : ""));
        return (
            <div>
                <If condition={this.props.label!=undefined}>
                    <Then>
                        <label className={classNameLabel}>{this.props.label}</label>
                    </Then>
                </If>
                <input maxLength={this.props.maxLenght>0?this.props.maxLenght:""}
                    id={this.idSpinner}
                    disabled={(this.props.disabled ? true : false)}
                    style={{ ...this.props.style, width: this.props.width }}
                    ref={ref => this.input = ref} type="text"
                    value={this.state.value}
                    className={className}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}


AnterosSpinner.propTypes = {
    value: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number.isRequired,
    precision: PropTypes.number.isRequired,
    looping: PropTypes.bool.isRequired,
    mouseWheel: PropTypes.bool.isRequired
};

AnterosSpinner.defaultProps = {
    value: '',
    step: 1,
    precision: 0,
    looping: false,
    mouseWheel: false
}