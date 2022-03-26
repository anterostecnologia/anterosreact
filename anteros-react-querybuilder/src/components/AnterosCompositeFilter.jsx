import React, { Fragment } from "react";
import {
  AnterosText,
  AnterosBadge,
} from "@anterostecnologia/anteros-react-label";
import { autoBind } from "@anterostecnologia/anteros-react-core";
import {
  AnterosButton,
  AnterosRadioButton,
  AnterosRadioButtonItem,
  AnterosDropdownButton,
  AnterosDropdownMenuItem,
  AnterosDropdownMenu,
} from "@anterostecnologia/anteros-react-buttons";
import { AnterosList } from "@anterostecnologia/anteros-react-list";
import { AnterosAdvancedFilter } from "./AnterosAdvancedFilter";
import AnterosSaveFilter from "./AnterosSaveFilter";
import Modal from "react-modal";
import {
  convertQueryFields,
  getFields,
  getQuickFields,
  defaultOperators,QUICK_FILTER_INDEX, ADVANCED, NORMAL, NEW_FILTER_INDEX
} from "./AnterosFilterCommons";
import { AnterosSimpleFilter } from "./AnterosSimpleFilter";
import shallowCompare from 'react-addons-shallow-compare';

class AnterosCompositeFilter extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      modalOpen: "",
      activeFilterIndex: props.activeFilterIndex,
      fields: getFields(props),
      showEditor: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  } 

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.state,
      fields: getFields(nextProps),
      activeFilterIndex: nextProps.activeFilterIndex,
    });
  }

  onSelectMenuItem(item) {
    this.props.onSaveFilter(item);
  }

  onChangeFilterType(index) {
    this.props.onChangeFilterType(index);
  }

  onSelectItem(index, data) {
    if (this.props.onChangeSelectedFilter && data && data.filter) {
      let filter = JSON.parse(atob(data.filter));
      filter.id = data.idFilter;
      filter.name = data.filterName;
      filter.formName = data.formName;
      this.props.onChangeSelectedFilter(filter, index);
    }
  }

  render() {
    let filterType = "normal";
    if (this.props.currentFilter) {
      filterType = this.props.currentFilter.filter.filterType;
    }
    return (
      <Modal
        id={this.props.id}
        key={this.props.key}
        isOpen={this.props.isOpen}
        onRequestClose={this.onCancel}
        style={{
          overlay: {
            position: "fixed",
            left: this.props.left,
            top: this.props.top,
            width: this.props.width,
            height: this.props.height,
            zIndex: 3,
            backgroundColor: "rgba(255, 255, 255, 0.75)",
          },
          content: {
            inset: 0,
            padding: 0,
            position: "absolute",
            border: "1px solid rgb(204, 204, 204)",
            background: "rgb(255, 255, 255)",
            borderRadius: "4px",
            outline: "none",
          },
        }}
        centered={true}
      >
        <div style={{ padding: "10px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <AnterosText fontWeight="bold" text="Filtros salvos" />
          </div>
          <AnterosList
            height="105px"
            activeIndex={this.state.activeFilterIndex}
            dataSource={this.props.dataSource}
            onSelectListItem={this.onSelectItem}
            style={{ borderRadius: "6px", marginBottom: "4px" }}
            component={FilterItem}
          />
          <div className="filter-apply">
            <Fragment>
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
                    this.props.currentFilter &&
                    (!this.props.currentFilter.id ||
                      this.props.currentFilter.id <= 0)
                  }
                  icon="far fa-trash-alt"
                  onButtonClick={this.props.onActionClick}
                  caption=""
                />
                <AnterosDropdownButton
                  primary
                  caption="Salvar"
                  icon="far fa-save"
                  disabled={
                    this.props.activeFilterIndex === QUICK_FILTER_INDEX
                  }
                >
                  <AnterosDropdownMenu>
                    <AnterosDropdownMenuItem
                      icon="far fa-save"
                      id="mnuItemSalvar"
                      caption="Salvar"
                      disabled={
                        this.props.activeFilterIndex === QUICK_FILTER_INDEX
                      }
                      onSelectMenuItem={this.onSelectMenuItem}
                    />
                    <AnterosDropdownMenuItem
                      icon="far fa-save"
                      id="mnuItemSalvarComo"
                      caption="Salvar como..."
                      disabled={
                        this.props.activeFilterIndex === QUICK_FILTER_INDEX
                      }
                      onSelectMenuItem={this.onSelectMenuItem}
                    />
                  </AnterosDropdownMenu>
                </AnterosDropdownButton>
            </Fragment>
            <AnterosButton
              id="btnApply"
              hint="Aplicar filtro"
              success
              icon="far fa-filter"
              disabled={
                this.props.activeFilterIndex === QUICK_FILTER_INDEX
              }
              onButtonClick={this.props.onActionClick}
              caption="Aplicar"
            />
            <AnterosButton
              id="btnClose"
              hint="Fechar filtro"
              danger
              icon="far fa-door-open"
              onButtonClick={this.props.onActionClick}
              caption="Fechar"
            />
          </div>
          {this.props.activeFilterIndex === NEW_FILTER_INDEX ? (
            <AnterosRadioButton
              small
              primary
              onRadioChange={this.onChangeFilterType}
            >
              <AnterosRadioButtonItem
                caption="Simples"
                style={{ height: "24px", padding: "2px 4px 4px 2px" }}
                checked={filterType === "normal"}
              />
              <AnterosRadioButtonItem
                caption="Avançado"
                style={{ height: "24px", padding: "2px 4px 4px 2px" }}
                checked={filterType === "advanced"}
              />
            </AnterosRadioButton>
          ) : null}
          {filterType === NORMAL ? (
            <AnterosSimpleFilter
              allowSort={true}
              update={this.props.update}
              operators={defaultOperators()}
              currentFilter={this.props.currentFilter}
              activeFilterIndex={this.props.activeFilterIndex}
              onFilterChanged={this.props.onFilterChanged}
              onSearchButtonClick={this.props.onSearchButtonClick}
              fields={this.state.fields}
            />
          ):null}
          {filterType === ADVANCED ? (<AnterosDetailedFilter
              isOpen={this.state.expandedFilter}
              update={this.props.update}
              width={"100%"}
              height={"100%"}
              dataSource={this.props.dataSource}
              onChangeCalendar={this.onClickOkCalendar}
              selectedOptions={getQuickFields(this.state.fields)}
              onChangeSelectedFields={this.onChangeSelectedFields}
              onChangeSelectedFilter={this.onChangeSelectedFilter}
              onFilterChanged={this.props.onFilterChanged}
              onSearchButtonClick={this.props.onSearchButtonClick}
              onActionClick={this.onActionClick}
              currentFilter={this.props.currentFilter}
              activeFilterIndex={this.props.activeFilterIndex}
            >
              {convertQueryFields(this.props.children)}
            </AnterosDetailedFilter>
          ):null}
        </div>
      </Modal>
    );
  }
}

class AnterosDetailedFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalOpen: "" };
    autoBind(this);
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
    return (
      <div style={{ padding: "10px", width: this.props.width }}>
        <AnterosAdvancedFilter
          onFilterChanged={this.props.onFilterChanged}
          width={"100%"}
          horizontal={false}
          currentFilter={this.props.currentFilter}
          activeFilterIndex={this.props.activeFilterIndex}
          border={"none"}
        >
          {this.props.children}
        </AnterosAdvancedFilter>
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
    let color = "#28C76F";
    let backgroundColor = "#E7F8EE";
    let newData = "Simples";
    if (this.props.recordData.filter) {
      let filter = JSON.parse(atob(this.props.recordData.filter));
      if (filter.filter.filterType === "advanced") {
        backgroundColor = "#d3dae6";
        color = "#437de0";
        newData = "Avançado";
      }
    }
    let className = "list-group-item list-group-item-action";
    let style = {
      maxHeight: "24px",
      padding: "2px 2px 2px 8px",
      display: "flex",
    };
    if (this.props.active) {
      className += " active";
      style = { ...style, border: "1px dashed blue", fontWeight: "bold" };
    }

    if (this.props.recordData.disabled) className += " disabled";
    return (
      <div className={className} style={style} onClick={this.onClick}>
        <AnterosText text={this.props.recordData.filterName} />
        <AnterosBadge
          pillFormat
          style={{ maxWidth: "60px", fontWeight: "bold" }}
          className="justify-center"
          color={color}
          backgroundColor={backgroundColor}
          caption={newData}
        />
      </div>
    );
  }
}

export default AnterosCompositeFilter;
