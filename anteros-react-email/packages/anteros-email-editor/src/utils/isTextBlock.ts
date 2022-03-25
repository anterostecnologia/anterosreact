import { BasicType, AdvancedType } from '@anterostecnologia/anteros-email-core';

export function isTextBlock(blockType: any) {
  return blockType === BasicType.TEXT || blockType === AdvancedType.TEXT;
}