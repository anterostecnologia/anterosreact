const DEFAULT_CHECK_INTERVAL = 60 * 60 * 1000 // 1 hour

export default class AnterosServiceWorkerUpdater {
  updateInterval = null

  constructor(setUpdateHandler, { checkInterval = DEFAULT_CHECK_INTERVAL, updateOnLoad = true }) {
    this.setUpdateHandler = setUpdateHandler
    this.checkInterval = checkInterval
    this.updateOnLoad = updateOnLoad
    console.log({ checkInterval })

    this.registerServiceWorker()
  }

  registerServiceWorker = async () => {
    console.log("registerSW")
    if (isServer()) return

    const reg = await navigator.serviceWorker.register("/sw.js")

    this._reloadWindowOnControllerChange()
    this._checkForSWUpdate(reg)

    if (!reg) return

    if (reg.waiting) {
      this._updateReady(reg.waiting)

      // Se updateOnLoad for verdadeiro, ativa o trabalhador na navegação de rota
      if (this.updateOnLoad) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" })
      }
    }

    // Se o evento "updatefound" for disparado, significa que há
    // um novo service worker sendo instalado.
    reg.addEventListener("updatefound", () => {
      if (reg.installing) {
        this._trackInstalling(reg.installing)
      }
    })
  }

  _reloadWindowOnControllerChange = () => {
    console.log("reloadWindowOnControllerChange")
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("controllerChange")
      // É disparado quando o service worker controlando esta página
      // mudanças, por exemplo, um novo trabalhador pulou a espera e se tornou
      // o novo trabalhador ativo.
      window.location.reload()
    })
  }

  _checkForSWUpdate = registration => {
    console.log("checkForSWUpdate")
    this.updateInterval = setInterval(() => {
      registration.update()
    }, this.checkInterval)
  }

  _updateReady = worker => {
    console.log("_updateReady")
    this.setUpdateHandler(() => {
      console.log("RUNNING updateHandler")
      // Diga ao service worker para skipWaiting
      worker.postMessage({ type: "SKIP_WAITING" })
      this.setUpdateHandler(null)
    })
  }

  _trackInstalling = worker => {
    console.log("_trackInstalling")
    worker.addEventListener("statechange", () => {
      if (["installed", "waiting"].includes(worker.state)) {
        this._updateReady(worker)
      }
    })
  }

  doCleanup = () => {
    console.log("doCleanup")
    clearInterval(this.checkInterval)
  }
}

function isServer() {
  return (
    typeof window === "undefined" || typeof navigator === "undefined" || !navigator.serviceWorker
  )
}
