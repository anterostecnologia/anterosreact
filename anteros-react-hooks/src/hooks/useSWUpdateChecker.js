import React, { useState, useEffect } from "react"
import {AnterosServiceWorkerUpdater} from "@anterostecnologia/anteros-react-core"

const useSWUpdateChecker = ({ checkInterval, updateOnLoad } = {}) => {
  const [updateHandler, setUpdateHandler] = useState(null)

  useEffect(() => {
    const setHandler = handler => {
      setUpdateHandler(() => handler)
    }
    const updater = new AnterosServiceWorkerUpdater(setHandler, {
      checkInterval: checkInterval
    })

    return () => updater.doCleanup()
  }, [])

  const hasUpdate = typeof updateHandler === "function"
  return [hasUpdate, updateHandler]
}

export default useSWUpdateChecker
