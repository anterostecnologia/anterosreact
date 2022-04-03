import React from "react";

class AnterosRibbonGroup extends React.Component {
    render() {
        let {backgroundTitle} = this.props; 
        return (
            <div className={"ribbon-col " + (this.props.colClass ? this.props.colClass : "col-sm-6")} style={{height:'110px!important'}}>
                <div className="ribbon-group d-flex flex-column" style={{height:'110px!important'}}>
                    <div className="ribbon-group-content  flex-fill" style={{height:'110px!important'}}>
                        <div className="ribbon-group-content row no-gutters row-2px  p-1" style={{height:'110px!important'}}>
                            {this.props.children}
                        </div>
                    </div>
                    <div style={{background:backgroundTitle}} className="ribbon-group-title text-center">
                        {this.props.title}
                    </div>
                </div>
            </div>
        );
    }
}

export default AnterosRibbonGroup;