import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Joyride from 'react-joyride';

export class AnterosTour extends Component {

  constructor(props) {
    super(props);
    this.state = {
      steps: [],
      step: 0,
    };
    this.handleNextButtonClick = this.onNextButtonClick.bind(this);
    this.handleJoyrideCallback = this.onJoyrideCallback.bind(this);
  }

 
  componentDidMount() {
    this.setState({ step: 0 });    
  }

  onNextButtonClick() {
    if (this.state.step === 1) {
      this.joyride.next();
    }
  }

  onJoyrideCallback(result) {
    const { joyride } = this.props;

    if (result.type === 'step:before') {
      this.setState({ step: result.index });
    }
    if (result.type === 'finished' && this.props.startUserTour) {
      this.props.stopUserTour();
    }
    if (result.type === 'error:target_not_found') {
      this.setState({
        step: result.action === 'back' ? result.index - 1 : result.index + 1,
        autoStart: result.action !== 'close' && result.action !== 'esc',
      });
    }
    if (typeof joyride.callback === 'function') {
      joyride.callback();
    }
  }

  buildSteps(steps){
      let newSteps = [];  
      if (steps) {
        steps.forEach(function (step) {
            newSteps.push(step);
        });
      }
      if (this.props.children) {
        let _this = this;
        let arrChildren = React.Children.toArray(this.props.children);
        arrChildren.forEach(function (child) {
            if (child.type && child.type.name == "AnterosTourStep") {
                let step = {
                    content : child.content,
                    disableBeacon : child.content || false,
                    event : child.onClick,
                    isFixed : child.isFixed || false,
                    offset : child.offset || 10,
                    placement : child.placement || 'bottom',
                    placementBeacon : child.placementBeacon,
                    target : child.target,
                    title : child.title
                }

                newSteps.push(step);
            }
        });
    }
  }

  render() {
    let { resizeDebounce, run, stepIndex, steps, startUserTour, type } = this.props;

    steps = this.buildSteps(steps);

    const newProps = {
      autoStart: true,
      callback: this.onJoyrideCallback,
      debug: false,
      disableOverlay: this.state.step === 1,
      resizeDebounce: resizeDebounce,
      run: run || startUserTour,
      scrollToFirstStep: joyride.scrollToFirstStep || true,
      stepIndex: stepIndex || this.state.step,
      steps: steps || this.state.steps,
      type: type || 'continuous',
      showSkipButton: true,
      scrollToSteps: true
    };
    return (
      <Joyride
        {...newProps}
        ref={c => (this.joyride = c)} />
    )
  }
}

AnterosTour.propTypes = {
   ...Joyride.propTypes,
   autoStart: PropTypes.bool
}

AnterosTour.defaultProps = {
    ...Joyride.defaultProps,
    autoStart: false,
    resizeDebounce: false,
    run: false
}

export class AnterosTourStep extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return null;
    }
}