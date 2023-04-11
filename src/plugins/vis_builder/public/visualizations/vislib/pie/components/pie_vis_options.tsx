/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { i18n } from '@osd/i18n';
import produce, { Draft } from 'immer';
import {
  setState,
  useTypedDispatch,
  useTypedSelector,
} from '../../../../application/utils/state_management';
import { SwitchOption } from '../../../../../../charts/public';
import { PieOptionsDefaults } from '../pie_vis_type';
import { Option } from '../../../../application/app';
import { BasicVisOptions } from '../../common/basic_vis_options';

function PieVisOptions() {
  const styleState = useTypedSelector((state) => state.style) as PieOptionsDefaults;
  const dispatch = useTypedDispatch();

  const setOption = useCallback(
    (callback: (draft: Draft<typeof styleState>) => void) => {
      const newState = produce(styleState, callback);
      dispatch(setState<PieOptionsDefaults>(newState));
    },
    [dispatch, styleState]
  );

  return (
    <>
      <Option
        title={i18n.translate('visTypeVislib.pie.params.settingsTitle', {
          defaultMessage: 'Settings',
        })}
        initialIsOpen
      >
        <SwitchOption
          label={i18n.translate('charts.controls.vislibPieOptions.donut', {
            defaultMessage: 'Donut',
          })}
          paramName="donut"
          value={styleState.isDonut}
          setValue={(_, value) =>
            setOption((draft) => {
              draft.isDonut = value;
            })
          }
        />
        <BasicVisOptions styleState={styleState} setOption={setOption} />
      </Option>
    </>
  );
}

export { PieVisOptions };
