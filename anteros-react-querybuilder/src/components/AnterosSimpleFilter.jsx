import React, { Fragment } from "react";
import PropTypes from "prop-types";
import uniqueId from "uuid/v4";
import {
  AnterosLabel,
  AnterosText,
} from "@anterostecnologia/anteros-react-label";
import {
  AnterosCombobox,
  AnterosComboboxOption,
  AnterosDatePicker,
  AnterosDateTimePicker,
  AnterosDateRangePicker,
  AnterosDateTimeRangePicker,
  AnterosDateMultiplePicker,
  AnterosDateTimeMultiplePicker,
  AnterosEdit,
  AnterosTimePicker
} from "@anterostecnologia/anteros-react-editors";
import {
  AnterosStringUtils,
  autoBind,
} from "@anterostecnologia/anteros-react-core";
import {
  AnterosButton,
} from "@anterostecnologia/anteros-react-buttons";
import { AnterosList } from "@anterostecnologia/anteros-react-list";
import { CustomSortItem } from "./AnterosAdvancedFilter";
import { dataSourceEvents } from "@anterostecnologia/anteros-react-datasource";
import {
  AnterosRow,
  AnterosCol,
} from "@anterostecnologia/anteros-react-layout";
import {
  AnterosAccordion,
  AnterosAccordionItem,
} from "@anterostecnologia/anteros-react-menu";
import {
  getDefaultEmptyFilter,
  defaultConditions,
  defaultOperators,
} from "./AnterosFilterCommons";

const DATASOURCE_EVENTS = [
  dataSourceEvents.AFTER_CLOSE,
  dataSourceEvents.AFTER_CANCEL,
  dataSourceEvents.AFTER_POST,
  dataSourceEvents.AFTER_EDIT,
  dataSourceEvents.AFTER_INSERT,
  dataSourceEvents.AFTER_OPEN,
  dataSourceEvents.AFTER_SCROLL,
  dataSourceEvents.AFTER_GOTO_PAGE,
  dataSourceEvents.AFTER_DELETE,
];


class AnterosSimpleFilter extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    let schema = this.createSchema();
    let currentFilter = props.currentFilter
      ? props.currentFilter
      : getDefaultEmptyFilter();
    let simpleFields = this.createFilterFields(props, schema, currentFilter);
    this.state = { simpleFields, currentFilter, schema };
  }

  componentWillReceiveProps(nextProps) {
    let schema = this.createSchema();
    let currentFilter = nextProps.currentFilter
      ? nextProps.currentFilter
      : getDefaultEmptyFilter();
    let simpleFields = this.createFilterFields(
      nextProps,
      schema,
      currentFilter
    );
    this.setState({
      ...this.state,
      simpleFields,
      currentFilter,
      schema,
    });
  }

  createSchema() {
    const { operators, conditions, fields } = this.props;
    return {
      fields: fields,
      operators,
      conditions,
      onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
      getLevel: this.getLevel.bind(this),
      isRuleGroup: this.isRuleGroup.bind(this),
      getOperators: (...args) => this.getOperators(...args),
    };
  }

  getDataType(field, fields) {
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].name === field) {
        return fields[i].dataType;
      }
    }
  }

  getSelectedSort() {
    let result = [];
    this.state.currentFilter.sort.sortFields.forEach(function(item) {
      if (item.selected) {
        result.push({ name: item.name, asc_desc: item.asc_desc });
      }
    });
    return result;
  }

  getSortItem(field) {
    let result;
    this.state.currentFilter.sort.sortFields.forEach(function(item) {
      if (item.name === field) {
        result = item;
      }
    });
    return result;
  }

  getSortItemByOrder(order) {
    let result;
    this.state.currentFilter.sort.sortFields.forEach(function(item) {
      if (item.order === order) {
        result = item;
      }
    });
    return result;
  }

  onChangeSortItem(field, selected, order, asc_desc) {
    let item = this.getSortItem(field);
    Object.assign(item, {
      selected: selected,
      order: order,
      asc_desc: asc_desc,
      label: item.label,
    });
    let sortFields = this.state.currentFilter.sort.sortFields;
    sortFields = sortFields.sort(function(a, b) {
      return a.order - b.order;
    });
    let currentFilter = this.state.currentFilter;
    currentFilter.sort.sortFields = sortFields;
    this.setState({
      ...this.state,
      update: Math.random(),
      currentFilter,
    });

    this.propagateFilterChanged();
  }

  propagateFilterChanged() {
    const { onFilterChanged } = this.props;
    if (onFilterChanged) {
      onFilterChanged(this.state.currentFilter);
    }
  }

  onSortDown(event) {
    let _this = this;
    let activeIndex = this.state.currentFilter.sort.activeIndex;
    if (activeIndex >= 0) {
      let item = this.state.currentFilter.sort.sortFields[activeIndex];
      if (item.order < this.state.currentFilter.sort.sortFields.length - 1) {
        activeIndex = item.order + 1;
        let nextItem = this.getSortItemByOrder(item.order + 1);
        Object.assign(item, {
          order: item.order + 1,
        });
        Object.assign(nextItem, {
          order: nextItem.order - 1,
        });
      }
      let sortFields = this.state.currentFilter.sort.sortFields;
      sortFields = sortFields.sort(function(a, b) {
        return a.order - b.order;
      });
      let currentFilter = this.state.currentFilter;
      currentFilter.sort.sortFields = sortFields;
      currentFilter.sort.activeIndex = activeIndex;
      this.setState(
        {
          ...this.state,
          currentFilter,
        },
        () => {
          _this.propagateFilterChanged();
        }
      );
    }
  }

  onSortUp(event) {
    let _this = this;
    let { currentFilter } = this.state;
    let activeIndex = currentFilter.sort.activeIndex;
    if (activeIndex >= 0) {
      let item = currentFilter.sort.sortFields[activeIndex];
      if (item.order > 0) {
        activeIndex = item.order - 1;
        let previousItem = this.getSortItemByOrder(item.order - 1);
        Object.assign(item, {
          order: item.order - 1,
        });
        Object.assign(previousItem, {
          order: previousItem.order + 1,
        });
      }
      let sortFields = currentFilter.sort.sortFields;
      sortFields = sortFields.sort(function(a, b) {
        return a.order - b.order;
      });
      currentFilter.sort.sortFields = sortFields;
      currentFilter.sort.activeIndex = activeIndex;
      this.setState(
        {
          ...this.state,
          currentFilter,
        },
        () => {
          _this.propagateFilterChanged();
        }
      );
    }
  }

  isRuleGroup(rule) {
    return !!(rule.condition && rule.rules);
  }

  getField(name) {
    let result;
    this.props.fields.forEach(function(field) {
      if (field.name === name) {
        result = field;
      }
    }, this);
    return result;
  }

  getOperators(field) {
    let fld = this.getField(field);
    let oprs = [];
    this.props.operators.forEach(function(op) {
      if (op.dataTypes.indexOf(fld.dataType) >= 0) {
        oprs.push(op);
      }
    }, this);

    return oprs;
  }

  onPropChange(prop, value, ruleId) {
    let currentFilter = this.state.currentFilter;
    const rule = this._findRule(ruleId, currentFilter.filter);
    if (prop === "not") {
      prop = "condition";
      if (rule.condition.indexOf("and") >= 0) {
        value = AnterosStringUtils.ltrim(value + " and");
      } else {
        value = AnterosStringUtils.ltrim(value + " or");
      }
    } else if (prop === "condition") {
      if (rule.condition.indexOf("not") >= 0) {
        value = "not " + value;
      }
    }
    Object.assign(rule, { [prop]: value });
    this.setState({ ...this.state, currentFilter });
  }

  getLevel(id) {
    return this._getLevel(id, 0, this.state.currentFilter.filter);
  }

  _getLevel(id, index, root) {
    const { isRuleGroup } = this.state.schema;

    var foundAtIndex = -1;
    if (root.id === id) {
      foundAtIndex = index;
    } else if (isRuleGroup(root)) {
      root.rules.forEach((rule) => {
        if (foundAtIndex === -1) {
          var indexForRule = index;
          if (isRuleGroup(rule)) indexForRule++;
          foundAtIndex = this._getLevel(id, indexForRule, rule);
        }
      });
    }
    return foundAtIndex;
  }

  _findRule(id, parent) {
    if (parent.id === id) {
      return parent;
    }

    for (const rule of parent.rules) {
      if (rule.id === id) {
        return rule;
      }
    }
  }

  _notifyQueryChange(fn, ...args) {
    if (fn) {
      fn.call(this, ...args);
    }
    const { onFilterChanged } = this.props;
    if (onFilterChanged) {
      onFilterChanged(this.state.currentFilter);
    }
  }

  onSelectListItem(index, item) {
    let currentFilter = this.state.currentFilter;
    currentFilter.sort.activeIndex = index;
    this.setState({ ...this.state, currentFilter });
    if (this.props.onFilterChanged) {
      this.props.onFilterChanged(currentFilter);
    }
  }

  onOperatorChanged(rule, value) {
    this.onElementChanged("operator", value, rule.id);
    this.onElementChanged("value", "", rule.id);
    this.onElementChanged("value2", "", rule.id);
  }

  onValueChanged(rule, value) {
    const { field, operator } = rule;
    const {
      schema: { fields },
    } = this.state;
    let dt = this.getDataType(field, fields);
    if (
      operator === "between" &&
      (dt === "date" || dt === "date_time" || dt === "time")
    ) {
      if (value.length > 1) {
        this.onElementChanged("value", value[0].toString(), rule.id);
        this.onElementChanged("value2", value[1].toString(), rule.id);
      } else {
        this.onElementChanged("value", "", rule.id);
        this.onElementChanged("value2", "", rule.id);
      }
    } else if ((operator === "inList" || operator === "notInList") &&
      (dt === "date" || dt === "date_time" || dt === "time")) {
        if (!value) {
          value = "";
        }
        this.onElementChanged("value", value, rule.id);
    } else if (operator === "inList" || operator === "notInList") {
      if (!value) {
           value = "";
      }
      let values = value.split(",");
      if (values.length > 0) {
        let appendDelimiter = false;
        let result = "";
        values.forEach((v) => {
          if (appendDelimiter) {
            result += ",";
          }
          if (dt === "number" || dt === "integer") {
            result += v;
          } else {
            result += "'" + v + "'";
          }
          appendDelimiter = true;
        });
        this.onElementChanged("value", result, rule.id);
      }
    } else {
      this.onElementChanged("value", value, rule.id);
    }
  }

  onValue2Changed(rule, value) {
    this.onElementChanged("value2", value, rule.id);
  }

  onElementChanged(property, value, id) {
    const {
      schema: { onPropChange },
    } = this.state;
    onPropChange(property, value, id);
  }

  getFieldValues(field, fields) {
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].name === field) {
        return fields[i].listValues;
      }
    }
  }

  getSortString(currentFilter) {
    let result = [];
    let appendDelimiter = false;
    currentFilter.sort.sortFields.forEach((field) => {
      if (field.selected) {
        if (appendDelimiter) {
          result += ", ";
        }
        result =
          result +
          field.label +
          "(" +
          (field.asc_desc === "asc" ? "A" : "D") +
          ")";
        appendDelimiter = true;
      }
    });
    return result;
  }

  createFilterFields(props, schema, currentFilter) {
    const { operators } = schema;
    let _this = this;
    let result = [];
    let arrChildren = props.fields;
    arrChildren.forEach(function(child, index) {
      let listValues = _this.getFieldValues(child, props.fields);
      let rule = _this._findRule(`r-${child.name}`, currentFilter.filter);
      if (!rule) {
        rule = {
          id: `r-${child.name}`,
          field: child.name,
          fieldSql: child.nameSql,
          dataType: child.dataType,
          value: "",
          value2: "",
          disabled: false,
          operator: child.operator ? child.operator : operators[0].name,
        };
        currentFilter.filter.rules.push(rule);
      }
      let textValue = rule.value && rule.value !== "" ? rule.value : null;
      textValue =
        rule.value2 && rule.value2 !== ""
          ? `${textValue} a ${rule.value2}`
          : textValue;
      result.push(
        <AnterosAccordionItem
          caption={
            <div>
              {child.label}
              <SimpleValueSelector
                field={child.name}
                options={_this.getOperators(child.name)}
                value={rule.operator}
                className="custom-select-operator"
                disabled={child.disabled}
                handleOnChange={(value) => _this.onOperatorChanged(rule, value)}
                level={0}
              />
              <AnterosText
                fontSize="12px"
                truncate
                color="blue"
                text={textValue}
              />
            </div>
          }
          id={"fld" + index}
          key={"flk" + index}
          blockStyle={{ padding: "4px", overflow: "hidden" }}
          headerStyle={{ paddingRight: "10px", minHeight: "20px!important" }}
        >
          <SimpleValueEditor
            field={child.name}
            dataType={child.dataType}
            operator={rule.operator}
            value={rule.value}
            value2={rule.value2}
            listValues={[]}
            searchField={child.searchField}
            disabled={false}
            className="rule-value"
            handleOnChange={(value) => _this.onValueChanged(rule, value)}
            onSearchButtonClick={props.onSearchButtonClick}
            level={0}
          />{" "}
          {child.operator === "between" &&
          child.dataType !== "date" &&
          child.dataType !== "date_time" &&
          child.dataType !== "time" ? (
            <SimpleValueEditor
              field={child.name}
              dataType={child.dataType}
              operator={rule.operator}
              value={rule.value2}
              listValues={listValues}
              searchField={child.searchField}
              disabled={false}
              className="rule-value"
              handleOnChange={(value) => _this.onValue2Changed(rule, value)}
              onSearchButtonClick={props.onSearchButtonClick}
              level={0}
            />
          ) : (
            ""
          )}
        </AnterosAccordionItem>
      );
    });

    if (this.props.allowSort === true) {
      result.push(
        <AnterosAccordionItem
          caption={
            <div style={{ fontWeight: "bold", color: "#3d3d69" }}>
              {"Ordenação  "}
              <AnterosText
                fontSize="12px"
                truncate
                color="blue"
                style={{
                  wordBreak: "break-word",
                  display: "block",
                  wordWrap: "break-word",
                  width: "100%",
                  whiteSpace: "normal",
                }}
                text={this.getSortString(currentFilter)}
              />
            </div>
          }
          id={"fld" + 9999}
          key={"flk" + 9999}
          blockStyle={{ padding: "4px", overflow: "hidden" }}
          headerStyle={{ paddingRight: "10px", minHeight: "20px!important" }}
        >
          <AnterosRow>
            <AnterosCol style={{ padding: 13 }}>
              <div
                className="sort-group-container"
                style={{
                  height: "auto",
                }}
              >
                <div className="sort-header">
                  <div>
                    <AnterosButton
                      id="btnFilterSortDown"
                      circle
                      small
                      link
                      hint="Para baixo"
                      icon="fa fa-arrow-down"
                      onClick={this.onSortDown}
                    />
                    <AnterosButton
                      id="btnFilterSortUp"
                      circle
                      small
                      link
                      hint="Para cima"
                      icon="fa fa-arrow-up"
                      onClick={this.onSortUp}
                    />
                  </div>
                  <AnterosLabel caption="Ordenação" />
                </div>
                <div className="sort-body">
                  <AnterosList
                    height="100%"
                    width="100%"
                    dataSource={this.props.currentFilter.sort.sortFields}
                    dataFieldId="name"
                    dataFieldText="name"
                    activeIndex={this.props.currentFilter.sort.activeIndex}
                    sortFocused={this.props.sortFocused}
                    onChangeSortItem={this.onChangeSortItem}
                    onSelectListItem={this.onSelectListItem}
                    component={CustomSortItem}
                  />
                </div>
              </div>
            </AnterosCol>
          </AnterosRow>
        </AnterosAccordionItem>
      );
    }

    return result;
  }

  render() {
    return (
      <Fragment>
        <AnterosAccordion
          id="acc1"
          onSelectAccordionItem={this.onSelectAccordionItem}
        >
          {this.state.simpleFields}
        </AnterosAccordion>
      </Fragment>
    );
  }
}

AnterosSimpleFilter.propTypes = {
  currentFilter: PropTypes.object,
  operators: PropTypes.array,
  onFilterChanged: PropTypes.func,
  onError: PropTypes.func,
};

AnterosSimpleFilter.defaultProps = {
  operators: defaultOperators(),
  conditions: defaultConditions(),
  onFilterChanged: null,
  onError: null,
};


class SimpleValueEditor extends React.Component {
  constructor(props) {
    super(props);
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  static get componentName() {
    return "ValueEditor";
  }

  onButtonClick(event) {
    if (this.props.onSearchButtonClick) {
      this.props.onSearchButtonClick(
        this.props.field,
        event,
        this.props.handleOnChange,
        this.props.operator,
        this.props.searchField
      );
    }
  }

  render() {
    const {
      disabled,
      dataType,
      operator,
      value,
      value2,
      listValues,
      handleOnChange,
    } = this.props;
    let newValue = value === null || value === undefined ? "" : value;
    let newValue2 = value2 === null || value === undefined ? "" : value2;

    if (operator === "null" || operator === "notNull") {
      return null;
    }

    if (dataType) {
      if (dataType === "date") {
        if (operator === "between") {
          if (newValue === "" && newValue2 === "") newValue = "";
          else newValue = [newValue,newValue2];
          return (
            <AnterosDateRangePicker
              disabled={disabled}
              value={newValue}
              width="100%"
              onChange={(value) => handleOnChange(value)}
            />
          );
        } else if (operator === "notInList" || operator === "inList") {    
          return (
            <AnterosDateMultiplePicker
              disabled={disabled}
              value={newValue}
              width="100%"
              onChange={(value) => handleOnChange(value)}
            />
          );
        } else {
          return (
            <AnterosDatePicker
              disabled={disabled}
              value={newValue}
              width="100%"
              onChange={(value) => handleOnChange(value)}
            />
          );
        }
      } else if (dataType === "date_time") {
        if (operator === "between") {
          if (newValue === "" && newValue2 === "") newValue = "";
          else newValue = [newValue,newValue2];
          return (
            <AnterosDateTimeRangePicker
              disabled={disabled}
              value={newValue}
              width="100%"
              onChange={(value) => handleOnChange(value)}
            />
          );
        } else if (operator === "notInList" || operator === "inList") {  
          return (
            <AnterosDateTimeMultiplePicker
              disabled={disabled}
              value={newValue}
              width="100%"
              onChange={(value) => handleOnChange(value)}
            />
          );
        } else {
          return (
            <AnterosDateTimePicker
              disabled={disabled}
              value={newValue}
              width="100%"
              onChange={(value) => handleOnChange(value)}
            />
          );
        }
      } else if (dataType === "time") {
        if (newValue === "" && newValue2 === "") newValue = "";
        else newValue = newValue + " - " + newValue2;
        return (
          <AnterosTimePicker
            disabled={disabled}
            width="100%"
            value={newValue}
            onChange={(value) => handleOnChange(value)}
          />
        );
      } else {
        if (
          listValues.length > 0 &&
          (operator === "notInList" || operator === "inList")
        ) {
          return (
            <AnterosCombobox
              disabled={disabled}
              width={"100%"}
              onChangeSelect={(value) => handleOnChange(value)}
              multiple={true}
            >
              {listValues.map((v) => {
                return (
                  <AnterosComboboxOption
                    label={v.label}
                    value={v.value}
                    key={v.value}
                  />
                );
              })}
            </AnterosCombobox>
          );
        } else if (listValues.length > 0) {
          return (
            <AnterosCombobox
              disabled={disabled}
              width={"100%"}
              onChangeSelect={(value) => handleOnChange(value)}
            >
              {listValues.map((v) => {
                return (
                  <AnterosComboboxOption
                    label={v.label}
                    value={v.value}
                    key={v.value}
                  />
                );
              })}
            </AnterosCombobox>
          );
        } else {
          return (
            <AnterosEdit
              disabled={disabled}
              width={"100%"}
              icon="fa fa-search"
              onButtonClick={this.onButtonClick}
              clear={true}
              primary
              value={newValue}
              onChange={(e) => handleOnChange(e?e.target.value:undefined)}
            />
          );
        }
      }
    } else {
      return (
        <input
          type="text"
          width={this.props.twoFields?"128px":"260px"}
          value={newValue}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
    }
  }
}

SimpleValueEditor.propTypes = {
  field: PropTypes.string,
  operator: PropTypes.string,
  value: PropTypes.string,
  handleOnChange: PropTypes.func,
};

class SimpleValueSelector extends React.Component {
  static get componentName() {
    return "ValueSelector";
  }

  constructor(props) {
    super(props);
    this.uuid = uniqueId();
    this.getTextWidth = this.getTextWidth.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    let wdt = props.options && props.options.length > 0 && props.options[0]?this.getTextWidth(props.options[0].name):'100px';
    this.state = { width: wdt, value: undefined };    
  }

  getLabelByName(name) {
    return this.props.options.map((opt) => {
      if (opt.name === name) {
        return opt.label;
      }
      return undefined;
    });
  }

  getTextWidth(txt) {
    let text = document.createElement("span");
    document.body.appendChild(text);

    text.className = this.props.className;
    text.innerHTML = this.getLabelByName(txt);

    let width = Math.ceil(text.offsetWidth) + 4;
    let formattedWidth = width + "px";

    document.body.removeChild(text);

    return formattedWidth;
  }

  handleOnChange(event) {
    if (this.props.handleOnChange) {
      this.props.handleOnChange(event.target.value);
    }
    let width = this.getTextWidth(event.target.value);
    this.setState({ ...this.state, value: event.target.value, width });
  }

  render() {
    const { value, options, className, disabled } = this.props;

    return (
      <select
        className={className}
        disabled={disabled}
        value={value}
        tabIndex={-1}
        style={{ width: this.state.width }}
        onBlur={this.onBlur}
        onChange={this.handleOnChange}
      >
        {options.map((option) => {
          return (
            <option key={option.name} value={option.name}>
              {option.label}
            </option>
          );
        })}
      </select>
    );
  }
}

SimpleValueSelector.propTypes = {
  value: PropTypes.string,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  handleOnChange: PropTypes.func,
  width: PropTypes.string,
};

export {AnterosSimpleFilter};
