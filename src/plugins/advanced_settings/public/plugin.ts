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

import { i18n } from '@osd/i18n';
import { CoreSetup, CoreStart, Plugin } from 'opensearch-dashboards/public';
import { FeatureCatalogueCategory } from '../../home/public';
import { ComponentRegistry } from './component_registry';
import { AdvancedSettingsSetup, AdvancedSettingsStart, AdvancedSettingsPluginSetup } from './types';
import { setupTopNavThemeButton } from './register_nav_control';

const component = new ComponentRegistry();

const title = i18n.translate('advancedSettings.advancedSettingsLabel', {
  defaultMessage: 'Advanced settings',
});

export class AdvancedSettingsPlugin
  implements Plugin<AdvancedSettingsSetup, AdvancedSettingsStart, AdvancedSettingsPluginSetup> {
  public setup(core: CoreSetup, { management, home }: AdvancedSettingsPluginSetup) {
    const opensearchDashboardsSection = management.sections.section.opensearchDashboards;

    opensearchDashboardsSection.registerApp({
      id: 'settings',
      title,
      order: 3,
      async mount(params) {
        const { mountManagementSection } = await import(
          './management_app/mount_management_section'
        );
        return mountManagementSection(core.getStartServices, params, component.start);
      },
    });

    if (home) {
      home.featureCatalogue.register({
        id: 'advanced_settings',
        title,
        description: i18n.translate('advancedSettings.featureCatalogueTitle', {
          defaultMessage:
            'Customize your OpenSearch Dashboards experience — change the date format, turn on dark mode, and more.',
        }),
        icon: 'gear',
        path: '/app/management/opensearch-dashboards/settings',
        showOnHomePage: false,
        category: FeatureCatalogueCategory.ADMIN,
      });
    }

    return {
      component: component.setup,
    };
  }

  public start(core: CoreStart) {
    setupTopNavThemeButton(core);

    return {
      component: component.start,
    };
  }
}
