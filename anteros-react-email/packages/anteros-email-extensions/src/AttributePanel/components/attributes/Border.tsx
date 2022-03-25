import React, { useMemo } from 'react';
import { InputWithUnitField, TextField } from '../../../components/Form';
import { Stack, useFocusIdx } from '@anterostecnologia/anteros-email-editor';
import { Grid, Space } from '@arco-design/web-react';

export function Border() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Grid.Row>
        <Grid.Col span={11}>
          <TextField label='Borda' name={`${focusIdx}.attributes.border`} />
        </Grid.Col>
        <Grid.Col offset={1} span={11}>
          <InputWithUnitField
            label='Raio da borda'
            name={`${focusIdx}.attributes.border-radius`}
            unitOptions='percent'
          />
        </Grid.Col>
      </Grid.Row>
    );
  }, [focusIdx]);
}
