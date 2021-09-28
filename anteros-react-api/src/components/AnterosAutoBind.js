let wontBind = [
	"constructor",
	"render",
	"componentWillMount",
	"componentDidMount",
	"componentWillReceiveProps",
	"shouldComponentUpdate",
	"componentWillUpdate",
	"componentDidUpdate",
	"componentWillUnmount"
];

let toBind = [];

export function autoBind(context) {
	if (context === undefined) {
		console.error("Autobind error: No context provided.");
		return;
	}

	const options =
		arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	let objPrototype = Object.getPrototypeOf(context);

	if (options.bindOnly) {
		// If we want to bind *only* a set list of methods, then do that (nothing else matters)
		toBind = options.bindOnly;
	} else {
		// Otherwise, bind all available methods in the class
		toBind = Object.getOwnPropertyNames(objPrototype);

		// And exclude anything explicitly passed in wontBind
		wontBind = wontBind.concat(options.wontBind || []);
	}

	toBind.forEach(function(method) {
		let descriptor = Object.getOwnPropertyDescriptor(objPrototype, method);

		if (descriptor === undefined) {
			console.warn(`Autobind: "${method}" method not found in class.`);
			return;
		}

		// Return if it"s special case function or if not a function at all
		if (
			wontBind.indexOf(method) !== -1 ||
			typeof descriptor.value !== "function"
		) {
			return;
		}

		Object.defineProperty(
			objPrototype,
			method,
			boundMethod2(objPrototype, method, descriptor)
		);
	});
}

/**
 * From autobind-decorator (https://github.com/andreypopp/autobind-decorator/tree/master)
 * Return a descriptor removing the value and returning a getter
 * The getter will return a .bind version of the function
 * and memoize the result against a symbol on the instance
 */
function boundMethod2(objPrototype, method, descriptor) {
	let fn = descriptor.value;

	return {
		configurable: true,
		get() {
			if (this === objPrototype || this.hasOwnProperty(method)) {
				return fn;
			}

			let boundFn = fn.bind(this);
			Object.defineProperty(this, method, {
				value: boundFn,
				configurable: true,
				writable: true
			});
			return boundFn;
		}
	};
}

/**
 * Use boundMethod to bind all methods on the target.prototype
 */
export function boundClass(target) {
	// (Using reflect to get all keys including symbols)
	let keys;
	// Use Reflect if exists
	if (typeof Reflect !== "undefined" && typeof Reflect.ownKeys === "function") {
		keys = Reflect.ownKeys(target.prototype);
	} else {
		keys = Object.getOwnPropertyNames(target.prototype);
		// use symbols if support is provided
		if (typeof Object.getOwnPropertySymbols === "function") {
			keys = keys.concat(Object.getOwnPropertySymbols(target.prototype));
		}
	}

	keys.forEach(key => {
		// Ignore special case target method
		if (key === "constructor") {
			return;
		}

		let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

		// Only methods need binding
		if (typeof descriptor.value === "function") {
			Object.defineProperty(
				target.prototype,
				key,
				boundMethod(target, key, descriptor)
			);
		}
	});
	return target;
}

/**
 * Return a descriptor removing the value and returning a getter
 * The getter will return a .bind version of the function
 * and memoize the result against a symbol on the instance
 */
export function boundMethod(target, key, descriptor) {
	let fn = descriptor.value;

	if (typeof fn !== "function") {
		throw new Error(
			`@autobind decorator can only be applied to methods not: ${typeof fn}`
		);
	}

	// In IE11 calling Object.defineProperty has a side-effect of evaluating the
	// getter for the property which is being replaced. This causes infinite
	// recursion and an "Out of stack space" error.
	let definingProperty = false;

	return {
		configurable: true,
		get() {
			if (
				definingProperty ||
				this === target.prototype ||
				this.hasOwnProperty(key)
			) {
				return this.hasOwnProperty(key) ? this[key] : fn;
			}

			let boundFn = fn.bind(this);
			definingProperty = true;
			Object.defineProperty(this, key, {
				value: boundFn,
				configurable: true,
				writable: true
			});
			definingProperty = false;
			return boundFn;
		}
	};
}
