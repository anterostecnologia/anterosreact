import React, { Component } from 'react';

function uid(){
  return Math.random()
    .toString(36)
    .substring(2);
}


const Wrap = (props) => {
  const idClip = props.uniquekey ? `${props.uniquekey}-idClip` : uid()
  const idGradient = props.uniquekey ? `${props.uniquekey}-idGradient` : uid()

  return (
    <svg
      viewBox={`0 0 ${props.width} ${props.height}`}
      version="1.1"
      style={props.style}
      preserveAspectRatio={props.preserveAspectRatio}
      className={props.className}
    >
      <rect
        style={{ fill: `url(#${idGradient})` }}
        clipPath={`url(#${idClip})`}
        x="0"
        y="0"
        width={props.width}
        height={props.height}
      />

      <defs>
        <clipPath id={idClip}>{props.children}</clipPath>

        <linearGradient id={idGradient}>
          <stop offset="0%" stopColor={props.primaryColor} stopOpacity={props.primaryOpacity}>
            {props.animate ? (
              <animate
                attributeName="offset"
                values="-2; 1"
                dur={`${props.speed}s`}
                repeatCount="indefinite"
              />
            ) : null}
          </stop>
          <stop offset="50%" stopColor={props.secondaryColor} stopOpacity={props.secondaryOpacity}>
            {props.animate ? (
              <animate
                attributeName="offset"
                values="-1.5; 1.5"
                dur={`${props.speed}s`}
                repeatCount="indefinite"
              />
            ) : null}
          </stop>
          <stop offset="100%" stopColor={props.primaryColor} stopOpacity={props.primaryOpacity}>
            {props.animate ? (
              <animate
                attributeName="offset"
                values="-1; 2"
                dur={`${props.speed}s`}
                repeatCount="indefinite"
              />
            ) : null}
          </stop>
        </linearGradient>
      </defs>
    </svg>
  )
}



const defaultProps = {
  animate: true,
  speed: 2,
  width: 400,
  height: 130,
  preserveAspectRatio: 'xMidYMid meet',
  primaryColor: '#f0f0f0',
  secondaryColor: '#e0e0e0',
  primaryOpacity: 1,
  secondaryOpacity: 1,
}

const InitialComponent = props => (
  <rect x="0" y="0" rx="5" ry="5" width={props.width} height={props.height} />
)

const AnterosContentLoader = (props) => {
  const mergedProps = { ...defaultProps, ...props }
  const children = props.children ? props.children : <InitialComponent {...mergedProps} />

  return <Wrap {...mergedProps}>{children}</Wrap>
}




const ListStyle = (props) => (
    <AnterosContentLoader {...props}>
      <rect x="0" y="0" rx="3" ry="3" width="250" height="10" />
      <rect x="20" y="20" rx="3" ry="3" width="220" height="10" />
      <rect x="20" y="40" rx="3" ry="3" width="170" height="10" />
      <rect x="0" y="60" rx="3" ry="3" width="250" height="10" />
      <rect x="20" y="80" rx="3" ry="3" width="200" height="10" />
      <rect x="20" y="100" rx="3" ry="3" width="80" height="10" />
    </AnterosContentLoader>
  )

const CodeStyle = (props)  => (
    <AnterosContentLoader {...props}>
      <rect x="0" y="0" rx="3" ry="3" width="70" height="10" />
      <rect x="80" y="0" rx="3" ry="3" width="100" height="10" />
      <rect x="190" y="0" rx="3" ry="3" width="10" height="10" />
  
      <rect x="15" y="20" rx="3" ry="3" width="130" height="10" />
      <rect x="155" y="20" rx="3" ry="3" width="130" height="10" />
  
      <rect x="15" y="40" rx="3" ry="3" width="90" height="10" />
      <rect x="115" y="40" rx="3" ry="3" width="60" height="10" />
      <rect x="185" y="40" rx="3" ry="3" width="60" height="10" />
  
      <rect x="0" y="60" rx="3" ry="3" width="30" height="10" />
    </AnterosContentLoader>
  )

const FacebookStyle = (props) => (
    <AnterosContentLoader {...props}>
      <rect x="70" y="15" rx="4" ry="4" width="117" height="6.4" />
      <rect x="70" y="35" rx="3" ry="3" width="85" height="6.4" />
      <rect x="0" y="80" rx="3" ry="3" width="350" height="6.4" />
      <rect x="0" y="100" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="120" rx="3" ry="3" width="201" height="6.4" />
      <circle cx="30" cy="30" r="30" />
    </AnterosContentLoader>
  )

const InstagramStyle = (props) => (
    <AnterosContentLoader {...props} height={480}>
      <circle cx="30" cy="30" r="30" />
  
      <rect x="75" y="13" rx="4" ry="4" width="100" height="13" />
      <rect x="75" y="37" rx="4" ry="4" width="50" height="8" />
      <rect x="0" y="70" rx="5" ry="5" width="400" height="400" />
    </AnterosContentLoader>
  )


const BulletListStyle = (props) => (
    <AnterosContentLoader {...props}>
      <circle cx="10" cy="20" r="8" />
      <rect x="25" y="15" rx="5" ry="5" width="220" height="10" />
      <circle cx="10" cy="50" r="8" />
      <rect x="25" y="45" rx="5" ry="5" width="220" height="10" />
      <circle cx="10" cy="80" r="8" />
      <rect x="25" y="75" rx="5" ry="5" width="220" height="10" />
      <circle cx="10" cy="110" r="8" />
      <rect x="25" y="105" rx="5" ry="5" width="220" height="10" />
    </AnterosContentLoader>
  )

AnterosContentLoader.BulletListStyle = BulletListStyle;
AnterosContentLoader.CodeStyle = CodeStyle;
AnterosContentLoader.FacebookStyle = FacebookStyle;
AnterosContentLoader.InstagramStyle = InstagramStyle;
AnterosContentLoader.ListStyle = ListStyle;

export default AnterosContentLoader