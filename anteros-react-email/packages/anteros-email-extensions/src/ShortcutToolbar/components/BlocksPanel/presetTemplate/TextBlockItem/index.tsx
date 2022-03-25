
import React from 'react';
import { Stack, } from '@anterostecnologia/anteros-email-editor';
import { BasicType } from '@anterostecnologia/anteros-email-core';

import { BlockMaskWrapper } from '@extensions/ShortcutToolbar/components/BlockMaskWrapper';

const fontList = [48, 32, 27, 24, 18, 16, 14];

export function TextBlockItem() {
  return (
    <Stack.Item fill>
      <Stack vertical>
        {fontList.map((item, index) => {
          return (
            <Stack.Item fill key={index}>
              <BlockMaskWrapper
                type={BasicType.TEXT}
                payload={{
                  attributes: {
                    'font-size': item + 'px',
                    padding: '0px 0px 0px 0px'
                  },
                  data: {
                    value: {
                      content: item + 'px',
                    },
                  },
                }}
              >
                <div style={{ fontSize: item, width: '100%', paddingLeft: 20 }}>
                  {item}px
                </div>
              </BlockMaskWrapper>
            </Stack.Item>
          );
        })}
      </Stack>
    </Stack.Item>
  );
}
