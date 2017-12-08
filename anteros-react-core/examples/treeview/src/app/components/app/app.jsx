import React, { Component } from 'react';
import { render } from 'react-dom';
import ObjectList from '../../components/app/objects.jsx'



class App extends Component {

  render() {
    let style = { "padding": "10px", "border": "1px solid #aaa" };

    return (
      <ObjectList />
    );
  }
}

export default App;

