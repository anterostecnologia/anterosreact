import { getType, MaybeToken, stringifyToken } from "./token";
import { NOPLUGINS } from "./symbol";

interface Item<T> {
  factory?: Factory<T>;
  value?: Value<T>;
  cache?: T;
  singleton?: boolean;
  plugins: Plugin<T>[];
}

export type Plugin<Dependency = any, Target = any> = (
  dependency: Dependency,
  target: Target | undefined,
  args: symbol[],
  token: MaybeToken<Dependency>,
  container: ContainerIoc
) => void;

interface NewAble<T> {
  new (...args: any[]): T;
}

type Registry = Map<symbol, Item<any>>;

type Factory<T> = () => T;
type Value<T> = T;

class PluginOptions<T> {
  constructor(protected _target: Item<T>) {}

  withPlugin(plugin: Plugin<T>): PluginOptions<T> {
    this._target.plugins.push(plugin);
    return this;
  }
}

class Options<T> extends PluginOptions<T> {
  inSingletonScope(): PluginOptions<T> {
    this._target.singleton = true;
    return this;
  }
}

class Bind<T> {
  constructor(private _target: Item<T>) {}

  to(object: NewAble<T>): Options<T> {
    this._target.factory = () => new object();
    return new Options<T>(this._target);
  }

  toFactory(factory: Factory<T>): Options<T> {
    this._target.factory = factory;
    return new Options<T>(this._target);
  }

  toValue(value: Value<T>): PluginOptions<T> {
    if (typeof value === "undefined") {
      throw new Error("Não é possível vincular um valor do tipo indefinido");
    }
    this._target.value = value;
    return new PluginOptions<T>(this._target);
  }
}

export class ContainerIoc {
  private _registry: Registry = new Map<symbol, Item<any>>();
  private _snapshots: Registry[] = [];
  private _plugins: Plugin[] = [];

  bind<T = never>(token: MaybeToken<T>): Bind<T> {
    return new Bind<T>(this._create<T>(token));
  }

  rebind<T = never>(token: MaybeToken<T>): Bind<T> {
    return this.remove(token).bind<T>(token);
  }

  remove(token: MaybeToken): ContainerIoc {
    if (this._registry.get(getType(token)) === undefined) {
      throw new Error(`${stringifyToken(token)} não existe no container.`);
    }

    this._registry.delete(getType(token));

    return this;
  }

  get<T = never>(
    token: MaybeToken<T>,
    args: symbol[] = [],
    target?: unknown
  ): T {
    const item = this._registry.get(getType(token));

    if (item === undefined) {
      throw new Error(`nada ligado a ${stringifyToken(token)}`);
    }

    const { factory, value, cache, singleton, plugins } = item;

    const execPlugins = (item: T): T => {
      if (args.indexOf(NOPLUGINS) !== -1) return item;

      for (const plugin of this._plugins.concat(plugins)) {
        plugin(item, target, args, token, this);
      }

      return item;
    };

    const cacheItem = (creator: () => T): T => {
      if (singleton && typeof cache !== "undefined") return cache;
      if (!singleton) return creator();
      item.cache = creator();
      return item.cache;
    };

    if (typeof value !== "undefined") return execPlugins(value);
    if (typeof factory !== "undefined")
      return execPlugins(cacheItem(() => factory()));

    throw new Error(`Nada está vinculado a ${stringifyToken(token)}`);
  }

  addPlugin(plugin: Plugin): ContainerIoc {
    this._plugins.push(plugin);
    return this;
  }

  snapshot(): ContainerIoc {
    this._snapshots.push(new Map(this._registry));
    return this;
  }

  restore(): ContainerIoc {
    this._registry = this._snapshots.pop() || this._registry;
    return this;
  }

  private _create<T>(token: MaybeToken<T>): Item<T> {
    if (this._registry.get(getType(token)) !== undefined) {
      throw new Error(
        `Objeto só pode ser vinculado uma vez: ${stringifyToken(token)}`
      );
    }

    const item = { plugins: [] };
    this._registry.set(getType(token), item);

    return item;
  }
}
