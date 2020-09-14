import React, { Component } from 'react';
import { autoBind } from 'anteros-react-core';
import PropTypes from 'prop-types';


class AnterosSectionRightSide extends Component {
    constructor(props) {
        super(props);
        this.state = { opened: false };
        autoBind(this);
    }

    onClickHelperButton(event) {
        this.setState({ opened: !this.state.opened });
    }

    render() {
        let right = this.props.width*-1;
        if (this.state.opened) {
            right = 0;
        }
        return (
            <div className="Helper_themeHelper__34XlU" 
                style={{ 
                    width: this.props.width+"px", 
                    right, top: this.props.top, 
                    bottom: this.props.bottom }}>
                <div className="react-joyride">
                </div>
                <div className="Helper_themeHelperBtn__1y8_u helper-button"
                    data-placement={this.props.hintPosition}
                    data-balloon-pos={this.props.hintPosition}
                    aria-label={this.state.opened?this.props.hintOpened:this.props.hint}
                    onClick={this.onClickHelperButton} >
                    <div className="Helper_themeHelperSpinner__3vmZJ text-white">
                        <i className={this.state.opened?this.props.iconOpened:this.props.icon} 
                            aria-hidden="true" style={{ color: this.props.color,
                                paddingRight: "4px",
                            }}></i>
                    </div>
                </div>
                <section className="widget Widget_widget__2sOo_ Helper_themeHelperContent__3x0xU"
                    style={{
                        backgroundColor: this.props.backgroundColor, alignItems: "center", justifyItems: "center",
                        display: 'flex'
                    }}>
                    {this.props.children}
                </section>
            </div>);
    }
}

AnterosSectionRightSide.propTypes = {
    top: PropTypes.any,
    bottom: PropTypes.any,
    icon: PropTypes.string,
    iconOpened: PropTypes.string,
    color: PropTypes.string,
    backgroundColor: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    /** Dica do botão */
    hint: PropTypes.string,
    /** Posição da dica(hint) no botão */
    hintPosition: PropTypes.oneOf(["up", "right", "left", "down"])   

}

AnterosSectionRightSide.defaultProps = {
    top: '55px',
    bottom: '5px',
    backgroundColor: '#eceff1',
    icon: 'fad fa-filter',
    iconOpened: 'fad fa-times',
    color: 'white',
    width: 370,
    hintPosition: 'up',
    hint: "Abrir filtro",
    hintOpened: 'Fechar filtro'
}

export { AnterosSectionRightSide };