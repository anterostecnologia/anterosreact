//https://github.com/ReactTraining/react-media
//https://github.com/viruschidai/react-match-media

import React, { Component, createContext, PureComponent } from "react";
import PropTypes from 'prop-types'
import matchMedia from 'matchmediaquery'
import hyphenate from 'hyphenate-style-name'
import mediaQuery from './AnterosMediaQueryHelper'
import toQuery from './AnterosMediaQueryTo'

const defaultTypes = {
  component: PropTypes.node,
  query: PropTypes.string,
  values: PropTypes.shape(mediaQuery.matchers),
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.func ]),
  onChange: PropTypes.func
}

const excludedQueryKeys = Object.keys(defaultTypes)

const omit = (object, keys) => {
  const newObject = { ...object }
  keys.forEach(key => delete newObject[key])
  return newObject
}

const getValues = ({ values }) => {
  if (!values) return null
  const keys = Object.keys(values)
  if (keys.length === 0) return null
  return keys.reduce((result, key) => {
    result[hyphenate(key)] = values[key]
    return result
  }, {})
}

const getQuery = (props) =>
  props.query || toQuery(omit(props, excludedQueryKeys))

export default class AnterosMediaQuery extends React.Component {
  static displayName = 'MediaQuery'
  static defaultProps = {
    values: null
  }

  static getDerivedStateFromProps(props, state) {
    const query = getQuery(props)
    if (!query) throw new Error('Invalid or missing MediaQuery!')
    const values = getValues(props)
    if (query === state.query && values === state.values) return null // nothing changed
    const mq = matchMedia(query, values || {}, !!values)
    return {
      matches: mq.matches,
      mq,
      query,
      values
    }
  }

  state = {
    matches: false,
    mq: null,
    query: '',
    values: null
  }

  componentDidMount = () => {
    this.state.mq.addListener(this.updateMatches)
    // make sure match is correct since status could have since first render and now
    this.updateMatches()
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.mq !== prevState.mq) {
      this.cleanupMediaQuery(prevState.mq)
      this.state.mq.addListener(this.updateMatches)
      // we don't need to call updateMatches here because even if the old mq fired before
      // we could safely remove it, updateMatches refers to the new one mq instance
      // and it will be accurate.
    }
    if (this.props.onChange && prevState.matches !== this.state.matches) {
      this.props.onChange(this.state.matches)
    }
  }

  componentWillUnmount = () => {
    this._unmounted = true
    this.cleanupMediaQuery(this.state.mq)
  }

  cleanupMediaQuery = (mq) => {
    if (!mq) return
    mq.removeListener(this.updateMatches)
    mq.dispose()
  }

  updateMatches = () => {
    if (this._unmounted) return
    if (this.state.mq.matches === this.state.matches) return
    this.setState({ matches: this.state.mq.matches })
  }

  render = () => {
    if (typeof this.props.children === 'function') {
      return this.props.children(this.state.matches)
    }
    return this.state.matches ? this.props.children : null
  }
}

const Context = React.createContext()

const MediaQueryContextConsumer = props => {
  const values = React.useContext(Context)
  return <AnterosMediaQuery values={values} {...props} />
}

MediaQueryContextConsumer.displayName = "MediaQueryContextConsumer"


export const AnterosMatchMediaHOC = (ComposedComponent, mediaQuery) =>
	class extends Component {
		constructor(props) {
			super(props);
			this.state = { show: false };
			this.mql = null;
			this.onMatch = mql => this._onMatch(mql);
		}

		componentDidMount() {
			if (!window.matchMedia) return;

			this.mql = window.matchMedia(mediaQuery);
			this.mql.addListener(this.onMatch);
			this.onMatch(this.mql);
		}

		componentWillUnmount() {
			this.mql && this.mql.removeListener(this.onMatch);
		}

		_onMatch(mql) {
			const show = !!mql.matches;
			this.setState({ show });
		}

		render() {
			if (!this.state.show) return false;
			return <ComposedComponent {...this.props} />;
		}
	};

AnterosMatchMediaHOC.propTypes = {
	mediaQuery: PropTypes.string.isRequired
};


const { Provider, Consumer } = createContext({})
const MediaProvider = Provider

export const MatchQueriesConsumer = Consumer

const hasMatchMedia =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'

export class AnterosMediaQueryProvider extends React.Component {
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


AnterosMediaQueryProvider.defaultProps = {
  queries: {
    isMobile: 'screen and (max-width: 767px)',
    isTablet: 'screen and (min-width: 768px) and (max-width: 1023px)',
    isDekstopS: 'screen and (min-width: 1024px) and (max-width: 1365px)',
    isDekstop: 'screen and (min-width: 1366px) and (max-width: 1440px)',
    isDekstopL: 'screen and (min-width: 1441px)'
  }
};
