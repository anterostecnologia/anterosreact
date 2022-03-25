import { BasicType } from '@anterostecnologia/anteros-email-core';
import { TextBlockItem } from './TextBlockItem';
import { ImageBlockItem } from './ImageBlockItem';
export declare const defaultCategories: {
    title: string;
    name: string;
    blocks: ({
        type: BasicType;
        title: string;
        description: string;
        component: typeof TextBlockItem;
    } | {
        type: BasicType;
        title: string;
        description: JSX.Element;
        component: typeof ImageBlockItem;
    })[];
}[];
