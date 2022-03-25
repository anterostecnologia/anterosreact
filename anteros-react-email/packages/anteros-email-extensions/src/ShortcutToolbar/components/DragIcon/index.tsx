import { IconFont, BlockAvatarWrapper } from '@anterostecnologia/anteros-email-editor';
import { Button } from '@arco-design/web-react';
import { getIconNameByBlockType } from '@extensions';
import React from 'react';
import { BlockManager, IBlockData } from '@anterostecnologia/anteros-email-core';
import { RecursivePartial } from '@anterostecnologia/anteros-email-core';

export interface DragIconProps<T extends IBlockData> {
  type: string;
  payload?: RecursivePartial<T>;
  color: string;
}

export function DragIcon<T extends IBlockData = any>(props: DragIconProps<T>) {
  const block = BlockManager.getBlockByType(props.type);
  return (
    <BlockAvatarWrapper type={props.type} payload={props.payload}>
      <Button
        type='text'
        title={block?.name}
        icon={(
          <IconFont
            iconName={getIconNameByBlockType(props.type)}
            style={{
              fontSize: 16,
              textAlign: 'center',
              cursor: 'move',
              color: props.color,
            }}
          />
        )}
      />
    </BlockAvatarWrapper>
  );
}
