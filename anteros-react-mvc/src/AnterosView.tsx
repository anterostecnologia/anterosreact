import React, { Component, ReactNode, FC } from "react";
import { Switch, Route } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import {
  AnterosCard,
  HeaderActions,
} from "@anterostecnologia/anteros-react-containers";
import { UserData, AnterosEntity } from "@anterostecnologia/anteros-react-api2";
import { connect } from "react-redux";
import { AnterosController } from "./AnterosController";
import { AnterosDatasource } from "@anterostecnologia/anteros-react-datasource";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import {
  boundClass,
  AnterosResizeDetector,
} from "@anterostecnologia/anteros-react-core";
import { AnterosBlockUi } from "@anterostecnologia/anteros-react-loaders";
import { TailSpin } from "react-loader-spinner";

export const ADD = "add";
export const EDIT = "edit";
export const VIEW = "view";
export const SEARCH = "search";

export interface AnterosViewProps<E extends AnterosEntity, TypeID>
  extends RouteComponentProps {
  user: UserData;
  controller: AnterosController<E, TypeID>;
  caption: string;
  needRefresh: boolean;
  dataSource: AnterosDatasource;
  currentFilter: any | undefined;
  activeFilterIndex: number;
  needUpdateView: boolean;
  setDatasource(dataSource: AnterosDatasource): any;
  setNeedRefresh(): void;
  hideTour(): any;
  setFilter(currentFilter: any, activeFilterIndex: number): any;
  loadingMessage: string;
  loading: boolean;
  loadingColor: string;
  loadingBackgroundColor: string;
}

export interface AnterosViewState {
  loading: boolean;
}

@boundClass
abstract class AnterosView<
  E extends AnterosEntity,
  TypeID,
  Props extends AnterosViewProps<E, TypeID>,
  State extends AnterosViewState
> extends Component<Props, State> {
  private _controller!: AnterosController<E, TypeID>;

  static defaultProps = {
    loadingMessage: "Aguarde...",
    loadingBackgroundColor: "rgb(56 70 112)",
    loadingColor: "#f2d335",
  };

  constructor(props: Props) {
    super(props);
    this._controller = props.controller;
    // this.state = {
    //   loading: false
    // }
  }

  public abstract getRouteName(): string;
  public abstract getComponentSearch(props): ReactNode;
  public abstract getComponentForm(props): ReactNode;
  public abstract getCaption(): string;
  public abstract onCloseView(): void;
  public abstract isCloseViewEnabled(): boolean;

  public getViewHeight(): any {
    return "calc(100% - 100px)";
  }

  showHideLoad(show) {
    this.setState({
      ...this.state,
      loading: show,
      update: Math.random(),
    });
  }

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

  onResize(width, height) {}

  render(): ReactNode {
    const routeName = this.getRouteName();
    return (
      <AnterosCard
        caption={this.getCaption()}
        className="versatil-card-full"
        withScroll={
          this.props.history.location &&
          (this.props.history.location.pathname.includes(ADD) ||
            this.props.history.location.pathname.includes(EDIT) ||
            this.props.history.location.pathname.includes(VIEW))
        }
        styleBlock={{
          height: this.getViewHeight(),
        }}
      >
        <HeaderActions>
          <AnterosButton
            id="btnClose"
            onButtonClick={this.onCloseView}
            icon="fa fa-times"
            small
            circle
            disabled={!this.isCloseViewEnabled()}
          />
        </HeaderActions>
        <AnterosResizeDetector
          handleWidth
          handleHeight
          onResize={this.onResize}
        />
        <AnterosBlockUi
          tagStyle={{
            height: "100%",
          }}
          styleBlockMessage={{
            border: "2px solid white",
            width: "200px",
            height: "80px",
            padding: "8px",
            backgroundColor: this.props.loadingBackgroundColor,
            borderRadius: "8px",
            color: "white",
          }}
          styleOverlay={{
            opacity: 0.1,
            backgroundColor: "black",
          }}
          tag="div"
          blocking={this.props.loading}
          message={this.props.loadingMessage}
          loader={
            <TailSpin
              width="40px"
              height="40px"
              ariaLabel="loading-indicator"
              color={this.props.loadingColor}
            />
          }
        >
          <Switch>
            <Route
              exact
              path={[`${routeName}`, `${routeName}/${SEARCH}`]}
              render={(props) => {
                return this.getComponentSearch(props);
              }}
            />
            <Route
              exact
              path={[
                `${routeName}/${ADD}`,
                `${routeName}/${EDIT}`,
                `${routeName}/${VIEW}`,
              ]}
              render={(props) => {
                return this.getComponentForm(props);
              }}
            />
          </Switch>
        </AnterosBlockUi>
      </AnterosCard>
    );
  }
}

export { AnterosView };

export const connectViewWithStore = <E extends AnterosEntity, TypeID>(
  controller: AnterosController<E, TypeID>
) => {
  const mapStateToProps = (state) => {
    let dataSource,
      currentFilter = undefined,
      activeFilterIndex = -1,
      needRefresh = false,
      needUpdateView = false,
      user;
    let reducer = state[controller.getResource().getReducerName()];
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
      setNeedRefresh: () => {
        dispatch(controller.getResource().actions.setNeedRefresh());
      },
      setDatasource: (dataSource) => {
        dispatch(controller.getResource().actions.setDatasource(dataSource));
      },
      hideTour: () => {
        dispatch({ type: "HIDE_TOUR" });
      },
      setFilter: (currentFilter, activeFilterIndex) => {
        dispatch(
          controller
            .getResource()
            .actions.setFilter(currentFilter, activeFilterIndex)
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
