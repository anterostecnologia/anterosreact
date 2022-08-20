"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResolve = void 0;
const symbol_1 = require("./symbol");
function createResolve(container) {
    return (token, ...args) => {
        let value;
        return function () {
            if (args.indexOf(symbol_1.NOCACHE) !== -1 || value === undefined) {
                value = container.get(token, args, this);
            }
            return value;
        };
    };
}
exports.createResolve = createResolve;
//# sourceMappingURL=resolve.js.map