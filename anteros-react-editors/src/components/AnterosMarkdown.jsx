'use strict'

const React = require('react')
const vfile = require('vfile')
const unified = require('unified')
const parse = require('remark-parse')
const remarkRehype = require('remark-rehype')
const PropTypes = require('prop-types')
const html = require('property-information/html')
const ReactIs = require('react-is')
const svg = require('property-information/svg')
const find = require('property-information/find')
const hastToReact = require('property-information/hast-to-react.json')
const spaces = require('space-separated-tokens')
const commas = require('comma-separated-tokens')
const style = require('style-to-object')
const visit = require('unist-util-visit')


exports.hastToReact = toReact
exports.hastChildrenToReact = childrenToReact

const own = {}.hasOwnProperty

// The table-related elements that must not contain whitespace text according
// to React.
const tableElements = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr'])

/**
 * @param {Context} context
 * @param {Element|Root} node
 */
function childrenToReact(context, node) {
  /** @type {Array.<ReactNode>} */
  const children = []
  let childIndex = -1
  /** @type {Comment|Doctype|Element|Raw|Text} */
  let child

  while (++childIndex < node.children.length) {
    child = node.children[childIndex]

    if (child.type === 'element') {
      children.push(toReact(context, child, childIndex, node))
    } else if (child.type === 'text') {
      // React does not permit whitespace text elements as children of table:
      // cf. https://github.com/remarkjs/react-markdown/issues/576
      if (
        node.type !== 'element' ||
        !tableElements.has(node.tagName) ||
        child.value !== '\n'
      ) {
        children.push(child.value)
      }
    }
    // @ts-expect-error `raw` nodes are non-standard
    else if (child.type === 'raw' && !context.options.skipHtml) {
      // Default behavior is to show (encoded) HTML.
      // @ts-expect-error `raw` nodes are non-standard
      children.push(child.value)
    }
  }

  return children
}

/**
 * @param {Context} context
 * @param {Element} node
 * @param {number} index
 * @param {Element|Root} parent
 */
function toReact(context, node, index, parent) {
  const options = context.options
  const parentSchema = context.schema
  /** @type {ReactMarkdownNames} */
  // @ts-expect-error assume a known HTML/SVG element.
  const name = node.tagName
  /** @type {Object.<string, unknown>} */
  const properties = {}
  let schema = parentSchema
  /** @type {string} */
  let property

  if (parentSchema.space === 'html' && name === 'svg') {
    schema = svg
    context.schema = schema
  }

  /* istanbul ignore else - types say they’re optional. */
  if (node.properties) {
    for (property in node.properties) {
      /* istanbul ignore else - prototype polution. */
      if (own.call(node.properties, property)) {
        addProperty(properties, property, node.properties[property], context)
      }
    }
  }

  if (name === 'ol' || name === 'ul') {
    context.listDepth++
  }

  const children = childrenToReact(context, node)

  if (name === 'ol' || name === 'ul') {
    context.listDepth--
  }

  // Restore parent schema.
  context.schema = parentSchema

  // Nodes created by plugins do not have positional info, in which case we use
  // an object that matches the positon interface.
  const position = node.position || {
    start: {line: null, column: null, offset: null},
    end: {line: null, column: null, offset: null}
  }
  const component =
    options.components && own.call(options.components, name)
      ? options.components[name]
      : name
  const basic = typeof component === 'string' || component === React.Fragment

  if (!ReactIs.isValidElementType(component)) {
    throw new TypeError(
      `Component for name \`${name}\` not defined or is not renderable`
    )
  }

  properties.key = [
    name,
    position.start.line,
    position.start.column,
    index
  ].join('-')

  if (name === 'a' && options.linkTarget) {
    properties.target =
      typeof options.linkTarget === 'function'
        ? // @ts-expect-error assume `href` is a string
          options.linkTarget(properties.href, node.children, properties.title)
        : options.linkTarget
  }

  if (name === 'a' && options.transformLinkUri) {
    properties.href = options.transformLinkUri(
      // @ts-expect-error assume `href` is a string
      properties.href,
      node.children,
      properties.title
    )
  }

  if (
    !basic &&
    name === 'code' &&
    parent.type === 'element' &&
    parent.tagName !== 'pre'
  ) {
    properties.inline = true
  }

  if (
    !basic &&
    (name === 'h1' ||
      name === 'h2' ||
      name === 'h3' ||
      name === 'h4' ||
      name === 'h5' ||
      name === 'h6')
  ) {
    properties.level = parseInt(name.charAt(1), 10)
  }

  if (name === 'img' && options.transformImageUri) {
    properties.src = options.transformImageUri(
      // @ts-expect-error assume `src` is a string
      properties.src,
      properties.alt,
      properties.title
    )
  }

  if (!basic && name === 'li' && parent.type === 'element') {
    const input = getInputElement(node)
    properties.checked =
      input && input.properties ? Boolean(input.properties.checked) : null
    properties.index = getElementsBeforeCount(parent, node)
    properties.ordered = parent.tagName === 'ol'
  }

  if (!basic && (name === 'ol' || name === 'ul')) {
    properties.ordered = name === 'ol'
    properties.depth = context.listDepth
  }

  if (name === 'td' || name === 'th') {
    if (properties.align) {
      if (!properties.style) properties.style = {}
      // @ts-expect-error assume `style` is an object
      properties.style.textAlign = properties.align
      delete properties.align
    }

    if (!basic) {
      properties.isHeader = name === 'th'
    }
  }

  if (!basic && name === 'tr' && parent.type === 'element') {
    properties.isHeader = Boolean(parent.tagName === 'thead')
  }

  // If `sourcePos` is given, pass source information (line/column info from markdown source).
  if (options.sourcePos) {
    properties['data-sourcepos'] = flattenPosition(position)
  }

  if (!basic && options.rawSourcePos) {
    properties.sourcePosition = node.position
  }

  // If `includeElementIndex` is given, pass node index info to components.
  if (!basic && options.includeElementIndex) {
    properties.index = getElementsBeforeCount(parent, node)
    properties.siblingCount = getElementsBeforeCount(parent)
  }

  if (!basic) {
    properties.node = node
  }

  // Ensure no React warnings are emitted for void elements w/ children.
  return children.length > 0
    ? React.createElement(component, properties, children)
    : React.createElement(component, properties)
}

/**
 * @param {Element|Root} node
 * @returns {Element?}
 */
function getInputElement(node) {
  let index = -1

  while (++index < node.children.length) {
    const child = node.children[index]

    if (child.type === 'element' && child.tagName === 'input') {
      return child
    }
  }

  return null
}

/**
 * @param {Element|Root} parent
 * @param {Element} [node]
 * @returns {number}
 */
function getElementsBeforeCount(parent, node) {
  let index = -1
  let count = 0

  while (++index < parent.children.length) {
    if (parent.children[index] === node) break
    if (parent.children[index].type === 'element') count++
  }

  return count
}

/**
 * @param {Object.<string, unknown>} props
 * @param {string} prop
 * @param {unknown} value
 * @param {Context} ctx
 */
function addProperty(props, prop, value, ctx) {
  /** @type {Info} */
  const info = find(ctx.schema, prop)
  let result = value

  // Ignore nullish and `NaN` values.
  // eslint-disable-next-line no-self-compare
  if (result === null || result === undefined || result !== result) {
    return
  }

  // Accept `array`.
  // Most props are space-separated.
  if (result && typeof result === 'object' && 'length' in result) {
    // type-coverage:ignore-next-line remove when typed.
    result = (info.commaSeparated ? commas : spaces).stringify(result)
  }

  if (info.property === 'style' && typeof result === 'string') {
    result = parseStyle(result)
  }

  /* istanbul ignore else - types say they’re optional. */
  if (info.space && info.property) {
    props[
      own.call(hastToReact, info.property)
        ? hastToReact[info.property]
        : info.property
    ] = result
  } else if (info.attribute) {
    props[info.attribute] = result
  }
}

/**
 * @param {string} value
 * @returns {Object.<string, string>}
 */
function parseStyle(value) {
  /** @type {Object.<string, string>} */
  const result = {}

  try {
    style(value, iterator)
  } catch (/** @type {unknown} */ _) {
    // Silent.
  }

  return result

  /**
   * @param {string} name
   * @param {string} v
   */
  function iterator(name, v) {
    const k = name.slice(0, 4) === '-ms-' ? `ms-${name.slice(4)}` : name
    result[k.replace(/-([a-z])/g, styleReplacer)] = v
  }
}

/**
 * @param {unknown} _
 * @param {string} $1
 */
function styleReplacer(_, $1) {
  return $1.toUpperCase()
}

/**
 * @param {Position|{start: {line: null, column: null, offset: null}, end: {line: null, column: null, offset: null}}} pos
 * @returns {string}
 */
function flattenPosition(pos) {
  return [
    pos.start.line,
    ':',
    pos.start.column,
    '-',
    pos.end.line,
    ':',
    pos.end.column
  ]
    .map((d) => String(d))
    .join('')
}

module.exports = rehypeFilter



function rehypeFilter(options) {
  if (options.allowedElements && options.disallowedElements) {
    throw new TypeError(
      'Only one of `allowedElements` and `disallowedElements` should be defined'
    )
  }

  if (
    options.allowedElements ||
    options.disallowedElements ||
    options.allowElement
  ) {
    return (tree) => {
      const node = /** @type {Root} */ (tree)
      visit(node, 'element', onelement)
    }
  }

 
  function onelement(node_, index, parent_) {
    const node = /** @type {Element} */ (node_)
    const parent = /** @type {Element|Root} */ (parent_)
    /** @type {boolean|undefined} */
    let remove

    if (options.allowedElements) {
      remove = !options.allowedElements.includes(node.tagName)
    } else if (options.disallowedElements) {
      remove = options.disallowedElements.includes(node.tagName)
    }

    if (!remove && options.allowElement && typeof index === 'number') {
      remove = !options.allowElement(node, index, parent)
    }

    if (remove && typeof index === 'number') {
      if (options.unwrapDisallowed && node.children) {
        parent.children.splice(index, 1, ...node.children)
      } else {
        parent.children.splice(index, 1)
      }

      return index
    }

    return undefined
  }
}

const protocols = ['http', 'https', 'mailto', 'tel']

module.exports = uriTransformer

/**
 * @param {string} uri
 * @returns {string}
 */
function uriTransformer(uri) {
  const url = (uri || '').trim()
  const first = url.charAt(0)

  if (first === '#' || first === '/') {
    return url
  }

  const colon = url.indexOf(':')
  if (colon === -1) {
    return url
  }

  let index = -1

  while (++index < protocols.length) {
    const protocol = protocols[index]

    if (
      colon === protocol.length &&
      url.slice(0, protocol.length).toLowerCase() === protocol
    ) {
      return url
    }
  }

  index = url.indexOf('?')
  if (index !== -1 && colon > index) {
    return url
  }

  index = url.indexOf('#')
  if (index !== -1 && colon > index) {
    return url
  }

  // eslint-disable-next-line no-script-url
  return 'javascript:void(0)'
}


module.exports = AnterosMarkdown

const own = {}.hasOwnProperty

/**
 * @param {AnterosMarkdownOptions} options
 * @returns {ReactElement}
 */
function AnterosMarkdown(options) {
  for (const key in deprecated) {
    if (own.call(deprecated, key) && own.call(options, key)) {
      /** @type {Deprecation} */
      const deprecation = deprecated[key]
      console.warn(
        `[react-markdown] Warning: please ${
          deprecation.to ? `use \`${deprecation.to}\` instead of` : 'remove'
        } \`${key}\` (see <${changelog}#${deprecation.id}> for more info)`
      )
      delete deprecated[key]
    }
  }

  const processor = unified()
    .use(parse)
    .use(options.remarkPlugins || options.plugins || [])
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(options.rehypePlugins || [])
    .use(filter, options)

  /** @type {vfile} */
  let file

  if (typeof options.children === 'string') {
    file = vfile(options.children)
  } else {
    if (options.children !== undefined && options.children !== null) {
      console.warn(
        `[react-markdown] Warning: please pass a string as \`children\` (not: \`${options.children}\`)`
      )
    }

    file = vfile()
  }

  /** @type {Root} */
  // @ts-expect-error we’ll throw if it isn’t a root next.
  const hastNode = processor.runSync(processor.parse(file), file)

  if (hastNode.type !== 'root') {
    throw new TypeError('Expected a `root` node')
  }

  /** @type {ReactElement} */
  let result = React.createElement(
    React.Fragment,
    {},
    childrenToReact({options: options, schema: html, listDepth: 0}, hastNode)
  )

  if (options.className) {
    result = React.createElement('div', {className: options.className}, result)
  }

  return result
}

AnterosMarkdown.defaultProps = {transformLinkUri: uriTransformer}

AnterosMarkdown.propTypes = {
  // Core options:
  children: PropTypes.string,
  // Layout options:
  className: PropTypes.string,
  // Filter options:
  allowElement: PropTypes.func,
  allowedElements: PropTypes.arrayOf(PropTypes.string),
  disallowedElements: PropTypes.arrayOf(PropTypes.string),
  unwrapDisallowed: PropTypes.bool,
  // Plugin options:
  // type-coverage:ignore-next-line
  remarkPlugins: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.func]))
    ])
  ),
  // type-coverage:ignore-next-line
  rehypePlugins: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.func]))
    ])
  ),
  // Transform options:
  sourcePos: PropTypes.bool,
  rawSourcePos: PropTypes.bool,
  skipHtml: PropTypes.bool,
  includeElementIndex: PropTypes.bool,
  transformLinkUri: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  linkTarget: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  transformImageUri: PropTypes.func,
  components: PropTypes.object
}

AnterosMarkdown.uriTransformer = uriTransformer
