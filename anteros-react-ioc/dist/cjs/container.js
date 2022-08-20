"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerIoc = void 0;
const token_1 = require("./token");
const symbol_1 = require("./symbol");
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
//# sourceMappingURL=container.js.map