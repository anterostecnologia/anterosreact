import { IAnterosRemoteResource, AnterosEntity } from "@anterostecnologia/anteros-react-api2";
export declare abstract class AnterosController<T extends AnterosEntity, TypeID> {
    abstract getAuthenticationReducerName(): string;
    abstract getLayoutReducerName(): string;
    abstract getResource(): IAnterosRemoteResource<T, TypeID>;
}
