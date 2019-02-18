import React, { PureComponent } from 'react';
import AnterosContentLoader from './AnterosContentLoader';


export default class AnterosTitlebarLoader extends PureComponent {
    render(){
        return (<div className="mb-30">
        <AnterosContentLoader
            speed={1}
            width={1760}
            height={75}
            primaryColor="rgba(0,0,0,0.05)"
            secondaryColor="rgba(0,0,0,0.04)"
        >
            <rect x="0" y="30" rx="0" ry="0" width="160" height="60" />
            <rect x="1540" y="30" rx="0" ry="0" width="220" height="60" />
        </AnterosContentLoader>
    </div>);
    }
}


