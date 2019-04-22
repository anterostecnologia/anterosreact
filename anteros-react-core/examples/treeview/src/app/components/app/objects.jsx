import React, { Component } from 'react';
import { render } from 'react-dom';
import AnterosTreeView from '../../../../../../src/treeview/AnterosTreeView';
import '../../../../../../src/treeview/AnterosTreeView.css';
import ObjectInspector from 'react-object-inspector';


var buttonStyle = {
  margin: '10px 10px 10px 0'
};

var data = [
  {
    id: 1,
    text: 'Pasta 1',
    icon: 'fa fa-camera-retro',
    nodes: [
      {
        id: 2,
        text: 'Child 1',
        image: require('../../assets/img/user.png'),
        nodes: [
          {
            id: 3,
            text: 'Grandchild 1',
            image: require('../../assets/img/system.png'),
          },
          {
            id: 4,
            text: 'Grandchild 2',
            image: require('../../assets/img/group.png')
          }
        ]
      },
      {
        id: 5,
        text: 'Child 2',
        image: require('../../assets/img/action.png')
      }
    ]
  },
  {
    id: 6,
    text: 'Parent 2',
    image: require('../../assets/img/action.png')
  },
  {
    id: 7,
    text: 'Parent 3',
    image: require('../../assets/img/action.png'),
  },
  {
    id: 8,
    text: 'Parent 4',
    image: require('../../assets/img/action.png'),
    isleaf: true
  },
  {
    id: 9,
    text: 'Parent 5',
    image: require('../../assets/img/action.png'),
    isleaf: true
  }
];



class ObjectList extends Component {

  constructor(props) {
    super(props);
    this.onSelectedNode = this.onSelectedNode.bind(this);
    this.onUnSelectedNode = this.onUnSelectedNode.bind(this);
    this.onExpandedNode = this.onExpandedNode.bind(this);
    this.onCollapsedNode = this.onCollapsedNode.bind(this);
    this.onChangedData = this.onChangedData.bind(this);
    this.onFocusedNode = this.onFocusedNode.bind(this);
    this.onLoosedFocusNode = this.onLoosedFocusNode.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
    this.onLoadData = this.onLoadData.bind(this);
    this.state = { data: data };
    this.lastId = 9;
  }

  onSelectedNode(data, selectedNodes) {
    this.setState({ selectedNodes: selectedNodes });
  }

  onUnSelectedNode(data, selectedNodes) {
  }

  onExpandedNode(data, selectedNodes) {
  }

  onCollapsedNode(data, nodes) {
  }

  onLoosedFocusNode(node) {
  }

  onFocusedNode(node) {
  }

  onChangedData(data) {
    this.setState({ data: data });
  }

  onButtonClick() {
    alert(this.refs.treeview.getSelectedNodes());
  }

  // changeNodeChildren(nodeId, nodes) {
  //    findNodeById()
  // }

  findNodeById(nodes, id) {
    let _this = this;
    let result;
    if (nodes)
      nodes.forEach(function (node) {
        if (node.nodeId == id) result = node;
        else {
          if (node.nodes) {
            result = _this.findNodeById(node.nodes, id) || result;
          }
        }
      });
    return result;
  }

  onLoadData(node) {
    return new Promise((resolve) => {
      setTimeout(() => {
        var now = new Date().getTime();
        while (new Date().getTime() < now + 1000) { /* do nothing */ }
        let newNodes = [
          {
            id: this.lastId + 1,
            text: 'Child 5',
            image: require('../../assets/img/user.png'),
            nodes: [
              {
                id: this.lastId + 2,
                text: 'Grandchild 5',
                image: require('../../assets/img/system.png'),
              },
              {
                id: this.lastId + 3,
                text: 'Grandchild 7',
                image: require('../../assets/img/group.png')
              }
            ]
          },
          {
            id: this.lastId + 4,
            text: 'Child 4',
            image: require('../../assets/img/action.png')
          }
        ];
        this.lastId = this.lastId + 4;
        resolve(newNodes);
      }, 1000);
    });
  }

  render() {
    return (
      <div>
        <AnterosTreeView
          id="treeview"
          ref="treeview"
          data={this.state.data}
          onChangedData={this.onChangedData}
          onSelectedNode={this.onSelectedNode}
          onUnSelectedNode={this.onUnSelectedNode}
          onExpandedNode={this.onUnSelectedNode}
          onCollapsedNode={this.onUnSelectedNode}
          onLoadData={this.onLoadData}
          color={"#428bca"}
          showBorder={true}
          showTags={false}
          selectable={true} />


        <button
          className="btn btn-default"
          style={buttonStyle}
          onClick={this.onButtonClick}>Selecionados</button>


        {<div >
          <ObjectInspector data={this.state.data} />
        </div>}
      </div>



    );
  }
};



export default ObjectList;

