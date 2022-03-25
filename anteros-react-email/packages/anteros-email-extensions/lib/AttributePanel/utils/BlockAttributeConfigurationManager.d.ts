declare type ObjectComponent = {
    [key: string]: () => JSX.Element | null;
};
export declare class BlockAttributeConfigurationManager {
    private static map;
    static add(componentMap: ObjectComponent): void;
    static get<T extends ObjectComponent>(name: keyof T): string;
    static getMap(): ObjectComponent;
}
export {};
