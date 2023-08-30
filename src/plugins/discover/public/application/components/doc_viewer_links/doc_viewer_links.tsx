/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiListGroupItem, EuiListGroupItemProps } from '@elastic/eui';
import { getDocViewsLinksRegistry } from '../../../opensearch_dashboards_services';
import { DocViewLinkRenderProps } from '../../doc_views_links/doc_views_links_types';

export function DocViewerLinks(renderProps: DocViewLinkRenderProps) {
  const listItems = getDocViewsLinksRegistry()
    .getDocViewsLinksSorted()
    .filter((item) => !(item.generateCb && item.generateCb(renderProps)?.hide))
    .map((item) => {
      const { generateCb, href, ...props } = item;
      const listItem: EuiListGroupItemProps = {
        'data-test-subj': 'docTableRowAction',
        ...props,
        href: generateCb ? generateCb(renderProps).url : href,
      };

      return listItem;
    });

  return (
    <EuiFlexGroup gutterSize="xs" justifyContent="flexEnd">
      {listItems.map((item, index) => (
        <EuiFlexItem key={index} grow={false}>
          <EuiListGroupItem {...item} />
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
}
