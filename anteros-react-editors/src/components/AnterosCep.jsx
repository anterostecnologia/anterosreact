import { Component } from 'react';
import {autoBind} from '@anterostecnologia/anteros-react-core';
import PropTypes from 'prop-types';
import AnterosMaskEdit  from './AnterosMaskEdit';
import {
  AnterosRemoteDatasource,
  AnterosLocalDatasource
} from '@anterostecnologia/anteros-react-datasource';
import { buildGridClassNames, columnProps } from '@anterostecnologia/anteros-react-layout';

export default class AnterosCep extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    if (this.props.dataSource) {
      let value = this.props.dataSource.fieldByName(this.props.dataField);
      if (!value) {
        value = '';
      }
      this.state = {
        value: value,
        loading: false
      };
    } else {
      this.state = {
        value: this.props.value,
        loading: false
      };
    }
  }
  handleBlur(event) {
    let _this = this;
    if (this.state.value && this.state.value.length == 8) {
      _this.setState({ loading: true });
      fetch(`https://viacep.com.br/ws/${this.state.value}/json/`)
        .then(response => response.json())
        .then(data => {
          _this.setState({ ..._this.state, loading: false });
          if (_this.props.onSuccess) {
            let tpLogradouro = '';
            let logradouro = '';
            let result = data;
            if (data.logradouro){
                let arr = data.logradouro.split(' ');
                if (arr && arr.length >= 2){
                  tpLogradouro = arr[0];
                  logradouro = data.logradouro.substring(tpLogradouro.length+1);
                  result = {...data,tpLogradouro,logradouro};
                }
            }
            _this.props.onSuccess(result);
          }
        })
        .catch(err => {
          _this.setState({ ..._this.state, loading: false });
          if (_this.props.onError) {
            _this.props.onError(err);
          }
        });
    }
  }

  onChange(value) {
    this.setState({ loading: false, value: value });
  }

  render() {
    const { onSuccess, onError, ...attributes } = this.props;
    return (
      <AnterosMaskEdit
        {...attributes}
        disabled={this.props.disabled || this.state.loading}
        maskPattern="cep"
        onChange={this.onChange}
        value={this.state.value}
        onBlur={this.handleBlur}
      />
    );
  }
}

AnterosCep.propTypes = {
  dataSource: PropTypes.oneOfType([
    PropTypes.instanceOf(AnterosLocalDatasource),
    PropTypes.instanceOf(AnterosRemoteDatasource)
  ]),
  dataField: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  mask: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  value: PropTypes.string,
  placeHolder: PropTypes.string,
  onChange: PropTypes.func,
  onComplete: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  extraSmall: columnProps,
  small: columnProps,
  medium: columnProps,
  large: columnProps,
  extraLarge: columnProps,
  style: PropTypes.object,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

AnterosCep.defaultProps = {
  disabled: false
};
