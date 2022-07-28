import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  AnterosButton,
  AnterosDropdownButton,
  AnterosDropdownMenu,
  AnterosAdvancedDropdown,
  AnterosAdvancedDropdownMenu,
  AnterosAdvancedDropdownToggle,
} from "@anterostecnologia/anteros-react-buttons";
import { AnterosText } from "@anterostecnologia/anteros-react-label";
import AnterosMediaQuery from "./AnterosMediaQuery";
import {
  AnterosToolbar,
  AnterosToolbarGroup,
} from "@anterostecnologia/anteros-react-containers";
import { Link } from "react-router-dom";
import { AnterosInputSearch } from "@anterostecnologia/anteros-react-querybuilder";
import { AnterosImage } from "@anterostecnologia/anteros-react-image";
import AnterosUserMenu from "./AnterosUserMenu";
import { autoBind } from "@anterostecnologia/anteros-react-core";
import CommandPalette from "react-command-palette";
import sublime from "react-command-palette/dist/themes/sublime-theme";
import "react-command-palette/dist/themes/chrome.css";

const wrapperStyle = {
  fontFamily: "arial",
  fontSize: "12px",
  color: "rgb(172, 172, 172)",
  marginBottom: "6px",
  display: "inline-block",
};

const kbdStyle = {
  backgroundColor: "rgb(23, 23, 23)",
  fontSize: "12px",
  color: "#b9b9b9",
  padding: "2px 4px",
  marginRight: "6px",
  borderRadius: "4px",
};

function CommandHeader() {
  const itemStyle = { paddingRight: "32px" };

  return (
    <div style={wrapperStyle}>
      <span style={itemStyle}>Digite um comando</span>
      <span style={itemStyle}>
        <kbd style={kbdStyle}>↑↓</kbd> p/navegar
      </span>
      <span style={itemStyle}>
        <kbd style={kbdStyle}>enter</kbd> p/selecionar
      </span>
      <span style={itemStyle}>
        <kbd style={kbdStyle}>esc</kbd> p/sair
      </span>
    </div>
  );
}

function chromeCommand(suggestion) {
  const { name, highlight = [], category, shortcut, color } = suggestion;

  // handle simple highlight when searching a single key
  if (!Array.isArray(highlight)) {
    return (
      <div className="chrome-suggestion">
        <span style={{backgroundColor:color.backgroundColor, color: color.color}}
         className={`chrome-category`}>{category}</span>
        <span dangerouslySetInnerHTML={{ __html: highlight || name }} />
        <kbd className="chrome-shortcut">{shortcut}</kbd>
      </div>
    );
  }

  return (
    <div className="chrome-suggestion">
      <span style={{backgroundColor:color.backgroundColor, color: color.color}}
        dangerouslySetInnerHTML={{ __html: highlight[1] || category }}
        className={`chrome-category ${category}`}
      />
      <span dangerouslySetInnerHTML={{ __html: highlight[0] || name }} />
      <kbd className="chrome-shortcut">{shortcut}</kbd>
    </div>
  );
}

function isBase64(str) {
  try {
    return btoa(atob(str)) == str;
  } catch (err) {
    return false;
  }
}

export default class AnterosMainHeader extends Component {
  constructor(props) {
    super(props);
    this.toggleScreenFull = this.toggleScreenFull.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.toggleUserDropdownMenu = this.toggleUserDropdownMenu.bind(this);
    this.state = {
      customizer: false,
      userDropdownMenu: false,
      quickLinksDropdownMenu: false,
    };
    autoBind(this);
  }

  toggleSidebar(event) {
    const open = !this.props.sidebarOpen;
    this.props.onSetOpenSidebar(open);
  }

  toggleScreenFull() {
    var body = document.body;
    if ((body.className + " ").indexOf("full-screen") === -1) {
      var b = document.getElementsByTagName("body")[0];
      b.className += "full-screen";
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      var bd = document.getElementsByTagName("body")[0];
      bd.className = bd.className.replace(/\bfull-screen\b/, "");
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  toggleUserDropdownMenu() {
    this.setState({
      ...this.state,
      userDropdownMenu: !this.state.userDropdownMenu,
    });
  }

  toggleQuickLinksDropdownMenu() {
    this.setState({
      ...this.state,
      quickLinksDropdownMenu: !this.state.quickLinksDropdownMenu,
    });
  }

  static get componentName() {
    return "AnterosMainHeader";
  }

  onButtonClick(event, button) {
    let bb = this.btnQuickLinkRef.button.getBoundingClientRect();
    if (this.props.onQuickLinkClick) {
      this.props.onQuickLinkClick(bb.left, bb.top);
    }
  }

  render() {
    let userActions;
    let quickLinks;
    let toolbarEnd;
    let toolbarCenter;
    if (this.props.children) {
      let arrChildren = React.Children.toArray(this.props.children);
      arrChildren.forEach(function (child) {
        if (child.type && child.type.componentName === "UserActions") {
          userActions = child.props.children;
        } else if (child.type && child.type.componentName === "QuickLinks") {
          quickLinks = child.props.children;
        } else if (child.type && child.type.componentName === "ToolbarEnd") {
          toolbarEnd = child.props.children;
        } else if (child.type && child.type.componentName === "ToolbarCenter") {
          toolbarCenter = child.props.children;
        }
      });
    }

    const {
      horizontalMenu,
      logoNormal,
      sidebarOpen,
      onQuickLinkClick,
      commands,
    } = this.props;
    let imgUser = this.props.avatar;
    let isB64 = isBase64(imgUser);
    return (
      <AnterosToolbar>
        <AnterosToolbarGroup justifyContent="start">
          {horizontalMenu || sidebarOpen ? (
            <div className="site-logo">
              <Link to="/" className="logo-normal">
                {typeof logoNormal==='object'?<logoNormal/>:<img src={logoNormal} alt="site-logo" />}
              </Link>
            </div>
          ) : null}
          {horizontalMenu ? null : (
            <AnterosButton
              circle
              medium
              icon="fal fa-bars"
              iconSize="24px"
              color={this.props.toolbarIconColor}
              onButtonClick={this.toggleSidebar}
              hintPosition="bottom"
            />
          )}
          {quickLinks ? (
            <AnterosDropdownButton
              medium
              icon="fab fa-buromobelexperte"
              iconSize="24px"
              backgroundColor={this.props.toolbarIconBackgroundColor}
              color={this.props.toolbarIconColor}
              hintPosition="bottom"
            >
              <AnterosDropdownMenu
                style={{ paddingTop: "0px", border: "1px solid #e0e0e0" }}
                styleHeader={{
                  backgroundColor: this.props.quickLinkHeaderColor,
                  color: this.props.toolbarIconColor,
                }}
                title={"Links rápidos"}
              >
                {quickLinks}
              </AnterosDropdownMenu>
            </AnterosDropdownButton>
          ) : null}

          {onQuickLinkClick ? (
            <AnterosButton
              medium
              ref={(ref) => (this.btnQuickLinkRef = ref)}
              icon="fab fa-buromobelexperte"
              iconSize="24px"
              backgroundColor={this.props.toolbarIconBackgroundColor}
              color={this.props.toolbarIconColor}
              onButtonClick={this.onButtonClick}
              hintPosition="bottom"
            ></AnterosButton>
          ) : null}

          {commands && commands.length > 0 ? (
            <CommandPaletteButton
              toolbarIconColor={this.props.toolbarIconColor}
              toolbarIconBackgroundColor={this.props.toolbarIconBackgroundColor}
              commands={commands}
            />
          ) : null}

          {this.props.showInputSearch ? (
            <AnterosMediaQuery minDeviceWidth={1224}>
              <AnterosInputSearch placeHolder="Procurar" />
            </AnterosMediaQuery>
          ) : null}
        </AnterosToolbarGroup>

        <AnterosToolbarGroup justifyContent="center" colSize="col-sm-2">
          {toolbarCenter}
        </AnterosToolbarGroup>

        <AnterosToolbarGroup justifyContent="end">
          {toolbarEnd}

          <AnterosAdvancedDropdown
            className="user-profile user-menu"
            isOpen={this.state.userDropdownMenu}
            toggle={this.toggleUserDropdownMenu}
          >
            <AnterosAdvancedDropdownToggle caret>
              <AnterosImage
                src={
                  imgUser && isB64 ? "data:image;base64," + imgUser : imgUser
                }
                circle={this.props.avatarWidth === this.props.avatarHeight}
                rounded={this.props.avatarWidth !== this.props.avatarHeight}
                width={this.props.avatarWidth}
                height={this.props.avatarHeight}
              />
              <AnterosText text={this.props.userName} fontSize="12px" />
            </AnterosAdvancedDropdownToggle>
            <AnterosAdvancedDropdownMenu right>
              <AnterosUserMenu
                userName={this.props.userName}
                email={this.props.email}
              >
                {userActions}
              </AnterosUserMenu>
            </AnterosAdvancedDropdownMenu>
          </AnterosAdvancedDropdown>
        </AnterosToolbarGroup>
      </AnterosToolbar>
    );
  }
}

AnterosMainHeader.propTypes = {
  showInputSearch: PropTypes.bool.isRequired,
  toolbarIconColor: PropTypes.any,
};

AnterosMainHeader.defaultPropTypes = {
  showInputSearch: true,
  quickLinkHeaderColor: "blue",
  toolbarIconColor: "white",
};

export class QuickLinks extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  static get componentName() {
    return "QuickLinks";
  }

  render() {
    return null;
  }
}



class CommandPaletteButton extends Component {
  constructor(props){
    super(props);
    this.state = {commandOpen: false};
    autoBind(this);
  }
  onButtonClick(event) {
    this.setState({...this.state, commandOpen: !this.state.commandOpen});
  }

  onRequestClose(){
    this.setState({...this.state, commandOpen: false});
  }

  onAfterOpen(){
    this.setState({...this.state, commandOpen: true});
  }

  render() {
    return (
      <CommandPalette
        alwaysRenderCommands
        closeOnSelect={true}
        highlightFirstSuggestion
        hotKeys="command+shift+p"
        maxDisplayed={10}
        commands={this.props.commands}
        options={{
          keys: [
            'name',
            'category'
          ]
        }}
        placeholder=""
        resetInputOnOpen
        reactModalParentSelector="body"
        shouldReturnFocusAfterClose
        renderCommand={chromeCommand}
        trigger={
          <AnterosButton
            medium
            icon="far fa-terminal"
            iconSize="24px"
            hint="Comandos ⇧⌘P"
            backgroundColor={this.props.toolbarIconBackgroundColor}
            color={this.props.toolbarIconColor}
            hintPosition="bottom"
            onButtonClick={this.onButtonClick}
          ></AnterosButton>
        }
        open={this.state.commandOpen}
        header={<CommandHeader />}
        theme={sublime}
      />
    );
  }
}

export class ButtonQuickLinks extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  static get componentName() {
    return "ButtonQuickLinks";
  }

  render() {
    return null;
  }
}

export class UserActions extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  static get componentName() {
    return "UserActions";
  }

  render() {
    return null;
  }
}

export class ToolbarEnd extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  static get componentName() {
    return "ToolbarEnd";
  }

  render() {
    return null;
  }
}

export class ToolbarCenter extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  static get componentName() {
    return "ToolbarCenter";
  }

  render() {
    return null;
  }
}
