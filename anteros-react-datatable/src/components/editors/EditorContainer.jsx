import React from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '../hooks';

export default function EditorContainer({
  row,
  column,
  onRowChange,
  ...props
}) {
  const onClickCapture = useClickOutside(() => onRowChange(row, true));
  if (column.editor === undefined) return null;

  const editor = (
    <div className="rdg-editor-container" onClickCapture={onClickCapture}>
      <column.editor
        row={row}
        column={column}
        onRowChange={onRowChange}
        {...props}
      />
    </div>
  );

  if (column.editorOptions.createPortal) {
    return createPortal(editor, props.editorPortalTarget);
  }

  return editor;
}
