import React, { Component, useState, useEffect } from "react";
import lodash from "lodash";
import {
  buildGridClassNames,
  columnProps,
} from "@anterostecnologia/anteros-react-layout";
import { AnterosUtils } from "@anterostecnologia/anteros-react-core";
import {
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
  dataSourceEvents,
} from "@anterostecnologia/anteros-react-datasource";
import PropTypes from "prop-types";

const Checkbox = (props) => {
  const {
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
    checkbox,
    className,
    checked,
    disabled,
    containerClassName,
    containerStyle,
    label,
    labelClassName,
    labelStyle,
    name,
    onChange,
    reference,
    right,
    size,
    style,
    value,
    icon,
    tabIndex,
    ...rest
  } = props;
  const [check, setCheck] = useState(checked);

  const toggle = (e) => {
    e.preventDefault();
    if (disabled) {
      return null;
    }
    setCheck(!check);
    onChange && onChange(!check);
  };

  useEffect(() => {
    setCheck(checked);
  }, [checked]);

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        ...containerStyle,
      }}
      className={containerClassName}
      onClick={(e) => toggle(e)}
    >
      {(right && label && (
        <span className={labelClassName} style={labelStyle}>
          {label}
        </span>
      )) ||
        null}
      {checkbox || (
        <span>
          <div
            style={{
              height: size,
              width: size,
              borderWidth: borderWidth,
              borderColor: borderColor,
              borderStyle: borderStyle,
              borderRadius: borderRadius,
              ...style,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: disabled ? "not-allowed" : "",
            }}
            tabIndex={tabIndex}
            // onKeyPress={(e) => (!disabled ? toggle(e) : null)}
            // toggle checkbox on press enter or space
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                toggle(e);
              }
            }}
            className={className}
          >
            {(check && icon) || null}
            <input
              {...rest}
              ref={reference}
              type="checkbox"
              name={name}
              checked={check}
              value={value}
              onChange={toggle}
              disabled={disabled}
              hidden
            />
          </div>
        </span>
      )}
      {(!right && label && (
        <span className={labelClassName} style={labelStyle}>
          {label}
        </span>
      )) ||
        null}
    </label>
  );
};
Checkbox.defaultProps = {
  borderColor: "#D7C629",
  borderStyle: "solid",
  borderWidth: 2,
  borderRadius: 5,
  checked: false,
  disabled: false,
  right: false,
  name: "",
  size: 18,
  style: {},
  className: "",
  labelStyle: { marginLeft: 5 },
  labelClassName: "",
  containerStyle: {},
  containerClassName: "",
  value: "",
  onChange: null,
  icon: (
    <div style={{ backgroundColor: "#D7C629", borderRadius: 5, padding: 5 }} />
  ),
};

class AnterosCheckbox extends Component {
  constructor(props) {
    super(props);
    this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.idCheckbox = lodash.uniqueId("check");

    if (this.props.dataSource) {
      let value = this.props.dataSource.fieldByName(this.props.dataField);
      if (value == undefined || value == null) {
        value = false;
      }
      this.state = { isChecked: value == this.props.valueChecked };
    } else {
      this.state = { isChecked: this.props.checked };
    }
    this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource) {
      let value = nextProps.dataSource.fieldByName(nextProps.dataField);
      if (value == undefined || value == null) {
        value = false;
      }
      this.setState({ isChecked: value == nextProps.valueChecked });
    } else {
      this.setState({ isChecked: nextProps.checked });
    }
  }

  componentDidMount() {
    if (this.props.dataSource) {
      this.props.dataSource.addEventListener(
        [
          dataSourceEvents.AFTER_CLOSE,
          dataSourceEvents.AFTER_OPEN,
          dataSourceEvents.AFTER_GOTO_PAGE,
          dataSourceEvents.AFTER_CANCEL,
          dataSourceEvents.AFTER_POST,
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
          dataSourceEvents.AFTER_POST,
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
    if (value == undefined || value == null) {
      value = false;
    }
    this.setState({ isChecked: value == this.props.valueChecked });
  }

  onClick(event) {
    if (this.props.readOnly) {
      event.preventDefault();
    }
  }

  toggleCheckboxChange(checked) {
    if (!this.props.readOnly) {
      if (
        this.props.dataSource &&
        this.props.dataSource.getState !== "dsBrowse"
      ) {
        let value = checked
          ? this.props.valueChecked
          : this.props.valueUnchecked;
        this.props.dataSource.setFieldByName(this.props.dataField, value);
      } else {
        this.setState({ isChecked: checked });
      }
      if (this.props.onCheckboxChange)
        this.props.onCheckboxChange(this.props.value, checked, this);
    }
  }

  render() {
    let readOnly = this.props.readOnly;
    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() == "dsBrowse";
    }

    const colClasses = buildGridClassNames(this.props, false, []);
    const { name, id, value, disabled, containerStyle, style } = this.props;
    const { isChecked } = this.state;

    return (
      <div
        className={AnterosUtils.buildClassNames(colClasses)}
        style={{
          width: this.props.width,
          height: this.props.height,
          ...containerStyle,
        }}
      >
        <Checkbox
          id={id}
          label={value}
          containerStyle={style}
		      icon={<i className="far fa-check"/>}
          disabled={disabled}
          onChange={(event) => this.toggleCheckboxChange(event)}
          onClick={this.onClick}
          checked={isChecked}
          borderColor="cornflowerblue"
        />
      </div>
    );
  }
}

AnterosCheckbox.propTypes = {
  dataSource: PropTypes.oneOfType([
    PropTypes.instanceOf(AnterosLocalDatasource),
    PropTypes.instanceOf(AnterosRemoteDatasource),
  ]),
  dataField: PropTypes.string,
  value: PropTypes.string.isRequired,
  valueChecked: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
  ]).isRequired,
  valueUnchecked: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
  ]).isRequired,
  onCheckboxChange: PropTypes.func,
  id: PropTypes.string,
  className: PropTypes.string,
  extraSmall: columnProps,
  small: columnProps,
  medium: columnProps,
  large: columnProps,
  extraLarge: columnProps,
  width: PropTypes.string,
  height: PropTypes.string,
  success: PropTypes.bool,
  info: PropTypes.bool,
  warning: PropTypes.bool,
  primary: PropTypes.bool,
  danger: PropTypes.bool,
  secondary: PropTypes.bool,
  default: PropTypes.bool,
  collapseContent: PropTypes.string,
  style: PropTypes.object,
  valueStyle: PropTypes.object,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  image: PropTypes.string,
  readOnly: PropTypes.bool,
  labelStyle: PropTypes.object,
};

AnterosCheckbox.defaultProps = {
  valueChecked: true,
  valueUnchecked: false,
  readOnly: false,
};

export default AnterosCheckbox;
