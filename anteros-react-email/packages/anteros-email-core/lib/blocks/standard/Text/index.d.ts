import { IBlockData } from '../../../typings';
import { CSSProperties } from 'react';
export declare type IText = IBlockData<{
    color?: string;
    'font-family'?: string;
    'font-size'?: string;
    'font-style'?: string;
    'font-weight'?: CSSProperties['fontWeight'];
    'line-height'?: string | number;
    'letter-spacing'?: string;
    height?: string;
    'text-decoration'?: string;
    'text-transform'?: CSSProperties['textTransform'];
    align?: CSSProperties['textAlign'];
    'container-background-color'?: string;
    width?: string;
    padding?: string;
}, {
    content: string;
}>;
export declare const Text: import("../../../typings").IBlock<IText>;
