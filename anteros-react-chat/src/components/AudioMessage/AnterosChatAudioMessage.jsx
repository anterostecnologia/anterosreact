import React from 'react';


export default class AnterosChatAudioMessage extends React.PureComponent {
    render() {
        const audioURL = this.props.data.audioURL;
        const controlsList = this.props.data.controlsList;

        return (
            <div className={'chat-mbox-audio'}>
                <audio controls controlsList={controlsList ? controlsList : "nodownload"}>
                    <source src={audioURL} type="audio/mp3"/>
                    Seu navegador não suporta o elemento de áudio.
                </audio>

                {
                    this.props.text &&
                    <div className='chat-mbox-text'>
                        {this.props.text}
                    </div>
                }
            </div>
        );
    }
}

AnterosChatAudioMessage.defaultProps = {
    data: {},
};
