import cx from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { cloneElement, isValidElement } from 'react'


export const COLORS = [
    'red',
    'orange',
    'yellow',
    'olive',
    'green',
    'teal',
    'blue',
    'violet',
    'purple',
    'pink',
    'brown',
    'grey',
    'black',
]
export const FLOATS = ['left', 'right']
export const SIZES = ['micro','mini', 'tiny', 'small', 'medium', 'large', 'big', 'huge', 'massive']
export const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justified']
export const VERTICAL_ALIGNMENTS = ['bottom', 'middle', 'top']

export const VISIBILITY = ['mobile', 'tablet', 'computer', 'large screen', 'widescreen']

export const WIDTHS = [
    ..._.keys(numberToWordMap),
    ..._.keys(numberToWordMap).map(Number),
    ..._.values(numberToWordMap),
]

export const DIRECTIONAL_TRANSITIONS = [
    'browse',
    'browse right',
    'drop',
    'fade',
    'fade up',
    'fade down',
    'fade left',
    'fade right',
    'fly up',
    'fly down',
    'fly left',
    'fly right',
    'horizontal flip',
    'vertical flip',
    'scale',
    'slide up',
    'slide down',
    'slide left',
    'slide right',
    'swing up',
    'swing down',
    'swing left',
    'swing right',
    'zoom',
]
export const STATIC_TRANSITIONS = ['jiggle', 'flash', 'shake', 'pulse', 'tada', 'bounce', 'glow']
export const TRANSITIONS = [...DIRECTIONAL_TRANSITIONS, ...STATIC_TRANSITIONS]

let leven = () => 0

if (process.env.NODE_ENV !== 'production') {
    const arr = []
    const charCodeCache = []

    leven = (a, b) => {
        if (a === b) return 0

        const aLen = a.length
        const bLen = b.length

        if (aLen === 0) return bLen
        if (bLen === 0) return aLen

        let bCharCode
        let ret
        let tmp
        let tmp2
        let i = 0
        let j = 0

        while (i < aLen) {
            charCodeCache[i] = a.charCodeAt(i)
            arr[i] = ++i
        }

        while (j < bLen) {
            bCharCode = b.charCodeAt(j)
            tmp = j++
            ret = j

            for (i = 0; i < aLen; i++) {
                tmp2 = bCharCode === charCodeCache[i] ? tmp : tmp + 1
                tmp = arr[i]
                ret = arr[i] = tmp > ret ? (tmp2 > ret ? ret + 1 : tmp2) : tmp2 > tmp ? tmp + 1 : tmp2
            }
        }

        return ret
    }
}

/**
 * A more robust React.createElement. It can create elements from primitive values.
 *
 * @param {function|string} Component A ReactClass or string
 * @param {function} mapValueToProps A function that maps a primitive value to the Component props
 * @param {string|object|function} val The value to create a ReactElement from
 * @param {Object} [options={}]
 * @param {object} [options.defaultProps={}] Default props object
 * @param {object|function} [options.overrideProps={}] Override props object or function (called with regular props)
 * @param {boolean} [options.autoGenerateKey=true] Whether or not automatic key generation is allowed
 * @returns {object|null}
 */
function createShorthand(Component, mapValueToProps, val, options = {}) {
    if (typeof Component !== 'function' && typeof Component !== 'string') {
        throw new Error('createShorthand() Component must be a string or function.')
    }
    // short circuit noop values
    if (_.isNil(val) || _.isBoolean(val)) return null

    const valIsString = _.isString(val)
    const valIsNumber = _.isNumber(val)
    const valIsFunction = _.isFunction(val)
    const valIsReactElement = isValidElement(val)
    const valIsPropsObject = _.isPlainObject(val)
    const valIsPrimitiveValue = valIsString || valIsNumber || _.isArray(val)

    // unhandled type return null
    /* eslint-disable no-console */
    if (!valIsFunction && !valIsReactElement && !valIsPropsObject && !valIsPrimitiveValue) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(
                [
                    'Shorthand value must be a string|number|array|object|ReactElement|function.',
                    ' Use null|undefined|boolean for none',
                    ` Received ${typeof val}.`,
                ].join(''),
            )
        }
        return null
    }
    /* eslint-enable no-console */

    // ----------------------------------------
    // Build up props
    // ----------------------------------------
    const { defaultProps = {} } = options

    // User's props
    const usersProps =
        (valIsReactElement && val.props) ||
        (valIsPropsObject && val) ||
        (valIsPrimitiveValue && mapValueToProps(val))

    // Override props
    let { overrideProps = {} } = options
    overrideProps = _.isFunction(overrideProps)
        ? overrideProps({ ...defaultProps, ...usersProps })
        : overrideProps

    // Merge props
    /* eslint-disable react/prop-types */
    const props = { ...defaultProps, ...usersProps, ...overrideProps }

    // Merge className
    if (defaultProps.className || overrideProps.className || usersProps.className) {
        const mergedClassesNames = cx(
            defaultProps.className,
            overrideProps.className,
            usersProps.className,
        )
        props.className = _.uniq(mergedClassesNames.split(' ')).join(' ')
    }

    // Merge style
    if (defaultProps.style || overrideProps.style || usersProps.style) {
        props.style = { ...defaultProps.style, ...usersProps.style, ...overrideProps.style }
    }

    // ----------------------------------------
    // Get key
    // ----------------------------------------

    // Use key, childKey, or generate key
    if (_.isNil(props.key)) {
        const { childKey } = props
        const { autoGenerateKey = true } = options

        if (!_.isNil(childKey)) {
            // apply and consume the childKey
            props.key = typeof childKey === 'function' ? childKey(props) : childKey
            delete props.childKey
        } else if (autoGenerateKey && (valIsString || valIsNumber)) {
            // use string/number shorthand values as the key
            props.key = val
        }
    }

    // ----------------------------------------
    // Create Element
    // ----------------------------------------

    // Clone ReactElements
    if (valIsReactElement) return cloneElement(val, props)

    // Create ReactElements from built up props
    if (valIsPrimitiveValue || valIsPropsObject) return <Component {...props} />

    // Call functions with args similar to createElement()
    if (valIsFunction) return val(Component, props, props.children)
    /* eslint-enable react/prop-types */
}

// ============================================================
// Factory Creators
// ============================================================

/**
 * Creates a `createShorthand` function that is waiting for a value and options.
 *
 * @param {function|string} Component A ReactClass or string
 * @param {function} mapValueToProps A function that maps a primitive value to the Component props
 * @returns {function} A shorthand factory function waiting for `val` and `defaultProps`.
 */
function createShorthandFactory(Component, mapValueToProps) {
    if (typeof Component !== 'function' && typeof Component !== 'string') {
        throw new Error('createShorthandFactory() Component must be a string or function.')
    }

    return (val, options) => createShorthand(Component, mapValueToProps, val, options)
}

const numberToWordMap = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
    11: 'eleven',
    12: 'twelve',
    13: 'thirteen',
    14: 'fourteen',
    15: 'fifteen',
    16: 'sixteen',
}

/**
 * Return the number word for numbers 1-16.
 * Returns strings or numbers as is if there is no corresponding word.
 * Returns an empty string if value is not a string or number.
 * @param {string|number} value The value to convert to a word.
 * @returns {string}
 */
export function numberToWord(value) {
    const type = typeof value
    if (type === 'string' || type === 'number') {
        return numberToWordMap[value] || value
    }

    return ''
}


/**
 * Props where only the prop key is used in the className.
 * @param {*} val A props value
 * @param {string} key A props key
 *
 * @example
 * <Label tag />
 * <div class="ui tag label"></div>
 */
const useKeyOnly = (val, key) => val && key

/**
 * Props that require both a key and value to create a className.
 * @param {*} val A props value
 * @param {string} key A props key
 *
 * @example
 * <Label corner='left' />
 * <div class="ui left corner label"></div>
 */
const useValueAndKey = (val, key) => val && val !== true && `${val} ${key}`


//
// Prop to className exceptions
//

/**
 * Create "X", "X wide" and "equal width" classNames.
 * "X" is a numberToWord value and "wide" is configurable.
 * @param {*} val The prop value
 * @param {string} [widthClass=''] The class
 * @param {boolean} [canEqual=false] Flag that indicates possibility of "equal" value
 *
 * @example
 * <Grid columns='equal' />
 * <div class="ui equal width grid"></div>
 *
 * <Form widths='equal' />
 * <div class="ui equal width form"></div>
 *
 * <FieldGroup widths='equal' />
 * <div class="equal width fields"></div>
 *
 * @example
 * <Grid columns={4} />
 * <div class="ui four column grid"></div>
 */
const useWidthProp = (val, widthClass = '', canEqual = false) => {
    if (canEqual && val === 'equal') {
        return 'equal width'
    }
    const valType = typeof val
    if ((valType === 'string' || valType === 'number') && widthClass) {
        return `${numberToWord(val)} ${widthClass}`
    }
    return numberToWord(val)
}

/**
 * Returns an object consisting of props beyond the scope of the Component.
 * Useful for getting and spreading unknown props from the user.
 * @param {function} Component A function or ReactClass.
 * @param {object} props A ReactElement props object
 * @returns {{}} A shallow copy of the prop object
 */
const getUnhandledProps = (Component, props) => {
    // Note that `handledProps` are generated automatically during build with `babel-plugin-transform-react-handled-props`
    const { handledProps = [] } = Component

    return Object.keys(props).reduce((acc, prop) => {
        if (prop === 'childKey') return acc
        if (handledProps.indexOf(prop) === -1) acc[prop] = props[prop]
        return acc
    }, {})
}


/**
 * Returns a createElement() type based on the props of the Component.
 * Useful for calculating what type a component should render as.
 *
 * @param {function} Component A function or ReactClass.
 * @param {object} props A ReactElement props object
 * @param {function} [getDefault] A function that returns a default element type.
 * @returns {string|function} A ReactElement type
 */
function getElementType(Component, props, getDefault) {
    const { defaultProps = {} } = Component

    // ----------------------------------------
    // user defined "as" element type

    if (props.as && props.as !== defaultProps.as) return props.as

    // ----------------------------------------
    // computed default element type

    if (getDefault) {
        const computedDefault = getDefault()
        if (computedDefault) return computedDefault
    }

    // ----------------------------------------
    // infer anchor links

    if (props.href) return 'a'

    // ----------------------------------------
    // use defaultProp or 'div'

    return defaultProps.as || 'div'
}


const typeOf = (...args) => Object.prototype.toString.call(...args)


/**
 * Disallow other props from being defined with this prop.
 * @param {string[]} disallowedProps An array of props that cannot be used with this prop.
 */
const disallow = (disallowedProps) => (props, propName, componentName) => {
    if (!Array.isArray(disallowedProps)) {
        throw new Error(
            [
                'Invalid argument supplied to disallow, expected an instance of array.',
                ` See \`${propName}\` prop in \`${componentName}\`.`,
            ].join(''),
        )
    }

    // skip if prop is undefined
    if (_.isNil(props[propName]) || props[propName] === false) return

    // find disallowed props with values
    const disallowed = disallowedProps.reduce((acc, disallowedProp) => {
        if (!_.isNil(props[disallowedProp]) && props[disallowedProp] !== false) {
            return [...acc, disallowedProp]
        }
        return acc
    }, [])

    if (disallowed.length > 0) {
        return new Error(
            [
                `Prop \`${propName}\` in \`${componentName}\` conflicts with props: \`${disallowed.join(
                    '`, `',
                )}\`.`,
                'They cannot be defined together, choose one or the other.',
            ].join(' '),
        )
    }
}

/**
 * Ensure a prop adherers to multiple prop type validators.
 * @param {function[]} validators An array of propType functions.
 */
const every = (validators) => (props, propName, componentName, ...rest) => {
    if (!Array.isArray(validators)) {
        throw new Error(
            [
                'Invalid argument supplied to every, expected an instance of array.',
                `See \`${propName}\` prop in \`${componentName}\`.`,
            ].join(' '),
        )
    }

    const errors = _.flow(
        _.map((validator) => {
            if (typeof validator !== 'function') {
                throw new Error(
                    `every() argument "validators" should contain functions, found: ${typeOf(validator)}.`,
                )
            }
            return validator(props, propName, componentName, ...rest)
        }),
        _.compact,
    )(validators)

    // we can only return one error at a time
    return errors[0]
}

/**
 * Ensure a prop adherers to at least one of the given prop type validators.
 * @param {function[]} validators An array of propType functions.
 */
export const some = (validators) => (props, propName, componentName, ...rest) => {
    if (!Array.isArray(validators)) {
        throw new Error(
            [
                'Invalid argument supplied to some, expected an instance of array.',
                `See \`${propName}\` prop in \`${componentName}\`.`,
            ].join(' '),
        )
    }

    const errors = _.compact(
        _.map(validators, (validator) => {
            if (!_.isFunction(validator)) {
                throw new Error(
                    `some() argument "validators" should contain functions, found: ${typeOf(validator)}.`,
                )
            }
            return validator(props, propName, componentName, ...rest)
        }),
    )

    // fail only if all validators failed
    if (errors.length === validators.length) {
        const error = new Error('One of these validators must pass:')
        error.message += `\n${_.map(errors, (err, i) => `[${i + 1}]: ${err.message}`).join('\n')}`
        return error
    }
}

/**
 * Ensure a component can render as a node passed as a prop value in place of children.
 */
const contentShorthand = (...args) =>
    every([disallow(['children']), PropTypes.node])(...args)

/**
 * Item shorthand is a description of a component that can be a literal,
 * a props object, or an element.
 */
const itemShorthand = (...args) =>
    every([
        disallow(['children']),
        PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.node,
            PropTypes.object,
            PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.node, PropTypes.object])),
        ]),
    ])(...args)

/**
 * Collection shorthand ensures a prop is an array of item shorthand.
 */
const collectionShorthand = (...args) =>
    every([disallow(['children']), PropTypes.arrayOf(itemShorthand)])(...args)



/**
 * Tests if children are nil in React and Preact.
 * @param {Object} children The children prop of a component.
 * @returns {Boolean}
 */
const isNil = (children) =>
    children === null || children === undefined || (Array.isArray(children) && children.length === 0)


/**
 * A statistic emphasizes the current value of an attribute.
 */
export function AnterosStatistic(props) {
    const {
        children,
        className,
        color,
        content,
        floated,
        horizontal,
        inverted,
        label,
        size,
        text,
        value,
    } = props

    const classes = cx(
        'ui',
        color,
        size,
        useValueAndKey(floated, 'floated'),
        useKeyOnly(horizontal, 'horizontal'),
        useKeyOnly(inverted, 'inverted'),
        'statistic',
        className,
    )
    const rest = getUnhandledProps(AnterosStatistic, props)
    const ElementType = getElementType(AnterosStatistic, props)

    if (!isNil(children)) {
        return (
            <ElementType {...rest} className={classes}>
                {children}
            </ElementType>
        )
    }
    if (!isNil(content)) {
        return (
            <ElementType {...rest} className={classes}>
                {content}
            </ElementType>
        )
    }

    return (
        <ElementType {...rest} className={classes}>
            {AnterosStatisticValue.create(value, {
                defaultProps: { text },
                autoGenerateKey: false,
            })}
            {AnterosStatisticLabel.create(label, { autoGenerateKey: false })}
        </ElementType>
    )
}

AnterosStatistic.propTypes = {
    /** An element type to render as (string or function). */
    as: PropTypes.elementType,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** A statistic can be formatted to be different colors. */
    color: PropTypes.oneOf(COLORS),

    /** Shorthand for primary content. */
    content: PropTypes.any,

    /** A statistic can sit to the left or right of other content. */
    floated: PropTypes.oneOf(FLOATS),

    /** A statistic can present its measurement horizontally. */
    horizontal: PropTypes.bool,

    /** A statistic can be formatted to fit on a dark background. */
    inverted: PropTypes.bool,

    /** Label content of the Statistic. */
    label: PropTypes.any,

    /** A statistic can vary in size. */
    size: PropTypes.oneOf(_.without(SIZES, 'big', 'massive', 'medium')),

    /** Format the StatisticValue with smaller font size to fit nicely beside number values. */
    text: PropTypes.bool,

    /** Value content of the Statistic. */
    value: PropTypes.any,
}

AnterosStatistic.Group = AnterosStatisticGroup;
AnterosStatistic.Label = AnterosStatisticLabel;
AnterosStatistic.Value = AnterosStatisticValue;

AnterosStatistic.create = createShorthandFactory(AnterosStatistic, (content) => ({ content }))


/**
 * A group of statistics.
 */
export function AnterosStatisticGroup(props) {
    const { children, className, color, content, horizontal, inverted, items, size, widths } = props

    const classes = cx(
        'ui',
        color,
        size,
        useKeyOnly(horizontal, 'horizontal'),
        useKeyOnly(inverted, 'inverted'),
        useWidthProp(widths),
        'statistics',
        className,
    )
    const rest = getUnhandledProps(AnterosStatisticGroup, props)
    const ElementType = getElementType(AnterosStatisticGroup, props)

    if (!isNil(children)) {
        return (
            <ElementType {...rest} className={classes}>
                {children}
            </ElementType>
        )
    }
    if (!isNil(content)) {
        return (
            <ElementType {...rest} className={classes}>
                {content}
            </ElementType>
        )
    }

    return (
        <ElementType {...rest} className={classes}>
            {_.map(items, (item) => AnterosStatistic.create(item))}
        </ElementType>
    )
}

AnterosStatisticGroup.propTypes = {
    /** An element type to render as (string or function). */
    as: PropTypes.elementType,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** A statistic group can be formatted to be different colors. */
    color: PropTypes.oneOf(COLORS),

    /** Shorthand for primary content. */
    content: PropTypes.any,

    /** A statistic group can present its measurement horizontally. */
    horizontal: PropTypes.bool,

    /** A statistic group can be formatted to fit on a dark background. */
    inverted: PropTypes.bool,

    /** Array of props for Statistic. */
    items: PropTypes.any,

    /** A statistic group can vary in size. */
    size: PropTypes.oneOf(_.without(SIZES, 'big', 'massive', 'medium')),

    /** A statistic group can have its items divided evenly. */
    widths: PropTypes.any,
}


/**
 * A statistic can contain a label to help provide context for the presented value.
 */
export function AnterosStatisticLabel(props) {
    const { children, className, content } = props
    const classes = cx('label', className)
    const rest = getUnhandledProps(AnterosStatisticLabel, props)
    const ElementType = getElementType(AnterosStatisticLabel, props)

    return (
        <ElementType {...rest} className={classes}>
            {isNil(children) ? content : children}
        </ElementType>
    )
}

AnterosStatisticLabel.propTypes = {
    /** An element type to render as (string or function). */
    as: PropTypes.elementType,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** Shorthand for primary content. */
    content: PropTypes.any,
}

AnterosStatisticLabel.create = createShorthandFactory(AnterosStatisticLabel, (content) => ({ content }))


/**
 * A statistic can contain a numeric, icon, image, or text value.
 */
export function AnterosStatisticValue(props) {
    const { children, className, content, text } = props

    const classes = cx(useKeyOnly(text, 'text'), 'value', className)
    const rest = getUnhandledProps(AnterosStatisticValue, props)
    const ElementType = getElementType(AnterosStatisticValue, props)

    return (
        <ElementType {...rest} className={classes}>
            {isNil(children) ? content : children}
        </ElementType>
    )
}

AnterosStatisticValue.propTypes = {
    /** An element type to render as (string or function). */
    as: PropTypes.elementType,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** Shorthand for primary content. */
    content: PropTypes.any,

    /** Format the value with smaller font size to fit nicely beside number values. */
    text: PropTypes.bool,
}

AnterosStatisticValue.create = createShorthandFactory(AnterosStatisticValue, (content) => ({ content }))

