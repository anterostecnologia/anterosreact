import { useEffect, useState } from 'react';
import { off, on } from './util';
const noop = () => { };
const usePermission = (permissionDesc) => {
    let mounted = true;
    let permissionStatus = null;
    const [state, setState] = useState('');
    const onChange = () => {
        if (mounted && permissionStatus) {
            setState(permissionStatus.state);
        }
    };
    const changeState = () => {
        onChange();
        on(permissionStatus, 'change', onChange);
    };
    useEffect(() => {
        navigator.permissions
            .query(permissionDesc)
            .then((status) => {
            permissionStatus = status;
            changeState();
        })
            .catch(noop);
        return () => {
            mounted = false;
            permissionStatus && off(permissionStatus, 'change', onChange);
        };
    }, []);
    return state;
};
export default usePermission;
