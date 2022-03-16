import React, {
  Component,
  useMemo,
  useRef,
  useEffect,
  useState,
  Fragment,
} from "react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import InputMask from "react-input-mask";
import PropTypes from "prop-types";
import * as dayjs from "dayjs";
import {
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
  dataSourceEvents,
} from "@anterostecnologia/anteros-react-datasource";
import shallowCompare from "react-addons-shallow-compare";
import {
  buildGridClassNames,
  columnProps,
} from "@anterostecnologia/anteros-react-layout";
import {
  AnterosUtils,
  AnterosDateUtils,
  autoBind,
} from "@anterostecnologia/anteros-react-core";
import Popover from "@uiw/react-popover";
import formatter from "@uiw/formatter";
import { noop } from "lodash";
import moment from "moment";

export const ifExistCall = (func, ...args) => func && func(...args);
export const formatDate = (date, format) => {
  if (date === undefined) return "";
  return dayjs(date).format(format);
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function CustomInput({
  openCalendar,
  stringDate,
  handleValueChange,
  format,
  closeCalendar,
  clear,
  icon,
  right,
  onClearValue,
}) {
  let _format = format.replace(/[`~DMYhs]/gi, "9");
  return (
    <div style={{ display: "flex" }}>
      <InputMask
        onFocus={openCalendar}
        style={{
          height: "38px",
          padding: "3px",
          border: "1px solid rgb(204, 212, 219)",
          borderTopLeftRadius: "4px",
          borderBottomLeftRadius: "4px",
          width: "100%",
        }}
        mask={_format}
        value={stringDate}
        onChange={handleValueChange}
      ></InputMask>
      {clear ? (
        <i
          onClick={onClearValue}
          className={"far fa-times"}
          style={{
            cursor: "pointer",
            color: "#6565cd",
            position: "absolute",
            right,
            top: 12,
          }}
        ></i>
      ) : null}
    </div>
  );
}

class AnterosDatePicker extends Component {
  constructor(props) {
    super(props);
    this.dateRef = React.createRef();

    let date;
    if (this.props.dataSource) {
      let value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!value) {
        value = "";
      }
      if (!(value instanceof Date)) {
        value = AnterosDateUtils.parseDateWithFormat(value, this.props.format);
      }
      date = undefined;
      if (value !== undefined && value !== 0) {
        date = dayjs(value);
      }
      this.state = {
        value: date ? formatDate(date, this.getDateFormat()) : "",
        calendarOpened: false,
      };
    } else {
      this.state = {
        value: formatDate(date, this.getDateFormat()),
        calendarOpened: false,
      };
    }
    autoBind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentDidMount() {
    if (this.props.dataSource) {
      this.props.dataSource.addEventListener(
        [
          dataSourceEvents.AFTER_CLOSE,
          dataSourceEvents.AFTER_OPEN,
          dataSourceEvents.AFTER_GOTO_PAGE,
          dataSourceEvents.AFTER_CANCEL,
          dataSourceEvents.AFTER_SCROLL,
        ],
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.DATA_FIELD_CHANGED,
        this.onDatasourceEvent,
        this.props.dataField
      );
    }
  }

  componentWillUnmount() {
    if (this.props.dataSource) {
      this.props.dataSource.removeEventListener(
        [
          dataSourceEvents.AFTER_CLOSE,
          dataSourceEvents.AFTER_OPEN,
          dataSourceEvents.AFTER_GOTO_PAGE,
          dataSourceEvents.AFTER_CANCEL,
          dataSourceEvents.AFTER_SCROLL,
        ],
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.DATA_FIELD_CHANGED,
        this.onDatasourceEvent,
        this.props.dataField
      );
    }
  }

  onDatasourceEvent(event, error) {
    let value = this.props.dataSource.fieldByName(this.props.dataField);
    if (!value) {
      value = "";
    }
    if (!(value instanceof Date)) {
      value = AnterosDateUtils.parseDateWithFormat(value, this.getDateFormat());
    }
    let date = undefined;
    if (value !== undefined && value !== 0) {
      date = dayjs(value);
    }
    this.setState({
      ...this.state,
      value: date ? formatDate(date, this.getDateFormat()) : "",
      update: Math.random(),
    });
  }

  handleDateChange(value) {
    if (value !== null) {
      const { onChange, includeTime } = this.props;
      let date = value.toDate();
      if (!includeTime) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
      }
      const _value = dayjs(date).format(this.getDateFormat());

      ifExistCall(onChange, date, _value);

      if (
        this.props.dataSource &&
        this.props.dataSource.getState !== "dsBrowse"
      ) {
        if (!date && date.toDate() === 0) {
          this.props.dataSource.setFieldByName(this.props.dataField, undefined);
        } else {
          this.props.dataSource.setFieldByName(this.props.dataField, date);
        }
      }

      this.setState({
        ...this.state,
        value: _value,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource) {
      let value = nextProps.dataSource.fieldByName(nextProps.dataField);
      if (!value) {
        value = "";
      }
      if (!(value instanceof Date)) {
        value = AnterosDateUtils.parseDateWithFormat(
          value,
          this.getDateFormat()
        );
      }
      let date = undefined;
      if (value !== undefined && value !== 0) {
        date = dayjs(value);
      }
      this.setState({
        ...this.state,
        value: date ? formatDate(date, this.getDateFormat()) : "",
      });
    } else {
      this.setState({ ...this.state, value: nextProps.value });
    }
  }

  getDateFormat() {
    const { dateFormat, timeFormat, includeTime } = this.props;
    if (includeTime) {
      return dateFormat + " " + timeFormat;
    }
    return dateFormat;
  }

  closeCalendar() {
    this.dateRef.current.closeCalendar();
  }

  onButtonClick() {
    if (this.props.onButtonClick) {
      this.props.onButtonClick();
    } else {
      if (this.state.calendarOpened) {
        this.dateRef.current.closeCalendar();
      } else {
        this.dateRef.current.openCalendar();
      }
    }
  }

  onOpen() {
    this.setState({ ...this.state, calendarOpened: true });
  }

  onClose() {
    this.setState({ ...this.state, calendarOpened: false });
  }

  onClearValue() {
    if (this.state.calendarOpened) {
      this.dateRef.current.closeCalendar();
    }
    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      this.props.dataSource.setFieldByName(this.props.dataField, undefined);
    }
    this.setState({ ...this.state, value: undefined, calendarOpened: false });
  }

  render() {
    let {
      includeTime,
      disabled,
      readOnly,
      clear,
      disableDayPicker,
      onOpenPickNewDate,
    } = this.props;
    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() === "dsBrowse";
    }

    const colClasses = buildGridClassNames(this.props, false, []);

    if (this.props.id) {
      this.idEdit = this.props.id;
    }
    let className = AnterosUtils.buildClassNames(
      "input-group",
      this.props.className ? this.props.className : "",
      colClasses
    );

    let width = this.props.width;
    if (colClasses.length > 0) {
      width = "";
    }

    let icon;
    if (this.props.icon) {
      icon = (
        <i
          data-user={this.props.dataUser}
          onClick={this.onButtonClick}
          className={this.props.icon}
          style={{ color: this.props.iconColor }}
        ></i>
      );
    }

    let classNameAddOn = AnterosUtils.buildClassNames(
      "input-group-addon",
      disabled || readOnly ? "disabled" : "",
      this.props.primary || this.props.fullPrimary ? "btn btn-primary" : "",
      this.props.success || this.props.fullSucces ? "btn btn-success" : "",
      this.props.info || this.props.fullInfo ? "btn btn-info" : "",
      this.props.danger || this.props.fullDanger ? "btn btn-danger" : "",
      this.props.warning || this.props.fullWarning ? "btn btn-warning" : "",
      this.props.secondary || this.props.fullSecondary
        ? "btn btn-secondary"
        : ""
    );

    let plugins = [];
    if (includeTime) {
      plugins.push(<TimePicker position="bottom" />);
    }

    let edit = (
      <DatePicker
        ref={this.dateRef}
        disableDayPicker={disableDayPicker}
        value={this.state.value}
        editable={!readOnly}
        disabled={disabled}
        weekDays={weekDays}
        months={months}
        onOpenPickNewDate={onOpenPickNewDate}
        portal={true}
        onOpen={this.onOpen}
        onClose={this.onClose}
        format={this.getDateFormat()}
        onChange={this.handleDateChange}
        plugins={plugins}
        containerStyle={{
          width: this.props.icon
            ? `calc(${this.props.width} - 38px)`
            : this.props.width,
        }}
        render={
          <CustomInput
            clear={clear}
            icon={this.props.icon}
            right={64}
            onClearValue={this.onClearValue}
            closeCalendar={this.closeCalendar}
            format={this.getDateFormat()}
          />
        }
      />
    );

    if (this.props.icon && colClasses.length > 0) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {edit}
          <div
            className={classNameAddOn}
            style={{ margin: 0, width: "38px" }}
            onClick={this.onButtonClick}
          >
            <span>
              {icon}
              {this.props.image ? (
                <img
                  alt=" "
                  src={this.props.image}
                  onClick={this.onButtonClick}
                />
              ) : null}
            </span>
          </div>
        </div>
      );
    } else {
      if (colClasses.length > 0) {
        return (
          <div className={AnterosUtils.buildClassNames(colClasses)}>{edit}</div>
        );
      } else {
        return (
          <div
            className={className}
            style={{
              ...this.props.style,
              width: width,
              marginBottom: "4px",
              marginTop: "4px",
            }}
            ref={(ref) => (this.divInput = ref)}
          >
            <DatePicker
              ref={this.dateRef}
              value={this.state.value}
              disableDayPicker={disableDayPicker}
              editable={!readOnly}
              disabled={disabled}
              weekDays={weekDays}
              months={months}
              portal={true}
              onOpen={this.onOpen}
              onClose={this.onClose}
              format={this.getDateFormat()}
              onChange={this.handleDateChange}
              plugins={plugins}
              containerStyle={{
                width: this.props.icon
                  ? `calc(${this.props.width} - 38px)`
                  : this.props.width,
              }}
              render={
                <CustomInput
                  clear={clear}
                  icon={this.props.icon}
                  right={48}
                  onClearValue={this.onClearValue}
                  closeCalendar={this.closeCalendar}
                  format={this.getDateFormat()}
                />
              }
            />
            <div
              className={classNameAddOn}
              style={{ margin: 0, width: "38px" }}
              onClick={this.onButtonClick}
            >
              <span>
                <i
                  onClick={this.onButtonClick}
                  className={
                    this.props.icon ? this.props.icon : "fa fa-calendar"
                  }
                  style={{ color: this.props.iconColor }}
                ></i>
                {this.props.image ? (
                  <img
                    alt=" "
                    src={this.props.image}
                    onClick={this.onButtonClick}
                  />
                ) : null}
              </span>
            </div>
          </div>
        );
      }
    }
  }
}

AnterosDatePicker.propTypes = {
  dataSource: PropTypes.oneOfType([
    PropTypes.instanceOf(AnterosLocalDatasource),
    PropTypes.instanceOf(AnterosRemoteDatasource),
  ]),
  dataField: PropTypes.string.isRequired,
  lookupField: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  placeHolder: PropTypes.string,
  disabled: PropTypes.bool,
  maxLenght: PropTypes.number.isRequired,
  extraSmall: columnProps,
  small: columnProps,
  medium: columnProps,
  large: columnProps,
  extraLarge: columnProps,
  icon: PropTypes.any,
  iconColor: PropTypes.string,
  image: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.any,
  readOnly: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
  dateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
};

AnterosDatePicker.defaultProps = {
  readOnly: false,
  icon: "fa fa-calendar",
  clear: true,
  primary: true,
  includeTime: false,
  showDefaultIcon: false,
  dateFormat: "DD/MM/YYYY",
  timeFormat: "HH:mm:ss",
  width: "100%",
  onOpenPickNewDate: false,
};

class AnterosDateTimePicker extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }
  render() {
    return (
      <AnterosDatePicker
        {...this.props}
        includeTime={true}
        icon="fa fa-clock"
      ></AnterosDatePicker>
    );
  }
}

AnterosDateTimePicker.propTypes = AnterosDatePicker.propTypes;
AnterosDateTimePicker.defaultProps = AnterosDatePicker.defaultProps;

const DEFAULT_COLON = ":";
const DEFAULT_VALUE_SHORT = `00${DEFAULT_COLON}00`;
const DEFAULT_VALUE_FULL = `00${DEFAULT_COLON}00${DEFAULT_COLON}00`;

export function isNumber(value) {
  const number = Number(value);
  return !isNaN(number) && String(value) === String(number);
}

export function formatTimeItem(value) {
  return `${value || ""}00`.substr(0, 2);
}

export function validateTimeAndCursor(
  showSeconds = false,
  value = "",
  defaultValue = "",
  colon = DEFAULT_COLON,
  cursorPosition = 0
) {
  const [oldH, oldM, oldS] = defaultValue.split(colon);

  let newCursorPosition = Number(cursorPosition);
  let [newH, newM, newS] = String(value).split(colon);

  newH = formatTimeItem(newH);
  if (Number(newH[0]) > 2) {
    newH = oldH;
    newCursorPosition -= 1;
  } else if (Number(newH[0]) === 2) {
    if (Number(oldH[0]) === 2 && Number(newH[1]) > 3) {
      newH = `2${oldH[1]}`;
      newCursorPosition -= 2;
    } else if (Number(newH[1]) > 3) {
      newH = "23";
    }
  }

  newM = formatTimeItem(newM);
  if (Number(newM[0]) > 5) {
    newM = oldM;
    newCursorPosition -= 1;
  }

  if (showSeconds) {
    newS = formatTimeItem(newS);
    if (Number(newS[0]) > 5) {
      newS = oldS;
      newCursorPosition -= 1;
    }
  }

  const validatedValue = showSeconds
    ? `${newH}${colon}${newM}${colon}${newS}`
    : `${newH}${colon}${newM}`;

  return [validatedValue, newCursorPosition];
}

function TimePickerPanel(props) {
  const {
    prefixCls = "w-timepicker",
    className,
    count = 24,
    date,
    type = "Hours",
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabled,
    onSelected,
    ...other
  } = props;
  const disableds = useRef([]);
  function getMaybeNumber() {
    if (date && type) {
      return new Date(date)[`get${type}`]();
    }
    return 0;
  }
  function handleClick(num, e) {
    if (!date) return;
    const currentDate = new Date(date);
    currentDate[`set${type}`](num);
    onSelected && onSelected(type, num, disableds.current, currentDate);
  }
  function getDisabledItem(num) {
    const disabled = props[`disabled${type}`];
    if (disabled) {
      return disabled(num, type, new Date(date));
    }
    return false;
  }
  function getItemInstance(tag) {
    if (tag && tag.parentNode && tag.dataset["index"]) {
      const offsetTop = Number(tag.dataset["index"]) * tag.clientHeight;
      if (tag.parentNode.parentNode) {
        tag.parentNode.parentNode.scrollTop = offsetTop;
      }
    }
  }
  const data = useMemo(() => {
    return [...Array(count)]
      .map((_, idx) => {
        const disabled = getDisabledItem(idx);
        if (disabled) disableds.current.push(idx);
        return {
          count: idx,
          disabled: getDisabledItem(idx),
        };
      })
      .filter((item) => (hideDisabled && item.disabled ? false : true));
  }, [hideDisabled]);

  return (
    <div className={`${prefixCls}-spinner`} {...other}>
      <ul>
        {data.map((item, idx) => {
          const liProps = {};
          if (!item.disabled) {
            liProps.onClick = (e) => handleClick(item.count, e);
          }
          const currentCount = getMaybeNumber();
          return (
            <li
              key={idx}
              data-index={currentCount === item.count ? idx : undefined}
              ref={(tag) => tag && getItemInstance(tag)}
              {...liProps}
              className={[
                item.disabled ? "disabled" : null,
                currentCount === item.count ? "selected" : null,
                hideDisabled && item.disabled ? "hide" : null,
              ]
                .filter(Boolean)
                .join(" ")
                .trim()}
            >
              {item.count < 10 ? `0${item.count}` : item.count}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

class AnterosTimeInput extends Component {
  static defaultProps = {
    showSeconds: true,
    input: null,
    readOnly: false,
    icon: "fa fa-clock",
    width: "120px",
    clear: true,
    primary: true,
    style: {},
    colon: DEFAULT_COLON,
  };

  constructor(props) {
    super(props);

    const _showSeconds = Boolean(props.showSeconds);
    const _defaultValue = _showSeconds
      ? DEFAULT_VALUE_FULL
      : DEFAULT_VALUE_SHORT;
    const _colon =
      props.colon && props.colon.length === 1 ? props.colon : DEFAULT_COLON;

    this.dateRef = React.createRef();

    let _value;
    if (this.props.dataSource) {
      let _value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!_value) {
        _value = "";
      }
    } else {
      _value = props.value;
    }

    const [validatedTime] = validateTimeAndCursor(
      _showSeconds,
      _value,
      _defaultValue,
      _colon
    );

    this.state = {
      value: validatedTime,
      _colon,
      _showSeconds,
      _defaultValue,
      _maxLength: _defaultValue.length,
    };

    autoBind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      const [validatedTime] = validateTimeAndCursor(
        this.state._showSeconds,
        this.props.value,
        this.state._defaultValue,
        this.state._colon
      );
      this.setState({
        value: validatedTime,
      });
    }
  }

  onInputChange(event, callback) {
    const oldValue = this.state.value;
    const inputEl = event.target;
    const inputValue = inputEl.value;
    const position = inputEl.selectionEnd || 0;
    const isTyped = inputValue.length > oldValue.length;
    const cursorCharacter = inputValue[position - 1];
    const addedCharacter = isTyped ? cursorCharacter : null;
    const removedCharacter = isTyped ? null : oldValue[position];
    const replacedSingleCharacter =
      inputValue.length === oldValue.length ? oldValue[position - 1] : null;
    const colon = this.state._colon;

    let newValue = oldValue;
    let newPosition = position;

    if (addedCharacter !== null) {
      if (position > this.state._maxLength) {
        newPosition = this.state._maxLength;
      } else if (
        (position === 3 || position === 6) &&
        addedCharacter === colon
      ) {
        newValue = `${inputValue.substr(
          0,
          position - 1
        )}${colon}${inputValue.substr(position + 1)}`;
      } else if (
        (position === 3 || position === 6) &&
        isNumber(addedCharacter)
      ) {
        newValue = `${inputValue.substr(
          0,
          position - 1
        )}${colon}${addedCharacter}${inputValue.substr(position + 2)}`;
        newPosition = position + 1;
      } else if (isNumber(addedCharacter)) {
        newValue =
          inputValue.substr(0, position - 1) +
          addedCharacter +
          inputValue.substr(position + 1);
        if (position === 2 || position === 5) {
          newPosition = position + 1;
        }
      } else {
        newPosition = position - 1;
      }
    } else if (replacedSingleCharacter !== null) {
      if (isNumber(cursorCharacter)) {
        if (position - 1 === 2 || position - 1 === 5) {
          newValue = `${inputValue.substr(
            0,
            position - 1
          )}${colon}${inputValue.substr(position)}`;
        } else {
          newValue = inputValue;
        }
      } else {
        newValue = oldValue;
        newPosition = position - 1;
      }
    } else if (
      typeof cursorCharacter !== "undefined" &&
      cursorCharacter !== colon &&
      !isNumber(cursorCharacter)
    ) {
      newValue = oldValue;
      newPosition = position - 1;
    } else if (removedCharacter !== null) {
      if ((position === 2 || position === 5) && removedCharacter === colon) {
        newValue = `${inputValue.substr(
          0,
          position - 1
        )}0${colon}${inputValue.substr(position)}`;
        newPosition = position - 1;
      } else {
        newValue = `${inputValue.substr(0, position)}0${inputValue.substr(
          position
        )}`;
      }
    }

    const [validatedTime, validatedCursorPosition] = validateTimeAndCursor(
      this.state._showSeconds,
      newValue,
      oldValue,
      colon,
      newPosition
    );

    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      this.props.dataSource.setFieldByName(this.props.dataField, validatedTime);
    }

    this.setState({ value: validatedTime }, () => {
      inputEl.selectionStart = validatedCursorPosition;
      inputEl.selectionEnd = validatedCursorPosition;
      callback(event, validatedTime);
    });

    event.persist();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentDidMount() {
    if (this.props.dataSource) {
      this.props.dataSource.addEventListener(
        [
          dataSourceEvents.AFTER_CLOSE,
          dataSourceEvents.AFTER_OPEN,
          dataSourceEvents.AFTER_GOTO_PAGE,
          dataSourceEvents.AFTER_CANCEL,
          dataSourceEvents.AFTER_SCROLL,
        ],
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.DATA_FIELD_CHANGED,
        this.onDatasourceEvent,
        this.props.dataField
      );
    }
  }

  componentWillUnmount() {
    if (this.props.dataSource) {
      this.props.dataSource.removeEventListener(
        [
          dataSourceEvents.AFTER_CLOSE,
          dataSourceEvents.AFTER_OPEN,
          dataSourceEvents.AFTER_GOTO_PAGE,
          dataSourceEvents.AFTER_CANCEL,
          dataSourceEvents.AFTER_SCROLL,
        ],
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.DATA_FIELD_CHANGED,
        this.onDatasourceEvent,
        this.props.dataField
      );
    }
  }

  onClearValue() {
    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      this.props.dataSource.setFieldByName(this.props.dataField, undefined);
    }
    this.setState({ ...this.state, value: "" });
  }

  onDatasourceEvent(event, error) {
    let value = this.props.dataSource.fieldByName(this.props.dataField);
    if (!value) {
      value = "";
    }
    if (value !== this.state.value) {
      this.setState({
        ...this.state,
        value: value,
      });
    }
  }

  onButtonClick() {
    if (this.props.onButtonClick) {
      this.props.onButtonClick();
    }
  }

  render() {
    let {
      disabled,
      readOnly,
      onChange,
      style,
      showSeconds,
      input,
    } = this.props; //eslint-disable-line no-unused-vars
    const onChangeHandler = (event) =>
      this.onInputChange(event, (e, v) => onChange && onChange(e, v));
    let width = this.props.width;

    let newStyle = {
      height: "38px",
      padding: "3px",
      border: "1px solid rgb(204, 212, 219)",
      borderTopLeftRadius: "4px",
      borderBottomLeftRadius: "4px",
      width: width ? `calc(${width} - 38px)` : `calc(120px - 38px)`,
      ...style,
    };

    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() === "dsBrowse";
    }

    const colClasses = buildGridClassNames(this.props, false, []);
    if (colClasses.length > 0) {
      style.width = "calc(100% - 38px)";
      width = style.width;
    }

    if (this.props.id) {
      this.idEdit = this.props.id;
    }
    let className = AnterosUtils.buildClassNames(
      "input-group",
      this.props.className ? this.props.className : "",
      colClasses
    );

    let icon;
    if (this.props.icon) {
      icon = (
        <i
          data-user={this.props.dataUser}
          onClick={this.onButtonClick}
          className={this.props.icon}
          style={{ color: this.props.iconColor }}
        ></i>
      );
    }

    let classNameAddOn = AnterosUtils.buildClassNames(
      "input-group-addon",
      disabled || readOnly ? "disabled" : "",
      this.props.primary || this.props.fullPrimary ? "btn btn-primary" : "",
      this.props.success || this.props.fullSucces ? "btn btn-success" : "",
      this.props.info || this.props.fullInfo ? "btn btn-info" : "",
      this.props.danger || this.props.fullDanger ? "btn btn-danger" : "",
      this.props.warning || this.props.fullWarning ? "btn btn-warning" : "",
      this.props.secondary || this.props.fullSecondary
        ? "btn btn-secondary"
        : ""
    );

    let edit = (
      <input
        type="text"
        {...this.props}
        disabled={disabled}
        showSeconds={showSeconds}
        readOnly={readOnly}
        ref={this.dateRef}
        value={this.state.value}
        onChange={onChangeHandler}
        style={{ width: 120, ...newStyle }}
      />
    );

    if (input) {
      edit = React.cloneElement(input, {
        ...this.props,
        disabled,
        value: this.state.value,
        readOnly,
        showSeconds,
        newStyle,
        onChange: onChangeHandler,
      });
    }

    if (this.props.icon && colClasses.length > 0) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {edit}
          {this.props.clear ? (
            <i
              onClick={this.onClearValue}
              className={"far fa-times"}
              style={{
                cursor: "pointer",
                color: "#6565cd",
                position: "absolute",
                right: 64,
                top: 12,
              }}
            ></i>
          ) : null}
          <div
            className={classNameAddOn}
            style={{ margin: 0, width: "38px" }}
            onClick={this.onButtonClick}
          >
            <span>
              {icon}
              {this.props.image ? (
                <img
                  alt=" "
                  src={this.props.image}
                  onClick={this.onButtonClick}
                />
              ) : null}
            </span>
          </div>
        </div>
      );
    } else {
      if (colClasses.length > 0) {
        return (
          <div className={AnterosUtils.buildClassNames(colClasses)}>
            {edit}
            {this.props.clear ? (
              <i
                onClick={this.onClearValue}
                className={"far fa-times"}
                style={{
                  cursor: "pointer",
                  color: "#6565cd",
                  position: "absolute",
                  right: 48,
                  top: 12,
                }}
              ></i>
            ) : null}
          </div>
        );
      } else {
        return (
          <div
            className={className}
            style={{
              ...this.props.style,
              width: width,
              marginBottom: "4px",
              marginTop: "4px",
            }}
            ref={(ref) => (this.divInput = ref)}
          >
            {edit}
            {this.props.clear ? (
              <i
                onClick={this.onClearValue}
                className={"far fa-times"}
                style={{
                  cursor: "pointer",
                  color: "#6565cd",
                  position: "absolute",
                  right: 48,
                  top: 12,
                }}
              ></i>
            ) : null}
            <div
              className={classNameAddOn}
              style={{ margin: 0, width: "38px" }}
              onClick={this.onButtonClick}
            >
              <span>
                <i
                  onClick={this.onButtonClick}
                  className={this.props.icon ? this.props.icon : "fa fa-clock"}
                  style={{ color: this.props.iconColor }}
                ></i>
                {this.props.image ? (
                  <img
                    alt=" "
                    src={this.props.image}
                    onClick={this.onButtonClick}
                  />
                ) : null}
              </span>
            </div>
          </div>
        );
      }
    }
  }
}

function TimePickerTime(props) {
  const {
    prefixCls = "w-timepicker",
    className,
    precision = "second",
    ...other
  } = props;
  return (
    <div
      className={[prefixCls, className]
        .filter(Boolean)
        .join(" ")
        .trim()}
    >
      {/^(second|minute|hour)$/.test(precision) && (
        <TimePickerPanel type="Hours" count={24} {...other} />
      )}
      {/^(second|minute)$/.test(precision) && (
        <TimePickerPanel type="Minutes" count={60} {...other} />
      )}
      {/^(second)$/.test(precision) && (
        <TimePickerPanel type="Seconds" count={60} {...other} />
      )}
    </div>
  );
}

function CustomTimePicker(props) {
  let {
    prefixCls = "w-timepicker",
    disabled,
    readOnly,
    value,
    format = "HH:mm:ss",
    popoverProps,
    onChange,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabled,
    precision,
    style,
    primary = true,
    width = "120px",
    ...inputProps
  } = props;
  const [date, setDate] = useState(props.value);
  useEffect(() => setDate(props.value), [props.value]);
  const timeProps = {
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabled,
    precision,
  };
  const inputValue = date ? formatter(format, new Date(date)) : "";
  const datePickerTime = date || new Date();
  const _props = { ...inputProps, value: inputValue };
  const colClasses = buildGridClassNames(props, false, []);
  let newStyle = {
    height: "38px",
    padding: "3px",
    border: "1px solid rgb(204, 212, 219)",
    borderTopLeftRadius: "4px",
    borderBottomLeftRadius: "4px",
    width: width ? `calc(${width} - 38px)` : `calc(120px - 38px)`,
    ...style,
  };

  if (props.dataSource && !readOnly) {
    readOnly = props.dataSource.getState() === "dsBrowse";
  }

  if (colClasses.length > 0) {
    width = "";
    newStyle.width = `calc(100% - 38px)`;
  }

  let className = AnterosUtils.buildClassNames(
    "input-group",
    props.className ? props.className : "",
    colClasses
  );

  const onButtonClick = () => {
    if (props.onButtonClick) {
      props.onButtonClick();
    }
  };

  const onClearValue = () => {
    setDate(undefined);
    onChange && onChange("");
  };

  let icon;
  if (props.icon) {
    icon = (
      <i
        data-user={props.dataUser}
        onClick={onButtonClick}
        className={props.icon}
        style={{ color: props.iconColor }}
      ></i>
    );
  }

  let classNameAddOn = AnterosUtils.buildClassNames(
    "input-group-addon",
    disabled || readOnly ? "disabled" : "",
    primary || props.fullPrimary ? "btn btn-primary" : "",
    props.success || props.fullSucces ? "btn btn-success" : "",
    props.info || props.fullInfo ? "btn btn-info" : "",
    props.danger || props.fullDanger ? "btn btn-danger" : "",
    props.warning || props.fullWarning ? "btn btn-warning" : "",
    props.secondary || props.fullSecondary ? "btn btn-secondary" : ""
  );

  let edit = (
    <Popover
      trigger="focus"
      placement="bottomLeft"
      autoAdjustOverflow
      visibleArrow={false}
      {...popoverProps}
      content={
        <TimePickerTime
          className={`${prefixCls}-popover`}
          {...timeProps}
          date={datePickerTime}
          onSelected={(type, num, disableds, currentDate) => {
            setDate(new Date(currentDate));
            const dataStr = currentDate ? formatter(format, currentDate) : "";
            onChange && onChange(dataStr, currentDate, type, num, disableds);
          }}
        />
      }
    >
      <input
        placeholder=""
        readOnly
        disabled={disabled}
        {..._props}
        style={newStyle}
        className={[`${prefixCls}-input`]
          .filter(Boolean)
          .join(" ")
          .trim()}
      />
    </Popover>
  );

  if (props.icon && colClasses.length > 0) {
    return (
      <div className={className} style={{ ...props.style, width: width }}>
        {edit}
        {props.clear ? (
          <i
            onClick={onClearValue}
            className={"far fa-times"}
            style={{
              cursor: "pointer",
              color: "#6565cd",
              position: "absolute",
              right: 64,
              top: 12,
            }}
          ></i>
        ) : null}
        <div
          className={classNameAddOn}
          style={{ margin: 0, width: "38px" }}
          onClick={onButtonClick}
        >
          <span>
            {icon}
            {props.image ? (
              <img alt=" " src={props.image} onClick={onButtonClick} />
            ) : null}
          </span>
        </div>
      </div>
    );
  } else {
    if (colClasses.length > 0) {
      return (
        <div className={AnterosUtils.buildClassNames(colClasses)}>
          {edit}
          {props.clear ? (
            <i
              onClick={onClearValue}
              className={"far fa-times"}
              style={{
                cursor: "pointer",
                color: "#6565cd",
                position: "absolute",
                right: 48,
                top: 12,
              }}
            ></i>
          ) : null}
        </div>
      );
    } else {
      return (
        <div
          className={className}
          style={{
            ...props.style,
            width: width,
            marginBottom: "4px",
            marginTop: "4px",
          }}
        >
          {edit}
          {props.clear ? (
            <i
              onClick={onClearValue}
              className={"far fa-times"}
              style={{
                cursor: "pointer",
                color: "#6565cd",
                position: "absolute",
                right: 48,
                top: 12,
              }}
            ></i>
          ) : null}
          <div
            className={classNameAddOn}
            style={{ margin: 0, width: "38px" }}
            onClick={onButtonClick}
          >
            <span>
              <i
                onClick={onButtonClick}
                className={props.icon ? props.icon : "fa fa-clock"}
                style={{ color: props.iconColor }}
              ></i>
              {props.image ? (
                <img alt=" " src={props.image} onClick={onButtonClick} />
              ) : null}
            </span>
          </div>
        </div>
      );
    }
  }
}

CustomTimePicker.defaultProps = {
  icon: "fa fa-clock",
  width: "120px",
  clear: true,
};

class AnterosTimePicker extends Component {
  constructor(props) {
    super(props);
    let _value;
    if (this.props.dataSource) {
      let _value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!_value) {
        _value = "";
      } else {
        _value = moment(_value, "HH:mm:ss");
      }
    } else {
      _value = props.value;
    }
    this.state = { value: _value };
    autoBind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentDidMount() {
    if (this.props.dataSource) {
      this.props.dataSource.addEventListener(
        [
          dataSourceEvents.AFTER_CLOSE,
          dataSourceEvents.AFTER_OPEN,
          dataSourceEvents.AFTER_GOTO_PAGE,
          dataSourceEvents.AFTER_CANCEL,
          dataSourceEvents.AFTER_SCROLL,
        ],
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.DATA_FIELD_CHANGED,
        this.onDatasourceEvent,
        this.props.dataField
      );
    }
  }

  componentWillUnmount() {
    if (this.props.dataSource) {
      this.props.dataSource.removeEventListener(
        [
          dataSourceEvents.AFTER_CLOSE,
          dataSourceEvents.AFTER_OPEN,
          dataSourceEvents.AFTER_GOTO_PAGE,
          dataSourceEvents.AFTER_CANCEL,
          dataSourceEvents.AFTER_SCROLL,
        ],
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.DATA_FIELD_CHANGED,
        this.onDatasourceEvent,
        this.props.dataField
      );
    }
  }

  onDatasourceEvent(event, error) {
    let value = this.props.dataSource.fieldByName(this.props.dataField);
    if (!value) {
      value = "";
    } else {
      value = moment(value, "HH:mm:ss");
    }
    if (value !== this.state.value) {
      this.setState({
        ...this.state,
        value: value,
      });
    }
  }

  onChange(value) {
    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      this.props.dataSource.setFieldByName(this.props.dataField, value);
    } else {
      this.setState({ ...this.state, value });
    }
  }

  render() {
    return (
      <CustomTimePicker
        {...this.props}
        value={this.state.value}
        onChange={this.onChange}
      />
    );
  }
}

AnterosTimePicker.defaultProps = {
  disabled: false,
  readOnly: false,
  value: "",
  format: "HH:mm:ss",
  onChange: noop,
  disabledHours: false,
  disabledMinutes: false,
  disabledSeconds: false,
  primary: true,
  width: "120px",
};

class AnterosDateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.dateRef = React.createRef();
    this.state = { calendarOpened: false, value: props.value };
    autoBind(this);
  }

  onOpen() {
    this.setState({ ...this.state, calendarOpened: true });
  }

  onClose() {
    this.setState({ ...this.state, calendarOpened: false });
  }

  onButtonClick(event) {
    event.preventDefault();
    if (this.state.calendarOpened) {
      this.dateRef.current.closeCalendar();
    } else {
      this.dateRef.current.openCalendar();
    }
    this.setState({
      ...this.state,
      calendarOpened: !this.state.calendarOpened,
    });
  }

  componentWillReceiveProps(nextProps){
    this.setState({...this.state, value: nextProps.value});
  }

  onClearValue() {
    this.setState({...this.state, value: [], update:Math.random()},()=>{
      if (this.props.onChange){
        this.props.onChange([]);
      }
    });    
  }


  render() {
    const {
      readOnly,
      disabled,
      format,
      numberOfMonths,
      weekPicker,
      onlyMonthPicker,
      onChange,
      minDate,
      maxDate,
      onOpenPickNewDate,
      clear,
      style,
      width,
    } = this.props;
    let classNameAddOn = AnterosUtils.buildClassNames(
      "input-group-addon",
      disabled || readOnly ? "disabled" : "",
      this.props.primary || this.props.fullPrimary ? "btn btn-primary" : "",
      this.props.success || this.props.fullSucces ? "btn btn-success" : "",
      this.props.info || this.props.fullInfo ? "btn btn-info" : "",
      this.props.danger || this.props.fullDanger ? "btn btn-danger" : "",
      this.props.warning || this.props.fullWarning ? "btn btn-warning" : "",
      this.props.secondary || this.props.fullSecondary
        ? "btn btn-secondary"
        : ""
    );

    const colClasses = buildGridClassNames(this.props, false, []);

    let input = (
      <Fragment>
        <DatePicker
          onlyMonthPicker={onlyMonthPicker}
          weekPicker={weekPicker}
          numberOfMonths={numberOfMonths}
          weekDays={weekDays}
          months={months}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          hideOnScroll={true}
          value={this.state.value}
          onOpenPickNewDate={onOpenPickNewDate}
          portal={true}
          format={format}
          ref={this.dateRef}
          containerStyle={{
            width:
              colClasses.length > 0
                ? `calc(100% - 38px)`
                : `calc(${width} - 38px)`,
          }}
          style={{
            height: "38px",
            padding: "3px",
            border: "1px solid rgb(204, 212, 219)",
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
            width: `100%`,
            ...style,
          }}
          range={true}
          plugins={[<DatePanel header="Datas" />]}
        />
        <div
          className={classNameAddOn}
          style={{ margin: 0, width: "38px" }}
          onClick={this.onButtonClick}
        >
          <span>
            <i
              onClick={this.onButtonClick}
              className={
                this.props.icon ? this.props.icon : "fa fa-calendar-alt"
              }
              style={{ color: this.props.iconColor }}
            ></i>
            {this.props.image ? (
              <img
                alt=" "
                src={this.props.image}
                onClick={this.onButtonClick}
              />
            ) : null}
          </span>
        </div>
        {clear ? (
          <i
            onClick={this.onClearValue}
            className={"far fa-times"}
            style={{
              cursor: "pointer",
              color: "#6565cd",
              position: "absolute",
              right: 48,
              top: 12,
            }}
          ></i>
        ) : null}
      </Fragment>
    );

    if (this.props.id) {
      this.idEdit = this.props.id;
    }
    let className = AnterosUtils.buildClassNames(
      "input-group",
      this.props.className ? this.props.className : "",
      colClasses
    );

    let _width = this.props.width;
    if (colClasses.length > 0) {
      _width = "";
    }

    if (this.props.icon && colClasses.length > 0) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: _width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {input}
        </div>
      );
    } else {
      if (colClasses.length > 0) {
        return (
          <div className={AnterosUtils.buildClassNames(colClasses)}>
            {input}
          </div>
        );
      } else {
        return (
          <div
            className={className}
            style={{
              ...this.props.style,
              width: _width,
              marginBottom: "4px",
              marginTop: "4px",
            }}
            ref={(ref) => (this.divInput = ref)}
          >
            {input}
          </div>
        );
      }
    }
  }
}

AnterosDateRangePicker.propTypes = {
  weekPicker: PropTypes.bool.isRequired,
  onlyMonthPicker: PropTypes.bool.isRequired,
  onlyYearPicker: PropTypes.bool.isRequired,
  numberOfMonths: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.any,
  maxDate: PropTypes.any,
  width: PropTypes.any,
  format: PropTypes.string.isRequired,
  primary: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};

AnterosDateRangePicker.defaultProps = {
  weekPicker: false,
  onlyMonthPicker: false,
  onlyYearPicker: false,
  numberOfMonths: 2,
  onChange: noop,
  width: "250px",
  format: "DD/MM/YYYY",
  primary: true,
  icon: "fa fa-calendar-alt",
  onOpenPickNewDate: false,
  clear: true,
};

class AnterosDateTimeRangePicker extends Component {
  constructor(props) {
    super(props);
    this.dateRef = React.createRef();
    this.state = { calendarOpened: false };
    autoBind(this);
  }

  onOpen() {
    this.setState({ ...this.state, calendarOpened: true });
  }

  onClose() {
    this.setState({ ...this.state, calendarOpened: false });
  }

  onButtonClick(event) {
    event.preventDefault();
    if (this.state.calendarOpened) {
      this.dateRef.current.closeCalendar();
    } else {
      this.dateRef.current.openCalendar();
    }
    this.setState({
      ...this.state,
      calendarOpened: !this.state.calendarOpened,
    });
  }

  onClearValue() {
    this.setState({...this.state, value: [], update:Math.random()},()=>{
      if (this.props.onChange){
        this.props.onChange([]);
      }
    });    
  }

  render() {
    const {
      readOnly,
      disabled,
      format,
      numberOfMonths,
      weekPicker,
      onlyMonthPicker,
      onChange,
      minDate,
      maxDate,
      clear,
      onOpenPickNewDate,
      style,
      width,
    } = this.props;
    let classNameAddOn = AnterosUtils.buildClassNames(
      "input-group-addon",
      disabled || readOnly ? "disabled" : "",
      this.props.primary || this.props.fullPrimary ? "btn btn-primary" : "",
      this.props.success || this.props.fullSucces ? "btn btn-success" : "",
      this.props.info || this.props.fullInfo ? "btn btn-info" : "",
      this.props.danger || this.props.fullDanger ? "btn btn-danger" : "",
      this.props.warning || this.props.fullWarning ? "btn btn-warning" : "",
      this.props.secondary || this.props.fullSecondary
        ? "btn btn-secondary"
        : ""
    );

    const colClasses = buildGridClassNames(this.props, false, []);

    let input = (
      <Fragment>
        <DatePicker
          onlyMonthPicker={onlyMonthPicker}
          weekPicker={weekPicker}
          numberOfMonths={numberOfMonths}
          weekDays={weekDays}
          months={months}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          includeTime={true}
          hideOnScroll={true}
          onOpenPickNewDate={onOpenPickNewDate}
          portal={true}
          format={format}
          value={this.state.value}
          ref={this.dateRef}
          containerStyle={{
            width:
              colClasses.length > 0
                ? `calc(100% - 42px)`
                : `calc(${width} - 38px)`,
          }}
          style={{
            height: "38px",
            padding: "3px",
            border: "1px solid rgb(204, 212, 219)",
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
            width: `100%`,
            ...style,
          }}
          range={true}
          plugins={[<DatePanel header="Datas" />]}
        />
        <div
          className={classNameAddOn}
          style={{ margin: 0, width: "38px" }}
          onClick={this.onButtonClick}
        >
          <span>
            <i
              onClick={this.onButtonClick}
              className={
                this.props.icon ? this.props.icon : "fa fa-calendar-alt"
              }
              style={{ color: this.props.iconColor }}
            ></i>
            {this.props.image ? (
              <img
                alt=" "
                src={this.props.image}
                onClick={this.onButtonClick}
              />
            ) : null}
          </span>
        </div>
        {clear ? (
          <i
            onClick={this.onClearValue}
            className={"far fa-times"}
            style={{
              cursor: "pointer",
              color: "#6565cd",
              position: "absolute",
              right: 48,
              top: 12,
            }}
          ></i>
        ) : null}
      </Fragment>
    );

    if (this.props.id) {
      this.idEdit = this.props.id;
    }
    let className = AnterosUtils.buildClassNames(
      "input-group",
      this.props.className ? this.props.className : "",
      colClasses
    );

    let _width = this.props.width;
    if (colClasses.length > 0) {
      _width = "";
    }

    if (this.props.icon && colClasses.length > 0) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: _width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {input}
        </div>
      );
    } else {
      if (colClasses.length > 0) {
        return (
          <div className={AnterosUtils.buildClassNames(colClasses)}>
            {input}
          </div>
        );
      } else {
        return (
          <div
            className={className}
            style={{
              ...this.props.style,
              width: _width,
              marginBottom: "4px",
              marginTop: "4px",
            }}
            ref={(ref) => (this.divInput = ref)}
          >
            {input}
          </div>
        );
      }
    }
  }
}

AnterosDateTimeRangePicker.propTypes = {
  weekPicker: PropTypes.bool.isRequired,
  onlyMonthPicker: PropTypes.bool.isRequired,
  onlyYearPicker: PropTypes.bool.isRequired,
  numberOfMonths: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.any,
  maxDate: PropTypes.any,
  width: PropTypes.any,
  format: PropTypes.string.isRequired,
  primary: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};

AnterosDateTimeRangePicker.defaultProps = {
  weekPicker: false,
  onlyMonthPicker: false,
  onlyYearPicker: false,
  numberOfMonths: 2,
  onChange: noop,
  width: "250px",
  format: "DD/MM/YYYY HH:mm:ss",
  primary: true,
  icon: "fa fa-calendar-alt",
  onOpenPickNewDate: false,
  clear: true,
};

class AnterosDateMultiplePicker extends Component {
  constructor(props) {
    super(props);
    this.dateRef = React.createRef();
    this.state = { calendarOpened: false };
    autoBind(this);
  }

  onOpen() {
    this.setState({ ...this.state, calendarOpened: true });
  }

  onClose() {
    this.setState({ ...this.state, calendarOpened: false });
  }

  onButtonClick(event) {
    event.preventDefault();
    if (this.state.calendarOpened) {
      this.dateRef.current.closeCalendar();
    } else {
      this.dateRef.current.openCalendar();
    }
    this.setState({
      ...this.state,
      calendarOpened: !this.state.calendarOpened,
    });
  }

  onClearValue() {
    this.setState({...this.state, value: [], update:Math.random()},()=>{
      if (this.props.onChange){
        this.props.onChange([]);
      }
    });    
  }

  render() {
    const {
      readOnly,
      disabled,
      format,
      numberOfMonths,
      weekPicker,
      onlyMonthPicker,
      onChange,
      minDate,
      maxDate,
      clear,
      onOpenPickNewDate,
      style,
      width,
    } = this.props;
    let classNameAddOn = AnterosUtils.buildClassNames(
      "input-group-addon",
      disabled || readOnly ? "disabled" : "",
      this.props.primary || this.props.fullPrimary ? "btn btn-primary" : "",
      this.props.success || this.props.fullSucces ? "btn btn-success" : "",
      this.props.info || this.props.fullInfo ? "btn btn-info" : "",
      this.props.danger || this.props.fullDanger ? "btn btn-danger" : "",
      this.props.warning || this.props.fullWarning ? "btn btn-warning" : "",
      this.props.secondary || this.props.fullSecondary
        ? "btn btn-secondary"
        : ""
    );

    const colClasses = buildGridClassNames(this.props, false, []);

    let input = (
      <Fragment>
        <DatePicker
          onlyMonthPicker={onlyMonthPicker}
          weekPicker={weekPicker}
          numberOfMonths={numberOfMonths}
          weekDays={weekDays}
          months={months}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          multiple={true}
          onOpenPickNewDate={onOpenPickNewDate}
          hideOnScroll={true}
          portal={true}
          format={format}
          value={this.state.value}
          ref={this.dateRef}
          containerStyle={{
            width:
              colClasses.length > 0
                ? `calc(100% - 42px)`
                : `calc(${width} - 38px)`,
          }}
          style={{
            height: "38px",
            padding: "3px",
            border: "1px solid rgb(204, 212, 219)",
            borderTopLeftRadius: "6px",
            borderBottomLeftRadius: "6px",
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
            width: `100%`,
            ...style,
          }}
          plugins={[<DatePanel header="Datas" />]}
        />
        <div
          className={classNameAddOn}
          style={{ margin: 0, width: "38px" }}
          onClick={this.onButtonClick}
        >
          <span>
            <i
              onClick={this.onButtonClick}
              className={
                this.props.icon ? this.props.icon : "fa fa-calendar-alt"
              }
              style={{ color: this.props.iconColor }}
            ></i>
            {this.props.image ? (
              <img
                alt=" "
                src={this.props.image}
                onClick={this.onButtonClick}
              />
            ) : null}
          </span>
        </div>
        {clear ? (
          <i
            onClick={this.onClearValue}
            className={"far fa-times"}
            style={{
              cursor: "pointer",
              color: "#6565cd",
              position: "absolute",
              right: 48,
              top: 12,
            }}
          ></i>
        ) : null}
      </Fragment>
    );

    if (this.props.id) {
      this.idEdit = this.props.id;
    }
    let className = AnterosUtils.buildClassNames(
      "input-group",
      this.props.className ? this.props.className : "",
      colClasses
    );

    let _width = this.props.width;
    if (colClasses.length > 0) {
      _width = "";
    }

    if (this.props.icon && colClasses.length > 0) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: _width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {input}
        </div>
      );
    } else {
      if (colClasses.length > 0) {
        return (
          <div className={AnterosUtils.buildClassNames(colClasses)}>
            {input}
          </div>
        );
      } else {
        return (
          <div
            className={className}
            style={{
              ...this.props.style,
              width: _width,
              marginBottom: "4px",
              marginTop: "4px",
            }}
            ref={(ref) => (this.divInput = ref)}
          >
            {input}
          </div>
        );
      }
    }
  }
}

AnterosDateMultiplePicker.propTypes = {
  weekPicker: PropTypes.bool.isRequired,
  onlyMonthPicker: PropTypes.bool.isRequired,
  onlyYearPicker: PropTypes.bool.isRequired,
  numberOfMonths: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.any,
  maxDate: PropTypes.any,
  width: PropTypes.any,
  format: PropTypes.string.isRequired,
  primary: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};

AnterosDateMultiplePicker.defaultProps = {
  weekPicker: false,
  onlyMonthPicker: false,
  onlyYearPicker: false,
  numberOfMonths: 2,
  onChange: noop,
  width: "250px",
  format: "DD/MM/YYYY",
  primary: true,
  icon: "fa fa-calendar-alt",
  onOpenPickNewDate: false,
  clear: true
};

class AnterosDateTimeMultiplePicker extends Component {
  constructor(props) {
    super(props);
    this.dateRef = React.createRef();
    this.state = { calendarOpened: false };
    autoBind(this);
  }

  onOpen() {
    this.setState({ ...this.state, calendarOpened: true });
  }

  onClose() {
    this.setState({ ...this.state, calendarOpened: false });
  }

  onButtonClick(event) {
    event.preventDefault();
    if (this.state.calendarOpened) {
      this.dateRef.current.closeCalendar();
    } else {
      this.dateRef.current.openCalendar();
    }
    this.setState({
      ...this.state,
      calendarOpened: !this.state.calendarOpened,
    });
  }

  onClearValue() {
    this.setState({...this.state, value: [], update:Math.random()},()=>{
      if (this.props.onChange){
        this.props.onChange([]);
      }
    });    
  }

  render() {
    const {
      readOnly,
      disabled,
      format,
      numberOfMonths,
      weekPicker,
      onlyMonthPicker,
      onChange,
      minDate,
      maxDate,
      clear,
      onOpenPickNewDate,
      style,
      width,
    } = this.props;
    let classNameAddOn = AnterosUtils.buildClassNames(
      "input-group-addon",
      disabled || readOnly ? "disabled" : "",
      this.props.primary || this.props.fullPrimary ? "btn btn-primary" : "",
      this.props.success || this.props.fullSucces ? "btn btn-success" : "",
      this.props.info || this.props.fullInfo ? "btn btn-info" : "",
      this.props.danger || this.props.fullDanger ? "btn btn-danger" : "",
      this.props.warning || this.props.fullWarning ? "btn btn-warning" : "",
      this.props.secondary || this.props.fullSecondary
        ? "btn btn-secondary"
        : ""
    );

    const colClasses = buildGridClassNames(this.props, false, []);

    let input = (
      <Fragment>
        <DatePicker
          onlyMonthPicker={onlyMonthPicker}
          weekPicker={weekPicker}
          numberOfMonths={numberOfMonths}
          weekDays={weekDays}
          months={months}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          multiple={true}
          onOpenPickNewDate={onOpenPickNewDate}
          hideOnScroll={true}
          portal={true}
          format={format}
          ref={this.dateRef}
          value={this.state.value}
          containerStyle={{
            width:
              colClasses.length > 0
                ? `calc(100% - 42px)`
                : `calc(${width} - 38px)`,
          }}
          style={{
            height: "38px",
            padding: "3px",
            border: "1px solid rgb(204, 212, 219)",
            borderTopLeftRadius: "6px",
            borderBottomLeftRadius: "6px",
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
            width: `100%`,
            ...style,
          }}
          plugins={[<DatePanel header="Datas" />]}
        />
        <div
          className={classNameAddOn}
          style={{ margin: 0, width: "38px" }}
          onClick={this.onButtonClick}
        >
          <span>
            <i
              onClick={this.onButtonClick}
              className={
                this.props.icon ? this.props.icon : "fa fa-calendar-alt"
              }
              style={{ color: this.props.iconColor }}
            ></i>
            {this.props.image ? (
              <img
                alt=" "
                src={this.props.image}
                onClick={this.onButtonClick}
              />
            ) : null}
          </span>
        </div>
        {clear ? (
          <i
            onClick={this.onClearValue}
            className={"far fa-times"}
            style={{
              cursor: "pointer",
              color: "#6565cd",
              position: "absolute",
              right: 48,
              top: 12,
            }}
          ></i>
        ) : null}
      </Fragment>
    );

    if (this.props.id) {
      this.idEdit = this.props.id;
    }
    let className = AnterosUtils.buildClassNames(
      "input-group",
      this.props.className ? this.props.className : "",
      colClasses
    );

    let _width = this.props.width;
    if (colClasses.length > 0) {
      _width = "";
    }

    if (this.props.icon && colClasses.length > 0) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: _width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {input}
        </div>
      );
    } else {
      if (colClasses.length > 0) {
        return (
          <div className={AnterosUtils.buildClassNames(colClasses)}>
            {input}
          </div>
        );
      } else {
        return (
          <div
            className={className}
            style={{
              ...this.props.style,
              width: _width,
              marginBottom: "4px",
              marginTop: "4px",
            }}
            ref={(ref) => (this.divInput = ref)}
          >
            {input}
          </div>
        );
      }
    }
  }
}

AnterosDateMultiplePicker.propTypes = {
  weekPicker: PropTypes.bool.isRequired,
  onlyMonthPicker: PropTypes.bool.isRequired,
  onlyYearPicker: PropTypes.bool.isRequired,
  numberOfMonths: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.any,
  maxDate: PropTypes.any,
  width: PropTypes.any,
  format: PropTypes.string.isRequired,
  primary: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};

AnterosDateTimeMultiplePicker.defaultProps = {
  weekPicker: false,
  onlyMonthPicker: false,
  onlyYearPicker: false,
  numberOfMonths: 2,
  onChange: noop,
  width: "250px",
  format: "DD/MM/YYYY HH:mm:ss",
  primary: true,
  icon: "fa fa-calendar-alt",
  onOpenPickNewDate: false,
  clear: true
};

export {
  AnterosDatePicker,
  AnterosDateTimePicker,
  AnterosTimeInput,
  AnterosTimePicker,
  AnterosDateRangePicker,
  AnterosDateTimeRangePicker,
  AnterosDateMultiplePicker,
  AnterosDateTimeMultiplePicker
};
