import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import querystring from 'query-string'
import { omit, get, wrap } from 'lodash'

export const actions = {
  config: createAction('ANTEROS_OAUTH2/CONFIG'),
  error: createAction('ANTEROS_OAUTH2/ERROR'),
  start: createAction('ANTEROS_OAUTH2/START'),
  reset: createAction('ANTEROS_OAUTH2/RESET'),
  cancel: createAction('ANTEROS_OAUTH2/CANCEL'),
  save: createAction('ANTEROS_OAUTH2/SAVE'),
  signin (creds, cb = f => f) {
    return (dispatch, getState) => {
      const { config } = getState().oauth
      dispatch(actions.start())
      return new Promise((resolve, reject) => {
        axios.post(`${config.url}${config.token}`, Object.assign({
          client_id: config.client_id,
          client_secret: config.client_secret,
          grant_type: 'password',
          scope: 'all'
        }, creds)).then(res => {
          dispatch(actions.sync(res.data, cb))
          resolve(res)
        }).catch(e => {
          dispatch(actions.error(e))
          reject(e)
        })
      })
    }
  },
  signout (cb = f => f) {
    return (dispatch, getState) => {
      const { user, config } = getState().oauth
      return axios.delete(`${config.url}${config.token}`, {
        headers: { 'Authorization': `Bearer ${user.token.access_token}` }
      }).then(res => {
        dispatch(actions.reset())
        cb(null, res)
      }).catch(e => {
        dispatch(actions.error(e))
        cb(e)
      })
    }
  },
  sync (token, cb = f => f) {
    return (dispatch, getState) => {
      const { config } = getState().oauth
      return axios.get(`${config.url}${config.token}`, {
        headers: { 'Authorization': `Bearer ${token.access_token}` }
      }).then(res => {
        const user = { token, profile: res.data }
        dispatch(actions.save(user))
        cb(null, user)
      }).catch(cb)
    }
  }
}

export const reducer = handleActions({
  'ANTEROS_OAUTH2/CONFIG' (state, action) {
    return {...state, config: action.payload}
  },
  'ANTEROS_OAUTH2/START' (state, action) {
    return {...state, authenticating: true}
  },
  'ANTEROS_OAUTH2/CANCEL' (state, action) {
    return {...state, authenticating: false}
  },
  'ANTEROS_OAUTH2/ERROR' (state, action) {
    return {...state, authenticating: false, error: action.payload}
  },
  'ANTEROS_OAUTH2/RESET' (state, action) {
    return {...state, authenticating: false, error: null, user: {token: null, profile: null}}
  },
  'ANTEROS_OAUTH2/SAVE' (state, action) {
    return {
      ...state,
      authenticating: false,
      user: action.payload
    }
  }
}, {
  authenticating: false,
  user: {
    token: null,
    profile: null
  },
  config: {
    url: 'http://localhost',
    token: '/oauth/token',
    client_id: null,
    client_secret: null,
    providers: {
      github: '/auth/github',
      anteros: '/oauth/token'
    }
  },
  error: null
})

export function signout (settings) {
  settings = Object.assign({
    success () {},
    failed () {}
  }, settings)
  return Component => {
    return connect(state => ({oauth: state.oauth}))(class extends React.Component {
      static get defaultProps () {
        return {
          onClick () {}
        }
      }
      handleClick () {
        this.props.dispatch(actions.signout((e, res) => {
          return e ? settings.failed(e) : settings.success(null, res)
        }))
      }
      render () {
        const { oauth, ...rest } = this.props
        const props = Object.assign({}, omit(rest, ['dispatch']))
        props.disabled = false
        props.disabled = oauth.authenticating || get(oauth, 'user.profile') === null
        props.onClick = wrap(props.onClick, (func, e) => {
          this.handleClick(e)
          return func(e)
        })
        return <Component {...props} />
      }
    })
  }
}
export function signin (settings) {
  settings = Object.assign({
    popup: {
      scrollbars: 'no',
      toolbar: 'no',
      location: 'no',
      titlebar: 'no',
      directories: 'no',
      status: 'no',
      menubar: 'no',
      top: '100',
      left: '100',
      width: '600',
      height: '500'
    },
    listen: null,
    success () {},
    cancel () {},
    failed () {}
  }, settings)
  return Component => {
    return connect(state => ({oauth: state.oauth}))(class extends React.Component {
      static get defaultProps () {
        return {
          onClick () {}
        }
      }
      handleClick (e, provider) {
        const { dispatch, oauth: { config }, state } = this.props
        const query = state ? `?state=${state}` : ''
        const url = `${config.url}${config.providers[provider]}${query}`
        const name = 'connecting to ' + provider
        dispatch(actions.start())
        this.listenPopup(
          window.open(url, name, querystring.stringify(settings.popup).replace(/&/g, ','))
        )
      }
      listenPopup (popup) {
        const { dispatch } = this.props
        if (popup.closed) {
          dispatch(actions.cancel())
          settings.cancel()
        } else {
          const listen = () => {
            let token
            try {
              token = querystring.parse(popup.location.search.substr(1))
            } catch (e) { }
            if (token && token.access_token) {
              dispatch(actions.sync(token, (err, user) => {
                if (err) {
                  dispatch(actions.error(err))
                  settings.failed(err)
                  popup.close()
                } else {
                  settings.success(user)
                }
              }))
              popup.close()
            } else {
              setTimeout(this.listenPopup.bind(this, popup), 0)
            }
          }
          settings.listen ? settings.listen.call(this, popup, settings) : listen()
        }
      }
      render () {
        const {oauth, provider, ...rest} = this.props
        const props = Object.assign({}, omit(rest, [
          'dispatch', 'onCancel', 'onSuccess', 'onFailed'
        ]))
        props.disabled = oauth.authenticating || get(oauth, 'user.profile') !== null
        props.onClick = wrap(props.onClick, (func, e) => {
          this.handleClick(e, provider)
          return func(e)
        })
        return <Component {...props} provider={provider} />
      }
    })
  }
}
