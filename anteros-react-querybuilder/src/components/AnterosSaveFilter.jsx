import React, { Component } from "react";
import PropTypes from "prop-types";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import { AnterosEdit, AnterosCheckbox } from "@anterostecnologia/anteros-react-editors";
import { autoBind, AnterosSweetAlert } from "@anterostecnologia/anteros-react-core";
import {
  AnterosForm,
  AnterosFormGroup,
  ModalActions,
  AnterosModal,
} from "@anterostecnologia/anteros-react-containers";


class AnterosSaveFilter extends Component {
  constructor(props) {
    super(props);
    this.edFilterName = React.createRef();
    this.edFilterPublic = React.createRef();
    autoBind(this);
  }
  onClick(event) {
    if (event.target.getAttribute("data-user") === "btnOK") {
      if (
        !this.edFilterName.current.value ||
        this.edFilterName.current.value === ""
      ) {
        AnterosSweetAlert("Informe o nome do filtro.");
        return;
      } else if (!this.edFilterPublic.current.value) {
        AnterosSweetAlert("Informe se o filtro é público.");
        return;
      }
      if (this.props.onClickOk) {
        this.props.onClickOk(event);
      }
    } else if (event.target.getAttribute("data-user") === "btnCancel") {
      if (this.props.onClickCancel) {
        this.props.onClickCancel(event);
      }
    }
  }

  onCloseButton() {
    if (this.props.onClickCancel) {
        this.props.onClickCancel();
    }
}

  render() {
    return (
      <AnterosModal
        title={this.props.title}
        id={this.props.id}
        primary
        showHeaderColor={true}
        showContextIcon={false}
        isOpen={this.props.modalOpen === this.props.id}
        onCloseButton={this.onCloseButton}
        withScroll={false}
        hideExternalScroll={true}
      >
        <ModalActions>
          {this.positionUserActions === "first"
            ? this.hasUserActions
              ? this.getUserActions()
              : null
            : null}
          <AnterosButton success dataUser="btnOK" onClick={this.onClick}>
            OK
          </AnterosButton>{" "}
          <AnterosButton danger dataUser="btnCancel" onClick={this.onClick}>
            Fechar
          </AnterosButton>
          {this.positionUserActions === "last"
            ? this.hasUserActions
              ? this.getUserActions()
              : null
            : null}
        </ModalActions>
        <AnterosForm inline>
          <AnterosFormGroup row={false}>
            <AnterosEdit
              small={10}
              ref={this.edFilterName}
              placeHolder={this.props.placeHolder}
              style={{ width: "100%" }}
            />
          </AnterosFormGroup>
          <AnterosFormGroup>
            <AnterosCheckbox
              ref={this.edFilterPublic}
              valueChecked={true}
              valueUnchecked={false}
              small={{ size: 8, push: 2 }}
              value="Filtro público ?"
            />
          </AnterosFormGroup>
        </AnterosForm>
      </AnterosModal>
    );
  }
}

AnterosSaveFilter.propTypes = {
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};

AnterosSaveFilter.defaultProps = {};

export default AnterosSaveFilter;
