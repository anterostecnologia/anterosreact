import React from 'react';
import PropTypes from 'prop-types';


const STATUS = {
    INIT: 'init',
    IDLE: 'idle',
    OPENING: 'opening',
    OPEN: 'open',
    CLOSING: 'closing',
    ERROR: 'error',
  };

export default class AnterosFloater extends React.Component { 

  get floaterStyle() {
    const { disableAnimation, component, placement, hideArrow, isPositioned, status, styles } = this.props;
    const {
      arrow: { length },
      floater,
      floaterCentered,
      floaterClosing,
      floaterOpening,
      floaterWithAnimation,
      floaterWithComponent,
    } = styles;
    let element = {};

    if (!hideArrow) {
      if (placement.startsWith('top')) {
        element.padding = `0 0 ${length}px`;
      }
      else if (placement.startsWith('bottom')) {
        element.padding = `${length}px 0 0`;
      }
      else if (placement.startsWith('left')) {
        element.padding = `0 ${length}px 0 0`;
      }
      else if (placement.startsWith('right')) {
        element.padding = `0 0 0 ${length}px`;
      }
    }

    if ([STATUS.OPENING, STATUS.OPEN].includes(status)) {
      element = { ...element, ...floaterOpening };
    }

    if (status === STATUS.CLOSING) {
      element = { ...element, ...floaterClosing };
    }

    if (status === STATUS.OPEN && !disableAnimation && !isPositioned) {
      element = { ...element, ...floaterWithAnimation };
    }

    if (placement === 'center') {
      element = { ...element, ...floaterCentered };
    }

    if (component) {
      element = { ...element, ...floaterWithComponent };
    }

    return {
      ...floater,
      ...element,
    };
  }

  render() {
    const {
      component,
      handleClick: closeFn,
      hideArrow,
      setFloaterRef,
      status,
    } = this.props;

    const output = {};
    const classes = ['__floater'];

    if (component) {
      if (React.isValidElement(component)) {
        output.content = React.cloneElement(component, { closeFn });
      }
      else {
        output.content = component({ closeFn });
      }
    }
    else {
      output.content = <AnterosFloaterContainer {...this.props} />;
    }

    if (status === STATUS.OPEN) {
      classes.push('__floater__open');
    }

    if (!hideArrow) {
      output.arrow = <Arrow {...this.props} />;
    }

    return (
      <div
        ref={setFloaterRef}
        className={classes.join(' ')}
        style={this.floaterStyle}
      >
        <div className="__floater__body">
          {output.content}
          {output.arrow}
        </div>
      </div>
    );
  }
}


AnterosFloater.propTypes = {
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
    ]),
    content: PropTypes.node,
    disableAnimation: PropTypes.bool.isRequired,
    footer: PropTypes.node,
    handleClick: PropTypes.func.isRequired,
    hideArrow: PropTypes.bool.isRequired,
    isPositioned: PropTypes.bool,
    open: PropTypes.bool,
    placement: PropTypes.string.isRequired,
    positionWrapper: PropTypes.bool.isRequired,
    setArrowRef: PropTypes.func.isRequired,
    setFloaterRef: PropTypes.func.isRequired,
    showCloseButton: PropTypes.bool,
    status: PropTypes.string.isRequired,
    styles: PropTypes.object.isRequired,
    title: PropTypes.node,
  };


class Arrow extends React.Component {
  
    get parentStyle() {
      const { placement, styles } = this.props;
      const { length } = styles.arrow;
      const arrow = {
        position: 'absolute',
      };
  
      if (placement.startsWith('top')) {
        arrow.bottom = 0;
        arrow.left = 0;
        arrow.right = 0;
        arrow.height = length;
      }
      else if (placement.startsWith('bottom')) {
        arrow.left = 0;
        arrow.right = 0;
        arrow.top = 0;
        arrow.height = length;
      }
      else if (placement.startsWith('left')) {
        arrow.right = 0;
        arrow.top = 0;
        arrow.bottom = 0;
      }
      else if (placement.startsWith('right')) {
        arrow.left = 0;
        arrow.top = 0;
      }
  
      return arrow;
    }
  
    render() {
      const { placement, setArrowRef, styles } = this.props;
      const { arrow: { color, display, length, position, spread } } = styles;
      const arrowStyles = { display, position };
  
      let points;
      let x = spread;
      let y = length;
  
      if (placement.startsWith('top')) {
        points = `0,0 ${x / 2},${y} ${x},0`;
        arrowStyles.bottom = 0;
      }
      else if (placement.startsWith('bottom')) {
        points = `${x},${y} ${x / 2},0 0,${y}`;
        arrowStyles.top = 0;
      }
      else if (placement.startsWith('left')) {
        y = spread;
        x = length;
        points = `0,0 ${x},${y / 2} 0,${y}`;
        arrowStyles.right = 0;
      }
      else if (placement.startsWith('right')) {
        y = spread;
        x = length;
        points = `${x},${y} ${x},0 0,${y / 2}`;
        arrowStyles.left = 0;
      }
  
      return (
        <div
          className="__floater__arrow"
          style={this.parentStyle}
        >
          <span ref={setArrowRef} style={arrowStyles}>
            <svg
              width={x}
              height={y}
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points={points} fill={color} />
            </svg>
          </span>
        </div>
      );
    }
  }

Arrow.propTypes = {
    placement: PropTypes.string.isRequired,
    setArrowRef: PropTypes.func.isRequired,
    styles: PropTypes.object.isRequired,
};  

const CloseBtn = ({ handleClick, styles }) => {
  const { color, height, width, ...style } = styles;

  return (
    <button aria-label="close" style={style} onClick={handleClick}>
      <svg
        width={`${width}px`}
        height={`${height}px`}
        viewBox="0 0 18 18"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid"
      >
        <g>
          <path
            d="M8.13911129,9.00268191 L0.171521827,17.0258467 C-0.0498027049,17.248715 -0.0498027049,17.6098394 0.171521827,17.8327545 C0.28204354,17.9443526 0.427188206,17.9998706 0.572051765,17.9998706 C0.71714958,17.9998706 0.862013139,17.9443526 0.972581703,17.8327545 L9.0000937,9.74924618 L17.0276057,17.8327545 C17.1384085,17.9443526 17.2832721,17.9998706 17.4281356,17.9998706 C17.5729992,17.9998706 17.718097,17.9443526 17.8286656,17.8327545 C18.0499901,17.6098862 18.0499901,17.2487618 17.8286656,17.0258467 L9.86135722,9.00268191 L17.8340066,0.973848225 C18.0553311,0.750979934 18.0553311,0.389855532 17.8340066,0.16694039 C17.6126821,-0.0556467968 17.254037,-0.0556467968 17.0329467,0.16694039 L9.00042166,8.25611765 L0.967006424,0.167268345 C0.745681892,-0.0553188426 0.387317931,-0.0553188426 0.165993399,0.167268345 C-0.0553311331,0.390136635 -0.0553311331,0.751261038 0.165993399,0.974176179 L8.13920499,9.00268191 L8.13911129,9.00268191 Z"
            fill={color}
          />
        </g>
      </svg>
    </button>
  );
};

CloseBtn.propTypes = {
  handleClick: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};



const AnterosFloaterContainer = ({
  content,
  footer,
  handleClick,
  open,
  positionWrapper,
  showCloseButton,
  title,
  styles,
}) => {
  const output = {
    content: React.isValidElement(content)
      ? content
      : <div className="__floater__content" style={styles.content}>{content}</div>
  };

  if (title) {
    output.title = React.isValidElement(title)
      ? title
      : <div className="__floater__title" style={styles.title}>{title}</div>;
  }

  if (footer) {
    output.footer = React.isValidElement(footer)
      ? footer
      : <div className="__floater__footer" style={styles.footer}>{footer}</div>;
  }

  if (
    (showCloseButton || positionWrapper)
    && !is.boolean(open)
  ) {
    output.close = (
      <CloseBtn
        styles={styles.close}
        handleClick={handleClick}
      />
    );
  }
  return (
    <div className="__floater__container" style={styles.container}>
      {output.close}
      {output.title}
      {output.content}
      {output.footer}
    </div>
  );
};

AnterosFloaterContainer.propTypes = {
  content: PropTypes.node.isRequired,
  footer: PropTypes.node,
  handleClick: PropTypes.func.isRequired,
  open: PropTypes.bool,
  positionWrapper: PropTypes.bool.isRequired,
  showCloseButton: PropTypes.bool.isRequired,
  styles: PropTypes.object.isRequired,
  title: PropTypes.node,
};