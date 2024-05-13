/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import {
  ExpressionFunctionDefinition,
  OpenSearchDashboardsDatatable,
} from '../../../expressions/public';
import { VegaVisualizationDependencies } from '../plugin';

type Input = OpenSearchDashboardsDatatable;
type Output = Promise<string>;

export type PieVegaSpecExpressionFunctionDefinition = ExpressionFunctionDefinition<
  'pie_vega_spec',
  Input,
  {},
  Output
>;

export const createPieVegaSpecFn = (
  _dependencies: VegaVisualizationDependencies
): PieVegaSpecExpressionFunctionDefinition => ({
  name: 'pie_vega_spec',
  type: 'string',
  inputTypes: ['opensearch_dashboards_datatable'],
  help: i18n.translate('visTypeVega.function.helpSpec', {
    defaultMessage: 'Construct pie vega spec',
  }),
  args: {},
  async fn(_input, _args, _context) {
    // let table = formatDatatable(cloneDeep(input));

    // const visParams = JSON.parse(args.visParams) as VisParams;
    // const dimensions = JSON.parse(args.dimensions) as VislibDimensions;

    // let spec = createSpecFromXYChartDatatable(table, visParams, dimensions, visAugmenterConfig);

    // Apply other formatting changes to the spec (show vis data, hide axes, etc.) based on the
    // vis augmenter config. Mostly used for customizing the views on the view events flyout.
    // return JSON.stringify(spec);
    return `{\n  $schema: https://vega.github.io/schema/vega-lite/v5.json\n  data: {\n    url: {\n      %context%: true\n      %timefield%: @timestamp\n      index: opensearch_dashboards_sample_data_logs\n      body: {\n        aggs: {\n          2: {\n            terms: {\n              field: machine.os.keyword\n              order: {\n                1: desc\n              }\n              size: 5\n            }\n            aggs: {\n              1: {\n                cardinality: {\n                  field: clientip\n                }\n              }\n            }\n          }\n        }\n        size: 0\n      }\n    }\n    format: {\n      property: aggregations.2\n    }\n  }\n  transform: [\n    {\n      flatten: [\n        buckets\n      ]\n      as: [\n        os_buckets\n      ]\n    }\n    {\n      calculate: datum.os_buckets.key\n      as: os\n    }\n    {\n      calculate: datum.os_buckets[1].value\n      as: visitors\n    }\n    {\n      joinaggregate: [\n        {\n          op: sum\n          field: visitors\n          as: total_visitors\n        }\n      ]\n    }\n    {\n      calculate: datum.visitors / datum.total_visitors\n      as: perc_visitors\n    }\n  ]\n  mark: {\n    type: arc\n    tooltip: true\n    innerRadius: {\n      expr: min(height, width) * .375\n    }\n  }\n  encoding: {\n    theta: {\n      field: visitors\n      type: quantitative\n      scale: {\n        reverse: true\n      }\n    }\n    order: {\n      field: visitors\n      type: quantitative\n    }\n    color: {\n      field: os\n      type: nominal\n      sort: -theta\n    }\n    tooltip: [\n      {\n        field: os\n      }\n      {\n        field: visitors\n      }\n      {\n        field: perc_visitors\n        title: % visitors\n        format: .2%\n      }\n    ]\n  }\n}`;
  },
});
