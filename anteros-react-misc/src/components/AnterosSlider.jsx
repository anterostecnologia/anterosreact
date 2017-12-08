import React, { Component } from 'react';
import nouislider from 'nouislider/distribute/nouislider.min.js';
import 'nouislider/distribute/nouislider.css';
import lodash from "lodash";

export default class AnterosSlider extends React.Component {
    constructor(props) {
        super(props);
        this.idSlider = lodash.uniqueId("slider");
    }
    componentDidMount() {
        if (this.props.disabled) this.sliderContainer.setAttribute('disabled', true);
        else this.sliderContainer.removeAttribute('disabled');
        this.createSlider();
    }

    componentDidUpdate() {
        if (this.props.disabled) this.sliderContainer.setAttribute('disabled', true);
        else this.sliderContainer.removeAttribute('disabled');
        this.slider.destroy();
        this.createSlider();
    }

    componentWillUnmount() {
        this.slider.destroy();
    }

    createSlider() {
        var slider = this.slider = nouislider.create(this.sliderContainer, { ...this.props });

        if (this.props.onUpdate) {
            slider.on('update', this.props.onUpdate);
        }

        if (this.props.onChange) {
            slider.on('change', this.props.onChange);
        }

        if (this.props.onSlide) {
            slider.on('slide', this.props.onSlide);
        }

        if (this.props.onStart) {
            slider.on('start', this.props.onStart);
        }

        if (this.props.onEnd) {
            slider.on('end', this.props.onEnd);
        }

        if (this.props.onSet) {
            slider.on('set', this.props.onSet);
        }
    }

    render() {
        if (this.props.id) {
            this.idSlider = this.props.id;
        }
        let style;

        if (this.props.backgroundColor) {
            style = { backgroundColor: this.props.backgroundColor };
        }
        let className = "anteros-slider";
        if (this.props.primary){
           className += " bg-primary";
        } else if (this.props.secondary){
           className += " bg-secondary";
        } else if (this.props.success){
           className += " bg-success";
        } else if (this.props.danger){
           className += " bg-danger";
        } else if (this.props.warning){
           className += " bg-warning";
        } else if (this.props.info){
           className += " bg-info";
        }

        if (this.props.borderColor) {
            if (style) {
                style = { ...style, borderColor: this.props.borderColor };
            } else {
                style = { borderColor: this.props.borderColor };
            }
        }

        if (this.props.color) {
            if (style) {
                style = { ...style, color: this.props.color };
            } else {
                style = { color: this.props.color };
            }
        }
        return <div className={className} id={this.idSlider} ref={slider => { this.sliderContainer = slider; }} style={{...style}}/>;
    }
}

AnterosSlider.propTypes = {
    backgroundColor: React.PropTypes.string,
    borderColor: React.PropTypes.string,
    color: React.PropTypes.string,
    primary : React.PropTypes.bool,
    secondary : React.PropTypes.bool,
    success : React.PropTypes.bool,
    danger : React.PropTypes.bool,
    warning : React.PropTypes.bool,
    info : React.PropTypes.bool,
    // http://refreshless.com/nouislider/slider-options/#section-animate
    animate: React.PropTypes.bool,
    // http://refreshless.com/nouislider/behaviour-option/
    behaviour: React.PropTypes.string,
    // http://refreshless.com/nouislider/slider-options/#section-Connect
    connect: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.bool),
        React.PropTypes.bool
    ]),
    // http://refreshless.com/nouislider/slider-options/#section-cssPrefix
    cssPrefix: React.PropTypes.string,
    // http://refreshless.com/nouislider/slider-options/#section-orientation
    direction: React.PropTypes.oneOf(['ltr', 'rtl']),
    // http://refreshless.com/nouislider/more/#section-disable
    disabled: React.PropTypes.bool,
    // http://refreshless.com/nouislider/slider-options/#section-limit
    limit: React.PropTypes.number,
    // http://refreshless.com/nouislider/slider-options/#section-margin
    margin: React.PropTypes.number,
    // http://refreshless.com/nouislider/events-callbacks/#section-change
    onChange: React.PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/
    onEnd: React.PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/#section-set
    onSet: React.PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/#section-slide
    onSlide: React.PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/
    onStart: React.PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/#section-update
    onUpdate: React.PropTypes.func,
    // http://refreshless.com/nouislider/slider-options/#section-orientation
    orientation: React.PropTypes.oneOf(['horizontal', 'vertical']),
    // http://refreshless.com/nouislider/pips/
    pips: React.PropTypes.object,
    // http://refreshless.com/nouislider/slider-values/#section-range
    range: React.PropTypes.object.isRequired,
    // http://refreshless.com/nouislider/slider-options/#section-start
    start: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    // http://refreshless.com/nouislider/slider-options/#section-step
    step: React.PropTypes.number,
    // http://refreshless.com/nouislider/slider-options/#section-tooltips
    tooltips: React.PropTypes.oneOfType([
        React.PropTypes.bool,
        React.PropTypes.arrayOf(
            React.PropTypes.shape({
                to: React.PropTypes.func
            })
        )
    ])
};

