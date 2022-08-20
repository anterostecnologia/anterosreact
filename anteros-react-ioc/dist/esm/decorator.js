import { define } from "./define";
export function createDecorator(container) {
    return (token, ...args) => {
        return (target, property) => {
            define(target, property, container, token, args);
        };
    };
}
//# sourceMappingURL=decorator.js.map