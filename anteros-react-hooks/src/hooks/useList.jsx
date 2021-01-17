import { useMemo, useRef } from 'react';
import useUpdate from './useUpdate';
import {resolveHookState} from '../util/resolveHookState';
function useList(initialList = []) {
    const list = useRef(resolveHookState(initialList));
    const update = useUpdate();
    const actions = useMemo(() => {
        const a = {
            set: (newList) => {
                list.current = resolveHookState(newList, list.current);
                update();
            },
            push: (...items) => {
                items.length && actions.set((curr) => curr.concat(items));
            },
            updateAt: (index, item) => {
                actions.set((curr) => {
                    const arr = curr.slice();
                    arr[index] = item;
                    return arr;
                });
            },
            insertAt: (index, item) => {
                actions.set((curr) => {
                    const arr = curr.slice();
                    index > arr.length ? (arr[index] = item) : arr.splice(index, 0, item);
                    return arr;
                });
            },
            update: (predicate, newItem) => {
                actions.set((curr) => curr.map((item) => (predicate(item, newItem) ? newItem : item)));
            },
            updateFirst: (predicate, newItem) => {
                const index = list.current.findIndex((item) => predicate(item, newItem));
                index >= 0 && actions.updateAt(index, newItem);
            },
            upsert: (predicate, newItem) => {
                const index = list.current.findIndex((item) => predicate(item, newItem));
                index >= 0 ? actions.updateAt(index, newItem) : actions.push(newItem);
            },
            sort: (compareFn) => {
                actions.set((curr) => curr.slice().sort(compareFn));
            },
            filter: (callbackFn, thisArg) => {
                actions.set((curr) => curr.slice().filter(callbackFn, thisArg));
            },
            removeAt: (index) => {
                actions.set((curr) => {
                    const arr = curr.slice();
                    arr.splice(index, 1);
                    return arr;
                });
            },
            clear: () => {
                actions.set([]);
            },
            reset: () => {
                actions.set(resolveHookState(initialList).slice());
            },
        };
        a.remove = a.removeAt;
        return a;
    }, []);
    return [list.current, actions];
}
export default useList;