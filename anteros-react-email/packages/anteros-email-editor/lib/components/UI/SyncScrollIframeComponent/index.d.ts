import React from 'react';
interface Props extends React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> {
    children: React.ReactNode;
    title?: string;
    windowRef?: (e: Window) => void;
}
export declare const SyncScrollIframeComponent: ({ children, title, windowRef, ...props }: Props) => JSX.Element;
export {};
