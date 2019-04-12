import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { AnterosUtils } from 'anteros-react-core';
import { Link } from 'react-router-dom';
import AnterosScrollbars  from './AnterosScrollbars';

const $ = window.$;

export default class AnterosSidebarContent extends Component {
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillMount() {
    this.updateDimensions();
  }

  shouldComponentUpdate(nextProps) {
    const {
      enableSidebarBackgroundImage,
      selectedSidebarImage,
      isDarkSidenav
    } = this.props;
    if (
      enableSidebarBackgroundImage !== nextProps.enableSidebarBackgroundImage ||
      selectedSidebarImage !== nextProps.selectedSidebarImage ||
      isDarkSidenav !== nextProps.isDarkSidenav
    ) {
      return true;
    } else {
      return false;
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
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

  render() {
    const {
      enableSidebarBackgroundImage,
      selectedSidebarImage,
      isDarkSidenav,
      logoNormal,
      children
    } = this.props;
    let newStyle = {};
    if (enableSidebarBackgroundImage) {
      newStyle = { ...newStyle, background: `url(${selectedSidebarImage})` };
    }
    return (
      <Fragment>
        <div
          className={AnterosUtils.buildClassNames('app-sidebar', {
            'background-none': !enableSidebarBackgroundImage
          })}
          style={newStyle}
        >
          <div className="site-logo">
            <Link to="/" className="logo-normal">
              <img src={logoNormal} alt="site-logo" />
            </Link>
          </div>
          <div
            className={AnterosUtils.buildClassNames('app-sidebar-wrap', {
              'sidebar-overlay-dark': isDarkSidenav,
              'sidebar-overlay-light': !isDarkSidenav
            })}
          >
            <AnterosScrollbars
              className="app-scroll"
              autoHide
              autoHideDuration={100}
              style={{ height: 'calc(100vh - 60px)' }}
            >
              {children}
            </AnterosScrollbars>
          </div>
        </div>
      </Fragment>
    );
  }
}

AnterosSidebarContent.propTypes = {
  enableSidebarBackgroundImage: PropTypes.bool.isRequired,
  selectedSidebarImage: PropTypes.string,
  isDarkSidenav: PropTypes.bool.isRequired,
  collapsedSidebar: PropTypes.bool.isRequired,
  location: PropTypes.string,
  logoNormal: PropTypes.string.isRequired,
  logoMini: PropTypes.string.isRequired
};

AnterosSidebarContent.defaultProps = {
  enableSidebarBackgroundImage: false,
  isDarkSidenav: false,
  collapsedSidebar: false
};
