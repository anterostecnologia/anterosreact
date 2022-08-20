import { MaybeToken } from "./token";
interface Item<T> {
    factory?: Factory<T>;
    value?: Value<T>;
    cache?: T;
    singleton?: boolean;
    plugins: Plugin<T>[];
}
export declare type Plugin<Dependency = any, Target = any> = (dependency: Dependency, target: Target | undefined, args: symbol[], token: MaybeToken<Dependency>, container: ContainerIoc) => void;
interface NewAble<T> {
    new (...args: any[]): T;
}
declare type Factory<T> = () => T;
declare type Value<T> = T;
declare class PluginOptions<T> {
    protected _target: Item<T>;
    constructor(_target: Item<T>);
    withPlugin(plugin: Plugin<T>): PluginOptions<T>;
}
declare class Options<T> extends PluginOptions<T> {
    inSingletonScope(): PluginOptions<T>;
}
declare class Bind<T> {
    private _target;
    constructor(_target: Item<T>);
    to(object: NewAble<T>): Options<T>;
    toFactory(factory: Factory<T>): Options<T>;
    toValue(value: Value<T>): PluginOptions<T>;
}
export declare class ContainerIoc {
    private _registry;
    private _snapshots;
    private _plugins;
    bind<T = never>(token: MaybeToken<T>): Bind<T>;
    rebind<T = never>(token: MaybeToken<T>): Bind<T>;
    remove(token: MaybeToken): ContainerIoc;
    get<T = never>(token: MaybeToken<T>, args?: symbol[], target?: unknown): T;
    addPlugin(plugin: Plugin): ContainerIoc;
    snapshot(): ContainerIoc;
    restore(): ContainerIoc;
    private _create;
}
export {};
