/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash';
import Color from 'color';

import { CoreSetup } from 'opensearch-dashboards/public';

import { euiPaletteColorBlind } from '@elastic/eui';
import { COLOR_MAPPING_SETTING } from '../../../common';

const standardizeColor = (color: string) => new Color(color).hex().toLowerCase();

/**
 * Maintains a lookup table that associates the value (key) with a hex color (value)
 * across the visualizations.
 * Provides functions to interact with the lookup table
 */
export class MappedColors {
  private _oldMap: any;
  private _mapping: any;

  constructor(private uiSettings: CoreSetup['uiSettings']) {
    this._oldMap = {};
    this._mapping = {};
  }

  private getConfigColorMapping() {
    return _.mapValues(
      this.uiSettings.get(COLOR_MAPPING_SETTING) as Record<string | number, string> | undefined,
      standardizeColor
    );
  }

  public get oldMap(): any {
    return this._oldMap;
  }

  public get mapping(): any {
    return this._mapping;
  }

  get(key: string | number) {
    return this.getConfigColorMapping()[key] || this._mapping[key];
  }

  flush() {
    this._oldMap = _.clone(this._mapping);
    this._mapping = {};
  }

  purge() {
    this._oldMap = {};
    this._mapping = {};
  }

  mapKeys(keys: Array<string | number>) {
    const configMapping = this.getConfigColorMapping();

    const alreadyUsedColors: string[] = _.values(this._mapping);
    const keysToMap: Array<string | number> = [];
    debugger;
    _.each(keys, (key) => {
      // If this key is mapped in the config, it's unnecessary to have it mapped here
      if (configMapping[key]) {
        delete this._mapping[key];
      }

      // if key exist in oldMap, move it to mapping
      if (this._oldMap[key]) {
        this._mapping[key] = this._oldMap[key];
        alreadyUsedColors.push(this._mapping[key]);
      }

      // If this key isn't mapped, we need to map it
      if (this.get(key) == null) keysToMap.push(key);
    });

    const defaultPallette = euiPaletteColorBlind();
    const mappedValuesSize = _.values(this._mapping).length;
    if (keys.length <= defaultPallette.length) {
      // Always preferentially use the pallette root colors, in order
      const colorPalette = defaultPallette
        .filter((color) => !alreadyUsedColors.includes(color.toLowerCase()))
        .slice(0, keysToMap.length);
      _.merge(this._mapping, _.zipObject(keysToMap, colorPalette));
    } else if (keys.length <= 2 * defaultPallette.length) {
      // If we only need 2 rotations, use root colors first, then assign lighter variations
      // This ensures more saturation in the default case where series are ordered based on descending size
      const colorPalette = euiPaletteColorBlind({
        rotations: 2,
      });
      if (
        mappedValuesSize <= defaultPallette.length ||
        mappedValuesSize > 2 * defaultPallette.length
      ) {
        // Remap all colors if we change palette definition
        this._mapping = _.zipObject(keys, colorPalette);
      } else {
        // Choose colors from euiPaletteColorBlind and filter out any already assigned to keys.
        // Color palette order assignment matters, so we should always use a palette big enough for all keys.
        const trimmedPalette = colorPalette
          .filter((color) => !alreadyUsedColors.includes(color.toLowerCase()))
          .slice(0, keysToMap.length);

        _.merge(this._mapping, _.zipObject(keysToMap, trimmedPalette));
      }
    } else {
      // if we need 3 or more rotations, it looks much better to group similar colors together,
      // even at the cost of less ability to distinguish
      const colorPalette = euiPaletteColorBlind({
        rotations: Math.ceil(keys.length / defaultPallette.length),
        order: 'middle-out',
        direction: 'both',
      });
      if (
        Math.ceil(mappedValuesSize / defaultPallette.length) !==
        Math.ceil(keys.length / defaultPallette.length)
      ) {
        // Remap all colors if we change palette definition
        this._mapping = _.zipObject(keys, colorPalette);
      } else {
        // Choose colors from euiPaletteColorBlind and filter out any already assigned to keys.
        // Color palette order assignment matters, so we should always use a palette big enough for all keys.
        const trimmedPalette = colorPalette
          .filter((color) => !alreadyUsedColors.includes(color.toLowerCase()))
          .slice(0, keysToMap.length);

        _.merge(this._mapping, _.zipObject(keysToMap, trimmedPalette));
      }
    }
  }
}
