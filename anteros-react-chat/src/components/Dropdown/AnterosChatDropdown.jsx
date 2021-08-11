import React, { Component } from 'react';

import AnterosChatButton from '../Button/AnterosChatButton';

const classNames = require('classnames');

export class AnterosChatDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: undefined,
        };
    }

    onBlur(e) {
        if (this.state.show === true)
            this.setState({show: false});
    }

    render() {
        return (
            <div className={classNames('chat-dropdown-container', this.props.className)} onBlur={this.onBlur.bind(this)}>
                {
                    <AnterosChatButton
                        {...this.props.buttonProps}
                        onClick={() => this.setState({ show: !this.state.show })} />
                }
                <div
                    className={classNames(
                        'chat-dropdown',
                        this.props.animationType,
                        'chat-dropdown-open__' + this.props.animationPosition,
                        { 'dropdown-hide': this.state.show === false },
                        { 'dropdown-show': this.state.show === true })}>

                        <ul>
                            {
                                this.props.title &&
                                <span className='chat-dropdown-title'>{this.props.title}</span>
                            }
                            {
                                this.props.items.map((x, i) => (
                                    <li key={i} onMouseDown={(e) => this.props.onSelect(i)}>
                                        {
                                            x instanceof Object ?
                                                x.icon ?
                                                    <span className='chat-button-icon--container'>
                                                        {(x.icon.float === 'right' || !x.icon.float) && <a>{x.text}</a>}

                                                        <span style={{ float: x.icon.float, color: x.icon.color, fontSize: x.icon.size || 12 }} className={classNames('chat-button-icon', x.icon.className)}>{x.icon.component}</span>

                                                        {x.icon.float === 'left' && <a>{x.text}</a>}
                                                    </span>
                                                    : <a>{x.text}</a>
                                            :
                                            <a>{x}</a>
                                        }
                                    </li>
                                ))
                            }
                        </ul>
                </div>
            </div>
        );
    }
}

AnterosChatDropdown.defaultProps = {
    animationType: 'default',
    animationPosition: 'nortwest',
    items: [],
    onSelect: Function,
    buttonProps: null
};

export default AnterosChatDropdown;
