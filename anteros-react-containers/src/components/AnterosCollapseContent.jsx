import React, { Component } from 'react';
import lodash from 'lodash';


export default class AnterosCollapseContent extends Component {

    constructor(props) {
        super(props);
        this.idCollapse = (this.props.id ? this.props.id : lodash.uniqueId("collapse"));
        this.isShow = this.isShow.bind(this);
    }

    componentDidMount(){
        let _this = this;
        $('#'+this.idCollapse).on('shown.bs.collapse', function () {
            if (_this.props.onShowCollapse){
                _this.props.onShowCollapse(this.idCollapse);
            }
          })
          $('#'+this.idCollapse).on('hidden.bs.collapse', function () {
            if (_this.props.onHideCollapse){
                _this.props.onHideCollapse(this.idCollapse);
            }
          })
    }

    isShow(){
        $( '#'+this.idCollapse ).hasClass( "show" );
    }

    render() {
        let className = "collapse";
        if (this.props.className){
            className += " "+this.props.className;
        }
       return (<div className="collapse" id={this.idCollapse} style={this.props.style}>
            {this.props.children}
        </div>);
    }

}


AnterosCollapseContent.propTypes = {
    onShowCollapse : React.PropTypes.func,
    onHideCollapse : React.PropTypes.func
};