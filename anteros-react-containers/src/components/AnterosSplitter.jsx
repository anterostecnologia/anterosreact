import React, { Component } from 'react';
import lodash from "lodash";
import {AnterosUtils} from "anteros-react-core";


const global = window
const document = global.document
const addEventListener = 'addEventListener'
const removeEventListener = 'removeEventListener'
const getBoundingClientRect = 'getBoundingClientRect'
const NOOP = () => false
const isIE8 = global.attachEvent && !global[addEventListener]
const calc = `${['', '-webkit-', '-moz-', '-o-'].filter(prefix => {
    const el = document.createElement('div')
    el.style.cssText = `width:${prefix}calc(9px)`
    return (!!el.style.length)
}).shift()}calc`
const elementOrSelector = el => {
    if (typeof el === 'string' || el instanceof String) {
        return document.querySelector(el)
    }

    return el
}

const Split = (ids, options = {}) => {
    let dimension
    let clientDimension
    let clientAxis
    let position
    let paddingA
    let paddingB
    let elements
    const parent = elementOrSelector(ids[0]).parentNode
    const parentFlexDirection = global.getComputedStyle(parent).flexDirection
    const sizes = options.sizes || ids.map(() => 100 / ids.length)
    const minSize = options.minSize !== undefined ? options.minSize : 100
    const minSizes = Array.isArray(minSize) ? minSize : ids.map(() => minSize)
    const gutterSize = options.gutterSize !== undefined ? options.gutterSize : 10
    const snapOffset = options.snapOffset !== undefined ? options.snapOffset : 30
    const direction = options.direction || 'horizontal'
    const cursor = options.cursor || (direction === 'horizontal' ? 'ew-resize' : 'ns-resize')
    const gutter = options.gutter || ((i, gutterDirection) => {
        const gut = document.createElement('div')
        gut.className = `gutter gutter-${gutterDirection}`
        return gut
    })
    const elementStyle = options.elementStyle || ((dim, size, gutSize) => {
        const style = {}

        if (typeof size !== 'string' && !(size instanceof String)) {
            if (!isIE8) {
                style[dim] = `${calc}(${size}% - ${gutSize}px)`
            } else {
                style[dim] = `${size}%`
            }
        } else {
            style[dim] = size
        }

        return style
    })
    const gutterStyle = options.gutterStyle || ((dim, gutSize) => ({ [dim]: `${gutSize}px` }))
    if (direction === 'horizontal') {
        dimension = 'width'
        clientDimension = 'clientWidth'
        clientAxis = 'clientX'
        position = 'left'
        paddingA = 'paddingLeft'
        paddingB = 'paddingRight'
    } else if (direction === 'vertical') {
        dimension = 'height'
        clientDimension = 'clientHeight'
        clientAxis = 'clientY'
        position = 'top'
        paddingA = 'paddingTop'
        paddingB = 'paddingBottom'
    }

    function setElementSize(el, size, gutSize) {
        const style = elementStyle(dimension, size, gutSize)
        Object.keys(style).forEach(prop => (el.style[prop] = style[prop]))
    }

    function setGutterSize(gutterElement, gutSize) {
        const style = gutterStyle(dimension, gutSize)
        Object.keys(style).forEach(prop => (gutterElement.style[prop] = style[prop]))
    }

    function adjust(offset) {
        const a = elements[this.a]
        const b = elements[this.b]
        const percentage = a.size + b.size

        a.size = (offset / this.size) * percentage
        b.size = (percentage - ((offset / this.size) * percentage))

        setElementSize(a.element, a.size, this.aGutterSize)
        setElementSize(b.element, b.size, this.bGutterSize)
    }

    function drag(e) {
        let offset
        if (!this.dragging) return
        if ('touches' in e) {
            offset = e.touches[0][clientAxis] - this.start
        } else {
            offset = e[clientAxis] - this.start
        }
        if (offset <= elements[this.a].minSize + snapOffset + this.aGutterSize) {
            offset = elements[this.a].minSize + this.aGutterSize
        } else if (offset >= this.size - (elements[this.b].minSize + snapOffset + this.bGutterSize)) {
            offset = this.size - (elements[this.b].minSize + this.bGutterSize)
        }
        adjust.call(this, offset)
        if (options.onDrag) {
            options.onDrag()
        }
    }

    function calculateSizes() {
        const a = elements[this.a].element
        const b = elements[this.b].element

        this.size = a[getBoundingClientRect]()[dimension] + b[getBoundingClientRect]()[dimension] + this.aGutterSize + this.bGutterSize
        this.start = a[getBoundingClientRect]()[position]
    }

    function stopDragging() {
        const self = this
        const a = elements[self.a].element
        const b = elements[self.b].element

        if (self.dragging && options.onDragEnd) {
            options.onDragEnd()
        }

        self.dragging = false
        global[removeEventListener]('mouseup', self.stop)
        global[removeEventListener]('touchend', self.stop)
        global[removeEventListener]('touchcancel', self.stop)

        self.parent[removeEventListener]('mousemove', self.move)
        self.parent[removeEventListener]('touchmove', self.move)

        delete self.stop
        delete self.move

        a[removeEventListener]('selectstart', NOOP)
        a[removeEventListener]('dragstart', NOOP)
        b[removeEventListener]('selectstart', NOOP)
        b[removeEventListener]('dragstart', NOOP)

        a.style.userSelect = ''
        a.style.webkitUserSelect = ''
        a.style.MozUserSelect = ''
        a.style.pointerEvents = ''

        b.style.userSelect = ''
        b.style.webkitUserSelect = ''
        b.style.MozUserSelect = ''
        b.style.pointerEvents = ''

        self.gutter.style.cursor = ''
        self.parent.style.cursor = ''
    }

    function startDragging(e) {
        const self = this
        const a = elements[self.a].element
        const b = elements[self.b].element

        if (!self.dragging && options.onDragStart) {
            options.onDragStart()
        }
        e.preventDefault()
        self.dragging = true
        self.move = drag.bind(self)
        self.stop = stopDragging.bind(self)
        global[addEventListener]('mouseup', self.stop)
        global[addEventListener]('touchend', self.stop)
        global[addEventListener]('touchcancel', self.stop)
        self.parent[addEventListener]('mousemove', self.move)
        self.parent[addEventListener]('touchmove', self.move)
        a[addEventListener]('selectstart', NOOP)
        a[addEventListener]('dragstart', NOOP)
        b[addEventListener]('selectstart', NOOP)
        b[addEventListener]('dragstart', NOOP)

        a.style.userSelect = 'none'
        a.style.webkitUserSelect = 'none'
        a.style.MozUserSelect = 'none'
        a.style.pointerEvents = 'none'

        b.style.userSelect = 'none'
        b.style.webkitUserSelect = 'none'
        b.style.MozUserSelect = 'none'
        b.style.pointerEvents = 'none'
        self.gutter.style.cursor = cursor
        self.parent.style.cursor = cursor
        calculateSizes.call(self)
    }

    const pairs = []
    elements = ids.map((id, i) => {
        let element = {
            element: elementOrSelector(id),
            size: sizes[i],
            minSize: minSizes[i],
        }

        elementOrSelector(id).className = elementOrSelector(id).className+" split split-"+direction;

        let pair

        if (i > 0) {
            pair = {
                a: i - 1,
                b: i,
                dragging: false,
                isFirst: (i === 1),
                isLast: (i === ids.length - 1),
                direction,
                parent,
            }

            pair.aGutterSize = gutterSize
            pair.bGutterSize = gutterSize

            if (pair.isFirst) {
                pair.aGutterSize = gutterSize / 2
            }

            if (pair.isLast) {
                pair.bGutterSize = gutterSize / 2
            }
            if (parentFlexDirection === 'row-reverse' || parentFlexDirection === 'column-reverse') {
                const temp = pair.a
                pair.a = pair.b
                pair.b = temp
            }
        }

        if (!isIE8) {
            if (i > 0) {
                const gutterElement = gutter(i, direction)
                setGutterSize(gutterElement, gutterSize)
                gutterElement[addEventListener]('mousedown', startDragging.bind(pair))
                gutterElement[addEventListener]('touchstart', startDragging.bind(pair))
                parent.insertBefore(gutterElement, element.element)
                pair.gutter = gutterElement
            }
        }

        if (i === 0 || i === ids.length - 1) {
            setElementSize(element.element, element.size, gutterSize / 2)
        } else {
            setElementSize(element.element, element.size, gutterSize)
        }
        const computedSize = element.element[getBoundingClientRect]()[dimension]
        if (computedSize < element.minSize) {
            element.minSize = computedSize
        }
        if (i > 0) {
            pairs.push(pair)
        }

        return element
    })

    function setSizes(newSizes) {
        newSizes.forEach((newSize, i) => {
            if (i > 0) {
                const pair = pairs[i - 1]
                const a = elements[pair.a]
                const b = elements[pair.b]
                a.size = newSizes[i - 1]
                b.size = newSize
                setElementSize(a.element, a.size, pair.aGutterSize)
                setElementSize(b.element, b.size, pair.bGutterSize)
            }
        })
    }

    function destroy() {
        pairs.forEach(pair => {
            pair.parent.removeChild(pair.gutter)
            elements[pair.a].element.style[dimension] = ''
            elements[pair.b].element.style[dimension] = ''
        })
    }

    if (isIE8) {
        return {
            setSizes,
            destroy,
        }
    }

    return {
        setSizes,
        getSizes() {
            return elements.map(element => element.size)
        },
        collapse(i) {
            if (i === pairs.length) {
                const pair = pairs[i - 1]
                calculateSizes.call(pair)
                if (!isIE8) {
                    adjust.call(pair, pair.size - pair.bGutterSize)
                }
            } else {
                const pair = pairs[i]
                calculateSizes.call(pair)
                if (!isIE8) {
                    adjust.call(pair, pair.aGutterSize)
                }
            }
        },
        destroy,
    }
}



class AnterosSplitter extends React.Component {

    constructor(props) {
        super(props);
        this.idSplitter = lodash.uniqueId("splitter");
        this.instance;
        this.setSizes = this.setSizes.bind(this);
        this.getSizes = this.getSizes.bind(this);
        this.collapse = this.collapse.bind(this);
    }
    componentDidMount() {
        this.instance = Split(this.props.splitterElements, {
            minSize: this.props.minSize,
            sizes: this.props.sizes,
            gutterSize: this.props.gutterSize,
            snapOffset: this.props.snapOffset,
            direction: this.props.direction,
            cursor: this.props.cursor,
            gutter: this.props.gutter,
            elementStyle: this.props.elementStyle,
            gutterStyle: this.props.gutterStyle,
            onDrag: this.props.onDrag,
            onDragStart: this.props.onDragStart,
            onDragEnd: this.props.onDragEnd
        })
    }

    componentWillUnmount(){
        this.instance.destroy();
    }

    setSizes(sizes) {
        this.instance.setSizes(sizes);
    }

    getSizes(){
        this.instance.getSizes();
    }

    collapse(index){
        this.instance.collapse(index);
    }

    render() {
        if (this.props.id) {
            this.idSplitter = this.props.id;
        }
        let style = {};
        if (this.props.style){
            style = {...style, ...this.props.style};
        }

        if (this.props.height){
            style = {...style, height:this.props.height};
        }

        if (this.props.width){
            style = {...style, width:this.props.width};
        }

        return (<div id={this.idSplitter} style={style}>
            {this.props.children}
        </div>)
    }

}

AnterosSplitter.propTypes = {
    id: React.PropTypes.string,
    splitterElements: React.PropTypes.arrayOf(React.PropTypes.any),
    sizes: React.PropTypes.array.isRequired,
    minSize: React.PropTypes.number,
    gutterSize: React.PropTypes.number,
    snapOffset: React.PropTypes.number,
    direction: React.PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
    cursor: React.PropTypes.string,
    onDrag: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    gutter: React.PropTypes.func,
    elementStyle: React.PropTypes.object,
    gutterStyle: React.PropTypes.object,
    height: React.PropTypes.string,
    width: React.PropTypes.string
}

AnterosSplitter.defaultProps = {
    minSize: 20,
    gutterSize: 10,
    snapOffset: 30,
    direction: 'horizontal',
    cursor: 'col-resize'
}

export default AnterosSplitter;
