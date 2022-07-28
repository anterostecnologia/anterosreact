import { Component, Fragment } from "react";
import * as React from "react";
import lodash from "lodash";
import { If, Then, AnterosUtils } from "@anterostecnologia/anteros-react-core";
import {
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
  dataSourceEvents,
} from "@anterostecnologia/anteros-react-datasource";
import {
  buildGridClassNames,
  columnProps,
} from "@anterostecnologia/anteros-react-layout";
import PropTypes from "prop-types";
import zxcvbn from 'zxcvbn';
import generator from 'generate-password';

const strengthBarProps = {
  className: PropTypes.string,
  style: PropTypes.string,
  scoreWordClassName: PropTypes.string,
  scoreWordStyle: PropTypes.string,
  password: PropTypes.string,
  userInputs: PropTypes.array,
  barColors: PropTypes.arrayOf(PropTypes.string),
  scoreWords: PropTypes.arrayOf(PropTypes.string),
  minLength: PropTypes.number,
  shortScoreWord: PropTypes.string,
  onChangeScore: PropTypes.func,
};


export default class AnterosPassword extends React.Component {
  constructor(props) {
    super(props);
    this.idPassword = lodash.uniqueId("password");
    this.handleChange = this.handleChange.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    if (this.props.dataSource) {
      let value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!value) {
        value = "";
      }
      this.state = { value: value, reveal: this.props.reveal };
    } else {
      this.state = { value: this.props.value, reveal: this.props.reveal };
    }
    this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource) {
      let value = nextProps.dataSource.fieldByName(nextProps.dataField);
      if (!value) {
        value = "";
      }
      this.setState({ value: value, reveal: nextProps.reveal });
    } else {
      this.setState({ value: nextProps.value, reveal: nextProps.reveal });
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
    this.setState({ ...this.state, value: value });
  }

  handleChange(event) {
    this.onChangeValue(value);
    if (this.props.onChange) {
      this.props.onChange(event, event.target.value);
    }
  }

  onChangeValue(value){
    if (
      this.props.dataSource &&
      this.props.dataSource.getState !== "dsBrowse"
    ) {
      this.props.dataSource.setFieldByName(
        this.props.dataField,
        value
      );
    } else {
      this.setState({ ...this.state, value: value });
    }
  }

  handleCheckChange(event) {
    this.setState({ ...this.state, reveal: !this.state.reveal });
  }

  handleGeneratePassword(event){
    let password = generator.generate(this.props.generatePasswordOptions);
    this.onChangeValue(password);
  }

  render() {
    let readOnly = this.props.readOnly;
    if (this.props.dataSource && !readOnly) {
      readOnly = this.props.dataSource.getState() === "dsBrowse";
    }

    const colClasses = buildGridClassNames(this.props, false, []);

    let className = AnterosUtils.buildClassNames(
      "form-control",
      this.props.className ? this.props.className : "",
      this.props.inputGridSize ? " col-sm-" + this.props.inputGridSize : ""
    );

    if (this.props.id) {
      this.idPassword = this.props.id;
    }
    let classNameLabel = AnterosUtils.buildClassNames(
      "control-label",
      this.props.labelGridSize ? "col-sm-" + this.props.labelGridSize : ""
    );

    let edit = (
      <div>
        <If condition={this.props.label !== undefined}>
          <Then>
            <label className={classNameLabel}>{this.props.label}</label>
          </Then>
        </If>
        <div className="input-group" style={{ width: this.props.width }}>
          <input
            data-toggle="password"
            id={this.idPassword}
            data-placement="before"
            className={className}
            type={this.state.reveal ? "text" : "password"}
            disabled={this.props.disabled ? true : false}
            style={{ ...this.props.style }}
            maxLength={this.props.maxLength}
            minLength={this.props.minLength}
            value={this.state.value}
            placeholder={this.props.placeHolder}
            readOnly={readOnly}
            required={this.props.required}
            onChange={this.handleChange}
            onKeyDown={this.props.onKeyDown}
          />
          <div
            id="showPassword"
            className="input-group-addon"
            onClick={this.handleCheckChange.bind(this)}
          >
            <i
              className={this.state.checked ? "fa fa-eye-slash" : "fa fa-eye"}
            ></i>
          </div>
          {this.props.showGeneratePassword?<div
            id="generatePassword"
            className="input-group-addon"
            onClick={this.handleGeneratePassword.bind(this)}
          >
            <i
              className={this.state.checked ? "fa fa-eye-slash" : "fa fa-eye"}
            ></i>
          </div>:null}
        </div>
        {this.props.showStrengthBar?<AnterosPasswordStrength password={this.state.value} {...this.props.strengthBarProps}/>:null}
      </div>
    );

    if (colClasses.length > 0) {
      return (
        <div className={AnterosUtils.buildClassNames(colClasses)}>{edit}</div>
      );
    } else {
      return edit;
    }
  }
}

AnterosPassword.propTypes = {
  dataSource: PropTypes.oneOfType([
    PropTypes.instanceOf(AnterosLocalDatasource),
    PropTypes.instanceOf(AnterosRemoteDatasource),
  ]),
  dataField: PropTypes.string,
  value: PropTypes.string.isRequired,
  placeHolder: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  reveal: PropTypes.bool.isRequired,
  label: PropTypes.string,
  inputGridSize: PropTypes.number,
  labelGridSize: PropTypes.number,
  required: PropTypes.bool.isRequired,
  extraSmall: columnProps,
  small: columnProps,
  medium: columnProps,
  large: columnProps,
  extraLarge: columnProps,
  onKeyDown: PropTypes.func,
  showStrengthBar: PropTypes.bool.isRequired,
  strengthBarProps: strengthBarProps,
  showGeneratePassword: PropTypes.bool.isRequired,
  generatePasswordOptions: PropTypes.object.isRequired
};

AnterosPassword.defaultProps = {
  value: "",
  placeHolder: "",
  reveal: false,
  required: true,
  minLength: 4,
  showStrengthBar: false,
  onKeyDown: () => {},
  showGeneratePassword: false,
  generatePasswordOptions: {
    length: 8,
    uppercase: true,
    lowercase: true,
    numbers: true,
    exclude: '',
    symbols: false,
    excludeSimilarCharacters: false,
    strict: false
  }
};

const itemStyle = {
  flexBasis: 0,
  flexGrow: 1,
  position: "relative",
  maxWidth: "100%",
  width: "100%",
  height: 2,
};

const Item = ({ score, itemNum, barColors }) => {
  let bgColor = barColors[0];
  if (score >= itemNum) {
    bgColor = barColors[score];
  }

  return (
    <div
      style={{
        ...itemStyle,
        backgroundColor: bgColor,
      }}
    />
  );
};


const rootStyle = {
  position: 'relative',
};

const wrapStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '5px 0 0',
};

const spaceStyle = {
  width: 4,
};

const descStyle = {
  margin: '5px 0 0',
  color: '#898792',
  fontSize: 14,
  textAlign: 'right',
};

export class AnterosPasswordStrength extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0 };
  }

  componentDidMount() {
    this.setScore();
  }

  componentDidUpdate(prevProps) {
    const { password } = this.props;
    if (prevProps.password !== password) {
      this.setScore();
    }
  }

  setScore() {
    const { password, minLength, userInputs, onChangeScore } = this.props;
    let result = null;
    let score = 0;
    if (password.length >= minLength) {
      result = zxcvbn(password, userInputs);
      ({ score } = result);
    }
    this.setState(
      {
        score,
      },
      () => {
        if (onChangeScore) {
          onChangeScore(score);
        }
      }
    );
  }

  render() {
    const {
      className,
      style,
      scoreWordClassName,
      scoreWordStyle,
      password,
      barColors,
      scoreWords,
      minLength,
      shortScoreWord,
    } = this.props;
    const { score } = this.state;
    let newShortScoreWord = shortScoreWord;
    if (password.length >= minLength) {
      newShortScoreWord = scoreWords[score];
    }

    return (
      <div className={className} style={{ ...rootStyle, ...style }}>
        <div style={wrapStyle}>
          {[1, 2, 3, 4].map((el) => {
            return (
              <Fragment key={`password-strength-bar-item-${el}`}>
                {el > 1 && <div style={spaceStyle} />}
                <Item score={score} itemNum={el} barColors={barColors} />
              </Fragment>
            );
          })}
        </div>
        <p
          className={scoreWordClassName}
          style={{ ...descStyle, ...scoreWordStyle }}
        >
          {newShortScoreWord}
        </p>
      </div>
    );
  }
}

AnterosPasswordStrength.propTypes = strengthBarProps;

AnterosPasswordStrength.defaultProps = {
  className: undefined,
  style: undefined,
  scoreWordClassName: undefined,
  scoreWordStyle: undefined,
  password: "",
  userInputs: [],
  barColors: ["#ddd", "#ef4836", "#f6b44d", "#2b90ef", "#25c281"],
  scoreWords: ["fraca", "fraca", "ok", "boa", "forte"],
  minLength: 4,
  shortScoreWord: "curto demais",
  onChangeScore: undefined,
};
