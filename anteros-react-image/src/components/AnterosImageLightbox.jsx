import React, {Component} from 'react';
import PropTypes from 'prop-types';

const MIN_ZOOM_LEVEL = 0;
const MAX_ZOOM_LEVEL = 300;
const ZOOM_RATIO = 1.007;
const ZOOM_BUTTON_INCREMENT_SIZE = 100;
const WHEEL_MOVE_X_THRESHOLD = 200;
const WHEEL_MOVE_Y_THRESHOLD = 1;

const KEYS = {
  ESC: 27,
  LEFT_ARROW: 37,
  RIGHT_ARROW: 39
};

let styles = {
  "builtinButtonDisabled": "builtinButtonDisabled_image_box",
  "builtinButton": "builtinButton_image_box",
  "closeButton": "closeButton_image_box",
  "closeWindow": "closeWindow_image_box",
  "closeWindow": "closeWindow_image_box",
  "downloadBlocker": "downloadBlocker_image_box",
  "imageDiscourager": "imageDiscourager_image_box",
  "imageNext": "imageNext_image_box",
  "imagePrev": "imagePrev_image_box",
  "image": "image_image_box",
  "inner": "inner_image_box",
  "navButtonNext": "navButtonNext_image_box",
  "navButtonPrev": "navButtonPrev_image_box",
  "navButtons": "navButtons_image_box",
  "outerAnimating": "outerAnimating_image_box",
  "outerClosing": "outerClosing_image_box",
  "outer": "outer_image_box",
  "toolbarItemChild": "toolbarItemChild_image_box",
  "toolbarItem": "toolbarItem_image_box",
  "toolbarLeftSideNoFlex": "toolbarLeftSideNoFlex_image_box",
  "toolbarLeftSide": "toolbarLeftSide_image_box",
  "toolbarRightSideNoFlex": "toolbarRightSideNoFlex_image_box",
  "toolbarRightSide": "toolbarRightSide_image_box",
  "toolbarSideNoFlex": "toolbarSideNoFlex_image_box",
  "toolbarSide": "toolbarSide_image_box",
  "toolbar": "toolbar_image_box",
  "zoomInButton": "zoomInButton_image_box",
  "zoomOutButton": "zoomOutButton_image_box"
}

export default class AnterosImageLightbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isClosing: !props.animationDisabled,
      shouldAnimate: false,
      zoomLevel: MIN_ZOOM_LEVEL,
      offsetX: 0,
      offsetY: 0
    };

    this.closeIfClickInner = this
      .closeIfClickInner
      .bind(this);
    this.handleImageDoubleClick = this
      .handleImageDoubleClick
      .bind(this);
    this.handleImageMouseWheel = this
      .handleImageMouseWheel
      .bind(this);
    this.handleKeyInput = this
      .handleKeyInput
      .bind(this);
    this.handleMouseUp = this
      .handleMouseUp
      .bind(this);
    this.handleOuterMouseDown = this
      .handleOuterMouseDown
      .bind(this);
    this.handleOuterMouseMove = this
      .handleOuterMouseMove
      .bind(this);
    this.handleOuterMousewheel = this
      .handleOuterMousewheel
      .bind(this);
    this.handleOuterTouchStart = this
      .handleOuterTouchStart
      .bind(this);
    this.handleOuterTouchMove = this
      .handleOuterTouchMove
      .bind(this);
    this.handleWindowResize = this
      .handleWindowResize
      .bind(this);
    this.handleZoomInButtonClick = this
      .handleZoomInButtonClick
      .bind(this);
    this.handleZoomOutButtonClick = this
      .handleZoomOutButtonClick
      .bind(this);
    this.requestClose = this
      .requestClose
      .bind(this);
    this.requestMoveNext = this
      .requestMoveNext
      .bind(this);
    this.requestMovePrev = this
      .requestMovePrev
      .bind(this);
  }

  componentWillMount() {
    this.listenersAttached = false;
    this.keyPressed = false;
    this.imageCache = {};
    this.lastKeyDownTime = 0;
    this.resizeTimeout = null;
    this.wheelActionTimeout = null;
    this.resetScrollTimeout = null;
    this.scrollX = 0;
    this.scrollY = 0;

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartOffsetX = 0;
    this.dragStartOffsetY = 0;

    this.keyCounter = 0;
    this.moveRequested = false;

    if (!this.props.animationDisabled) {
      this.setState({isClosing: false});
    }
  }

  componentDidMount() {
    this.attachListeners();

    this.loadAllImages();
  }

  componentWillReceiveProps(nextProps) {
    const sourcesChanged = this
      .getSrcTypes()
      .some(srcType => this.props[srcType.name] !== nextProps[srcType.name]);

    if (sourcesChanged || this.moveRequested) {
      this.moveRequested = false;

      this.loadAllImages(nextProps);
    }
  }

  componentWillUnmount() {
    this.detachListeners();
  }

  attachListeners() {
    if (!this.listenersAttached) {
      document.addEventListener('keydown', this.handleKeyInput);
      document.addEventListener('keyup', this.handleKeyInput);
      window.addEventListener('resize', this.handleWindowResize);
      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('touchend', this.handleMouseUp);

      if (isInIframe()) {
        window
          .top
          .addEventListener('mouseup', this.handleMouseUp);
        window
          .top
          .addEventListener('touchend', this.handleMouseUp);
      }

      this.listenersAttached = true;
    }
  }

  changeZoom(zoomLevel, clientX, clientY) {
    const windowWidth = getWindowWidth();
    const windowHeight = getWindowHeight();
    const nextZoomLevel = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel));
    if (nextZoomLevel === this.state.zoomLevel) {
      return;
    } else if (nextZoomLevel === MIN_ZOOM_LEVEL) {
      return this.setState({zoomLevel: nextZoomLevel, offsetX: 0, offsetY: 0});
    }

    const currentZoomMultiplier = this.getZoomMultiplier();
    const nextZoomMultiplier = this.getZoomMultiplier(nextZoomLevel);

    const percentXInCurrentBox = (typeof clientX !== 'undefined'
      ? clientX
      : windowWidth / 2) / windowWidth;
    const percentYInCurrentBox = (typeof clientY !== 'undefined'
      ? clientY
      : windowHeight / 2) / windowHeight;

    const currentBoxWidth = windowWidth / currentZoomMultiplier;
    const currentBoxHeight = windowHeight / currentZoomMultiplier;

    const nextBoxWidth = windowWidth / nextZoomMultiplier;
    const nextBoxHeight = windowHeight / nextZoomMultiplier;

    const deltaX = (nextBoxWidth - currentBoxWidth) * (percentXInCurrentBox - 0.5);
    const deltaY = (nextBoxHeight - currentBoxHeight) * (percentYInCurrentBox - 0.5);

    let nextOffsetX = this.state.offsetX - deltaX;
    let nextOffsetY = this.state.offsetY - deltaY;

    const maxOffsets = this.getMaxOffsets();
    if (this.state.zoomLevel > nextZoomLevel) {
      nextOffsetX = Math.max(maxOffsets.minX, Math.min(maxOffsets.maxX, nextOffsetX));
      nextOffsetY = Math.max(maxOffsets.minY, Math.min(maxOffsets.maxY, nextOffsetY));
    }

    this.setState({zoomLevel: nextZoomLevel, offsetX: nextOffsetX, offsetY: nextOffsetY});
  }

  closeIfClickInner(event) {
    if (event.target.className.search(/\binner\b/) > -1) {
      this.requestClose(event);
    }
  }

  detachListeners() {
    if (this.listenersAttached) {
      document.removeEventListener('keydown', this.handleKeyInput);
      document.removeEventListener('keyup', this.handleKeyInput);
      window.removeEventListener('resize', this.handleWindowResize);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('touchend', this.handleMouseUp);

      if (isInIframe()) {
        window
          .top
          .removeEventListener('mouseup', this.handleMouseUp);
        window
          .top
          .removeEventListener('touchend', this.handleMouseUp);
      }

      this.listenersAttached = false;
    }
  }

  getBestImageForType(srcType) {
    let imageSrc = this.props[srcType];
    let fitSizes = {};

    if (this.isImageLoaded(imageSrc)) {
      fitSizes = this.getFitSizes(this.imageCache[imageSrc].width, this.imageCache[imageSrc].height);
    } else if (this.isImageLoaded(this.props[`${srcType}Thumbnail`])) {
      imageSrc = this.props[`${srcType}Thumbnail`];
      fitSizes = this.getFitSizes(this.imageCache[imageSrc].width, this.imageCache[imageSrc].height, true);
    } else {
      return null;
    }

    return {src: imageSrc, height: fitSizes.height, width: fitSizes.width};
  }

  getFitSizes(width, height, stretch) {
    const windowHeight = getWindowHeight();
    const windowWidth = getWindowWidth();
    let maxHeight = windowHeight - (this.props.imagePadding * 2);
    let maxWidth = windowWidth - (this.props.imagePadding * 2);

    if (!stretch) {
      maxHeight = Math.min(maxHeight, height);
      maxWidth = Math.min(maxWidth, width);
    }

    const maxRatio = maxWidth / maxHeight;
    const srcRatio = width / height;

    const fitSizes = {};
    if (maxRatio > srcRatio) {
      fitSizes.width = width * maxHeight / height;
      fitSizes.height = maxHeight;
    } else {
      fitSizes.width = maxWidth;
      fitSizes.height = height * maxWidth / width;
    }

    return fitSizes;
  }

  getMaxOffsets(zoomLevel = this.state.zoomLevel) {
    const currentImageInfo = this.getBestImageForType('mainSrc');
    if (currentImageInfo === null) {
      return {maxX: 0, minX: 0, maxY: 0, minY: 0};
    }

    const windowWidth = getWindowWidth();
    const windowHeight = getWindowHeight();
    const zoomMultiplier = this.getZoomMultiplier(zoomLevel);

    let maxX = 0;
    if (currentImageInfo.width - (windowWidth / zoomMultiplier) < 0) {
      maxX = ((windowWidth / zoomMultiplier) - currentImageInfo.width) / 2;
    } else {
      maxX = (currentImageInfo.width - (windowWidth / zoomMultiplier)) / 2;
    }

    let maxY = 0;
    if (currentImageInfo.height - (windowHeight / zoomMultiplier) < 0) {
      maxY = ((windowHeight / zoomMultiplier) - currentImageInfo.height) / 2;
    } else {
      maxY = (currentImageInfo.height - (windowHeight / zoomMultiplier)) / 2;
    }

    return {
      maxX,
      maxY,
      minX: -1 * maxX,
      minY: -1 * maxY
    };
  }

  getOffsetXFromWindowCenter(x) {
    const windowWidth = getWindowWidth();
    return windowWidth / 2 - x;
  }

  getOffsetYFromWindowCenter(y) {
    const windowHeight = getWindowHeight();
    return windowHeight / 2 - y;
  }

  getSrcTypes() {
    return [
      {
        name: 'mainSrc',
        keyEnding: `i${this.keyCounter}`
      }, {
        name: 'mainSrcThumbnail',
        keyEnding: `t${this.keyCounter}`
      }, {
        name: 'nextSrc',
        keyEnding: `i${this.keyCounter + 1}`
      }, {
        name: 'nextSrcThumbnail',
        keyEnding: `t${this.keyCounter + 1}`
      }, {
        name: 'prevSrc',
        keyEnding: `i${this.keyCounter - 1}`
      }, {
        name: 'prevSrcThumbnail',
        keyEnding: `t${this.keyCounter - 1}`
      }
    ];
  }

  // Get sizing when the image is scaled
  getZoomMultiplier(zoomLevel = this.state.zoomLevel) {
    return Math.pow(ZOOM_RATIO, zoomLevel);
  }

  handleKeyInput(event) {
    event.stopPropagation();
    if (this.isAnimating()) {
      return;
    }
    if (event.type === 'keyup') {
      this.lastKeyDownTime -= this.props.keyRepeatKeyupBonus;
      return;
    }

    const keyCode = event.which || event.keyCode;

    const currentTime = new Date();
    if ((currentTime.getTime() - this.lastKeyDownTime) < this.props.keyRepeatLimit && keyCode !== KEYS.ESC) {
      return;
    }
    this.lastKeyDownTime = currentTime.getTime();

    switch (keyCode) {
      case KEYS.ESC:
        event.preventDefault();
        this.requestClose(event);
        break;

      case KEYS.LEFT_ARROW:
        if (!this.props.prevSrc) {
          return;
        }

        event.preventDefault();
        this.keyPressed = true;
        this.requestMovePrev(event);
        break;

      case KEYS.RIGHT_ARROW:
        if (!this.props.nextSrc) {
          return;
        }

        event.preventDefault();
        this.keyPressed = true;
        this.requestMoveNext(event);
        break;

      default:
    }
  }

  handleOuterMousewheel(event) {
    event.preventDefault();
    event.stopPropagation();

    const xThreshold = WHEEL_MOVE_X_THRESHOLD;
    let actionDelay = 0;
    const imageMoveDelay = 500;

    clearTimeout(this.resetScrollTimeout);
    this.resetScrollTimeout = setTimeout(() => {
      this.scrollX = 0;
      this.scrollY = 0;
    }, 300);

    if (this.wheelActionTimeout !== null || this.isAnimating()) {
      return;
    }

    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      this.scrollY = 0;
      this.scrollX += event.deltaX;

      const bigLeapX = xThreshold / 2;
      if (this.scrollX >= xThreshold || event.deltaX >= bigLeapX) {
        this.requestMoveNext(event);
        actionDelay = imageMoveDelay;
        this.scrollX = 0;
      } else if (this.scrollX <= -1 * xThreshold || event.deltaX <= -1 * bigLeapX) {
        this.requestMovePrev(event);
        actionDelay = imageMoveDelay;
        this.scrollX = 0;
      }
    }

    if (actionDelay !== 0) {
      this.wheelActionTimeout = setTimeout(() => {
        this.wheelActionTimeout = null;
      }, actionDelay);
    }
  }

  handleImageMouseWheel(event) {
    event.preventDefault();
    const yThreshold = WHEEL_MOVE_Y_THRESHOLD;

    if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
      event.stopPropagation();
      if (Math.abs(event.deltaY) < yThreshold) {
        return;
      }

      this.scrollX = 0;
      this.scrollY += event.deltaY;

      this.changeZoom(this.state.zoomLevel - event.deltaY, event.clientX, event.clientY);
    }
  }

  handleImageDoubleClick(event) {
    if (this.state.zoomLevel > MIN_ZOOM_LEVEL) {
      this.changeZoom(MIN_ZOOM_LEVEL, event.clientX, event.clientY);
    } else {
      this.changeZoom(this.state.zoomLevel + ZOOM_BUTTON_INCREMENT_SIZE, event.clientX, event.clientY);
    }
  }

  handleMouseUp() {
    if (!this.isDragging) {
      return;
    }
    this.isDragging = false;
    const maxOffsets = this.getMaxOffsets();
    const nextOffsetX = Math.max(maxOffsets.minX, Math.min(maxOffsets.maxX, this.state.offsetX));
    const nextOffsetY = Math.max(maxOffsets.minY, Math.min(maxOffsets.maxY, this.state.offsetY));
    if (nextOffsetX !== this.state.offsetX || nextOffsetY !== this.state.offsetY) {
      this.setState({offsetX: nextOffsetX, offsetY: nextOffsetY, shouldAnimate: true});

      setTimeout(() => {
        this.setState({shouldAnimate: false});
      }, this.props.animationDuration);
    }
  }

  handleMoveStart(clientX, clientY) {
    if (this.state.zoomLevel <= MIN_ZOOM_LEVEL) {
      return;
    }

    this.isDragging = true;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.dragStartOffsetX = this.state.offsetX;
    this.dragStartOffsetY = this.state.offsetY;
  }

  handleOuterMouseDown(event) {
    event.preventDefault();
    this.handleMoveStart(event.clientX, event.clientY);
  }

  handleOuterTouchStart(event) {
    const touchObj = event.changedTouches[0];
    this.handleMoveStart(parseInt(touchObj.clientX, 10), parseInt(touchObj.clientY, 10));
  }

  handleMove(clientX, clientY) {
    if (!this.isDragging) {
      return;
    }

    const zoomMultiplier = this.getZoomMultiplier();

    const newOffsetX = (this.dragStartX - clientX) / zoomMultiplier + this.dragStartOffsetX;
    const newOffsetY = (this.dragStartY - clientY) / zoomMultiplier + this.dragStartOffsetY;
    if (this.state.offsetX !== newOffsetX || this.state.offsetY !== newOffsetY) {
      this.setState({offsetX: newOffsetX, offsetY: newOffsetY});
    }
  }

  handleOuterMouseMove(event) {
    this.handleMove(event.clientX, event.clientY);
  }

  handleOuterTouchMove(event) {
    event.preventDefault();

    if (this.state.zoomLevel <= MIN_ZOOM_LEVEL) {
      return;
    }

    const touchObj = event.changedTouches[0];
    this.handleMove(parseInt(touchObj.clientX, 10), parseInt(touchObj.clientY, 10));
  }

  handleWindowResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(this.forceUpdate.bind(this), 100);
  }

  handleZoomInButtonClick() {
    this.changeZoom(this.state.zoomLevel + ZOOM_BUTTON_INCREMENT_SIZE);
  }

  handleZoomOutButtonClick() {
    this.changeZoom(this.state.zoomLevel - ZOOM_BUTTON_INCREMENT_SIZE);
  }

  isAnimating() {
    return this.state.shouldAnimate || this.state.isClosing;
  }

  isImageLoaded(imageSrc) {
    return imageSrc && (imageSrc in this.imageCache) && this.imageCache[imageSrc].loaded;
  }

  loadImage(imageSrc, callback) {
    if (this.isImageLoaded(imageSrc)) {
      setTimeout(() => {
        callback(null, this.imageCache[imageSrc].width, this.imageCache[imageSrc].height);
      }, 1);
      return;
    }

    const that = this;
    const inMemoryImage = new Image();

    inMemoryImage.onerror = function onError() {
      callback('image load error');
    };

    inMemoryImage.onload = function onLoad() {
      that.imageCache[imageSrc] = {
        loaded: true,
        width: this.width,
        height: this.height
      };

      callback(null, this.width, this.height);
    };

    inMemoryImage.src = imageSrc;
  }

  loadAllImages(props = this.props) {
    const generateImageLoadedCallback = (srcType, imageSrc) => err => {
      if (err) {
        if (window.console) {
          window
            .console
            .warn(err);
        }
        return;
      }

      if (this.props[srcType] !== imageSrc) {
        return;
      }

      this.forceUpdate();
    };

    this
      .getSrcTypes()
      .forEach(srcType => {
        const type = srcType.name;

        if (props[type] && !this.isImageLoaded(props[type])) {
          this.loadImage(props[type], generateImageLoadedCallback(type, props[type]));
        }
      });
  }

  requestClose(event) {
    const closeLightbox = () => this
      .props
      .onCloseRequest(event);

    if (this.props.animationDisabled || (event.type === 'keydown' && !this.props.animationOnKeyInput)) {
      return closeLightbox();
    }

    this.setState({isClosing: true});
    setTimeout(closeLightbox, this.props.animationDuration);
  }

  requestMove(direction, event) {
    const nextState = {
      zoomLevel: MIN_ZOOM_LEVEL,
      offsetX: 0,
      offsetY: 0
    };

    if (!this.props.animationDisabled && (!this.keyPressed || this.props.animationOnKeyInput)) {
      nextState.shouldAnimate = true;
      setTimeout(() => this.setState({shouldAnimate: false}), this.props.animationDuration);
    }
    this.keyPressed = false;

    this.moveRequested = true;

    if (direction === 'prev') {
      this.keyCounter--;
      this.setState(nextState);
      this
        .props
        .onMovePrevRequest(event);
    } else {
      this.keyCounter++;
      this.setState(nextState);
      this
        .props
        .onMoveNextRequest(event);
    }
  }

  requestMoveNext(event) {
    this.requestMove('next', event);
  }

  requestMovePrev(event) {
    this.requestMove('prev', event);
  }

  render() {
    let transitionStyle = {};
    if (!this.props.animationDisabled && this.isAnimating()) {
      transitionStyle = {
        ...transitionStyle,
        transition: ['transform', 'left', 'top', 'right', 'bottom']
          .map(x => `${x} ${this.props.animationDuration}ms`)
          .join(', ')
      };
    }

    const keyEndings = {};
    this
      .getSrcTypes()
      .forEach(({name, keyEnding}) => {
        keyEndings[name] = keyEnding;
      });

    let images = [];
    const addImage = (srcType, imageClass, baseStyle = {}) => {
      if (!this.props[srcType]) {
        return;
      }

      let imageStyle = {
        ...baseStyle,
        ...transitionStyle
      };
      if (this.state.zoomLevel > MIN_ZOOM_LEVEL) {
        imageStyle.cursor = 'move';
      }

      const bestImageInfo = this.getBestImageForType(srcType);
      if (bestImageInfo === null) {
        images.push(<div
          className={`${imageClass} ${styles.image} not-loaded`}
          style={imageStyle}
          key={this.props[srcType] + keyEndings[srcType]}/>);

        return;
      }

      imageStyle.width = bestImageInfo.width;
      imageStyle.height = bestImageInfo.height;

      const imageSrc = bestImageInfo.src;
      if (this.props.discourageDownloads) {
        imageStyle.backgroundImage = `url('${imageSrc}')`;
        images.push(
          <div
            className={`${imageClass} ${styles.image} ${styles.imageDiscourager}`}
            onDoubleClick={this.handleImageDoubleClick}
            onWheel={this.handleImageMouseWheel}
            style={imageStyle}
            key={imageSrc + keyEndings[srcType]}>
            <div className="download-blocker ${styles.downloadBlocker}"/>
          </div>
        );
      } else {
        images.push(<img
          className={`${imageClass} ${styles.image}`}
          onDoubleClick={this.handleImageDoubleClick}
          onWheel={this.handleImageMouseWheel}
          style={imageStyle}
          src={imageSrc}
          key={imageSrc + keyEndings[srcType]}
          alt={this.props.imageTitle || translate('Image')}/>);
      }
    };

    const zoomMultiplier = this.getZoomMultiplier();
    addImage('nextSrc', `image-next ${styles.imageNext}`);
    addImage('mainSrc', 'image-current', {
      transform: `scale3d(${zoomMultiplier}, ${zoomMultiplier}, 1)`,
      left: -1 * zoomMultiplier * this.state.offsetX,
      right: zoomMultiplier * this.state.offsetX,
      top: -1 * zoomMultiplier * this.state.offsetY,
      bottom: zoomMultiplier * this.state.offsetY
    });
    addImage('prevSrc', `image-prev ${styles.imagePrev}`);

    const noop = () => {};
    const zoomInButtonClasses = [styles.toolbarItemChild, styles.builtinButton, styles.zoomInButton];
    const zoomOutButtonClasses = [styles.toolbarItemChild, styles.builtinButton, styles.zoomOutButton];
    let zoomInButtonHandler = this.handleZoomInButtonClick;
    let zoomOutButtonHandler = this.handleZoomOutButtonClick;
    if (this.state.zoomLevel === MAX_ZOOM_LEVEL) {
      zoomInButtonClasses.push(styles.builtinButtonDisabled);
      zoomInButtonHandler = noop;
    }
    if (this.state.zoomLevel === MIN_ZOOM_LEVEL) {
      zoomOutButtonClasses.push(styles.builtinButtonDisabled);
      zoomOutButtonHandler = noop;
    }
    if (this.isAnimating()) {
      zoomInButtonHandler = noop;
      zoomOutButtonHandler = noop;
    }
    const modalStyle = {
      overlay: {
        zIndex: 1000,
        backgroundColor: 'transparent'
      },
      content: {
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    };

    return (
      <div>
        <div
          onWheel={this.handleOuterMousewheel}
          onMouseMove={this.handleOuterMouseMove}
          onMouseDown={this.handleOuterMouseDown}
          onTouchStart={this.handleOuterTouchStart}
          onTouchMove={this.handleOuterTouchMove}
          className={`outer ${styles.outer} ${styles.outerAnimating}` + (this.state.isClosing
          ? ` closing ${styles.outerClosing}`
          : '')}
          style={{
          transition: `opacity ${this.props.animationDuration}ms`,
          animationDuration: `${this.props.animationDuration}ms`,
          animationDirection: this.state.isClosing
            ? 'normal'
            : 'reverse'
        }}>

          <div
            className={`inner ${styles.inner}`}
            onClick={this.props.clickOutsideToClose
            ? this.closeIfClickInner
            : noop}>
            {images}
          </div>

          {!this.props.prevSrc
            ? ''
            : <button type="button" className={`prev-button ${styles.navButtons} ${styles.navButtonPrev}`} key="prev" onClick={!this.isAnimating()
              ? this.requestMovePrev
              : noop} // Ignore clicks during animation
/>
}

          {!this.props.nextSrc
            ? ''
            : <button
              type="button"
              className={`next-button ${styles.navButtons} ${styles.navButtonNext}`}
              key="next"
              onClick={!this.isAnimating()
              ? this.requestMoveNext
              : noop}/>
}

          <div className={`toolbar ${styles.toolbar}`}>
            <ul className={`toolbar-left ${styles.toolbarSide} ${styles.toolbarLeftSide}`}>
              <li className={styles.toolbarItem}>
                <span className={styles.toolbarItemChild}>{this.props.imageTitle}</span>
              </li>
            </ul>

            <ul
              className={`toolbar-right ${styles.toolbarSide} ${styles.toolbarRightSide}`}>
              {!this.props.toolbarButtons
                ? ''
                : this
                  .props
                  .toolbarButtons
                  .map((button, i) => (
                    <li key={i} className={styles.toolbarItem}>{button}</li>
                  ))}

              <li className={styles.toolbarItem}>
                <button
                  type="button"
                  key="zoom-in"
                  className={`zoom-in ${zoomInButtonClasses.join(' ')}`}
                  onClick={zoomInButtonHandler}/>
              </li>

              <li className={styles.toolbarItem}>
                <button
                  type="button"
                  key="zoom-out"
                  className={`zoom-out ${zoomOutButtonClasses.join(' ')}`}
                  onClick={zoomOutButtonHandler}/>
              </li>

              <li className={styles.toolbarItem}>
                <button
                  type="button"
                  key="close"
                  className={`${styles.toolbarItemChild}` + ` ${styles.builtinButton} ${styles.closeButton}`}
                  onClick={!this.isAnimating()
                  ? this.requestClose
                  : noop}/>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

AnterosImageLightbox.propTypes = {
  mainSrc: PropTypes.string.isRequired,
  prevSrc: PropTypes.string,
  nextSrc: PropTypes.string,
  mainSrcThumbnail: PropTypes.string,
  prevSrcThumbnail: PropTypes.string,
  nextSrcThumbnail: PropTypes.string,
  onCloseRequest: PropTypes.func.isRequired,
  onMovePrevRequest: PropTypes.func,
  onMoveNextRequest: PropTypes.func,
  discourageDownloads: PropTypes.bool,
  animationDisabled: PropTypes.bool,
  animationOnKeyInput: PropTypes.bool,
  animationDuration: PropTypes.number,
  keyRepeatLimit: PropTypes.number,
  keyRepeatKeyupBonus: PropTypes.number,
  imageTitle: PropTypes.node,
  toolbarButtons: PropTypes.arrayOf(PropTypes.node),
  imagePadding: PropTypes.number,
  clickOutsideToClose: PropTypes.bool
};

AnterosImageLightbox.defaultProps = {
  onMovePrevRequest: () => {},
  onMoveNextRequest: () => {},
  discourageDownloads: false,
  animationDisabled: false,
  animationOnKeyInput: false,
  animationDuration: 300,
  keyRepeatLimit: 180,
  keyRepeatKeyupBonus: 40,
  imagePadding: 10,
  clickOutsideToClose: true
};

function getIEVersion() {
  const match = navigator
    .userAgent
    .match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
  return match
    ? parseInt(match[1], 10)
    : undefined;
}

function translate(str, replaceStrings = null) {
  if (!str) {
    return '';
  }

  let translated = str;
  if (replaceStrings) {
    Object
      .keys(replaceStrings)
      .forEach(placeholder => {
        translated = translated.replace(placeholder, replaceStrings[placeholder]);
      });
  }

  return translated;
}

function getWindowWidth() {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

function getWindowHeight() {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}