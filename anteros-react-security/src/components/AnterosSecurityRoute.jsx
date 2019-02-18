
import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

export default class AnterosSecurityRoute extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    var { component, redirectCondition, ...rest } = this.props;
    const DynamicComponent = component;
    let location = this.props.location;
    if (redirectCondition==true){
      location = '';
    }

    return (
      <Route {...rest} render={props => (
        (this.props.allowAccess && this.props.allowAccess == true) ? (
          <DynamicComponent {...props}/>
        ) : (
            <Redirect to={{
              pathname: (this.props.redirectTo?this.props.redirectTo:'/login'),
              state: { from: location }
            }} /> 
          )
      )} />);
  }
}
