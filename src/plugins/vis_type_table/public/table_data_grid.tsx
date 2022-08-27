/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiDataGrid } from '@elastic/eui';
import React from 'react';

export const DataGrid = (props) => {
  const { opensearchResponse } = props;
  const { tables } = opensearchResponse;
  const { columns, rows } = tables[0];

  const convertedColumns = columns.map((c: Record<string, any>) => ({
    ...c,
    actions: false,
    displayAsText: c.name,
  }));
  const columnVisibility = {
    visibleColumns: columns.map((c: Record<string, any>) => c.id),
    setVisibleColumns: () => {},
  };

  const rowCount = rows.length;

  const renderCellValue = ({ rowIndex, columnId }) => rows[rowIndex][columnId];

  const toolbarVisibility = false;

  return (
    <EuiDataGrid
      aria-labelledby=""
      columns={convertedColumns}
      columnVisibility={columnVisibility}
      className="new-table-vis-container"
      data-test-subj="tableVis"
      renderCellValue={renderCellValue}
      rowCount={rowCount}
      toolbarVisibility={toolbarVisibility}
    />
  );
};
