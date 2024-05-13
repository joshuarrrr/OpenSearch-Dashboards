/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaConfig } from '../../../../../visualizations/public';
import { buildExpression, buildExpressionFunction } from '../../../../../expressions/public';
import { PieOptionsDefaults } from './pie_vis_type';
import { getAggExpressionFunctions } from '../../common/expression_helpers';
import { VislibRootState } from '../common';
import { AggConfigs, IAggConfig } from '../../../../../data/public';
import { VegaExpressionFunctionDefinition } from '../../../../../vis_type_vega/public';

// TODO: Update to the common getShemas from src/plugins/visualizations/public/legacy/build_pipeline.ts
// And move to a common location accessible by all the visualizations
const getVisSchemas = (aggConfigs: AggConfigs, showMetricsAtAllLevels: boolean): any => {
  const createSchemaConfig = (accessor: number, agg: IAggConfig): SchemaConfig => {
    const hasSubAgg = [
      'derivative',
      'moving_avg',
      'serial_diff',
      'cumulative_sum',
      'sum_bucket',
      'avg_bucket',
      'min_bucket',
      'max_bucket',
    ].includes(agg.type.name);

    const formatAgg = hasSubAgg
      ? agg.params.customMetric || agg.aggConfigs.getRequestAggById(agg.params.metricAgg)
      : agg;

    const params = {};

    const label = agg.makeLabel && agg.makeLabel();

    return {
      accessor,
      format: formatAgg.toSerializedFieldFormat(),
      params,
      label,
      aggType: agg.type.name,
    };
  };

  let cnt = 0;
  const schemas: any = {
    metric: [],
  };

  if (!aggConfigs) {
    return schemas;
  }

  const responseAggs = aggConfigs.getResponseAggs().filter((agg: IAggConfig) => agg.enabled);
  const metrics = responseAggs.filter((agg: IAggConfig) => agg.type.type === 'metrics');

  responseAggs.forEach((agg) => {
    let skipMetrics = false;
    const schemaName = agg.schema;

    if (!schemaName) {
      cnt++;
      return;
    }

    if (schemaName === 'split_row' || schemaName === 'split_column') {
      skipMetrics = responseAggs.length - metrics.length > 1;
    }

    if (!schemas[schemaName]) {
      schemas[schemaName] = [];
    }

    if (!showMetricsAtAllLevels || agg.type.type !== 'metrics') {
      schemas[schemaName]!.push(createSchemaConfig(cnt++, agg));
    }

    if (
      showMetricsAtAllLevels &&
      (agg.type.type !== 'metrics' || metrics.length === responseAggs.length)
    ) {
      metrics.forEach((metric: any) => {
        const schemaConfig = createSchemaConfig(cnt++, metric);
        if (!skipMetrics) {
          schemas.metric.push(schemaConfig);
        }
      });
    }
  });

  return schemas;
};

export const toExpression = async ({
  style: styleState,
  visualization,
}: VislibRootState<PieOptionsDefaults>) => {
  const { aggConfigs, expressionFns } = await getAggExpressionFunctions(visualization, styleState);
  const {
    addLegend,
    addTooltip,
    showMetricsAtAllLevels,
    isDonut,
    legendPosition,
    useVegaLiteRendering,
  } = styleState;

  const schemas = getVisSchemas(aggConfigs, showMetricsAtAllLevels);

  const dimensions = {
    metric: schemas.metric[0],
    buckets: schemas.segment,
    splitRow: schemas.split,
  };

  // TODO: what do we want to put in this "vis config"?
  const visConfig = {
    addLegend,
    addTooltip,
    isDonut,
    legendPosition,
    dimensions,
    showMetricsAtAllLevels,
  };

  if (useVegaLiteRendering) {
    const vegaSpecFn = buildExpressionFunction<any>('pie_vega_spec', {
      // visConfig: JSON.stringify(visConfig),
    });

    const vegaSpecFnExpressionBuilder = buildExpression([vegaSpecFn]);

    const vegaFn = buildExpressionFunction<VegaExpressionFunctionDefinition>('vega', {
      spec: vegaSpecFnExpressionBuilder,
    });

    return buildExpression([...expressionFns, vegaFn]).toString();
  } else {
    const vislib = buildExpressionFunction<any>('opensearch_dashboards_pie', {
      visConfig: JSON.stringify(visConfig),
    });

    return buildExpression([...expressionFns, vislib]).toString();
  }
};
