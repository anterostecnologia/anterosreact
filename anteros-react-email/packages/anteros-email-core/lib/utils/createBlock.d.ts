import { IBlock, IBlockData } from '../typings';
interface CreateBlockOption<T extends IBlockData> extends Omit<IBlock<T>, 'transform'> {
}
export declare function createBlock<T extends IBlockData>(block: CreateBlockOption<T>): IBlock<T>;
export {};
