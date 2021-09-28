import React, { Component } from 'react';
import nouislider from 'nouislider/dist/nouislider.min.js';
import lodash from "lodash";
import PropTypes from 'prop-types';

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
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    color: PropTypes.string,
    primary : PropTypes.bool,
    secondary : PropTypes.bool,
    success : PropTypes.bool,
    danger : PropTypes.bool,
    warning : PropTypes.bool,
    info : PropTypes.bool,
    // http://refreshless.com/nouislider/slider-options/#section-animate
    animate: PropTypes.bool,
    // http://refreshless.com/nouislider/behaviour-option/
    behaviour: PropTypes.string,
    // http://refreshless.com/nouislider/slider-options/#section-Connect
    connect: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.bool),
        PropTypes.bool
    ]),
    // http://refreshless.com/nouislider/slider-options/#section-cssPrefix
    cssPrefix: PropTypes.string,
    // http://refreshless.com/nouislider/slider-options/#section-orientation
    direction: PropTypes.oneOf(['ltr', 'rtl']),
    // http://refreshless.com/nouislider/more/#section-disable
    disabled: PropTypes.bool,
    // http://refreshless.com/nouislider/slider-options/#section-limit
    limit: PropTypes.number,
    // http://refreshless.com/nouislider/slider-options/#section-margin
    margin: PropTypes.number,
    // http://refreshless.com/nouislider/events-callbacks/#section-change
    onChange: PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/
    onEnd: PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/#section-set
    onSet: PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/#section-slide
    onSlide: PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/
    onStart: PropTypes.func,
    // http://refreshless.com/nouislider/events-callbacks/#section-update
    onUpdate: PropTypes.func,
    // http://refreshless.com/nouislider/slider-options/#section-orientation
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    // http://refreshless.com/nouislider/pips/
    pips: PropTypes.object,
    // http://refreshless.com/nouislider/slider-values/#section-range
    range: PropTypes.object.isRequired,
    // http://refreshless.com/nouislider/slider-options/#section-start
    start: PropTypes.arrayOf(PropTypes.number).isRequired,
    // http://refreshless.com/nouislider/slider-options/#section-step
    step: PropTypes.number,
    // http://refreshless.com/nouislider/slider-options/#section-tooltips
    tooltips: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.arrayOf(
            PropTypes.shape({
                to: PropTypes.func
            })
        )
    ])
};

