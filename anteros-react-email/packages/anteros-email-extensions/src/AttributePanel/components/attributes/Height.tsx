import React, { useMemo } from 'react';
import { TextField } from '../../../components/Form';
import { useFocusIdx, Stack } from '@anterostecnologia/anteros-email-editor';

export function Height({ inline }: { inline?: boolean; }) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack wrap={false}>
        <Stack.Item fill>
          <TextField
            label='Altura'
            name={`${focusIdx}.attributes.height`}
            quickchange
            inline={inline}
          />
        </Stack.Item>
      </Stack>
    );
  }, [focusIdx, inline]);
}
