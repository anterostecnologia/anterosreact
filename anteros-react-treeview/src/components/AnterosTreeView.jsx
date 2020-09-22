import React, { Component } from 'react';
import lodash from 'lodash';
import { AnterosError } from "@anterostecnologia/anteros-react-core";
import PropTypes from 'prop-types';

function _getSelectedNodes(nodes) {
  let selectedNodes = [];
  if (nodes)
    nodes.forEach(function (node) {
      if (node.state.selected == true) {
        selectedNodes.push(node);
        selectedNodes.push(..._getSelectedNodes(node.nodes));
      }
    });
  return selectedNodes;
};



class AnterosTreeView extends Component {

  constructor(props) {
    super(props);
    this.nodeList = [];
    this.state = { dataSource: this.setNodeDetails(lodash.clone({ nodes: props.dataSource })), focused: undefined };

    this.findNodeById = this.findNodeById.bind(this);
    this.findNextNodeById = this.findNextNodeById.bind(this);
    this.setChildrenState = this.setChildrenState.bind(this);
    this.setParentSelectable = this.setParentSelectable.bind(this);
    this.nodeSelected = this.nodeSelected.bind(this);
    this.nodeExpandedCollapsed = this.nodeExpandedCollapsed.bind(this);
    this.nodeFocused = this.nodeFocused.bind(this);
    this.getFocused = this.getFocused.bind(this);
    this.nodeDoubleClicked = this.nodeDoubleClicked.bind(this);
    this.addNode = this.addNode.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.loadDataSource = this.loadDataSource.bind(this);
    if (!(this.props.id)) {
      throw new AnterosError('Informe um ID para o component AnterosTreeView.');
    }
  }

  componentWillReceiveProps(nextProps) {
    this.nodeList = [];
    this.setState({ dataSource: this.setNodeDetails(lodash.clone({ nodes: nextProps.dataSource })) });
  }

  setNodeDetails(node) {
    if (!node.nodes) return;
    return node.nodes.map(childNode => {
      this.nodeList.push(childNode.id);
      let newNode = {
        id: childNode.id,
        nodes: this.setNodeDetails(childNode),
        parentNode: node,
        isleaf: childNode.isleaf ? childNode.isleaf : false,
        state: {
          selected: childNode.state ? !!childNode.state.selected : false,
          expanded: childNode.state ? !!childNode.state.expanded : false,
          loading: childNode.state ? !!childNode.state.loading : false,
        },
        text: childNode.text,
        icon: childNode.icon,
        image: childNode.image
      }
      return newNode;
    });

  }

  findNodeById(nodes, id) {
    let _this = this;
    let result;
    if (nodes)
      nodes.forEach(function (node) {
        if (node.id == id) result = node;
        else {
          if (node.nodes) {
            result = _this.findNodeById(node.nodes, id) || result;
          }
        }
      });
    return result;
  }

  findPreviousNodeById(id, visible) {
    let foundId = false;
    for (let i = this.nodeList.length - 1; i >= 0; i--) {
      if (foundId) {
        let node = this.findNodeById(this.state.dataSource, this.nodeList[i]);
        if (!visible)
          return node;

        if (node.visible)
          return node;
      }
      if (this.nodeList[i] == id) {
        foundId = true;
      }
    }
  }

  findNextNodeById(id, visible) {
    let foundId = false;
    for (var i = 0; i < this.nodeList.length; i++) {
      if (foundId) {
        let node = this.findNodeById(this.state.dataSource, this.nodeList[i]);
        if (!visible)
          return node;

        if (node.visible)
          return node;
      }
      if (this.nodeList[i] == id) {
        foundId = true;
      }
    }
  }


  deleteById(obj, id) {
    if (!obj || obj.length <= 0)
      return [];
    let arr = [];
    lodash.each(obj, (val) => {
      if (val.nodes && val.nodes.length > 0)
        val.nodes = this.deleteById(val.nodes, id);

      if (val.id !== id) {
        arr.push(val);
      }
    });
    return arr;
  }

  setChildrenState(nodes, state) {
    let selectedNodes = [];
    let _this = this;
    if (nodes)
      nodes.forEach(function (node) {
        node.state.selected = state;
        selectedNodes.push(node);
        selectedNodes.push(..._this.setChildrenState(node.nodes, state));
      });
    return selectedNodes;
  }

  getSelectedNodes() {
    return _getSelectedNodes(this.state.dataSource);
  }

  setParentSelectable(node) {
    if (!node.parentNode || !node.parentNode.state)
      return;
    node.parentNode.state.selected = true;
    this.setParentSelectable(node.parentNode);
  }

  nodeSelected(id, selected) {
    let selectedNodes = [];
    let newDataSource = this.state.dataSource;
    let node = this.findNodeById(newDataSource, id);
    node.state.selected = selected;
    selectedNodes.push(node);
    selectedNodes.push(...this.setChildrenState(node.nodes, selected));
    this.setState(() => ({ dataSource: newDataSource }));

    if (this.props.onChangedDataSource) {
      this.props.onChangedDataSource(newDataSource);
    }

    if (selected == true) {
      if (this.props.onSelectedNode) {
        this.props.onSelectedNode(newDataSource, selectedNodes);
      }
    } else {
      if (this.props.onUnSelectedNode) {
        this.props.onUnSelectedNode(newDataSource, selectedNodes);
      }
    }
  }

  nodeExpandedCollapsed(id, expanded) {
    let newDataSource = this.state.dataSource;
    let expandedNodes = [];
    let node = this.findNodeById(newDataSource, id);
    let loading = ((!(node.nodes)) && !(node.isleaf));
    if (!(this.props.onLoadDataSource) && loading) {
      loading = false;
    }
    node.state.expanded = expanded;
    node.state.loading = loading;
    expandedNodes.push(node);
    this.setState(() => ({ dataSource: newDataSource }));

    if (this.props.onChangedDataSource) {
      this.props.onChangedDataSource(newDataSource);
    }

    if (expanded == true) {
      if (this.props.onExpandedNode) {
        this.props.onExpandedNode(newDataSource, expandedNodes);
      }
    } else {
      if (this.props.onCollapsedNode) {
        this.props.onCollapsedNode(newDataSource, expandedNodes);
      }
    }

    if (loading)
      this.loadDataSource(node.id);
  }

  nodeFocused(id) {
    if (this.props.onLoosedFocusNode && this.state.focused) {
      this.props.onLoosedFocusNode(this.state.focused);
    }

    let node = this.findNodeById(this.state.dataSource, id);
    this.setState(() => ({ dataSource: this.state.dataSource, focused: node }));

    if (this.props.onFocusedNode) {
      this.props.onFocusedNode(node);
    }
  }

  loadDataSource(id) {
    if (this.props.onLoadDataSource) {
      let newDataSource = this.state.dataSource;
      let node = this.findNodeById(newDataSource, id);
      const callbackPromise = this.props.onLoadDataSource(node);
      if (callbackPromise) {
        callbackPromise.then((nodes) => {
          node.nodes = nodes;
          node.state.loading = false;
          this.setState(() => ({ dataSource: newDataSource }));
          if (this.props.onChangedDataSource) {
            this.props.onChangedDataSource(newDataSource);
          }
        }, () => {
          console.log('erro loaded');
        });
      }
    }
  }

  getFocused() {
    return this.state.focused;
  }

  nodeDoubleClicked(id, selected) {
    if (this.props.onDoubleClick) {
      let node = this.findNodeById(this.state.dataSource, id);
      this.props.onDoubleClick(this.state.dataSource, node);
    }
  }

  addNode(id, text) {
    let node = this.findNodeById(this.state.dataSource, id);

    let newNode = {
      text: text,
      state: { selected: false, expanded: false },
      parentNode: node,
      id: this.nodesQuantity++
    };

    if (node.nodes) {
      node.nodes.push(newNode)
    } else {
      node.nodes = [newNode]
    }

    if (this.props.onChangeDataSource) {
      this.props.onChangeDataSource(this.state.dataSource);
    }

    if (this.props.onNodeAdded)
      this.props.onNodeAdded(this.state.dataSource);
  }

  removeNode(id) {
    let newDataSource = this.deleteById(lodash.clone(this.state.dataSource), id);
    if (newDataSource.length === 0)
      return false;
    this.setState({ dataSource: newDataSource });

    if (this.props.onChangeDataSource) {
      this.props.onChangeDataSource(newDataSource);
    }
    if (this.props.onNodeRemoved)
      this.props.onNodeRemoved(newDataSource);
  }

  handleKeyDown(event) {
    if (this.state.focused) {
      if (event.keyCode == 38) {
        event.preventDefault();
        let previousNode = this.findPreviousNodeById(this.state.focused.id, true);
        if (previousNode) {
          this.setState({ dataSource: this.state.dataSource, focused: previousNode });
        }
      } else if (event.keyCode == 40) {
        event.preventDefault();
        let nextNode = this.findNextNodeById(this.state.focused.id, true);
        if (nextNode) {
          this.setState({ dataSource: this.state.dataSource, focused: nextNode });
        }
      } else if (event.keyCode == 32) {
        event.preventDefault();
        let node = this.findNodeById(this.state.dataSource, this.state.focused.id);
        if (node) {
          let selected = true;
          if (node.state.selected) {
            selected = !node.state.selected;
          }
          this.nodeSelected(node.id, selected);
        }
      } else if (event.keyCode == 107) {
        event.preventDefault();
        let node = this.findNodeById(this.state.dataSource, this.state.focused.id);
        if (node) {
          if (!node.state.expanded) {
            this.nodeExpandedCollapsed(node.id, true);
          }
        }
      } else if (event.keyCode == 109) {
        event.preventDefault();
        let node = this.findNodeById(this.state.dataSource, this.state.focused.id);
        if (node) {
          if (node.state.expanded) {
            this.nodeExpandedCollapsed(node.id, false);
          }
        }
      } else if (event.keyCode == 36) {
        event.preventDefault();
        let firstNode = this.findNodeById(this.state.dataSource, this.nodeList[0]);
        if (firstNode) {
          this.setState({ dataSource: this.state.dataSource, focused: firstNode });
        }
      } else if (event.keyCode == 35) {
        event.preventDefault();
        let id = this.nodeList[this.nodeList.length - 1];
        let lastNode = this.findNodeById(this.state.dataSource, id);
        if (lastNode) {
          this.setState({ dataSource: this.state.dataSource, focused: lastNode });
        }
      }
    }
  }

  render() {
    let style = {};
    if (this.props.style) {
      style = { ...this.props.style };
    }
    if (!this.props.showBorder) {
      style = { ...style, border: 'none' };
    }
    else if (this.props.borderColor) {
      style = { ...style, border: '1px solid ' + this.props.borderColor };
    }
    if (this.props.height) {
      style = {...style, height: this.props.height };
    }
    if (this.props.width) {
      style = { ...style, width: this.props.width };
    }

    let dataSource = this.state.dataSource;
    let children = [];
    if (dataSource) {
      let _this = this;
      dataSource.forEach(function (node) {
        node.visible = true;
        if (!node.hasOwnProperty('id') || (!node.id)) {
          throw new AnterosError("Foi encontrado um nó da arvore sem um ID. Nó " + node.text);
        }
        children.push(React.createElement(AnterosTreeNode, {
          node: node,
          key: node.id,
          level: 1,
          visible: true,
          onSelectedStatusChanged: _this.nodeSelected,
          onExpandedCollapsedChanged: _this.nodeExpandedCollapsed,
          onFocusedChanged: _this.nodeFocused,
          onNodeDoubleClicked: _this.nodeDoubleClicked,
          onLoadDataSource: _this.loadDataSource,
          getFocused: _this.getFocused,
          addNode: _this.addNode,
          removeNode: _this.removeNode,
          options: _this.props,
          nodes: _this.state.dataSource,
        }));
      });
    }

    return (
      <div tabIndex={-1} className="anteros-treeview" onKeyDown={this.handleKeyDown} style={style}>
        <ul>
          {children}
        </ul>
      </div>
    )
  }
}


AnterosTreeView.propTypes = {
  selectable: PropTypes.bool,
  color: PropTypes.string,
  backColor: PropTypes.string,
  borderColor: PropTypes.string,
  hoverColor: PropTypes.string,
  hoverBackColor: PropTypes.string,
  focusedColor: PropTypes.string,
  focusedBackColor: PropTypes.string,
  selectedColor: PropTypes.string,
  selectedBackColor: PropTypes.string,
  iconColor: PropTypes.string,
  iconBackColor: PropTypes.string,
  enableLinks: PropTypes.bool,
  highlightSelected: PropTypes.bool,
  showBorder: PropTypes.bool,
  showTags: PropTypes.bool,
  nodes: PropTypes.arrayOf(PropTypes.object),
  onDoubleClick: PropTypes.func,
  onClick: PropTypes.func,
  onFocusedNode: PropTypes.func,
  onLoosedFocusNode: PropTypes.func,
  onSelectedNode: PropTypes.func,
  onUnSelectedNode: PropTypes.func,
  onRemovedNode: PropTypes.func,
  onLoadDataSource: PropTypes.func,
  onAddedNode: PropTypes.func,
  onExpandedNode: PropTypes.func,
  onCollapsedNode: PropTypes.func,
  dataSource: PropTypes.array
};

AnterosTreeView.defaultProps = {
  selectable: true,
  color: "#428bca",
  backColor: undefined,
  borderColor: '#cfd8dc',
  hoverColor: 'black',
  hoverBackColor: '#e7f4f9',
  focusedColor: "black",
  focusedBackColor: '#e1e1e1',
  selectedColor: '#000000',
  selectedBackColor: 'auto',
  iconColor: 'black',
  iconBackColor: undefined,
  highlightSelected: true,
  showBorder: true,
  showTags: false,
  nodes: []
};


export class AnterosTreeNode extends React.Component {

  constructor(props) {
    super(props);
    this.state = { node: props.node, expanded: false, selected: false, loading: false };
    this.selected = (props.node.state && props.node.state.hasOwnProperty('selected')) ?
      props.node.state.selected :
      false;
    this.expanded = (props.node.state && props.node.state.hasOwnProperty('expanded')) ?
      props.node.state.expanded :
      false;
    this.expanded = (props.node.state && props.node.state.hasOwnProperty('loading')) ?
      props.node.state.loading :
      false;
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleFocused = this.toggleFocused.bind(this);
    this.doubleClicked = this.doubleClicked.bind(this);
    this.newNodeForm = this.newNodeForm.bind(this);
    this.addNode = this.addNode.bind(this);
    this.removeNode = this.removeNode.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.state.expanded = (nextProps.node.state && nextProps.node.state.hasOwnProperty('expanded')) ?
      nextProps.node.state.expanded :
      false;
    this.state.selected = (nextProps.node.state && nextProps.node.state.hasOwnProperty('selected')) ?
      nextProps.node.state.selected :
      false;
    this.state.loading = (nextProps.node.state && nextProps.node.state.hasOwnProperty('loading')) ?
      nextProps.node.state.loading :
      false;
  }

  toggleExpanded(event) {
    let expanded = !this.state.expanded;
    this.setState({ expanded: expanded });
    this.props.onExpandedCollapsedChanged(this.state.node.id, expanded);
    event.stopPropagation();
  }

  toggleSelected(event) {
    let selected = !this.state.selected;
    this.setState({ selected: selected });
    this.props.onSelectedStatusChanged(this.state.node.id, selected);
    event.stopPropagation();
  }

  toggleFocused(event) {
    this.props.onFocusedChanged(this.state.node.id);
    event.stopPropagation();
  }

  doubleClicked(event) {
    this.props.onNodeDoubleClicked(this.state.node.id, this.state.selected);
    event.stopPropagation();
  }

  newNodeForm(event) {
    this.setState({ addNode: !this.state.addNode });
    event.stopPropagation();
  }

  addNode(event) {
    if (!new RegExp('^[a-zA-Z0-9]+$').test(this.refs.newNodeName.value)) {
      this.refs.newNodeName.setCustomValidity("Incorrect format");
      return false;
    }
    this.setState({ addNode: false });
    this.props.addNode(this.state.node.id, this.refs.newNodeName.value);
    this.setState({ expanded: true });
    event.stopPropagation();
  }

  removeNode(event) {
    this.props.removeNode(this.state.node.id);
    event.stopPropagation();
  }

  render() {

    let node = lodash.clone(this.props.node);
    let options = lodash.clone(this.props.options);
    let style, iconStyle;

    iconStyle = {
      color: options.iconColor,
      backColor: options.iconBackColor
    };

    if (!this.props.visible) {
      style = {
        display: 'none'
      };
    }
    else {
      if (options.highlightSelected && this.state.selected) {
        style = {
          color: options.selectedColor,
          backgroundColor: options.selectedBackColor
        };
      }
      else {
        style = {
          color: node.color || options.color,
          backgroundColor: node.backColor || options.backColor
        };
      }

    }

    let checkSelectedIcon;
    if (options.selectable) {
      if (this.state.selected) {
        checkSelectedIcon = (
          <i style={iconStyle} className="anteros-treeview-checked-icon"
            onClick={this.toggleSelected}> </i>
        )
      } else {
        checkSelectedIcon = (
          <i style={iconStyle} className="anteros-treeview-unchecked-icon"
            onClick={this.toggleSelected}> </i>)
      }
    }

    let expandCollapseIcon;
    if (!this.state.expanded) {
      expandCollapseIcon = (
        <i style={iconStyle} className="anteros-treeview-expand-icon"
          onClick={this.toggleExpanded}> </i>
      )
    }
    else {
      if (this.props.node.state.loading == true) {
        expandCollapseIcon = (
          <i style={iconStyle} className="fa fa-spinner fa-spin">   </i>
        )
      } else {
        expandCollapseIcon = (
          <i style={iconStyle} className="anteros-treeview-collapse-icon"
            onClick={this.toggleExpanded}>   </i>
        )
      }
    }

    let styleFocused;
    let focusedNode = this.props.getFocused();
    if ((focusedNode) && (focusedNode.id == node.id)) {
      styleFocused = {
        color: options.focusedColor,
        backgroundColor: options.focusedBackColor
      };
    }

    let icon;
    if (node.icon) {
      icon = (
        <i style={iconStyle} className={node.icon}></i>
      );
    }

    let children = [];
    if (node.nodes) {
      let _this = this;
      node.nodes.forEach(function (node) {
        node.visible = _this.state.expanded && _this.props.visible;
        children.push(React.createElement(AnterosTreeNode, {
          node: node,
          key: node.id,
          level: _this.props.level + 1,
          visible: _this.state.expanded && _this.props.visible,
          onSelectedStatusChanged: _this.props.onSelectedStatusChanged,
          onExpandedCollapsedChanged: _this.props.onExpandedCollapsedChanged,
          onFocusedChanged: _this.props.onFocusedChanged,
          getFocused: _this.props.getFocused,
          onNodeDoubleClicked: _this.props.onNodeDoubleClicked,
          addNode: _this.props.addNode,
          removeNode: _this.props.removeNode,
          options: options,
        }));
      });
    }


    if (children.length > 0 || !(this.state.node.isleaf)) {
      return (
        <li style={style} onDoubleClick={this.doubleClicked} key={options.id + "_" + node.id}>
          {expandCollapseIcon}
          <span> </span>
          {checkSelectedIcon}
          <span style={styleFocused} className="anteros-treeview-item" onClick={this.toggleFocused}>{icon}<img src={node.image} />{node.text}</span>
          <ul>
            {children}
          </ul>
        </li>
      );
    };


    return (
      <li style={style} key={options.id + "_" + node.id}>
        {checkSelectedIcon}
        <span style={styleFocused} className="anteros-treeview-item" onClick={this.toggleFocused}>{icon}<img src={node.image} />{node.text}</span>
      </li>
    )
  }
}


export default AnterosTreeView;

