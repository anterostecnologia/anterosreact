"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const symbol_1 = require("./symbol");
function define(target, property, container, token, args) {
    Object.defineProperty(target, property, {
        get: function () {
            const value = container.get(token, args, this);
            if (args.indexOf(symbol_1.NOCACHE) === -1) {
                Object.defineProperty(this, property, {
                    value,
                    enumerable: true,
                });
            }
            return value;
        },
        configurable: true,
        enumerable: true,
    });
}
exports.define = define;
//# sourceMappingURL=define.js.map