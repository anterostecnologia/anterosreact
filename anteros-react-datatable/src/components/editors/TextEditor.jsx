import React from 'react';

function autoFocusAndSelect(input) {
  input.focus();
  input.select();
}

export default function TextEditor({
  row,
  column,
  onRowChange,
  onClose
}) {
  return (
    <input
      className="rdg-text-editor"
      ref={autoFocusAndSelect}
      value={row[column.key]}
      onChange={event => onRowChange({ ...row, [column.key]: event.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}
