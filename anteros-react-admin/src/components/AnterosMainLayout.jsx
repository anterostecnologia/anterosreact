import React, { Component } from "react";
import AnterosScrollbars from "./AnterosScrollbars";
import { AnterosUtils } from "anteros-react-core";
import AnterosSidebarLayout from "./AnterosSidebarLayout";
import {
  AnterosSidebarLoader,
  AnterosHeaderLoader
} from "anteros-react-loaders";
const $ = window.$;

export default class AnterosMainLayout extends Component {
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.renderPage = this.renderPage.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderSidebar = this.renderSidebar.bind(this);
    this.renderHorizontalMenu = this.renderHorizontalMenu.bind(this);
    this.getScrollBarStyle = this.getScrollBarStyle.bind(this);
    this.getSidebarContent = this.getSidebarContent.bind(this);
    this.getPageContent = this.getPageContent.bind(this);
    this.getPageFooter = this.getPageFooter.bind(this);
    this.getPageHeader = this.getPageHeader.bind(this);
    this.getMainMenu = this.getMainMenu.bind(this);

    this.state = {
      loadingHeader: true,
      loadingSidebar: true
    };
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    setTimeout(() => {
      this.setState({ loadingHeader: false, loadingSidebar: false });
    }, 114);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentWillReceiveProps(nextProps) {
    const { windowWidth } = this.state;
    if (nextProps.location !== this.props.location) {
      if (windowWidth <= 1199) {
        this.props.collapsedSidebarAction(false);
      }
    }
  }

  updateDimensions() {
    this.setState({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });
  }

  componentDidUpdate(prevProps) {}

  static get componentName() {
    return "AnterosMainLayout";
  }

  renderPage() {
    return (
      <AnterosScrollbars
        className="app-scroll"
        autoHide
        autoHideDuration={100}
        style={this.getScrollBarStyle()}
      >
        <div className="app-page-content">
          {this.getPageContent()}
          {this.getPageFooter()}
        </div>
      </AnterosScrollbars>
    );
  }

  renderHeader() {
    const { loadingHeader } = this.state;
    if (loadingHeader) {
      return <AnterosHeaderLoader />;
    }
    return this.getPageHeader();
  }

  renderSidebar() {
    const { loadingSidebar } = this.state;
    if (loadingSidebar) {
      return <AnterosSidebarLoader />;
    }
    return this.getSidebarContent();
  }

  renderHorizontalMenu() {
    return this.getMainMenu();
  }

  getMainMenu() {
    let result = null;
    let arrChildren = React.Children.toArray(this.props.children);
    arrChildren.forEach(function(child) {
      if (child.type && child.type.componentName==='AnterosMainMenu') {
        result = child;
      }
    });
    return result;
  }

  getPageContent() {
    let result = [];
    let arrChildren = React.Children.toArray(this.props.children);
    arrChildren.forEach(function(child) {
      if ((child.type && child.type.componentName!=='AnterosSidebarContent') &&
        (child.type && child.type.componentName!=='AnterosMainHeader') &&
        (child.type && child.type.componentName!== 'AnterosMainMenu') &&
        (child.type && child.type.componentName!== 'AnterosMainFooter')
      ) {
        result.push(child);
      }
    });
    return result;
  }

  getPageFooter() {
    let result = null;
    let arrChildren = React.Children.toArray(this.props.children);
    arrChildren.forEach(function(child) {
      if (child.type && child.type.componentName==='AnterosMainFooter') {
        result = child;
      }
    });
    return result;
  }

  getPageHeader() {
    let result = null;
    let arrChildren = React.Children.toArray(this.props.children);
    arrChildren.forEach(function(child) {
      if (child.type && child.type.componentName==='AnterosMainHeader') {
        result = child;
      }
    });
    return result;
  }

  getSidebarContent() {
    let result = null;
    let arrChildren = React.Children.toArray(this.props.children);
    arrChildren.forEach(function(child) {
      if (child.type && child.type.componentName==='AnterosSidebarContent') {
        result = child;
      }
    });
    return result;
  }

  getScrollBarStyle() {
    return {
      height: "calc(100vh - 50px)"
    };
  }

  render() {
    let {
      sidebarOpen,
      onSetOpenSidebar,
      rtlLayout,
      miniSidebar,
      horizontalMenu
    } = this.props;
    let { windowWidth } = this.state;
    let sidebarDocked = !sidebarOpen;
    if (horizontalMenu) {
      sidebarOpen = false;
      sidebarDocked = false;
    }
    return (
      <div className="app">
        <div className="app-main-container">
          <AnterosSidebarLayout
            sidebar={this.renderSidebar()}
            open={windowWidth <= 1199 ? sidebarOpen : false}
            docked={windowWidth > 1199 ? sidebarDocked : false}
            pullRight={rtlLayout}
            onSetOpen={onSetOpenSidebar}
            styles={{ content: { overflowY: "" } }}
            contentClassName={AnterosUtils.buildClassNames({
              "app-container-wrapper": miniSidebar
            })}
          >
            <div className="app-container">
              <div className="app-app-content">
                <div className="app-header">{this.renderHeader()}</div>
                {this.props.horizontalMenu ? this.renderHorizontalMenu() : null}
                <div className="app-page">{this.renderPage()}</div>
              </div>
            </div>
          </AnterosSidebarLayout>
        </div>
      </div>
    );
  }
}
