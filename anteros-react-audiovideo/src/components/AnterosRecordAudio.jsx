import React, { Component } from 'react';
import { AnterosButton } from '@anterostecnologia/anteros-react-buttons';
import { AnterosModal, AnterosDivider } from "anteros-react-containers";
import { AnterosStatistic } from "anteros-react-dashboard";
import { AnterosCol, AnterosRow } from '@anterostecnologia/anteros-react-layout';
import { boundClass, AnterosSweetAlert } from "anteros-react-core";
import AnterosAudioPlayer from './AnterosAudioPlayer';
import { AnterosUtils } from '@anterostecnologia/anteros-react-core';
import { buildGridClassNames, columnProps } from '@anterostecnologia/anteros-react-layout';
import AnterosAudioSpectrum from './AnterosAudioSpectrum';
import PropTypes from 'prop-types';
import {
    AnterosLocalDatasource,
    AnterosRemoteDatasource,
    dataSourceEvents
} from '@anterostecnologia/anteros-react-datasource';


@boundClass
class AnterosRecorder {
    constructor(options = {}) {
        let context = new (window.AudioContext || window.webkitAudioContext)();
        this.isrecording = false;
        this.isplaying = false;
        this.ispause = false;
        this.context = null;
        this.config = options;
        this.size = null;
        this.lBuffer = [];
        this.rBuffer = [];
        this.PCM = null;
        this.tempPCM = [];
        this.audioInput = null;
        this.inputSampleRate = null;
        this.source = null;
        this.recorder = null;
        this.inputSampleBits = 16;
        this.outputSampleRate = null;
        this.oututSampleBits = null;
        this.analyser = null;
        this.littleEdian = false;
        this.prevDomainData = null;
        this.playStamp = 0;
        this.playTime = 0;
        this.totalPlayTime = 0;
        this.offset = 0;
        this.stream = null;

        this.fileSize = 0;
        this.duration = null;

        this.inputSampleRate = context.sampleRate;
        this.config = {
            sampleBits: ~[8, 16].indexOf(options.sampleBits) ? options.sampleBits : 16,
            sampleRate: ~[11025, 16000, 22050, 24000, 44100, 48000].indexOf(options.sampleRate) ? options.sampleRate : this.inputSampleRate,
            numChannels: ~[1, 2].indexOf(options.numChannels) ? options.numChannels : 1,
            compiling: !!options.compiling || false,
        };
        this.outputSampleRate = this.config.sampleRate;
        this.oututSampleBits = this.config.sampleBits;
        this.littleEdian = (function () {
            let buffer = new ArrayBuffer(2);
            new DataView(buffer).setInt16(0, 256, true);
            return new Int16Array(buffer)[0] === 256;
        })();
        this.initUserMedia();
    }

    initRecorder() {
        if (this.context) {
            this.destroy();
        }
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 2048;
        let createScript = this.context.createScriptProcessor || this.context.createJavaScriptNode;
        this.recorder = createScript.apply(this.context, [4096, this.config.numChannels, this.config.numChannels]);
        this.recorder.onaudioprocess = e => {
            if (!this.isrecording || this.ispause) {
                return;
            }
            let lData = e.inputBuffer.getChannelData(0),
                rData = null,
                vol = 0;

            this.lBuffer.push(new Float32Array(lData));
            this.size += lData.length;

            if (2 === this.config.numChannels) {
                rData = e.inputBuffer.getChannelData(1);
                this.rBuffer.push(new Float32Array(rData));
                this.size += rData.length;
            }

            if (this.config.compiling) {
                let pcm = this.transformIntoPCM(lData, rData);
                this.tempPCM.push(pcm);
                this.fileSize = pcm.byteLength * this.tempPCM.length;
            } else {
                this.fileSize = Math.floor(this.size / Math.max(this.inputSampleRate / this.outputSampleRate, 1))
                    * (this.oututSampleBits / 8)
            }
            vol = Math.max.apply(Math, lData) * 100;
            this.duration += 4096 / this.inputSampleRate;
            this.onprocess && this.onprocess(this.duration);
            this.onprogress && this.onprogress({
                duration: this.duration,
                fileSize: this.fileSize,
                vol,
                data: this.tempPCM,
            });
        }
    }

    isRecording() {
        return this.isrecording;
    }

    isPlaying() {
        return this.isplaying;
    }

    isPause() {
        return this.ispause;
    }

    getAnalyser() {
        return this.analyser
    }

    start() {
        if (this.isrecording) {
            return;
        }
        this.clear();
        this.initRecorder();
        this.isrecording = true;

        return navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(stream => {
            this.audioInput = this.context.createMediaStreamSource(stream);
            this.stream = stream;
        }).then(() => {
            this.audioInput.connect(this.analyser);
            this.analyser.connect(this.recorder);
            this.recorder.connect(this.context.destination);
        });
    }

    pause() {
        if (this.isrecording && !this.ispause) {
            this.ispause = true;
            this.recorder.disconnect();
        }
    }

    resume() {
        if (this.isrecording && this.ispause) {
            this.ispause = false;
            this.audioInput && this.audioInput.connect(this.analyser);
            this.analyser.connect(this.recorder);
            this.recorder.connect(this.context.destination);
        }
    }

    stop() {
        this.isrecording = false;
        this.audioInput && this.audioInput.disconnect();
        this.recorder.disconnect();
    }

    play() {
        this.stop();
        this.source && this.source.stop();
        this.isplaying = true;
        this.playTime = 0;
        this.playAudioData();
    }

    getPlayTime() {
        let _now = 0;
        if (this.isplaying) {
            _now = this.context.currentTime - this.playStamp + this.playTime;
        } else {
            _now = this.playTime;
        }

        if (_now >= this.totalPlayTime) {
            _now = this.totalPlayTime;
        }

        return _now;
    }

    pausePlay() {
        if (this.isrecording || !this.isplaying) {
            return;
        }

        this.source && this.source.disconnect();
        this.playTime += this.context.currentTime - this.playStamp;
        this.isplaying = false;
    }

    resumePlay() {
        if (this.isrecording || this.isplaying || 0 === this.playTime) {
            return;
        }

        this.isplaying = true;
        this.playAudioData();
    }

    stopPlay() {
        if (this.isrecording) {
            return;
        }
        this.playTime = 0;
        this.isplaying = false;
        this.source && this.source.stop();
    }

    getWholeData() {
        return this.tempPCM;
    }

    getNextData() {
        let length = this.tempPCM.length,
            data = this.tempPCM.slice(this.offset);
        this.offset = length;
        return data;
    }

    playAudioData() {
        let _this = this;
        this.context.decodeAudioData(this.getWAV().buffer, buffer => {
            _this.source = this.context.createBufferSource();
            _this.source.buffer = buffer;
            _this.totalPlayTime = this.source.buffer.duration;
            _this.source.connect(this.analyser);
            _this.analyser.connect(this.context.destination);
            _this.source.start(0, this.playTime);
            _this.playStamp = this.context.currentTime;
        }, function (e) {
            AnterosRecorder.throwError(e);
        });
    }

    getRecordAnalyseData() {
        if (this.ispause) {
            return this.prevDomainData;
        }
        let dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(dataArray);
        return (this.prevDomainData = dataArray);
    }

    getPlayAnalyseData() {
        return this.getRecordAnalyseData();
    }

    initUserMedia() {
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {
                let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia !'));
                }

                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
    }

    getPCM() {
        if (this.tempPCM.length) {
            let buffer = new ArrayBuffer(this.tempPCM.length * this.tempPCM[0].byteLength),
                pcm = new DataView(buffer),
                offset = 0;
            this.tempPCM.forEach((block) => {
                for (let i = 0, len = block.byteLength; i < len; ++i) {
                    pcm.setInt8(offset, block.getInt8(i));

                    offset++;
                }
            });
            this.PCM = pcm;
            this.tempPCM = [];
        }
        if (this.PCM) {
            return this.PCM;
        }
        let data = this.flat();
        data = AnterosRecorder.compress(data, this.inputSampleRate, this.outputSampleRate);
        return this.PCM = AnterosRecorder.encodePCM(data, this.oututSampleBits, this.littleEdian);
    }

    getPCMBlob() {
        this.stop();
        return new Blob([this.getPCM()]);
    }

    downloadPCM(name = 'recorder') {
        let pcmBlob = this.getPCMBlob();
        this.download(pcmBlob, name, 'pcm');
    }

    getWAV() {
        let pcmTemp = this.getPCM(),
            wavTemp = AnterosRecorder.encodeWAV(pcmTemp, this.inputSampleRate,
                this.outputSampleRate, this.config.numChannels, this.oututSampleBits, this.littleEdian);

        return wavTemp;
    }

    getWAVBlob() {
        this.stop();
        return new Blob([this.getWAV()], { type: 'audio/wav' });
    }

    downloadWAV(name = 'recorder') {
        let wavBlob = this.getWAVBlob();
        this.download(wavBlob, name, 'wav');
    }

    transformIntoPCM(lData, rData) {
        let lBuffer = new Float32Array(lData),
            rBuffer = new Float32Array(rData);
        let data = AnterosRecorder.compress({
            left: lBuffer,
            right: rBuffer,
        }, this.inputSampleRate, this.outputSampleRate);
        return AnterosRecorder.encodePCM(data, this.oututSampleBits, this.littleEdian);
    }

    destroy() {
        this.stopStream();
        return this.closeAudioContext();
    }

    stopStream() {
        if (this.stream && this.stream.getTracks) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    closeAudioContext() {
        if (this.context.close) {
            return this.context.close();
        } else {
            return new Promise((resolve) => {
                resolve();
            });
        }
    }

    download(blob, name, type) {
        try {
            let oA = document.createElement('a');
            oA.href = window.URL.createObjectURL(blob);
            oA.download = name + '.' + type;
            oA.click();
        } catch (e) {
            AnterosRecorder.throwError(e);
        }
    }

    clear() {
        this.lBuffer.length = 0;
        this.rBuffer.length = 0;
        this.size = 0;
        this.fileSize = 0;
        this.PCM = null;
        this.audioInput = null;
        this.duration = 0;
        this.ispause = false;
        this.isplaying = false;
        this.playTime = 0;
        this.totalPlayTime = 0;
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
    }

    flat() {
        let lData = null,
            rData = new Float32Array(0);
        if (1 === this.config.numChannels) {
            lData = new Float32Array(this.size);
        } else {
            lData = new Float32Array(this.size / 2);
            rData = new Float32Array(this.size / 2);
        }
        let offset = 0;
        for (let i = 0; i < this.lBuffer.length; i++) {
            lData.set(this.lBuffer[i], offset);
            offset += this.lBuffer[i].length;
        }
        offset = 0;
        for (let i = 0; i < this.rBuffer.length; i++) {
            rData.set(this.rBuffer[i], offset);
            offset += this.rBuffer[i].length;
        }
        return {
            left: lData,
            right: rData
        };
    }

    static playAudio(blob) {
        let oAudio = document.createElement('audio');
        oAudio.src = window.URL.createObjectURL(blob);
        oAudio.play();
    }

    static compress(data, inputSampleRate, outputSampleRate) {
        let rate = inputSampleRate / outputSampleRate,
            compression = Math.max(rate, 1),
            lData = data.left,
            rData = data.right,
            length = Math.floor((lData.length + rData.length) / rate),
            result = new Float32Array(length),
            index = 0,
            j = 0;

        while (index < length) {
            let temp = Math.floor(j)
            result[index] = lData[temp];
            index++;
            if (rData.length) {
                result[index] = rData[temp];
                index++;
            }

            j += compression;
        }
        return result;
    }

    static encodePCM(bytes, sampleBits, littleEdian = true) {
        let offset = 0,
            dataLength = bytes.length * (sampleBits / 8),
            buffer = new ArrayBuffer(dataLength),
            data = new DataView(buffer);
        if (sampleBits === 8) {
            for (let i = 0; i < bytes.length; i++ , offset++) {
                let s = Math.max(-1, Math.min(1, bytes[i]));
                let val = s < 0 ? s * 128 : s * 127;
                val = +val + 128;
                data.setInt8(offset, val);
            }
        } else {
            for (let i = 0; i < bytes.length; i++ , offset += 2) {
                let s = Math.max(-1, Math.min(1, bytes[i]));
                data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, littleEdian);
            }
        }
        return data;
    }

    static encodeWAV(bytes, inputSampleRate, outputSampleRate, numChannels, oututSampleBits, littleEdian = true) {
        let sampleRate = outputSampleRate > inputSampleRate ? inputSampleRate : outputSampleRate,
            sampleBits = oututSampleBits,
            buffer = new ArrayBuffer(44 + bytes.byteLength),
            data = new DataView(buffer),
            channelCount = numChannels,
            offset = 0;
        writeString(data, offset, 'RIFF'); offset += 4;
        data.setUint32(offset, 36 + bytes.byteLength, littleEdian); offset += 4;
        writeString(data, offset, 'WAVE'); offset += 4;
        writeString(data, offset, 'fmt '); offset += 4;
        data.setUint32(offset, 16, littleEdian); offset += 4;
        data.setUint16(offset, 1, littleEdian); offset += 2;
        data.setUint16(offset, channelCount, littleEdian); offset += 2;
        data.setUint32(offset, sampleRate, littleEdian); offset += 4;
        data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), littleEdian); offset += 4;
        data.setUint16(offset, channelCount * (sampleBits / 8), littleEdian); offset += 2;
        data.setUint16(offset, sampleBits, littleEdian); offset += 2;
        writeString(data, offset, 'data'); offset += 4;
        data.setUint32(offset, bytes.byteLength, littleEdian); offset += 4;
        for (let i = 0; i < bytes.byteLength;) {
            data.setUint8(offset, bytes.getUint8(i));
            offset++;
            i++;
        }
        return data;
    }

    static throwError(message) {
        throw new Error(message);
    }
}

function writeString(data, offset, str) {
    for (let i = 0; i < str.length; i++) {
        data.setUint8(offset + i, str.charCodeAt(i));
    }
}


@boundClass
class AnterosRecordAudioEdition extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sampleBit: 8,
            sampleRate: 16000,
            numChannel: 1,
            compiling: false,
            isRecording: false,
            duration: 0,
            fileSize: 0,
            vol: 0,
        };
        this.recorder = null;
        this.playTimer = null;
        this.drawRecordId = null;
        this.oCanvas = null;
        this.ctx = null;
        this.audioRef = React.createRef();
    }

    collectData() {
        return {
            sampleBits: this.state.sampleBit,
            sampleRate: this.state.sampleRate,
            numChannels: this.state.numChannel,
            compiling: this.state.compiling,
        };
    }

    startRecord() {
        this.clearPlay();
        const config = this.collectData();
        if (!this.recorder) {
            this.recorder = new AnterosRecorder(config);
            this.recorder.onprocess = function (duration) {
            }
            this.recorder.onprogress = (params) => {
                this.setState({
                    ...this.state,
                    duration: params.duration.toFixed(5),
                    fileSize: params.fileSize,
                    vol: params.vol.toFixed(2)
                });
            }
            config.compiling && (this.playTimer = setInterval(() => {
                if (!this.recorder) {
                    return;
                }

                let newData = this.recorder.getNextData();
                if (!newData.length) {
                    return;
                }
                let byteLength = newData[0].byteLength
                let buffer = new ArrayBuffer(newData.length * byteLength)
                let dataView = new DataView(buffer)

                for (let i = 0, iLen = newData.length; i < iLen; ++i) {
                    for (let j = 0, jLen = newData[i].byteLength; j < jLen; ++j) {
                        dataView.setInt8(i * byteLength + j, newData[i].getInt8(j))
                    }
                }

                let a = AnterosRecorder.encodeWAV(dataView, config.sampleRate, config.sampleRate, config.numChannels, config.sampleBits)
                let blob = new Blob([a], { type: 'audio/wav' });

                AnterosRecorder.playAudio(blob);
            }, 3000))
        } else {
            this.recorder.stop();
        }

        this.recorder.start().then(() => {
        }, (error) => {
            console.log(`${error.name}:${error.message}`);
        });
        this.drawRecord();
    }

    drawRecord() {
        if (this.recorder) {
            this.setState({ ...this.state, analyser: this.recorder.getAnalyser(), update: Math.random() });
        }
    }

    pauseRecord() {
        if (this.recorder) {
            this.recorder.pause();
        }
    }
    resumeRecord() {
        this.recorder && this.recorder.resume();
    }
    endRecord() {
        this.recorder && this.recorder.stop();
        this.drawRecordId && cancelAnimationFrame(this.drawRecordId);
        this.drawRecordId = null;

        let _this = this;
        let blob = this.recorder.getWAVBlob();
        var reader = new window.FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            let base64data = reader.result;
            base64data = base64data.split(',');
            base64data = base64data[1];
            if (
                _this.props.dataSource &&
                _this.props.dataSource.getState() !== 'dsBrowse'
            ) {
                _this.props.dataSource.setFieldByName(
                    _this.props.dataField,
                    base64data
                );
            } else {
                _this.setState({ value: base64data });
            }
        }

    }
    playRecord() {
        this.recorder && this.recorder.play();
        this.drawRecordId && cancelAnimationFrame(this.drawRecordId);
        this.drawRecordId = null;
        this.drawRecord();
    }
    pausePlay() {
        this.recorder && this.recorder.pausePlay();
    }
    resumePlay() {
        this.recorder && this.recorder.resumePlay();
        this.drawRecord();
    }
    clearPlay() {
        if (this.playTimer) {
            clearInterval(this.playTimer);
            this.playTimer = null;
        }
        if (this.drawRecordId) {
            cancelAnimationFrame(this.drawRecordId);
            this.drawRecordId = null;
        }
    }
    stopPlay() {
        this.clearPlay();
        this.recorder && this.recorder.stopPlay();
    }
    destroyRecord() {
        let _this = this;
        this.clearPlay();
        if (this.recorder) {
            this.recorder.destroy().then(function () {
                _this.recorder = null;
                _this.drawRecordId && cancelAnimationFrame(_this.drawRecordId);
            });
        }
    }
    downloadPCM() {
        this.recorder && this.recorder.downloadPCM();
    }
    downloadWAV() {
        this.recorder && this.recorder.downloadWAV();
    }

    uploadAudio(e) {
        AnterosRecorder.playAudio(e.target.files[0]);
    }

    componentDidMount() {
        if (this.props.isOpen) {
            this.oCanvas = document.getElementById("canvas");
            if (this.oCanvas)
                this.ctx = this.oCanvas.getContext("2d");
        }
    }

    componentDidUpdate() {
        if (this.props.isOpen) {
            this.oCanvas = document.getElementById("canvas");
            if (this.oCanvas)
                this.ctx = this.oCanvas.getContext("2d");
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isOpen) {
            this.oCanvas = document.getElementById("canvas");
            if (this.oCanvas)
                this.ctx = this.oCanvas.getContext("2d");
        }
    }

    onButtonClick(event, button) {
        let _this = this;
        if (button.props.id === 'btnSave') {
            if (!this.recorder.isRecording() && !this.recorder.isPause() && !this.recorder.isPlaying()) {
                this.props.onButtonClick(event, button);
            } else {
                AnterosSweetAlert({
                    title: 'Audio ainda em edição, deseja salvar mesmo assim ?',
                    text: 'Qualquer alteração não finalizada será perdida',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Salvar audio',
                    focusCancel: false
                })
                    .then(function (isConfirm) {
                        if (_this.props.handleSaveWhileEditing) {
                            _this.props.handleSaveWhileEditing(isConfirm);
                        }
                    })
                    .catch(function (reason) {
                        // quando apertar o botao "Cancelar" cai aqui. Apenas ignora. (sem processamento necessario)
                    });
            }
        }
    }



    onCloseButton(event) {
        this.dsAudio.cancel();
        this.setState({ ...this.state, modal: false });
    }

    render() {
        return (
            <AnterosModal
                id={this.props.id}
                title={'Gravando som'}
                secondary
                large
                showHeaderColor={true}
                showContextIcon={false}
                isOpen={this.props.isOpen}
                onCloseButton={this.props.onCloseButton}
            >
                <div style={{ justifyContent: "center", display: "flex" }}>
                    <AnterosButton icon="fas fa-microphone" caption="Gravar" primary onClick={this.startRecord} disabled={this.state.isRecording} />
                    <AnterosButton icon="fas fa-pause" caption="Pausar" primary onClick={this.pauseRecord} />
                    <AnterosButton icon="fas fa-redo" caption="Continuar" primary onClick={this.resumeRecord} />
                    <AnterosButton icon="fas fa-stop" caption="Finalizar" primary onClick={this.endRecord} />
                </div>
                <AnterosDivider />
                <AnterosStatistic.Group widths={'three'}>
                    <AnterosStatistic>
                        <AnterosStatistic.Value>{this.state.duration}</AnterosStatistic.Value>
                        <AnterosStatistic.Label>Duração</AnterosStatistic.Label>
                    </AnterosStatistic>
                    <AnterosStatistic>
                        <AnterosStatistic.Value>{this.state.fileSize}</AnterosStatistic.Value>
                        <AnterosStatistic.Label>Tamanho</AnterosStatistic.Label>
                    </AnterosStatistic>
                    <AnterosStatistic>
                        <AnterosStatistic.Value>{this.state.vol}</AnterosStatistic.Value>
                        <AnterosStatistic.Label>(%)</AnterosStatistic.Label>
                    </AnterosStatistic>
                </AnterosStatistic.Group>
                <div style={{ justifyContent: "center", display: "flex" }}>
                    <AnterosAudioSpectrum
                        id="audio-canvas"
                        height={200}
                        width={300}
                        analyser={this.state.analyser}
                        capColor={'red'}
                        capHeight={2}
                        meterWidth={2}
                        meterCount={512}
                        meterColor={[
                            { stop: 0, color: '#f00' },
                            { stop: 0.5, color: '#0CD7FD' },
                            { stop: 1, color: 'red' }
                        ]}
                        gap={4}
                    />
                </div>
                <AnterosDivider />
                <div style={{ justifyContent: "center", display: "flex" }}>
                    <AnterosButton icon="fas fa-play" info caption="Reproduzir" onClick={this.playRecord} />
                    <AnterosButton icon="fas fa-pause" info caption="Pausar" onClick={this.pausePlay} />
                    <AnterosButton icon="fas fa-redo" info caption="Continuar" onClick={this.resumePlay} />
                    <AnterosButton icon="fas fa-stop" info caption="Interromper" onClick={this.stopPlay} />
                    <AnterosButton icon="fas fa-trash" secondary caption="Descartar" onClick={this.destroyRecord} />
                </div>
                <AnterosDivider />
                <AnterosRow horizontalEnd>
                    <AnterosCol
                        style={{
                            textAlign: 'end'
                        }}
                        small={12}
                    >
                        <AnterosButton
                            id="btnSave"
                            route="#"
                            style={{
                                marginRight: '4px'
                            }}
                            icon="fa fa-floppy-o"
                            success
                            caption="Salvar"
                            onButtonClick={this.onButtonClick}
                        />
                        <AnterosButton
                            id="btnCancel"
                            route="#"
                            icon="fa fa-ban"
                            danger
                            caption="Cancelar"
                            onButtonClick={this.props.onButtonClick}
                        />
                    </AnterosCol>
                </AnterosRow>
            </AnterosModal>
        )
    }
}


@boundClass
class AnterosRecordAudio extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '', modalOpen: false };
        this.audioEdicao = React.createRef();
        if (this.props.dataSource) {
            if (this.props.dataSource.isEmptyField(this.props.dataField) && !this.props.readOnly) {
                this.props.dataSource.setFieldByName(this.props.dataField, '');
            }
            let value = this.props.dataSource.fieldByName(this.props.dataField);
            if (!value) {
                value = '';
            }
            this.state = { value: value };
        } else {
            this.state = { value: this.props.value };
        }
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);


        this.dsAudio = new AnterosLocalDatasource();
        this.dsAudio.open();
        this.dsAudio.insert();
        this.dsAudio.setFieldByName('editedAudio', this.state.value);
        this.dsAudio.post();
    }

    componentWillReceiveProps(nextProps) {
        let value = nextProps.value;
        if (nextProps.dataSource) {
            if (nextProps.dataSource.isEmptyField(nextProps.dataField) && !nextProps.readOnly) {
                nextProps.dataSource.setFieldByName(nextProps.dataField, '');
            }
            let value = nextProps.dataSource.fieldByName(nextProps.dataField);
            if (!value) {
                value = '';
            }
        }
        this.setState({ value });
        this.dsAudio.edit();
        this.dsAudio.setFieldByName(
            'editedAudio',
            value
        );
        this.dsAudio.post();
    }

    componentDidMount() {
        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(
                [
                    dataSourceEvents.AFTER_CLOSE,
                    dataSourceEvents.AFTER_OPEN,
                    dataSourceEvents.AFTER_GOTO_PAGE,
                    dataSourceEvents.AFTER_CANCEL,
                    dataSourceEvents.AFTER_SCROLL
                ],
                this.onDatasourceEvent
            );
            this.props.dataSource.addEventListener(
                dataSourceEvents.DATA_FIELD_CHANGED,
                this.onDatasourceEvent,
                this.props.dataField
            );
        }
    }

    componentWillUnmount() {
        if (this.props.dataSource) {
            this.props.dataSource.removeEventListener(
                [
                    dataSourceEvents.AFTER_CLOSE,
                    dataSourceEvents.AFTER_OPEN,
                    dataSourceEvents.AFTER_GOTO_PAGE,
                    dataSourceEvents.AFTER_CANCEL,
                    dataSourceEvents.AFTER_SCROLL
                ],
                this.onDatasourceEvent
            );
            this.props.dataSource.removeEventListener(
                dataSourceEvents.DATA_FIELD_CHANGED,
                this.onDatasourceEvent,
                this.props.dataField
            );
        }
    }

    onDatasourceEvent(event, error) {
        let value = this.props.dataSource.fieldByName(this.props.dataField);
        if (!value) {
            value = '';
        }
        this.setState({ ...this.state, value: value });
    }

    saveAudio(isConfirm) {
        if (isConfirm) {
            this.dsAudio.post();
            if (this.props.dataSource) {
                this.props.dataSource.setFieldByName(
                    this.props.dataField,
                    this.dsAudio.fieldByName('editedAudio')
                );
            }
            this.setState({ ...this.state, value: this.dsAudio.fieldByName('editedAudio'), modalOpen: false });
        }
    }

    getValue() {
        if (this.state.value && this.state.value !== '') {
            if (this.isBase64(this.state.value)) {
                if (this.isUrl(atob(this.state.value))) {
                    return atob(this.state.value);
                } else {
                    return 'data:audio;base64,' + this.state.value;
                }
            } else {
                return this.state.value;
            }
        } else {
            return null;
        }
    }

    isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    isUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    onButtonClick(event, button) {
        let _this = this;

        if (button.props.id === 'btnEditAudio') {
            if (this.state.value) {
                this.dsAudio.edit();
            } else {
                this.dsAudio.insert();
            }
            this.setState({ ...this.state, modalOpen: true });
        } else if (button.props.id === 'btnSave') {
            AnterosSweetAlert({
                title: 'Deseja salvar o audio ?',
                text: '',
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                focusCancel: false
            })
                .then(function (isConfirm) {
                    _this.saveAudio(isConfirm);
                    return;
                })
                .catch(function (reason) {
                    // quando apertar o botao "Não" cai aqui. Apenas ignora. (sem processamento necessario)
                });
        } else if (button.props.id === 'btnCancel') {
            AnterosSweetAlert({
                title: 'Deseja cancelar ?',
                text: '',
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                focusCancel: true
            })
                .then(function (isConfirm) {
                    if (isConfirm) {
                        _this.dsAudio.cancel();
                        _this.setState({ ..._this.state, modalOpen: false });
                    }
                    return;
                })
                .catch(function (reason) {
                    // quando apertar o botao "Não" cai aqui. Apenas ignora. (sem processamento necessario)
                });
        }
    }

    isReadOnly() {
        let readOnly = this.props.readOnly;
        if (this.props.dataSource && !readOnly) {
            readOnly = this.props.dataSource.getState() === 'dsBrowse';
        }
        if (!readOnly && !this.props.disabled) {
            return false;
        }
        return true;
    }

    render() {
        const colClasses = buildGridClassNames(this.props, false, []);
        let className = AnterosUtils.buildClassNames(
            colClasses.length > 0 || this.props.icon ? 'form-control' : '',
            'fileUpload'
        );

        if (colClasses.length > 0) {
            return (
                <div style={{ width: this.props.width, height: this.props.height, textAlign: 'center' }}>
                    <div className="input-group" style={{ width: this.props.width, height: this.props.height }}>
                        <div className={className} style={{ border: 0, height: this.props.height, display: "grid" }}>
                            <AnterosAudioPlayer {...this.props} src={this.getValue()} />
                            {this.isReadOnly() ? null : <AnterosButton caption="Gravar áudio" id="btnEditAudio" secondary pill icon="far fa-microphone" onButtonClick={this.onButtonClick} />}
                            <AnterosRecordAudioEdition dataSource={this.dsAudio} dataField={'editedAudio'} handleSaveWhileEditing={this.saveAudio} ref={this.audioEdicao} isOpen={this.state.modalOpen} onButtonClick={this.onButtonClick} />
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div style={{ width: this.props.width, height: this.props.height, textAlign: 'center' }}>
                    <div className="input-group" style={{ width: this.props.width, height: this.props.height }}>
                        <div style={{ border: 0, height: this.props.height, display: "grid" }}>
                            <AnterosAudioPlayer {...this.props} src={this.getValue()} />
                            {this.isReadOnly() || this.props.disabled ? null : <AnterosButton id="btnEditAudio" caption="Gravar áudio" secondary pill icon="far fa-microphone" onButtonClick={this.onButtonClick} />}
                            <AnterosRecordAudioEdition dataSource={this.dsAudio} dataField={'editedAudio'} handleSaveWhileEditing={this.saveAudio} ref={this.audioEdicao} isOpen={this.state.modalOpen} onButtonClick={this.onButtonClick} />
                        </div>
                    </div>
                </div>
            );
        }
    }
}

AnterosRecordAudio.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool.isRequired,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    value: PropTypes.any,
    showSpectrum: PropTypes.bool.isRequired
};

AnterosRecordAudio.defaultProps = {
    readOnly: false,
    value: '',
    disabled: false,
    showSpectrum: true
};

export default AnterosRecordAudio;