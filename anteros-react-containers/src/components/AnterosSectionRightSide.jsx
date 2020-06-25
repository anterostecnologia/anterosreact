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
        let right = '-360px';
        if (this.state.opened) {
            right = '0';
        }
        return (
            <div className="Helper_themeHelper__34XlU" style={{ width: this.props.width, right, top: this.props.top, bottom: this.props.bottom }}>
                <div className="react-joyride">
                </div>
                <div className="Helper_themeHelperBtn__1y8_u helper-button"
                    onClick={this.onClickHelperButton} >
                    <div className="Helper_themeHelperSpinner__3vmZJ text-white">
                        <i className={this.props.icon}
                            aria-hidden="true" style={{
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
    backgroundColor: PropTypes.string.isRequired,
    width: PropTypes.any.isRequired
}

AnterosSectionRightSide.defaultProps = {
    top: '55px',
    bottom: '5px',
    backgroundColor: '#eceff1',
    icon: 'fad fa-filter',
    width: '370px'
}

export { AnterosSectionRightSide };