import React, { memo } from 'react';
import clsx from 'clsx';
import { getCellStyle } from './utils';

function SummaryCell({
  column,
  row
}) {
  const { summaryFormatter: SummaryFormatter, summaryCellClass } = column;
  const className = clsx(
    'rdg-cell',
    {
      'rdg-cell-frozen': column.frozen,
      'rdg-cell-frozen-last': column.isLastFrozenColumn
    },
    typeof summaryCellClass === 'function' ? summaryCellClass(row) : summaryCellClass
  );

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1}
      className={className}
      style={getCellStyle(column)}
    >
      {SummaryFormatter && <SummaryFormatter column={column} row={row} />}
    </div>
  );
}

export default memo(SummaryCell);
