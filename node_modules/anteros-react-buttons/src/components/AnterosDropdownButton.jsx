
import React, { Component } from 'react';
import AnterosButton from './AnterosButton';
import lodash from "lodash";


export default class AnterosDropdownButton extends Component {
    constructor(props) {
        super(props);
        this.idButton = lodash.uniqueId("btn");
        this.buildChildren = this.buildChildren.bind(this);
        this.onClickItem = this.onClickItem.bind(this);
    }

    componentDidMount() {
        $('#' + this.idButton).on('hide.bs.dropdown', function (event) {
            return false;
        });
        $(document).on('click',this.onClickItem);
    }

    onClickItem(event) {
        $('#' + this.idButton).removeClass("show");
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
            <AnterosButton  {...rest} dropdown onClickItem={this.onClickItem}>
            </AnterosButton>
            {children}
        </div >);
    }
}


AnterosDropdownButton.propTypes = {
    oval: React.PropTypes.bool,
    success: React.PropTypes.bool,
    large: React.PropTypes.bool,
    small: React.PropTypes.bool,
    primary: React.PropTypes.bool,
    danger: React.PropTypes.bool,
    secondary: React.PropTypes.bool,
    pillLeft: React.PropTypes.bool,
    pillRight: React.PropTypes.bool,
    block: React.PropTypes.bool,
    backgroundColor: React.PropTypes.string,
    borderColor: React.PropTypes.string,
    color: React.PropTypes.string,
    icon: React.PropTypes.string,
    image: React.PropTypes.string,
    caption: React.PropTypes.string,
    onClickButton: React.PropTypes.func,
    hint: React.PropTypes.string,
    hintPosition: React.PropTypes.string,
    hintSize: React.PropTypes.string
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

