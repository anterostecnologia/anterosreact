import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import { AnterosEdit } from '@anterostecnologia/anteros-react-editors';
import { AnterosForm, AnterosFormGroup } from '@anterostecnologia/anteros-react-containers';

export default class AnterosInputSearch extends Component {
  render() {
    return (
      <AnterosForm inline>
        <AnterosFormGroup row={false}>
          <AnterosEdit small={10} placeHolder={this.props.placeHolder} style={{width: '100%'}} />
          <AnterosButton
            color="white"
            icon="fal fa-search"
            onClick={this.props.onSearchClick}
          />
        </AnterosFormGroup>
      </AnterosForm>
    );
  }
}

AnterosInputSearch.propTypes = {
  onSearchClick: PropTypes.func
};

AnterosInputSearch.defaultProps = {};
