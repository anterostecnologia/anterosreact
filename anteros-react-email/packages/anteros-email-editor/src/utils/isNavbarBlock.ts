import { BasicType, AdvancedType } from '@anterostecnologia/anteros-email-core';

export function isNavbarBlock(blockType: any) {
  return blockType === BasicType.NAVBAR || blockType === AdvancedType.NAVBAR;
}