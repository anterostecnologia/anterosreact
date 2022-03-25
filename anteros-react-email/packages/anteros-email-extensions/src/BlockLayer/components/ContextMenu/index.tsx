import React, { useRef } from 'react';
import {
  IconFont,
  TextStyle,
  scrollBlockEleIntoView,
  useBlock, useEditorProps,
} from '@anterostecnologia/anteros-email-editor';
import { getIndexByIdx, getSiblingIdx } from '@anterostecnologia/anteros-email-core';
import styles from './index.module.scss';
import { IBlockDataWithId } from '../..';
import { useAddToCollection } from '@extensions/hooks/useAddToCollection';

export function ContextMenu({
  moveBlock,
  copyBlock,
  removeBlock,
  contextMenuData,
  onClose,
}: {
  onClose: (ev?: React.MouseEvent) => void;
  moveBlock: ReturnType<typeof useBlock>['moveBlock'];
  copyBlock: ReturnType<typeof useBlock>['copyBlock'];
  removeBlock: ReturnType<typeof useBlock>['removeBlock'];
  contextMenuData: {
    blockData: IBlockDataWithId;
    left: number;
    top: number;
  };
}) {
  const { blockData, left, top } = contextMenuData;
  const idx = blockData.id;
  const { modal, modalVisible, setModalVisible } = useAddToCollection();
  const props = useEditorProps();
  const ref = useRef<HTMLDivElement>(null);

  const handleMoveUp = () => {
    moveBlock(idx, getSiblingIdx(idx, -1));
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, -1),
    });
    onClose();
  };

  const handleMoveDown = () => {
    moveBlock(idx, getSiblingIdx(idx, 1));
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, 1),
    });
    onClose();
  };

  const handleCopy: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    copyBlock(idx);
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, 1),
    });
    onClose();
  };

  const handleAddToCollection = () => {
    setModalVisible(true);
  };

  const handleDelete = () => {
    removeBlock(idx);
    onClose();
  };

  const isFirst = getIndexByIdx(idx) === 0;

  return (
    <div ref={ref} style={{ visibility: modalVisible ? 'hidden' : undefined }}>
      <div
        style={{
          left: left,
          top: top,
        }}
        className={styles.wrap}
        onClick={(e) => e.stopPropagation()}
      >
        {!isFirst && (
          <div className={styles.listItem} onClick={handleMoveUp}>
            <IconFont iconName='icon-top' style={{ marginRight: 10 }} />{' '}
            <TextStyle>Mover para cima</TextStyle>
          </div>
        )}
        <div className={styles.listItem} onClick={handleMoveDown}>
          <IconFont iconName='icon-bottom' style={{ marginRight: 10 }} />{' '}
          <TextStyle>Mover para baixo</TextStyle>
        </div>
        <div className={styles.listItem} onClick={handleCopy}>
          <IconFont iconName='icon-copy' style={{ marginRight: 10 }} />{' '}
          <TextStyle>Copiar</TextStyle>
        </div>
        {props.onAddCollection && (
            <div className={styles.listItem} onClick={handleAddToCollection}>
              <IconFont iconName='icon-start' style={{ marginRight: 10 }} />{' '}
              <TextStyle>Adicionar a coleção</TextStyle>
            </div>
        )}
        <div className={styles.listItem} onClick={handleDelete}>
          <IconFont iconName='icon-delete' style={{ marginRight: 10 }} />{' '}
          <TextStyle>Remover</TextStyle>
        </div>
      </div>
      <div
        className={styles.contextmenuMark}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose(e);
        }}
      />
      {modal}
    </div>
  );
}
