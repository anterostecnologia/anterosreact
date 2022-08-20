import { NOCACHE } from "./symbol";
export function createResolve(container) {
    return (token, ...args) => {
        let value;
        return function () {
            if (args.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get(token, args, this);
            }
            return value;
        };
    };
}
//# sourceMappingURL=resolve.js.map