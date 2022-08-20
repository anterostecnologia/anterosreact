"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=token.js.map