/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import { Schemas } from '../../../../../vis_default_editor/public';
import { Positions } from '../../../../../vis_type_vislib/public';
import { AggGroupNames } from '../../../../../data/public';
import { PieVisOptions } from './components/pie_vis_options';
import { VisualizationTypeOptions } from '../../../services/type_service';
import { toExpression } from './to_expression';
import { BasicOptionsDefaults } from '../common/types';

const MAX_NESTING_LEVEL = 10; // arbitrary upper limit to sensible nesting

export interface PieOptionsDefaults extends BasicOptionsDefaults {
  type: 'pie';
  // TODO: Is needed? hierarchicalData: boolean;
  isDonut: boolean;
  // TODO: Is needed? responseHandler: string;
  showMetricsAtAllLevels: boolean;
}

export const createPieConfig = (): VisualizationTypeOptions<PieOptionsDefaults> => ({
  name: 'pie',
  title: i18n.translate('visTypeVislib.pie.pieTitle', { defaultMessage: 'Pie' }),
  icon: 'visPie',
  description: 'Display pie or donut chart to compare parts of a whole',
  toExpression,
  ui: {
    containerConfig: {
      data: {
        schemas: new Schemas([
          {
            group: AggGroupNames.Metrics,
            name: 'metric',
            title: i18n.translate('visTypeVislib.pie.metricTitle', {
              defaultMessage: 'Slice size',
            }),
            min: 1,
            max: 1,
            aggFilter: ['sum', 'count', 'cardinality', 'top_hits'],
            defaults: [{ schema: 'metric', type: 'count' }],
          },
          {
            group: AggGroupNames.Buckets,
            name: 'segment',
            title: i18n.translate('visTypeVislib.pie.segmentTitle', {
              defaultMessage: 'Split slices',
            }),
            min: 0,
            max: MAX_NESTING_LEVEL,
            aggFilter: ['!geohash_grid', '!geotile_grid', '!filter'],
            defaults: { aggTypes: ['terms'] },
          },
          {
            group: AggGroupNames.Buckets,
            name: 'split',
            title: i18n.translate('visTypeVislib.pie.splitTitle', {
              defaultMessage: 'Split chart',
            }),
            min: 0,
            max: 1,
            aggFilter: ['!geohash_grid', '!geotile_grid', '!filter'],
            // when contructing agg configs, the split chart agg must be applied first for proper total calculation of the split pies
            mustBeFirst: true,
            defaults: { aggTypes: ['terms'] },
          },
        ]),
      },
      style: {
        defaults: {
          addTooltip: true,
          addLegend: true,
          isDonut: true,
          legendPosition: Positions.RIGHT,
          showMetricsAtAllLevels: true,
          type: 'pie',
          useVegaLiteRendering: false,
          // TODO: Is this needed? responseHandler: 'vislib_slices',
        },
        render: PieVisOptions,
      },
    },
  },
});
