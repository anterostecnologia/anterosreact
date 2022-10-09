import {
  AnterosAxiosApiClient,
  IAnterosApiClient,
  ApiConfiguration,
  RequestConfig,
} from "./AnterosRemoteApi";
import {
  UserConfig,
  UserData,
  IAnterosUserService,
  AnterosKeycloakUserService,
} from "./AnterosUserService";
import {
  createReducer,
  initialState,
  makeDefaultReduxObject,
  makeDefaultReduxActions,
} from "./AnterosReduxHelper";
import { AnterosEntity } from "./AnterosEntity";
import {
  IAnterosRemoteResource,
  AnterosRemoteResource,
  DELETE,
  POST,
  PUTCH,
  GET
} from "./AnterosRemoteResource";
import {
  processErrorMessage,
  processDetailErrorMessage,
} from "./AnterosErrorMessageHelper";

export {
  createReducer,
  initialState,
  makeDefaultReduxObject,
  makeDefaultReduxActions,
  IAnterosRemoteResource,
  AnterosRemoteResource,
  AnterosEntity,
  AnterosAxiosApiClient as AnterosApiClient,
  AnterosKeycloakUserService,
  ApiConfiguration,
  UserConfig,
  UserData,
  processErrorMessage,
  processDetailErrorMessage,
  DELETE,
  GET,
  PUTCH,
  POST,
};
export type { IAnterosApiClient, IAnterosUserService, RequestConfig };
