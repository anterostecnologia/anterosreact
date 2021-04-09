import React, { memo } from 'react';
import clsx from 'clsx';
import { getCellStyle } from './utils';

function FilterRow({
  columns,
  filters,
  onFiltersChange
}) {
  function onChange(key, value) {
    const newFilters = { ...filters };
    newFilters[key] = value;
    onFiltersChange(newFilters);
  }

  return (
    <div
      role="row"
      aria-rowindex={2}
      className="rdg-filter-row"
    >
      {columns.map(column => {
        const { key } = column;
        const className = clsx('rdg-cell', {
          'rdg-cell-frozen': column.frozen,
          'rdg-cell-frozen-last': column.isLastFrozenColumn
        });

        return (
          <div
            key={key}
            className={className}
            style={getCellStyle(column)}
          >
            {column.filterRenderer && (
              <column.filterRenderer
                column={column}
                value={filters[column.key]}
                onChange={value => onChange(key, value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default memo(FilterRow);
