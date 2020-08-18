import React from 'react';
import rootStore from '../../store/store';


class ExtensionGroup extends React.Component {

  componentDidMount() {
    this.initConfig();
  }

  initConfig() {
    const { children, title } = this.props;
    setTimeout(() => {
      React.Children.forEach(children, child => {
        if (child) {
          const content = new child.type({}); // eslint-disable-line
          child.type.type = content.getContentType();
          child.type.group = title;
          rootStore.DesignState.addExtension(child.type);
          rootStore.DesignState.setAttribute(child.type.type, content.getInitialAttribute());
        }
      });
    });
  }

  render() {
    return null;
  }
}

export default ExtensionGroup;
