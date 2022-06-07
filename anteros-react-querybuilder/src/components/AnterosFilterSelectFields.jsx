import React from "react";
import {
  AnterosFormGroup,
  AnterosPanel,
  AnterosForm
} from "@anterostecnologia/anteros-react-containers";
import { autoBind } from "@anterostecnologia/anteros-react-core";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import Modal from "react-modal";
import { AnterosCheckbox } from "@anterostecnologia/anteros-react-editors";
import {
  AnterosRow,
  AnterosCol,
} from "@anterostecnologia/anteros-react-layout";
import { CustomSortItem } from "./AnterosAdvancedFilter";
import { AnterosLabel, AnterosText } from "@anterostecnologia/anteros-react-label";
import { AnterosList } from "@anterostecnologia/anteros-react-list";
import {cloneDeep} from 'lodash';
import {
  getQuickFieldsSort,
  getQuickFields
} from "./AnterosFilterCommons";

class AnterosFilterSelectFields extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    let quickFields = cloneDeep(getQuickFields(props.fields));
    let sortFields = cloneDeep(getQuickFieldsSort(props.fields));
    this.state = {
      selectedFields: [...quickFields],
      sortFields: [...sortFields],
      allChecked: true,
      activeIndex: props.currentFilter.sort.activeIndex,
    };
  }


  onCheckboxChange(value, _checked, item) {
    let selectedFields = [...this.state.selectedFields];
    if (_checked) {
      selectedFields.push(item.props.option);
    } else {
      selectedFields = this.state.selectedFields.filter(
        (it) => it.name !== item.props.option.name
      );
    }
    this.setState({ ...this.state, selectedFields });
  }

  renderCheckboxFields() {
    const selectedOptions = this.props.selectedOptions;

    if (selectedOptions) {
      return selectedOptions.map((sl) => {
        let checked = false;
        this.state.selectedFields.forEach((element) => {
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

  getSortItem(field) {
    let result;
    this.state.sortFields.forEach(function(item) {
      if (item.name === field) {
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
    let sortFields = this.state.sortFields;
    sortFields = sortFields.sort(function(a, b) {
      return a.order - b.order;
    });
    this.setState({
      ...this.state,
      update: Math.random(),
      sortFields,
    });
  }

  getSortItemByOrder(order) {
    let result;
    this.state.sortFields.forEach(function(item) {
      if (item.order === order) {
        result = item;
      }
    });
    return result;
  }

  onSortDown(event) {
    let activeIndex = this.state.activeIndex;
    if (activeIndex >= 0) {
      let item = this.state.sortFields[activeIndex];
      if (item.order < this.state.sortFields.length - 1) {
        activeIndex = item.order + 1;
        let nextItem = this.getSortItemByOrder(item.order + 1);
        Object.assign(item, {
          order: item.order + 1,
        });
        Object.assign(nextItem, {
          order: nextItem.order - 1,
        });
      }
      let sortFields = this.state.sortFields;
      sortFields = sortFields.sort(function(a, b) {
        return a.order - b.order;
      });
      this.setState({
        ...this.state,
        sortFields,
        activeIndex,
      });
    }
  }

  onSortUp(event) {
    let activeIndex = this.state.activeIndex;
    if (activeIndex >= 0) {
      let item = this.state.sortFields[activeIndex];
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
      let sortFields = this.state.sortFields;
      sortFields = sortFields.sort(function(a, b) {
        return a.order - b.order;
      });
      this.setState(
        {
          ...this.state,
          sortFields,
          activeIndex,
        });
    }
  }

  onSelectListItem(index, item) {
    this.setState({ ...this.state, activeIndex: index });
  }

  selectAllFields(checked){
    let quickFields = cloneDeep(getQuickFields(this.props.fields));
    let selectedFields = checked?quickFields:[];
    this.setState({ ...this.state, selectedFields, allChecked: checked });
  }

  render() {
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
            height: "570px",
            zIndex: 99,
            backgroundColor: "rgba(255, 255, 255, 0.75)",
          },
          content: {
            inset: 0,
            padding: "16px",
            position: "absolute",
            border: "1px solid silver",
            background: "rgb(255, 255, 255)",
            borderRadius: "4px",
            outline: "none",
          },
        }}
        centered={true}
      >
        <AnterosForm>
          <AnterosRow
            style={{
              paddingBottom: "10px",
              overflowY: "auto",
              display: "block",
              overflowX: "hidden",
            }}
          >
            <AnterosPanel
                border={false}
                style={{
                  padding: "10px",
                  width: "100%",
                }}
                >
                <AnterosText fontWeight="700" text={"Selecione os campos p/ o filtro rápido:"} />
                <AnterosCheckbox
                  checked={this.state.allChecked}
                  valueChecked={true}
                  valueUnchecked={false}
                  onCheckboxChange={(value, checked) =>{
                    this.selectAllFields(checked);
                  }}
                  value="Selecionar todos ?"
                />
              </AnterosPanel>
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
          </AnterosRow>
          <AnterosRow>
            <AnterosCol style={{ padding: 13 }}>
              <div
                className="sort-group-container"
                style={{
                  height: "200px",
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
                    dataSource={this.state.sortFields}
                    dataFieldId="name"
                    dataFieldText="name"
                    activeIndex={this.state.activeIndex}
                    sortFocused={this.props.sortFocused}
                    onChangeSortItem={this.onChangeSortItem}
                    onSelectListItem={this.onSelectListItem}
                    component={CustomSortItem}
                  />
                </div>
              </div>
            </AnterosCol>
          </AnterosRow>
        </AnterosForm>
        <AnterosPanel
          border={false}
          style={{
            display: "flex",
            justifyContent: "end",
            width: "100%",
            height: "40px",
            marginTop: "10px",
          }}
        >
          <AnterosButton
            primary
            caption="Aplicar"
            onButtonClick={() =>
              this.props.onConfirmSelectFields(this.state.selectedFields, this.state.sortFields, this.state.activeIndex)
            }
          ></AnterosButton>
          <AnterosButton
            danger
            caption="Cancela"
            onButtonClick={this.props.onCancelSelectFields}
          ></AnterosButton>
        </AnterosPanel>
      </Modal>
    );
  }
}

export { AnterosFilterSelectFields };
