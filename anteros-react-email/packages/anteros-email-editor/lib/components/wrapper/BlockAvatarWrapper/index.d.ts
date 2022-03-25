import React from 'react';
import { BlockType } from '@anterostecnologia/anteros-email-core';
export declare type BlockAvatarWrapperProps = {
    type: BlockType | string;
    payload?: any;
    action?: 'add' | 'move';
    hideIcon?: boolean;
    idx?: string;
};
export declare const BlockAvatarWrapper: React.FC<BlockAvatarWrapperProps>;
