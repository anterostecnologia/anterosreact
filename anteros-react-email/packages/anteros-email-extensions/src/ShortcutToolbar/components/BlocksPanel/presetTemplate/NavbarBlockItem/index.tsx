import React from 'react';
import { BasicType } from '@anterostecnologia/anteros-email-core';
import { Stack } from '@anterostecnologia/anteros-email-editor';
import { BlockMaskWrapper } from '@extensions/ShortcutToolbar/components/BlockMaskWrapper';
import { getImg } from '@extensions/ShortcutToolbar/utils/getImg';
import { Picture } from '@extensions/ShortcutToolbar/components/Picture';

const list = [
  {
    thumbnail: getImg('IMAGE_46'),
    payload: {
      type: BasicType.NAVBAR,
      data: {
        value: {
          links: [
            {
              href: '/gettings-started-onboard',
              content: 'HOME',
              color: '#000000',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px 15px 10px',
            },
            {
              href: '/try-it-live',
              content: 'NOVO',
              color: '#000000',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px 15px 10px',
            },
            {
              href: '/templates',
              content: 'MULHER',
              color: '#000000',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px 15px 10px',
            },
            {
              href: '/components',
              content: 'CRIANÇA',
              color: '#000000',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px 15px 10px',
            },
            {
              href: '/components',
              content: 'BLOG',
              color: '#000000',
              'font-size': '13px',
              target: '_blank',
              padding: '15px 10px 15px 10px',
            },
          ],
        },
      },
      attributes: {
        align: 'center',
        'base-url': 'https://mjml.io',
      },
      children: [],
    },
  },
];

export function NavbarBlockItem() {
  return (
    <Stack.Item fill>
      <Stack vertical>
        {list.map((item, index) => {
          return (
            <BlockMaskWrapper
              key={index}
              type={BasicType.NAVBAR}
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
