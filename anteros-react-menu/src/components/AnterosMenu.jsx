import React, { Component } from 'react';
import AnterosMenuItem from './AnterosMenuItem';
import PropTypes from 'prop-types';
 


export default class AnterosMenu extends Component {

  constructor(props) {
    super(props);
    this.state = { activeId: undefined, expandedIds: [] };
    this.setActiveId = this.setActiveId.bind(this);
    this.getActiveId = this.getActiveId.bind(this);
    this.onExpandId = this.onExpandId.bind(this);
    this.onCollapseId = this.onCollapseId.bind(this);
    this.isExpanded = this.isExpanded.bind(this);
  }

  setActiveId(id) {
    this.setState({ activeId: id });
  }

  getActiveId() {
    return this.state.activeId;
  }

  onExpandId(id) {
    let ids = this.state.expandedIds;
    ids = ids.concat(id);
    this.setState({ ...this.state, expandedIds: ids });
  }

  isExpanded(id) {
    return (this.state.expandedIds.indexOf(id) !== -1);
  }

  onCollapseId(id) {
    let ids = this.state.expandedIds;
    const index = ids.indexOf(id);
    if (index !== -1) {
      ids.splice(index, 1);
    }
    this.setState({ ...this.state, expandedIds: ids });
  }

  getChildContext() {
    let horizontal = this.props.horizontal;

    if (this.context.horizontal) {
      horizontal = this.context.horizontal;
    }

    return { horizontal };
  }

  render() {
    let children = [];
    if (this.props.children) {
      let _this = this;
      let arrChildren = React.Children.toArray(this.props.children);
      arrChildren.forEach(function (child) {
        if (child.props.visible) {
          children.push(React.createElement(AnterosMenuItem, {
            key: child.props.id,
            icon: child.props.icon,
            image: child.props.image,
            imageWidth: child.props.imageWidth,
            imageHeight: child.props.imageHeight,
            caption: child.props.caption,
            route: child.props.route,
            id: child.props.id,
            onSelectMenuItem: child.props.onSelectMenuItem,
            getActiveId: _this.getActiveId,
            setActiveId: _this.setActiveId,
            onExpandId: _this.onExpandId,
            onCollapseId: _this.onCollapseId,
            isExpanded: _this.isExpanded,
            level: 1
          },
            child.props.children
          ))
        };
      });
    }

    let horizontal = this.props.horizontal;

    if (this.context.horizontal) {
      horizontal = this.context.horizontal;
    }

    if (horizontal) {
      return (<nav className="horizontal-menu">
                <ul>
                  {children}
                </ul>
              </nav>);
    } else {
      return (
        <aside className="sidebar" style={this.props.style}>
          <div className="sidebar-container">
            <div className="sidebar-header">
              <div className="brand hidden-md-up">
                <img src={this.props.logo} alt=""/>
              </div>
            </div>
            <nav className="menu">
              <ul className="nav flex-column" id="sidebar-menu">
                {children}
              </ul>
            </nav>
          </div>          
        </aside>
      );
    }
  }
}


AnterosMenu.contextTypes = {
  horizontal: PropTypes.bool
}

AnterosMenu.childContextTypes = {
  horizontal: PropTypes.bool
}

AnterosMenu.propTypes = {
  horizontal: PropTypes.bool
}

AnterosMenu.defaultProps = {
  horizontal: false
}

