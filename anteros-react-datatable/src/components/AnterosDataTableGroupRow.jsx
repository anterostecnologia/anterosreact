import React, { memo } from 'react';
import clsx from 'clsx';
import { SELECT_COLUMN_KEY } from './AnterosDataTableColumns';
import GroupCell from './AnterosDataTableGroupCell';

function GroupedRow({
  id,
  groupKey,
  viewportColumns,
  childRows,
  rowIdx,
  top,
  level,
  isExpanded,
  selectedCellIdx,
  isRowSelected,
  selectCell,
  selectRow,
  toggleGroup,
  ...props
}) {
  // Select is always the first column
  const idx = viewportColumns[0].key === SELECT_COLUMN_KEY ? level + 1 : level;

  function selectGroup() {
    selectCell({ rowIdx, idx: -1 });
  }

  return (
    <div
      role="row"
      aria-level={level}
      aria-expanded={isExpanded}
      className={clsx(
        'rdg-row',
        'rdg-group-row',
        `rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'}`, {
          'rdg-row-selected': isRowSelected,
          'rdg-group-row-selected': selectedCellIdx === -1 // Select row if there is no selected cell
        })}
      onClick={selectGroup}
      style={{ top }}
      {...props}
    >
      {viewportColumns.map(column => (
        <GroupCell
          key={column.key}
          id={id}
          rowIdx={rowIdx}
          groupKey={groupKey}
          childRows={childRows}
          isExpanded={isExpanded}
          isRowSelected={isRowSelected}
          isCellSelected={selectedCellIdx === column.idx}
          column={column}
          groupColumnIndex={idx}
          selectRow={selectRow}
          toggleGroup={toggleGroup}
        />
      ))}
    </div>
  );
}

export default memo(GroupedRow);
