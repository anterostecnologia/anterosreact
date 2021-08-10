import React, { Component } from "react"
import {AnterosServiceWorkerUpdater} from "@anterostecnologia/anteros-react-core"

export default function withSWUpdateChecker(
  WrappedComponent,
  { checkInterval, updateOnLoad } = {}
) {
  return class extends Component {
    state = {
      updateHandler: null,
      updater: null
    }

    componentDidMount() {
      const updater = new AnterosServiceWorkerUpdater(this.setUpdateHandler, {
        checkInterval,
        updateOnLoad
      })
      this.setState({
        updater
      })
    }

    componentWillUnmount() {
      this.state.updater.doCleanup()
    }

    setUpdateHandler = handler => {
      this.setState({
        updateHandler: handler
      })
    }

    render() {
      const { updateHandler } = this.state
      const hasUpdate = typeof updateHandler === "function"

      return (
        <WrappedComponent hasUpdate={hasUpdate} updateHandler={updateHandler} {...this.props} />
      )
    }
  }
}
