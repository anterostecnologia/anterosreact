import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class AnterosClickOutside extends Component { 

  constructor(props) {
    super(props)
    this.getContainer = this.getContainer.bind(this)
    this.isTouch = false
  }

  getContainer(ref) {
    this.container = ref
  }

  render() {
    const { children, onClickOutside, ...props } = this.props
    return <div {...props} ref={this.getContainer}>{children}</div>
  }

  componentDidMount() {
    document.addEventListener('touchend', this.handle, true)
    document.addEventListener('click', this.handle, true)
  }

  componentWillUnmount() {
    document.removeEventListener('touchend', this.handle, true)
    document.removeEventListener('click', this.handle, true)
  }

  handle = e => {
    if (e.type === 'touchend') this.isTouch = true
    if (e.type === 'click' && this.isTouch) return
    const { onClickOutside } = this.props
    const el = this.container
    if (el && !el.contains(e.target)) onClickOutside(e)
  }
}


AnterosClickOutside.propTypes = {
    onClickOutside: PropTypes.func.isRequired
  }