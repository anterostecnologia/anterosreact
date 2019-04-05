import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class AnterosTab extends Component {
    constructor(props) {
        super(props);
        this.handleSelectTab = this.handleSelectTab.bind(this);
    }

    handleSelectTab(item) {
        
    }

    render() {
        return (
            null
        )
    }
}

AnterosTab.propTypes = {
    onTabLinkClick: PropTypes.func,
    onTabClick: PropTypes.func,
    vertical : PropTypes.bool.isRequired,
    custom1 : PropTypes.bool.isRequired,
    custom2 : PropTypes.bool.isRequired,
    pill : PropTypes.bool.isRequired,
    onPageChange : PropTypes.func,
    visible : PropTypes.bool.isRequired
}

AnterosTab.defaultProps = {
    vertical: false,
    custom1: false,
    custom2: false,
    pill: false,
    visible: true
}