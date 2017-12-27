import React, { Component } from 'react';
import 'script-loader!clockpicker/dist/bootstrap-clockpicker.min.js';
import 'script-loader!clockpicker/dist/bootstrap-clockpicker.min.css';
import 'script-loader!jquery-mask-plugin/dist/jquery.mask.min.js';
import lodash from "lodash";
import {AnterosUtils} from "anteros-react-core";
import { buildGridClassNames, columnProps } from "anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from "anteros-react-datasource";

export default class AnterosClockPicker extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.open = false;
    this.idInput = lodash.uniqueId("cPickerCalInput");
    this.handleChange = this.handleChange.bind(this);

    if (this.props.dataSource) {
      let value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!value) {
        value = '';
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
      this.state = { value: value };
    } else {
      this.state = { value: nextProps.value };
    }
  }

  componentDidMount() {
    let _this = this;
    $(this.divInput).clockpicker({
      autoclose: true,
      init: function () {
      },
      beforeShow: function () {
      },
      afterShow: function () {
        _this.open = true;
      },
      beforeHide: function () {
      },
      afterHide: function () {
        _this.open = false;
      },
      beforeHourSelect: function () {
      },
      afterHourSelect: function () {
      },
      beforeDone: function () {
      },
      afterDone: function () {
      }
    });

    $(this.input).unbind("focus");
    $(this.input).mask(this.props.inputMask, { placeholder: this.props.placeholder });
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
    this.setState({ value: value });
  }

  onKeyDown(event) {
    if (event.keyCode == 116) {
      if (!this.open)
        $(this.divInput).clockpicker("show");
      else
        $(this.divInput).clockpicker("hide");
      this.input.focus();
    }
  }

  handleChange(event) {
    if (this.props.dataSource && this.props.dataSource.getState !== 'dsBrowse') {
      this.props.dataSource.setFieldByName(this.props.dataField, event.target.value);
    } else {
      this.setState({ value: event.target.value });
    }
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  onKeyPress(event) {
    $(this.divInput).clockpicker("hide");
    if (this.props.onKeyPress) {
      this.props.onKeyPress(event);
    }
  }

  onKeyDown(event) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
    }
  }


  render() {
    let readOnly = this.props.readOnly;
    if (this.props.dataSource && !readOnly) {
      readOnly = (this.props.dataSource.getState() == 'dsBrowse');
    }
    const colClasses = buildGridClassNames(this.props, false, []);

    let icon = "fa fa-clock-o";
    if (this.icon) {
      icon = this.props.icon;
    }
    if (this.props.id) {
      this.idInput = this.props.id;
    }
    let className = AnterosUtils.buildClassNames("input-group time",
      (this.props.className ? this.props.className : ""),
      colClasses);

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
      <div className={className} id={this.props.id} style={{ ...this.props.style, width: this.props.width }} ref={ref => this.divInput = ref}>
        <input disabled={(this.props.disabled ? true : false)} id={this.idInput} ref={ref => this.input = ref} type="text" value={this.state.value} className={classNameInput} onChange={this.handleChange}
          onKeyPress={this.onKeyPress} onKeyDown={this.onKeyDown} placeholder={this.props.placeHolder} readOnly={readOnly} />
        <div className={classNameAddOn}>
          <span><i className={icon} /><img src={this.props.image} /></span></div>
      </div>
    );
  }
}


AnterosClockPicker.propTypes = {
  dataSource: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(AnterosLocalDatasource),
    React.PropTypes.instanceOf(AnterosRemoteDatasource)
  ]),
  dataField: React.PropTypes.string,
  placeHolder: React.PropTypes.string,
  format: React.PropTypes.string,
  value: React.PropTypes.string.isRequired,
  extraSmall: columnProps,
  small: columnProps,
  medium: columnProps,
  large: columnProps,
  extraLarge: columnProps,
  primary: React.PropTypes.bool,
  success: React.PropTypes.bool,
  info: React.PropTypes.bool,
  danger: React.PropTypes.bool,
  warning: React.PropTypes.bool,
  secondary: React.PropTypes.bool,
  default: React.PropTypes.bool,
  fullPrimary: React.PropTypes.bool,
  fullSuccess: React.PropTypes.bool,
  fullInfo: React.PropTypes.bool,
  fullDanger: React.PropTypes.bool,
  fullWarning: React.PropTypes.bool,
  fullSecondary: React.PropTypes.bool,
  onChange: React.PropTypes.func
};

AnterosClockPicker.defaultProps = {
  placeHolder: '',
  format: 'hh:mm:ss',
  inputMask: '00:00:00',
  value: '',
  primary: true
}