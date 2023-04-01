(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@anterostecnologia/anteros-react-chat", [], factory);
	else if(typeof exports === 'object')
		exports["@anterostecnologia/anteros-react-chat"] = factory();
	else
		root["@anterostecnologia/anteros-react-chat"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/AudioMessage/AudioMessage.tsx":
/*!*******************************************!*\
  !*** ./src/AudioMessage/AudioMessage.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const AudioMessage = props => {
    const controlsList = props.data.controlsList;
    return (react_1.default.createElement("div", { className: 'rce-mbox-audio', style: props.customStyle },
        react_1.default.createElement("audio", Object.assign({}, props.audioProps, { controls: true, controlsList: controlsList ? controlsList : 'nodownload' }),
            react_1.default.createElement("source", { src: props.data.audioURL, type: props.data.audioType || 'audio/mp3' }),
            "Your browser does not support the audio element."),
        props.text && react_1.default.createElement("div", { className: 'rce-mbox-text' }, props.text)));
};
exports["default"] = AudioMessage;


/***/ }),

/***/ "./src/Avatar/Avatar.tsx":
/*!*******************************!*\
  !*** ./src/Avatar/Avatar.tsx ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const react_2 = __webpack_require__(/*! react */ "react");
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const Avatar = (_a) => {
    var { type = 'default', size = 'default', lazyLoadingImage = undefined } = _a, props = __rest(_a, ["type", "size", "lazyLoadingImage"]);
    let loadedAvatars = [];
    let loading = false;
    let src = props.src;
    let isLazyImage = false;
    (0, react_2.useEffect)(() => {
        if (lazyLoadingImage) {
            isLazyImage = true;
            if (!isLoaded(src)) {
                src = lazyLoadingImage;
                if (!loading) {
                    requestImage(props.src);
                }
            }
            else {
                isLazyImage = false;
            }
        }
    }, []);
    const isLoaded = (src) => {
        return loadedAvatars.indexOf(src) !== -1;
    };
    const requestImage = (src) => {
        loading = true;
        var loaded = () => {
            loadedAvatars.push(src);
            loading = false;
        };
        var img = document.createElement('img');
        img.src = src;
        img.onload = loaded;
        img.onerror = loaded;
    };
    const stringToColour = (str) => {
        var hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (let i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xff;
            value = (value % 150) + 50;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    };
    return (
    // @ts-ignore
    react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-avatar-container', type, size, props.className) },
        props.letterItem ? (react_1.default.createElement("div", { className: 'rce-avatar-letter-background', style: { backgroundColor: stringToColour(props.letterItem.id) } },
            react_1.default.createElement("span", { className: 'rce-avatar-letter' }, props.letterItem.letter))) : (react_1.default.createElement("img", { alt: props.alt, src: src, onError: props.onError, className: (0, classnames_1.default)('rce-avatar', { 'rce-avatar-lazy': isLazyImage }) })),
        props.sideElement));
};
exports["default"] = Avatar;


/***/ }),

/***/ "./src/Button/Button.tsx":
/*!*******************************!*\
  !*** ./src/Button/Button.tsx ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const Button = (_a) => {
    var { disabled = false, backgroundColor = '#3979aa', color = 'white' } = _a, props = __rest(_a, ["disabled", "backgroundColor", "color"]);
    return (react_1.default.createElement("button", { ref: props.buttonRef, title: props.title, className: (0, classnames_1.default)('rce-button', props.type, props.className), style: {
            backgroundColor: backgroundColor,
            color: color,
            borderColor: backgroundColor,
        }, disabled: disabled, onClick: props.onClick }, props.icon ? (react_1.default.createElement("span", { className: 'rce-button-icon--container' },
        (props.icon.float === 'right' || !props.icon.float) && react_1.default.createElement("span", null, props.text),
        react_1.default.createElement("span", { style: { float: props.icon.float, fontSize: props.icon.size || 12 }, className: 'rce-button-icon' }, props.icon.component),
        props.icon.float === 'left' && react_1.default.createElement("span", null, props.text))) : (react_1.default.createElement("span", null, props.text))));
};
exports["default"] = Button;


/***/ }),

/***/ "./src/ChatItem/ChatItem.tsx":
/*!***********************************!*\
  !*** ./src/ChatItem/ChatItem.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const Avatar_1 = __importDefault(__webpack_require__(/*! ../Avatar/Avatar */ "./src/Avatar/Avatar.tsx"));
const timeago_js_1 = __webpack_require__(/*! timeago.js */ "timeago.js");
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const md_1 = __webpack_require__(/*! react-icons/md */ "react-icons/md");
const ChatItem = (_a) => {
    var { avatarFlexible = false, date = new Date(), unread = 0, statusColorType = 'badge', lazyLoadingImage = undefined, onAvatarError = () => void 0 } = _a, props = __rest(_a, ["avatarFlexible", "date", "unread", "statusColorType", "lazyLoadingImage", "onAvatarError"]);
    const [onHoverTool, setOnHoverTool] = (0, react_1.useState)(false);
    const [onDrag, setOnDrag] = (0, react_1.useState)(false);
    const handleOnMouseEnter = () => {
        setOnHoverTool(true);
    };
    const handleOnMouseLeave = () => {
        setOnHoverTool(false);
    };
    const handleOnClick = (e) => {
        var _a;
        e.preventDefault();
        if (onHoverTool === true)
            return;
        (_a = props.onClick) === null || _a === void 0 ? void 0 : _a.call(props, e);
    };
    const onDragOver = (e) => {
        e.preventDefault();
        if (props.onDragOver instanceof Function)
            props.onDragOver(e, props.id);
    };
    const onDragEnter = (e) => {
        e.preventDefault();
        if (props.onDragEnter instanceof Function)
            props.onDragEnter(e, props.id);
        if (!onDrag)
            setOnDrag(true);
    };
    const onDragLeave = (e) => {
        e.preventDefault();
        if (props.onDragLeave instanceof Function)
            props.onDragLeave(e, props.id);
        if (onDrag)
            setOnDrag(false);
    };
    const onDrop = (e) => {
        e.preventDefault();
        if (props.onDrop instanceof Function)
            props.onDrop(e, props.id);
        if (onDrag)
            setOnDrag(false);
    };
    return (react_1.default.createElement("div", { key: props.id, className: (0, classnames_1.default)('rce-container-citem', props.className), onClick: handleOnClick, onContextMenu: props.onContextMenu },
        react_1.default.createElement("div", { className: 'rce-citem', onDragOver: onDragOver, onDragEnter: onDragEnter, onDragLeave: onDragLeave, onDrop: onDrop },
            !!props.onDragComponent && onDrag && props.onDragComponent(props.id),
            ((onDrag && !props.onDragComponent) || !onDrag) && [
                react_1.default.createElement("div", { key: 'avatar', className: (0, classnames_1.default)('rce-citem-avatar', { 'rce-citem-status-encircle': statusColorType === 'encircle' }) },
                    react_1.default.createElement(Avatar_1.default, { src: props.avatar, alt: props.alt, className: statusColorType === 'encircle' ? 'rce-citem-avatar-encircle-status' : '', size: 'large', letterItem: props.letterItem, sideElement: props.statusColor ? (react_1.default.createElement("span", { className: 'rce-citem-status', style: statusColorType === 'encircle'
                                ? {
                                    border: `solid 2px ${props.statusColor}`,
                                }
                                : {
                                    backgroundColor: props.statusColor,
                                } }, props.statusText)) : (react_1.default.createElement(react_1.default.Fragment, null)), onError: onAvatarError, lazyLoadingImage: lazyLoadingImage, type: (0, classnames_1.default)('circle', { 'flexible': avatarFlexible }) })),
                react_1.default.createElement("div", { key: 'rce-citem-body', className: 'rce-citem-body' },
                    react_1.default.createElement("div", { className: 'rce-citem-body--top' },
                        react_1.default.createElement("div", { className: 'rce-citem-body--top-title' }, props.title),
                        react_1.default.createElement("div", { className: 'rce-citem-body--top-time' }, date && (props.dateString || (0, timeago_js_1.format)(date)))),
                    react_1.default.createElement("div", { className: 'rce-citem-body--bottom' },
                        react_1.default.createElement("div", { className: 'rce-citem-body--bottom-title' }, props.subtitle),
                        react_1.default.createElement("div", { className: 'rce-citem-body--bottom-tools', onMouseEnter: handleOnMouseEnter, onMouseLeave: handleOnMouseLeave },
                            props.showMute && (react_1.default.createElement("div", { className: 'rce-citem-body--bottom-tools-item', onClick: props.onClickMute },
                                props.muted === true && react_1.default.createElement(md_1.MdVolumeOff, null),
                                props.muted === false && react_1.default.createElement(md_1.MdVolumeUp, null))),
                            props.showVideoCall && (react_1.default.createElement("div", { className: 'rce-citem-body--bottom-tools-item', onClick: props.onClickVideoCall },
                                react_1.default.createElement(md_1.MdVideoCall, null)))),
                        react_1.default.createElement("div", { className: 'rce-citem-body--bottom-tools-item-hidden-hover' }, props.showMute && props.muted && (react_1.default.createElement("div", { className: 'rce-citem-body--bottom-tools-item' },
                            react_1.default.createElement(md_1.MdVolumeOff, null)))),
                        react_1.default.createElement("div", { className: 'rce-citem-body--bottom-status' }, unread && unread > 0 ? react_1.default.createElement("span", null, unread) : null),
                        props.customStatusComponents !== undefined ? props.customStatusComponents.map(Item => react_1.default.createElement(Item, null)) : null)),
            ])));
};
exports["default"] = ChatItem;


/***/ }),

/***/ "./src/ChatList/ChatList.tsx":
/*!***********************************!*\
  !*** ./src/ChatList/ChatList.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const ChatItem_1 = __importDefault(__webpack_require__(/*! ../ChatItem/ChatItem */ "./src/ChatItem/ChatItem.tsx"));
const ChatList = props => {
    const onClick = (item, index, event) => {
        if (props.onClick instanceof Function)
            props.onClick(item, index, event);
    };
    const onContextMenu = (item, index, event) => {
        event.preventDefault();
        if (props.onContextMenu instanceof Function)
            props.onContextMenu(item, index, event);
    };
    const onAvatarError = (item, index, event) => {
        if (props.onAvatarError instanceof Function)
            props.onAvatarError(item, index, event);
    };
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-container-clist', props.className) }, props.dataSource.map((x, i) => (react_1.default.createElement(ChatItem_1.default, Object.assign({}, x, { key: i, lazyLoadingImage: props.lazyLoadingImage, onAvatarError: (e) => onAvatarError(x, i, e), onContextMenu: (e) => onContextMenu(x, i, e), onClick: (e) => onClick(x, i, e), onClickMute: (e) => { var _a; return (_a = props.onClickMute) === null || _a === void 0 ? void 0 : _a.call(props, x, i, e); }, onClickVideoCall: (e) => { var _a; return (_a = props.onClickVideoCall) === null || _a === void 0 ? void 0 : _a.call(props, x, i, e); }, onDragOver: props === null || props === void 0 ? void 0 : props.onDragOver, onDragEnter: props === null || props === void 0 ? void 0 : props.onDragEnter, onDrop: props.onDrop, onDragLeave: props.onDragLeave, onDragComponent: props.onDragComponent }))))));
};
exports["default"] = ChatList;


/***/ }),

/***/ "./src/Circle/Circle.tsx":
/*!*******************************!*\
  !*** ./src/Circle/Circle.tsx ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const react_2 = __webpack_require__(/*! react */ "react");
const progressbar_js_1 = __webpack_require__(/*! progressbar.js */ "progressbar.js");
let wrapper;
const ProgressCircle = ({ animate, progressOptions, className }) => {
    const bar = (0, react_2.useMemo)(() => {
        wrapper = document.createElement('div');
        return new progressbar_js_1.Circle(wrapper, progressOptions);
    }, []);
    const node = (0, react_2.useCallback)((node) => {
        if (node) {
            node.appendChild(wrapper);
        }
    }, []);
    (0, react_2.useEffect)(() => {
        bar.animate(animate);
    }, [animate, bar]);
    return react_1.default.createElement("div", { className: className, ref: node });
};
exports["default"] = ProgressCircle;


/***/ }),

/***/ "./src/Dropdown/Dropdown.tsx":
/*!***********************************!*\
  !*** ./src/Dropdown/Dropdown.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const Button_1 = __importDefault(__webpack_require__(/*! ../Button/Button */ "./src/Button/Button.tsx"));
const Dropdown = (_a) => {
    var _b;
    var { animationPosition = 'nortwest', animationType = 'default' } = _a, props = __rest(_a, ["animationPosition", "animationType"]);
    const [show, setShow] = (0, react_1.useState)(undefined);
    const onBlur = () => {
        if (show === true)
            setShow(false);
    };
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-dropdown-container', props.className), onBlur: onBlur },
        react_1.default.createElement(Button_1.default, Object.assign({}, props.buttonProps, { onClick: () => setShow(!show) })),
        react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-dropdown', animationType, 'rce-dropdown-open__' + animationPosition, { 'dropdown-hide': show === false }, { 'dropdown-show': show === true }) },
            react_1.default.createElement("ul", null,
                props.title && react_1.default.createElement("span", { className: 'rce-dropdown-title' }, props.title), (_b = props.items) === null || _b === void 0 ? void 0 :
                _b.map((x, i) => (react_1.default.createElement("li", { key: i, onMouseDown: e => props.onSelect(i) }, x instanceof Object ? (x.icon ? (react_1.default.createElement("span", { className: 'rce-button-icon--container' },
                    (x.icon.float === 'right' || !x.icon.float) && react_1.default.createElement("a", null, x.text),
                    react_1.default.createElement("span", { style: { float: x.icon.float, color: x.icon.color, fontSize: x.icon.size || 12 }, className: (0, classnames_1.default)('rce-button-icon', x.icon.className) }, x.icon.component),
                    x.icon.float === 'left' && react_1.default.createElement("a", null, x.text))) : (react_1.default.createElement("a", null, x.text))) : (react_1.default.createElement("a", null, x)))))))));
};
exports["default"] = Dropdown;


/***/ }),

/***/ "./src/FileMessage/FileMessage.tsx":
/*!*****************************************!*\
  !*** ./src/FileMessage/FileMessage.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const fa_1 = __webpack_require__(/*! react-icons/fa */ "react-icons/fa");
const Circle_1 = __importDefault(__webpack_require__(/*! ../Circle/Circle */ "./src/Circle/Circle.tsx"));
const FileMessage = props => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var progressOptions = {
        strokeWidth: 5,
        color: '#333',
        trailColor: '#aaa',
        trailWidth: 5,
        step: (state, circle) => {
            circle.path.setAttribute('trail', state.color);
            circle.path.setAttribute('trailwidth-width', state.width);
            var value = Math.round(circle.value() * 100);
            if (value === 0)
                circle.setText('');
            else
                circle.setText(value);
        },
    };
    const error = ((_a = props === null || props === void 0 ? void 0 : props.data) === null || _a === void 0 ? void 0 : _a.status) && ((_b = props === null || props === void 0 ? void 0 : props.data) === null || _b === void 0 ? void 0 : _b.status.error) === true;
    const onClick = (e) => {
        var _a, _b, _c;
        if (!((_a = props === null || props === void 0 ? void 0 : props.data) === null || _a === void 0 ? void 0 : _a.status))
            return;
        if (!((_b = props === null || props === void 0 ? void 0 : props.data) === null || _b === void 0 ? void 0 : _b.status.download) && props.onDownload instanceof Function)
            props.onDownload(e);
        else if (((_c = props === null || props === void 0 ? void 0 : props.data) === null || _c === void 0 ? void 0 : _c.status.download) && props.onOpen instanceof Function)
            props.onOpen(e);
    };
    return (react_1.default.createElement("div", { className: 'rce-mbox-file' },
        react_1.default.createElement("button", { onClick: onClick },
            react_1.default.createElement("div", { className: 'rce-mbox-file--icon' },
                react_1.default.createElement(fa_1.FaFile, { color: '#aaa' }),
                react_1.default.createElement("div", { className: 'rce-mbox-file--size' }, props === null || props === void 0 ? void 0 : props.data.size)),
            react_1.default.createElement("div", { className: 'rce-mbox-file--text' }, props.text),
            react_1.default.createElement("div", { className: 'rce-mbox-file--buttons' },
                error && (react_1.default.createElement("span", { className: 'rce-error-button' },
                    react_1.default.createElement(fa_1.FaExclamationTriangle, { color: '#ff3d3d' }))),
                !error && ((_c = props === null || props === void 0 ? void 0 : props.data) === null || _c === void 0 ? void 0 : _c.status) && !((_d = props === null || props === void 0 ? void 0 : props.data) === null || _d === void 0 ? void 0 : _d.status.download) && !((_e = props === null || props === void 0 ? void 0 : props.data) === null || _e === void 0 ? void 0 : _e.status.click) && (react_1.default.createElement(fa_1.FaCloudDownloadAlt, { color: '#aaa' })),
                !error &&
                    ((_f = props === null || props === void 0 ? void 0 : props.data) === null || _f === void 0 ? void 0 : _f.status) &&
                    typeof ((_g = props === null || props === void 0 ? void 0 : props.data) === null || _g === void 0 ? void 0 : _g.status.loading) === 'number' &&
                    ((_h = props === null || props === void 0 ? void 0 : props.data) === null || _h === void 0 ? void 0 : _h.status.loading) !== 0 && (react_1.default.createElement(Circle_1.default, { animate: (_j = props === null || props === void 0 ? void 0 : props.data) === null || _j === void 0 ? void 0 : _j.status.loading, className: 'rce-mbox-file--loading', progressOptions: progressOptions }))))));
};
exports["default"] = FileMessage;


/***/ }),

/***/ "./src/Input/Input.tsx":
/*!*****************************!*\
  !*** ./src/Input/Input.tsx ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const Input = (_a) => {
    var { type = 'text', multiline = false, minHeight = 25, maxHeight = 200, autoHeight = true, autofocus = false } = _a, props = __rest(_a, ["type", "multiline", "minHeight", "maxHeight", "autoHeight", "autofocus"]);
    (0, react_1.useEffect)(() => {
        var _a, _b;
        if (autofocus === true)
            (_b = (_a = props.referance) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.focus();
        if (props.clear instanceof Function) {
            props.clear(clear);
        }
    }, []);
    const onChangeEvent = (e) => {
        var _a, _b;
        if (props.maxlength && (e.target.value || '').length > props.maxlength) {
            if (props.onMaxLengthExceed instanceof Function)
                props.onMaxLengthExceed();
            if (((_b = (_a = props.referance) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.value) == (e.target.value || '').substring(0, props.maxlength))
                return;
        }
        if (props.onChange instanceof Function)
            props.onChange(e);
        if (multiline === true) {
            if (autoHeight === true) {
                if (e.target.style.height !== minHeight + 'px') {
                    e.target.style.height = minHeight + 'px';
                }
                let height;
                if (e.target.scrollHeight <= maxHeight)
                    height = e.target.scrollHeight + 'px';
                else
                    height = maxHeight + 'px';
                if (e.target.style.height !== height) {
                    e.target.style.height = height;
                }
            }
        }
    };
    const clear = () => {
        var _a, _b, _c;
        var _event = {
            FAKE_EVENT: true,
            target: (_a = props.referance) === null || _a === void 0 ? void 0 : _a.current,
        };
        if ((_c = (_b = props.referance) === null || _b === void 0 ? void 0 : _b.current) === null || _c === void 0 ? void 0 : _c.value) {
            props.referance.current.value = '';
        }
        onChangeEvent(_event);
    };
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-container-input', props.className) },
        props.leftButtons && react_1.default.createElement("div", { className: 'rce-input-buttons' }, props.leftButtons),
        multiline === false ? (react_1.default.createElement("input", { ref: props.referance, type: type, className: (0, classnames_1.default)('rce-input'), placeholder: props.placeholder, defaultValue: props.defaultValue, style: props.inputStyle, onChange: onChangeEvent, onCopy: props.onCopy, onCut: props.onCut, onPaste: props.onPaste, onBlur: props.onBlur, onFocus: props.onFocus, onSelect: props.onSelect, onSubmit: props.onSubmit, onReset: props.onReset, onKeyDown: props.onKeyDown, onKeyPress: props.onKeyPress, onKeyUp: props.onKeyUp })) : (react_1.default.createElement("textarea", { ref: props.referance, className: (0, classnames_1.default)('rce-input', 'rce-input-textarea'), placeholder: props.placeholder, defaultValue: props.defaultValue, style: props.inputStyle, onChange: onChangeEvent, onCopy: props.onCopy, onCut: props.onCut, onPaste: props.onPaste, onBlur: props.onBlur, onFocus: props.onFocus, onSelect: props.onSelect, onSubmit: props.onSubmit, onReset: props.onReset, onKeyDown: props.onKeyDown, onKeyPress: props.onKeyPress, onKeyUp: props.onKeyUp })),
        props.rightButtons && react_1.default.createElement("div", { className: 'rce-input-buttons' }, props.rightButtons)));
};
exports["default"] = Input;


/***/ }),

/***/ "./src/LocationMessage/LocationMessage.tsx":
/*!*************************************************!*\
  !*** ./src/LocationMessage/LocationMessage.tsx ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const STATIC_URL = 'https://maps.googleapis.com/maps/api/staticmap?markers=color:MARKER_COLOR|LATITUDE,LONGITUDE&zoom=ZOOM&size=270x200&scale=2&key=KEY';
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=LATITUDE,LONGITUDE&zoom=ZOOM';
const LocationMessage = (_a) => {
    var { markerColor = 'red', target = '_blank', zoom = '14' } = _a, props = __rest(_a, ["markerColor", "target", "zoom"]);
    const buildURL = (url) => {
        return url
            .replace(/LATITUDE/g, props === null || props === void 0 ? void 0 : props.data.latitude)
            .replace(/LONGITUDE/g, props === null || props === void 0 ? void 0 : props.data.longitude)
            .replace('MARKER_COLOR', markerColor)
            .replace('ZOOM', zoom)
            .replace('KEY', props.apiKey);
    };
    const className = () => {
        var _className = (0, classnames_1.default)('rce-mbox-location', props.className);
        if (props.text) {
            _className = (0, classnames_1.default)(_className, 'rce-mbox-location-has-text');
        }
        return _className;
    };
    return (react_1.default.createElement("div", { className: 'rce-container-lmsg' },
        react_1.default.createElement("a", { onClick: props.onOpen, target: target, href: props.href || props.src || buildURL(props.data.mapURL || MAP_URL), className: className() },
            react_1.default.createElement("img", { onError: props.onError, className: 'rce-mbox-location-img', src: props.src || buildURL(props.data.staticURL || STATIC_URL) })),
        props.text && react_1.default.createElement("div", { className: 'rce-mbox-text rce-mbox-location-text' }, props.text)));
};
exports["default"] = LocationMessage;


/***/ }),

/***/ "./src/MeetingItem/MeetingItem.tsx":
/*!*****************************************!*\
  !*** ./src/MeetingItem/MeetingItem.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const md_1 = __webpack_require__(/*! react-icons/md */ "react-icons/md");
const Avatar_1 = __importDefault(__webpack_require__(/*! ../Avatar/Avatar */ "./src/Avatar/Avatar.tsx"));
const timeago_js_1 = __webpack_require__(/*! timeago.js */ "timeago.js");
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const MeetingItem = (_a) => {
    var { subjectLimit = 60, onClick = () => void 0, avatarFlexible = false, date = new Date(), lazyLoadingImage = undefined, avatarLimit = 5, avatars = [], audioMuted = true, onAvatarError = () => void 0, onMeetingClick = () => void 0, onShareClick = () => void 0 } = _a, props = __rest(_a, ["subjectLimit", "onClick", "avatarFlexible", "date", "lazyLoadingImage", "avatarLimit", "avatars", "audioMuted", "onAvatarError", "onMeetingClick", "onShareClick"]);
    const statusColorType = props.statusColorType;
    const AVATAR_LIMIT = avatarLimit;
    const dateText = date && (props.dateString || (0, timeago_js_1.format)(date));
    const subject = props.subject && subjectLimit && props.subject.substring(0, subjectLimit) + (props.subject.length > subjectLimit ? '...' : '');
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-container-mtitem', props.className), onClick: onClick, onContextMenu: props.onContextMenu },
        react_1.default.createElement("audio", { autoPlay: true, loop: true, muted: audioMuted, src: props.audioSource }),
        react_1.default.createElement("div", { className: 'rce-mtitem' },
            react_1.default.createElement("div", { className: 'rce-mtitem-top' },
                react_1.default.createElement("div", { className: 'rce-mtitem-subject' }, subject),
                react_1.default.createElement("div", { className: 'rce-mtitem-share', onClick: onShareClick },
                    react_1.default.createElement(md_1.MdLink, null))),
            react_1.default.createElement("div", { className: 'rce-mtitem-body' },
                react_1.default.createElement("div", { className: 'rce-mtitem-body--avatars' }, 
                // props.avatars?.slice(0, AVATAR_LIMIT).map((x, i) => x instanceof Avatar ? x : (
                avatars === null || avatars === void 0 ? void 0 :
                    avatars.slice(0, AVATAR_LIMIT).map((x, i) => (react_1.default.createElement(Avatar_1.default, { key: i, src: x.src, alt: x.alt, className: x.statusColorType === 'encircle' ? 'rce-mtitem-avatar-encircle-status' : '', size: 'small', letterItem: x.letterItem, sideElement: x.statusColor ? (react_1.default.createElement("span", { className: 'rce-mtitem-status', style: statusColorType === 'encircle'
                                ? {
                                    boxShadow: `inset 0 0 0 2px ${x.statusColor}, inset 0 0 0 5px #FFFFFF`,
                                }
                                : {
                                    backgroundColor: x.statusColor,
                                } }, x.statusText)) : (react_1.default.createElement(react_1.default.Fragment, null)), onError: onAvatarError, lazyLoadingImage: lazyLoadingImage, type: (0, classnames_1.default)('circle', { 'flexible': avatarFlexible }) }))),
                    avatars && AVATAR_LIMIT && avatars.length > AVATAR_LIMIT && (react_1.default.createElement("div", { className: 'rce-avatar-container circle small rce-mtitem-letter' },
                        react_1.default.createElement("span", null, '+' + (avatars.length - AVATAR_LIMIT))))),
                react_1.default.createElement("div", { className: 'rce-mtitem-body--functions' },
                    props.closable && (react_1.default.createElement("div", { className: 'rce-mtitem-closable', onClick: props.onCloseClick },
                        react_1.default.createElement(md_1.MdCall, null))),
                    react_1.default.createElement("div", { className: 'rce-mtitem-button', onClick: onMeetingClick },
                        react_1.default.createElement(md_1.MdVideoCall, null)))),
            react_1.default.createElement("div", { className: 'rce-mtitem-footer' },
                react_1.default.createElement("span", { className: 'rce-mtitem-date' }, dateText)))));
};
exports["default"] = MeetingItem;


/***/ }),

/***/ "./src/MeetingLink/MeetingLink.tsx":
/*!*****************************************!*\
  !*** ./src/MeetingLink/MeetingLink.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const MeetingLink = props => {
    var _a;
    return (react_1.default.createElement("div", { className: 'rce-mtlink' },
        react_1.default.createElement("div", { className: 'rce-mtlink-content' },
            react_1.default.createElement("div", { className: 'rce-mtlink-item' },
                react_1.default.createElement("div", { className: 'rce-mtlink-title' }, props.text)),
            react_1.default.createElement("div", { className: 'rce-mtlink-btn' }, (_a = props === null || props === void 0 ? void 0 : props.actionButtons) === null || _a === void 0 ? void 0 : _a.map((Item) => {
                return (react_1.default.createElement("div", { className: 'rce-mtlink-btn-content', onClick: () => { var _a; return Item.onClickButton((_a = props === null || props === void 0 ? void 0 : props.meetingID) !== null && _a !== void 0 ? _a : ''); } },
                    react_1.default.createElement(Item.Component, null)));
            })))));
};
exports["default"] = MeetingLink;


/***/ }),

/***/ "./src/MeetingList/MeetingList.tsx":
/*!*****************************************!*\
  !*** ./src/MeetingList/MeetingList.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const MeetingItem_1 = __importDefault(__webpack_require__(/*! ../MeetingItem/MeetingItem */ "./src/MeetingItem/MeetingItem.tsx"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const MeetingList = props => {
    var _a;
    const onClick = (item, index, event) => {
        if (props.onClick instanceof Function)
            props.onClick(item, index, event);
    };
    const onContextMenu = (item, index, event) => {
        event.preventDefault();
        if (props.onContextMenu instanceof Function)
            props.onContextMenu(item, index, event);
    };
    const onAvatarError = (item, index, event) => {
        if (props.onAvatarError instanceof Function)
            props.onAvatarError(item, index, event);
    };
    const onMeetingClick = (item, index, event) => {
        if (props.onMeetingClick instanceof Function)
            props.onMeetingClick(item, index, event);
    };
    const onShareClick = (item, index, event) => {
        if (props.onShareClick instanceof Function)
            props.onShareClick(item, index, event);
    };
    const onCloseClick = (item, index, event) => {
        if (props.onCloseClick instanceof Function)
            props.onCloseClick(item, index, event);
    };
    return (react_1.default.createElement("div", { ref: props.cmpRef, className: (0, classnames_1.default)('rce-container-mtlist', props.className) }, (_a = props.dataSource) === null || _a === void 0 ? void 0 : _a.map((x, i) => (react_1.default.createElement(MeetingItem_1.default, Object.assign({ key: i, lazyLoadingImage: props.lazyLoadingImage }, x, { onAvatarError: (e) => onAvatarError(x, i, e), onContextMenu: (e) => onContextMenu(x, i, e), onClick: (e) => onClick(x, i, e), onMeetingClick: (e) => onMeetingClick(x, i, e), onShareClick: (e) => onShareClick(x, i, e), onCloseClick: (e) => onCloseClick(x, i, e) }))))));
};
exports["default"] = MeetingList;


/***/ }),

/***/ "./src/MeetingMessage/MeetingMessage.tsx":
/*!***********************************************!*\
  !*** ./src/MeetingMessage/MeetingMessage.tsx ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const fa_1 = __webpack_require__(/*! react-icons/fa */ "react-icons/fa");
const hi_1 = __webpack_require__(/*! react-icons/hi */ "react-icons/hi");
const io_1 = __webpack_require__(/*! react-icons/io */ "react-icons/io");
const md_1 = __webpack_require__(/*! react-icons/md */ "react-icons/md");
const timeago_js_1 = __webpack_require__(/*! timeago.js */ "timeago.js");
const Avatar_1 = __importDefault(__webpack_require__(/*! ../Avatar/Avatar */ "./src/Avatar/Avatar.tsx"));
const Dropdown_1 = __importDefault(__webpack_require__(/*! ../Dropdown/Dropdown */ "./src/Dropdown/Dropdown.tsx"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const MeetingMessage = (_a) => {
    var { date, dateString, title, subject, collapseTitle, moreItems, participants, dataSource, onClick, onMeetingTitleClick, onMeetingVideoLinkClick, onMeetingMoreSelect } = _a, props = __rest(_a, ["date", "dateString", "title", "subject", "collapseTitle", "moreItems", "participants", "dataSource", "onClick", "onMeetingTitleClick", "onMeetingVideoLinkClick", "onMeetingMoreSelect"]);
    const [toogle, setToogle] = (0, react_1.useState)(false);
    const PARTICIPANT_LIMIT = props.participantsLimit;
    const dateText = dateString ? dateString : date && (0, timeago_js_1.format)(date);
    const _onMeetingLinkClick = (item, index, event) => {
        if (onMeetingTitleClick instanceof Function)
            onMeetingTitleClick(item, index, event);
    };
    const _onMeetingVideoLinkClick = (item, index, event) => {
        if (onMeetingVideoLinkClick instanceof Function)
            onMeetingVideoLinkClick(item, index, event);
    };
    const toggleClick = () => {
        setToogle(!toogle);
    };
    return (react_1.default.createElement("div", { className: 'rce-mbox-mtmg' },
        react_1.default.createElement("div", { className: 'rce-mtmg' },
            react_1.default.createElement("div", { className: 'rce-mtmg-subject' }, subject || 'Unknown Meeting'),
            react_1.default.createElement("div", { className: 'rce-mtmg-body', onClick: onClick },
                react_1.default.createElement("div", { className: 'rce-mtmg-item' },
                    react_1.default.createElement(fa_1.FaCalendar, null),
                    react_1.default.createElement("div", { className: 'rce-mtmg-content' },
                        react_1.default.createElement("span", { className: 'rce-mtmg-title' }, title),
                        react_1.default.createElement("span", { className: 'rce-mtmg-date' }, dateText))),
                onMeetingMoreSelect && moreItems && moreItems.length > 0 && (react_1.default.createElement("div", null,
                    react_1.default.createElement(Dropdown_1.default, { animationType: 'bottom', animationPosition: 'norteast', buttonProps: {
                            className: 'rce-mtmg-right-icon',
                            icon: {
                                component: react_1.default.createElement(md_1.MdMoreHoriz, null),
                                size: 24,
                            },
                        }, items: moreItems, onSelect: onMeetingMoreSelect })))),
            react_1.default.createElement("div", { className: 'rce-mtmg-body-bottom', onClick: toggleClick }, toogle === true ? (react_1.default.createElement("div", { className: 'rce-mtmg-bottom--tptitle' },
                react_1.default.createElement(fa_1.FaCaretDown, null),
                react_1.default.createElement("span", null, collapseTitle))) : (react_1.default.createElement("div", { className: 'rce-mtmg-body-bottom--bttitle' },
                react_1.default.createElement(fa_1.FaCaretRight, null),
                react_1.default.createElement("span", null, participants === null || participants === void 0 ? void 0 :
                    participants.slice(0, PARTICIPANT_LIMIT).map(x => x.title || 'Unknow').join(', '),
                    participants &&
                        PARTICIPANT_LIMIT &&
                        participants.length > PARTICIPANT_LIMIT &&
                        `, +${participants.length - PARTICIPANT_LIMIT}`)))),
            react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-mtmg-toogleContent', { 'rce-mtmg-toogleContent--click': toogle === true }) }, dataSource &&
                dataSource.map((x, i) => {
                    return (react_1.default.createElement("div", { key: i },
                        !x.event && (react_1.default.createElement("div", { className: 'rce-mitem' },
                            react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-mitem avatar', { 'rce-mitem no-avatar': !x.avatar }) }, x.avatar ? react_1.default.createElement(Avatar_1.default, { src: x.avatar }) : react_1.default.createElement(io_1.IoMdChatboxes, null)),
                            react_1.default.createElement("div", { className: 'rce-mitem-body' },
                                react_1.default.createElement("div", { className: 'rce-mitem-body--top' },
                                    react_1.default.createElement("div", { className: 'rce-mitem-body--top-title', onClick: (e) => _onMeetingLinkClick(x, i, e) }, x.title),
                                    react_1.default.createElement("div", { className: 'rce-mitem-body--top-time' }, x.dateString ? x.dateString : x.date && x.date && (0, timeago_js_1.format)(x.date))),
                                react_1.default.createElement("div", { className: 'rce-mitem-body--bottom' },
                                    react_1.default.createElement("div", { className: 'rce-mitem-body--bottom-title' }, x.message))))),
                        x.event && (react_1.default.createElement("div", { className: 'rce-mitem-event' },
                            react_1.default.createElement("div", { className: 'rce-mitem-bottom-body' },
                                react_1.default.createElement("div", { className: 'rce-mitem-body avatar' },
                                    react_1.default.createElement(hi_1.HiOutlineVideoCamera, null)),
                                react_1.default.createElement("div", { className: 'rce-mitem-bottom-body-top' },
                                    x.event.title,
                                    react_1.default.createElement("div", { className: 'rce-mitem-body--top-time' }, x.dateString ? x.dateString : x.date && (0, timeago_js_1.format)(x.date)),
                                    react_1.default.createElement("div", { className: 'rce-mitem-avatar-content' }, react_1.default.createElement("div", { className: 'rce-mitem-avatar' },
                                        x.event.avatars &&
                                            // x.event.avatars.slice(0, x.event.avatarsLimit).map((x, i) => x instanceof Avatar ? x : (
                                            x.event.avatars.slice(0, x.event.avatarsLimit).map((x, i) => react_1.default.createElement(Avatar_1.default, { key: i, src: x.src })),
                                        x.event.avatars && x.event.avatarsLimit && x.event.avatars.length > x.event.avatarsLimit && (react_1.default.createElement("div", { className: 'rce-mitem-length rce-mitem-tooltip', tooltip: x.event.avatars
                                                .slice(x.event.avatarsLimit, x.event.avatars.length)
                                                .map(avatar => avatar.title)
                                                .join(',')
                                                .toString() },
                                            react_1.default.createElement("span", { className: 'rce-mitem-tooltip-text' }, '+' + (x.event.avatars.length - x.event.avatarsLimit)))))),
                                    x.record && (react_1.default.createElement("div", { className: 'rce-mtmg-call-record' },
                                        react_1.default.createElement("div", { className: 'rce-mtmg-call-body' },
                                            react_1.default.createElement("div", { onClick: (e) => _onMeetingVideoLinkClick(x, i, e), className: 'rce-mtmg-call-avatars' },
                                                react_1.default.createElement(Avatar_1.default, { className: 'rce-mtmg-call-avatars', src: x.record.avatar }),
                                                react_1.default.createElement("div", { className: 'rce-mtmg-record-time' }, x.record.time)),
                                            react_1.default.createElement("div", { className: 'rce-mtmg-call-body-title' },
                                                react_1.default.createElement("span", null, x.record.title),
                                                react_1.default.createElement("div", { className: 'rce-mtmg-call-body-bottom' }, x.record.savedBy)))))))))));
                })))));
};
exports["default"] = MeetingMessage;


/***/ }),

/***/ "./src/MessageBox/MessageBox.tsx":
/*!***************************************!*\
  !*** ./src/MessageBox/MessageBox.tsx ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const PhotoMessage_1 = __importDefault(__webpack_require__(/*! ../PhotoMessage/PhotoMessage */ "./src/PhotoMessage/PhotoMessage.tsx"));
const FileMessage_1 = __importDefault(__webpack_require__(/*! ../FileMessage/FileMessage */ "./src/FileMessage/FileMessage.tsx"));
const SystemMessage_1 = __importDefault(__webpack_require__(/*! ../SystemMessage/SystemMessage */ "./src/SystemMessage/SystemMessage.tsx"));
const LocationMessage_1 = __importDefault(__webpack_require__(/*! ../LocationMessage/LocationMessage */ "./src/LocationMessage/LocationMessage.tsx"));
const SpotifyMessage_1 = __importDefault(__webpack_require__(/*! ../SpotifyMessage/SpotifyMessage */ "./src/SpotifyMessage/SpotifyMessage.tsx"));
const ReplyMessage_1 = __importDefault(__webpack_require__(/*! ../ReplyMessage/ReplyMessage */ "./src/ReplyMessage/ReplyMessage.tsx"));
const MeetingMessage_1 = __importDefault(__webpack_require__(/*! ../MeetingMessage/MeetingMessage */ "./src/MeetingMessage/MeetingMessage.tsx"));
const VideoMessage_1 = __importDefault(__webpack_require__(/*! ../VideoMessage/VideoMessage */ "./src/VideoMessage/VideoMessage.tsx"));
const AudioMessage_1 = __importDefault(__webpack_require__(/*! ../AudioMessage/AudioMessage */ "./src/AudioMessage/AudioMessage.tsx"));
const MeetingLink_1 = __importDefault(__webpack_require__(/*! ../MeetingLink/MeetingLink */ "./src/MeetingLink/MeetingLink.tsx"));
const Avatar_1 = __importDefault(__webpack_require__(/*! ../Avatar/Avatar */ "./src/Avatar/Avatar.tsx"));
const ri_1 = __webpack_require__(/*! react-icons/ri */ "react-icons/ri");
const io_1 = __webpack_require__(/*! react-icons/io */ "react-icons/io");
const md_1 = __webpack_require__(/*! react-icons/md */ "react-icons/md");
const timeago_js_1 = __webpack_require__(/*! timeago.js */ "timeago.js");
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const MessageBox = (_a) => {
    var { focus = false, notch = true, styles } = _a, props = __rest(_a, ["focus", "notch", "styles"]);
    const prevProps = (0, react_1.useRef)(focus);
    const messageRef = (0, react_1.useRef)(null);
    var positionCls = (0, classnames_1.default)('rce-mbox', { 'rce-mbox-right': props.position === 'right' });
    var thatAbsoluteTime = !/(text|video|file|meeting|audio)/g.test(props.type || 'text') && !(props.type === 'location' && props.text);
    const dateText = props.date && (props.dateString || (0, timeago_js_1.format)(props.date));
    (0, react_1.useEffect)(() => {
        var _a;
        if (prevProps.current !== focus && focus === true) {
            if (messageRef) {
                (_a = messageRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({
                    block: 'center',
                    behavior: 'smooth',
                });
                props.onMessageFocused(prevProps);
            }
        }
        prevProps.current = focus;
    }, [focus, prevProps]);
    return (react_1.default.createElement("div", { ref: messageRef, className: (0, classnames_1.default)('rce-container-mbox', props.className), onClick: props.onClick }, props.type === 'system' ? (react_1.default.createElement(SystemMessage_1.default, Object.assign({}, props, { focus: focus, notch: notch }))) : (react_1.default.createElement("div", { style: styles, className: (0, classnames_1.default)(positionCls, { 'rce-mbox--clear-padding': thatAbsoluteTime }, { 'rce-mbox--clear-notch': !notch }, { 'message-focus': focus }) },
        react_1.default.createElement("div", { className: 'rce-mbox-body', onContextMenu: props.onContextMenu },
            !props.retracted && props.forwarded === true && (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-mbox-forward', { 'rce-mbox-forward-right': props.position === 'left' }, { 'rce-mbox-forward-left': props.position === 'right' }), onClick: props.onForwardClick },
                react_1.default.createElement(ri_1.RiShareForwardFill, null))),
            !props.retracted && props.replyButton === true && (react_1.default.createElement("div", { className: props.forwarded !== true
                    ? (0, classnames_1.default)('rce-mbox-forward', { 'rce-mbox-forward-right': props.position === 'left' }, { 'rce-mbox-forward-left': props.position === 'right' })
                    : (0, classnames_1.default)('rce-mbox-forward', { 'rce-mbox-reply-btn-right': props.position === 'left' }, { 'rce-mbox-reply-btn-left': props.position === 'right' }), onClick: props.onReplyClick },
                react_1.default.createElement(md_1.MdMessage, null))),
            !props.retracted && props.removeButton === true && (react_1.default.createElement("div", { className: props.forwarded === true
                    ? (0, classnames_1.default)('rce-mbox-remove', { 'rce-mbox-remove-right': props.position === 'left' }, { 'rce-mbox-remove-left': props.position === 'right' })
                    : (0, classnames_1.default)('rce-mbox-forward', { 'rce-mbox-reply-btn-right': props.position === 'left' }, { 'rce-mbox-reply-btn-left': props.position === 'right' }), onClick: props.onRemoveMessageClick },
                react_1.default.createElement(md_1.MdDelete, null))),
            (props.title || props.avatar) && (react_1.default.createElement("div", { style: Object.assign({}, (props.titleColor && { color: props.titleColor })), onClick: props.onTitleClick, className: (0, classnames_1.default)('rce-mbox-title', {
                    'rce-mbox-title--clear': props.type === 'text',
                }) },
                props.avatar && react_1.default.createElement(Avatar_1.default, { letterItem: props.letterItem, src: props.avatar }),
                props.title && react_1.default.createElement("span", null, props.title))),
            props.reply && react_1.default.createElement(ReplyMessage_1.default, Object.assign({ onClick: props.onReplyMessageClick }, props.reply)),
            props.type === 'text' && (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-mbox-text', {
                    'rce-mbox-text-retracted': props.retracted,
                    'left': props.position === 'left',
                    'right': props.position === 'right',
                }) },
                props.retracted && react_1.default.createElement(md_1.MdBlock, null),
                props.text)),
            props.type === 'location' && react_1.default.createElement(LocationMessage_1.default, Object.assign({ focus: focus, notch: notch }, props)),
            props.type === 'photo' && react_1.default.createElement(PhotoMessage_1.default, Object.assign({ focus: focus, notch: notch }, props)),
            props.type === 'video' && react_1.default.createElement(VideoMessage_1.default, Object.assign({ focus: focus, notch: notch }, props)),
            props.type === 'file' && react_1.default.createElement(FileMessage_1.default, Object.assign({ focus: focus, notch: notch }, props)),
            props.type === 'spotify' && react_1.default.createElement(SpotifyMessage_1.default, Object.assign({ focus: focus, notch: notch }, props)),
            props.type === 'meeting' && react_1.default.createElement(MeetingMessage_1.default, Object.assign({ focus: focus, notch: notch }, props)),
            props.type === 'audio' && react_1.default.createElement(AudioMessage_1.default, Object.assign({ focus: focus, notch: notch }, props)),
            props.type === 'meetingLink' && (react_1.default.createElement(MeetingLink_1.default, Object.assign({ focus: focus, notch: notch }, props, { actionButtons: props === null || props === void 0 ? void 0 : props.actionButtons }))),
            react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-mbox-time', { 'rce-mbox-time-block': thatAbsoluteTime }, { 'non-copiable': !props.copiableDate }), "data-text": props.copiableDate ? undefined : dateText },
                props.copiableDate && props.date && (props.dateString || (0, timeago_js_1.format)(props.date)),
                props.status && (react_1.default.createElement("span", { className: 'rce-mbox-status' },
                    props.status === 'waiting' && react_1.default.createElement(md_1.MdAccessTime, null),
                    props.status === 'sent' && react_1.default.createElement(md_1.MdCheck, null),
                    props.status === 'received' && react_1.default.createElement(io_1.IoIosDoneAll, null),
                    props.status === 'read' && react_1.default.createElement(md_1.MdDoneAll, { color: '#4FC3F7' }))))),
        notch &&
            (props.position === 'right' ? (react_1.default.createElement("svg", { style: props.notchStyle, className: (0, classnames_1.default)('rce-mbox-right-notch', { 'message-focus': focus }), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20' },
                react_1.default.createElement("path", { d: 'M0 0v20L20 0' }))) : (react_1.default.createElement("div", null,
                react_1.default.createElement("svg", { style: props.notchStyle, className: (0, classnames_1.default)('rce-mbox-left-notch', { 'message-focus': focus }), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20' },
                    react_1.default.createElement("defs", null,
                        react_1.default.createElement("filter", { id: 'filter1', x: '0', y: '0' },
                            react_1.default.createElement("feOffset", { result: 'offOut', in: 'SourceAlpha', dx: '-2', dy: '-5' }),
                            react_1.default.createElement("feGaussianBlur", { result: 'blurOut', in: 'offOut', stdDeviation: '3' }),
                            react_1.default.createElement("feBlend", { in: 'SourceGraphic', in2: 'blurOut', mode: 'normal' }))),
                    react_1.default.createElement("path", { d: 'M20 0v20L0 0', filter: 'url(#filter1)' })))))))));
};
exports["default"] = MessageBox;


/***/ }),

/***/ "./src/MessageList/MessageList.tsx":
/*!*****************************************!*\
  !*** ./src/MessageList/MessageList.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importStar(__webpack_require__(/*! react */ "react"));
const MessageBox_1 = __importDefault(__webpack_require__(/*! ../MessageBox/MessageBox */ "./src/MessageBox/MessageBox.tsx"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const fa_1 = __webpack_require__(/*! react-icons/fa */ "react-icons/fa");
const MessageList = (_a) => {
    var { referance = null, lockable = false, toBottomHeight = 300, downButton } = _a, props = __rest(_a, ["referance", "lockable", "toBottomHeight", "downButton"]);
    const [scrollBottom, setScrollBottom] = (0, react_1.useState)(0);
    const [_downButton, setDownButton] = (0, react_1.useState)(false);
    const prevProps = (0, react_1.useRef)(props);
    const checkScroll = () => {
        var e = referance;
        if (!e || !e.current)
            return;
        if (toBottomHeight === '100%' || (toBottomHeight && scrollBottom < toBottomHeight)) {
            e.current.scrollTop = e.current.scrollHeight; // scroll to bottom
        }
        else {
            if (lockable === true) {
                e.current.scrollTop = e.current.scrollHeight - e.current.offsetHeight - scrollBottom;
            }
        }
    };
    (0, react_1.useEffect)(() => {
        if (!referance)
            return;
        if (prevProps.current.dataSource.length !== props.dataSource.length) {
            setScrollBottom(getBottom(referance));
            checkScroll();
        }
        prevProps.current = props;
    }, [prevProps, props]);
    const getBottom = (e) => {
        if (e.current)
            return e.current.scrollHeight - e.current.scrollTop - e.current.offsetHeight;
        return e.scrollHeight - e.scrollTop - e.offsetHeight;
    };
    const onOpen = (item, index, event) => {
        if (props.onOpen instanceof Function)
            props.onOpen(item, index, event);
    };
    const onDownload = (item, index, event) => {
        if (props.onDownload instanceof Function)
            props.onDownload(item, index, event);
    };
    const onPhotoError = (item, index, event) => {
        if (props.onPhotoError instanceof Function)
            props.onPhotoError(item, index, event);
    };
    const onClick = (item, index, event) => {
        if (props.onClick instanceof Function)
            props.onClick(item, index, event);
    };
    const onTitleClick = (item, index, event) => {
        if (props.onTitleClick instanceof Function)
            props.onTitleClick(item, index, event);
    };
    const onForwardClick = (item, index, event) => {
        if (props.onForwardClick instanceof Function)
            props.onForwardClick(item, index, event);
    };
    const onReplyClick = (item, index, event) => {
        if (props.onReplyClick instanceof Function)
            props.onReplyClick(item, index, event);
    };
    const onReplyMessageClick = (item, index, event) => {
        if (props.onReplyMessageClick instanceof Function)
            props.onReplyMessageClick(item, index, event);
    };
    const onRemoveMessageClick = (item, index, event) => {
        if (props.onRemoveMessageClick instanceof Function)
            props.onRemoveMessageClick(item, index, event);
    };
    const onContextMenu = (item, index, event) => {
        if (props.onContextMenu instanceof Function)
            props.onContextMenu(item, index, event);
    };
    const onMessageFocused = (item, index, event) => {
        if (props.onMessageFocused instanceof Function)
            props.onMessageFocused(item, index, event);
    };
    const onMeetingMessageClick = (item, index, event) => {
        if (props.onMeetingMessageClick instanceof Function)
            props.onMeetingMessageClick(item, index, event);
    };
    const onScroll = (e) => {
        var bottom = getBottom(e.currentTarget);
        setScrollBottom(bottom);
        if (toBottomHeight === '100%' || (toBottomHeight && bottom > toBottomHeight)) {
            if (_downButton !== true) {
                setDownButton(true);
                setScrollBottom(bottom);
            }
        }
        else {
            if (_downButton !== false) {
                setDownButton(false);
                setScrollBottom(bottom);
            }
        }
        if (props.onScroll instanceof Function) {
            props.onScroll(e);
        }
    };
    const toBottom = (e) => {
        if (!referance)
            return;
        referance.current.scrollTop = referance.current.scrollHeight;
        if (props.onDownButtonClick instanceof Function) {
            props.onDownButtonClick(e);
        }
    };
    const onMeetingMoreSelect = (item, i, e) => {
        if (props.onMeetingMoreSelect instanceof Function)
            props.onMeetingMoreSelect(item, i, e);
    };
    const onMeetingLinkClick = (item, i, e) => {
        if (props.onMeetingLinkClick instanceof Function)
            props.onMeetingLinkClick(item, i, e);
    };
    return (react_1.default.createElement("div", Object.assign({ className: (0, classnames_1.default)(['rce-container-mlist', props.className]) }, props.customProps),
        !!props.children && props.isShowChild && props.children,
        react_1.default.createElement("div", { ref: referance, onScroll: onScroll, className: 'rce-mlist' }, props.dataSource.map((x, i) => (react_1.default.createElement(MessageBox_1.default, Object.assign({ key: i }, x, { 
            // data={x}
            onOpen: props.onOpen && ((e) => onOpen(x, i, e)), onPhotoError: props.onPhotoError && ((e) => onPhotoError(x, i, e)), onDownload: props.onDownload && ((e) => onDownload(x, i, e)), onTitleClick: props.onTitleClick && ((e) => onTitleClick(x, i, e)), onForwardClick: props.onForwardClick && ((e) => onForwardClick(x, i, e)), onReplyClick: props.onReplyClick && ((e) => onReplyClick(x, i, e)), onReplyMessageClick: props.onReplyMessageClick && ((e) => onReplyMessageClick(x, i, e)), onRemoveMessageClick: props.onRemoveMessageClick && ((e) => onRemoveMessageClick(x, i, e)), onClick: props.onClick && ((e) => onClick(x, i, e)), onContextMenu: props.onContextMenu && ((e) => onContextMenu(x, i, e)), onMeetingMoreSelect: props.onMeetingMoreSelect && ((e) => onMeetingMoreSelect(x, i, e)), onMessageFocused: props.onMessageFocused && ((e) => onMessageFocused(x, i, e)), onMeetingMessageClick: props.onMeetingMessageClick && ((e) => onMeetingMessageClick(x, i, e)), onMeetingTitleClick: props.onMeetingTitleClick, onMeetingVideoLinkClick: props.onMeetingVideoLinkClick, onMeetingLinkClick: props.onMeetingLinkClick && ((e) => onMeetingLinkClick(x, i, e)), actionButtons: props.actionButtons, styles: props.messageBoxStyles, notchStyle: props.notchStyle }))))),
        downButton === true && _downButton && toBottomHeight !== '100%' && (react_1.default.createElement("div", { className: 'rce-mlist-down-button', onClick: toBottom },
            react_1.default.createElement(fa_1.FaChevronDown, null),
            props.downButtonBadge !== undefined ? (react_1.default.createElement("span", { className: 'rce-mlist-down-button--badge' }, props.downButtonBadge.toString())) : null))));
};
exports["default"] = MessageList;


/***/ }),

/***/ "./src/Navbar/Navbar.tsx":
/*!*******************************!*\
  !*** ./src/Navbar/Navbar.tsx ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const Navbar = (_a) => {
    var { type = 'light' } = _a, props = __rest(_a, ["type"]);
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-navbar', type, props.className) },
        react_1.default.createElement("div", { className: 'rce-navbar-item rce-navbar-item__left' }, props.left),
        react_1.default.createElement("div", { className: 'rce-navbar-item rce-navbar-item__center' }, props.center),
        react_1.default.createElement("div", { className: 'rce-navbar-item rce-navbar-item__right' }, props.right)));
};
exports["default"] = Navbar;


/***/ }),

/***/ "./src/PhotoMessage/PhotoMessage.tsx":
/*!*******************************************!*\
  !*** ./src/PhotoMessage/PhotoMessage.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const fa_1 = __webpack_require__(/*! react-icons/fa */ "react-icons/fa");
const Circle_1 = __importDefault(__webpack_require__(/*! ../Circle/Circle */ "./src/Circle/Circle.tsx"));
const PhotoMessage = props => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var progressOptions = {
        strokeWidth: 2.3,
        color: '#efe',
        trailColor: '#aaa',
        trailWidth: 1,
        step: (state, circle) => {
            var _a, _b;
            circle.path.setAttribute('trail', (_a = state === null || state === void 0 ? void 0 : state.state) === null || _a === void 0 ? void 0 : _a.color);
            circle.path.setAttribute('trailwidth-width', (_b = state === null || state === void 0 ? void 0 : state.state) === null || _b === void 0 ? void 0 : _b.width);
            var value = Math.round(circle.value() * 100);
            if (value === 0)
                circle.setText('');
            else
                circle.setText(value);
        },
    };
    const error = ((_a = props === null || props === void 0 ? void 0 : props.data) === null || _a === void 0 ? void 0 : _a.status) && ((_b = props === null || props === void 0 ? void 0 : props.data) === null || _b === void 0 ? void 0 : _b.status.error) === true;
    return (react_1.default.createElement("div", { className: 'rce-mbox-photo' },
        react_1.default.createElement("div", { className: 'rce-mbox-photo--img', style: Object.assign({}, (((_c = props === null || props === void 0 ? void 0 : props.data) === null || _c === void 0 ? void 0 : _c.width) &&
                ((_d = props === null || props === void 0 ? void 0 : props.data) === null || _d === void 0 ? void 0 : _d.height) && {
                width: props.data.width,
                height: props.data.height,
            })) },
            react_1.default.createElement("img", { src: (_e = props === null || props === void 0 ? void 0 : props.data) === null || _e === void 0 ? void 0 : _e.uri, alt: (_f = props === null || props === void 0 ? void 0 : props.data) === null || _f === void 0 ? void 0 : _f.alt, onClick: props.onOpen, onLoad: props.onLoad, onError: props.onPhotoError }),
            error && (react_1.default.createElement("div", { className: 'rce-mbox-photo--img__block' },
                react_1.default.createElement("span", { className: 'rce-mbox-photo--img__block-item rce-mbox-photo--error' },
                    react_1.default.createElement(fa_1.FaExclamationTriangle, null)))),
            !error && ((_g = props === null || props === void 0 ? void 0 : props.data) === null || _g === void 0 ? void 0 : _g.status) && !((_j = (_h = props === null || props === void 0 ? void 0 : props.data) === null || _h === void 0 ? void 0 : _h.status) === null || _j === void 0 ? void 0 : _j.download) && (react_1.default.createElement("div", { className: 'rce-mbox-photo--img__block' },
                !((_k = props === null || props === void 0 ? void 0 : props.data) === null || _k === void 0 ? void 0 : _k.status.click) && (react_1.default.createElement("button", { onClick: props.onDownload, className: 'rce-mbox-photo--img__block-item rce-mbox-photo--download' },
                    react_1.default.createElement(fa_1.FaCloudDownloadAlt, null))),
                typeof ((_l = props === null || props === void 0 ? void 0 : props.data) === null || _l === void 0 ? void 0 : _l.status.loading) === 'number' && ((_m = props === null || props === void 0 ? void 0 : props.data) === null || _m === void 0 ? void 0 : _m.status.loading) !== 0 && (react_1.default.createElement(Circle_1.default, { animate: (_o = props === null || props === void 0 ? void 0 : props.data) === null || _o === void 0 ? void 0 : _o.status.loading, progressOptions: progressOptions, className: 'rce-mbox-photo--img__block-item' }))))),
        (props === null || props === void 0 ? void 0 : props.text) && react_1.default.createElement("div", { className: 'rce-mbox-text' }, props.text)));
};
exports["default"] = PhotoMessage;


/***/ }),

/***/ "./src/Popup/Popup.tsx":
/*!*****************************!*\
  !*** ./src/Popup/Popup.tsx ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const Button_1 = __importDefault(__webpack_require__(/*! ../Button/Button */ "./src/Button/Button.tsx"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const Popup = (_a) => {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var props = __rest(_a, []);
    if (((_b = props.popup) === null || _b === void 0 ? void 0 : _b.show) === true)
        return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-popup-wrapper', props.type, props.className) },
            react_1.default.createElement("div", { className: 'rce-popup' },
                ((_c = props.popup) === null || _c === void 0 ? void 0 : _c.renderHeader) ? (react_1.default.createElement("div", { className: 'rce-popup-header' }, (_d = props.popup) === null || _d === void 0 ? void 0 : _d.renderHeader())) : (react_1.default.createElement("div", { className: 'rce-popup-header' },
                    react_1.default.createElement("span", null, (_e = props.popup) === null || _e === void 0 ? void 0 : _e.header),
                    ((_f = props.popup) === null || _f === void 0 ? void 0 : _f.header) && ((_h = (_g = props.popup) === null || _g === void 0 ? void 0 : _g.headerButtons) === null || _h === void 0 ? void 0 : _h.map((x, i) => react_1.default.createElement(Button_1.default, Object.assign({ key: i }, x)))))),
                react_1.default.createElement("div", { className: 'rce-popup-content', style: { color: (_j = props.popup) === null || _j === void 0 ? void 0 : _j.color } }, ((_k = props.popup) === null || _k === void 0 ? void 0 : _k.renderContent) ? (_l = props.popup) === null || _l === void 0 ? void 0 : _l.renderContent() : (_m = props.popup) === null || _m === void 0 ? void 0 : _m.text),
                react_1.default.createElement("div", { className: 'rce-popup-footer' }, ((_o = props.popup) === null || _o === void 0 ? void 0 : _o.renderFooter)
                    ? (_p = props.popup) === null || _p === void 0 ? void 0 : _p.renderFooter()
                    : (_r = (_q = props.popup) === null || _q === void 0 ? void 0 : _q.footerButtons) === null || _r === void 0 ? void 0 : _r.map((x, i) => react_1.default.createElement(Button_1.default, Object.assign({ key: i }, x)))))));
    return null;
};
exports["default"] = Popup;


/***/ }),

/***/ "./src/ReplyMessage/ReplyMessage.tsx":
/*!*******************************************!*\
  !*** ./src/ReplyMessage/ReplyMessage.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const ReplyMessage = (_a) => {
    var { onClick } = _a, props = __rest(_a, ["onClick"]);
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-mbox-reply', {
            'rce-mbox-reply-border': !!props.titleColor,
        }), style: Object.assign({}, (props.titleColor && { borderColor: props.titleColor })), onClick: onClick },
        react_1.default.createElement("div", { className: 'rce-mbox-reply-left' },
            react_1.default.createElement("div", { style: Object.assign({}, (props.titleColor && { color: props.titleColor })), className: 'rce-mbox-reply-owner' }, props.title || 'Unknown'),
            react_1.default.createElement("div", { className: 'rce-mbox-reply-message' }, props.message || '...')),
        props.photoURL && (react_1.default.createElement("div", { className: 'rce-mbox-reply-right' },
            react_1.default.createElement("img", { src: props.photoURL, alt: '' })))));
};
exports["default"] = ReplyMessage;


/***/ }),

/***/ "./src/SideBar/SideBar.tsx":
/*!*********************************!*\
  !*** ./src/SideBar/SideBar.tsx ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const SideBar = (_a) => {
    var _b, _c, _d;
    var { type = 'dark' } = _a, props = __rest(_a, ["type"]);
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-sbar', type, props.data.className) },
        react_1.default.createElement("div", { className: 'rce-sbar-item' }, (_b = props.data) === null || _b === void 0 ? void 0 : _b.top),
        react_1.default.createElement("div", { className: 'rce-sbar-item rce-sbar-item__center' }, (_c = props.data) === null || _c === void 0 ? void 0 : _c.center),
        react_1.default.createElement("div", { className: 'rce-sbar-item' }, (_d = props.data) === null || _d === void 0 ? void 0 : _d.bottom)));
};
exports["default"] = SideBar;


/***/ }),

/***/ "./src/SpotifyMessage/SpotifyMessage.tsx":
/*!***********************************************!*\
  !*** ./src/SpotifyMessage/SpotifyMessage.tsx ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const SpotifyMessage = (_a) => {
    var { width = 300, height = 380 } = _a, props = __rest(_a, ["width", "height"]);
    const toUrl = () => {
        var formBody = [];
        for (var property in props) {
            var encodedKey = encodeURIComponent(property);
            // @ts-ignore
            var encodedValue = encodeURIComponent(props[property]);
            formBody.push(encodedKey + '=' + encodedValue);
        }
        return formBody.join('&');
    };
    if (!props.uri)
        return null;
    return (react_1.default.createElement("div", { className: 'rce-mbox-spotify' },
        react_1.default.createElement("iframe", { src: 'https://open.spotify.com/embed?' + toUrl(), width: width, height: height, frameBorder: '0', allowTransparency: true })));
};
exports["default"] = SpotifyMessage;


/***/ }),

/***/ "./src/SystemMessage/SystemMessage.tsx":
/*!*********************************************!*\
  !*** ./src/SystemMessage/SystemMessage.tsx ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const SystemMessage = props => {
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-container-smsg', props.className) },
        react_1.default.createElement("div", { className: 'rce-smsg' },
            react_1.default.createElement("div", { className: 'rce-smsg-text' }, props.text))));
};
exports["default"] = SystemMessage;


/***/ }),

/***/ "./src/VideoMessage/VideoMessage.tsx":
/*!*******************************************!*\
  !*** ./src/VideoMessage/VideoMessage.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __importDefault(__webpack_require__(/*! react */ "react"));
const fa_1 = __webpack_require__(/*! react-icons/fa */ "react-icons/fa");
const classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "classnames"));
const Circle_1 = __importDefault(__webpack_require__(/*! ../Circle/Circle */ "./src/Circle/Circle.tsx"));
const VideoMessage = props => {
    var _a, _b, _c, _d, _e;
    var progressOptions = {
        strokeWidth: 2.3,
        color: '#efe',
        trailColor: '#aaa',
        trailWidth: 1,
        step: (state, circle) => {
            circle.path.setAttribute('trail', state.state.color);
            circle.path.setAttribute('trailwidth-width', state.state.width);
            var value = Math.round((circle === null || circle === void 0 ? void 0 : circle.value()) * 100);
            if (value === 0)
                circle === null || circle === void 0 ? void 0 : circle.setText('');
            else
                circle === null || circle === void 0 ? void 0 : circle.setText(value);
        },
    };
    const error = ((_a = props === null || props === void 0 ? void 0 : props.data) === null || _a === void 0 ? void 0 : _a.status) && ((_b = props === null || props === void 0 ? void 0 : props.data) === null || _b === void 0 ? void 0 : _b.status.error) === true;
    const downloaded = ((_c = props === null || props === void 0 ? void 0 : props.data) === null || _c === void 0 ? void 0 : _c.status) && ((_d = props === null || props === void 0 ? void 0 : props.data) === null || _d === void 0 ? void 0 : _d.status.download);
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('rce-mbox-video', {
            'padding-time': !(props === null || props === void 0 ? void 0 : props.text),
        }) },
        react_1.default.createElement("div", { className: 'rce-mbox-video--video', style: Object.assign({}, ((props === null || props === void 0 ? void 0 : props.data.width) &&
                (props === null || props === void 0 ? void 0 : props.data.height) && {
                width: props.data.width,
                height: props.data.height,
            })) },
            !downloaded && (react_1.default.createElement("img", { src: props === null || props === void 0 ? void 0 : props.data.uri, alt: props === null || props === void 0 ? void 0 : props.data.alt, onClick: props.onOpen, onLoad: props.onLoad, onError: props.onPhotoError })),
            downloaded && (react_1.default.createElement("video", { controls: true, controlsList: props.controlsList },
                react_1.default.createElement("source", { src: props === null || props === void 0 ? void 0 : props.data.videoURL, type: 'video/mp4' }),
                "Your browser does not support HTML video.")),
            error && (react_1.default.createElement("div", { className: 'rce-mbox-video--video__block' },
                react_1.default.createElement("span", { className: 'rce-mbox-video--video__block-item rce-mbox-video--error' },
                    react_1.default.createElement(fa_1.FaExclamationTriangle, null)))),
            !error && ((_e = props === null || props === void 0 ? void 0 : props.data) === null || _e === void 0 ? void 0 : _e.status) && !downloaded && (react_1.default.createElement("div", { className: 'rce-mbox-video--video__block' },
                !props.data.status.click && (react_1.default.createElement("button", { onClick: props.onDownload, className: 'rce-mbox-video--video__block-item rce-mbox-video--download' },
                    react_1.default.createElement(fa_1.FaCloudDownloadAlt, null))),
                typeof props.data.status.loading === 'number' && props.data.status.loading !== 0 && (react_1.default.createElement(Circle_1.default, { animate: props.data.status.loading, className: 'rce-mbox-video--video__block-item', progressOptions: progressOptions }))))),
        (props === null || props === void 0 ? void 0 : props.text) && react_1.default.createElement("div", { className: 'rce-mbox-text' }, props.text)));
};
exports["default"] = VideoMessage;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Circle = exports.Popup = exports.SideBar = exports.Dropdown = exports.Navbar = exports.Avatar = exports.Button = exports.Input = exports.MeetingLink = exports.PhotoMessage = exports.VideoMessage = exports.SpotifyMessage = exports.LocationMessage = exports.FileMessage = exports.AudioMessage = exports.MeetingMessage = exports.ReplyMessage = exports.SystemMessage = exports.MeetingList = exports.MeetingItem = exports.MessageList = exports.ChatList = exports.ChatItem = exports.MessageBox = void 0;
const MessageBox_1 = __importDefault(__webpack_require__(/*! ./MessageBox/MessageBox */ "./src/MessageBox/MessageBox.tsx"));
exports.MessageBox = MessageBox_1.default;
const ChatItem_1 = __importDefault(__webpack_require__(/*! ./ChatItem/ChatItem */ "./src/ChatItem/ChatItem.tsx"));
exports.ChatItem = ChatItem_1.default;
const ChatList_1 = __importDefault(__webpack_require__(/*! ./ChatList/ChatList */ "./src/ChatList/ChatList.tsx"));
exports.ChatList = ChatList_1.default;
const MessageList_1 = __importDefault(__webpack_require__(/*! ./MessageList/MessageList */ "./src/MessageList/MessageList.tsx"));
exports.MessageList = MessageList_1.default;
const MeetingItem_1 = __importDefault(__webpack_require__(/*! ./MeetingItem/MeetingItem */ "./src/MeetingItem/MeetingItem.tsx"));
exports.MeetingItem = MeetingItem_1.default;
const MeetingList_1 = __importDefault(__webpack_require__(/*! ./MeetingList/MeetingList */ "./src/MeetingList/MeetingList.tsx"));
exports.MeetingList = MeetingList_1.default;
const SystemMessage_1 = __importDefault(__webpack_require__(/*! ./SystemMessage/SystemMessage */ "./src/SystemMessage/SystemMessage.tsx"));
exports.SystemMessage = SystemMessage_1.default;
const ReplyMessage_1 = __importDefault(__webpack_require__(/*! ./ReplyMessage/ReplyMessage */ "./src/ReplyMessage/ReplyMessage.tsx"));
exports.ReplyMessage = ReplyMessage_1.default;
const MeetingMessage_1 = __importDefault(__webpack_require__(/*! ./MeetingMessage/MeetingMessage */ "./src/MeetingMessage/MeetingMessage.tsx"));
exports.MeetingMessage = MeetingMessage_1.default;
const AudioMessage_1 = __importDefault(__webpack_require__(/*! ./AudioMessage/AudioMessage */ "./src/AudioMessage/AudioMessage.tsx"));
exports.AudioMessage = AudioMessage_1.default;
const FileMessage_1 = __importDefault(__webpack_require__(/*! ./FileMessage/FileMessage */ "./src/FileMessage/FileMessage.tsx"));
exports.FileMessage = FileMessage_1.default;
const LocationMessage_1 = __importDefault(__webpack_require__(/*! ./LocationMessage/LocationMessage */ "./src/LocationMessage/LocationMessage.tsx"));
exports.LocationMessage = LocationMessage_1.default;
const SpotifyMessage_1 = __importDefault(__webpack_require__(/*! ./SpotifyMessage/SpotifyMessage */ "./src/SpotifyMessage/SpotifyMessage.tsx"));
exports.SpotifyMessage = SpotifyMessage_1.default;
const VideoMessage_1 = __importDefault(__webpack_require__(/*! ./VideoMessage/VideoMessage */ "./src/VideoMessage/VideoMessage.tsx"));
exports.VideoMessage = VideoMessage_1.default;
const PhotoMessage_1 = __importDefault(__webpack_require__(/*! ./PhotoMessage/PhotoMessage */ "./src/PhotoMessage/PhotoMessage.tsx"));
exports.PhotoMessage = PhotoMessage_1.default;
const MeetingLink_1 = __importDefault(__webpack_require__(/*! ./MeetingLink/MeetingLink */ "./src/MeetingLink/MeetingLink.tsx"));
exports.MeetingLink = MeetingLink_1.default;
const Input_1 = __importDefault(__webpack_require__(/*! ./Input/Input */ "./src/Input/Input.tsx"));
exports.Input = Input_1.default;
const Button_1 = __importDefault(__webpack_require__(/*! ./Button/Button */ "./src/Button/Button.tsx"));
exports.Button = Button_1.default;
const Avatar_1 = __importDefault(__webpack_require__(/*! ./Avatar/Avatar */ "./src/Avatar/Avatar.tsx"));
exports.Avatar = Avatar_1.default;
const Navbar_1 = __importDefault(__webpack_require__(/*! ./Navbar/Navbar */ "./src/Navbar/Navbar.tsx"));
exports.Navbar = Navbar_1.default;
const Dropdown_1 = __importDefault(__webpack_require__(/*! ./Dropdown/Dropdown */ "./src/Dropdown/Dropdown.tsx"));
exports.Dropdown = Dropdown_1.default;
const SideBar_1 = __importDefault(__webpack_require__(/*! ./SideBar/SideBar */ "./src/SideBar/SideBar.tsx"));
exports.SideBar = SideBar_1.default;
const Popup_1 = __importDefault(__webpack_require__(/*! ./Popup/Popup */ "./src/Popup/Popup.tsx"));
exports.Popup = Popup_1.default;
const Circle_1 = __importDefault(__webpack_require__(/*! ./Circle/Circle */ "./src/Circle/Circle.tsx"));
exports.Circle = Circle_1.default;


/***/ }),

/***/ "classnames":
/*!*****************************!*\
  !*** external "classnames" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("classnames");

/***/ }),

/***/ "progressbar.js":
/*!*********************************!*\
  !*** external "progressbar.js" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("progressbar.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react-icons/fa":
/*!*********************************!*\
  !*** external "react-icons/fa" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("react-icons/fa");

/***/ }),

/***/ "react-icons/hi":
/*!*********************************!*\
  !*** external "react-icons/hi" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("react-icons/hi");

/***/ }),

/***/ "react-icons/io":
/*!*********************************!*\
  !*** external "react-icons/io" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("react-icons/io");

/***/ }),

/***/ "react-icons/md":
/*!*********************************!*\
  !*** external "react-icons/md" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("react-icons/md");

/***/ }),

/***/ "react-icons/ri":
/*!*********************************!*\
  !*** external "react-icons/ri" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("react-icons/ri");

/***/ }),

/***/ "timeago.js":
/*!*****************************!*\
  !*** external "timeago.js" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("timeago.js");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=anteros-react-chat.js.map