import { ContainerIoc } from "./container";
import { MaybeToken } from "./token";
export declare function createDecorator(container: ContainerIoc): <T>(token: MaybeToken<T>, ...args: symbol[]) => <Target extends { [key in Prop]: T; }, Prop extends string>(target: Target, property: Prop) => void;
