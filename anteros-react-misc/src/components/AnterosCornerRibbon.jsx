import React from 'react';
import PropTypes from 'prop-types';


class AnterosCornerRibbon extends React.Component {
    render() {
        const {
            children,
            style,
            backgroundColor = '#2c7',
            fontColor = '#f0f0f0',
            position = 'top-right',
            containerStyle: userContainerStyle,
            className,
            ...rest
        } = this.props;

        let positionStyle = {};
        switch (position) {
            case 'top-left':
                positionStyle = {
                    top: 0,
                    left: 0,
                    transform: 'translateY(-100%) rotate(-90deg) translateX(-70.71067811865476%) rotate(45deg)',
                    transformOrigin: 'bottom left',
                    WebkitTransform: 'translateY(-100%) rotate(-90deg) translateX(-70.71067811865476%) rotate(45deg)',
                };
                break;
            case 'top-right':
                positionStyle = {
                    top: 0,
                    right: 0,
                    transform: 'translateY(-100%) rotate(90deg) translateX(70.71067811865476%) rotate(-45deg)',
                    transformOrigin: 'bottom right',
                    WebkitTransform: 'translateY(-100%) rotate(90deg) translateX(70.71067811865476%) rotate(-45deg)',
                };
                break;
            case 'bottom-left':
                positionStyle = {
                    bottom: 0,
                    left: 0,
                    transform: 'translateY(100%) rotate(90deg) translateX(-70.71067811865476%) rotate(-45deg)',
                    transformOrigin: 'top left',
                    WebkitTransform: 'translateY(100%) rotate(90deg) translateX(-70.71067811865476%) rotate(-45deg)',
                };
                break;
            case 'bottom-right':
                positionStyle = {
                    right: 0,
                    bottom: 0,
                    transform: 'translateY(100%) rotate(-90deg) translateX(70.71067811865476%) rotate(45deg)',
                    transformOrigin: 'top right',
                    WebkitTransform: 'translateY(100%) rotate(-90deg) translateX(70.71067811865476%) rotate(45deg)',
                };
                break;
            default:
                break;
        }

        const computedStyle = {
            position: 'absolute',
            padding: '0.1em 2em',
            zIndex: 99,
            textAlign: 'center',
            letterSpacing: '2px',
            fontSize: '14px',
            pointerEvents: 'auto',
            boxShadow: '0 0 3px rgba(0,0,0,.3)',
            ...backgroundColor && { backgroundColor },
            ...fontColor && { color: fontColor },
            ...positionStyle,
            ...style,
        };

        const containerStyle = {
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            pointerEvents: 'none',
            ...userContainerStyle,
        };

        return (
            <div style={containerStyle} className={className} {...rest}>
                <div style={computedStyle}>
                    {children}
                </div>
            </div>
        );
    }
}

AnterosCornerRibbon.propTypes = {
    position: PropTypes.string,
    fontColor: PropTypes.string,
    backgroundColor: PropTypes.string,
}

AnterosCornerRibbon.defaultProps = {
    backgroundColor: '#2c7',
    fontColor: '#f0f0f0',
    position: 'top-right',
}

export default AnterosCornerRibbon;