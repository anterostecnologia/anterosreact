import { BasicType } from '../../constants';
import { IBlock, IBlockData } from '../../typings';
import { IPage } from '../standard';
export declare function generateAdvancedBlock<T extends AdvancedBlock>(option: {
    type: string;
    baseType: BasicType;
    getContent: (params: {
        index: number;
        data: T;
        idx: string | null;
        mode: 'testing' | 'production';
        context?: IPage;
        dataSource?: {
            [key: string]: any;
        };
    }) => ReturnType<NonNullable<IBlock['render']>>;
    validParentType: string[];
}): IBlock<T>;
export interface AdvancedBlock extends IBlockData {
    data: {
        value: {
            condition?: ICondition;
            iteration?: {
                enabled: boolean;
                dataSource: string;
                itemName: string;
                limit: number;
                mockQuantity: number;
            };
        };
    };
}
export interface ICondition {
    groups: Array<IConditionGroup>;
    symbol: OperatorSymbol;
    enabled: boolean;
}
export interface IConditionGroup {
    symbol: OperatorSymbol;
    groups: Array<IConditionGroupItem>;
}
export interface IConditionGroupItem {
    left: string;
    operator: Operator;
    right: string | number;
}
export declare enum Operator {
    TRUTHY = "truthy",
    FALSY = "falsy",
    EQUAL = "==",
    NOT_EQUAL = "!=",
    GREATER = ">",
    GREATER_OR_EQUAL = ">=",
    LESS = "<",
    LESS_OR_EQUAL = "<="
}
export declare enum OperatorSymbol {
    AND = "and",
    OR = "or"
}
