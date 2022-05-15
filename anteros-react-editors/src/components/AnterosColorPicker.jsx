import React, { Component, useState, useEffect } from "react";
import lodash from "lodash";
import { AnterosUtils } from "@anterostecnologia/anteros-react-core";
import {
  buildGridClassNames,
  columnProps,
} from "@anterostecnologia/anteros-react-layout";
import {
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
  dataSourceEvents,
} from "@anterostecnologia/anteros-react-datasource";
import PropTypes from "prop-types";
import Popover from "@uiw/react-popover";
import { parseColor } from "./AnterosColorUtils";
import {
  SketchPicker,
  AlphaPicker,
  BlockPicker,
  ChromePicker,
  CirclePicker,
  CompactPicker,
  GithubPicker,
  HuePicker,
  MaterialPicker,
  PhotoshopPicker,
  SliderPicker,
  SwatchesPicker,
  TwitterPicker,
} from "react-color";

const AnterosInputColor = ({
  initialValue,
  onChange,
  placement,
  disabled,
  colorType,
  readOnly=false,
  trigger,
  ...props
}) => {
  const [color, setColor] = useState(parseColor(initialValue));

  useEffect(() => {
    changeColor(parseColor(initialValue));
  }, [initialValue]);

  function changeColor(color) {
    if (onChange && !readOnly) {
      setColor(color);
      onChange(color.hex);
    }
  }

  let ColorComponentTag;
  switch (colorType) {
    case "slider":
      ColorComponentTag = SliderPicker;
      break;
    case "alpha":
      ColorComponentTag = AlphaPicker;
      break;
    case "block":
      ColorComponentTag = BlockPicker;
      break;
    case "chrome":
      ColorComponentTag = ChromePicker;
      break;
    case "circle":
      ColorComponentTag = CirclePicker;
      break;
    case "compact":
      ColorComponentTag = CompactPicker;
      break;
    case "github":
      ColorComponentTag = GithubPicker;
      break;
    case "hue":
      ColorComponentTag = HuePicker;
      break;
    case "material":
      ColorComponentTag = MaterialPicker;
      break;
    case "photoshop":
      ColorComponentTag = PhotoshopPicker;
      break;
    case "sketch":
      ColorComponentTag = SketchPicker;
      break;
    case "swatches":
      ColorComponentTag = SwatchesPicker;
      break;
    case "twitter":
      ColorComponentTag = TwitterPicker;
      break;

    default:
      break;
  }

  return (
    <Popover
      placement={placement}
      trigger={trigger}
      content={
        <ColorComponentTag
          color={color}
          onChange={changeColor}
          disabled={disabled}
        />
      }
    >
      <span
        {...props}
        style={{
          position: "relative",
          display: "inline-block",
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          padding: "2px",
          backgroundColor: "#ffffff",
          border: "1px solid #bebebe",
          borderRadius: "3px",
          userSelect: "none",
        }}
      >
        <span
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            cursor: "pointer",
            backgroundColor: color.rgb,
          }}
        />
      </span>
    </Popover>
  );
};

AnterosInputColor.propTypes = {
  colorType: PropTypes.oneOf([
    "alpha",
    "block",
    "chrome",
    "circle",
    "compact",
    "github",
    "hue",
    "material",
    "photoshop",
    "sketch",
    "swatches",
    "twitter",
  ]),
};

AnterosInputColor.defaultProps = {
  trigger: "click",
  colorType: "swatches",
  placement: "bottomRight",
  disabled: false,
};

export default class AnterosColorPicker extends Component {
  constructor(props) {
    super(props);
    this.idColorPicker = lodash.uniqueId("colorPicker");
    this.handleChange = this.handleChange.bind(this);
    if (this.props.dataSource) {
      let value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!value) {
        value = "";
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
        value = "";
      }
      this.setState({ value: value });
    } else {
      this.setState({ value: nextProps.value });
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

  handleChange(color) {
    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      this.props.dataSource.setFieldByName(this.props.dataField, color);
    } else {
      this.setState({ value: color });
    }
    if (this.props.onChange) {
      this.props.onChange(color);
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
    this.setState({ value: value });
  }


  render() {
    let {readOnly,disabled} = this.props;
    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() === "dsBrowse";
    }
    const colClasses = buildGridClassNames(this.props, false, []);
    let className = AnterosUtils.buildClassNames(
      "input-group colorpicker-component colorpicker-element",
      this.props.className ? this.props.className : "",
      colClasses
    );

    if (this.props.id) {
      this.idColorPicker = this.props.id;
    }
    return (
      <div
        id={this.idColorPicker}
        className={className}
        ref={(ref) => (this.divInput = ref)}
        style={{ ...this.props.style, width: this.props.width }}
      >
        <div  className="form-control" ref={(ref) => (this.input = ref)}>
            <AnterosInputColor colorType={this.props.colorType} 
            readOnly={readOnly || disabled} initialValue={this.state.value} onChange={this.handleChange}/>
        </div> 
      </div>
    );
  }
}

AnterosColorPicker.propTypes = {
  dataSource: PropTypes.oneOfType([
    PropTypes.instanceOf(AnterosLocalDatasource),
    PropTypes.instanceOf(AnterosRemoteDatasource),
  ]),
  dataField: PropTypes.string,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  extraSmall: columnProps,
  small: columnProps,
  medium: columnProps,
  large: columnProps,
  extraLarge: columnProps,
  onChange: PropTypes.func,
  colorType: PropTypes.oneOf([
    "alpha",
    "block",
    "chrome",
    "circle",
    "compact",
    "github",
    "hue",
    "material",
    "photoshop",
    "sketch",
    "swatches",
    "twitter",
  ]),
};

AnterosColorPicker.defaultProps = {
  value: "",
  colorType: 'sketch',
  disabled: false,
  readOnly: false
};
