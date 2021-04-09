import React, { useMemo } from 'react';
import { ValueFormatter, ToggleGroupFormatter } from '../formatters';
import { SELECT_COLUMN_KEY } from '../AnterosDataTableColumns';

export function useViewportColumns({
  rawColumns,
  columnWidths,
  viewportWidth,
  scrollLeft,
  defaultColumnOptions,
  rawGroupBy
}) {
  const minColumnWidth = defaultColumnOptions.minWidth ? defaultColumnOptions.minWidth : 80;
  const defaultFormatter = defaultColumnOptions.formatter ? defaultColumnOptions.formatter : ValueFormatter;
  const defaultSortable = defaultColumnOptions.sortable ? defaultColumnOptions.sortable: false;
  const defaultResizable = defaultColumnOptions.resizable ? defaultColumnOptions.resizable: false;

  const { columns, lastFrozenColumnIndex, groupBy } = useMemo(() => {
    // Filter rawGroupBy and ignore keys that do not match the columns prop
    const groupBy = [];
    let lastFrozenColumnIndex = -1;

    const columns = rawColumns.map(rawColumn => {
      const isGroup = rawGroupBy.includes(rawColumn.key);

      const column = {
        ...rawColumn,
        idx: 0,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        frozen: isGroup || rawColumn.frozen || false,
        isLastFrozenColumn: false,
        rowGroup: isGroup,
        sortable: rawColumn.sortable ? rawColumn.sortable :  defaultSortable,
        resizable: rawColumn.resizable ? rawColumn.resizable : defaultResizable,
        formatter: rawColumn.formatter ? rawColumn.formatter : defaultFormatter
      };

      if (column.frozen) {
        lastFrozenColumnIndex++;
      }

      return column;
    });

    columns.sort(({ key: aKey, frozen: frozenA }, { key: bKey, frozen: frozenB }) => {
      // Sort select column first:
      if (aKey === SELECT_COLUMN_KEY) return -1;
      if (bKey === SELECT_COLUMN_KEY) return 1;

      // Sort grouped columns second, following the groupBy order:
      if (rawGroupBy.includes(aKey)) {
        if (rawGroupBy.includes(bKey)) {
          return rawGroupBy.indexOf(aKey) - rawGroupBy.indexOf(bKey);
        }
        return -1;
      }
      if (rawGroupBy.includes(bKey)) return 1;

      // Sort frozen columns third:
      if (frozenA) {
        if (frozenB) return 0;
        return -1;
      }
      if (frozenB) return 1;

      // Sort other columns last:
      return 0;
    });

    columns.forEach((column, idx) => {
      column.idx = idx;

      if (idx === lastFrozenColumnIndex) {
        column.isLastFrozenColumn = true;
      }

      if (column.rowGroup) {
        groupBy.push(column.key);
        column.groupFormatter = ToggleGroupFormatter;
      }
    });

    return {
      columns,
      lastFrozenColumnIndex,
      groupBy
    };
  }, [rawColumns, defaultFormatter, defaultResizable, defaultSortable, rawGroupBy]);

  const { layoutCssVars, totalColumnWidth, totalFrozenColumnWidth, columnMetrics } = useMemo(() => {
    const columnMetrics = new Map();
    let left = 0;
    let totalColumnWidth = 0;
    let totalFrozenColumnWidth = 0;
    let templateColumns = '';
    let allocatedWidth = 0;
    let unassignedColumnsCount = 0;

    for (const column of columns) {
      let width = getSpecifiedWidth(column, columnWidths, viewportWidth);

      if (width === undefined) {
        unassignedColumnsCount++;
      } else {
        width = clampColumnWidth(width, column, minColumnWidth);
        allocatedWidth += width;
        columnMetrics.set(column, { width, left: 0 });
      }
    }

    const unallocatedWidth = viewportWidth - allocatedWidth;
    const unallocatedColumnWidth = unallocatedWidth / unassignedColumnsCount;

    for (const column of columns) {
      let width;
      if (columnMetrics.has(column)) {
        const columnMetric = columnMetrics.get(column);
        columnMetric.left = left;
        ({ width } = columnMetric);
      } else {
        width = clampColumnWidth(unallocatedColumnWidth, column, minColumnWidth);
        columnMetrics.set(column, { width, left });
      }
      totalColumnWidth += width;
      left += width;
      templateColumns += `${width}px `;
    }

    if (lastFrozenColumnIndex !== -1) {
      const columnMetric = columnMetrics.get(columns[lastFrozenColumnIndex]);
      totalFrozenColumnWidth = columnMetric.left + columnMetric.width;
    }

    const layoutCssVars = {
      '--template-columns': templateColumns
    };

    for (let i = 0; i <= lastFrozenColumnIndex; i++) {
      const column = columns[i];
      layoutCssVars[`--frozen-left-${column.key}`] = `${columnMetrics.get(column).left}px`;
    }

    return { layoutCssVars, totalColumnWidth, totalFrozenColumnWidth, columnMetrics };
  }, [columnWidths, columns, viewportWidth, minColumnWidth, lastFrozenColumnIndex]);

  const [colOverscanStartIdx, colOverscanEndIdx] = useMemo(() => {
    // get the viewport's left side and right side positions for non-frozen columns
    const viewportLeft = scrollLeft + totalFrozenColumnWidth;
    const viewportRight = scrollLeft + viewportWidth;
    // get first and last non-frozen column indexes
    const lastColIdx = columns.length - 1;
    const firstUnfrozenColumnIdx = Math.min(lastFrozenColumnIndex + 1, lastColIdx);

    // skip rendering non-frozen columns if the frozen columns cover the entire viewport
    if (viewportLeft >= viewportRight) {
      return [firstUnfrozenColumnIdx, firstUnfrozenColumnIdx];
    }

    // get the first visible non-frozen column index
    let colVisibleStartIdx = firstUnfrozenColumnIdx;
    while (colVisibleStartIdx < lastColIdx) {
      const { left, width } = columnMetrics.get(columns[colVisibleStartIdx]);
      // if the right side of the columnn is beyond the left side of the available viewport,
      // then it is the first column that's at least partially visible
      if (left + width > viewportLeft) {
        break;
      }
      colVisibleStartIdx++;
    }

    // get the last visible non-frozen column index
    let colVisibleEndIdx = colVisibleStartIdx;
    while (colVisibleEndIdx < lastColIdx) {
      const { left, width } = columnMetrics.get(columns[colVisibleEndIdx]);
      // if the right side of the column is beyond or equal to the right side of the available viewport,
      // then it the last column that's at least partially visible, as the previous column's right side is not beyond the viewport.
      if (left + width >= viewportRight) {
        break;
      }
      colVisibleEndIdx++;
    }

    const _colOverscanStartIdx = Math.max(firstUnfrozenColumnIdx, colVisibleStartIdx - 1);
    const _colOverscanEndIdx = Math.min(lastColIdx, colVisibleEndIdx + 1);

    return [_colOverscanStartIdx, _colOverscanEndIdx];
  }, [columns, columnMetrics, lastFrozenColumnIndex, scrollLeft, totalFrozenColumnWidth, viewportWidth]);

  const viewportColumns = useMemo(() => {
    const viewportColumns = [];
    for (let colIdx = 0; colIdx <= colOverscanEndIdx; colIdx++) {
      const column = columns[colIdx];

      if (colIdx < colOverscanStartIdx && !column.frozen) continue;
      viewportColumns.push(column);
    }

    return viewportColumns;
  }, [colOverscanEndIdx, colOverscanStartIdx, columns]);

  return { columns, viewportColumns, layoutCssVars, columnMetrics, totalColumnWidth, lastFrozenColumnIndex, totalFrozenColumnWidth, groupBy };
}

function getSpecifiedWidth(
  { key, width },
  columnWidths,
  viewportWidth
) {
  if (columnWidths.has(key)) {
    // Use the resized width if available
    return columnWidths.get(key);
  }
  if (typeof width === 'number') {
    return width;
  }
  if (typeof width === 'string' && /^\d+%$/.test(width)) {
    return Math.floor(viewportWidth * parseInt(width, 10) / 100);
  }
  return undefined;
}

function clampColumnWidth(
  width,
  { minWidth, maxWidth },
  minColumnWidth
) {
  width = Math.max(width, minWidth ? minWidth : minColumnWidth);

  if (typeof maxWidth === 'number') {
    return Math.min(width, maxWidth);
  }

  return width;
}
