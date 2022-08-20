import { NOCACHE } from "./symbol";
export function define(target, property, container, token, args) {
    Object.defineProperty(target, property, {
        get: function () {
            const value = container.get(token, args, this);
            if (args.indexOf(NOCACHE) === -1) {
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
//# sourceMappingURL=define.js.map