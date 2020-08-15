import React from 'react';
import { Provider } from 'mobx-react';
import rootStore from '../store/store';
import { Button, Divider, Html, Image, Text, Social } from './extension';
import Transform from '../lib/transform';
import { Config } from '../lib/util';
import Wrapper from './Wrapper';
import { UndoRedoApi } from '../lib/history';


(window).rootStore = rootStore;

class AnterosDesignEditor extends React.Component {

  componentDidMount() {
    const { onRef = () => { } } = this.props;
    this.initConfig();
    onRef({
      export: this.export,
      getData: this.getData,
      setData: this.setData,
      undo: UndoRedoApi.undo,
      redo: UndoRedoApi.redo
    });
    window.addEventListener('keydown', this.bindShortKey);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.bindShortKey);
  }

  bindShortKey = (e) => {
    if (e.keyCode === 46 || (e.metaKey && e.keyCode === 8)) rootStore.DesignState.deleteSelected();
  }

  componentWillReceiveProps(nextProps, nextState) {
    const { mentions } = nextProps;
    if (mentions && JSON.stringify(Config.get('mentions')) !== JSON.stringify(mentions)) {
      Config.set('mentions', mentions);
    }
  }

  initConfig() {
    const { children, imageUploadUrl, onUpload, onUploadError, mentions, contents, enableUndoRedo = true } = this.props;
    Config.set('imageUploadUrl', imageUploadUrl);
    Config.set('enableUndoRedo', enableUndoRedo);
    onUpload && Config.set('onUpload', onUpload);
    onUploadError && Config.set('onUploadError', onUploadError);
    mentions && Config.set('mentions', mentions);
    contents && Config.set('contents', contents);
    [Button, Divider, Html, Image, Text, Social].forEach((Content) => {
      const content = new Content({});
      const contentType = content.getContentType();
      Content.type = contentType;
      Content.group = 'Geral';
      if (Config.get('contents').some(type => type === contentType)) {
        rootStore.DesignState.addExtension(Content);
        rootStore.DesignState.setAttribute(contentType, content.getInitialAttribute());
      }
    });
    React.Children.forEach(children, child => {
      if (child) {
        rootStore.DesignState.addExtensionGroup(child.props.title);
      }
    });
  }

  export = () => {
    const rawData = this.getData();
    const transform = new Transform(rawData, rootStore.DesignState.getExtensions());
    return transform.toHtml();
  }

  getData = () => {
    return rootStore.DesignState.getData();
  }

  setData = json => {
    rootStore.DesignState.execCommand('setData', json);
  }

  render() {
    return <Provider rootStore={rootStore}>
      <div><Wrapper />{this.props.children}</div>
    </Provider>;
  }
}

export default AnterosDesignEditor;