import React, { createContext } from 'react'
import cssMediaQuery from 'css-mediaquery'
import shallowequal from 'shallowequal'
import matchMedia from 'matchmedia'

const { Provider, Consumer } = createContext({})
const MediaProvider = Provider

export const MatchQueriesConsumer = Consumer

const hasMatchMedia =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'

export class MatchQueriesProvider extends React.Component {
  constructor (props) {
    super(props)

    const media = Object.keys(this.props.queries).reduce((acc, queryName) => {
      const query = this.props.queries[queryName]

      if (this.props.values) {
        acc[queryName] = cssMediaQuery.match(query, this.props.values)
      } else {
        acc[queryName] = hasMatchMedia ? matchMedia(query, this.props.values).matches : false
      }

      return acc
    }, {})

    this.state = {
      media
    }
  }

  static defaultProps = {
    queries: {
      isMobile: 'screen and (max-width: 767px)',
      isTablet: 'screen and (min-width: 768px) and (max-width: 1023px)',
      isDekstopS: 'screen and (min-width: 1024px) and (max-width: 1365px)',
      isDekstop: 'screen and (min-width: 1366px) and (max-width: 1440px)',
      isDekstopL: 'screen and (min-width: 1441px)'
    }
  };

  componentDidMount () {
    this.clientMatch()

    Object.entries(this.props.queries).forEach(([key, value]) => {
      matchMedia(value, this.props.values).addListener(this.clientMatch)
    })
  }

  componentWillUnmount () {
    Object.entries(this.props.queries).forEach(([key, value]) => {
      matchMedia(value, this.props.values).removeListener(this.clientMatch)
    })
  }

  queryMedia = (queries, values) => Object.keys(queries).reduce((result, key) => {
    const { matches } = matchMedia(queries[key], values)

    result[key] = matches
    return result
  }, {})

  clientMatch = () => {
    const media = this.queryMedia(this.props.queries, {})

    if (!shallowequal(media, this.state.media)) {
      this.setState({ media })
    }
  }

  render () {
    const { children } = this.props
    const { media } = this.state

    return (
      <MediaProvider value={media}>
        {children}
      </MediaProvider>
    )
  }
}