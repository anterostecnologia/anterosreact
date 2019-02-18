import React, { PureComponent } from 'react';
import AnterosContentLoader from './AnterosContentLoader';

export default class AnterosHeaderLoader extends PureComponent {
    render(){
        return (<div className="rounded preload-widget mb-30">
            <div className="widget-headings border-bottom">
                <AnterosContentLoader
                    speed={1}
                    width={520}
                    height={61}
                    primaryColor="rgba(0,0,0,0.05)"
                    secondaryColor="rgba(0,0,0,0.04)"
                >
                    <rect x="15" y="18" rx="0" ry="0" width="160" height="35" />
                    <rect x="380" y="18" rx="0" ry="0" width="35" height="35" />
                    <circle cx="441" cy="35" r="20" />
                    <rect x="470" y="18" rx="0" ry="0" width="35" height="35" />
                </AnterosContentLoader>
            </div>
            <div>
                <AnterosContentLoader
                    speed={1}
                    width={520}
                    height={310}
                    primaryColor="rgba(0,0,0,0.05)"
                    secondaryColor="rgba(0,0,0,0.04)"
                >
                    <rect x="15" y="30" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="60" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="90" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="120" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="150" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="180" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="210" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="240" rx="0" ry="0" width="490" height="16" />
                    <rect x="15" y="270" rx="0" ry="0" width="490" height="16" />
                </AnterosContentLoader>
            </div>
            <div className="widget-headings border-top">
                <AnterosContentLoader
                    speed={1}
                    width={520}
                    height={61}
                    primaryColor="rgba(0,0,0,0.05)"
                    secondaryColor="rgba(0,0,0,0.04)"
                >
                    <rect x="15" y="18" rx="0" ry="0" width="160" height="35" />
                    <rect x="320" y="18" rx="0" ry="0" width="189" height="35" />
                </AnterosContentLoader>
            </div>
        </div>);
    }
}



