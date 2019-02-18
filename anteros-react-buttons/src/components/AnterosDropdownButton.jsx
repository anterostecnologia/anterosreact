
import React, { Component } from 'react';
import AnterosButton from './AnterosButton';
import lodash from "lodash";
import PropTypes from 'prop-types';

export default class AnterosDropdownButton extends Component {
    constructor(props) {
        super(props);
        this.idButton = lodash.uniqueId("btn");
        this.buildChildren = this.buildChildren.bind(this);
        this.onClickItem = this.onClickItem.bind(this);
        this.dropped = false;
    }

    componentDidMount() {
        $('#' + this.idButton).on('hide.bs.dropdown', function (event) {
            return false;
        });
        $('#' + this.idButton).removeClass("show");
    }

    onClickItem(event) {
        if (!this.dropped){
            $('#' + this.idButton).addClass("show");
        } else {
            $('#' + this.idButton).removeClass("show");
        }
    }
    

    buildChildren(children) {
        let result = [];
        let _this = this;
        let arrChildren = React.Children.toArray(children);
        arrChildren.forEach(function (child) {
            if (child.type && child.type.name == "AnterosDropdownMenu") {
                result.push(React.cloneElement(child, { onClickItem: _this.onClickItem }));
            } else {
                result.push(child);
            }
        });
        return result;
    }

    render() {
        let { children, ...rest } = this.props;
        children = this.buildChildren(children);
        if (this.props.id) {
            this.idButton = this.props.id;
        }

        return (<div className="btn-group" id={this.idButton} >
            <AnterosButton  {...rest} dropdown onButtonClick={this.onClickItem}>
            </AnterosButton>
            {children}
        </div >);
    }
}


AnterosDropdownButton.propTypes = {
    oval: PropTypes.bool,
    success: PropTypes.bool,
    large: PropTypes.bool,
    small: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    secondary: PropTypes.bool,
    pillLeft: PropTypes.bool,
    pillRight: PropTypes.bool,
    block: PropTypes.bool,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    caption: PropTypes.string,
    onClickButton: PropTypes.func,
    hint: PropTypes.string,
    hintPosition: PropTypes.string,
    hintSize: PropTypes.string
};

AnterosDropdownButton.defaultProps = {
    oval: false,
    success: false,
    large: false,
    small: false,
    primary: false,
    danger: false,
    secondary: false,
    pillLeft: false,
    pillRight: false,
    block: false,
    backgroundColor: undefined,
    borderColor: undefined,
    color: undefined,
    icon: undefined,
    image: undefined,
    caption: undefined
};

