import React from "react";
import PropTypes from "prop-types";
import {
    HorizontalScrollItem,
    HorizontalScrollContainer,
  } from "react-simple-horizontal-scroller";


class AnterosRibbonMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      mobileCurrentGroup: 0,
    };
  }

  static get defaultProps() {
    return {
      height: "8rem",
      breakpoint: "md",
    };
  }

  handleChange(event) {
    this.setState({ mobileCurrentGroup: event.target.value * 1 });
  }

  render() {
    const children = Array.isArray(this.props.children)
      ? this.props.children
      : [this.props.children];

    return (
      <div className="bg-light">
          <div
            className="ribbon-menu d-flex"
            style={{ height: this.props.height }}
          >
            <div className="row no-gutters w-100">
                <HorizontalScrollContainer>
                    {children.map(item=><HorizontalScrollItem>{item}</HorizontalScrollItem>)}
                </HorizontalScrollContainer>
            </div>
          </div>
      </div>
    );
  }
}

AnterosRibbonMenu.propTypes = {
  height: PropTypes.string,
};

export default AnterosRibbonMenu;
