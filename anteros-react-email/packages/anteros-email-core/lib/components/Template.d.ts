import { IBlockData, RecursivePartial } from '../typings';
import React from 'react';
import { ITemplate } from '../blocks';
export declare type TemplateProps = RecursivePartial<ITemplate['data']> & RecursivePartial<ITemplate['attributes']> & {
    children: string | React.ReactElement | React.ReactElement[] | IBlockData | IBlockData[];
    idx?: string | null;
};
export declare function Template(props: TemplateProps): JSX.Element;
