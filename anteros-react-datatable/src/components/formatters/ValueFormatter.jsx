import React from 'react';

export function ValueFormatter(props) {
  try {
    return <>{props.row[props.column.key]}</>;
  } catch {
    return null;
  }
}
