import React, { memo } from 'react';
import SummaryCell from './AnterosDataTableSummaryCell';



function SummaryRow({
  rowIdx,
  row,
  viewportColumns,
  bottom,
  'aria-rowindex': ariaRowIndex
}) {
  return (
    <div
      role="row"
      aria-rowindex={ariaRowIndex}
      className={`rdg-row rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'} rdg-summary-row`}
      style={{ bottom }}
    >
      {viewportColumns.map(column => (
        <SummaryCell
          key={column.key}
          column={column}
          row={row}
        />
      ))}
    </div>
  );
}

export default memo(SummaryRow);
