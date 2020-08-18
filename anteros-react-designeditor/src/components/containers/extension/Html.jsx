import React from 'react';
import Extension from './Extension';
import { ContentType } from '../../lib/enum';
import Group from '../sidebar/Property/Group';
import { HtmlEditor, Space } from '../sidebar/Property/items';

class Html extends Extension {
  getIconClass() {
    return 'fal fa-code';
  }

  getContentType() {
    return ContentType.HTML;
  }

  getLabel() {
    return 'Html';
  }

  toHtml(data) {
    const { html, containerPadding } = data;
    return `<div>
      <div style="padding:${containerPadding};">
        <div>${html}</div>
      </div>
    </div>`;
  }

  getInitialAttribute() {
    return {
      html: '<p>Html Sample</p>',
      containerPadding: '10px'
    };
  }

  getProperties(values, update) {
    const { html, containerPadding } = values;
    return <React.Fragment>
      <Group title="Linha">
        <HtmlEditor style={{ margin: '-20px' }} value={html} onChange={value => { update('html', value); }} />
      </Group>
      <Group title="Geral">
        <Space title="Espaçamento container" value={containerPadding} attribute="containerPadding" onUpdate={update} />
      </Group>
    </React.Fragment>;
  }

  render() {
    const { html, containerPadding } = this.props;
    return <div className="ds_content_html">
      <div style={{
        padding: containerPadding
      }}>
        <div dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    </div>;
  }
}


export default Html;