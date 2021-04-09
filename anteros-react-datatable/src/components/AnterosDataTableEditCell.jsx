import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import EditorContainer from './editors/EditorContainer';
import { getCellStyle } from './utils';

export default function EditCell({
  className,
  column,
  row,
  rowIdx,
  editorProps,
  ...props
}) {
  const [dimensions, setDimensions] = useState(null);

  const cellRef = useCallback(node => {
    if (node !== null) {
      const { left, top } = node.getBoundingClientRect();
      setDimensions({ left, top });
    }
  }, []);

  const { cellClass } = column;
  className = clsx(
    'rdg-cell',
    {
      'rdg-cell-frozen': column.frozen,
      'rdg-cell-frozen-last': column.isLastFrozenColumn
    },
    'rdg-cell-selected',
    'rdg-cell-editing',
    typeof cellClass === 'function' ? cellClass(row) : cellClass,
    className
  );

  function getCellContent() {
    if (dimensions === null) return;
    const { scrollTop: docTop, scrollLeft: docLeft } = document.scrollingElement ? document.documentElement : undefined;
    const { left, top } = dimensions;
    const gridLeft = left + docLeft;
    const gridTop = top + docTop;

    return (
      <EditorContainer
        {...editorProps}
        rowIdx={rowIdx}
        column={column}
        left={gridLeft}
        top={gridTop}
      />
    );
  }

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-selected
      ref={cellRef}
      className={className}
      style={getCellStyle(column)}
      {...props}
    >
      {getCellContent()}
    </div>
  );
}
