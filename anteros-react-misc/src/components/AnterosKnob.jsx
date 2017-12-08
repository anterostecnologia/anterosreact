import React, { Component } from 'react';
import 'script-loader!jquery-knob/dist/jquery.knob.min.js';
import lodash from 'lodash';



export default class AnterosKnob extends Component {
    constructor(props) {
        super(props);
        this.state = { value: props.value };
        this.onChangeValue = this.onChangeValue.bind(this);
        this.onChange = this.onChange.bind(this);
        this.idKnob = lodash.uniqueId('knob');
    }

    componentDidMount() {
        let _this = this;
        $(this.input).knob({
            'change': _this.onChangeValue,
        });
    }

    onChangeValue(value) {
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value);
        }
    }
    onChange(event) {
        let value = event.target.value;
        this.setState({value});
        this.onChangeValue(value);
    }

    componentWillReceiveProps(nextProps) {
        this.state = { value: nextProps.value };
    }

    render() {
        return (<input className="knob" id={this.props.id ? this.props.id : this.idKnob}
            ref={ref => this.input = ref} value={this.state.value}
            data-height={this.props.height.replace('px', '').replace('PX', '')}
            data-width={this.props.width.replace('px', '').replace('PX', '')}
            data-thickness={this.props.thickness}
            data-min={this.props.minValue}
            data-max={this.props.maxValue}
            data-displayInput={this.props.showInput}
            data-step={this.props.stepValue}
            data-angleOffset={this.props.angleOffset}
            data-angleArc={this.props.angleArc}
            data-displayPrevious={this.props.showPrevious}
            data-fgColor={this.props.color}
            data-skin="tron"
            data-readOnly={this.props.readOnly}
            data-bgColor={this.props.backgroundColor}
            data-inputColor={this.props.inputColor}
            data-roration={this.props.rotationType}
            data-linecap={(this.props.lineRound ? 'round' : null)}
            onChange={this.onChange}
        />);
    }
}



AnterosKnob.propTypes = {
    id: React.PropTypes.string,
    height: React.PropTypes.string.isRequired,
    width: React.PropTypes.string.isRequired,
    showCursor: React.PropTypes.bool.isRequired,
    thickness: React.PropTypes.number,
    showInput: React.PropTypes.bool.isRequired,
    showPrevious: React.PropTypes.bool.isRequired,
    minValue: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    stepValue: React.PropTypes.number.isRequired,
    angleOffset: React.PropTypes.number,
    lineRound: React.PropTypes.bool.isRequired,
    angleArc: React.PropTypes.number,
    rotationType: React.PropTypes.oneOf(['anticlockwise', 'clockwise']),
    value: React.PropTypes.number.isRequired,
    color: React.PropTypes.string,
    backgroundColor: React.PropTypes.string,
    inputColor: React.PropTypes.string,
    fontFamily: React.PropTypes.string,
    fontWeight: React.PropTypes.string,
    onChangeValue: React.PropTypes.func,
    readOnly : React.PropTypes.bool
}

AnterosKnob.defaultProps = {
    height: '200',
    width: '200',
    showCursor: true,
    showInput: true,
    showPrevious: true,
    minValue: 0,
    maxValue: 100,
    lineRound: false,
    rorationType: 'clockwise',
    value: 0,
    stepValue: 1,
    readOnly: true
}


