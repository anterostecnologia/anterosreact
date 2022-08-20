"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDecorator = void 0;
const define_1 = require("./define");
function createDecorator(container) {
    return (token, ...args) => {
        return (target, property) => {
            (0, define_1.define)(target, property, container, token, args);
        };
    };
}
exports.createDecorator = createDecorator;
//# sourceMappingURL=decorator.js.map