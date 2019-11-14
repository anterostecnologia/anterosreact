import React, { createRef, Component } from "react"

export default class AnterosIframe extends Component {
    render(){
        return (
            <iframe {...this.props}/>
        )
    }
}

AnterosIframe.defaultProps = {
    ref: createRef(),
    target: "_parent",
    allowFullScreen: false,
    style: {
        position: "absolute",
        display: "block",
        height: "100%",
        width: "100%",
        overflow: "hidden"
    },
    scrolling: "no",
    frameBorder: 0,
    height: "100%",
    sandbox: null,
    loading: null,
    styles: null,
    name: null,
    className: null,
    title: null,
    allow: null,
    id: null,
    "aria-labelledby": null,
    "aria-hidden": null,
    "aria-label":  null,
    width: "100%",
    onLoad: null,
    onMouseOver: null,
    onMouseOut: null
}


/*

Properties

url (required) - string the iframe url.

all other attributes are optional

src - string if set, overrides url.

scrolling - string not set if if not provided (deprecated in HTML5).

overflow - string default to "hidden".

loading - string (not added to DOM if not provided).

frameBorder - number default to "0" (deprecated in HTML5).

position - string (not added to DOM if not provided).

id - string if set, adds the id parameter with the given value.

className - string if set, adds the class parameter with the given value.

display - string defaults to "block"

height - string (1px > any number above 0, or 1% to 100%)

width - string (1px > any number above 0, or 1% to 100%)

allowFullScreen - if set, applies the allowFullScreen param (deprecated in HTML5). If set, adds allow="fullscreen".

sandbox - add optional sandbox values ("allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation")

allow - add optional allow values ("geolocation microphone camera midi encrypted-media & more")

styles - add any additional styles here. Will (intentionally) override any of the props above. For instance:

*/