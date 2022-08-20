import {
  IAnterosRemoteResource,
  AnterosEntity,
} from "@anterostecnologia/anteros-react-api2";

export abstract class AnterosController<T extends AnterosEntity, TypeID> {
  public abstract getAuthenticationReducerName(): string;

  public abstract getLayoutReducerName(): string;

  public abstract getResource(): IAnterosRemoteResource<T, TypeID>;
}
