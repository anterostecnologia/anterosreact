import React, {Component} from 'react'

const changedArray = (a = [], b = []) =>
  a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))


class AnterosErrorBoundary extends Component {
  static getDerivedStateFromError(error) {
    return {error}
  }

  state = {error: null}
  resetErrorBoundary = (...args) => {
    if (this.props.onReset){
        this.props.onReset(...args);
    }
    this.reset()
  }

  reset() {
    this.setState({error: null})
  }

  componentDidCatch(error, info) {
    if (this.props.onError){
        this.props.onError(error, info);
    }
  }

  componentDidUpdate(
    prevProps,
    prevState,
  ) {
    const {error} = this.state
    const {resetKeys} = this.props

    // Há um caso extremo em que se a coisa que desencadeou o erro
    // acontece de * também * estar na matriz resetKeys, acabaríamos reiniciando
    // o limite de erro imediatamente. Isso provavelmente acionaria um segundo
    // erro a ser lançado.
    // Portanto, nos certificamos de não verificar as resetKeys na primeira chamada
    // do cDU após o erro ser definido

    if (
      error !== null &&
      prevState.error !== null &&
      changedArray(prevProps.resetKeys, resetKeys) && !this.props.onResetKeysChange
    ) {
      this.props.onResetKeysChange(prevProps.resetKeys, resetKeys)
      this.reset()
    }
  }

  render() {
    const {error} = this.state

    const {fallbackRender, FallbackComponent, fallback} = this.props

    if (error !== null) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      }
      if (React.isValidElement(fallback)) {
        return fallback
      } else if (typeof fallbackRender === 'function') {
        return fallbackRender(props)
      } else if (FallbackComponent) {
        return <FallbackComponent {...props} />
      } else {
        throw new Error(
          'AnterosErrorBoundary requer um component de fallback, fallbackRender ou a propriedade FallbackComponent.',
        )
      }
    }

    return this.props.children
  }
}

function withErrorBoundary(
  Component,
  errorBoundaryProps,
) {
  const Wrapped = props => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  // Formato para exibição em DevTools
  const name = Component.displayName || Component.name || 'Unknown'
  Wrapped.displayName = `withErrorBoundary(${name})`

  return Wrapped
}

function useErrorHandler(givenError) {
  const [error, setError] = React.useState(null)
  if (givenError != null) throw givenError
  if (error != null) throw error
  return setError
}

export {AnterosErrorBoundary, withErrorBoundary, useErrorHandler}

/*
eslint
  @typescript-eslint/sort-type-union-intersection-members: "off",
  @typescript-eslint/no-throw-literal: "off",
  @typescript-eslint/prefer-nullish-coalescing: "off"
*/
