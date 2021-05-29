var
    // deve ser um caractere não tão comum
    // possivelmente um que JSON não codifica
    // possivelmente um encodeURIComponent não codifica
    // agora, este caractere é '~', mas isso pode mudar no futuro
    specialChar = '~',
    safeSpecialChar = '\\x' + (
        '0' + specialChar.charCodeAt(0).toString(16)
    ).slice(-2),
    escapedSafeSpecialChar = '\\' + safeSpecialChar,
    specialCharRG = new RegExp(safeSpecialChar, 'g'),
    safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),

    safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),

    indexOf = [].indexOf || function (v) {
        for (var i = this.length; i-- && this[i] !== v;);
        return i;
    },
    $String = String // não há como descartar avisos em JSHint
    // sobre a nova String ... bem, eu preciso disso aqui!
    // fingido e feliz linter!
;

class AnterosCircularJSON {
    constructor() {
        this.generateReplacer = this.generateReplacer.bind(this);
        this.retrieveFromPath = this.retrieveFromPath.bind(this);
        this.generateReviver = this.generateReviver.bind(this);
        this.regenerateArray = this.regenerateArray.bind(this);
        this.regenerateObject = this.regenerateObject.bind(this);
        this.regenerate = this.regenerate.bind(this);
        this.stringify = this.stringify.bind(this);
        this.parse = this.parse.bind(this);
        this.parser = this.parser.bind(this);

     }

    generateReplacer(value, replacer, resolve) {
        var
            doNotIgnore = false,
            inspect = !!replacer,
            path = [],
            all = [value], 
            seen = [value],
            mapp = [resolve ? specialChar : '[Circular]'],
            last = value,
            lvl = 1,
            i, fn;
        if (inspect) {
            fn = typeof replacer === 'object' ?
                function (key, value) {
                    return key !== '' && indexOf.call(replacer, key) < 0 ? void 0 : value;
                } :
                replacer;
        }
        return function (key, value) {
            // o substituto tem o direito de decidir
            // se um novo objeto deve ser retornado
            // ou se há alguma chave para soltar
            // vamos chamá-lo aqui em vez de "tarde demais"
            if (inspect) value = fn.call(this, key, value);
    
            // a primeira passagem deve ser ignorada, pois é apenas o objeto inicial
            if (doNotIgnore) {
                if (last !== this) {
                    i = lvl - indexOf.call(all, this) - 1;
                    lvl -= i;
                    all.splice(lvl, all.length);
                    path.splice(lvl - 1, path.length);
                    last = this;
                }
                // console.log(lvl, key, path);
                if (typeof value === 'object' && value) {
                    // se o objeto não está se referindo ao objeto pai, adicione ao
                    // pilha do caminho do objeto. Caso contrário, ele já está lá.
                    if (indexOf.call(all, value) < 0) {
                        all.push(last = value);
                    }
                    lvl = all.length;
                    i = indexOf.call(seen, value);
                    if (i < 0) {
                        i = seen.push(value) - 1;
                        if (resolve) {
                            // a chave não pode conter specialChar, mas não pode ser uma string
                            path.push(('' + key).replace(specialCharRG, safeSpecialChar));
                            mapp[i] = specialChar + path.join(specialChar);
                        } else {
                            mapp[i] = mapp[0];
                        }
                    } else {
                        value = mapp[i];
                    }
                } else {
                    if (typeof value === 'string' && resolve) {
                        // garanta que nenhum caractere especial envolvido na desserialização
                        // neste caso, apenas o primeiro caractere é importante
                        // não há necessidade de substituir todos os valores (melhor desempenho)
                        value = value.replace(safeSpecialChar, escapedSafeSpecialChar)
                            .replace(specialChar, safeSpecialChar);
                    }
                }
            } else {
                doNotIgnore = true;
            }
            return value;
        };
    }
    
    retrieveFromPath(current, keys) {
        for (var i = 0, length = keys.length; i < length; current = current[
                // as chaves devem ser normalizadas de volta aqui
                keys[i++].replace(safeSpecialCharRG, specialChar)
            ]);
        return current;
    }
    
    generateReviver(reviver) {
        let _this = this;
        return function (key, value) {
            var isString = typeof value === 'string';
            if (isString && value.charAt(0) === specialChar) {
                return new $String(value.slice(1));
            }
            if (key === '') value = _this.regenerate(value, value, {});
            // novamente, apenas um é necessário, não use o RegExp para esta substituição
            // apenas as chaves precisam do RegExp
            if (isString) value = value.replace(safeStartWithSpecialCharRG, '$1' + specialChar)
                .replace(escapedSafeSpecialChar, safeSpecialChar);
            return reviver ? reviver.call(this, key, value) : value;
        };
    }
    
    regenerateArray(root, current, retrieve) {
        for (var i = 0, length = current.length; i < length; i++) {
            current[i] = this.regenerate(root, current[i], retrieve);
        }
        return current;
    }
    
    regenerateObject(root, current, retrieve) {
        for (var key in current) {
            if (current.hasOwnProperty(key)) {
                current[key] = this.regenerate(root, current[key], retrieve);
            }
        }
        return current;
    }
    
    regenerate(root, current, retrieve) {
        return current instanceof Array ?
            // reconstrução rápida de Array
            this.regenerateArray(root, current, retrieve) :
            (
                current instanceof $String ?
                (
                    // root é uma string vazia
                    current.length ?
                    (
                        retrieve.hasOwnProperty(current) ?
                        retrieve[current] :
                        retrieve[current] = this.retrieveFromPath(
                            root, current.split(specialChar)
                        )
                    ) :
                    root
                ) :
                (
                    current instanceof Object ?
                    // analisador de objetos dedicado
                    this.regenerateObject(root, current, retrieve) :
                    // valor como está
                    current
                )
            );
    }

    stringify(value, replacer, space, doNotResolve) {
        return this.parser().stringify(
            value,
            this.generateReplacer(value, replacer, !doNotResolve),
            space
        );
    }

    parse(text, reviver) {
        return this.parser().parse(
            text,
            this.generateReviver(reviver)
        );
    }
    // Um ​​analisador deve ser uma API 1: 1 compatível com JSON
    // deve expor os métodos stringify e parse.
    // O analisador padrão é o JSON nativo.
    parser() {
        return JSON;
    }    
}


const instance = new AnterosCircularJSON();
export { instance as AnterosCircularJSON };