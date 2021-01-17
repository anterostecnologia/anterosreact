import { useState, useEffect, useCallback } from 'react';
const useError = () => {
    const [error, setError] = useState(null);
    useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);
    const dispatchError = useCallback((err) => {
        setError(err);
    }, []);
    return dispatchError;
};
export default useError;