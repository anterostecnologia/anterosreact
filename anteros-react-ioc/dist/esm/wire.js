import { define } from "./define";
export function createWire(container) {
    return (target, property, token, ...args) => {
        define(target, property, container, token, args);
    };
}
//# sourceMappingURL=wire.js.map