import React from 'react';
import clsx from 'clsx';
import SortableHeaderCell from './headerCells/SortableHeaderCell';
import { getCellStyle } from './utils';

function getAriaSort(sortDirection) {
  switch (sortDirection) {
    case 'ASC':
      return 'ascending';
    case 'DESC':
      return 'descending';
    default:
      return 'none';
  }
}

export default function HeaderCell({
  column,
  onResize,
  allRowsSelected,
  onAllRowsSelectionChange,
  sortColumn,
  sortDirection,
  onSort
}) {
  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.buttons !== 1) {
      return;
    }

    const { currentTarget, pointerId } = event;
    const { right } = currentTarget.getBoundingClientRect();
    const offset = right - event.clientX;

    if (offset > 11) { // +1px to account for the border size
      return;
    }

    function onPointerMove(evt) {
      if (evt.pointerId !== pointerId) return;
      if (evt.pointerType === 'mouse' && evt.buttons !== 1) {
        onPointerUp();
        return;
      }
      const width = evt.clientX + offset - currentTarget.getBoundingClientRect().left;
      if (width > 0) {
        onResize(column, width);
      }
    }

    function onPointerUp() {
      if (event.pointerId !== pointerId) return;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }

    event.preventDefault();
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function getCell() {
    if (column.headerRenderer) {
      return (
        <column.headerRenderer
          column={column}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          allRowsSelected={allRowsSelected}
          onAllRowsSelectionChange={onAllRowsSelectionChange}
        />
      );
    }

    if (column.sortable) {
      return (
        <SortableHeaderCell
          column={column}
          onSort={onSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        >
          {column.name}
        </SortableHeaderCell>
      );
    }

    return column.name;
  }

  const className = clsx('rdg-cell', column.headerCellClass, {
    'rdg-cell-resizable': column.resizable,
    'rdg-cell-frozen': column.frozen,
    'rdg-cell-frozen-last': column.isLastFrozenColumn
  });

  return (
    <div
      role="columnheader"
      aria-colindex={column.idx + 1}
      aria-sort={sortColumn === column.key ? getAriaSort(sortDirection) : undefined}
      className={className}
      style={getCellStyle(column)}
      onPointerDown={column.resizable ? onPointerDown : undefined}
    >
      {getCell()}
    </div>
  );
}
