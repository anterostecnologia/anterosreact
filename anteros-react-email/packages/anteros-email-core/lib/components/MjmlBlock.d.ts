import { IBlockData, RecursivePartial } from '../typings';
export declare type MjmlBlockChild = JSX.Element | IBlockData | string | null | false;
export interface MjmlBlockProps<T extends IBlockData> {
    type: T['type'];
    value?: RecursivePartial<T['data']['value']>;
    attributes?: RecursivePartial<T['attributes']>;
    children?: MjmlBlockChild | Array<MjmlBlockChild>;
}
export default function MjmlBlock<T extends IBlockData>({ value, type, attributes, children, }: MjmlBlockProps<T>): JSX.Element;
