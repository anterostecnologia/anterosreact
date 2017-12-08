import React, { Component } from 'react';
import { AnterosError } from "anteros-react-core";


export default class AnterosMainLayout extends Component {

    constructor(props) {
        super(props);
        this.onSidebarOverlayClick = this.onSidebarOverlayClick.bind(this);
        if (this.props.containerAppId == undefined) {
            throw new AnterosError("Informe o ID do container da Aplicação.");
        }
    }


    getChildContext() {
        return { horizontal: this.props.horizontal };
    }

    onSidebarOverlayClick() {
        $("#" + this.props.containerAppId).removeClass("sidebar-open");
    }

    render() {
        let className = "app header-fixed footer-fixed sidebar-fixed";
        if (this.props.horizontal==true){
            className += " horizontal";
        }
        return (
            <div className="main-wrapper">
                <div className={className} id="app">                    
                    {this.props.children}
                </div>
            </div>);
    }
}


AnterosMainLayout.propTypes = {
    horizontal: React.PropTypes.bool
}

AnterosMainLayout.defaultProps = {
    horizontal: false
}

AnterosMainLayout.childContextTypes = {
    horizontal: React.PropTypes.bool
}