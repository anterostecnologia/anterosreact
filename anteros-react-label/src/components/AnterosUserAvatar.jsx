import React, { Component, Fragment } from 'react';
const addPx = require('add-px');
const contrast = require('contrast');



// from https://flatuicolors.com/
const defaultColors = [
    '#2ecc71', 
    '#3498db', 
    '#8e44ad', 
    '#e67e22', 
    '#e74c3c', 
    '#1abc9c', 
    '#2c3e50', 
    '#5E005E',
    '#AB2F52',
    '#E55D4A',
    '#E88554',
    '#4194A6',
    '#82CCD9',
    '#FFCC6B',
    '#F2855C',
    '#7D323B'
];

function sumChars(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
    }

    return sum;
}

function defaultInitials(name, { maxInitials }) {
    return name.split(/\s/)
        .map(part => part.substring(0, 1).toUpperCase())
        .filter(v => !!v)
        .slice(0, maxInitials)
        .join('');
}

export default class AnterosUserAvatar extends React.Component {
    render() {
        let {
            borderRadius = '100%',
            src,
            srcset,
            name,
            color,
            colors = defaultColors,
            size,
            style,
            onClick,
            fontSize,
            maxInitials,
            className
        } = this.props;

        if (!name) throw new Error('UserAvatar requires a name');

        const abbr = defaultInitials(name, { maxInitials });
        size = addPx(size);

        const imageStyle = {
            display: 'block',
            borderRadius
        };

        const innerStyle = {
            lineHeight: size,
            textAlign: 'center',
            borderRadius,
            fontSize
        };

        if (size) {
            imageStyle.width = innerStyle.width = innerStyle.maxWidth = size;
            imageStyle.height = innerStyle.height = innerStyle.maxHeight = size;
        }

        let inner, classes = [className, 'UserAvatar'];
        if (src || srcset) {
            inner = <img className="UserAvatar--img" style={imageStyle} src={src} srcSet={srcset} alt={name} />
        } else {
            let background;
            if (color) {
                background = color;
            } else {
                let i = sumChars(name) % colors.length;
                background = colors[i];
            }

            innerStyle.backgroundColor = background;

            inner = abbr;
        }

        if (innerStyle.backgroundColor) {
            classes.push(`UserAvatar--${contrast(innerStyle.backgroundColor)}`);
        }

        return (
            <div aria-label={name} className={classes.join(' ')} style={style}>
                <div className="UserAvatar--inner" style={innerStyle}>
                    {inner}
                </div>
            </div>
        )
    }
}

AnterosUserAvatar.defaultProps = {
    maxInitials: 2
}

