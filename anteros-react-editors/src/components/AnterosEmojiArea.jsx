import React, { Component } from 'react';
import 'script-loader!emojionearea/dist/emojionearea.min.js'
import lodash from "lodash";
import {If, Then, AnterosUtils} from "anteros-react-core";
import PropTypes from 'prop-types';


export default class AnterosEmojiArea extends React.Component {
    constructor(props) {
        super(props);
        this.idEmoji = lodash.uniqueId("emoji");
        this.state = { value: this.props.value };
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});
    }
    
    componentDidMount() {
        let _this = this;
        $(this.input).emojioneArea({
            events: {
                keyup: function (editor, event) {
                    if (_this.state.value != this.getText()) {
                        _this.setState({ value: this.getText() });
                        if (_this.props.onChange) {
                            _this.props.onChange(event);
                        }
                    }
                },
                keydown: function (editor, event) {
                    if (_this.state.value != this.getText()) {
                        _this.setState({ value: this.getText() });
                        if (_this.props.onChange) {
                            _this.props.onChange(event);
                        }
                    }
                },
                keypress: function (editor, event) {
                    if (_this.state.value != this.getText()) {
                        _this.setState({ value: this.getText() });
                        if (_this.props.onChange) {
                            _this.props.onChange(event);
                        }
                    }
                },
                paste: function (editor, event) {
                    if (_this.state.value != this.getText()) {
                        _this.setState({ value: this.getText() });
                        if (_this.props.onChange) {
                            _this.props.onChange(event);
                        }
                    }
                },
                emojibtn_click: function (button, event) {
                    if (_this.state.value != this.getText()) {
                        _this.setState({ value: this.getText() });
                        if (_this.props.onChange) {
                            _this.props.onChange(event);
                        }
                    }
                }

            }
        });

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
            this.idEmoji = this.props.id;
        }
        let classNameLabel = AnterosUtils.buildClassNames("control-label",(this.props.labelGridSize ? "col-sm-" + this.props.labelGridSize : ""));
        return (
            <div>
                <If condition={this.props.label!=undefined}>
                    <Then>
                        <label className={classNameLabel}>{this.props.label}</label>
                    </Then>
                </If>
                <div style={{ width: this.props.width }}>
                    <textarea maxLength={this.props.maxLenght>0?this.props.maxLength:""}
                        id={this.idEmoji}
                        disabled={(this.props.disabled ? true : false)}
                        style={{ ...this.props.style }}
                        ref={ref => this.input = ref}
                        value={this.state.value}
                        className={className}
                        onChange={this.handleChange}
                    />
                </div>
            </div>
        );
    }
}


AnterosEmojiArea.propTypes = {
    value: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,
    maxLenght: PropTypes.number.isRequired,
    label: PropTypes.string,
    inputGridSize: PropTypes.number,
    labelGridSize: PropTypes.number
};

AnterosEmojiArea.defaultProps = {
    value: '',
    maxLenght: 0
}