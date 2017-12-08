import React, { Component } from 'react';
import {
  Route, Link, Switch, NavLink
} from 'react-router-dom';
import lodash from 'lodash';

const BreadcrumbsItem = ({ ...rest, match }) => {
  var pieces = match.url.split('/');
  const routeName = pieces[pieces.length - 1];
  if (routeName) {
    return (
      match.isExact
        ? <span className='breadcrumb-item active'>{routeName}</span>
        : <Link className='breadcrumb-item' to={match.url || ''}>{routeName}</Link>
    )
  }
  return null
}

const Breadcrumbs = ({ ...rest, location: { pathname }, match }) => {
  const paths = []
  pathname.split('/').reduce((prev, curr, index) => {
    paths[index] = `${prev}/${curr}`
    return paths[index]
  })
  return (
    <nav>
      {paths.map(p => <Route path={p} component={BreadcrumbsItem} key={lodash.uniqueId()} />)}
    </nav>
  )
}

class AnterosMainContainer extends Component {
  render() {
    return (
      <article className="content dashboard-page">
        {/* <ol className="breadcrumb">
          <Route path='/:path' component={Breadcrumbs} />
        </ol> */}
        <div className="container-fluid">       
          {this.props.children}
        </div>
      </article>
    )
  }
}

export default AnterosMainContainer




