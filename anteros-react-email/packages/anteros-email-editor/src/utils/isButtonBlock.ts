import { BasicType, AdvancedType } from '@anterostecnologia/anteros-email-core';

export function isButtonBlock(blockType: any) {
  return blockType === BasicType.BUTTON || blockType === AdvancedType.BUTTON;
}