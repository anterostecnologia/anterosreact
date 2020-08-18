import React from 'react';
import { Extension, PropertyWidget, PropertyGroup } from './entry';

const { Space, Align, Input, Switch } = PropertyWidget;

export class Video extends Extension {
  getIconClass() {
    return 'icon icon-video';
  }

  getContentType() {
    return 'video';
  }

  getLabel() {
    return 'Video';
  }

  toHtml(data) {
    const { url, containerPadding, textAlign, fullWidth } = data;
    const videoStyle = fullWidth ? ` width: 100% ` : ` max-width: 100% `;
    return `<div style="padding:${containerPadding}">
      <div style="text-align:${textAlign}">
        <video controls src="${url}" style="${videoStyle};vertical-align: top;" />
      </div>
    </div>`;
  }

  getInitialAttribute() {
    return {
      containerPadding: '10px',
      textAlign: 'center',
      fullWidth: false,
      url: ''
    };
  }

  getProperties(values, update) {
    const { url, textAlign, containerPadding, fullWidth } = values;
    return <React.Fragment>
      <PropertyGroup title="Link">
        <Input
          title="URL vídeo"
          value={url}
          attribute="url"
          desc="
          Adicione um URL do YouTube ou Vimeo para gerar automaticamente uma imagem de visualização. A imagem será vinculada a URL fornecida."
          onUpdate={update} />
      </PropertyGroup>
      <PropertyGroup title="Espaçamento">
        <Switch title="Toda largura" checked={fullWidth} attribute="fullWidth" onUpdate={update} />
        <Align title="Alinhamento" align={textAlign} onUpdate={update} />
      </PropertyGroup>
      <PropertyGroup title="Geral">
        <Space title="Espaçamento container" value={containerPadding} attribute="containerPadding" onUpdate={update} />
      </PropertyGroup>
    </React.Fragment>;
  }


  render() {
    const { url, containerPadding, textAlign, fullWidth } = this.props;
    const videoStyle = fullWidth ? { width: '100%' } : { maxWidth: '100%' };
    return <div className="ds_content_video"
      style={{
        padding: containerPadding,
      }}
    >
      <div style={{
        textAlign
      }}>
        {url ? <video controls src={url} style={{ ...videoStyle, verticalAlign: 'top' }} /> : <p><i className="fal fa-video"></i></p>}
      </div>
    </div>;
  }
}


