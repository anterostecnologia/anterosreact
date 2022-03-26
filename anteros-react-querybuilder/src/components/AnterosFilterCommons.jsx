import React from "react";
import { AnterosError } from "@anterostecnologia/anteros-react-core";
import { FilterField, FilterFields, FilterFieldValue } from "./AnterosAdvancedFilter";
import PropTypes from "prop-types";

const QUICK_FILTER_INDEX = -2;
const NEW_FILTER_INDEX = -1;
const NORMAL = 'normal';
const QUICK = 'quick';
const ADVANCED = 'advanced';
const OPERATORS = {OP_NULL:"null",
   OP_NOT_NULL: "notNull",
   OP_CONTAINS: "contains",
   OP_STARTSWITH: "startsWith",
   OP_ENDSWITH: "endsWith",
   OP_EQUALS: "=",
   OP_NOT_EQUALS : "!=",
   OP_GREATER: ">",
   OP_LESS:  "<",
   OP_GREATER_OR_EQUAL: ">=",
   OP_LESS_OR_EQUAL: "<=",
   OP_BETWEEN: "between",
   OP_IN_LIST: "inList",
   OP_NOT_IN_LIST: "notInList"};

const convertQueryFields = (children) => {
  let result = [];
  let arrChildren = React.Children.toArray(children);
  arrChildren.forEach(function(child) {
    if (child.type && child.type.componentName === "QueryFields") {
      if (child.props.children) {
        let arrChild = React.Children.toArray(child.props.children);
        arrChild.forEach(function(chd, index) {
          let childs = [];
          let arrChildren2 = React.Children.toArray(chd.props.children);
          arrChildren2.forEach(function(child2) {
            childs.push(
              <FilterFieldValue key={"fld" + index} {...child2.props} />
            );
          });
          result.push(
            <FilterField key={"fld" + index} {...chd.props}>
              {childs}
            </FilterField>
          );
        });
      }
    }
  });
  return <FilterFields>{result}</FilterFields>;
};

const getFields = (props) => {
  let result = [];
  let children = convertQueryFields(props.children);
  if (children) {
    let arrChildren = React.Children.toArray(children);
    arrChildren.forEach(function(child) {
      if (child.type && child.type.componentName === "FilterFields") {
        if (child.props.children) {
          let arrChild = React.Children.toArray(child.props.children);
          arrChild.forEach(function(chd) {
            if (chd.type && chd.type.componentName !== "FilterField") {
              throw new AnterosError(
                "Somente filhos do tipo FilterField podem ser usados com FilterFields."
              );
            }
            let values = [];
            let chld = React.Children.toArray(chd.props.children);
            chld.forEach(function(val) {
              if (val.type && val.type.componentName !== "FilterFieldValue") {
                throw new AnterosError(
                  "Somente filhos do tipo FilterFieldValue podem ser usados com FilterFields"
                );
              }
              values.push({ label: val.props.label, value: val.props.value });
            });
            result.push({
              name: chd.props.name,
              label: chd.props.label,
              dataType: chd.props.dataType,
              operator: chd.props.operator,
              quickFilter: chd.props.quickFilter,
              quickFilterSort: chd.props.quickFilterSort,
              sortable: chd.props.sortable,
              listValues: values,
              searchComponent: chd.props.searchComponent,
              searchField: chd.props.searchField
            });
          });
        }
      }
    });
  }
  return result;
};

const getFieldSql = (field, fields) => {
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].name === field) {
      return fields[i].nameSql;
    }
  }
};

const getFieldValues = (field, fields) => {
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].name === field) {
      return fields[i].listValues;
    }
  }
};

const getQuickFields = (fields) => {
  let result = [];
  fields.forEach(function(field) {
    if (field.quickFilter === true) {
      result.push({ name: field.name, label: field.label });
    }
  }, this);
  return result;
};


const getQuickFilterSort = (fields) => {
    let result = "";
    let appendDelimiter = false;
    fields.forEach(function(field) {
      if (field.quickFilterSort === true) {
        if (appendDelimiter) result += ",";
        result += field.name;
        appendDelimiter = true;
      }
    }, this);
    return result;
  }


  const mergeSortWithFields = (sort, fields) => {
    let result = [];
    if (fields) {
        fields.forEach(function(field, index) {
        let selected = false;
        let asc_desc = "asc";
        let order = index;
        if (sort) {
          sort.forEach(function(item) {
            if (item.name === field.name) {
              selected = item.selected;
              asc_desc = item.asc_desc;
              order = item.order;
            }
          });
        }
        result.push({
          name: field.name,
          selected: selected,
          order: order,
          asc_desc: asc_desc,
          label: field.label,
        });
      });
      result = result.sort(function(a, b) {
        return a.order - b.order;
      });
    }
    return result;
  }

  const getQuickFilterFields = (currentFilter, fields) => {
    let result = "";
    let appendDelimiter = false;
    if (
      currentFilter && currentFilter.filter
    ) {
      if (
        !currentFilter.filter.selectedFields ||
        currentFilter.filter.selectedFields.length === 0
      ) {
        fields.forEach(function(item) {
          if (item.quickFilter === true) {
            if (appendDelimiter) {
              result = result + ",";
            }
            result = result + item.name;
          }
          appendDelimiter = true;
        }, this);
      } else {
        currentFilter.filter.selectedFields.forEach(function(item) {
          if (appendDelimiter) {
            result = result + ",";
          }
          result = result + item.name;
          appendDelimiter = true;
        }, this);
      }
    }

    return result;
  }

  const getDefaultEmptyFilter =() => {
    return {
      id: 0,
      name: "",
      formName: "",
      apiVersion: "",
      filter: {
        id: "root",
        selectedFields: [],
        quickFilterText: "",
        rules: [],
        condition: "",
        filterType: "normal",
      },
      sort: {
        quickFilterSort: "",
        sortFields: [],
        activeIndex: -1,
      },
    };
  }

const defaultOperators =() => {
    return [
      {
        name: "null",
        label: "Em branco",
        dataTypes: ["string", "number", "date", "date_time", "time","boolean"],
      },
      {
        name: "notNull",
        label: "Preenchido",
        dataTypes: ["string", "number", "date", "date_time", "time","boolean"],
      },
      {
        name: "contains",
        label: "Contém",
        dataTypes: ["string"],
      },
      {
        name: "startsWith",
        label: "Iniciado com",
        dataTypes: ["string"],
      },
      {
        name: "endsWith",
        label: "Terminado com",
        dataTypes: ["string"],
      },
      {
        name: "=",
        label: "Igual",
        dataTypes: ["string", "number", "date", "date_time", "time","boolean"],
      },
      {
        name: "!=",
        label: "Diferente",
        dataTypes: ["string", "number", "date", "date_time", "time","boolean"],
      },
      {
        name: "<",
        label: "Menor",
        dataTypes: ["string", "number", "date", "date_time", "time"],
      },
      {
        name: ">",
        label: "Maior",
        dataTypes: ["string", "number", "date", "date_time", "time"],
      },
      {
        name: "<=",
        label: "Menor igual",
        dataTypes: ["string", "number", "date", "date_time", "time"],
      },
      {
        name: ">=",
        label: "Maior igual",
        dataTypes: ["string", "number", "date", "date_time", "time"],
      },
      {
        name: "between",
        label: "Entre",
        dataTypes: ["string", "number", "date", "date_time", "time"],
      },
      {
        name: "inList",
        label: "Na lista",
        dataTypes: ["string", "number", "date", "date_time", "time"],
      },
      {
        name: "notInList",
        label: "Fora da lista",
        dataTypes: ["string", "number", "date", "date_time", "time"],
      },
    ];
  }

  const defaultConditions = () => {
    return [
      {
        name: "and",
        label: "E",
      },
      {
        name: "or",
        label: "Ou",
      },
    ];
  }

  const getDefaultFilter = (props,type) => {
    let fields = getFields(props);
    let result = {
      id: 0,
      name: "",
      formName: "",
      apiVersion: "",
      filter: {
        id: "root",
        selectedFields: [],
        quickFilterText: "",
        quickFilterFieldsText: "",
        rules: [],
        condition: "",
        filterType: type,
      },
      sort: {
        quickFilterSort: "",
        sortFields: [],
        activeIndex: -1,
      },
    };
    result.filter.selectedFields = getQuickFields(fields);
    result.filter.quickFilterFieldsText = getQuickFilterFields(null, fields);
    result.sort.sortFields = mergeSortWithFields([],fields);
    result.sort.quickFilterSort = getQuickFilterSort(fields);
    return result;
  }


  class QueryFields extends React.Component {
    static get componentName() {
      return "QueryFields";
    }
  
    render() {
      return <div>{this.props.children}</div>;
    }
  }
  
  class QueryField extends React.Component {
    static get componentName() {
      return "QueryField";
    }
    render() {
      return null;
    }
  }
  
  QueryField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    dataType: PropTypes.oneOf(["string", "number", "date", "date_time", "time"])
      .isRequired,
    operator: PropTypes.oneOf(["contains","startsWith","endsWith","=","!=","<",">","<=",">=","between","inList","notInList"]),
    sortable: PropTypes.bool.isRequired,
    quickFilter: PropTypes.bool.isRequired,
    quickFilterSort: PropTypes.bool.isRequired,
    searchComponent: PropTypes.any
  };
  
  QueryField.defaultProps = {
    sortable: true,
    quickFilter: true,
    quickFilterSort: false,
    operator: '='
  };
  
  class QueryFieldValue extends React.Component {
    static get componentName() {
      return "QueryFieldValue";
    }
    render() {
      return null;
    }
  }
  
  QueryFieldValue.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  };
  


export {QueryFieldValue,QueryField,QueryFields,getDefaultFilter,defaultConditions,
  defaultOperators, getDefaultEmptyFilter,getQuickFilterFields, mergeSortWithFields,
  getQuickFilterSort,getQuickFields,getFieldValues,getFieldSql, getFields,
  convertQueryFields, QUICK_FILTER_INDEX, NEW_FILTER_INDEX, NORMAL,
  QUICK, ADVANCED, OPERATORS}