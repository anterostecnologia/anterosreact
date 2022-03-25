import { IBlockData } from '../typings';
import { IPage } from '../blocks';
export interface JsonToMjmlOptionProduction {
    idx?: string | null;
    data: IBlockData;
    context?: IBlockData;
    mode: 'production';
    keepClassName?: boolean;
    dataSource?: {
        [key: string]: any;
    };
}
export interface JsonToMjmlOptionDev {
    data: IBlockData;
    idx: string | null;
    context?: IBlockData;
    dataSource?: {
        [key: string]: any;
    };
    mode: 'testing';
}
export declare type JsonToMjmlOption = JsonToMjmlOptionDev | JsonToMjmlOptionProduction;
export declare function JsonToMjml(options: JsonToMjmlOption): string;
export declare function renderPlaceholder(type: string): string;
export declare function generaMjmlMetaData(data: IPage): string;
