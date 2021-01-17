import React from 'react';
const createRouter = () => {
    const context = React.createContext({
        route: '',
    });
    const Router = (props) => {
        const { route, fullRoute, parent, children } = props;
        if (process.env.NODE_ENV !== 'production') {
            if (typeof route !== 'string') {
                throw new TypeError('Router route must be a string.');
            }
        }
        return React.createElement(context.Provider, {
            value: {
                fullRoute: fullRoute || route,
                route,
                parent,
            },
            children,
        });
    };
};
export default createRouter;