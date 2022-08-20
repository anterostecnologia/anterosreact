"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.token = exports.NOPLUGINS = exports.NOCACHE = exports.createResolve = exports.createWire = exports.createDecorator = exports.ContainerIoc = void 0;
var container_1 = require("./container");
Object.defineProperty(exports, "ContainerIoc", { enumerable: true, get: function () { return container_1.ContainerIoc; } });
var decorator_1 = require("./decorator");
Object.defineProperty(exports, "createDecorator", { enumerable: true, get: function () { return decorator_1.createDecorator; } });
var wire_1 = require("./wire");
Object.defineProperty(exports, "createWire", { enumerable: true, get: function () { return wire_1.createWire; } });
var resolve_1 = require("./resolve");
Object.defineProperty(exports, "createResolve", { enumerable: true, get: function () { return resolve_1.createResolve; } });
var symbol_1 = require("./symbol");
Object.defineProperty(exports, "NOCACHE", { enumerable: true, get: function () { return symbol_1.NOCACHE; } });
Object.defineProperty(exports, "NOPLUGINS", { enumerable: true, get: function () { return symbol_1.NOPLUGINS; } });
var token_1 = require("./token");
Object.defineProperty(exports, "token", { enumerable: true, get: function () { return token_1.token; } });
//# sourceMappingURL=index.js.map