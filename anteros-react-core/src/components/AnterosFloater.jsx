import React from "react";
import PropTypes from "prop-types";
import Popper from "popper.js";
import deepmerge from "deepmerge";
import is from "is-lite";
import treeChanges from "tree-changes";
import ExecutionEnvironment from "exenv";
import ReactDOM from "react-dom";
import autoBind from "./AnterosAutoBind";

export const { canUseDOM } = ExecutionEnvironment;
export const isReact16 = ReactDOM.createPortal !== undefined;

export function isMobile() {
	return "ontouchstart" in window && /Mobi/.test(navigator.userAgent);
}

export function getStyleComputedProperty(el) {
	if (el.nodeType !== 1) {
		return {};
	}

	return getComputedStyle(el);
}

export function isFixed(el) {
	if (!el) {
		return false;
	}

	const { nodeName } = el;

	if (nodeName === "BODY" || nodeName === "HTML") {
		return false;
	}

	if (getStyleComputedProperty(el).position === "fixed") {
		return true;
	}

	return el.parentNode instanceof HTMLElement ? isFixed(el.parentNode) : false;
}

/**
 * Log method calls if debug is enabled
 *
 * @private
 * @param {Object}       arg
 * @param {string}       arg.title    - The title the logger was called from
 * @param {Object|Array} [arg.data]   - The data to be logged
 * @param {boolean}      [arg.warn]  - If true, the message will be a warning
 * @param {boolean}      [arg.debug] - Nothing will be logged unless debug is true
 */
export function log({ title, data, warn = false, debug = false }) {
	/* eslint-disable no-console */
	const logFn = warn ? console.warn || console.error : console.log;

	if (debug && title && data) {
		console.groupCollapsed(
			`%creact-floater: ${title}`,
			"color: #9b00ff; font-weight: bold; font-size: 12px;"
		);

		if (Array.isArray(data)) {
			data.forEach(d => {
				if (is.plainObject(d) && d.key) {
					logFn.apply(console, [d.key, d.value]);
				} else {
					logFn.apply(console, [d]);
				}
			});
		} else {
			logFn.apply(console, [data]);
		}

		console.groupEnd();
	}
	/* eslint-enable */
}

export function on(element, event, cb, capture = false) {
	element.addEventListener(event, cb, capture);
}

export function off(element, event, cb, capture = false) {
	element.removeEventListener(event, cb, capture);
}

function once(element, event, cb, capture = false) {
	let nextCB;

	// eslint-disable-next-line prefer-const
	nextCB = e => {
		cb(e);
		off(element, event, nextCB);
	};

	on(element, event, nextCB, capture);
}

function noop() {}

const defaultOptions = {
	zIndex: 100
};

function getStyles(styles) {
	const options = deepmerge(defaultOptions, styles.options || {});

	return {
		wrapper: {
			cursor: "help",
			display: "inline-flex",
			flexDirection: "column",
			zIndex: options.zIndex
		},
		wrapperPosition: {
			left: -1000,
			position: "absolute",
			top: -1000,
			visibility: "hidden"
		},
		floater: {
			display: "inline-block",
			filter: "drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))",
			maxWidth: 300,
			opacity: 0,
			position: "relative",
			transition: "opacity 0.3s",
			visibility: "hidden",
			zIndex: options.zIndex
		},
		floaterOpening: {
			opacity: 1,
			visibility: "visible"
		},
		floaterWithAnimation: {
			opacity: 1,
			transition: "opacity 0.3s, transform 0.2s",
			visibility: "visible"
		},
		floaterWithComponent: {
			maxWidth: "100%"
		},
		floaterClosing: {
			opacity: 0,
			visibility: "visible"
		},
		floaterCentered: {
			left: "50%",
			position: "fixed",
			top: "50%",
			transform: "translate(-50%, -50%)"
		},
		container: {
			backgroundColor: "#fff",
			color: "#666",
			minHeight: 60,
			minWidth: 200,
			padding: 20,
			position: "relative"
		},
		title: {
			borderBottom: "1px solid #555",
			color: "#555",
			fontSize: 18,
			marginBottom: 5,
			paddingBottom: 6,
			paddingRight: 18
		},
		content: {
			fontSize: 15
		},
		close: {
			backgroundColor: "transparent",
			border: 0,
			borderRadius: 0,
			color: "#555",
			fontSize: 0,
			height: 15,
			outline: "none",
			padding: 10,
			position: "absolute",
			right: 0,
			top: 0,
			width: 15,
			WebkitAppearance: "none"
		},
		footer: {
			borderTop: "1px solid #ccc",
			fontSize: 13,
			marginTop: 10,
			paddingTop: 5
		},
		arrow: {
			color: "#fff",
			display: "inline-flex",
			length: 16,
			margin: 8,
			position: "absolute",
			spread: 32
		},
		options
	};
}

const POSITIONING_PROPS = ["position", "top", "right", "bottom", "left"];

const DEFAULTS = {
	flip: {
		padding: 20
	},
	preventOverflow: {
		padding: 10
	}
};

const STATUS = {
	INIT: "init",
	IDLE: "idle",
	OPENING: "opening",
	OPEN: "open",
	CLOSING: "closing",
	ERROR: "error"
};

const VALIDATOR_ARG_ERROR_MESSAGE =
	"The typeValidator argument must be a function " +
	"with the signature function(props, propName, componentName).";

const MESSAGE_ARG_ERROR_MESSAGE =
	"The error message is optional, but must be a string if provided.";

const propIsRequired = (condition, props, propName, componentName) => {
	if (typeof condition === "boolean") {
		return condition;
	} else if (typeof condition === "function") {
		return condition(props, propName, componentName);
	} else if (Boolean(condition) === true) {
		return Boolean(condition);
	}

	return false;
};

const propExists = (props, propName) =>
	Object.hasOwnProperty.call(props, propName);

const missingPropError = (props, propName, componentName, message) => {
	if (message) {
		return new Error(message);
	}

	return new Error(
		`Required ${props[propName]} \`${propName}\`` +
			` was not specified in \`${componentName}\`.`
	);
};

const guardAgainstInvalidArgTypes = (typeValidator, message) => {
	if (typeof typeValidator !== "function") {
		throw new TypeError(VALIDATOR_ARG_ERROR_MESSAGE);
	}

	if (Boolean(message) && typeof message !== "string") {
		throw new TypeError(MESSAGE_ARG_ERROR_MESSAGE);
	}
};

const isRequiredIf = (typeValidator, condition, message) => {
	guardAgainstInvalidArgTypes(typeValidator, message);

	return (props, propName, componentName, ...rest) => {
		if (propIsRequired(condition, props, propName, componentName)) {
			if (propExists(props, propName)) {
				return typeValidator(props, propName, componentName, ...rest);
			}

			return missingPropError(props, propName, componentName, message);
		}

		// Is not required, so just run typeValidator.
		return typeValidator(props, propName, componentName, ...rest);
	};
};

const FloaterCloseBtn = ({ handleClick, styles }) => {
	const { color, height, width, ...style } = styles;

	return (
		<button
			aria-label="close"
			onClick={handleClick}
			style={style}
			type="button"
		>
			<svg
				width={`${width}px`}
				height={`${height}px`}
				viewBox="0 0 18 18"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMidYMid"
			>
				<g>
					<path
						d="M8.13911129,9.00268191 L0.171521827,17.0258467 C-0.0498027049,17.248715 -0.0498027049,17.6098394 0.171521827,17.8327545 C0.28204354,17.9443526 0.427188206,17.9998706 0.572051765,17.9998706 C0.71714958,17.9998706 0.862013139,17.9443526 0.972581703,17.8327545 L9.0000937,9.74924618 L17.0276057,17.8327545 C17.1384085,17.9443526 17.2832721,17.9998706 17.4281356,17.9998706 C17.5729992,17.9998706 17.718097,17.9443526 17.8286656,17.8327545 C18.0499901,17.6098862 18.0499901,17.2487618 17.8286656,17.0258467 L9.86135722,9.00268191 L17.8340066,0.973848225 C18.0553311,0.750979934 18.0553311,0.389855532 17.8340066,0.16694039 C17.6126821,-0.0556467968 17.254037,-0.0556467968 17.0329467,0.16694039 L9.00042166,8.25611765 L0.967006424,0.167268345 C0.745681892,-0.0553188426 0.387317931,-0.0553188426 0.165993399,0.167268345 C-0.0553311331,0.390136635 -0.0553311331,0.751261038 0.165993399,0.974176179 L8.13920499,9.00268191 L8.13911129,9.00268191 Z"
						fill={color}
					/>
				</g>
			</svg>
		</button>
	);
};

FloaterCloseBtn.propTypes = {
	handleClick: PropTypes.func.isRequired,
	styles: PropTypes.object.isRequired
};

const FloaterContainer = ({
	content,
	footer,
	handleClick,
	open,
	positionWrapper,
	showCloseButton,
	title,
	styles
}) => {
	const output = {
		content: React.isValidElement(content) ? (
			content
		) : (
			<div className="__floater__content" style={styles.content}>
				{content}
			</div>
		)
	};

	if (title) {
		output.title = React.isValidElement(title) ? (
			title
		) : (
			<div className="__floater__title" style={styles.title}>
				{title}
			</div>
		);
	}

	if (footer) {
		output.footer = React.isValidElement(footer) ? (
			footer
		) : (
			<div className="__floater__footer" style={styles.footer}>
				{footer}
			</div>
		);
	}

	if ((showCloseButton || positionWrapper) && !is.boolean(open)) {
		output.close = <CloseBtn styles={styles.close} handleClick={handleClick} />;
	}
	return (
		<div className="__floater__container" style={styles.container}>
			{output.close}
			{output.title}
			{output.content}
			{output.footer}
		</div>
	);
};

FloaterContainer.propTypes = {
	content: PropTypes.node.isRequired,
	footer: PropTypes.node,
	handleClick: PropTypes.func.isRequired,
	open: PropTypes.bool,
	positionWrapper: PropTypes.bool.isRequired,
	showCloseButton: PropTypes.bool.isRequired,
	styles: PropTypes.object.isRequired,
	title: PropTypes.node
};

class FloaterArrow extends React.Component {
	get parentStyle() {
		const { placement, styles } = this.props;
		const { length } = styles.arrow;
		const arrow = {
			position: "absolute"
		};

		/* istanbul ignore else */
		if (placement.startsWith("top")) {
			arrow.bottom = 0;
			arrow.left = 0;
			arrow.right = 0;
			arrow.height = length;
		} else if (placement.startsWith("bottom")) {
			arrow.left = 0;
			arrow.right = 0;
			arrow.top = 0;
			arrow.height = length;
		} else if (placement.startsWith("left")) {
			arrow.right = 0;
			arrow.top = 0;
			arrow.bottom = 0;
		} else if (placement.startsWith("right")) {
			arrow.left = 0;
			arrow.top = 0;
		}

		return arrow;
	}

	render() {
		const { placement, setArrowRef, styles } = this.props;
		const {
			arrow: { color, display, length, margin, position, spread }
		} = styles;
		const arrowStyles = { display, position };

		let points;
		let x = spread;
		let y = length;

		/* istanbul ignore else */
		if (placement.startsWith("top")) {
			points = `0,0 ${x / 2},${y} ${x},0`;
			arrowStyles.bottom = 0;
			arrowStyles.marginLeft = margin;
			arrowStyles.marginRight = margin;
		} else if (placement.startsWith("bottom")) {
			points = `${x},${y} ${x / 2},0 0,${y}`;
			arrowStyles.top = 0;
			arrowStyles.marginLeft = margin;
			arrowStyles.marginRight = margin;
		} else if (placement.startsWith("left")) {
			y = spread;
			x = length;
			points = `0,0 ${x},${y / 2} 0,${y}`;
			arrowStyles.right = 0;
			arrowStyles.marginTop = margin;
			arrowStyles.marginBottom = margin;
		} else if (placement.startsWith("right")) {
			y = spread;
			x = length;
			points = `${x},${y} ${x},0 0,${y / 2}`;
			arrowStyles.left = 0;
			arrowStyles.marginTop = margin;
			arrowStyles.marginBottom = margin;
		}

		return (
			<div className="__floater__arrow" style={this.parentStyle}>
				<span ref={setArrowRef} style={arrowStyles}>
					<svg
						width={x}
						height={y}
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<polygon points={points} fill={color} />
					</svg>
				</span>
			</div>
		);
	}
}

FloaterArrow.propTypes = {
	placement: PropTypes.string.isRequired,
	setArrowRef: PropTypes.func.isRequired,
	styles: PropTypes.object.isRequired
};

class FloaterWrapper extends React.Component {
	render() {
		const {
			children,
			handleClick,
			handleMouseEnter,
			handleMouseLeave,
			setChildRef,
			setWrapperRef,
			style,
			styles
		} = this.props;
		let element;

		/* istanbul ignore else */
		if (children) {
			if (React.Children.count(children) === 1) {
				if (!React.isValidElement(children)) {
					element = <span>{children}</span>;
				} else {
					const refProp = is.function(children.type) ? "innerRef" : "ref";
					element = React.cloneElement(React.Children.only(children), {
						[refProp]: setChildRef
					});
				}
			} else {
				element = children;
			}
		}

		if (!element) {
			return null;
		}

		return (
			<span
				ref={setWrapperRef}
				style={{ ...styles, ...style }}
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{element}
			</span>
		);
	}
}

FloaterWrapper.propTypes = {
	children: PropTypes.node,
	handleClick: PropTypes.func.isRequired,
	handleMouseEnter: PropTypes.func.isRequired,
	handleMouseLeave: PropTypes.func.isRequired,
	setChildRef: PropTypes.func.isRequired,
	setWrapperRef: PropTypes.func.isRequired,
	style: PropTypes.object,
	styles: PropTypes.object.isRequired
};

class FloaterPortal extends React.Component {
	constructor(props) {
		super(props);

		if (!canUseDOM) return;

		this.node = document.createElement("div");
		if (props.id) {
			this.node.id = props.id;
		}
		if (props.zIndex) {
			this.node.style.zIndex = props.zIndex;
		}

		document.body.appendChild(this.node);
	}

	componentDidMount() {
		if (!canUseDOM) return;

		if (!isReact16) {
			this.renderPortal();
		}
	}

	componentDidUpdate() {
		if (!canUseDOM) return;

		if (!isReact16) {
			this.renderPortal();
		}
	}

	componentWillUnmount() {
		if (!canUseDOM || !this.node) return;

		if (!isReact16) {
			ReactDOM.unmountComponentAtNode(this.node);
		}

		document.body.removeChild(this.node);
	}

	renderPortal() {
		if (!canUseDOM) return null;

		const { children, setRef } = this.props;

		/* istanbul ignore else */
		if (isReact16) {
			return ReactDOM.createPortal(children, this.node);
		}

		const portal = ReactDOM.unstable_renderSubtreeIntoContainer(
			this,
			children.length > 1 ? <div>{children}</div> : children[0],
			this.node
		);

		setRef(portal);

		return null;
	}

	renderReact16() {
		const { hasChildren, placement, target } = this.props;

		if (!hasChildren) {
			if (target || placement === "center") {
				return this.renderPortal();
			}

			return null;
		}

		return this.renderPortal();
	}

	render() {
		if (!isReact16) {
			return null;
		}

		return this.renderReact16();
	}
}

FloaterPortal.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	hasChildren: PropTypes.bool,
	id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	placement: PropTypes.string,
	setRef: PropTypes.func.isRequired,
	target: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	zIndex: PropTypes.number
};

class Floater extends React.Component {
	get style() {
		const {
			disableAnimation,
			component,
			placement,
			hideArrow,
			isPositioned,
			status,
			styles
		} = this.props;
		const {
			arrow: { length },
			floater,
			floaterCentered,
			floaterClosing,
			floaterOpening,
			floaterWithAnimation,
			floaterWithComponent
		} = styles;
		let element = {};

		if (!hideArrow) {
			if (placement.startsWith("top")) {
				element.padding = `0 0 ${length}px`;
			} else if (placement.startsWith("bottom")) {
				element.padding = `${length}px 0 0`;
			} else if (placement.startsWith("left")) {
				element.padding = `0 ${length}px 0 0`;
			} else if (placement.startsWith("right")) {
				element.padding = `0 0 0 ${length}px`;
			}
		}

		if ([STATUS.OPENING, STATUS.OPEN].includes(status)) {
			element = { ...element, ...floaterOpening };
		}

		if (status === STATUS.CLOSING) {
			element = { ...element, ...floaterClosing };
		}

		if (status === STATUS.OPEN && !disableAnimation && !isPositioned) {
			element = { ...element, ...floaterWithAnimation };
		}

		if (placement === "center") {
			element = { ...element, ...floaterCentered };
		}

		if (component) {
			element = { ...element, ...floaterWithComponent };
		}

		return {
			...floater,
			...element
		};
	}

	render() {
		const {
			component,
			handleClick: closeFn,
			hideArrow,
			setFloaterRef,
			status
		} = this.props;

		const output = {};
		const classes = ["__floater"];

		if (component) {
			if (React.isValidElement(component)) {
				output.content = React.cloneElement(component, { closeFn });
			} else {
				output.content = component({ closeFn });
			}
		} else {
			output.content = <FloaterContainer {...this.props} />;
		}

		if (status === STATUS.OPEN) {
			classes.push("__floater__open");
		}

		if (!hideArrow) {
			output.arrow = <FloaterArrow {...this.props} />;
		}

		return (
			<div ref={setFloaterRef} className={classes.join(" ")} style={this.style}>
				<div className="__floater__body">
					{output.content}
					{output.arrow}
				</div>
			</div>
		);
	}
}

Floater.propTypes = {
	component: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
	content: PropTypes.node,
	disableAnimation: PropTypes.bool.isRequired,
	footer: PropTypes.node,
	handleClick: PropTypes.func.isRequired,
	hideArrow: PropTypes.bool.isRequired,
	isPositioned: PropTypes.bool,
	open: PropTypes.bool,
	placement: PropTypes.string.isRequired,
	positionWrapper: PropTypes.bool.isRequired,
	setArrowRef: PropTypes.func.isRequired,
	setFloaterRef: PropTypes.func.isRequired,
	showCloseButton: PropTypes.bool,
	status: PropTypes.string.isRequired,
	styles: PropTypes.object.isRequired,
	title: PropTypes.node
};

export default class AnterosFloater extends React.Component {
	constructor(props) {
		super(props);
		autoBind(this);

		/* istanbul ignore else */
		if (process.env.NODE_ENV !== "production") {
			const { children, open, target, wrapperOptions } = this.props;

			if (wrapperOptions.position && !target) {
				console.warn(
					"Missing props! You need to set a `target` to use `wrapperOptions.position`"
				); //eslint-disable-line no-console
			}

			if (!children && !is.boolean(open)) {
				console.warn("Missing props! You need to set `children`."); //eslint-disable-line no-console
			}
		}

		this.state = {
			currentPlacement: props.placement,
			positionWrapper: props.wrapperOptions.position && !!props.target,
			status: STATUS.INIT,
			statusWrapper: STATUS.INIT
		};

		this._isMounted = false;

		if (canUseDOM) {
			window.addEventListener("load", () => {
				if (this.popper) {
					this.popper.instance.update();
				}

				if (this.wrapperPopper) {
					this.wrapperPopper.instance.update();
				}
			});
		}
	}

	componentDidMount() {
		if (!canUseDOM) return;
		const { positionWrapper } = this.state;
		const { children, open, target } = this.props;

		this._isMounted = true;

		log({
			title: "init",
			data: {
				hasChildren: !!children,
				hasTarget: !!target,
				isControlled: is.boolean(open),
				positionWrapper,
				target: this.target,
				floater: this.floaterRef
			},
			debug: this.debug
		});

		this.initPopper();

		if (!children && target && !is.boolean(open)) {
			// add event listener based on event,
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (!canUseDOM) return;

		const { autoOpen, open, target, wrapperOptions } = this.props;
		const { changedFrom, changedTo } = treeChanges(prevState, this.state);

		if (prevProps.open !== open) {
			this.toggle();
		}

		if (
			prevProps.wrapperOptions.position !== wrapperOptions.position ||
			prevProps.target !== target
		) {
			this.changeWrapperPosition(this.props);
		}

		if (changedTo("status", STATUS.IDLE) && open) {
			this.toggle(STATUS.OPEN);
		} else if (changedFrom("status", STATUS.INIT, STATUS.IDLE) && autoOpen) {
			this.toggle(STATUS.OPEN);
		}

		if (this.popper && changedTo("status", STATUS.OPENING)) {
			this.popper.instance.update();
		}

		if (
			this.floaterRef &&
			(changedTo("status", STATUS.OPENING) ||
				changedTo("status", STATUS.CLOSING))
		) {
			once(this.floaterRef, "transitionend", this.handleTransitionEnd);
		}
	}

	componentWillUnmount() {
		if (!canUseDOM) return;

		this._isMounted = false;

		if (this.popper) {
			this.popper.instance.destroy();
		}

		if (this.wrapperPopper) {
			this.wrapperPopper.instance.destroy();
		}
	}

	initPopper(target = this.target) {
		const { positionWrapper } = this.state;
		const {
			disableFlip,
			getPopper,
			hideArrow,
			offset,
			placement,
			wrapperOptions
		} = this.props;
		const flipBehavior =
			placement === "top" || placement === "bottom"
				? "flip"
				: [
						"right",
						"bottom-end",
						"top-end",
						"left",
						"top-start",
						"bottom-start"
				  ];

		/* istanbul ignore else */
		if (placement === "center") {
			this.setState({ status: STATUS.IDLE });
		} else if (target && this.floaterRef) {
			new Popper(target, this.floaterRef, {
				placement,
				modifiers: {
					arrow: {
						enabled: !hideArrow,
						element: this.arrowRef,
						...this.options.arrow
					},
					computeStyle: this.options.computeStyle,
					flip: {
						enabled: !disableFlip,
						behavior: flipBehavior,
						...this.options.flip
					},
					keepTogether: this.options.keepTogether,
					hide: this.options.hide,
					inner: this.options.inner,
					offset: {
						offset: `0, ${offset}px`,
						...this.options.offset
					},
					preventOverflow: this.options.preventOverflow,
					shift: this.options.shift
				},
				onCreate: data => {
					this.popper = data;

					getPopper(data, "floater");

					if (this._isMounted) {
						this.setState({
							currentPlacement: data.placement,
							status: STATUS.IDLE
						});
					}

					if (placement !== data.placement) {
						setTimeout(() => {
							data.instance.update();
						}, 1);
					}
				},
				onUpdate: data => {
					this.popper = data;
					const { currentPlacement } = this.state;

					if (this._isMounted && data.placement !== currentPlacement) {
						this.setState({ currentPlacement: data.placement });
					}
				}
			});
		}

		if (positionWrapper) {
			const wrapperOffset = !is.undefined(wrapperOptions.offset)
				? wrapperOptions.offset
				: 0;

			new Popper(this.target, this.wrapperRef, {
				placement: wrapperOptions.placement || placement,
				modifiers: {
					arrow: {
						enabled: false
					},
					offset: {
						offset: `0, ${wrapperOffset}px`
					},
					flip: {
						enabled: false
					}
				},
				onCreate: data => {
					this.wrapperPopper = data;

					if (this._isMounted) {
						this.setState({ statusWrapper: STATUS.IDLE });
					}

					getPopper(data, "wrapper");

					if (placement !== data.placement) {
						setTimeout(() => {
							data.instance.update();
						}, 1);
					}
				}
			});
		}
	}

	changeWrapperPosition({ target, wrapperOptions }) {
		this.setState({
			positionWrapper: wrapperOptions.position && !!target
		});
	}

	toggle(forceStatus) {
		const { status } = this.state;
		let nextStatus = status === STATUS.OPEN ? STATUS.CLOSING : STATUS.OPENING;

		if (!is.undefined(forceStatus)) {
			nextStatus = forceStatus;
		}

		this.setState({ status: nextStatus });
	}

	setArrowRef(ref) {
		this.arrowRef = ref;
	}

	setChildRef(ref) {
		this.childRef = ref;
	}

	setFloaterRef(ref) {
		if (!this.floaterRef) {
			this.floaterRef = ref;
		}
	}

	setWrapperRef(ref) {
		this.wrapperRef = ref;
	}

	handleTransitionEnd() {
		const { status } = this.state;
		const { callback } = this.props;

		/* istanbul ignore else */
		if (this.wrapperPopper) {
			this.wrapperPopper.instance.update();
		}

		this.setState(
			{
				status: status === STATUS.OPENING ? STATUS.OPEN : STATUS.IDLE
			},
			() => {
				const { status: newStatus } = this.state;
				callback(newStatus === STATUS.OPEN ? "open" : "close", this.props);
			}
		);
	}

	handleClick() {
		const { event, open } = this.props;

		if (is.boolean(open)) return;

		const { positionWrapper, status } = this.state;

		/* istanbul ignore else */
		if (this.event === "click" || (this.event === "hover" && positionWrapper)) {
			log({
				title: "click",
				data: [
					{ event, status: status === STATUS.OPEN ? "closing" : "opening" }
				],
				debug: this.debug
			});

			this.toggle();
		}
	}

	handleMouseEnter() {
		const { event, open } = this.props;

		if (is.boolean(open) || isMobile()) return;

		const { status } = this.state;

		/* istanbul ignore else */
		if (this.event === "hover" && status === STATUS.IDLE) {
			log({
				title: "mouseEnter",
				data: [{ key: "originalEvent", value: event }],
				debug: this.debug
			});

			clearTimeout(this.eventDelayTimeout);
			this.toggle();
		}
	}

	handleMouseLeave() {
		const { event, eventDelay, open } = this.props;

		if (is.boolean(open) || isMobile()) return;

		const { status, positionWrapper } = this.state;

		/* istanbul ignore else */
		if (this.event === "hover") {
			log({
				title: "mouseLeave",
				data: [{ key: "originalEvent", value: event }],
				debug: this.debug
			});

			if (!eventDelay) {
				this.toggle(STATUS.IDLE);
			} else if (
				[STATUS.OPENING, STATUS.OPEN].includes(status) &&
				!positionWrapper &&
				!this.eventDelayTimeout
			) {
				this.eventDelayTimeout = setTimeout(() => {
					delete this.eventDelayTimeout;

					this.toggle();
				}, eventDelay * 1000);
			}
		}
	}

	get debug() {
		const { debug } = this.props;

		return debug || !!global.ReactFloaterDebug;
	}

	get event() {
		const { disableHoverToClick, event } = this.props;

		if (event === "hover" && isMobile() && !disableHoverToClick) {
			return "click";
		}

		return event;
	}

	get options() {
		const { options } = this.props;

		return deepmerge(DEFAULTS, options || {});
	}

	get styles() {
		const { status, positionWrapper, statusWrapper } = this.state;
		const { styles } = this.props;

		const nextStyles = deepmerge(getStyles(styles), styles);

		if (positionWrapper) {
			let wrapperStyles;

			if (
				![STATUS.IDLE].includes(status) ||
				![STATUS.IDLE].includes(statusWrapper)
			) {
				wrapperStyles = nextStyles.wrapperPosition;
			} else {
				wrapperStyles = this.wrapperPopper.styles;
			}

			nextStyles.wrapper = {
				...nextStyles.wrapper,
				...wrapperStyles
			};
		}

		/* istanbul ignore else */
		if (this.target) {
			const targetStyles = window.getComputedStyle(this.target);

			/* istanbul ignore else */
			if (this.wrapperStyles) {
				nextStyles.wrapper = {
					...nextStyles.wrapper,
					...this.wrapperStyles
				};
			} else if (!["relative", "static"].includes(targetStyles.position)) {
				this.wrapperStyles = {};

				if (!positionWrapper) {
					POSITIONING_PROPS.forEach(d => {
						this.wrapperStyles[d] = targetStyles[d];
					});

					nextStyles.wrapper = {
						...nextStyles.wrapper,
						...this.wrapperStyles
					};

					this.target.style.position = "relative";
					this.target.style.top = "auto";
					this.target.style.right = "auto";
					this.target.style.bottom = "auto";
					this.target.style.left = "auto";
				}
			}
		}

		return nextStyles;
	}

	get target() {
		if (!canUseDOM) return null;

		const { target } = this.props;

		if (target) {
			if (is.domElement(target)) {
				return target;
			}

			return document.querySelector(target);
		}

		return this.childRef || this.wrapperRef;
	}

	render() {
		const { currentPlacement, positionWrapper, status } = this.state;
		const {
			children,
			component,
			content,
			disableAnimation,
			footer,
			hideArrow,
			id,
			isPositioned,
			open,
			showCloseButton,
			style,
			target,
			title
		} = this.props;

		const wrapper = (
			<FloaterWrapper
				handleClick={this.handleClick}
				handleMouseEnter={this.handleMouseEnter}
				handleMouseLeave={this.handleMouseLeave}
				setChildRef={this.setChildRef}
				setWrapperRef={this.setWrapperRef}
				style={style}
				styles={this.styles.wrapper}
			>
				{children}
			</FloaterWrapper>
		);

		const output = {};

		if (positionWrapper) {
			output.wrapperInPortal = wrapper;
		} else {
			output.wrapperAsChildren = wrapper;
		}

		return (
			<span>
				<FloaterPortal
					hasChildren={!!children}
					id={id}
					placement={currentPlacement}
					setRef={this.setFloaterRef}
					target={target}
					zIndex={this.styles.options.zIndex}
				>
					<Floater
						component={component}
						content={content}
						disableAnimation={disableAnimation}
						footer={footer}
						handleClick={this.handleClick}
						hideArrow={hideArrow || currentPlacement === "center"}
						isPositioned={isPositioned}
						open={open}
						placement={currentPlacement}
						positionWrapper={positionWrapper}
						setArrowRef={this.setArrowRef}
						setFloaterRef={this.setFloaterRef}
						showCloseButton={showCloseButton}
						status={status}
						styles={this.styles}
						title={title}
					/>
					{output.wrapperInPortal}
				</FloaterPortal>
				{output.wrapperAsChildren}
			</span>
		);
	}
}

AnterosFloater.propTypes = {
	autoOpen: PropTypes.bool,
	callback: PropTypes.func,
	children: PropTypes.node,
	component: isRequiredIf(
		PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
		props => !props.content
	),
	content: isRequiredIf(PropTypes.node, props => !props.component),
	debug: PropTypes.bool,
	disableAnimation: PropTypes.bool,
	disableFlip: PropTypes.bool,
	disableHoverToClick: PropTypes.bool,
	event: PropTypes.oneOf(["hover", "click"]),
	eventDelay: PropTypes.number,
	footer: PropTypes.node,
	getPopper: PropTypes.func,
	hideArrow: PropTypes.bool,
	id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	isPositioned: PropTypes.bool,
	offset: PropTypes.number,
	open: PropTypes.bool,
	options: PropTypes.object,
	placement: PropTypes.oneOf([
		"top",
		"top-start",
		"top-end",
		"bottom",
		"bottom-start",
		"bottom-end",
		"left",
		"left-start",
		"left-end",
		"right",
		"right-start",
		"right-end",
		"auto",
		"center"
	]),
	showCloseButton: PropTypes.bool,
	style: PropTypes.object,
	styles: PropTypes.object,
	target: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	title: PropTypes.node,
	wrapperOptions: PropTypes.shape({
		offset: PropTypes.number,
		placement: PropTypes.oneOf([
			"top",
			"top-start",
			"top-end",
			"bottom",
			"bottom-start",
			"bottom-end",
			"left",
			"left-start",
			"left-end",
			"right",
			"right-start",
			"right-end",
			"auto"
		]),
		position: PropTypes.bool
	})
};

AnterosFloater.defaultProps = {
	autoOpen: false,
	callback: noop,
	debug: false,
	disableAnimation: false,
	disableFlip: false,
	disableHoverToClick: false,
	event: "click",
	eventDelay: 0.4,
	getPopper: noop,
	hideArrow: false,
	offset: 15,
	placement: "bottom",
	showCloseButton: false,
	styles: {},
	target: null,
	wrapperOptions: {
		position: false
	}
};
