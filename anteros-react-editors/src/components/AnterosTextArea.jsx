import React, { Component } from 'react';
import 'script-loader!bootstrap-maxlength/bootstrap-maxlength.min.js'
import 'bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css';
import lodash from "lodash";
import {AnterosUtils} from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";


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
            if (isBase64(value)) {
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
            if (isBase64(value)) {
                this.state = { value: atob(value) };
            } else {
                this.state = { value: value };
            }
        } else {
            this.state = { value: nextProps.value };
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
        if (isBase64(value)) {
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
        else if(window.navigator.userAgent.indexOf("Edge") > -1) {
          var startPos = myField.selectionStart; 
          var endPos = myField.selectionEnd; 
    
          myField.value = myField.value.substring(0, startPos)+ text 
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
    }

    handleChange(event) {
        if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, btoa(event.target.value));
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
            placeholder={this.placeHolder}
            disabled={(this.props.disabled ? true : false)}
            style={{ ...this.props.style, width: this.props.width, height: this.props.height }}
            ref={ref => this.input = ref}
            value={this.state.value}
            className={className}
            rows={this.props.rows}
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
    dataSource: React.PropTypes.oneOfType([
        React.PropTypes.instanceOf(AnterosLocalDatasource),
        React.PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: React.PropTypes.string,
    value: React.PropTypes.string.isRequired,
    placeHolder: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    maxLenght: React.PropTypes.number.isRequired,
    rows: React.PropTypes.number,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    width: React.PropTypes.string,
    height: React.PropTypes.string
};

AnterosTextArea.defaultProps = {
    value: '',
    maxLenght: 0
}