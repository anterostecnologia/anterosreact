import { Component } from 'react';
import PropTypes from 'prop-types';


export default class AnterosRadialButton extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = { open: false };
    }

    onClick(event) {
        event.preventDefault();
        let isOpen = !this.state.open;

        this.setState(() => (
            {
                open: isOpen,
            }
        ));
    }

    render() {
        return (<div className={"radial " + (this.state.open ? "open" : "")} onClick={this.onClick}>
            <button className="fa fa-paper-plane fa-3x" id="fa-1"></button>
            <button className="fa fa-home fa-3x" id="fa-2"></button>
            <button className="fa fa-search fa-3x" id="fa-3"></button>
            <button className="fa fa-users fa-3x" id="fa-4"></button>
            <button className="fa fa-wrench fa-3x" id="fa-5"></button>
            <button className="fa fa-users fa-3x" id="fa-6"></button>
            <button className="fab">
                <i className="fa fa-plus fa-4x" id="plus"></i>
            </button>
        </div>);


    }
}