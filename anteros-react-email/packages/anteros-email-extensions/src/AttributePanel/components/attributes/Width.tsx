import React, { useCallback, useMemo } from 'react';
import { InputWithUnitField } from '../../../components/Form';
import { useFocusIdx, useBlock } from '@anterostecnologia/anteros-email-editor';
import { BasicType, getParentByIdx } from '@anterostecnologia/anteros-email-core';
import { InputWithUnitProps } from '@extensions/components/Form/InputWithUnit';

export function Width({
  inline = false,
  unitOptions,
}: {
  inline?: boolean;
  unitOptions?: InputWithUnitProps['unitOptions'];
}) {
  const { focusIdx } = useFocusIdx();
  const { focusBlock, values } = useBlock();
  const parentType = getParentByIdx(values, focusIdx)?.type;

  const validate = useCallback(
    (val: string): string | undefined => {
      if (
        focusBlock?.type === BasicType.COLUMN &&
        parentType === BasicType.GROUP
      ) {
        return /(\d)*%/.test(val)
          ? undefined
          : 'A coluna dentro de um grupo deve ter uma largura em porcentagem, não em pixel';
      }
      return undefined;
    },
    [focusBlock?.type, parentType]
  );

  return (
    <InputWithUnitField
      validate={validate}
      label='Largura'
      inline={inline}
      name={`${focusIdx}.attributes.width`}
      unitOptions={unitOptions}
    />
  );
}
