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

import moment from 'moment-timezone';
import { merge } from 'lodash';
import { schema } from '@osd/config-schema';
import { LogRecord, Layout } from '@osd/logging';
import { cleanControlSequences } from '@osd/std';

const { literal, object } = schema;

const jsonLayoutSchema = object({
  kind: literal('json'),
});

/** @internal */
export interface JsonLayoutConfigType {
  kind: 'json';
}

/**
 * Layout that just converts `LogRecord` into JSON string.
 * @internal
 */
export class JsonLayout implements Layout {
  public static configSchema = jsonLayoutSchema;

  private static errorToSerializableObject(error: Error | undefined) {
    if (error === undefined) {
      return error;
    }

    return {
      message: cleanControlSequences(error.message),
      type: error.name,
      stack_trace: error.stack && cleanControlSequences(error.stack),
    };
  }

  public format(record: LogRecord): string {
    return JSON.stringify(
      merge(
        {
          '@timestamp': moment(record.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          message: cleanControlSequences(record.message),
          error: JsonLayout.errorToSerializableObject(record.error),
          log: {
            level: record.level.id.toUpperCase(),
            logger: record.context,
          },
          process: {
            pid: record.pid,
          },
        },
        record.meta
      )
    );
  }
}
