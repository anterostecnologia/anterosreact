import { ContainerIoc } from "./container";
import { define } from "./define";
import { MaybeToken } from "./token";

export function createWire(container: ContainerIoc) {
  return <Value, Target extends { [key in Prop]: Value }, Prop extends string>(
    target: Target,
    property: Prop,
    token: MaybeToken<Value>,
    ...args: symbol[]
  ) => {
    define(target, property, container, token, args);
  };
}
