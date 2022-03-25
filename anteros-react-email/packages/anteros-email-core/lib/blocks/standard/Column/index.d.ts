import { IBlockData } from '../../../typings';
import { CSSProperties } from 'react';
export declare type IColumn = IBlockData<{
    'background-color'?: string;
    border?: string;
    'border-radius'?: string;
    'inner-border'?: string;
    'inner-border-radius'?: string;
    padding?: string;
    'text-align'?: CSSProperties['textAlign'];
    'vertical-align'?: CSSProperties['verticalAlign'];
    width?: string;
}, {}>;
export declare const Column: import("../../../typings").IBlock<IColumn>;
