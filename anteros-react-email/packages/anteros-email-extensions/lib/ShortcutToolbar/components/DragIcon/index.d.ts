import { IBlockData } from '@anterostecnologia/anteros-email-core';
import { RecursivePartial } from '@anterostecnologia/anteros-email-core';
export interface DragIconProps<T extends IBlockData> {
    type: string;
    payload?: RecursivePartial<T>;
    color: string;
}
export declare function DragIcon<T extends IBlockData = any>(props: DragIconProps<T>): JSX.Element;
