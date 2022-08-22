import React, { Component, ReactNode, FC } from "react";
import { RouteComponentProps } from "react-router-dom";
import { UserData, AnterosEntity } from "@anterostecnologia/anteros-react-api2";
import { connect } from "react-redux";
import { AnterosController } from "./AnterosController";
import { AnterosDatasource } from "@anterostecnologia/anteros-react-datasource";
import { boundClass } from "@anterostecnologia/anteros-react-core";
import { AnterosModal } from "@anterostecnologia/anteros-react-containers";
import { ModalSize } from "@anterostecnologia/anteros-react-template2";

export const ADD = "add";
export const EDIT = "edit";
export const VIEW = "view";
export const SEARCH = "search";

export interface AnterosSearchViewProps<E extends AnterosEntity, TypeID> {
  user: UserData;
  controller?: AnterosController<E, TypeID>;
  viewName: string;
  needRefresh: boolean;
  dataSource: AnterosDatasource;
  currentFilter: any | undefined;
  activeFilterIndex: number;
  needUpdateView: boolean;
  isOpenModal: boolean;
  modalSize?: ModalSize;
  setDatasource(dataSource: AnterosDatasource): any;
  hideTour(): any;
  setFilter(currentFilter: any, activeFilterIndex: number): any;
  history: RouteComponentProps["history"];
  onClickOk(event, selectedRecords): void;
  onClickCancel(event): void;
}

@boundClass
abstract class AnterosSearchView<
  E extends AnterosEntity,
  TypeID
> extends Component<AnterosSearchViewProps<E, TypeID>> {
  private _controller!: AnterosController<E, TypeID>;

  static defaultProps = {
    modalSize: ModalSize.semifull,
    isOpenModal: false,
    needUpdateView: false,
  };
  constructor(props: AnterosSearchViewProps<E, TypeID>) {
    super(props);
    this._controller = props.controller!;
  }

  public abstract getRouteName(): string;
  public abstract getComponentSearch(props): ReactNode;
  public abstract getCaption(): string;
  public abstract onCloseView(): void;
  public abstract isCloseViewEnabled(): boolean;

  /**
   * Getter controller
   * @return {AnterosController<E,TypeID>}
   */
  public get controller(): AnterosController<E, TypeID> {
    return this._controller;
  }

  /**
   * Setter controller
   * @param {any} value
   */
  public set controller(value: AnterosController<E, TypeID>) {
    this._controller = value;
  }

  render(): ReactNode {
    let modalSize = {};
    if (this.props.modalSize === ModalSize.extrasmall) {
      modalSize = { extraSmall: true };
    } else if (this.props.modalSize === ModalSize.small) {
      modalSize = { small: true };
    } else if (this.props.modalSize === ModalSize.medium) {
      modalSize = { medium: true };
    } else if (this.props.modalSize === ModalSize.large) {
      modalSize = { large: true };
    } else if (this.props.modalSize === ModalSize.semifull) {
      modalSize = { semifull: true };
    } else if (this.props.modalSize === ModalSize.full) {
      modalSize = { full: true };
    }

    return (
      <AnterosModal
        id={this.props.viewName}
        title={this.getCaption()}
        primary
        {...modalSize}
        showHeaderColor={true}
        showContextIcon={false}
        isOpen={this.props.isOpenModal}
        onCloseButton={this.onCloseView}
        withScroll={false}
        hideExternalScroll={true}
      >
        {this.getComponentSearch(this.props)}
      </AnterosModal>
    );
  }
}

export { AnterosSearchView };

export const connectSearchViewWithStore = <E extends AnterosEntity, TypeID>(
  controller: AnterosController<E, TypeID>
) => {
  const mapStateToProps = (state) => {
    let dataSource,
      currentFilter = undefined,
      activeFilterIndex = -1,
      needRefresh = false,
      needUpdateView = false,
      user;
    let reducer = state[controller.getResource().getSearchReducerName()];
    if (reducer) {
      dataSource = reducer.dataSource;
      currentFilter = reducer.currentFilter;
      activeFilterIndex = reducer.activeFilterIndex;
      needRefresh = reducer.needRefresh;
    }
    user = state[controller.getAuthenticationReducerName()].user;
    reducer = state[controller.getLayoutReducerName()];
    if (reducer) {
      needUpdateView = reducer.needUpdateView;
    }

    return {
      dataSource: dataSource,
      currentFilter: currentFilter,
      activeFilterIndex: activeFilterIndex,
      user: user,
      needRefresh: needRefresh,
      needUpdateView: needUpdateView,
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return {
      setDatasource: (dataSource) => {
        dispatch(
          controller.getResource().searchActions.setDatasource(dataSource)
        );
      },
      hideTour: () => {
        dispatch({ type: "HIDE_TOUR" });
      },
      setFilter: (currentFilter, activeFilterIndex) => {
        dispatch(
          controller
            .getResource()
            .searchActions.setFilter(currentFilter, activeFilterIndex)
        );
      },
    };
  };

  return (ViewComponent) => {
    const HC: FC = (props): JSX.Element => {
      return <ViewComponent {...props} controller={controller} />;
    };

    return connect(mapStateToProps, mapDispatchToProps)(HC);
  };
};
