import React from 'react';
import {AnterosIcon} from '@anterostecnologia/anteros-react-image';

const ProgressBar = require('react-progress-bar.js');
const Circle = ProgressBar.Circle;

export class AnterosChatFileMessage extends React.PureComponent {

    onClick(e) {
        if (!this.props.data.status)
            return;

        if (!this.props.data.status.download && this.props.onDownload instanceof Function)
            this.props.onDownload(e);
        else if (this.props.data.status.download && this.props.onOpen instanceof Function)
            this.props.onOpen(e);
    }

    render() {
        var progressOptions = {
            strokeWidth: 5,
            color: '#333',
            trailColor: '#aaa',
            trailWidth: 5,
            step: (state, circle) => {
                circle.path.setAttribute('trail', state.color);
                circle.path.setAttribute('trailwidth-width', state.width);

                var value = Math.round(circle.value() * 100);
                if (value === 0)
                    circle.setText('');
                else
                    circle.setText(value);
            }
        };

        const error = this.props.data.status && this.props.data.status.error === true;

        return (
            <div className='rce-mbox-file'>
                <button onClick={this.onClick.bind(this)}>
                    <div className="rce-mbox-file--icon">
                        <AnterosIcon icon="fal fa-file"
                            color='#aaa'/>
                        <div className="rce-mbox-file--size">
                            {this.props.data.size}
                        </div>
                    </div>
                    <div className="rce-mbox-file--text">
                        {this.props.text}
                    </div>
                    <div className="rce-mbox-file--buttons">
                        {
                            error &&
                            <span className="rce-error-button">
                                <AnterosIcon icon="fal fa-exclamation-triangle"
                                    color='#ff3d3d'/>
                            </span>
                        }
                        {
                            !error &&
                            this.props.data.status &&
                            !this.props.data.status.download &&
                            !this.props.data.status.click &&
                            <AnterosIcon icon="fal fa-cloud-download"
                                color='#aaa'/>
                        }
                        {
                            !error &&
                            this.props.data.status &&
                            typeof this.props.data.status.loading === 'number' &&
                            this.props.data.status.loading !== 0 &&
                            <Circle
                                progress={this.props.data.status.loading}
                                options={progressOptions}
                                initialAnimate={true}
                                containerClassName={'rce-mbox-file--loading'} />
                        }
                    </div>
                </button>
            </div>
        );
    }
}

AnterosChat.defaultProps = {
    text: '',
    data: {},
    onClick: null,
    onDownload: null,
    onOpen: null,
};


export default AnterosChat;
