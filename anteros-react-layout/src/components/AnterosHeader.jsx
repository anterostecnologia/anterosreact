import React, { Component } from 'react';



export default class AnterosHeader extends Component {
    constructor(props) {
        super(props);
        this.onSidebarCollapseButtonClick = this.onSidebarCollapseButtonClick.bind(this);
    }

    onSidebarCollapseButtonClick() {
        event.preventDefault();
        $("#app").toggleClass("sidebar-open");
    }

    render() {
        let newNavigatorLinks = [];
        let menu;
        if (this.props.children) {
            let _this = this;
            let arrChildren = React.Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && child.type.name == "AnterosNavigatorLink") {
                    newNavigatorLinks.push(child);
                } else if (child.type && child.type.name == "AnterosNavigatorLinkDropdown") {
                    newNavigatorLinks.push(child);
                } else if (child.type && child.type.name == "AnterosFullScreen") {
                    newNavigatorLinks.push(child);
                } else if (child.type && child.type.name == "AnterosMenu") {
                    menu = child;
                }
            });
        }
        return (
            <header className="header">
                <div className="header-sidebar">
                    <div className="brand hidden-sm-down">
                        <img src={this.props.logo} />
                    </div>
                </div>
                <div className="header-block header-block-collapse hidden-lg-up">
                    <button className="collapse-btn" id="sidebar-collapse-btn" style={{ color: "#969696" }} onClick={this.onSidebarCollapseButtonClick}>
                        <i className="fa fa-bars"></i>
                    </button>
                </div>
                {menu}
                <div className="header-block header-block-search hidden-sm-down">
                    <form role="search">
                        <div className="input-container"> <i className="fa fa-search"></i> <input type="search" placeholder="Localizar" />
                            <div className="underline"></div>
                        </div>
                    </form>
                </div>
                <div className="header-block header-block-buttons">
                </div>
                <div className="header-block header-block-nav">
                    <ul className="nav-profile ">
                        {newNavigatorLinks}
                    </ul>
                </div>
            </header>
        )
    }
}


