import { PopoverProps, Tooltip } from '@arco-design/web-react';
import React, { useCallback, useMemo } from 'react';
import { IconFont } from '@anterostecnologia/anteros-email-editor';
import { ToolItem } from '../ToolItem';
import { EMAIL_BLOCK_CLASS_NAME } from '@anterostecnologia/anteros-email-core';
import { useSelectionRange } from '@extensions/AttributePanel/hooks/useSelectionRange';

export interface LinkProps extends PopoverProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

function getStrikeThroughNode(
  node: Node | null | undefined,
): Element | null {
  if (!node) return null;
  if (node instanceof Element && node.classList.contains(EMAIL_BLOCK_CLASS_NAME)) return null;
  if (node instanceof Element && node.tagName.toLocaleLowerCase() === 'strike') return node;
  return getStrikeThroughNode(node.parentNode);
}

export function StrikeThrough(props: LinkProps) {
  const { onChange } = props;
  const { setRangeByElement } = useSelectionRange();
  const node = useMemo(() => {
    return getStrikeThroughNode(props.currentRange?.commonAncestorContainer);

  }, [props.currentRange]);

  const onClick = useCallback(() => {
    if (node) {
      setRangeByElement(node);
    }
    onChange();
  }, [node, onChange, setRangeByElement]);

  return (
    <Tooltip
      color='#fff'
      position='tl'
      content="Strikethrough"
    >
      <ToolItem title='Tachado' isActive={Boolean(node)} icon={<IconFont iconName='icon-strikethrough' />} onClick={onClick} />
    </Tooltip>
  );
}
