export function token(name) {
    return { type: Symbol(name) };
}
function isToken(token) {
    return typeof token != "symbol";
}
export function stringifyToken(token) {
    if (isToken(token)) {
        return `Token(${token.type.toString()})`;
    }
    else {
        return token.toString();
    }
}
export function getType(token) {
    if (isToken(token)) {
        return token.type;
    }
    else {
        return token;
    }
}
//# sourceMappingURL=token.js.map