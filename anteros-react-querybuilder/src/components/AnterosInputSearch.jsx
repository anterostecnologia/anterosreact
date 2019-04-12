import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnterosButton } from 'anteros-react-buttons';
import { AnterosEdit } from 'anteros-react-editors';
import { AnterosForm, AnterosFormGroup } from 'anteros-react-containers';

export default class AnterosInputSearch extends Component {
  render() {
    return (
      <AnterosForm inline>
        <AnterosFormGroup row={false}>
          <AnterosEdit small={10} placeHolder={this.props.placeHolder} />
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
