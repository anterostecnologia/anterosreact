import React,{ createElement, Component } from 'react'
import PropTypes from 'prop-types'
import PopperJS from 'popper.js'

const AnterosPopperArrow = (props, context) => {
  const { component = 'span', innerRef, children, ...restProps } = props
  const { popper } = context
  const arrowRef = node => {
    popper.setArrowNode(node)
    if (typeof innerRef === 'function') {
      innerRef(node)
    }
  }
  const arrowStyle = popper.getArrowStyle()

  if (typeof children === 'function') {
    const arrowProps = {
      ref: arrowRef,
      style: arrowStyle,
    }
    return children({ arrowProps, restProps })
  }

  const componentProps = {
    ...restProps,
    style: {
      ...arrowStyle,
      ...restProps.style,
    },
  }

  if (typeof component === 'string') {
    componentProps.ref = arrowRef
  } else {
    componentProps.innerRef = arrowRef
  }

  return createElement(component, componentProps, children)
}

AnterosPopperArrow.contextTypes = {
  popper: PropTypes.object.isRequired,
}

AnterosPopperArrow.propTypes = {
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  innerRef: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
}


class AnterosPopperManager extends Component {   

    constructor(props){
        super(props);
        this._setTargetNode = this._setTargetNode.bind(this);
        this._getTargetNode = this._getTargetNode.bind(this);
    }
  
    getChildContext() {
      return {
        popperManager: {
          setTargetNode: this._setTargetNode,
          getTargetNode: this._getTargetNode,
        },
      }
    }
  
    _setTargetNode(node) {
      this._targetNode = node;
    }
  
    _getTargetNode() {
      return this._targetNode;
    }
  
    render() {
      const { tag, children, ...restProps } = this.props
      if (tag !== false) {
        return createElement(tag, restProps, children)
      } else {
        return children
      }
    }
  }

  AnterosPopperManager.childContextTypes = {
    popperManager: PropTypes.object.isRequired,
  }

  AnterosPopperManager.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  }

  AnterosPopperManager.defaultProps = {
    tag: 'div',
  }





class AnterosPopper extends Component {
  
    constructor(props){
        super(props);
        this.state = {};
        this._setArrowNode = this._setArrowNode.bind(this);
        this._getTargetNode = this._getTargetNode.bind(this);
        this._getOffsets = this._getOffsets.bind(this);
        this._isDataDirty = this._isDataDirty.bind(this);
        this._createPopper = this._createPopper.bind(this);
        this._destroyPopper = this._destroyPopper.bind(this);
        this._getPopperStyle = this._getPopperStyle.bind(this);
        this._getPopperPlacement = this._getPopperPlacement.bind(this);
        this._getPopperHide = this._getPopperHide.bind(this);
        this._getArrowStyle = this._getArrowStyle.bind(this);
        this._handlePopperRef = this._handlePopperRef.bind(this);
        this._scheduleUpdate = this._scheduleUpdate.bind(this);

        this._updateStateModifier = {
            enabled: true,
            order: 900,
            fn: data => {
              if (this._isDataDirty(data)) {
                this.setState({ data })
              }
              return data
            },
          };
    }

  

  getChildContext() {
    return {
      popper: {
        setArrowNode: this._setArrowNode,
        getArrowStyle: this._getArrowStyle,
      },
    }
  }

  componentDidUpdate(lastProps) {
    if (
      lastProps.placement !== this.props.placement ||
      lastProps.eventsEnabled !== this.props.eventsEnabled ||
      lastProps.target !== this.props.target
    ) {
      this._destroyPopper()
      this._createPopper()
    }
    if (lastProps.children !== this.props.children) {
      this._scheduleUpdate()
    }
  }

  componentWillUnmount() {
    this._destroyPopper()
  }

  _setArrowNode(node) {
    this._arrowNode = node
  }

  _getTargetNode() {
    if (this.props.target) {
      return this.props.target
    } else if (
      !this.context.popperManager ||
      !this.context.popperManager.getTargetNode()
    ) {
      throw new Error(
        'Target missing. Popper must be given a target from the Popper Manager, or as a prop.',
      )
    }
    return this.context.popperManager.getTargetNode()
  }

  _getOffsets(data) {
    return Object.keys(data.offsets).map(key => data.offsets[key])
  }

  _isDataDirty(data) {
    if (this.state.data) {
      return (
        JSON.stringify(this._getOffsets(this.state.data)) !==
        JSON.stringify(this._getOffsets(data))
      )
    } else {
      return true
    }
  }

  

  _createPopper() {
    const { placement, eventsEnabled, positionFixed } = this.props
    const modifiers = {
      ...this.props.modifiers,
      applyStyle: { enabled: false },
      updateState: this._updateStateModifier,
    }
    if (this._arrowNode) {
      modifiers.arrow = {
        ...(this.props.modifiers.arrow || {}),
        element: this._arrowNode,
      }
    }
    this._popper = new PopperJS(this._getTargetNode(), this._popperNode, {
      placement,
      positionFixed,
      eventsEnabled,
      modifiers,
    })

    setTimeout(() => this._scheduleUpdate())
  }

  _destroyPopper() {
    if (this._popper) {
      this._popper.destroy()
    }
  }

  _getPopperStyle() {
    const { data } = this.state

    if (!this._popper || !data) {
      return {
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0,
      }
    }

    return {
      position: data.offsets.popper.position,
      ...data.styles,
    }
  }

  _getPopperPlacement() {
    return this.state.data ? this.state.data.placement : undefined
  }

  _getPopperHide() {
    return !!this.state.data && this.state.data.hide ? '' : undefined
  }

  _getArrowStyle() {
    if (!this.state.data || !this.state.data.offsets.arrow) {
      return {}
    } else {
      const { top, left } = this.state.data.offsets.arrow
      return { top, left }
    }
  }

  _handlePopperRef(node) {
    this._popperNode = node
    if (node) {
      this._createPopper()
    } else {
      this._destroyPopper()
    }
    if (this.props.innerRef) {
      this.props.innerRef(node)
    }
  }

  _scheduleUpdate() {
    this._popper && this._popper.scheduleUpdate()
  }

  render() {
    const {
      component,
      innerRef,
      placement,
      eventsEnabled,
      positionFixed,
      modifiers,
      children,
      ...restProps
    } = this.props
    const popperStyle = this._getPopperStyle()
    const popperPlacement = this._getPopperPlacement()
    const popperHide = this._getPopperHide()

    if (typeof children === 'function') {
      const popperProps = {
        ref: this._handlePopperRef,
        style: popperStyle,
        'data-placement': popperPlacement,
        'data-x-out-of-boundaries': popperHide,
      }
      return children({
        popperProps,
        restProps,
        scheduleUpdate: this._scheduleUpdate,
      })
    }

    const componentProps = {
      ...restProps,
      style: {
        ...restProps.style,
        ...popperStyle,
      },
      'data-placement': popperPlacement,
      'data-x-out-of-boundaries': popperHide,
    }

    if (typeof component === 'string') {
      componentProps.ref = this._handlePopperRef
    } else {
      componentProps.innerRef = this._handlePopperRef
    }

    return createElement(component, componentProps, children)
  }
}


AnterosPopper.contextTypes = {
   popperManager: PropTypes.object,
}

AnterosPopper.childContextTypes = {
   popper: PropTypes.object.isRequired,
}

AnterosPopper.propTypes = {
    component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    innerRef: PropTypes.func,
    placement: PropTypes.oneOf([...placements]),
    eventsEnabled: PropTypes.bool,
    positionFixed: PropTypes.bool,
    modifiers: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    target: PropTypes.oneOfType([
      PropTypes.instanceOf(typeof Element !== 'undefined' ? Element : Object),
      PropTypes.shape({
        getBoundingClientRect: PropTypes.func.isRequired,
        clientWidth: PropTypes.number.isRequired,
        clientHeight: PropTypes.number.isRequired,
      }),
    ]),
}

AnterosPopper.defaultProps = {
    component: 'div',
    placement: 'bottom',
    eventsEnabled: true,
    positionFixed: false,
    modifiers: {},
}


const AnterosPopperTarget = (props, context) => {
    const { component = 'div', innerRef, children, ...restProps } = props
    const { popperManager } = context
    const targetRef = node => {
      popperManager.setTargetNode(node)
      if (typeof innerRef === 'function') {
        innerRef(node)
      }
    }
  
    if (typeof children === 'function') {
      const targetProps = { ref: targetRef }
      return children({ targetProps, restProps })
    }
  
    const componentProps = {
      ...restProps,
    }
  
    if (typeof component === 'string') {
      componentProps.ref = targetRef
    } else {
      componentProps.innerRef = targetRef
    }
  
    return createElement(component, componentProps, children)
  }
  
  AnterosPopperTarget.contextTypes = {
    popperManager: PropTypes.object.isRequired,
  }
  
  AnterosPopperTarget.propTypes = {
    component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    innerRef: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  }

export const placements = [...PopperJS.placements];
export {AnterosPopperArrow,AnterosPopperManager,AnterosPopper,AnterosPopperTarget}