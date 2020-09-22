import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {boundClass} from "@anterostecnologia/anteros-react-core";

@boundClass
class AnterosAudioSpectrum extends Component {
    constructor(props) {
        super(props)

        this.animationId = null
        this.audioContext = null
        this.audioEle = null
        this.audioCanvas = null
        this.playStatus = null
        this.canvasId = this.props.id || this.getRandomId(50)
        this.mediaEleSource = null
        this.analyser = null
    }
    getRandomId(len) {
        let str = '1234567890-qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
        let strLen = str.length
        let res = ''
        for (let i = 0; i < len; i++) {
            let randomIndex = Math.floor((Math.random() * strLen))
            res += str[randomIndex]
        }
        return res
    }
    componentDidMount() {
        this.prepareElements()
        this.initAudioEvents()
    }
    initAudioEvents() {
        let audioEle = this.audioEle
        if (audioEle) {
            audioEle.onpause = (e) => {
                this.playStatus = 'PAUSED'
            }
            audioEle.onplay = (e) => {
                this.playStatus = 'PLAYING'
                this.prepareAPIs()
                let analyser = this.setupAudioNode(this.audioEle)
                this.drawSpectrum(analyser)
            }
        } else if (this.props.analyser){
            this.drawSpectrum(this.props.analyser);
        }
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.analyser){
            this.drawSpectrum(nextProps.analyser);
        }
    }
    
    drawSpectrum(analyser) {
        let cwidth = this.audioCanvas.width
        let cheight = this.audioCanvas.height - this.props.capHeight
        let capYPositionArray = [] 
        let ctx = this.audioCanvas.getContext('2d')
        let gradient = ctx.createLinearGradient(0, 0, 0, 300)

        if (this.props.meterColor.constructor === Array) {
            let stops = this.props.meterColor
            let len = stops.length
            for (let i = 0; i < len; i++) {
                gradient.addColorStop(stops[i]['stop'], stops[i]['color'])
            }
            } else if (typeof this.props.meterColor === 'string') {
                gradient = this.props.meterColor
            }

            let drawMeter = () => {
            let array = new Uint8Array(analyser.frequencyBinCount); 
            analyser.getByteFrequencyData(array);
            if (this.playStatus === 'PAUSED') {
                for (let i = array.length - 1; i >= 0; i--) {
                    array[i] = 0
                }
                let allCapsReachBottom = !capYPositionArray.some(cap => cap > 0)
                if (allCapsReachBottom) {
                    ctx.clearRect(0, 0, cwidth, cheight + this.props.capHeight)
                    cancelAnimationFrame(this.animationId) 
                    return
                }
            }
            let step = Math.round(array.length / this.props.meterCount) 
            ctx.clearRect(0, 0, cwidth, cheight + this.props.capHeight)
            for (let i = 0; i < this.props.meterCount; i++) {
                let value = array[i * step]
                if (capYPositionArray.length < Math.round(this.props.meterCount)) {
                    capYPositionArray.push(value)
                };
                ctx.fillStyle = this.props.capColor
                if (value < capYPositionArray[i]) {
                    let preValue = --capYPositionArray[i]
                    let y = (270 - preValue) * cheight / 270
                    ctx.fillRect(i * (this.props.meterWidth + this.props.gap), y, this.props.meterWidth, this.props.capHeight)
                } else {
                    let y = (270 - value) * cheight / 270
                    ctx.fillRect(i * (this.props.meterWidth + this.props.gap), y, this.props.meterWidth, this.props.capHeight)
                    capYPositionArray[i] = value
                };
                ctx.fillStyle = gradient; 
                let y = (270 - value) * (cheight) / 270 + this.props.capHeight
                ctx.fillRect(i * (this.props.meterWidth + this.props.gap), y, this.props.meterWidth, cheight) // the meter
            }
            this.animationId = requestAnimationFrame(drawMeter)
        }
        this.animationId = requestAnimationFrame(drawMeter)
    }
    setupAudioNode(audioEle) {
        if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser()
            this.analyser.smoothingTimeConstant = 0.8
            this.analyser.fftSize = 2048
        }
        
        if (!this.mediaEleSource) {
            this.mediaEleSource = this.audioContext.createMediaElementSource(audioEle)
            this.mediaEleSource.connect(this.analyser)
            this.mediaEleSource.connect(this.audioContext.destination);
        }

        return this.analyser
    }
    prepareElements() {
        let { audioId, audioEle, analyser } = this.props;
        this.audioCanvas = document.getElementById(this.canvasId);
        if (!audioId && !audioEle & !analyser) {
            console.log('target audio not found!');
            return
        } else if (audioId) {
            this.audioEle = document.getElementById(audioId);
        } else {
            this.audioEle = audioEle
        }
        
        
    }
    prepareAPIs = () => {
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            this.audioContext = new window.AudioContext(); 
        } catch (e) {
            console.log(e);
        }
    }
    render() {
        return (
            <canvas id={this.canvasId} style={{border:"1px dashed silver"}} width={this.props.width} height={this.props.height}></canvas>
        )
    }
}

AnterosAudioSpectrum.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.number,
    height: PropTypes.number,
    audioId: PropTypes.string,
    audioEle: PropTypes.object,
    capColor: PropTypes.string,
    capHeight: PropTypes.number,
    meterWidth: PropTypes.number,
    meterCount: PropTypes.number,
    meterColor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.shape({
            stop: PropTypes.number,
            color: PropTypes.string,
        })),
    ]),
    gap: PropTypes.number,
}
AnterosAudioSpectrum.defaultProps = {
    width: 300,
    height: 200,
    capColor: '#FFF',
    capHeight: 2,
    meterWidth: 2,
    meterCount: 40 * (2 + 2),
    meterColor: [
        {stop: 0, color: '#f00'},
        {stop: 0.5, color: '#0CD7FD'},
        {stop: 1, color: 'red'}
    ],
    gap: 10, 
}
export default AnterosAudioSpectrum