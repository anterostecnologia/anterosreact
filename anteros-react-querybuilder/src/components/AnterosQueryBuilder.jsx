import React from "react";
import moment from "moment";
import PropTypes from "prop-types";

import {
  AnterosError,
  autoBind,
  processErrorMessage,
  AnterosSweetAlert,
} from "@anterostecnologia/anteros-react-core";
import {
  AnterosEdit,
  AnterosCheckbox,
} from "@anterostecnologia/anteros-react-editors";
import { AnterosFormGroup } from "@anterostecnologia/anteros-react-containers";
import { AnterosCalendar } from "@anterostecnologia/anteros-react-calendar";
import {
  AnterosButton,
  AnterosDropdownButton,
  AnterosDropdownMenuItem,
  AnterosDropdownMenu,
} from "@anterostecnologia/anteros-react-buttons";
import { AnterosText } from "@anterostecnologia/anteros-react-label";
import { AnterosList } from "@anterostecnologia/anteros-react-list";
import shallowCompare from "react-addons-shallow-compare";
import {
  AnterosAdvancedFilter,
  FilterField,
  FilterFieldValue,
  FilterFields,
} from "./AnterosAdvancedFilter";
import AnterosSaveFilter from "./AnterosSaveFilter";
import {
  dataSourceEvents,
  AnterosLocalDatasource,
  AnterosRemoteDatasource,
} from "@anterostecnologia/anteros-react-datasource";
import {
  AnterosRow,
  AnterosCol,
} from "@anterostecnologia/anteros-react-layout";

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
        : this.getDefaultFilter(),
      modalOpen: "",
      showAdvancedFilter: this.props.showAdvancedFilter,
      expandedFilter: this.props.expandedFilter,
      activeFilterIndex: 0,
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

  getDefaultFilter() {
    let result = {
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
    result.filter.selectedFields = this.getQuickFields();
    result.sort.sortFields = this.mergeSortWithFields([]);
    return result;
  }

  mergeSortWithFields(sort) {
    let result = [];
    let flds = this.getFields(this.props);
    if (flds) {
      flds.forEach(function(field, index) {
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

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.state,
      currentFilter: nextProps.currentFilter
        ? nextProps.currentFilter
        : this.getDefaultFilter(),
      showAdvancedFilter: nextProps.showAdvancedFilter,
      activeFilterIndex: nextProps.activeFilterIndex,
      expandedFilter: nextProps.expandedFilter,
    });
  }

  componentDidMount() {
    let _this = this;
    if (this.props.dataSource != null) {
      this.props.dataSource.open(null, () => {
        if (!_this.props.dataSource.isEmpty()) {
          let filter = JSON.parse(
            atob(_this.props.dataSource.fieldByName("filter"))
          );
          filter.id = _this.props.dataSource.fieldByName("idFilter");
          filter.name = _this.props.dataSource.fieldByName("filterName");
          filter.formName = _this.props.dataSource.fieldByName("formName");
          _this.onChangeSelectedFilter(filter, 0);
        }
      });
    }
  }

  componentWillUnmount() {
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
    this.setState({ ...this.state, expandedFilter: newExpandedFilter });
    if (this.props.onToggleExpandedFilter) {
      this.props.onToggleExpandedFilter(newExpandedFilter);
    }
  }

  clearFilter() {
    if (this.props.onClearFilter) {
      this.props.onClearFilter(this);
    }
  }

  getQuickFields() {
    let result = [];
    this.getFields(this.props).forEach(function(field) {
      if (field.quickFilter === true) {
        result.push({ name: field.name, label: field.label });
      }
    }, this);
    return result;
  }

  getFields(props) {
    let result = [];
    if (props.children) {
      let arrChildren = React.Children.toArray(props.children);
      arrChildren.forEach(function(child) {
        if (child.type && child.type.componentName === "QueryFields") {
          if (child.props.children) {
            let arrChild = React.Children.toArray(child.props.children);
            arrChild.forEach(function(chd) {
              if (chd.type && chd.type.componentName !== "QueryField") {
                throw new AnterosError(
                  "Somente filhos do tipo QueryField podem ser usados com QueryFields."
                );
              }
              let values = [];
              let chld = React.Children.toArray(chd.props.children);
              chld.forEach(function(val) {
                if (val.type && val.type.componentName !== "QueryFieldValue") {
                  throw new AnterosError(
                    "Somente filhos do tipo QueryFieldValue podem ser usados com QueryFields"
                  );
                }
                values.push({ label: val.props.label, value: val.props.value });
              });
              result.push({
                name: chd.props.name,
                label: chd.props.label,
                dataType: chd.props.dataType,
                quickFilter: chd.props.quickFilter,
                quickFilterSort: chd.props.quickFilterSort,
                sortable: chd.props.sortable,
                listValues: values,
              });
            });
          }
        }
      });
    }
    return result;
  }

  getQuickFilterFields() {
    let result = "";
    let appendDelimiter = false;

    if (
      !this.state.currentFilter.filter.selectedFields ||
      this.state.currentFilter.filter.selectedFields.length === 0
    ) {
      this.getFields(this.props).forEach(function(item) {
        if (item.quickFilter === true) {
          if (appendDelimiter) {
            result = result + ",";
          }
          result = result + item.name;
        }
        appendDelimiter = true;
      }, this);
    } else {
      this.state.currentFilter.selectedFields.forEach(function(item) {
        if (appendDelimiter) {
          result = result + ",";
        }
        result = result + item.name;
        appendDelimiter = true;
      }, this);
    }

    return result;
  }

  getQuickFilterSort() {
    let result = "";
    let appendDelimiter = false;
    this.getFields(this.props).forEach(function(field) {
      if (field.quickFilterSort === true) {
        if (appendDelimiter) result += ",";
        result += field.name;
        appendDelimiter = true;
      }
    }, this);
    return result;
  }

  onSearchClick() {
    if (this.props.onSearchByFilter) {
      this.props.onSearchByFilter(this.state.currentFilter);
    }
  }

  onClickOkCalendar = (event, startDate, endDate) => {
    let currentFilter = this.state.currentFilter;
    currentFilter.filter.quickFilterText = "";
    this.setState({ ...this.state, currentFilter });

    if (this.props.onSelectDateRange) {
      this.props.onSelectDateRange(startDate, endDate);
    }
    let qf = currentFilter.filter.quickFilterText;
    if (qf && qf !== "") {
      qf = qf + ",";
    } else {
      qf = "";
    }
    qf =
      qf + startDate.format("DD/MM/YYYY") + ":" + endDate.format("DD/MM/YYYY");
    currentFilter.filter.quickFilterText = qf;
    this.setState(
      {
        ...this.state,
        currentFilter,
      },
      () => this.onSearchClick()
    );
    this.onFilterChanged(currentFilter);
  };

  onChangeQuickFilter(event, value) {
    let currentFilter = this.state.currentFilter;
    currentFilter.filter.quickFilterText = value;
    this.setState({
      ...this.state,
      currentFilter,
    });
  }

  handleQuickFilter(event) {
    if (event.keyCode === 13) {
      this.onSearchClick();
    }
  }

  onChangeSelectedFields(selectedFields) {
    let currentFilter = this.state.currentFilter;
    if (!currentFilter) {
      currentFilter = {};
    }
    currentFilter.filter.selectedFields = selectedFields;
    this.setState({ ...this.state, currentFilter }, () =>
      this.onSearchClick()
    );
    if (this.props.onFilterChanged) {
      this.props.onFilterChanged(currentFilter);
    }
  }

  getQuickFilterText() {
    return this.state.currentFilter.filter.quickFilterText;
  }

  onFilterChanged(currentFilter) {
    if (this.props.onFilterChanged) {
      this.props.onFilterChanged(currentFilter);
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

  onChangeFilterType(value, checked) {
    let currentFilter = this.state.currentFilter;
    currentFilter.filter.filterType = checked ? "advanced" : "normal";
    this.setState({ ...this.state, currentFilter });
    if (this.props.onFilterChanged) {
      this.props.onFilterChanged(currentFilter);
    }
  }
  onChangeSelectedFilter(filter, index) {
    if (this.props.onSelectedFilter) {
      this.props.onSelectedFilter(filter, index);
    }
    this.setState({
      ...this.state,
      currentFilter: filter,
      activeFilterIndex: index,
    });
  }

  addNewFilter() {
    let currentFilter = this.getDefaultFilter();
    this.setState({ ...this.state, currentFilter, activeFilterIndex: -1 });
    if (this.props.onSelectedFilter) {
      this.props.onSelectedFilter(currentFilter, -1);
    }
  }

  onActionClick(event, button) {
    if (button.props.id === "btnNew") {
      this.addNewFilter();
    } else if (button.props.id === "btnRemove") {
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
        .then(function() {
          let currentFilter = _this.state.currentFilter;
          if (
            _this.props.dataSource.locate({
              idFilter: currentFilter.id,
            })
          ) {
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
    } else if (button.props.id === "btnApply") {
      this.onSearchClick();
    }
  }

  render() {
    const heightFilter = this.state.expandedFilter ? "calc(100%)" : "0px";
    return (
      <div
        style={{
          width: "100%",
          height: heightFilter,
          backgroundColor: "white",
          border: this.state.expandedFilter
            ? "1px solid #cfd8dc"
            : "1px solid transparent",
          position: "relative",
          display: "flex",
          flexFlow: "column nowrap",
          WebkitTransition: this.state.expandedFilter ? "height .5s" : "none",
          MozTransition: this.state.expandedFilter ? "height .5s" : "none",
          msTransition: this.state.expandedFilter ? "height .5s" : "none",
          OTransition: this.state.expandedFilter ? "height .5s" : "none",
          transition: this.state.expandedFilter ? "height .5s" : "none",
          zIndex: this.props.zIndex,
          overflow: this.state.expandedFilter ? "hidden auto" : "unset",
        }}
      >
        <div
          style={{
            padding: 3,
            width: "100%",
            height: 51,
            display: "flex",
            flexFlow: "row nowrap",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            position: this.state.expandedFilter ? "absolute" : "relative",
          }}
        >
          <AnterosEdit
            onChange={this.onChangeQuickFilter}
            width={"100%"}
            onKeyDown={this.handleQuickFilter}
            value={this.state.currentFilter.filter.quickFilterText}
            placeHolder={this.props.placeHolder}
            style={{
              height: "36px",
              padding: "3px",
            }}
          />
          <AnterosButton
            primary
            caption="Filtrar"
            icon="fal fa-filter"
            hint="Filtrar"
            hintPosition="down"
            onClick={()=> {
              this.onSearchClick();
            }}
          />
          <AnterosButton
            primary
            icon="fal fa-expand-alt"
            hint="Filtro avançado"
            visible={this.props.showToggleButton}
            onClick={this.toggleExpandedFilter}
          />
          <AnterosButton
            primary
            icon="far fa-eraser"
            hint="Limpar filtro"
            hintPosition="down"
            visible={this.props.showClearButton}
            onClick={this.clearFilter}
          />
        </div>
        <div
          style={{
            display: "flex",
            pointerEvents: this.state.expandedFilter ? "all" : "none",
            opacity: this.state.expandedFilter ? 1 : 0,
            flexFlow: "column nowrap",
            marginTop: "51px",
            WebkitTransition: this.state.expandedFilter
              ? "opacity .75s"
              : "none",
            MozTransition: this.state.expandedFilter ? "opacity .75s" : "none",
            msTransition: this.state.expandedFilter ? "opacity .75s" : "none",
            OTransition: this.state.expandedFilter ? "opacity .75s" : "none",
            transition: this.state.expandedFilter ? "opacity .75s" : "none",
          }}
        >
          <AnterosDetailFilter
            dataSource={this.props.dataSource}
            onChangeCalendar={this.onClickOkCalendar}
            selectedOptions={this.getQuickFields()}
            onChangeSelectedFields={this.onChangeSelectedFields}
            onChangeSelectedFilter={this.onChangeSelectedFilter}
            onApplyFilter={this.onApplyFilter}
            onSaveFilter={this.onSaveFilter}
            onFilterChanged={this.onFilterChanged}
            onChangeFilterType={this.onChangeFilterType}
            onActionClick={this.onActionClick}
            currentFilter={this.state.currentFilter}
            activeIndex={this.state.activeFilterIndex}
          >
            {this.props.children}
          </AnterosDetailFilter>
        </div>
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
};

AnterosQueryBuilder.defaultProps = {
  showClearButton: true,
  showToggleButton: true,
};

class AnterosDetailFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalOpen: "" };
    autoBind(this);
  }

  convertQueryFields(children) {
    let result = [];
    let arrChildren = React.Children.toArray(children);
    arrChildren.forEach(function(child) {
      if (child.type && child.type.componentName === "QueryFields") {
        if (child.props.children) {
          let arrChild = React.Children.toArray(child.props.children);
          arrChild.forEach(function(chd, index) {
            let childs = [];
            let arrChildren2 = React.Children.toArray(chd.children);
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
    return result;
  }

  onSelectMenuItem(item) {
    this.props.onSaveFilter(item);
  }

  onSelectItem(index, data) {
    if (this.props.onChangeSelectedFilter && data && data.filter) {
      let filter = JSON.parse(atob(data.filter));
      filter.id = data.idFilter;
      filter.name = data.filterName;
      filter.formName = data.formName;
      this.props.onChangeSelectedFilter(filter, index);
    }
    this.setState({ ...this.state, update: Math.random() });
  }

  render() {
    let fieldsFilter = this.convertQueryFields(this.props.children);
    return (
      <div style={{ padding: "10px" }}>
        <AnterosText fontWeight="bold" text="Filtros salvos" />
        <AnterosList
          height="105px"
          activeIndex={this.props.activeIndex}
          dataSource={this.props.dataSource}
          onSelectListItem={this.onSelectItem}
          component={FilterItem}
        />
        <div className="filter-apply">
          <AnterosButton
            id="btnNew"
            hint="Novo filtro"
            primary
            icon="far fa-plus"
            onButtonClick={this.props.onActionClick}
            caption=""
          />
          <AnterosButton
            id="btnRemove"
            hint="Remover filtro"
            danger
            disabled={
              !this.props.currentFilter.id || this.props.currentFilter.id <= 0
            }
            icon="far fa-trash-alt"
            onButtonClick={this.props.onActionClick}
            caption=""
          />
          <AnterosButton
            id="btnApply"
            hint="Aplicar filtro"
            success
            icon="far fa-filter"
            onButtonClick={this.props.onActionClick}
            caption="Aplicar"
          />
          <AnterosDropdownButton primary caption="Salvar" icon="far fa-save">
            <AnterosDropdownMenu>
              <AnterosDropdownMenuItem
                icon="far fa-save"
                id="mnuItemSalvar"
                caption="Salvar"
                onSelectMenuItem={this.onSelectMenuItem}
              />
              <AnterosDropdownMenuItem
                icon="far fa-save"
                id="mnuItemSalvarComo"
                caption="Salvar como..."
                onSelectMenuItem={this.onSelectMenuItem}
              />
            </AnterosDropdownMenu>
          </AnterosDropdownButton>
        </div>
        <AnterosCheckbox
          style={{ color: "crimson" }}
          value="Avançado"
          checked={this.props.currentFilter.filter.filterType === "advanced"}
          valueChecked={true}
          valueUnchecked={false}
          onCheckboxChange={this.props.onChangeFilterType}
        />
        {this.props.currentFilter.filter.filterType === "advanced" ? (
          <AnterosAdvancedFilter
            onFilterChanged={this.props.onFilterChanged}
            width={"100%"}
            horizontal={false}
            currentFilter={this.props.currentFilter}
            border={"none"}
          >
            <FilterFields>{fieldsFilter}</FilterFields>
          </AnterosAdvancedFilter>
        ) : (
          <AnterosFastFilter {...this.props} />
        )}
        <AnterosSaveFilter
          id="modalSaveFilter"
          title="Salvar filtro"
          modalOpen={this.state.modalOpen}
          onClickOk={this.onClickOkSaveFilter}
          onClickCancel={this.onClickCancelSaveFilter}
        />
      </div>
    );
  }
}

class FilterItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { update: Math.random() };
    autoBind(this);
  }

  onClick(event, button) {
    event.preventDefault();
    if (!this.props.disabled) {
      if (this.props.handleSelectItem) {
        event.preventDefault();
        this.props.handleSelectItem(this.props.index, this.props.recordData);
        event.preventDefault();
      }
      if (this.props.onSelectListItem) {
        this.props.onSelectListItem(this.props.index, this.props.recordData);
      }
    }
  }

  render() {
    let className = "list-group-item list-group-item-action";
    let style = { maxHeight: "24px", padding: "2px 2px 2px 8px" };
    if (this.props.active) {
      className += " active";
      style = { ...style, border: "1px dashed blue", fontWeight: "bold" };
    }

    if (this.props.recordData.disabled) className += " disabled";
    return (
      <div className={className} style={style} onClick={this.onClick}>
        <AnterosText
          text={
            this.props.recordData.filterName
          }
        />
      </div>
    );
  }
}

class AnterosFastFilter extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  onCheckboxChange(value, _checked, item) {
    let selectedFields = [...this.props.currentFilter.filter.selectedFields];
    if (_checked) {
      selectedFields.push(item.props.option);
    } else {
      selectedFields = this.props.currentFilter.filter.selectedFields.filter(
        (it) => it.name !== item.props.option.name
      );
    }
    if (this.props.onChangeSelectedFields) {
      this.props.onChangeSelectedFields(selectedFields);
    }
  }

  renderCheckboxFields() {
    const selectedOptions = this.props.selectedOptions;

    if (selectedOptions) {
      return selectedOptions.map((sl) => {
        let checked = false;
        this.props.currentFilter.filter.selectedFields.forEach((element) => {
          if (sl.name === element.name) {
            checked = true;
          }
        });

        return (
          <AnterosCheckbox
            value={sl.label}
            checked={checked}
            option={sl}
            valueChecked={true}
            valueUnchecked={false}
            onCheckboxChange={this.onCheckboxChange}
          />
        );
      });
    }
  }

  render() {
    const { calendarClassName, ...calendarProps } = this.props;
    return (
      <AnterosRow
        style={{
          paddingBottom: "10px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <AnterosCol
          style={{
            height: "128px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <AnterosFormGroup row={false}>
            {this.renderCheckboxFields()}
          </AnterosFormGroup>
        </AnterosCol>
        <AnterosCol
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnterosCalendar
            className={calendarClassName}
            selectRange
            onChange={(value) => {
              this.props.onChangeCalendar(
                null,
                moment(value[0]),
                moment(value[1])
              );
            }}
            value={null}
            {...calendarProps}
          />
        </AnterosCol>
      </AnterosRow>
    );
  }
}

export class QueryFields extends React.Component {
  static get componentName() {
    return "QueryFields";
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}

export class QueryField extends React.Component {
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
  sortable: PropTypes.bool.isRequired,
  quickFilter: PropTypes.bool.isRequired,
  quickFilterSort: PropTypes.bool.isRequired,
};

QueryField.defaultProps = {
  sortable: true,
  quickFilter: true,
  quickFilterSort: false,
};

export class QueryFieldValue extends React.Component {
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
