"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWire = void 0;
const define_1 = require("./define");
function createWire(container) {
    return (target, property, token, ...args) => {
        (0, define_1.define)(target, property, container, token, args);
    };
}
exports.createWire = createWire;
//# sourceMappingURL=wire.js.map