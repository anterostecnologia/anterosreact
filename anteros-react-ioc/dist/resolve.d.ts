import { ContainerIoc } from "./container";
import { MaybeToken } from "./token";
export declare function createResolve(container: ContainerIoc): <T = never>(token: MaybeToken<T>, ...args: symbol[]) => (this: unknown) => T;
