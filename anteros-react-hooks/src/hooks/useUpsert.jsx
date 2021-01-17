import useList from './useList';
/**
 * @deprecated Use `useList` hook's upsert action instead
 */
export default function useUpsert(predicate, initialList = []) {
    const [list, listActions] = useList(initialList);
    return [
        list,
        Object.assign(Object.assign({}, listActions), { upsert: (newItem) => {
                listActions.upsert(predicate, newItem);
            } }),
    ];
}