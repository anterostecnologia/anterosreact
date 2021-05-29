import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import React from "react";

class Browser {

    // Check if not running on server
    static isBrowser () {
      return typeof window !== 'undefined';
    }
  
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    static isOpera () {
      return Browser.isBrowser() && (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
    }
  
    // Firefox 1.0+
    static isFirefox () {
      return Browser.isBrowser() && (typeof InstallTrigger !== 'undefined')
    }
  
    // Safari 3.0+
    static isSafari () {
  
      if (!Browser.isBrowser()) {
        return false;
      }
  
      return (/^((?!chrome|android).)*safari/i.test(navigator.userAgent))
    }
  
    // Internet Explorer 6-11
    static isIE () {
      /*@cc_on!@*/
      return Browser.isBrowser() && !!document.documentMode
    }
  
    // Edge 20+
    static isEdge () {
      return Browser.isBrowser() && (!Browser.isIE() && !!window.StyleMedia)
    }
  
    // Chrome 1+
    static isChrome () {
      return Browser.isBrowser() && (!!window.chrome && !!window.chrome.webstore)
    }
  
    // Blink engine detection
    static isBlink () {
      return Browser.isBrowser() && ((Browser.isChrome() || Browser.isOpera()) && !!window.CSS)
    }
  
  
    static getUserAgent () {
      return typeof navigator === 'undefined' ? '' : navigator.userAgent
    }
  
    static isAndroid () {
      return Browser.isBrowser() && Browser.getUserAgent().match(/Android/i)
    }
  
    static isBlackBerry () {
      return Browser.isBrowser() && Browser.getUserAgent().match(/BlackBerry/i)
    }
  
    static isIOS () {
      return Browser.isBrowser() && Browser.getUserAgent().match(/iPhone|iPad|iPod/i)
    }
  
    static isOpera () {
      return Browser.isBrowser() && Browser.getUserAgent().match(/Opera Mini/i)
    }
  
    static isWindows () {
      return Browser.isBrowser() && Browser.isWindowsDesktop() || Browser.isWindowsMobile()
    }
  
    static isWindowsMobile () {
      return Browser.isBrowser() && Browser.getUserAgent().match(/IEMobile/i)
    }
  
    static isWindowsDesktop () {
      return Browser.isBrowser() && Browser.getUserAgent().match(/WPDesktop/i)
    }
  
    static isMobile () {
  
      return Browser.isBrowser() &&
        (Browser.isWindowsMobile() ||
        Browser.isBlackBerry() ||
        Browser.isAndroid() ||
        Browser.isIOS())
    }
  }
  
  /////////////////////////////////////////////////////////
  // Returns only the props that start with "data-"
  /////////////////////////////////////////////////////////
  const getDataProps = (props) => {
    return Object.keys(props).reduce((prev, key) => {
      if (key.substr(0, 5) === 'data-') {
          return {
            ...prev,
            [key]: props[key]
          }
      }
      return prev
    }, {})
  }
  
class AnterosFlexContainer extends React.Component {
  /////////////////////////////////////////////////////////
  // orientação: Orientação do contêiner de layout
  // os valores válidos são ['horizontal', 'vertical']
  // maxRecDepth: profundidade de recursão máxima para resolver o flex inicial
  // de elementos de layout com base em valores fornecidos pelo usuário
  // className: nomes de classes separados por espaço para aplicar estilos personalizados
  // para o contêiner de layout
  // estilo: permite passar o estilo embutido para o contêiner
  /////////////////////////////////////////////////////////
  static propTypes = {
    windowResizeAware: PropTypes.bool,
    orientation: PropTypes.oneOf(["horizontal", "vertical"]),
    maxRecDepth: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    orientation: "horizontal",
    windowResizeAware: false,
    maxRecDepth: 100,
    className: "",
    style: {},
  };

  constructor(props) {
    super(props);
    this.events = new AnterosFlexEvents();
    this.children = [];
    this.state = {
      flexData: [],
    };
    this.ref = React.createRef();
  }
  componentDidMount() {
    const flexData = this.computeFlexData();

    const { windowResizeAware } = this.props;

    if (windowResizeAware) {
      window.addEventListener("resize", this.onWindowResize);
    }

    this.setState({
      windowResizeAware,
      flexData,
    });

    this.events.on("element.size", this.onElementSize);

    this.events.on("startResize", this.onStartResize);

    this.events.on("stopResize", this.onStopResize);

    this.events.on("resize", this.onResize);
  }

  componentWillUnmount() {
    this.events.off();

    window.removeEventListener("resize", this.onWindowResize);
  }

  getValidChildren(props = this.props) {
    return this.toArray(props.children).filter((child) => {
      return !!child;
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const children = this.getValidChildren(this.props);

    if (
      children.length !== this.state.flexData.length ||
      this.props.orientation !== this.props.orientation ||
      this.flexHasChanged(this.props)
    ) {
      const flexData = this.computeFlexData(children, this.props);

      this.setState({
        flexData,
      });
    }

    if (this.props.windowResizeAware !== this.state.windowResizeAware) {
      !this.props.windowResizeAware
        ? window.removeEventListener("resize", this.onWindowResize)
        : window.addEventListener("resize", this.onWindowResize);
      this.setState({
        windowResizeAware: this.props.windowResizeAware,
      });
    }
  }

  // UNSAFE_componentWillReceiveProps(props) {

  /////////////////////////////////////////////////////////
  // tenta preservar a flexibilidade atual no redimensionamento
  // da janela
  /////////////////////////////////////////////////////////
  onWindowResize = () => {
    this.setState({
      flexData: this.computeFlexData(),
    });
  };

  /////////////////////////////////////////////////////////
  // Verifique se o flex mudou: isso permite atualizar o
  // componente quando diferente flex é passado como propriedade
  // para um ou vários filhos
  /////////////////////////////////////////////////////////
  flexHasChanged(props) {
    const nextChildrenFlex = this.getValidChildren(props).map((child) => {
      return child.props.flex || 0;
    });

    const childrenFlex = this.getValidChildren().map((child) => {
      return child.props.flex || 0;
    });

    return !childrenFlex.every((flex, idx) => {
      return flex === nextChildrenFlex[idx];
    });
  }

  /////////////////////////////////////////////////////////
  // Returns size of a AnterosFlexElement
  /////////////////////////////////////////////////////////
  getSize(element) {
    const domElement = element.ref.current;

    switch (this.props.orientation) {
      case "horizontal":
        return domElement.offsetHeight;
      case "vertical":
      default:
        return domElement.offsetWidth;
    }
  }

  /////////////////////////////////////////////////////////
  // Computes offset from pointer position
  /////////////////////////////////////////////////////////
  getOffset(pos, domElement) {
    const { top, bottom, left, right } = domElement.getBoundingClientRect();

    switch (this.props.orientation) {
      case "horizontal": {
        const offset = pos.clientY - this.previousPos;
        if (offset > 0) {
          if (pos.clientY >= top) {
            return offset;
          }
        } else {
          if (pos.clientY <= bottom) {
            return offset;
          }
        }
        break;
      }
      case "vertical":
      default:
        {
          const offset = pos.clientX - this.previousPos;
          if (offset > 0) {
            if (pos.clientX > left) {
              return offset;
            }
          } else {
            if (pos.clientX < right) {
              return offset;
            }
          }
        }
        break;
    }
    return 0;
  }

  /////////////////////////////////////////////////////////
  // Handles startResize event
  /////////////////////////////////////////////////////////
  onStartResize = (data) => {
    const pos = data.event.changedTouches
      ? data.event.changedTouches[0]
      : data.event;

    switch (this.props.orientation) {
      case "horizontal":
        document.body.classList.add("reflex-row-resize");
        this.previousPos = pos.clientY;
        break;

      case "vertical":
      default:
        document.body.classList.add("reflex-col-resize");
        this.previousPos = pos.clientX;
        break;
    }

    this.elements = [
      this.children[data.index - 1],
      this.children[data.index + 1],
    ];

    this.emitElementsEvent(this.elements, "onStartResize");
  };

  /////////////////////////////////////////////////////////
  // Handles splitter resize event
  /////////////////////////////////////////////////////////
  onResize = (data) => {
    const pos = data.event.changedTouches
      ? data.event.changedTouches[0]
      : data.event;

    const offset = this.getOffset(pos, data.domElement);

    switch (this.props.orientation) {
      case "horizontal":
        this.previousPos = pos.clientY;
        break;
      case "vertical":
      default:
        this.previousPos = pos.clientX;
        break;
    }

    if (offset) {
      const availableOffset = this.computeAvailableOffset(data.index, offset);

      if (availableOffset) {
        this.elements = this.dispatchOffset(data.index, availableOffset);

        this.adjustFlex(this.elements);

        this.setState(
          {
            resizing: true,
          },
          () => {
            this.emitElementsEvent(this.elements, "onResize");
          }
        );
      }
    }
  };

  /////////////////////////////////////////////////////////
  // Handles stopResize event
  /////////////////////////////////////////////////////////
  onStopResize = (data) => {
    document.body.classList.remove("reflex-row-resize");
    document.body.classList.remove("reflex-col-resize");

    const resizedRefs = this.elements.map((element) => {
      return element.ref;
    });

    const elements = this.children.filter((child) => {
      return !AnterosFlexSplitter.isA(child) && resizedRefs.includes(child.ref);
    });

    this.emitElementsEvent(elements, "onStopResize");

    this.setState({
      resizing: false,
    });
  };

  /////////////////////////////////////////////////////////
  // Handles element size modified event
  /////////////////////////////////////////////////////////
  onElementSize = (data) => {
    return new Promise((resolve) => {
      try {
        const idx = data.index;

        const size = this.getSize(this.children[idx]);

        const offset = data.size - size;

        const dir = data.direction;

        const splitterIdx = idx + dir;

        const availableOffset = this.computeAvailableOffset(
          splitterIdx,
          dir * offset
        );

        this.elements = null;

        if (availableOffset) {
          this.elements = this.dispatchOffset(splitterIdx, availableOffset);

          this.adjustFlex(this.elements);
        }

        this.setState(this.state, () => {
          this.emitElementsEvent(this.elements, "onResize");
          resolve();
        });
      } catch (ex) {
        console.log(ex);
      }
    });
  };

  /////////////////////////////////////////////////////////
  // Adjusts flex after a dispatch to make sure
  // total flex of modified elements remains the same
  /////////////////////////////////////////////////////////
  adjustFlex(elements) {
    const diffFlex = elements.reduce((sum, element) => {
      const idx = element.props.index;

      const previousFlex = element.props.flex;

      const nextFlex = this.state.flexData[idx].flex;

      return sum + (previousFlex - nextFlex) / elements.length;
    }, 0);

    elements.forEach((element) => {
      this.state.flexData[element.props.index].flex += diffFlex;
    });
  }

  /////////////////////////////////////////////////////////
  // Returns available offset for a given raw offset value
  // This checks how much the panes can be stretched and
  // shrink, then returns the min
  /////////////////////////////////////////////////////////
  computeAvailableOffset(idx, offset) {
    const stretch = this.computeAvailableStretch(idx, offset);

    const shrink = this.computeAvailableShrink(idx, offset);

    const availableOffset = Math.min(stretch, shrink) * Math.sign(offset);

    return availableOffset;
  }

  /////////////////////////////////////////////////////////
  // Returns true if the next splitter than the one at idx
  // can propagate the drag. This can happen if that
  // next element is actually a splitter and it has
  // propagate=true property set
  /////////////////////////////////////////////////////////
  checkPropagate(idx, direction) {
    if (direction > 0) {
      if (idx < this.children.length - 2) {
        const child = this.children[idx + 2];

        const typeCheck = AnterosFlexSplitter.isA(child);

        return typeCheck && child.props.propagate;
      }
    } else {
      if (idx > 2) {
        const child = this.children[idx - 2];

        const typeCheck = AnterosFlexSplitter.isA(child);

        return typeCheck && child.props.propagate;
      }
    }

    return false;
  }

  /////////////////////////////////////////////////////////
  // Recursively computes available stretch at splitter
  // idx for given raw offset
  /////////////////////////////////////////////////////////
  computeAvailableStretch(idx, offset) {
    const childIdx = offset < 0 ? idx + 1 : idx - 1;

    const child = this.children[childIdx];

    const size = this.getSize(child);

    const maxSize = child.props.maxSize;

    const availableStretch = maxSize - size;

    if (availableStretch < Math.abs(offset)) {
      if (this.checkPropagate(idx, -1 * offset)) {
        const nextOffset =
          Math.sign(offset) * (Math.abs(offset) - availableStretch);

        return (
          availableStretch +
          this.computeAvailableStretch(
            offset < 0 ? idx + 2 : idx - 2,
            nextOffset
          )
        );
      }
    }

    return Math.min(availableStretch, Math.abs(offset));
  }

  /////////////////////////////////////////////////////////
  // Recursively computes available shrink at splitter
  // idx for given raw offset
  /////////////////////////////////////////////////////////
  computeAvailableShrink(idx, offset) {
    const childIdx = offset > 0 ? idx + 1 : idx - 1;

    const child = this.children[childIdx];

    const size = this.getSize(child);

    const minSize = Math.max(child.props.minSize, 0);

    const availableShrink = size - minSize;

    if (availableShrink < Math.abs(offset)) {
      if (this.checkPropagate(idx, offset)) {
        const nextOffset =
          Math.sign(offset) * (Math.abs(offset) - availableShrink);

        return (
          availableShrink +
          this.computeAvailableShrink(
            offset > 0 ? idx + 2 : idx - 2,
            nextOffset
          )
        );
      }
    }

    return Math.min(availableShrink, Math.abs(offset));
  }

  /////////////////////////////////////////////////////////
  // Returns flex value for unit pixel
  /////////////////////////////////////////////////////////
  computePixelFlex(orientation = this.props.orientation) {
    if (!this.ref.current) {
      console.warn("Unable to locate AnterosFlexContainer dom node");
      return 0.0;
    }

    switch (orientation) {
      case "horizontal":
        if (this.ref.current.offsetHeight === 0.0) {
          console.warn(
            "Found AnterosFlexContainer with height=0, " +
              "this will cause invalid behavior..."
          );
          console.warn(this.ref.current);
          return 0.0;
        }

        return 1.0 / this.ref.current.offsetHeight;

      case "vertical":
      default:
        if (this.ref.current.offsetWidth === 0.0) {
          console.warn(
            "Found AnterosFlexContainer with width=0, " +
              "this will cause invalid behavior..."
          );
          console.warn(this.ref.current);
          return 0.0;
        }

        return 1.0 / this.ref.current.offsetWidth;
    }
  }

  /////////////////////////////////////////////////////////
  // Adds offset to a given AnterosFlexElement
  /////////////////////////////////////////////////////////
  addOffset(element, offset) {
    const size = this.getSize(element);

    const idx = element.props.index;

    const newSize = Math.max(size + offset, 0);

    const currentFlex = this.state.flexData[idx].flex;

    const newFlex =
      currentFlex > 0
        ? (currentFlex * newSize) / size
        : this.computePixelFlex() * newSize;

    this.state.flexData[idx].flex =
      !isFinite(newFlex) || isNaN(newFlex) ? 0 : newFlex;
  }

  /////////////////////////////////////////////////////////
  // Recursively dispatches stretch offset across
  // children elements starting at splitter idx
  /////////////////////////////////////////////////////////
  dispatchStretch(idx, offset) {
    const childIdx = offset < 0 ? idx + 1 : idx - 1;

    if (childIdx < 0 || childIdx > this.children.length - 1) {
      return [];
    }

    const child = this.children[childIdx];

    const size = this.getSize(child);

    const newSize = Math.min(child.props.maxSize, size + Math.abs(offset));

    const dispatchedStretch = newSize - size;

    this.addOffset(child, dispatchedStretch);

    if (dispatchedStretch < Math.abs(offset)) {
      const nextIdx = idx - Math.sign(offset) * 2;

      const nextOffset =
        Math.sign(offset) * (Math.abs(offset) - dispatchedStretch);

      return [child, ...this.dispatchStretch(nextIdx, nextOffset)];
    }

    return [child];
  }

  /////////////////////////////////////////////////////////
  // Recursively dispatches shrink offset across
  // children elements starting at splitter idx
  /////////////////////////////////////////////////////////
  dispatchShrink(idx, offset) {
    const childIdx = offset > 0 ? idx + 1 : idx - 1;

    if (childIdx < 0 || childIdx > this.children.length - 1) {
      return [];
    }

    const child = this.children[childIdx];

    const size = this.getSize(child);

    const newSize = Math.max(child.props.minSize, size - Math.abs(offset));

    const dispatchedShrink = newSize - size;

    this.addOffset(child, dispatchedShrink);

    if (Math.abs(dispatchedShrink) < Math.abs(offset)) {
      const nextIdx = idx + Math.sign(offset) * 2;

      const nextOffset =
        Math.sign(offset) * (Math.abs(offset) + dispatchedShrink);

      return [child, ...this.dispatchShrink(nextIdx, nextOffset)];
    }

    return [child];
  }

  /////////////////////////////////////////////////////////
  // Dispatch offset at splitter idx
  /////////////////////////////////////////////////////////
  dispatchOffset(idx, offset) {
    return [
      ...this.dispatchStretch(idx, offset),
      ...this.dispatchShrink(idx, offset),
    ];
  }

  /////////////////////////////////////////////////////////
  // Emits given if event for each given element
  // if present in the component props
  /////////////////////////////////////////////////////////
  emitElementsEvent(elements, event) {
    this.toArray(elements).forEach((component) => {
      if (component.props[event]) {
        component.props[event]({
          domElement: component.ref.current,
          component,
        });
      }
    });
  }

  /////////////////////////////////////////////////////////
  // Computes initial flex data based on provided flex
  // properties. By default each AnterosFlexElement gets
  // evenly arranged within its container
  /////////////////////////////////////////////////////////
  computeFlexData(children = this.getValidChildren(), props = this.props) {
    const pixelFlex = this.computePixelFlex(props.orientation);

    const computeFreeFlex = (flexData) => {
      return flexData.reduce((sum, entry) => {
        if (!AnterosFlexSplitter.isA(entry) && entry.constrained) {
          return sum - entry.flex;
        }
        return sum;
      }, 1.0);
    };

    const computeFreeElements = (flexData) => {
      return flexData.reduce((sum, entry) => {
        if (!AnterosFlexSplitter.isA(entry) && !entry.constrained) {
          return sum + 1;
        }
        return sum;
      }, 0.0);
    };

    const flexDataInit = children.map((child) => {
      const props = child.props;
      return {
        maxFlex: (props.maxSize || Number.MAX_VALUE) * pixelFlex,
        sizeFlex: (props.size || Number.MAX_VALUE) * pixelFlex,
        minFlex: (props.minSize || 1) * pixelFlex,
        constrained: props.flex !== undefined,
        flex: props.flex || 0,
        type: child.type,
      };
    });

    const computeFlexDataRec = (flexDataIn, depth = 0) => {
      let hasContrain = false;

      const freeElements = computeFreeElements(flexDataIn);

      const freeFlex = computeFreeFlex(flexDataIn);

      const flexDataOut = flexDataIn.map((entry) => {
        if (AnterosFlexSplitter.isA(entry)) {
          return entry;
        }

        const proposedFlex = !entry.constrained
          ? freeFlex / freeElements
          : entry.flex;

        const constrainedFlex = Math.min(
          entry.sizeFlex,
          Math.min(entry.maxFlex, Math.max(entry.minFlex, proposedFlex))
        );

        const constrained =
          entry.constrained || constrainedFlex !== proposedFlex;

        hasContrain = hasContrain || constrained;

        return {
          ...entry,
          flex: constrainedFlex,
          constrained,
        };
      });

      return hasContrain && depth < this.props.maxRecDepth
        ? computeFlexDataRec(flexDataOut, depth + 1)
        : flexDataOut;
    };

    const flexData = computeFlexDataRec(flexDataInit);

    return flexData.map((entry) => {
      return {
        flex: !AnterosFlexSplitter.isA(entry) ? entry.flex : 0.0,
        ref: React.createRef(),
      };
    });
  }

  /////////////////////////////////////////////////////////
  // Utility method to ensure given argument is
  // returned as an array
  /////////////////////////////////////////////////////////
  toArray(obj) {
    return obj ? (Array.isArray(obj) ? obj : [obj]) : [];
  }

  /////////////////////////////////////////////////////////
  // Render container. This will clone all original child
  // components in order to pass some internal properties
  // used to handle resizing logic
  /////////////////////////////////////////////////////////
  render() {
    const className = [
      this.state.resizing ? "reflex-resizing" : "",
      ...this.props.className.split(" "),
      this.props.orientation,
      "reflex-container",
    ]
      .join(" ")
      .trim();

    this.children = React.Children.map(
      this.getValidChildren(),
      (child, index) => {
        if (index > this.state.flexData.length - 1) {
          return <div />;
        }

        const flexData = this.state.flexData[index];

        const newProps = {
          ...child.props,
          maxSize: child.props.maxSize || Number.MAX_VALUE,
          orientation: this.props.orientation,
          minSize: child.props.minSize || 1,
          events: this.events,
          flex: flexData.flex,
          ref: flexData.ref,
          index,
        };

        return React.cloneElement(child, newProps);
      }
    );

    return (
      <div
        {...getDataProps(this.props)}
        style={this.props.style}
        className={className}
        ref={this.ref}
      >
        {this.children}
      </div>
    );
  }
}

class AnterosSizeAwareFlexElement extends React.Component {
  constructor(props) {
    super(props);
    this.setDimensions = throttle((dimensions) => {
      this.setState(dimensions);
    }, this.props.propagateDimensionsRate / 1000);

    this.state = {
      height: "100%",
      width: "100%",
    };
  }

  onResize = (rect) => {
    const { resizeHeight, resizeWidth } = this.props;
    const height = Math.floor(rect.bounds.height);
    const width = Math.floor(rect.bounds.width);
    this.setDimensions({
      ...(resizeHeight && { height }),
      ...(resizeWidth && { width }),
    });
  };

  renderChildren() {
    const { propagateDimensions } = this.props;

    return React.Children.map(this.props.children, (child) => {
      if (this.props.withHandle || AnterosFlexHandle.isA(child)) {
        return React.cloneElement(child, {
          dimensions: propagateDimensions && this.state,
          ...child.props,
          index: this.props.index - 1,
          events: this.props.events,
        });
      }

      if (propagateDimensions) {
        return React.cloneElement(child, {
          ...child.props,
          dimensions: this.state,
        });
      }

      return child;
    });
  }

  render() {
    return (
      <Measure bounds onResize={this.onResize}>
        {({ measureRef }) => {
          return (
            <div ref={measureRef} className="reflex-size-aware">
              <div style={this.state}>{this.renderChildren()}</div>
            </div>
          );
        }}
      </Measure>
    );
  }
}

class AnterosFlexElementBase extends React.Component {
  static propTypes = {
    renderOnResizeRate: PropTypes.number,
    propagateDimensions: PropTypes.bool,
    resizeHeight: PropTypes.bool,
    resizeWidth: PropTypes.bool,
    className: PropTypes.string,
    size: PropTypes.number,
  };

  static defaultProps = {
    propagateDimensionsRate: 100,
    propagateDimensions: false,
    resizeHeight: true,
    resizeWidth: true,
    direction: [1],
    className: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      size: props.size,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.size !== prevState.size) {
      return {
        ...prevState,
        size: nextProps.size,
      };
    }
    return null;
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.size !== this.state.size) {
      const directions = this.toArray(this.props.direction);

      for (let direction of directions) {
        await this.props.events.emit("element.size", {
          index: this.props.index,
          size: this.props.size,
          direction,
        });
      }
    }
  }

  toArray(obj) {
    return obj ? (Array.isArray(obj) ? obj : [obj]) : [];
  }

  renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      if (this.props.withHandle || AnterosFlexHandle.isA(child)) {
        return React.cloneElement(child, {
          ...child.props,
          index: this.props.index - 1,
          events: this.props.events,
        });
      }

      return child;
    });
  }

  render() {
    const className = [
      ...this.props.className.split(" "),
      this.props.orientation,
      "reflex-element",
    ]
      .join(" ")
      .trim();

    const style = {
      ...this.props.style,
      flexGrow: this.props.flex,
      flexShrink: 1,
      flexBasis: "0%",
    };

    return (
      <div
        {...getDataProps(this.props)}
        ref={this.props.innerRef}
        className={className}
        style={style}
      >
        {this.props.propagateDimensions ? (
          <AnterosSizeAwareFlexElement {...this.props} />
        ) : (
          this.renderChildren()
        )}
      </div>
    );
  }
}

///////////////////////////////////////////////////////////
// AnterosFlexEvents
///////////////////////////////////////////////////////////
class AnterosFlexEvents {
  constructor() {
    this._events = {};
  }

  /////////////////////////////////////////////////////////
  // Supports multiple events space-separated
  /////////////////////////////////////////////////////////
  on(events, fct) {
    events.split(" ").forEach((event) => {
      this._events[event] = this._events[event] || [];
      this._events[event].push(fct);
    });

    return this;
  }

  /////////////////////////////////////////////////////////
  // Supports multiple events space-separated
  /////////////////////////////////////////////////////////
  off(events, fct) {
    if (events == undefined) {
      this._events = {};
      return;
    }

    events.split(" ").forEach((event) => {
      if (event in this._events === false) return;

      if (fct) {
        this._events[event].splice(this._events[event].indexOf(fct), 1);
      } else {
        this._events[event] = [];
      }
    });

    return this;
  }

  emit(event /* , args... */) {
    if (this._events[event] === undefined) return;

    var tmpArray = this._events[event].slice();

    for (var i = 0; i < tmpArray.length; ++i) {
      var result = tmpArray[i].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );

      if (result !== undefined) {
        return result;
      }
    }

    return undefined;
  }
}

class AnterosFlexHandle extends React.Component {
  ref = React.createRef();

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    onStartResize: PropTypes.func,
    onStopResize: PropTypes.func,
    className: PropTypes.string,
    propagate: PropTypes.bool,
    onResize: PropTypes.func,
    style: PropTypes.object,
  };

  static defaultProps = {
    document: typeof document === "undefined" ? null : document,
    onStartResize: null,
    onStopResize: null,
    propagate: false,
    onResize: null,
    className: "",
    style: {},
  };

  static isA(element) {
    if (!element) {
      return false;
    }
    //https://github.com/leefsmp/Re-Flex/issues/49
    return process.env.NODE_ENV === "development"
      ? element.type === (<AnterosFlexHandle />).type
      : element.type === AnterosFlexHandle;
  }

  constructor(props) {
    super(props);

    this.state = {
      active: false,
    };

    this.document = props.document;
  }

  componentDidMount() {
    if (!this.document) {
      return;
    }

    this.document.addEventListener("touchend", this.onMouseUp);

    this.document.addEventListener("mouseup", this.onMouseUp);

    this.document.addEventListener("mousemove", this.onMouseMove, {
      passive: false,
    });

    this.document.addEventListener("touchmove", this.onMouseMove, {
      passive: false,
    });
  }

  componentWillUnmount() {
    if (!this.document) {
      return;
    }

    this.document.removeEventListener("mouseup", this.onMouseUp);

    this.document.removeEventListener("touchend", this.onMouseUp);

    this.document.removeEventListener("mousemove", this.onMouseMove);

    this.document.removeEventListener("touchmove", this.onMouseMove);

    if (this.state.active) {
      this.props.events.emit("stopResize", {
        index: this.props.index,
        event: null,
      });
    }
  }

  onMouseMove = (event) => {
    if (this.state.active) {
      const domElement = this.ref.current;

      this.props.events.emit("resize", {
        index: this.props.index,
        domElement,
        event,
      });

      if (this.props.onResize) {
        this.props.onResize({
          component: this,
          domElement,
        });
      }

      event.stopPropagation();
      event.preventDefault();
    }
  };

  onMouseDown = (event) => {
    this.setState({
      active: true,
    });

    if (this.props.onStartResize) {
      // cancels resize from controller
      // if needed by returning true
      // to onStartResize
      if (
        this.props.onStartResize({
          domElement: this.ref.current,
          component: this,
        })
      ) {
        return;
      }
    }

    this.props.events.emit("startResize", {
      index: this.props.index,
      event,
    });
  };

  onMouseUp = (event) => {
    if (this.state.active) {
      this.setState({
        active: false,
      });

      if (this.props.onStopResize) {
        this.props.onStopResize({
          domElement: this.ref.current,
          component: this,
        });
      }

      this.props.events.emit("stopResize", {
        index: this.props.index,
        event,
      });
    }
  };

  render() {
    const className = [
      ...this.props.className.split(" "),
      this.state.active ? "active" : "",
      "reflex-handle",
    ]
      .join(" ")
      .trim();

    return (
      <div
        {...getDataProps(this.props)}
        onTouchStart={this.onMouseDown}
        onMouseDown={this.onMouseDown}
        style={this.props.style}
        className={className}
        id={this.props.id}
        ref={this.ref}
      >
        {this.props.children}
      </div>
    );
  }
}
class AnterosFlexSplitter extends React.Component {
  ref = React.createRef();

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    onStartResize: PropTypes.func,
    onStopResize: PropTypes.func,
    className: PropTypes.string,
    propagate: PropTypes.bool,
    onResize: PropTypes.func,
    style: PropTypes.object,
  };

  static defaultProps = {
    document: typeof document !== "undefined" ? document : null,
    onStartResize: null,
    onStopResize: null,
    propagate: false,
    onResize: null,
    className: "",
    style: {},
  };

  /////////////////////////////////////////////////////////
  // Determines if element is a splitter
  // or wraps a splitter
  /////////////////////////////////////////////////////////
  static isA(element) {
    if (!element) {
      return false;
    }
    //https://github.com/leefsmp/Re-Flex/issues/49
    return process.env.NODE_ENV === "development"
      ? element.type === (<AnterosFlexSplitter />).type
      : element.type === AnterosFlexSplitter;
  }

  constructor(props) {
    super(props);

    this.state = {
      active: false,
    };

    this.document = props.document;
  }

  componentDidMount() {
    if (!this.document) {
      return;
    }

    this.document.addEventListener("touchend", this.onMouseUp);

    this.document.addEventListener("mouseup", this.onMouseUp);

    this.document.addEventListener("mousemove", this.onMouseMove, {
      passive: false,
    });

    this.document.addEventListener("touchmove", this.onMouseMove, {
      passive: false,
    });
  }

  componentWillUnmount() {
    if (!this.document) {
      return;
    }

    this.document.removeEventListener("mouseup", this.onMouseUp);

    this.document.removeEventListener("touchend", this.onMouseUp);

    this.document.removeEventListener("mousemove", this.onMouseMove);

    this.document.removeEventListener("touchmove", this.onMouseMove);

    if (this.state.active) {
      this.props.events.emit("stopResize", {
        index: this.props.index,
        event: null,
      });
    }
  }

  onMouseMove = (event) => {
    if (this.state.active) {
      const domElement = this.ref.current;

      this.props.events.emit("resize", {
        index: this.props.index,
        domElement,
        event,
      });

      if (this.props.onResize) {
        this.props.onResize({
          component: this,
          domElement,
        });
      }

      event.stopPropagation();
      event.preventDefault();
    }
  };

  onMouseDown = (event) => {
    this.setState({
      active: true,
    });

    if (this.props.onStartResize) {
      // cancels resize from controller
      // if needed by returning true
      // to onStartResize
      if (
        this.props.onStartResize({
          domElement: this.ref.current,
          component: this,
        })
      ) {
        return;
      }
    }

    this.props.events.emit("startResize", {
      index: this.props.index,
      event,
    });
  };

  onMouseUp = (event) => {
    if (this.state.active) {
      this.setState({
        active: false,
      });

      if (this.props.onStopResize) {
        this.props.onStopResize({
          domElement: this.ref.current,
          component: this,
        });
      }

      this.props.events.emit("stopResize", {
        index: this.props.index,
        event,
      });
    }
  };

  render() {
    const className = [
      Browser.isMobile() ? "reflex-thin" : "",
      ...this.props.className.split(" "),
      this.state.active ? "active" : "",
      "reflex-splitter",
    ]
      .join(" ")
      .trim();

    return (
      <div
        {...getDataProps(this.props)}
        onTouchStart={this.onMouseDown}
        onMouseDown={this.onMouseDown}
        style={this.props.style}
        className={className}
        id={this.props.id}
        ref={this.ref}
      >
        {this.props.children}
      </div>
    );
  }
}

const AnterosFlexElement = React.forwardRef((props, ref) => {
  return <AnterosFlexElementBase innerRef={ref} {...props} />;
});

export {
  AnterosFlexContainer,
  AnterosFlexElement,
  AnterosFlexEvents,
  AnterosFlexHandle,
  AnterosFlexSplitter
};
