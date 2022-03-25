import React from 'react';
import { BasicType } from '@anterostecnologia/anteros-email-core';
import { Stack } from '@anterostecnologia/anteros-email-editor';
import { BlockMaskWrapper } from '@extensions/ShortcutToolbar/components/BlockMaskWrapper';
import { getImg } from '@extensions/ShortcutToolbar/utils/getImg';
import { Picture } from '@extensions/ShortcutToolbar/components/Picture';

const list = [
  {
    thumbnail: getImg('IMAGE_08'),
    payload: {
      type: 'accordion',
      data: {
        value: {},
      },
      attributes: {
        'icon-height': '32px',
        'icon-width': '32px',
        'icon-align': 'middle',
        'icon-position': 'right',
        'icon-unwrapped-url': getImg('IMAGE_09'),
        'icon-wrapped-url': getImg('IMAGE_10'),
        padding: '10px 25px 10px 25px',
        border: '1px solid #d9d9d9',
      },
      children: [
        {
          type: 'accordion-element',
          data: {
            value: {},
          },
          attributes: {
            'icon-align': 'middle',
            'icon-height': '32px',
            'icon-width': '32px',
            'icon-position': 'right',
            padding: '10px 25px 10px 25px',
          },
          children: [
            {
              type: 'accordion-title',
              data: {
                value: {
                  content: 'Por que usar um acordeão?',
                },
              },
              attributes: {
                'font-size': '13px',
                padding: '16px 16px 16px 16px',
              },
              children: [],
            },
            {
              type: 'accordion-text',
              data: {
                value: {
                  content:
                    '<span style="line-height:20px">\n                Como e-mails com muito conteúdo são na maioria das vezes uma experiência muito ruim no celular, o mj-accordion é útil quando você deseja fornecer muitas informações de maneira concisa.\n              </span>',
                },
              },
              attributes: {
                'font-size': '13px',
                padding: '16px 16px 16px 16px',
                'line-height': '1',
              },
              children: [],
            },
          ],
        },
        {
          type: 'accordion-element',
          data: {
            value: {},
          },
          attributes: {
            'icon-align': 'middle',
            'icon-height': '32px',
            'icon-width': '32px',
            'icon-position': 'right',
            padding: '10px 25px 10px 25px',
          },
          children: [
            {
              type: 'accordion-title',
              data: {
                value: {
                  content: 'Como funciona?',
                },
              },
              attributes: {
                'font-size': '13px',
                padding: '16px 16px 16px 16px',
              },
              children: [],
            },
            {
              type: 'accordion-text',
              data: {
                value: {
                  content:
                    '<span style="line-height:20px">\n                O conteúdo é empilhado em guias e os usuários podem expandi-los à vontade. Se os estilos responsivos não forem suportados (principalmente em clientes de desktop), as guias serão expandidas e seu conteúdo poderá ser lido de uma só vez.\n              </span>',
                },
              },
              attributes: {
                'font-size': '13px',
                padding: '16px 16px 16px 16px',
                'line-height': '1',
              },
              children: [],
            },
          ],
        },
      ],
    },
  },
];

export function AccordionBlockItem() {
  return (
    <Stack.Item fill>
      <Stack vertical>
        {list.map((item, index) => {
          return (
            <BlockMaskWrapper
              key={index}
              type={BasicType.ACCORDION}
              payload={item.payload}
            >
              <div style={{ position: 'relative' }}>
                <Picture src={item.thumbnail} />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                  }}
                />
              </div>
            </BlockMaskWrapper>
          );
        })}
      </Stack>
    </Stack.Item>
  );
}
