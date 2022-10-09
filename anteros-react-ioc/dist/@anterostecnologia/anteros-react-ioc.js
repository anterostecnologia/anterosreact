(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@anterostecnologia/anteros-react-ioc", [], factory);
	else if(typeof exports === 'object')
		exports["@anterostecnologia/anteros-react-ioc"] = factory();
	else
		root["@anterostecnologia/anteros-react-ioc"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/container.ts":
/*!**************************!*\
  !*** ./src/container.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContainerIoc = void 0;
const token_1 = __webpack_require__(/*! ./token */ "./src/token.ts");
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/symbol.ts");
class PluginOptions {
    constructor(_target) {
        this._target = _target;
    }
    withPlugin(plugin) {
        this._target.plugins.push(plugin);
        return this;
    }
}
class Options extends PluginOptions {
    inSingletonScope() {
        this._target.singleton = true;
        return this;
    }
}
class Bind {
    constructor(_target) {
        this._target = _target;
    }
    to(object) {
        this._target.factory = () => new object();
        return new Options(this._target);
    }
    toFactory(factory) {
        this._target.factory = factory;
        return new Options(this._target);
    }
    toValue(value) {
        if (typeof value === "undefined") {
            throw new Error("Não é possível vincular um valor do tipo indefinido");
        }
        this._target.value = value;
        return new PluginOptions(this._target);
    }
}
class ContainerIoc {
    constructor() {
        this._registry = new Map();
        this._snapshots = [];
        this._plugins = [];
    }
    bind(token) {
        return new Bind(this._create(token));
    }
    rebind(token) {
        return this.remove(token).bind(token);
    }
    remove(token) {
        if (this._registry.get((0, token_1.getType)(token)) === undefined) {
            throw new Error(`${(0, token_1.stringifyToken)(token)} não existe no container.`);
        }
        this._registry.delete((0, token_1.getType)(token));
        return this;
    }
    get(token, args = [], target) {
        const item = this._registry.get((0, token_1.getType)(token));
        if (item === undefined) {
            throw new Error(`nada ligado a ${(0, token_1.stringifyToken)(token)}`);
        }
        const { factory, value, cache, singleton, plugins } = item;
        const execPlugins = (item) => {
            if (args.indexOf(symbol_1.NOPLUGINS) !== -1)
                return item;
            for (const plugin of this._plugins.concat(plugins)) {
                plugin(item, target, args, token, this);
            }
            return item;
        };
        const cacheItem = (creator) => {
            if (singleton && typeof cache !== "undefined")
                return cache;
            if (!singleton)
                return creator();
            item.cache = creator();
            return item.cache;
        };
        if (typeof value !== "undefined")
            return execPlugins(value);
        if (typeof factory !== "undefined")
            return execPlugins(cacheItem(() => factory()));
        throw new Error(`Nada está vinculado a ${(0, token_1.stringifyToken)(token)}`);
    }
    addPlugin(plugin) {
        this._plugins.push(plugin);
        return this;
    }
    snapshot() {
        this._snapshots.push(new Map(this._registry));
        return this;
    }
    restore() {
        this._registry = this._snapshots.pop() || this._registry;
        return this;
    }
    _create(token) {
        if (this._registry.get((0, token_1.getType)(token)) !== undefined) {
            throw new Error(`Objeto só pode ser vinculado uma vez: ${(0, token_1.stringifyToken)(token)}`);
        }
        const item = { plugins: [] };
        this._registry.set((0, token_1.getType)(token), item);
        return item;
    }
}
exports.ContainerIoc = ContainerIoc;


/***/ }),

/***/ "./src/decorator.ts":
/*!**************************!*\
  !*** ./src/decorator.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createDecorator = void 0;
const define_1 = __webpack_require__(/*! ./define */ "./src/define.ts");
function createDecorator(container) {
    return (token, ...args) => {
        return (target, property) => {
            (0, define_1.define)(target, property, container, token, args);
        };
    };
}
exports.createDecorator = createDecorator;


/***/ }),

/***/ "./src/define.ts":
/*!***********************!*\
  !*** ./src/define.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.define = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/symbol.ts");
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


/***/ }),

/***/ "./src/resolve.ts":
/*!************************!*\
  !*** ./src/resolve.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createResolve = void 0;
const symbol_1 = __webpack_require__(/*! ./symbol */ "./src/symbol.ts");
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


/***/ }),

/***/ "./src/symbol.ts":
/*!***********************!*\
  !*** ./src/symbol.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NOPLUGINS = exports.NOCACHE = void 0;
exports.NOCACHE = Symbol("NOCACHE");
exports.NOPLUGINS = Symbol("NOPLUGINS");


/***/ }),

/***/ "./src/token.ts":
/*!**********************!*\
  !*** ./src/token.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getType = exports.stringifyToken = exports.token = void 0;
function token(name) {
    return { type: Symbol(name) };
}
exports.token = token;
function isToken(token) {
    return typeof token != "symbol";
}
function stringifyToken(token) {
    if (isToken(token)) {
        return `Token(${token.type.toString()})`;
    }
    else {
        return token.toString();
    }
}
exports.stringifyToken = stringifyToken;
function getType(token) {
    if (isToken(token)) {
        return token.type;
    }
    else {
        return token;
    }
}
exports.getType = getType;


/***/ }),

/***/ "./src/wire.ts":
/*!*********************!*\
  !*** ./src/wire.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createWire = void 0;
const define_1 = __webpack_require__(/*! ./define */ "./src/define.ts");
function createWire(container) {
    return (target, property, token, ...args) => {
        (0, define_1.define)(target, property, container, token, args);
    };
}
exports.createWire = createWire;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.token = exports.NOPLUGINS = exports.NOCACHE = exports.createResolve = exports.createWire = exports.createDecorator = exports.ContainerIoc = void 0;
var container_1 = __webpack_require__(/*! ./container */ "./src/container.ts");
Object.defineProperty(exports, "ContainerIoc", ({ enumerable: true, get: function () { return container_1.ContainerIoc; } }));
var decorator_1 = __webpack_require__(/*! ./decorator */ "./src/decorator.ts");
Object.defineProperty(exports, "createDecorator", ({ enumerable: true, get: function () { return decorator_1.createDecorator; } }));
var wire_1 = __webpack_require__(/*! ./wire */ "./src/wire.ts");
Object.defineProperty(exports, "createWire", ({ enumerable: true, get: function () { return wire_1.createWire; } }));
var resolve_1 = __webpack_require__(/*! ./resolve */ "./src/resolve.ts");
Object.defineProperty(exports, "createResolve", ({ enumerable: true, get: function () { return resolve_1.createResolve; } }));
var symbol_1 = __webpack_require__(/*! ./symbol */ "./src/symbol.ts");
Object.defineProperty(exports, "NOCACHE", ({ enumerable: true, get: function () { return symbol_1.NOCACHE; } }));
Object.defineProperty(exports, "NOPLUGINS", ({ enumerable: true, get: function () { return symbol_1.NOPLUGINS; } }));
var token_1 = __webpack_require__(/*! ./token */ "./src/token.ts");
Object.defineProperty(exports, "token", ({ enumerable: true, get: function () { return token_1.token; } }));

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=anteros-react-ioc.js.map