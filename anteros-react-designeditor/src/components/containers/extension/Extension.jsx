import React, { Component } from 'react';


class Extension extends Component {

  static check = true;

  componentWillUnmount() {
    this.setState = (state, callback) => { };
  }

  getIconClass(){    
  }

  getLabel(){    
  }

  getContentType(){    
  }

  toHtml(json){
  }

  getInitialAttribute(){    
  }

  getProperties(values, update){    
  }
}



export default Extension;