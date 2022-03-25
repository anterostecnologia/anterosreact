import React from 'react';
import { BasicType } from '@anterostecnologia/anteros-email-core';
import { Stack } from '@anterostecnologia/anteros-email-editor';

import { BlockMaskWrapper } from '@extensions/ShortcutToolbar/components/BlockMaskWrapper';
import { getImg } from '@extensions/ShortcutToolbar/utils/getImg';
import { Picture } from '@extensions/ShortcutToolbar/components/Picture';

export function SectionBlockItem() {
  return (
    <Stack.Item fill>
      <Stack vertical>
        {list.map((item, index) => {
          return (
            <BlockMaskWrapper
              key={index}
              type={BasicType.SECTION}
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

const list = [
  {
    thumbnail: getImg('IMAGE_47'),
    payload: {},
  },
  {
    thumbnail: getImg('IMAGE_48'),
    payload: {
      type: 'section',
      data: {
        value: {
          noWrap: false,
        },
      },
      attributes: {
        padding: '20px 0px 20px 0px',
        'background-repeat': 'repeat',
        'background-size': 'auto',
        'background-position': 'top center',
        border: 'none',
        direction: 'ltr',
        'text-align': 'center',
      },
      children: [
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
      ],
    },
  },
  {
    thumbnail: getImg('IMAGE_49'),
    payload: {
      type: 'section',
      data: {
        value: {
          noWrap: false,
        },
      },
      attributes: {
        padding: '20px 0px 20px 0px',
        'background-repeat': 'repeat',
        'background-size': 'auto',
        'background-position': 'top center',
        border: 'none',
        direction: 'ltr',
        'text-align': 'center',
      },
      children: [
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
      ],
    },
  },
  {
    thumbnail: getImg('IMAGE_50'),
    payload: {
      type: 'section',
      data: {
        value: {
          noWrap: false,
        },
      },
      attributes: {
        padding: '20px 0px 20px 0px',
        'background-repeat': 'repeat',
        'background-size': 'auto',
        'background-position': 'top center',
        border: 'none',
        direction: 'ltr',
        'text-align': 'center',
      },
      children: [
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
      ],
    },
  },
  {
    thumbnail: getImg('IMAGE_51'),
    payload: {
      type: 'section',
      data: {
        value: {
          noWrap: false,
        },
      },
      attributes: {
        padding: '20px 0px 20px 0px',
        'background-repeat': 'repeat',
        'background-size': 'auto',
        'background-position': 'top center',
        border: 'none',
        direction: 'ltr',
        'text-align': 'center',
      },
      children: [
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
        {
          type: 'column',
          data: {
            value: {},
          },
          attributes: {
            padding: '0px 0px 0px 0px',
            border: 'none',
            'vertical-align': 'top',
          },
          children: [],
        },
      ],
    },
  },
];
