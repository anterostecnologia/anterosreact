export declare function token<T>(name: string): Token<T>;
declare const typeMarker: unique symbol;
export interface Token<T> {
    type: symbol;
    [typeMarker]: T;
}
export declare type MaybeToken<T = unknown> = Token<T> | symbol;
export declare function stringifyToken(token: MaybeToken): string;
export declare function getType(token: MaybeToken): symbol;
export {};
