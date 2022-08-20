import { ContainerIoc } from "./container";
import { define } from "./define";
import { MaybeToken } from "./token";

export function createDecorator(container: ContainerIoc) {
  return <T>(token: MaybeToken<T>, ...args: symbol[]) => {
    return <Target extends { [key in Prop]: T }, Prop extends string>(
      target: Target,
      property: Prop
    ): void => {
      define(target, property, container, token, args);
    };
  };
}
