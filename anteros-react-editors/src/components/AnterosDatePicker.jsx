import React, { Component } from 'react';
import './AnterosBootstrapDatetimepicker.js'
import lodash from "lodash";
import { AnterosDateUtils, AnterosUtils } from 'anteros-react-core';
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";
import PropTypes from 'prop-types';
import AnterosInputText from './AnterosInputMask';


export default class AnterosDatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.open = false;
    this.idCalendar = lodash.uniqueId("dtPickerCal");
    this.handleChange = this.handleChange.bind(this);
    if (this.props.dataSource) {
      let value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!value) {
        value = '';
      }
      if (value instanceof Date) {
        value = AnterosDateUtils.formatDate(value, this.props.format);
      }
      this.state = { value: value };
    } else {
      this.state = { value: this.props.value };
    }
    this.onDatasourceEvent = this.onDatasourceEvent.bind(this);

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource) {
      let value = nextProps.dataSource.fieldByName(nextProps.dataField);
      if (!value) {
        value = '';
      }
      if (value instanceof Date) {
        value = AnterosDateUtils.formatDate(value, nextProps.format);
      }
      this.setState({ value: value });
    } else {
      this.setState({ value: nextProps.value });
    }
  }

  componentDidMount() {
    let _this = this;
    window.$(this.divInput).datetimepicker({
      locale: "pt-BR",
      showTodayButton: true,
      showClear: true,
      showClose: true,
      format: this.props.format
    });
    window.$(this.divInput).on("dp.hide", function (e) {
      _this.open = false;
    });
    window.$(this.divInput).on("dp.show", function (e) {
      _this.open = true;
      var datepicker = window.$('body').find('.bootstrap-datetimepicker-widget:last'),
        position = datepicker.offset(),
        parent = datepicker.parent(),
        parentPos = parent.offset(),
        width = datepicker.width(),
        parentWid = parent.width();

      datepicker.appendTo('body');
      datepicker.css({
        position: 'absolute',
        top: position.top,
        zIndex: 999999,
        bottom: 'auto',
        left: position.left,
        right: 'auto'
      });

      if (parentPos.left + parentWid < position.left + width) {
        var newLeft = parentPos.left;
        datepicker.css({ left: newLeft });
      }
    });

    window.$(this.divInput).on("dp.change", function (e) {
      let date = window.moment(e.date).format(_this.props.format);

      if (_this.props.dataSource && _this.props.dataSource.getState !== 'dsBrowse') {
        _this.props.dataSource.setFieldByName(_this.props.dataField,window.moment(e.date).toDate());
      } else {
        _this.setState({ value: date });
      }

      if (_this.props.onChange) {
        _this.props.onChange(e, date);
      }
    });

    window.$(this.input).unbind("focus");
    window.$(this.input).mask('00/00/0000', { placeholder: this.props.placeholder });
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
    if (value instanceof Date) {
      value = AnterosDateUtils.formatDate(value, this.props.format);
    }
    this.setState({ value: value });
  }

  onKeyDown(event) {
    if (event.keyCode == 116) {
      if (!this.open)
        window.$(this.divInput).datetimepicker("show");
      else
        window.$(this.divInput).datetimepicker("hide");
      this.input.focus();
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
      let value = AnterosDateUtils.parseDateWithFormat(event.target.value, this.props.format);
      //this.props.dataSource.setFieldByName(this.props.dataField, value);
    }
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  onKeyPress(event) {
    window.$(this.divInput).datetimepicker("hide");
  }

  render() {
    let readOnly = this.props.readOnly;
    if (this.props.dataSource && !readOnly) {
      readOnly = (this.props.dataSource.getState() == 'dsBrowse');
    }

    const colClasses = buildGridClassNames(this.props, false, []);
    let icon = "fa fa-calendar";
    if (this.icon) {
      icon = this.props.icon;
    }

    if (this.props.id) {
      this.idCalendar = this.props.id;
    }
    let className = AnterosUtils.buildClassNames("input-group date",
      (this.props.className ? this.props.className : ""),
      colClasses);

    let width = this.props.width;
    if (colClasses.length > 0) {
      width = "";
    }

    let classNameAddOn = AnterosUtils.buildClassNames("input-group-addon",
      (this.props.primary || this.props.fullPrimary ? "btn btn-primary" : ""),
      (this.props.success || this.props.fullSucces ? "btn btn-success" : ""),
      (this.props.info || this.props.fullInfo ? "btn btn-info" : ""),
      (this.props.danger || this.props.fullDanger ? "btn btn-danger" : ""),
      (this.props.warning || this.props.fullWarning ? "btn btn-warning" : ""),
      (this.props.secondary || this.props.fullSecondary ? "btn btn-secondary" : ""),
      (this.props.default || this.props.fullDefault ? "" : ""));

    let classNameInput = AnterosUtils.buildClassNames("form-control",
      (this.props.fullPrimary ? "btn-primary" : ""),
      (this.props.fullSucces ? "btn-success" : ""),
      (this.props.fullInfo ? "btn-info" : ""),
      (this.props.fullDanger ? "btn-danger" : ""),
      (this.props.fullWarning ? "btn-warning" : ""),
      (this.props.fullSecondary ? "btn-secondary" : ""),
      (this.props.fullDefault ? "" : ""));

    return (
      <div className={className} id={this.props.id} style={{ ...this.props.style, width: width }} ref={ref => this.divInput = ref}>
        <AnterosInputText id={this.idCalendar}  readOnly={readOnly} onKeyPress={this.onKeyPress} onKeyDown={this.onKeyDown} className={classNameInput} maskChar={null} disabled={(this.props.disabled ? true : false)}
         mask={this.props.mask} value={this.state.value} onChange={this.handleChange}/>  
        <div className={classNameAddOn} style={{margin: 0, height: '38px', width:'38px'}}>
          <span><i className={icon} /><img src={this.props.image} /></span></div>
      </div>
    );
  }
}


AnterosDatePicker.propTypes = {
  dataSource: PropTypes.oneOfType([
    PropTypes.instanceOf(AnterosLocalDatasource),
    PropTypes.instanceOf(AnterosRemoteDatasource)
  ]),
  dataField: PropTypes.string,
  placeHolder: PropTypes.string,
  format: PropTypes.string,
  mask: PropTypes.string,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  extraSmall: columnProps,
  small: columnProps,
  medium: columnProps,
  large: columnProps,
  extraLarge: columnProps,
  primary: PropTypes.bool,
  success: PropTypes.bool,
  info: PropTypes.bool,
  danger: PropTypes.bool,
  warning: PropTypes.bool,
  secondary: PropTypes.bool,
  default: PropTypes.bool,
  fullPrimary: PropTypes.bool,
  fullSuccess: PropTypes.bool,
  fullInfo: PropTypes.bool,
  fullDanger: PropTypes.bool,
  fullWarning: PropTypes.bool,
  fullSecondary: PropTypes.bool,
  style: PropTypes.object
};

AnterosDatePicker.defaultProps = {
  placeHolder: '',
  format: 'DD/MM/YYYY',
  mask: '99/99/9999',
  value: '',
  width: "220px",
  primary: true
}