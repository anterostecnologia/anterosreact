import { Picture } from '@demo/components/Picture';
import { BlockMaskWrapper } from '@anterostecnologia/anteros-email-extensions';
import React from 'react';
import { CustomBlocksType } from '../constants';

export function Example() {
  return (
    <BlockMaskWrapper
      type={CustomBlocksType.PRODUCT_RECOMMENDATION}
      payload={{}}
    >
      <div style={{ position: 'relative' }}>
        <Picture
          src={
            'https://assets.maocanhua.cn/c160738b-db01-4081-89e5-e35bd3a34470-image.png'
          }
        />
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
}
