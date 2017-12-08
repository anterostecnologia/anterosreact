import React, { Component } from 'react';
import AnterosNavigatorLink from "anteros-react-menu";
import lodash from 'lodash';

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
    onTabLinkClick: React.PropTypes.func,
    onTabClick: React.PropTypes.func,
    vertical : React.PropTypes.bool.isRequired,
    custom1 : React.PropTypes.bool.isRequired,
    custom2 : React.PropTypes.bool.isRequired,
    pill : React.PropTypes.bool.isRequired,
    onPageChange : React.PropTypes.func
}

AnterosTab.defaultProps = {
    vertical: false,
    custom1: false,
    custom2: false,
    pill: false
}