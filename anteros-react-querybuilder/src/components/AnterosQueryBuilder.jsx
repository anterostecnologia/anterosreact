import React from "react";
import PropTypes from "prop-types";
import DateObject from "react-date-object";
import {
  autoBind,
  processErrorMessage,
  AnterosSweetAlert,
} from "@anterostecnologia/anteros-react-core";
import { AnterosEdit } from "@anterostecnologia/anteros-react-editors";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import shallowCompare from "react-addons-shallow-compare";
import {
  dataSourceEvents,
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
} from "@anterostecnologia/anteros-react-datasource";
import AnterosCompositeFilter from "./AnterosCompositeFilter";
import {
  getDefaultFilter,
  getQuickFilterFields,
  getFields,
  getQuickFields,
  getQuickFilterSortBySelectedFields,
  QUICK_FILTER_INDEX,
  NEW_FILTER_INDEX,
  NORMAL,
  QUICK,
  ADVANCED,
} from "./AnterosFilterCommons";
import { AnterosFilterSelectRange } from "./AnterosFilterSelectRange";
import { endOfMonth } from "date-fns";
import { AnterosFilterSelectFields } from "./AnterosFilterSelectFields";

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

export class AnterosQueryBuilder extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      currentFilter: this.props.currentFilter
        ? this.props.currentFilter
        : getDefaultFilter(props, QUICK),
      modalOpen: "",
      expandedFilter: this.props.expandedFilter,
      activeFilterIndex: this.props.currentFilter
        ? this.props.activeFilterIndex
        : QUICK_FILTER_INDEX,
    };

    if (this.props.dataSource) {
      if (
        this.props.dataSource instanceof AnterosRemoteDatasource ||
        this.props.dataSource instanceof AnterosLocalDatasource
      ) {
        this.props.dataSource.addEventListener(
          DATASOURCE_EVENTS,
          this.onDatasourceEvent
        );
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.state,
      currentFilter: nextProps.currentFilter
        ? nextProps.currentFilter
        : getDefaultFilter(nextProps, QUICK),
      modalOpen: "",
      expandedFilter: nextProps.expandedFilter,
      activeFilterIndex: nextProps.currentFilter
        ? nextProps.activeFilterIndex
        : QUICK_FILTER_INDEX,
    });
  }


  componentDidMount() {
    window.addEventListener("resize", this.onResize);
    if (this.props.dataSource != null) {
      this.props.dataSource.open(null, () => {});
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
    if (
      this.props.dataSource instanceof AnterosRemoteDatasource ||
      this.props.dataSource instanceof AnterosLocalDatasource
    ) {
      this.props.dataSource.addEventListener(
        DATASOURCE_EVENTS,
        this.onDatasourceEvent
      );
    }
  }

  toggleExpandedFilter() {
    let newExpandedFilter = !this.state.expandedFilter;
    let position = this.getPosition("filter");
    this.setState(
      {
        ...this.state,
        expandedFilter: newExpandedFilter,
        isOpenSelectRange: false,
        isOpenSelectFields: false,
        detailsTop: position.top,
        detailsLeft: position.left,
        detailsHeight: position.height,
      },
      () => {
        if (
          !this.state.currentFilter ||
          this.state.currentFilter.filter.filterType === QUICK
        ) {
          if (!this.props.dataSource.isEmpty()) {
            let filter = JSON.parse(
              atob(this.props.dataSource.fieldByName("filter"))
            );
            filter.id = this.props.dataSource.fieldByName("idFilter");
            filter.name = this.props.dataSource.fieldByName("filterName");
            filter.formName = this.props.dataSource.fieldByName("formName");
            this.onChangeSelectedFilter(filter, 0);
          } else {
            this.addNewFilter();
          }
        }
      }
    );
    if (this.props.onToggleExpandedFilter) {
      this.props.onToggleExpandedFilter(newExpandedFilter);
    }
  }

  clearFilter() {
    if (this.props.onToggleExpandedFilter) {
      this.props.onToggleExpandedFilter(false);
    }
    let currentFilter = getDefaultFilter(this.props, QUICK);
    this.setState(
      {
        ...this.state,
        currentFilter,
        expandedFilter: false,
        activeFilterIndex: QUICK_FILTER_INDEX,
      },
      () => {
        this.onFilterChanged(currentFilter, QUICK_FILTER_INDEX, () => {
          if (this.props.onClearFilter) {
            this.props.onClearFilter(this);
          }
          this.onSearchClick();
        });
      }
    );
  }

  onSearchClick() {
    if (this.props.onSearchByFilter) {
      this.props.onSearchByFilter();
    }
    this.onCloseFilterClick();
  }

  onChangeQuickFilter(event, value) {
    this.changeQuickFilter(value);
  }

  changeQuickFilter(value) {
    let currentFilter = this.state.currentFilter;
    if (this.state.currentFilter && this.state.currentFilter.type && this.state.currentFilter.type !== QUICK) {
      currentFilter = getDefaultFilter(this.props, QUICK);
    }

    currentFilter.filter.quickFilterText = value;
    currentFilter.filter.quickFilterFieldsText = getQuickFilterFields(
      currentFilter,
      getFields(this.props)
    );
    this.setState({
      ...this.state,
      currentFilter,
      expandedFilter: false,
      activeFilterIndex: QUICK_FILTER_INDEX,
    });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.props.onToggleExpandedFilter) {
        this.props.onToggleExpandedFilter(false);
      }
      if (this.props.onFilterChanged) {
        this.props.onFilterChanged(currentFilter, QUICK_FILTER_INDEX);
      }
    }, 200);
  }

  handleQuickFilter(event) {
    if (event.keyCode === 13) {
      this.onSearchClick();
    }
  }

  getQuickFilterText() {
    return this.state.current.filter.quickFilterText;
  }

  onFilterChanged(currentFilter, activeFilterIndex, callback) {
    let result = [];
    if (currentFilter.id) {
      this.convertFilterToListValues(
        "root",
        currentFilter.filter.rules,
        result
      );
      let filter = { filter: result, sort: currentFilter.sort.sortFields };
      localStorage.setItem("filter" + currentFilter.id, JSON.stringify(filter));
    }

    if (this.props.onFilterChanged) {
      this.props.onFilterChanged(currentFilter, activeFilterIndex, () => {
        this.setState({ ...this.state, update: Math.random() }, callback);
      });
    } else {
      this.setState({ ...this.state, update: Math.random() }, callback);
    }
  }


  loadListValuesToFilter(parent, rules, values) {
    for (let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      if (rule.rules) {
        this.loadListValuesToFilter(rule.id, rule.rules, values);
      } else {
        let vl = this.getItemListById(values, parent, rule.id);
        if (vl) {
          rule.value = vl.value;
          rule.value2 = vl.value2;
        }
      }
    }
  }

  getItemListById(values, parent, id) {
    for (let i = 0; i < values.length; i++) {
      if (values[i].parent === parent && values[i].id === id) {
        return values[i];
      }
    }
  }

  convertFilterToListValues(parent, rules, result) {
    for (let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      if (rule.rules) {
        this.convertFilterToListValues(rule.id, rule.rules, result);
      } else {
        result.push({
          parent: parent,
          id: rule.id,
          value: rule.value,
          value2: rule.value2,
        });
      }
    }
  }

  onSaveFilter(item) {
    let _this = this;
    if (
      item.props.id === "mnuItemSalvar" &&
      this.state.currentFilter &&
      this.state.currentFilter.id > 0
    ) {
      AnterosSweetAlert({
        title: "Deseja salvar o Filtro ?",
        text: "",
        type: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        focusCancel: false,
      })
        .then(function() {
          let currentFilter = _this.state.currentFilter;
          currentFilter.filter.quickFilterFieldsText = getQuickFilterFields(
            currentFilter,
            getFields(_this.props)
          );
          if (
            _this.props.dataSource.locate({
              idFilter: currentFilter.id,
            })
          ) {
            _this.props.dataSource.edit();
            _this.props.dataSource.setFieldByName(
              "filter",
              btoa(JSON.stringify(currentFilter))
            );
            _this.props.dataSource.post((error) => {
              if (error) {
                AnterosSweetAlert(processErrorMessage(error));
              }
            });
          }
        })
        .catch((error) => {
          AnterosSweetAlert(processErrorMessage(error));
        });
    } else if (
      (item.props.id === "mnuItemSalvar" ||
        item.props.id === "mnuItemSalvarComo") &&
      this.state.currentFilter
    ) {
      AnterosSweetAlert({
        title: "Salvar como...",
        input: "text",
        inputAttributes: { autocapitalize: "off" },
        showCancelButton: true,
        confirmButtonText: "Salvar",
        cancelButtonText: "Cancelar",
      })
        .then((result) => {
          let currentFilter = _this.state.currentFilter;
          currentFilter.filter.quickFilterFieldsText = getQuickFilterFields(
            currentFilter,
            getFields(_this.props)
          );
          _this.props.dataSource.insert();
          _this.props.dataSource.setFieldByName(
            "componentFilter",
            _this.props.id
          );
          _this.props.dataSource.setFieldByName("filterName", result);
          _this.props.dataSource.setFieldByName(
            "formName",
            _this.props.formName
          );
          _this.props.dataSource.setFieldByName("user", _this.props.user);
          _this.props.dataSource.setFieldByName("boPublic", true);
          _this.props.dataSource.setFieldByName(
            "filter",
            btoa(JSON.stringify(currentFilter))
          );
          _this.props.dataSource.post((error) => {
            if (error) {
              AnterosSweetAlert(processErrorMessage(error));
            } else {
              currentFilter.id = _this.props.dataSource.fieldByName("idFilter");
              currentFilter.filterName = result;
              _this.setState({
                ..._this.state,
                currentFilter,
                modalOpen: "modalSaveFilter",
              });
            }
          });
        })
        .catch((error) => {
          AnterosSweetAlert(processErrorMessage(error));
        });
    }
  }

  onChangeFilterType(index) {
    let currentFilter = this.state.currentFilter;
    currentFilter.filter.filterType = index === 0 ? NORMAL : ADVANCED;
    currentFilter.filter.quickFilterFieldsText = getQuickFilterFields(
      currentFilter,
      getFields(this.props)
    );
    this.setState({ ...this.state, currentFilter, update: Math.random() });
    if (this.props.onFilterChanged) {
      this.props.onFilterChanged(currentFilter, this.state.activeFilterIndex);
    }
  }

  onChangeSelectedFilter(filter, index) {
    if (this.props.onSelectedFilter) {
      this.props.onSelectedFilter(filter, index);
    }
    let item = localStorage.getItem("filter" + filter.id);
    if (item && item !== null) {
      let _item = JSON.parse(item);
      this.loadListValuesToFilter("root", filter.filter.rules, _item.filter);
    }
    this.setState({
      ...this.state,
      currentFilter: filter,
      activeFilterIndex: index,
    });
  }

  addNewFilter() {
    let currentFilter = getDefaultFilter(this.props, NORMAL);
    this.setState({
      ...this.state,
      currentFilter,
      activeFilterIndex: NEW_FILTER_INDEX,
    });
    if (this.props.onSelectedFilter) {
      this.props.onSelectedFilter(currentFilter, NEW_FILTER_INDEX);
    }
  }

  onActionClick(event, button) {
    if (button.props.id === "btnNew") {
      this.addNewFilter();
    } else if (button.props.id === "btnRemove") {
      this.removeFilter();
    } else if (button.props.id === "btnApply") {
      this.onSearchClick();
    } else if (button.props.id === "btnClose") {
      this.onCloseFilterClick();
    }
  }

  removeFilter() {
    let _this = this;
    AnterosSweetAlert({
      title: "Deseja remover o Filtro ?",
      text: "",
      type: "question",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      focusCancel: false,
    })
      .then(function () {
        let currentFilter = _this.state.currentFilter;
        if (_this.props.dataSource.locate({
          idFilter: currentFilter.id,
        })) {
          _this.props.dataSource.delete((error) => {
            if (error) {
              AnterosSweetAlert(processErrorMessage(error));
            } else {
              if (!_this.props.dataSource.isEmpty()) {
                _this.props.dataSource.first();
                let filter = JSON.parse(
                  atob(_this.props.dataSource.fieldByName("filter"))
                );
                filter.id = _this.props.dataSource.fieldByName("idFilter");
                filter.name = _this.props.dataSource.fieldByName(
                  "filterName"
                );
                filter.formName = _this.props.dataSource.fieldByName(
                  "formName"
                );
                _this.onChangeSelectedFilter(filter, 0);
              } else {
                _this.addNewFilter();
              }
            }
          });
        }
      })
      .catch((error) => {
        AnterosSweetAlert(processErrorMessage(error));
      });
  }

  onCloseFilterClick() {
    this.setState({
      ...this.state,
      isOpenSelectRange: false,
      selectRangeType: undefined,
      expandedFilter: false,
      isOpenSelectFields: false,
    });
    if (this.props.onToggleExpandedFilter) {
      this.props.onToggleExpandedFilter(false);
    }
  }

  getPosition(type, rangeType) {
    let width = parseFloat(this.props.width.replace(/\D/g, "")) * 1;
    if (type === "range") {
      if (rangeType === "month") {
        width = 260;
      } else {
        width = 510;
      }
    } else if (type === "fields") {
      width = 480;
    }
    let bb = this.divMain.getBoundingClientRect();
    const { innerHeight: height } = window;
    let left = bb.left;
    if (bb.left + width > window.innerWidth - 100) {
      left = bb.right - width;
    }
    return { left, top: bb.bottom + 2, height: this.props.detailsHeight ? this.props.detailsHeight : height - bb.bottom - 30 };
  }

  onResize() {
    let type = "filter";
    let rangeType;
    if (this.state.isOpenSelectFields) {
      type = "fields";
    } else if (this.state.isOpenSelectRange) {
      type = "range";
      rangeType = this.state.selectRangeType;
    }
    let position = this.getPosition(type, rangeType);
    this.setState({
      ...this.state,
      detailsTop: position.top,
      detailsLeft: position.left,
      detailsHeight: position.height,
    });
  }

  onSelectRange(value) {
    if (this.state.isOpenSelectRange) {
      this.onCancelSelectRange();
    } else {
      let position = this.getPosition("range", value);
      this.setState({
        ...this.state,
        detailsTop: position.top,
        detailsLeft: position.left,
        detailsHeight: position.height,
        isOpenSelectRange: true,
        selectRangeType: value,
        expandedFilter: false,
        isOpenSelectFields: false,
      });
    }
  }

  onCancelSelectRange() {
    this.setState({
      ...this.state,
      isOpenSelectRange: false,
      selectRangeType: undefined,
      expandedFilter: false,
      isOpenSelectFields: false,
    });
  }

  onConfirmSelectRange(values) {
    let newValue;
    if (this.state.selectRangeType === "month") {
      let first = values[0].toString();
      let last = new DateObject({
        date: endOfMonth(values[1].toDate()),
        format: "DD/MM/YYYY",
      }).toString();
      newValue = `${first}:${last}`;
    } else if (
      this.state.selectRangeType === "range" ||
      this.state.selectRangeType === "week"
    ) {
      let first = values[0].toString();
      let last = values[1].toString();
      newValue = `${first}:${last}`;
    } else if (this.state.selectRangeType === "day") {
      let appendDelimiter = false;
      newValue = "";
      values.forEach((item) => {
        if (appendDelimiter) {
          newValue += ",";
        }
        newValue += item.toString();
        appendDelimiter = true;
      });
    }
    let currentFilter = this.state.currentFilter;
    if (this.state.currentFilter && this.state.currentFilter.type && this.state.currentFilter.type !== QUICK) {
      currentFilter = getDefaultFilter(this.props, QUICK);
    }
    currentFilter.filter.quickFilterText = newValue;
    currentFilter.filter.quickFilterFieldsText = getQuickFilterFields(
      currentFilter,
      getFields(this.props)
    );
    this.setState(
      {
        ...this.state,
        currentFilter,
        activeFilterIndex: QUICK_FILTER_INDEX,
        selectRangeType: undefined,
        isOpenSelectRange: false,
        isOpenSelectFields: false,
        expandedFilter: false,
      },
      () => {
        if (this.props.onFilterChanged) {
          this.props.onFilterChanged(currentFilter, QUICK_FILTER_INDEX);
        }
      }
    );
  }

  selectFields() {
    if (this.state.isOpenSelectFields) {
      this.onCancelSelectFields();
    } else {
      let position = this.getPosition("fields");
      this.setState({
        ...this.state,
        detailsTop: position.top,
        detailsLeft: position.left,
        detailsHeight: position.height,
        isOpenSelectFields: true,
        isOpenSelectRange: false,
        expandedFilter: false,
      });
    }
  }

  onCancelSelectFields() {
    this.setState({
      ...this.state,
      isOpenSelectFields: false,
      isOpenSelectRange: false,
      expandedFilter: false,
    });
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
          field.name+ ":"+field.asc_desc;
        appendDelimiter = true;
      }
    });
    return result;
  }

  onConfirmSelectFields(selectedFields, sortFields, activeIndex) {
    let currentFilter = this.state.currentFilter;
    if (this.state.currentFilter && this.state.currentFilter.type && this.state.currentFilter.type !== QUICK) {
      currentFilter = getDefaultFilter(this.props, QUICK);
    }
    currentFilter.filter.selectedFields = selectedFields;
    currentFilter.filter.quickFilterFieldsText = getQuickFilterFields(currentFilter)
    currentFilter.sort.sortFields = sortFields;
    currentFilter.sort.activeIndex = activeIndex;
    currentFilter.sort.quickFilterSort = this.getSortString(currentFilter);
    this.setState(
      {
        ...this.state,
        isOpenSelectFields: false,
        isOpenSelectRange: false,
        expandedFilter: false,
        currentFilter,
        activeFilterIndex: QUICK_FILTER_INDEX,
      },
      () => {
        if (this.props.onFilterChanged) {
          this.props.onFilterChanged(currentFilter, QUICK_FILTER_INDEX);
        }
      }
    );
  }

  onFocusEdit() {
    if (this.state.expandedFilter) {
      this.setState(
        {
          ...this.state,
          isOpenSelectFields: false,
          isOpenSelectRange: false,
          expandedFilter: false,
        },
        () => {
          this.refEdit.setFocus(true);
        }
      );
    }
  }

  onClickOk = (event, selectedRecords) => {
    if (selectedRecords && selectedRecords.length > 0) {
      let result = "";
      if (
        this.state.modalOperator === "notInList" ||
        this.state.modalOperator === "inList"
      ) {
        let appendDelimiter = false;
        selectedRecords.forEach((record) => {
          if (appendDelimiter) {
            result += ",";
          }
          result += record[this.state.modalSearchField];
          appendDelimiter = true;
        });
      } else {
        result = selectedRecords[0][this.state.modalSearchField];
      }

      if (this.state.modalHandleOnChange) {
        this.state.modalHandleOnChange(result);
      }
    }
    this.setState({
      ...this.state,
      modalOpen: "",
      modalHandleOnChange: undefined,
      modalOperator: undefined,
      modalSearchField: undefined,
    });
  };

  onClickCancel(event) {
    this.setState({
      ...this.state,
      modalOpen: "",
      modalHandleOnChange: undefined,
      modalOperator: undefined,
      modalSearchField: undefined,
    });
  }

  onSearchButtonClick(field, event, handleOnChange, operator, searchField) {
    this.setState({
      ...this.state,
      modalOpen: "modal" + field,
      modalHandleOnChange: handleOnChange,
      modalOperator: operator,
      modalSearchField: searchField,
    });
  }

  buildSearchModals() {
    let fields = getFields(this.props);
    let result = [];
    let _this = this;
    fields.forEach((field) => {
      if (field.searchComponent && field.searchField) {
        let SearchComponent = field.searchComponent;
        result.push(
          <SearchComponent
            key={"modal" + field.name}
            isOpen={
              _this.state.modalOpen &&
              _this.state.modalOpen === "modal" + field.name
            }
            user={this.props.user}
            onClickOk={this.onClickOk}
            onClickCancel={this.onClickCancel}
            selectedRecords={[]}
          />
        );
      }
    });
    return result;
  }

  render() {
    let type = "R";
    let backgroundColor = '#f0ad4e';
    if (this.state.currentFilter.filter.filterType === NORMAL) {
      type = "S";
      backgroundColor = '#72ac18';
    } else if (this.state.currentFilter.filter.filterType === ADVANCED) {
      type = "A";
      backgroundColor = '#007bff';
    }
    return (
      <div
        ref={(ref) => (this.divMain = ref)}
        style={{
          minWidth: this.props.width,
          maxWidth: this.props.width,
          height: "50px",
          backgroundColor: "white",
          position: "relative",
          display: "flex",
          flexFlow: "column nowrap",
        }}
      >
        <div
          style={{
            padding: 3,
            width: "100%",
            height: 50,
            display: "flex",
            flexFlow: "row nowrap",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", width: "100%" }}>
            <AnterosEdit
              onChange={this.onChangeQuickFilter}
              ref={(ref) => (this.refEdit = ref)}
              width={"100%"}
              onFocus={this.onFocusEdit}
              onKeyDown={this.handleQuickFilter}
              value={this.state.currentFilter.filter.quickFilterText}
              placeHolder={this.props.placeHolder}
              style={{
                height: "36px",
                padding: "3px",
                border: "1px solid #ccd4db",
                borderRadius: "6px",
              }}
            />
            <span
              style={{
                position: "relative",
                top: "8px",
                right: "25px",
                background: backgroundColor,
                color: "white",
                border: "1px solid silver",
                width: "20px",
                height: "20px",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "50px",
              }}
            >
              {type}
            </span>
          </div>
          <AnterosButton
            primary
            caption=""
            icon="far fa-sync-alt"
            hint="Filtrar"
            hintPosition="down"
            style={{ width: "38px", height: "38px" }}
            onClick={() => {
              this.onSearchClick();
            }}
          />
          <AnterosButton
            primary
            icon="far fa-backspace"
            hint="Limpar filtro"
            hintPosition="down"
            style={{ width: "38px", height: "38px" }}
            visible={this.props.showClearButton}
            onClick={this.clearFilter}
          />
          <div
            style={{
              width: "38px",
              height: "38px",
              display: "block",
              marginLeft: "4px",
            }}
          >
            <div style={{ width: "38px", height: "19px", display: "flex" }}>
              <AnterosButton
                primary
                icon="far fa-calendar"
                iconSize="12px"
                hint="Selecionar período"
                hintPosition="down"
                style={{
                  width: "18px",
                  height: "18px",
                  padding: 0,
                  margin: 0,
                  marginRight: 2,
                  marginBottom: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => {
                  this.onSelectRange("range");
                }}
              />
              <AnterosButton
                primary
                caption=""
                icon="far fa-calendar-alt"
                iconSize="12px"
                hint="Mês"
                hintPosition="down"
                style={{
                  width: "18px",
                  height: "18px",
                  padding: 0,
                  margin: 0,
                  marginRight: 0,
                  marginBottom: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => {
                  this.onSelectRange("month");
                }}
              />
            </div>
            <div style={{ width: "38px", height: "19px", display: "flex" }}>
              <AnterosButton
                primary
                caption=""
                icon="far fa-calendar-week"
                iconSize="12px"
                hint="Semana"
                hintPosition="down"
                style={{
                  width: "18px",
                  height: "18px",
                  padding: 0,
                  margin: 0,
                  marginRight: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => {
                  this.onSelectRange("week");
                }}
              />
              <AnterosButton
                primary
                caption=""
                icon="far fa-calendar-day"
                iconSize="12px"
                hint="Selecionar dias"
                hintPosition="down"
                style={{
                  width: "18px",
                  height: "18px",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => {
                  this.onSelectRange("day");
                }}
              />
            </div>
          </div>
          <AnterosButton
            primary
            icon="fal fa-tasks"
            hint="Selecionar campos filtro rápido"
            style={{ width: "38px", height: "38px" }}
            onClick={this.selectFields}
          />
          <AnterosButton
            primary
            icon="fal fa-filter"
            hint="Filtro avançado"
            style={{ width: "38px", height: "38px" }}
            visible={this.props.showToggleButton}
            onClick={this.toggleExpandedFilter}
          />
        </div>
        <AnterosCompositeFilter
          update={this.state.update}
          isOpen={this.state.expandedFilter}
          currentFilter={this.state.currentFilter}
          activeFilterIndex={this.state.activeFilterIndex}
          dataSource={this.props.dataSource}
          onFilterChanged={this.onFilterChanged}
          onSaveFilter={this.onSaveFilter}
          onActionClick={this.onActionClick}
          onChangeFilterType={this.onChangeFilterType}
          onChangeSelectedFilter={this.onChangeSelectedFilter}
          onSearchButtonClick={this.onSearchButtonClick}
          left={this.state.detailsLeft}
          top={this.state.detailsTop}
          width={this.props.width}
          height={this.state.detailsHeight}
        >
          {this.props.children}
        </AnterosCompositeFilter>

        <AnterosFilterSelectFields
          isOpen={this.state.isOpenSelectFields}
          left={this.state.detailsLeft}
          currentFilter={this.state.currentFilter}
          selectedOptions={getQuickFields(getFields(this.props))}
          fields={getFields(this.props)}
          onConfirmSelectFields={this.onConfirmSelectFields}
          onCancelSelectFields={this.onCancelSelectFields}
          width={this.props.width}
          top={this.state.detailsTop}
        />

        <AnterosFilterSelectRange
          selectRangeType={this.state.selectRangeType}
          isOpen={this.state.isOpenSelectRange}
          currentFilter={this.state.currentFilter}
          activeFilterIndex={this.state.activeFilterIndex}
          left={this.state.detailsLeft}
          onConfirmSelectRange={this.onConfirmSelectRange}
          onCancelSelectRange={this.onCancelSelectRange}
          width={this.props.width}
          top={this.state.detailsTop}
        />
        {this.buildSearchModals()}
      </div>
    );
  }
}

AnterosQueryBuilder.propTypes = {
  dataSource: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.instanceOf(AnterosLocalDatasource),
    PropTypes.instanceOf(AnterosRemoteDatasource),
  ]).isRequired,
  showClearButton: PropTypes.bool.isRequired,
  showToggleButton: PropTypes.bool.isRequired,
  onClearFilter: PropTypes.func,
  formName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  apiVersion: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  detailsHeight: PropTypes.string
};

AnterosQueryBuilder.defaultProps = {
  showClearButton: true,
  showToggleButton: true,
  width: "50px",
  height: "500px",
};
