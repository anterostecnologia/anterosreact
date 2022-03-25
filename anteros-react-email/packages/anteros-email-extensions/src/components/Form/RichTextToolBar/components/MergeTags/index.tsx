import React, { useCallback, useEffect } from 'react';

import { MergeTags as MergeTagsOptions } from '@extensions/AttributePanel';
import { Popover } from '@arco-design/web-react';
import { ToolItem } from '../ToolItem';
import { IconFont } from '@anterostecnologia/anteros-email-editor';

export interface MergeTagsProps {
  execCommand: (cmd: string, value: any) => void;
  getPopupContainer: () => HTMLElement;
}

export function MergeTags(props: MergeTagsProps) {
  const { execCommand } = props;
  const [visible, setVisible] = React.useState(false);

  const onChange = useCallback((val: string) => {
    execCommand('insertHTML', val);
    setVisible(false);
  }, [execCommand]);

  const onVisibleChange = useCallback((v: boolean) => {
    setVisible(v);
  }, []);

  return (
    <Popover
      trigger='click'
      color='#fff'
      position='left'
      popupVisible={visible}
      onVisibleChange={onVisibleChange}
      content={(
        <>
          <MergeTagsOptions
            value=''
            onChange={onChange}
          />
        </>

      )}
      getPopupContainer={props.getPopupContainer}
    >
      <ToolItem
        title='Mesclar tag'
        icon={<IconFont iconName='icon-merge-tags' />}
      />
    </Popover>
  );
}
