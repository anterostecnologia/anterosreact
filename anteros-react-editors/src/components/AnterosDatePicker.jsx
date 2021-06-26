import * as React from "react";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as CX from "classnames";
import { boundClass } from "@anterostecnologia/anteros-react-core";
import * as localeData from "dayjs/plugin/localeData";
import * as localizedFormat from "dayjs/plugin/localizedFormat";
import * as weekday from "dayjs/plugin/weekday";
import * as classNames from "classnames";
import {
  buildGridClassNames,
  columnProps,
} from "@anterostecnologia/anteros-react-layout";
import {
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
  dataSourceEvents,
} from "@anterostecnologia/anteros-react-datasource";
import {
  AnterosUtils,
  AnterosDateUtils,
  autoBind,
} from "@anterostecnologia/anteros-react-core";
import PropTypes from "prop-types";

require("dayjs/locale/pt-br");

export const FieldType = {
  START: "START",
  END: "END",
};

export const TabValue = {
  DATE: "DATE",
  TIME: "TIME",
};

export const PickerDirection = {
  TOP: "TOP",
  BOTTOM: "BOTTOM",
};

export const ViewMode = {
  YEAR: "YEAR",
  MONTH: "MONTH",
  DAY: "DAY",
};

export const TimeType = {
  AM: "AM",
  PM: "PM",
};

export const range = (n1, n2) => {
  const result = [];
  let first = !n2 ? 0 : n1;
  let last = n2;

  if (!last) {
    last = n1;
  }

  while (first < last) {
    result.push(first);
    first += 1;
  }
  return result;
};

export const repeat = (el, n) => {
  return range(n).map(() => el);
};

export const lpad = (val, length, char = "0") =>
  val.length < length ? char.repeat(length - val.length) + val : val;

dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);

export const getMonthShort = (locale) => {
  dayjs.locale(locale);
  return range(0, 12).map((v) =>
    dayjs().localeData().monthsShort(dayjs().month(v))
  );
};

export const getWeekDays = (locale) => {
  dayjs.locale(locale);
  return range(7).map((v) =>
    dayjs().localeData().weekdaysShort(dayjs().weekday(v))
  );
};

export const getToday = (locale) => {
  return dayjs().locale(locale).format("LL");
};

export const ifExistCall = (func, ...args) => func && func(...args);

const convertPx = (value) => `${value}px`;

export const getDivPosition = (
  node,
  direction = PickerDirection.BOTTOM,
  height,
  distance = 5
) => {
  if (!node) return { left: "", top: "", bottom: "" };

  let top = 0;
  let left = 0;

  switch (direction) {
    case PickerDirection.BOTTOM:
      top = node.offsetTop + node.offsetHeight + distance;
      left = node.offsetLeft;
      break;
    case PickerDirection.TOP:
      top = node.offsetTop - height - distance;
      left = node.offsetLeft;
      break;
  }

  return {
    top: convertPx(top),
    left: convertPx(left),
  };
};

export const getDomHeight = (node) => {
  return node ? node.clientHeight : 0;
};

export const chunk = (arr, n) => {
  const result = [];
  let i = 0;
  while (i < arr.length / n) {
    result.push(arr.slice(i * n, i * n + n));
    i += 1;
  }

  return result;
};

export const getDayMatrix = (year, month) => {
  const date = dayjs().year(year).month(month);

  const startOfMonth = date.startOf("month").date();
  const endOfMonth = date.endOf("month").date();

  const startDay = date.startOf("month").day();
  const remain = (startDay + endOfMonth) % 7;

  return chunk(
    [
      ...repeat(" ", startDay),
      ...range(startOfMonth, endOfMonth + 1).map((v) => `${v}`),
      ...(7 - remain === 7 ? [] : repeat(" ", 7 - remain)),
    ],
    7
  );
};

export const getMonthMatrix = (locale) => {
  return chunk(getMonthShort(locale), 3);
};

export const getYearMatrix = (year) => {
  return chunk(
    range(year - 4, year + 5).map((v) => `${v}`),
    3
  );
};

export const isDayEqual = (day1, day2) => {
  if (!day1 || !day2) return false;
  return dayjs(day1).isSame(day2, "date");
};

export const isDayAfter = (day1, day2) => {
  return dayjs(day1).isAfter(day2, "date");
};

export const isDayBefore = (day1, day2) => {
  return dayjs(day1).isBefore(day2, "date");
};

export const isDayRange = (date, start, end) => {
  if (!start || !end) return false;

  return isDayAfter(date, start) && isDayBefore(date, end);
};

export const formatDate = (date, format) => {
  if (date === undefined) return "";
  return dayjs(date).format(format);
};

const IconBase = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size}
    height={props.size}
    fill={props.color}
    {...props}
    viewBox="0 0 24 24"
  >
    {props.children}
  </svg>
);

const CalendarIcon = (props) => (
  <IconBase {...props}>
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
    <path fill="none" d="M0 0h24v24H0z" />
  </IconBase>
);

const ClearIcon = (props) => (
  <IconBase {...props}>
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
  </IconBase>
);

const LeftArrowIcon = (props) => (
  <IconBase {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </IconBase>
);

const RightArrowIcon = (props) => (
  <IconBase {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </IconBase>
);

const TimeIcon = (props) => (
  <IconBase {...props}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </IconBase>
);

const UpIcon = (props) => (
  <IconBase {...props}>
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </IconBase>
);

const DownIcon = (props) => (
  <IconBase {...props}>
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    <path fill="none" d="M0 0h24v24H0V0z" />
  </IconBase>
);

export const DatePickerDefaults = {
  dateFormat: "DD/MM/YYYY",
  dateTimeFormat: "DD/MM/YYYY HH:mm A",
  dateFormatPlaceholder: "dd/mm/aaaa",
  dateTimeFormatPlaceholder: "dd/mm/aaaa hh:mm",
  timeFormat: "HH:mm A",
  locale: "pt-br",
};

const SVGIcon = (props) => {
  const iconMap = {
    calendar: CalendarIcon,
    clear: ClearIcon,
    time: TimeIcon,
    "left-arrow": LeftArrowIcon,
    "right-arrow": RightArrowIcon,
    down: DownIcon,
    up: UpIcon,
  };

  const Icon = iconMap[props.id];

  return <Icon className={`icon-${props.id}`} {...props} />;
};

SVGIcon.defaultProps = {
  size: "16",
  color: "currentColor",
};

const Backdrop = ({ invert, show, onClick }) => (
  <React.Fragment>
    {show && (
      <div
        onClick={onClick}
        className={classNames("date-backdrop", { invert })}
      />
    )}
  </React.Fragment>
);

const TableCell = ({ className, text, subText, onClick, onMouseOver }) => {
  return (
    <td
      onClick={() => ifExistCall(onClick, text)}
      onMouseOver={() => ifExistCall(onMouseOver, text)}
      className={className}
    >
      <div>{text}</div>
      {subText && <span className="sub__text">{subText}</span>}
    </td>
  );
};

const TableMatrixView = ({ className, matrix, cell, headers }) => {
  return (
    <table className={classNames("date-calendar__body--table", className)}>
      {headers && (
        <thead>
          <tr>
            {headers.map((v, i) => (
              <th key={i}>{v}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            {row.map((v, j) => cell(v, i * matrix[i].length + j))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

class AnterosDatePicker extends React.Component {
  constructor(props) {
    super(props);
    dayjs.extend(customParseFormat);
    const { initialDate, includeTime, showTimeOnly } = this.props;
    const selected = [];
    let date;

    if (initialDate) {
      date = initialDate;
      selected.push(date);
    }

    if (includeTime && showTimeOnly) {
      throw new Error("includeTime & showTimeOnly não podem ser usados juntos");
    }

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
        selected.push(date);
      }
      this.state = {
        date: date,
        selected,
        tabValue: TabValue.DATE,
        value: date ? formatDate(date, this.getDateFormat()) : "",
      };
    } else {
      this.state = {
        date,
        selected,
        tabValue: TabValue.DATE,
        value: formatDate(date, this.getDateFormat()),
      };
    }
    autoBind(this);
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
    if (this.state.date !== date) {
      this.setState({
        ...this.state,
        date,
        selected: [date],
        value: date ? formatDate(date, this.getDateFormat()) : "",
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
        date,
        selected: [date],
        value: date ? formatDate(date, this.getDateFormat()) : "",
      });
    } else {
      this.setState({
        date: nextProps.date,
        selected: [nextProps.date],
        value: nextProps.value,
      });
    }
  }

  getDateFormat() {
    const { dateFormat, includeTime, showTimeOnly } = this.props;

    if (!dateFormat) {
      if (includeTime) {
        return DatePickerDefaults.dateTimeFormat;
      }
      if (showTimeOnly) {
        return DatePickerDefaults.timeFormat;
      }
      return DatePickerDefaults.dateFormat;
    }
    return dateFormat;
  }

  handleDateChange(date) {
    const { onChange, includeTime } = this.props;
    if (!includeTime) {
      date = date.hour(0).minute(0).second(0);
    }
    const value = dayjs(date).format(this.getDateFormat());

    ifExistCall(onChange, date, value);

    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      if (!date && date.toDate() === 0) {
        this.props.dataSource.setFieldByName(this.props.dataField, undefined);
      } else {
        this.props.dataSource.setFieldByName(
          this.props.dataField,
          date.toDate()
        );
      }
    }

    this.setState({
      ...this.state,
      date,
      value: value,
      selected: [date],
    });
  }

  handleTimeChange(hour, minute) {
    const { onChange } = this.props;
    let date = this.state.date;
    let selected = this.state.selected;

    if (!date) {
      date = dayjs();
      selected = [date];
    }

    date = date.hour(hour).minute(minute);
    const value = date.format(this.getDateFormat());

    ifExistCall(onChange, date, value);

    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      if (!date && date.toDate() === 0) {
        this.props.dataSource.setFieldByName(this.props.dataField, undefined);
      } else {
        this.props.dataSource.setFieldByName(
          this.props.dataField,
          date.toDate()
        );
      }
    }

    this.setState({
      ...this.state,
      date,
      selected,
      value,
    });
  }

  handleInputChange(e) {
    const { onChange } = this.props;
    const value = e.currentTarget.value;

    ifExistCall(onChange, value, undefined);

    this.setState({
      ...this.state,
      value: e.currentTarget.value,
    });
  }

  handleInputClear() {
    const { onChange } = this.props;

    ifExistCall(onChange, "", undefined);

    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      this.props.dataSource.setFieldByName(this.props.dataField, undefined);
    }

    this.setState({
      ...this.state,
      value: "",
    });
  }

  handleInputBlur(e) {
    const { date } = this.state;
    const value = e.currentTarget.value;
    const parsedDate = dayjs(value, this.getDateFormat());
    let updateDate;

    updateDate = date;

    if (dayjs(parsedDate).isValid()) {
      updateDate = parsedDate;

      if (
        this.props.dataSource &&
        this.props.dataSource.getState !== "dsBrowse"
      ) {
        if (!updateDate && updateDate.toDate() === 0) {
          this.props.dataSource.setFieldByName(this.props.dataField, undefined);
        } else {
          this.props.dataSource.setFieldByName(
            this.props.dataField,
            updateDate.toDate()
          );
        }
      }
    }

    this.setState({
      ...this.state,
      date: updateDate,
      selected: [updateDate],
      value: updateDate ? updateDate.format(this.getDateFormat()) : "",
    });
  }

  renderInputComponent() {
    let {
      inputComponent,
      readOnly,
      disabled,
      clear,
      autoFocus,
      showDefaultIcon,
      placeholder,
    } = this.props;
    const { value } = this.state;
    let inputProps = {
      readOnly,
      autoFocus,
      disabled,
      clear,
      placeholder,
      onChange: this.handleInputChange,
      onClear: this.handleInputClear,
      onBlur: this.handleInputBlur,
      value: value,
      icon: showDefaultIcon ? <SVGIcon id="calendar" /> : undefined,
    };

    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() == "dsBrowse";
    }
    return inputComponent ? inputComponent({ ...inputProps, readOnly:readOnly }) : <AnterosPickerInput {...inputProps} readOnly={readOnly} />;
  }

  handleTab(val) {
    this.setState({
      ...this.state,
      tabValue: val,
    });
  }

  renderTabMenu() {
    const { tabValue } = this.state;

    const renderButton = (type, label, icon) => (
      <button
        className={CX({
          active: tabValue === type,
        })}
        onClick={() => this.handleTab(type)}
        type="button"
      >
        <SVGIcon id={icon} />
        {label}
      </button>
    );
    return (
      <div className="date-picker__container__tab">
        {renderButton(TabValue.DATE, "Data", "calendar")}
        {renderButton(TabValue.TIME, "Hora", "time")}
      </div>
    );
  }

  renderCalendar(actions) {
    const { selected, date } = this.state;
    return (
      <Calendar
        {...this.props}
        base={date}
        onChange={(e) => {
          this.handleDateChange(e);
          actions.hide();
        }}
        selected={selected}
      />
    );
  }

  renderTime() {
    const date = this.state.date || dayjs();

    return (
      <TimeContainer
        hour={date.hour()}
        minute={date.minute()}
        onChange={this.handleTimeChange}
      />
    );
  }

  renderContents(actions) {
    const { includeTime, showTimeOnly } = this.props;
    const { tabValue } = this.state;
    let component;

    component = (
      <div className="date-picker__container__calonly">
        {this.renderCalendar(actions)}
      </div>
    );

    if (showTimeOnly) {
      component = (
        <div className="date-picker__container__timeonly">
          {this.renderTime()}
        </div>
      );
    }

    if (includeTime) {
      component = (
        <div className="date-picker__container__include-time">
          {this.renderTabMenu()}
          {tabValue === TabValue.DATE
            ? this.renderCalendar(actions)
            : this.renderTime()}
        </div>
      );
    }
    return component;
  }

  render() {
    let { includeTime, portal, direction, disabled, readOnly } = this.props;

    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() == "dsBrowse";
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

    let classNameInput = AnterosUtils.buildClassNames(
      colClasses.length > 0 || this.context.withinInputGroup || icon
        ? "form-control"
        : "",
      this.props.fullPrimary ? "btn-primary" : "",
      this.props.fullSucces ? "btn-success" : "",
      this.props.fullInfo ? "btn-info" : "",
      this.props.fullDanger ? "btn-danger" : "",
      this.props.fullWarning ? "btn-warning" : "",
      this.props.fullSecondary ? "btn-secondary" : ""
    );

    let edit = <AnterosPicker
    portal={portal}
    direction={direction}
    readOnly={readOnly}
    disabled={disabled}
    className={CX({ include__time: includeTime })}
    renderTrigger={() => this.renderInputComponent()}
    renderContents={({ actions }) => this.renderContents(actions)}
  />;

    if (this.props.icon) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {edit}
          <div
            className={classNameAddOn}
            style={{ margin: 0 }}
            onClick={this.props.onButtonClick}
          >
            <span>
              {icon}
              <img src={this.props.image} onClick={this.props.onButtonClick} />
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
        return edit;
      }
    }
  }
}

AnterosDatePicker.contextTypes = {
  withinInputGroup: PropTypes.bool,
};

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
  readOnly: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};

AnterosDatePicker.defaultProps = {
  readOnly: false,
  icon: "fa fa-calendar",
  clear: true,
  primary: true,
  placeHolder: DatePickerDefaults.dateFormatPlaceholder,
  includeTime: false,
  showMonthCnt: 1,
  locale: DatePickerDefaults.locale,
  portal: false,
  showDefaultIcon: false,
};

class AnterosDateTimePicker extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    return <AnterosDatePicker {...this.props} includeTime />;
  }
}

AnterosDateTimePicker.propTypes = AnterosDatePicker.propTypes;
AnterosDateTimePicker.defaultProps = AnterosDatePicker.defaultProps;

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      base: props.base,
    };
    autoBind(this);
  }

  setBase(base) {
    this.setState({ base });
  }

  render() {
    const { showMonthCnt } = this.props;
    const { base } = this.state;

    return (
      <div className="date-calendar">
        <div className="date-calendar__list">
          {range(showMonthCnt).map((idx) => (
            <div className="date-calendar__item" key={idx}>
              <CalendarContainer
                {...this.props}
                base={this.state.base}
                current={dayjs(base).add(idx, "month")}
                prevIcon={idx === 0}
                nextIcon={idx === showMonthCnt - 1}
                setBase={this.setBase}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

Calendar.defaultProps = {
  base: dayjs(),
  showMonthCnt: 1,
  showToday: false,
};

const YEAR_VIEW_CLASS = "date-calendar__year";
const MONTH_VIEW_CLASS = "date-calendar__month";

const buildMatrixView = (matrix, className, onClick) => {
  return (
    <TableMatrixView
      matrix={matrix}
      cell={(value, key) => (
        <TableCell
          key={key}
          className={className}
          text={value}
          onClick={onClick(key, value)}
        />
      )}
    />
  );
};

class CalendarBody extends React.Component {
  static defaultProps = {
    viewMode: ViewMode.DAY,
    locale: DatePickerDefaults.locale,
  };
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    const { current, onClick, locale } = this.props;
    const viewMap = {
      [ViewMode.YEAR]: buildMatrixView(
        getYearMatrix(dayjs(current).year()),
        YEAR_VIEW_CLASS,
        (_, v) => () => onClick(v)
      ),
      [ViewMode.MONTH]: buildMatrixView(
        getMonthMatrix(locale),
        MONTH_VIEW_CLASS,
        (k, _) => () => onClick(String(k))
      ),
      [ViewMode.DAY]: <DayView {...this.props} />,
    };

    return (
      <div className="date-calendar__body">{viewMap[this.props.viewMode]}</div>
    );
  }
}

class CalendarContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: ViewMode.DAY,
    };
    autoBind(this);
  }

  getHeaderTitle() {
    const { current } = this.props;
    const year = dayjs(current).year();
    return {
      [ViewMode.YEAR]: `${year - 4} - ${year + 5}`,
      [ViewMode.MONTH]: `${year}`,
      [ViewMode.DAY]: dayjs(current).format("YYYY.MM"),
    }[this.state.viewMode];
  }

  handleTitleClick() {
    const { viewMode } = this.state;
    const { showMonthCnt } = this.props;
    let changedMode;

    if (viewMode === ViewMode.MONTH) {
      changedMode = ViewMode.YEAR;
    } else if (viewMode === ViewMode.DAY) {
      changedMode = ViewMode.MONTH;
    }
    this.setState({
      viewMode: showMonthCnt > 1 ? ViewMode.DAY : changedMode,
    });
  }

  handleChange(value) {
    const { viewMode } = this.state;
    const { current, onChange, setBase, showMonthCnt, base } = this.props;
    if (!value.trim()) return;
    if (showMonthCnt > 1) {
      const date = dayjs(current).date(parseInt(value, 10)).toDate();
      ifExistCall(onChange, date);
      return;
    }

    if (viewMode === ViewMode.YEAR) {
      setBase(dayjs(base).year(parseInt(value, 10)));
      this.setState({
        viewMode: ViewMode.MONTH,
      });
    } else if (viewMode === ViewMode.MONTH) {
      setBase(dayjs(base).month(parseInt(value, 10)));
      this.setState({
        viewMode: ViewMode.DAY,
      });
    } else {
      const date = dayjs(current).date(parseInt(value, 10));
      ifExistCall(onChange, date);
    }
  }

  handleBase(method) {
    const { base, setBase } = this.props;
    const { viewMode } = this.state;
    const date = dayjs(base);
    if (viewMode === ViewMode.YEAR) {
      setBase(date[method](10, "year"));
    } else if (viewMode === ViewMode.MONTH) {
      setBase(date[method](1, "year"));
    } else {
      setBase(date[method](1, "month"));
    }
  }

  handleToday() {
    const { setBase } = this.props;
    setBase(dayjs());
  }

  renderCalendarHead() {
    const { prevIcon, nextIcon } = this.props;
    return (
      <CalendarHead
        onPrev={() => this.handleBase("subtract")}
        onNext={() => this.handleBase("add")}
        prevIcon={prevIcon}
        nextIcon={nextIcon}
        onTitleClick={this.handleTitleClick}
        title={this.getHeaderTitle()}
      />
    );
  }

  renderTodayPane() {
    const { showToday, locale = DatePickerDefaults.locale } = this.props;
    return (
      <TodayPanel
        today={getToday(locale)}
        onClick={this.handleToday}
        show={showToday}
      />
    );
  }

  renderCalendarBody() {
    const {
      customDayClass,
      customDayText,
      disableDay,
      selected,
      startDay,
      endDay,
      onMouseOver,
      current,
      locale = DatePickerDefaults.locale,
    } = this.props;

    return (
      <CalendarBody
        viewMode={this.state.viewMode}
        current={current}
        selected={selected}
        startDay={startDay}
        endDay={endDay}
        disableDay={disableDay}
        onClick={this.handleChange}
        onMouseOver={onMouseOver}
        customDayClass={customDayClass}
        customDayText={customDayText}
        locale={locale}
      />
    );
  }

  render() {
    const { show, showToday } = this.props;
    const calendarClass = classNames("date-calendar__container", {
      "date-calendar--show": show,
    });

    return (
      <div className={calendarClass}>
        {this.renderCalendarHead()}
        {showToday && this.renderTodayPane()}
        {this.renderCalendarBody()}
      </div>
    );
  }
}

CalendarContainer.defaultProps = {
  current: dayjs(),
  show: true,
  showMonthCnt: 1,
  showToday: false,
  locale: DatePickerDefaults.locale,
};

const CalendarHead = ({
  onPrev,
  onNext,
  prevIcon,
  nextIcon,
  title,
  onTitleClick,
}) => {
  return (
    <div className="date-calendar__head">
      <div className="date-calendar__head--prev">
        {prevIcon && (
          <button
            onClick={onPrev}
            className="date-calendar__head--button"
            type="button"
          >
            <SVGIcon id="left-arrow" />
          </button>
        )}
      </div>
      <h2 className="date-calendar__head--title" onClick={onTitleClick}>
        {title}
      </h2>
      <div className="date-calendar__head--next">
        {nextIcon && (
          <button
            onClick={onNext}
            className="date-calendar__head--button"
            type="button"
          >
            <SVGIcon id="right-arrow" />
          </button>
        )}
      </div>
    </div>
  );
};

CalendarHead.defaultProps = { title: "" };

class DayView extends React.Component {
  static defaultProps = {
    locale: DatePickerDefaults.locale,
  };

  constructor(props) {
    super(props);
    autoBind(this);
  }

  getDayClass(date) {
    const {
      current,
      customDayClass,
      startDay,
      endDay,
      selected,
      disableDay,
    } = this.props;
    const currentDate = dayjs(current).date(parseInt(date, 10));

    let classArr = [];

    if (!date.trim()) {
      return "";
    }

    if (customDayClass !== undefined) {
      const customClass = customDayClass(currentDate);
      classArr = classArr.concat(
        typeof customClass === "string" ? [customClass] : customClass
      );
    }

    const dayClass = classNames(
      "date-calendar__day",
      `date-calendar__day--${dayjs(currentDate).day()}`,
      classArr,
      {
        "date-calendar__day--end": isDayEqual(currentDate, endDay),
        "date-calendar__day--range": isDayRange(currentDate, startDay, endDay),
        "date-calendar__day--selected": this.isIncludeDay(date, selected),
        "date-calendar__day--disabled": disableDay
          ? disableDay(currentDate)
          : false,
        "date-calendar__day--start": isDayEqual(currentDate, startDay),
        "date-calendar__day--today": isDayEqual(currentDate, dayjs()),
      }
    );

    return dayClass;
  }

  getCustomText(date) {
    const { current, customDayText } = this.props;
    const currentDate = dayjs(current).date(parseInt(date, 10));

    if (!date.trim()) {
      return "";
    }
    if (!customDayText) {
      return "";
    }

    return customDayText(currentDate);
  }

  isIncludeDay(date, dates) {
    const { current } = this.props;
    if (dates === undefined) {
      return false;
    }
    return dates.some((v) =>
      isDayEqual(dayjs(current).date(parseInt(date, 10)), v)
    );
  }

  handleClick(date) {
    const { current, disableDay } = this.props;
    const currentDate = dayjs(current).date(parseInt(date, 10));
    if (!(disableDay && disableDay(currentDate))) {
      ifExistCall(this.props.onClick, date);
    }
  }

  handleMouseOver(date) {
    const { onMouseOver, current } = this.props;
    ifExistCall(onMouseOver, dayjs(current).date(parseInt(date, 10)));
  }

  render() {
    const { current, locale } = this.props;

    const dayMatrix = getDayMatrix(
      dayjs(current).year(),
      dayjs(current).month()
    );
    const weekdays = getWeekDays(locale);

    return (
      <TableMatrixView
        headers={weekdays}
        matrix={dayMatrix}
        cell={(date, key) => (
          <TableCell
            className={this.getDayClass(date)}
            subText={this.getCustomText(date)}
            onClick={this.handleClick}
            onMouseOver={this.handleMouseOver}
            text={date}
            key={key}
          />
        )}
      />
    );
  }
}

class AnterosPicker extends React.Component {
  constructor(props) {
    super(props);
    this.triggerRef = React.createRef();
    this.contentsRef = React.createRef();
    this.state = {
        show: false,
        position: {
          left: "",
          top: "",
        },
      };
    autoBind(this);
  }

  showContents() {
    const { portal, disabled, readOnly } = this.props;
    if (disabled || readOnly) return;

    this.setState(
      {
        show: true,
      },
      () => {
        if (!portal) {
          this.setPosition();
        }
      }
    );
  }

  hideContents() {
    this.setState({
      show: false,
    });
  }

  setPosition() {
    const { direction } = this.props;
    this.setState({
      position: getDivPosition(
        this.triggerRef.current,
        direction,
        getDomHeight(this.contentsRef.current)
      ),
    });
  }

  render() {
    const { portal, className, renderTrigger, renderContents, readOnly, disabled } = this.props;
    const { show, position } = this.state;
    const actions = {
      show: this.showContents,
      hide: this.hideContents,
    };

    return (
      <div className="date-picker" readOnly={readOnly} disabled={disabled}>
        <div
          className="date-picker__trigger"
          onClick={this.showContents}
          ref={this.triggerRef}
        >
          {renderTrigger({ actions })}
        </div>
        {show && (
          <div
            className={CX("date-picker__container", { portal, className })}
            role="dialog"
            aria-modal="true"
            style={position}
            ref={this.contentsRef}
          >
            {renderContents({ actions })}
          </div>
        )}
        <Backdrop show={show} invert={portal} onClick={this.hideContents} />
      </div>
    );
  }
}

class AnterosPickerInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    autoBind(this);
  }

  componentDidMount() {
    const { current } = this.inputRef;
    const { autoFocus } = this.props;

    if (current && autoFocus) {
      current.focus();
    }
  }

  handleClear(e) {
    const { onClear } = this.props;
    if (onClear) onClear();
    e.stopPropagation();
  }

  renderInput = () => {
    const {
      readOnly = false,
      disabled = false,
      value = "",
      icon,
      onChange,
      onClick,
      onBlur,
      placeholder,
      paddingLeft,
    } = this.props;

    return (
      <input
        ref={this.inputRef}
        className="date-picker-input__text"
        type="text"
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        onChange={onChange}
        onClick={onClick}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          paddingLeft: icon ? "32px" : paddingLeft,
        }}
      />
    );
  };

  renderClear() {
    return (
      <span className="date-picker-input__clear" onClick={this.handleClear}>
        <SVGIcon id="clear" />
      </span>
    );
  }

  render() {
    const { clear, icon, className } = this.props;
    return (
      <div className={classNames("date-picker-input", className)}>
        {icon && <span className="date-picker-input__icon">{icon}</span>}
        {this.renderInput()}
        {clear && this.renderClear()}
      </div>
    );
  }
}

class AnterosDateRangePicker extends React.Component {
  constructor(props) {
    super(props);
    const { dateFormat, initialStartDate, initialEndDate } = props;
    const start = initialStartDate;
    const end = initialEndDate;

    this.state = {
      start,
      end,
      startValue: formatDate(start, dateFormat),
      endValue: formatDate(end, dateFormat),
    };
    autoBind(this);
  }

  handleDateChange(actions, date) {
    const { onChange, dateFormat } = this.props;
    const { start, end } = this.state;
    let startDate;
    let endDate;

    startDate = start;
    endDate = end;

    if (!start) {
      startDate = date;
    } else {
      if (end) {
        startDate = date;
        endDate = undefined;
      } else {
        if (!isDayBefore(date, start)) {
          endDate = date;
        } else {
          startDate = date;
        }
      }
    }

    ifExistCall(onChange, startDate, endDate);

    this.setState(
      {
        ...this.state,
        start: startDate,
        end: endDate,
        startValue: formatDate(startDate, dateFormat),
        endValue: formatDate(endDate, dateFormat),
      },
      () => {
        if (this.state.start && this.state.end) {
          actions.hide();
        }
      }
    );
  }

  handleInputChange(fieldType, value) {
    const key = fieldType === FieldType.START ? "startValue" : "endValue";
    this.setState({
      ...this.state,
      [key]: value,
    });
  }

  handleMouseOver(date) {
    this.setState({
      ...this.state,
      hoverDate: date,
    });
  }

  handleInputBlur(fieldType, value) {
    const { dateFormat } = this.props;
    const { start, end } = this.state;
    const parsedDate = dayjs(value, dateFormat);
    let startDate = start;
    let endDate = end;

    if (
      parsedDate.isValid() &&
      dateFormat &&
      dateFormat.length === value.length
    ) {
      if (fieldType === FieldType.END) {
        endDate = parsedDate;
      } else if (fieldType === FieldType.START) {
        startDate = parsedDate;
      }
    }

    if (startDate && endDate) {
      if (isDayBefore(endDate, startDate) || isDayAfter(startDate, endDate)) {
        let temp;
        temp = startDate;
        startDate = endDate;
        endDate = temp;
      }
    }

    this.setState({
      ...this.state,
      start: startDate,
      end: endDate,
      startValue: formatDate(startDate, dateFormat),
      endValue: formatDate(endDate, dateFormat),
    });
  }

  handleCalendarText(date) {
    const { startText, endText, customDayText } = this.props;
    const { start, end } = this.state;
    if (isDayEqual(start, date)) return startText;
    if (isDayEqual(end, date)) return endText;
    ifExistCall(customDayText, date);
    return "";
  }

  handleCalendarClass(date) {
    const { customDayClass } = this.props;
    const { start, end, hoverDate } = this.state;
    if (start && !end && hoverDate) {
      if (isDayRange(date, start, hoverDate)) {
        return "date-calendar__day--range";
      }
    }
    ifExistCall(customDayClass, date);
    return "";
  }

  handleInputClear(fieldType) {
    if (fieldType === FieldType.START) {
      this.setState({
        ...this.state,
        start: undefined,
        startValue: "",
      });
    } else if (fieldType === FieldType.END) {
      this.setState({
        ...this.state,
        end: undefined,
        endValue: "",
      });
    }
  }

  renderRangePickerInput() {
    let {
      startPlaceholder,
      endPlaceholder,
      readOnly,
      disabled,
      clear,
      onChange,
    } = this.props;
    const { startValue, endValue } = this.state;

    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() == "dsBrowse";
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

    let classNameInput = AnterosUtils.buildClassNames(
      colClasses.length > 0 || this.context.withinInputGroup || icon
        ? "form-control"
        : "",
      this.props.fullPrimary ? "btn-primary" : "",
      this.props.fullSucces ? "btn-success" : "",
      this.props.fullInfo ? "btn-info" : "",
      this.props.fullDanger ? "btn-danger" : "",
      this.props.fullWarning ? "btn-warning" : "",
      this.props.fullSecondary ? "btn-secondary" : ""
    );

    let edit = (
      <AnterosRangePickerInput
        startPlaceholder={startPlaceholder}
        readOnly={readOnly}
        disabled={disabled}
        clear={clear}
        endPlaceholder={endPlaceholder}
        startValue={startValue}
        endValue={endValue}
        onChange={this.handleInputChange}
        onBlur={this.handleInputBlur}
        onClear={this.handleInputClear}
      />
    );

    if (this.props.icon) {
      return (
        <div
          className={className}
          style={{ ...this.props.style, width: width }}
          ref={(ref) => (this.divInput = ref)}
        >
          {edit}
          <div
            className={classNameAddOn}
            style={{ margin: 0 }}
            onClick={this.props.onButtonClick}
          >
            <span>
              {icon}
              <img src={this.props.image} onClick={this.props.onButtonClick} />
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
        return edit;
      }
    }
  }

  renderCalendar(actions) {
    const { showMonthCnt, initialDate, wrapper } = this.props;
    const { start, end } = this.state;
    let component;

    const calendar = (
      <Calendar
        {...this.props}
        base={start || initialDate}
        startDay={start}
        endDay={end}
        showMonthCnt={showMonthCnt}
        onChange={(date) => this.handleDateChange(actions, date)}
        onMouseOver={this.handleMouseOver}
        customDayText={this.handleCalendarText}
        customDayClass={this.handleCalendarClass}
      />
    );

    component = calendar;

    if (wrapper) {
      component = wrapper(calendar);
    }

    return component;
  }

  render() {
    let { portal, direction, disabled, readOnly } = this.props;

    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() == "dsBrowse";
    }

    return (
      <AnterosPicker
        portal={portal}
        direction={direction}
        readOnly={readOnly}
        disabled={disabled}
        renderTrigger={() => this.renderRangePickerInput()}
        renderContents={({ actions }) => this.renderCalendar(actions)}
      />
    );
  }
}

AnterosDateRangePicker.contextTypes = {
  withinInputGroup: PropTypes.bool,
};

AnterosDateRangePicker.propTypes = {
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
  readOnly: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
};

AnterosDateRangePicker.defaultProps = {
  readOnly: false,
  icon: "fa fa-calendar",
  clear: true,
  primary: true,
  dateFormat: DatePickerDefaults.dateFormat,
  portal: false,
  initialDate: dayjs(),
  showMonthCnt: 2,
  startText: "",
  endText: "",
  placeHolder: DatePickerDefaults.dateFormat,
};

class AnterosTimePicker extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }
  render() {
    return (
      <AnterosDatePicker
        {...this.props}
        showTimeOnly
        icon="fa fa-clock"
      ></AnterosDatePicker>
    );
  }
}

AnterosTimePicker.propTypes = AnterosDatePicker.propTypes;
AnterosTimePicker.defaultProps = AnterosDatePicker.defaultProps;

class AnterosRangePickerInput extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  handleChange(fieldType, e) {
    ifExistCall(this.props.onChange, fieldType, e.currentTarget.value);
  }

  handleBlur(fieldType, e) {
    ifExistCall(this.props.onBlur, fieldType, e.currentTarget.value);
  }
  handleClick(fieldType) {
    ifExistCall(this.props.onClick, fieldType);
  }
  handleClear(fieldType) {
    ifExistCall(this.props.onClear, fieldType);
  }

  renderStartInput() {
    const { startValue, startPlaceholder } = this.props;
    return this.renderPickerInput(
      FieldType.START,
      startValue,
      startPlaceholder
    );
  }

  renderEndInput() {
    const { endValue, endPlaceholder } = this.props;
    return this.renderPickerInput(FieldType.END, endValue, endPlaceholder);
  }

  renderPickerInput(fieldType, value, placeholder) {
    const { readOnly, disabled, clear } = this.props;
    return (
      <AnterosPickerInput
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        clear={clear}
        className="date-range"
        onClear={(e) => this.handleClear(fieldType, e)}
        onClick={(e) => this.handleClick(fieldType, e)}
        onChange={(e) => this.handleChange(fieldType, e)}
        onBlur={(e) => this.handleBlur(fieldType, e)}
        placeholder={placeholder}
        paddingLeft="10px"
      />
    );
  }

  render() {
    return (
      <div className="date-range-picker-input">
        <span className="date-range-picker-input__start">
          {this.renderStartInput()}
        </span>
        <span className="date-range-picker-input__icon">
          <SVGIcon id="right-arrow" />
        </span>
        <span className="date-range-picker-input__end">
          {this.renderEndInput()}
        </span>
      </div>
    );
  }
}


class TimeContainer extends React.Component {
  
  constructor(props){
      super(props);
      this.state = {
        hour: this.props.hour || 0,
        minute: this.props.minute || 0,
      };
      autoBind(this);
  }

  handleChange(item, e) {
    const min = 0;
    const max = item === "hour" ? 23 : 59;
    let value = parseInt(e.currentTarget.value, 10);

    if (isNaN(value)) {
      value = 0;
    }

    if (max < value) {
      value = max;
    }

    if (min > value) {
      value = min;
    }

    this.setState(
      {
        ...this.state,
        [item]: value,
      },
      () => this.invokeOnChange()
    );
  }

  handleUp(item) {
    const max = item === "hour" ? 23 : 59;

    const value = this.state[item];

    this.setState(
      {
        ...this.state,
        [item]: Math.min(value + 1, max),
      },
      () => this.invokeOnChange()
    );
  }

  handleDown(item) {
    const min = 0;
    const value = this.state[item];
    this.setState(
      {
        ...this.state,
        [item]: Math.max(value - 1, min),
      },
      () => this.invokeOnChange()
    );
  }

  handleBlur() {
    const { onBlur } = this.props;
    const { hour, minute } = this.state;
    ifExistCall(onBlur, hour, minute);
  }

  invokeOnChange() {
    const { onChange } = this.props;
    const { hour, minute } = this.state;
    ifExistCall(onChange, hour, minute);
  }

  render() {
    const { hour, minute } = this.state;
    return (
      <div className="date-time__container">
        <AnterosTimeInput
          onUp={() => this.handleUp("hour")}
          onDown={() => this.handleDown("hour")}
          onChange={(event) => this.handleChange("hour", event)}
          onBlur={this.handleBlur}
          value={hour}
        />
        <div className="date-time__container__div">:</div>
        <AnterosTimeInput
          onUp={() => this.handleUp("minute")}
          onDown={() => this.handleDown("minute")}
          onChange={(event) => this.handleChange("minute", event)}
          onBlur={this.handleBlur}
          value={minute}
        />
      </div>
    );
  }
}

const AnterosTimeInput = ({ onUp, onDown, onChange, onBlur, value }) => {
  return (
    <div className="date-time-input">
      <div className="date-time-input__up">
        <button onClick={onUp} type="button">
          <SVGIcon id="up" />
        </button>
      </div>
      <div className="date-time-input__text">
        <input type="text" value={value} onChange={onChange} onBlur={onBlur} />
      </div>
      <div className="date-time-input__down">
        <button onClick={onDown} type="button">
          <SVGIcon id="down" />
        </button>
      </div>
    </div>
  );
};

AnterosTimeInput.defaultProps = {
  value: 0,
};

const TodayPanel = ({ today, show, onClick }) => (
  <div
    className={classNames("date-calendar__panel--today", {
      "date-calendar__panel--show": show,
    })}
  >
    <h2 onClick={onClick}>{today}</h2>
  </div>
);

export {
  AnterosDatePicker,
  AnterosDateRangePicker,
  AnterosDateTimePicker,
  AnterosTimePicker,
};
