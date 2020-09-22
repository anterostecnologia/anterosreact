import React, { Component } from 'react';
import 'script-loader!bootstrap-maxlength/src/bootstrap-maxlength.js'
import lodash from "lodash";
import { AnterosUtils } from "@anterostecnologia/anteros-react-core";
import { buildGridClassNames, columnProps } from "@anterostecnologia/anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "@anterostecnologia/anteros-react-datasource";
import PropTypes from 'prop-types';

function isBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

export default class AnterosTextArea extends React.Component {
    constructor(props) {
        super(props);
        this.idTextArea = lodash.uniqueId("textArea");
        this.handleChange = this.handleChange.bind(this);
        if (this.props.dataSource) {
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            if (isBase64(value) && !this.props.disableBase64Convertion) {
                this.state = { value: atob(value) };
            } else {
                this.state = { value: value };
            }
        } else {
            this.state = { value: this.props.value };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.insertText = this.insertText.bind(this);
    }

    get componentName() {
        return "AnterosTextArea";
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            if (isBase64(value) && !this.props.disableBase64Convertion) {
                this.setState({ value: atob(value) });
            } else {
                this.setState({ value: value });
            }
        } else {
            this.setState({ value: nextProps.value });
        }
    }

    componentDidMount() {
        let _this = this;
        if (this.props.maxLenght > 0) {
            $(this.input).maxlength({
                alwaysShow: true,
                validate: true,
                warningClass: "label label-input-success",
                limitReachedClass: "label label-input-danger"
            });
        }

        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    componentWillUnmount() {
        if ((this.props.dataSource)) {
            this.props.dataSource.removeEventListener(
                [dataSourceEvents.AFTER_CLOSE,
                dataSourceEvents.AFTER_OPEN,
                dataSourceEvents.AFTER_GOTO_PAGE,
                dataSourceEvents.AFTER_CANCEL,
                dataSourceEvents.AFTER_SCROLL], this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.DATA_FIELD_CHANGED, this.onDatasourceEvent, this.props.dataField);
        }
    }

    onDatasourceEvent(event, error) {
        let value = this.props.dataSource.fieldByName(this.props.dataField);
        if (!value) {
            value = '';
        }
        if (isBase64(value) && !this.props.disableBase64Convertion) {
            this.setState({ value: atob(value) });
        } else {
            this.setState({ value: value });
        }
    }

    insertText(text) {
        let myField = document.getElementById(this.idTextArea);
        if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            sel.text = text;
        }
        // Microsoft Edge
        else if (window.navigator.userAgent.indexOf("Edge") > -1) {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;

            myField.value = myField.value.substring(0, startPos) + text
                + myField.value.substring(endPos, myField.value.length);

            var pos = startPos + text.length;
            myField.focus();
            myField.setSelectionRange(pos, pos);
        }
        //MOZILLA and others
        else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + text
                + myField.value.substring(endPos, myField.value.length);
        } else {
            myField.value += text;
        }

        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            if (this.props.disableBase64Convertion) {
                this.props.dataSource.setFieldByName(this.props.dataField, myField.value);
            } else {
                this.props.dataSource.setFieldByName(this.props.dataField, btoa(myField.value));
            }
        } else {
            this.setState({ value: myField.value });
        }
    }

    getInputSelection() {
        this.input.focus();
        var start = 0, end = 0, normalizedValue, range,
            textInputRange, len, endRange;

        if (typeof this.input.selectionStart == "number" && typeof this.input.selectionEnd == "number") {
            start = this.input.selectionStart;
            end = this.input.selectionEnd;
        } else {
            range = document.selection.createRange();

            if (range && range.parentElement() == el) {
                len = this.input.value.length;
                normalizedValue = this.input.value.replace(/\r\n/g, "\n");

                // Create a working TextRange that lives only in the input
                textInputRange = this.input.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());

                // Check if the start and end of the selection are at the very end
                // of the input, since moveStart/moveEnd doesn't return what we want
                // in those cases
                endRange = this.input.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    start = end = len;
                } else {
                    start = -textInputRange.moveStart("character", -len);
                    start += normalizedValue.slice(0, start).split("\n").length - 1;

                    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                        end = len;
                    } else {
                        end = -textInputRange.moveEnd("character", -len);
                        end += normalizedValue.slice(0, end).split("\n").length - 1;
                    }
                }
            }
        }
        return {
            start: start,
            end: end
        };
    }



    handleChange(event) {
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            if (this.props.disableBase64Convertion) {
                this.props.dataSource.setFieldByName(this.props.dataField, event.target.value);
            } else {
                this.props.dataSource.setFieldByName(this.props.dataField, btoa(event.target.value));
            }
        } else {
            this.setState({ value: event.target.value });
        }
        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    render() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = (this.props.dataSource.getState() == 'dsBrowse');
        }
        const colClasses = buildGridClassNames(this.props, false, []);
        const className = AnterosUtils.buildClassNames(
            (this.props.className ? this.props.className : ""), (colClasses.length > 0 ? "form-control" : ""));

        if (this.props.id) {
            this.idTextArea = this.props.id;
        }

        let textArea = <textarea maxLength={this.props.maxLenght > 0 ? this.props.maxLenght : ""}
            id={this.idTextArea}
            placeholder={this.props.placeHolder}
            disabled={(this.props.disabled ? true : false)}
            style={{ ...this.props.style, width: this.props.width, height: this.props.height }}
            ref={ref => this.input = ref}
            value={this.state.value}
            className={className}
            rows={this.props.rows}
            autofocus
            readOnly={readOnly}
            onChange={this.handleChange}
        />;

        if (colClasses.length > 0) {
            return (<div className={AnterosUtils.buildClassNames(colClasses)}>
                {textArea}
            </div>);
        } else {
            return textArea
        }
    }
}


AnterosTextArea.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    value: PropTypes.string.isRequired,
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,
    maxLenght: PropTypes.number.isRequired,
    rows: PropTypes.number,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    width: PropTypes.string,
    height: PropTypes.string,
    style: PropTypes.object,
    disableBase64Convertion: PropTypes.bool.isRequired
};

AnterosTextArea.defaultProps = {
    value: '',
    maxLenght: 0,
    disableBase64Convertion: false
}