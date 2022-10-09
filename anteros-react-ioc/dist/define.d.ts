import { ContainerIoc } from "./container";
import { MaybeToken } from "./token";
export declare function define<T, Target extends {
    [key in Prop]: T;
}, Prop extends string>(target: Target, property: Prop, container: ContainerIoc, token: MaybeToken<T>, args: symbol[]): void;
