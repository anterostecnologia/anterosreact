import React from 'react';
import Extension from './Extension';
import { ContentType } from '../../lib/enum';
import { guid } from '../../lib/util';
import Group from '../sidebar/Property/Group';
import { Align, Space, NumberItem, SocialItem } from '../sidebar/Property/items';

class Social extends Extension {
  getIconClass() {
    return 'fab fa-facebook';
  }

  getContentType() {
    return ContentType.SOCIAL;
  }

  getLabel() {
    return 'Redes sociais';
  }

  toHtml(data) {
    const { items, width, height, textAlign, containerPadding, margin } = data;
    return `<div>
      <div style="padding:${containerPadding};text-align:${textAlign}">
        ${items.map(item => `<a key='${item.guid}' href='${item.url}' style='margin:${margin};'>
          <img style='height:${height}px;width:${width}px;' src='${item.icon}' />
        </a>`).join('')}
      </div>
    </div>`;
  }

  getInitialAttribute() {
    return {
      items: [
        {
          guid: guid(),
          icon: 'https://mktgcdn.dlvrit.com/wp-content/uploads/2017/09/social-_facebook-small-opt.png',
          url: 'https://www.facebook.com/InvitationHomesWeb'
        },
        {
          guid: guid(),
          icon: 'https://img.icons8.com/color/2x/youtube-play.png',
          url: 'https://www.youtube.com/user/InvitationHomes'
        },
        {
          guid: guid(),
          icon: 'https://mktgcdn.dlvrit.com/wp-content/uploads/2017/09/social-_linkedin-small-opt.png',
          url: 'https://www.linkedin.com'
        },
        {
          guid: guid(),
          icon: 'https://img.icons8.com/color/2x/google-plus.png',
          url: 'https://plus.google.com/+Invitationhomes/posts'
        },
        {
          guid: guid(),
          icon: 'https://mktgcdn.dlvrit.com/wp-content/uploads/2017/09/social-_twitter-small-opt.png',
          url: 'https://twitter.com/InvitationHomes'
        }
      ],
      textAlign: 'center',
      containerPadding: '10px',
      margin: '5px',
      width: 35,
      height: 35,
    };
  }

  getProperties(values, update) {
    const { items, width, height, textAlign, containerPadding, margin } = values;
    return <React.Fragment>
      <Group title="Icones">
        <SocialItem items={items} onUpdate={update} />
      </Group>
      <Group title="Geral">
        <Align align={textAlign} onUpdate={update} />
        <NumberItem title="Largura" attribute="width" value={width} onUpdate={update} step={1} max={100} min={5} />
        <NumberItem title="Altura" attribute="height" value={height} onUpdate={update} step={1} max={100} min={5} />
        <Space title="Margem" value={margin} attribute="margin" onUpdate={update} />
        <Space title="Espaçamento container" value={containerPadding} attribute="containerPadding" onUpdate={update} />
      </Group>
    </React.Fragment>;
  }

  render() {
    const { items, width, height, textAlign, containerPadding, margin } = this.props;
    return <div className="ds_content_social">
      <div className="ds_content_social_container" style={{
        padding: containerPadding,
        textAlign,
      }}>
        {items.map(item => <a key={item.guid} href={item.url} style={{
          margin,
        }}><img style={{ width, height }} src={item.icon}></img></a>)}
      </div>
    </div>;
  }
}


export default Social;