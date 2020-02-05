import PropTypes from 'prop-types';
import React, {
    Component
} from 'react';

import Lightbox from 'react-images'

export default class AnterosGridGallery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            images: this.props.images,
            thumbnails: [],
            lightboxIsOpen: this.props.isOpen,
            currentImage: this.props.currentImage,
            containerWidth: 0
        };

        this.onResize = this.onResize.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.gotoImage = this.gotoImage.bind(this);
        this.gotoNext = this.gotoNext.bind(this);
        this.gotoPrevious = this.gotoPrevious.bind(this);
        this.onClickImage = this.onClickImage.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.onSelectImage = this.onSelectImage.bind(this);
    }

    componentDidMount() {
        this.onResize();
    }

    componentWillReceiveProps(np) {
        if (this.state.images != np.images || this.props.maxRows != np.maxRows) {
            this.setState({
                images: (np.images ? np.images : []),
                thumbnails: this.renderThumbs(this._gallery.clientWidth,
                    (np.images ? np.images : []))
            });
        }
    }

    componentDidUpdate() {
        if (!this._gallery) return;
        if (this._gallery.clientWidth !==
            this.state.containerWidth) {
            this.onResize();
        }
    }

    onResize() {
        if (!this._gallery) return;
        this.setState({
            containerWidth: Math.floor(this._gallery.clientWidth),
            thumbnails: this.renderThumbs(this._gallery.clientWidth)
        });
    }

    openLightbox(index, event) {
        if (event) {
            event.preventDefault();
        }
        if (this.props.lightboxWillOpen) {
            this.props.lightboxWillOpen.call(this, index);
        }

        this.setState({
            currentImage: index,
            lightboxIsOpen: true
        });
    }

    closeLightbox() {
        if (this.props.lightboxWillClose) {
            this.props.lightboxWillClose.call(this);
        }

        this.setState({
            currentImage: 0,
            lightboxIsOpen: false
        });
    }

    gotoPrevious() {
        this.setState({
            currentImage: this.state.currentImage - 1
        });
    }

    gotoNext() {
        this.setState({
            currentImage: this.state.currentImage + 1
        });
    }

    onClickImage() {
        if (this.state.currentImage === this.props.images.length - 1)
            return;
        this.gotoNext();
    }

    onSelectImage(index, event) {
        event.preventDefault();
        if (this.props.onSelectImage)
            this.props.onSelectImage.call(this, index, this.state.images[index]);
    }

    gotoImage(index) {
        this.setState({
            currentImage: index
        });
    }

    getOnClickThumbnailFn() {
        if (!this.props.onClickThumbnail && this.props.enableLightbox)
            return this.openLightbox;
        if (this.props.onClickThumbnail)
            return this.props.onClickThumbnail;
        return null;
    }

    getOnClickLightboxThumbnailFn() {
        if (!this.props.onClickLightboxThumbnail &&
            this.props.showLightboxThumbnails)
            return this.gotoImage;
        if (this.props.onClickLightboxThumbnail &&
            this.props.showLightboxThumbnails)
            return this.props.onClickLightboxThumbnail;
        return null;
    }

    getOnClickImageFn() {
        if (this.props.onClickImage)
            return this.props.onClickImage;
        return this.onClickImage;
    }

    getOnClickPrevFn() {
        if (this.props.onClickPrev)
            return this.props.onClickPrev;
        return this.gotoPrevious;
    }

    getOnClickNextFn() {
        if (this.props.onClickNext)
            return this.props.onClickNext;
        return this.gotoNext;
    }

    calculateCutOff(len, delta, items) {
        var cutoff = [];
        var cutsum = 0;
        for (var i in items) {
            var item = items[i];
            var fractOfLen = item.scaletwidth / len;
            cutoff[i] = Math.floor(fractOfLen * delta);
            cutsum += cutoff[i];
        }

        var stillToCutOff = delta - cutsum;
        while (stillToCutOff > 0) {
            for (i in cutoff) {
                cutoff[i]++;
                stillToCutOff--;
                if (stillToCutOff < 0) break;
            }
        }
        return cutoff;
    }

    buildImageRow(items, containerWidth) {
        var row = [];
        var len = 0;
        var imgMargin = 2 * this.props.margin;
        while (items.length > 0 && len < containerWidth) {
            var item = items.shift();
            row.push(item);
            len += (item.scaletwidth + imgMargin);
        }

        var delta = len - containerWidth;
        if (row.length > 0 && delta > 0) {
            var cutoff = this.calculateCutOff(len, delta, row);
            for (var i in row) {
                var pixelsToRemove = cutoff[i];
                item = row[i];
                item.marginLeft = -Math.abs(Math.floor(pixelsToRemove / 2));
                item.vwidth = item.scaletwidth - pixelsToRemove;
            }
        } else {
            for (var j in row) {
                item = row[j];
                item.marginLeft = 0;
                item.vwidth = item.scaletwidth;
            }
        }
        return row;
    }

    setThumbScale(item) {
        item.scaletwidth =
            Math.floor(this.props.rowHeight *
                (item.thumbnailWidth / item.thumbnailHeight));
    }

    renderThumbs(containerWidth, images = this.state.images) {
        if (!images) return [];
        if (containerWidth == 0) return [];

        var items = images.slice();
        for (var t in items) {
            this.setThumbScale(items[t]);
        }

        var thumbs = [];
        var rows = [];
        while (items.length > 0) {
            rows.push(this.buildImageRow(items, containerWidth));
        }

        for (var r in rows) {
            for (var i in rows[r]) {
                var item = rows[r][i];
                if (this.props.maxRows) {
                    if (r < this.props.maxRows) {
                        thumbs.push(item);
                    }
                } else {
                    thumbs.push(item);
                }
            }
        }
        return thumbs;
    }

    render() {
        var images = this.state.thumbnails.map((item, idx) => {
            return <Image
                key={"Image-" + idx + "-" + item.src}
                item={item}
                index={idx}
                margin={this.props.margin}
                height={this.props.rowHeight}
                isSelectable={this.props.enableImageSelection}
                onClick={this.getOnClickThumbnailFn()}
                onSelectImage={this.onSelectImage}
                tagStyle={this.props.tagStyle}
                tileViewportStyle={this.props.tileViewportStyle}
                thumbnailStyle={this.props.thumbnailStyle}
            />;
        });
        var resizeIframeStyles = {
            height: 0,
            margin: 0,
            padding: 0,
            overflow: "hidden",
            borderWidth: 0,
            position: "fixed",
            backgroundColor: "transparent",
            width: "100%"
        };
        return (
            <div id={this.props.id} className="ReactGridGallery" ref={(c) => this._gallery = c}>
                <iframe style={resizeIframeStyles} ref={(c) => c && c.contentWindow.addEventListener('resize', this.onResize)} />
                {images}
                <Lightbox
                    images={this.props.images}
                    backdropClosesModal={this.props.backdropClosesModal}
                    currentImage={this.state.currentImage}
                    customControls={this.props.customControls}
                    enableKeyboardInput={this.props.enableKeyboardInput}
                    imageCountSeparator={this.props.imageCountSeparator}
                    isOpen={this.state.lightboxIsOpen}
                    onClickImage={this.getOnClickImageFn()}
                    onClickNext={this.getOnClickNextFn()}
                    onClickPrev={this.getOnClickPrevFn()}
                    showCloseButton={this.props.showCloseButton}
                    showImageCount={this.props.showImageCount}
                    onClose={this.closeLightbox}
                    width={this.props.lightboxWidth}
                    theme={this.props.theme}
                    onClickThumbnail={this.getOnClickLightboxThumbnailFn()}
                    showThumbnails={this.props.showLightboxThumbnails} />
            </div>
        );
    }
}

AnterosGridGallery.displayName = 'Gallery';

AnterosGridGallery.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            src: PropTypes.string.isRequired,
            thumbnail: PropTypes.string.isRequired,
            srcset: PropTypes.array,
            caption: PropTypes.string,
            tags: PropTypes.arrayOf(
                PropTypes.shape({
                    value: PropTypes.string.isRequired,
                    title: PropTypes.string.isRequired
                })
            ),
            thumbnailWidth: PropTypes.number.isRequired,
            thumbnailHeight: PropTypes.number.isRequired,
            isSelected: PropTypes.bool,
            thumbnailCaption: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.element
            ])
        })
    ).isRequired,
    id: PropTypes.string,
    enableImageSelection: PropTypes.bool,
    onSelectImage: PropTypes.func,
    rowHeight: PropTypes.number,
    maxRows: PropTypes.number,
    margin: PropTypes.number,
    onClickThumbnail: PropTypes.func,
    lightboxWillOpen: PropTypes.func,
    lightboxWillClose: PropTypes.func,
    enableLightbox: PropTypes.bool,
    backdropClosesModal: PropTypes.bool,
    currentImage: PropTypes.number,
    preloadNextImage: PropTypes.bool,
    customControls: PropTypes.arrayOf(PropTypes.node),
    enableKeyboardInput: PropTypes.bool,
    imageCountSeparator: PropTypes.string,
    isOpen: PropTypes.bool,
    onClickImage: PropTypes.func,
    onClickNext: PropTypes.func,
    onClickPrev: PropTypes.func,
    onClose: PropTypes.func,
    showCloseButton: PropTypes.bool,
    showImageCount: PropTypes.bool,
    lightboxWidth: PropTypes.number,
    tileViewportStyle: PropTypes.func,
    thumbnailStyle: PropTypes.func,
    showLightboxThumbnails: PropTypes.bool,
    onClickLightboxThumbnail: PropTypes.func,
    tagStyle: PropTypes.object
};

AnterosGridGallery.defaultProps = {
    id: "ReactGridGallery",
    enableImageSelection: true,
    rowHeight: 180,
    margin: 2,
    enableLightbox: true,
    backdropClosesModal: false,
    currentImage: 0,
    preloadNextImage: true,
    enableKeyboardInput: true,
    imageCountSeparator: ' of ',
    isOpen: false,
    showCloseButton: true,
    showImageCount: true,
    lightboxWidth: 1024,
    showLightboxThumbnails: false
};

class Image extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: false
        };
    }

    tagStyle() {
        if (this.props.tagStyle)
            return this.props.tagStyle;
        return {
            display: "inline",
            padding: ".2em .6em .3em",
            fontSize: "75%",
            fontWeight: "600",
            lineHeight: "1",
            color: "yellow",
            background: "rgba(0,0,0,0.65)",
            textAlign: "center",
            whiteSpace: "nowrap",
            verticalAlign: "baseline",
            borderRadius: ".25em"
        };
    }

    tileViewportStyle() {
        if (this.props.tileViewportStyle)
            return this.props.tileViewportStyle.call(this);
        if (this.props.item.isSelected)
            return {
                width: this.props.item.vwidth - 32,
                height: this.props.height - 32,
                margin: 16,
                overflow: "hidden"
            };
        return {
            width: this.props.item.vwidth,
            height: this.props.height,
            overflow: "hidden"
        };
    }

    thumbnailStyle() {
        if (this.props.thumbnailStyle)
            return this.props.thumbnailStyle.call(this);
        if (this.props.item.isSelected) {
            var ratio = (this.props.item.scaletwidth / this.props.height);
            var height = 0;
            var width = 0;
            var viewportHeight = (this.props.height - 32);
            var viewportWidth = (this.props.item.vwidth - 32);

            if (this.props.item.scaletwidth > this.props.height) {
                width = this.props.item.scaletwidth - 32;
                height = Math.floor(width / ratio);
            } else {
                height = this.props.height - 32;
                width = Math.floor(height * ratio);
            }

            var marginTop = -Math.abs(Math.floor((viewportHeight - height) / 2));
            var marginLeft = -Math.abs(Math.floor((viewportWidth - width) / 2));
            return {
                cursor: 'pointer',
                width: width,
                height: height,
                marginLeft: marginLeft,
                marginTop: marginTop
            };
        }
        return {
            cursor: 'pointer',
            width: this.props.item.scaletwidth,
            height: this.props.height,
            marginLeft: this.props.item.marginLeft,
            marginTop: 0
        };
    }

    renderCheckButton() {
        return (
            <CheckButton key="Select"
                index={
                    this.props.index
                }
                color={
                    "#CFCFCF"
                }
                selectedColor={
                    "#4285f4"
                }
                hoverColor={
                    "#E7D7B5"
                }
                isSelected={
                    this.props.item.isSelected
                }
                isSelectable={
                    this.props.isSelectable
                }
                onClick={
                    this.props.isSelectable ?
                        this.props.onSelectImage : null
                }
                parentHover={
                    this.state.hover
                }
            />
        );
    }

    render() {
        var tags = (typeof this.props.item.tags === 'undefined') ? <noscript /> :
            this.props.item.tags.map((tag) => {
                return <div title={tag.title}
                    key={"tag-" + tag.value}
                    style={{
                        display: "inline-block",
                        cursor: 'pointer',
                        pointerEvents: 'visible',
                        margin: "2px"
                    }}>
                    <span style={this.tagStyle()}>{tag.value}</span>
                </div>;
            });

        var customOverlay = (typeof this.props.item.customOverlay === 'undefined')
            ? <noscript /> :
            <div style={{
                pointerEvents: "none",
                opacity: this.state.hover ? 1 : 0,
                position: "absolute",
                height: "100%",
                width: "100%"
            }}>
                {this.props.item.customOverlay}
            </div>;

        return (
            <div className="tile"
                key={"tile-" + this.props.index}
                onMouseEnter={(e) => this.setState({ hover: true })}
                onMouseLeave={(e) => this.setState({ hover: false })}
                style={{
                    margin: this.props.margin,
                    WebkitUserSelect: "none",
                    position: "relative",
                    float: "left",
                    background: "#eee",
                    padding: "0px"
                }}>

                <div className="tile-icon-bar"
                    key={"tile-icon-bar-" + this.props.index}
                    style={{
                        pointerEvents: "none",
                        opacity: 1,
                        position: "absolute",
                        height: "36px",
                        width: "100%"
                    }}>
                    {this.renderCheckButton()}
                </div>

                <div className="tile-bottom-bar"
                    key={"tile-bottom-bar-" + this.props.index}
                    style={{
                        padding: "2px",
                        pointerEvents: "none",
                        position: "absolute",
                        minHeight: "0px",
                        maxHeight: "160px",
                        width: "100%",
                        bottom: "0px"
                    }}>
                    {tags}
                </div>

                {customOverlay}

                <div className="tile-overlay"
                    key={"tile-overlay-" + this.props.index}
                    style={{
                        pointerEvents: "none",
                        opacity: 1,
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        background: (this.state.hover
                            && !this.props.item.isSelected
                            && this.props.isSelectable) ?
                            'linear-gradient(to bottom,rgba(0,0,0,0.26),transparent 56px,transparent)' : 'none'
                    }}>
                </div>

                <div className="tile-viewport"
                    style={this.tileViewportStyle()}
                    key={"tile-viewport-" + this.props.index}
                    onClick={this.props.onClick ?
                        (e) => this.props.onClick.call(this, this.props.index, e) : null}>
                    <img
                        key={"img-" + this.props.index}
                        src={this.props.item.thumbnail} title={this.props.item.caption}
                        style={this.thumbnailStyle()} />
                </div>
                {this.props.item.thumbnailCaption && (
                    <div className="tile-description"
                        style={{
                            background: "white",
                            height: "100%",
                            width: "100%",
                            margin: 0,
                            userSelect: "text",
                            WebkitUserSelect: "text",
                            MozUserSelect: "text",
                            overflow: "hidden"
                        }}>
                        {this.props.item.thumbnailCaption}
                    </div>
                )}
            </div>
        );
    }
}

Image.propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    margin: PropTypes.number,
    height: PropTypes.number,
    isSelectable: PropTypes.bool,
    onClick: PropTypes.func,
    onSelectImage: PropTypes.func,
    tileViewportStyle: PropTypes.func,
    thumbnailStyle: PropTypes.func,
    tagStyle: PropTypes.object,
    customOverlay: PropTypes.element
};

Image.defaultProps = {
    isSelectable: true,
    hover: false
};



class CheckButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: this.props.hover
        };

        this.fill = this.fill.bind(this);
        this.visibility = this.visibility.bind(this);
    }

    fill() {
        if (this.props.isSelected)
            return this.props.selectedColor;
        else if (this.state.hover)
            return this.props.hoverColor;
        return this.props.color;
    }

    visibility() {
        if (this.props.isSelected ||
            (this.props.isSelectable && this.props.parentHover))
            return 'visible';
        return 'hidden';
    }

    render() {
        let circleStyle = {
            display: this.props.isSelected ? "block" : "none"
        };

        return (
            <div
                title="Select"
                style={{
                    visibility: this.visibility(),
                    background: 'none',
                    float: 'left',
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    pointerEvents: 'visible'
                }}
                onClick={this.props.onClick ?
                    (e) => this.props.onClick(this.props.index, e) : null
                }
                onMouseOver={(e) => this.setState({ hover: true })}
                onMouseOut={(e) => this.setState({ hover: false })}>
                <svg
                    fill={this.fill()}
                    height="24" viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg">

                    <radialGradient
                        id="shadow"
                        cx="38"
                        cy="95.488"
                        r="10.488"
                        gradientTransform="matrix(1 0 0 -1 -26 109)"
                        gradientUnits="userSpaceOnUse">
                        <stop
                            offset=".832"
                            stopColor="#010101">
                        </stop>
                        <stop
                            offset="1"
                            stopColor="#010101"
                            stopOpacity="0">
                        </stop>
                    </radialGradient>

                    <circle
                        style={circleStyle}
                        opacity=".26"
                        fill="url(#shadow)"
                        cx="12" cy="13.512"
                        r="10.488">
                    </circle>
                    <circle
                        style={circleStyle}
                        fill="#FFF"
                        cx="12"
                        cy="12.2"
                        r="8.292">
                    </circle>
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
            </div>
        )
    }
}

CheckButton.propTypes = {
    index: PropTypes.number,
    color: PropTypes.string,
    isSelectable: PropTypes.bool,
    isSelected: PropTypes.bool,
    selectedColor: PropTypes.string,
    parentHover: PropTypes.bool,
    hover: PropTypes.bool,
    hoverColor: PropTypes.string,
    onClick: PropTypes.func
};

CheckButton.defaultProps = {
    isSelectable: true,
    isSelected: false,
    parentHover: false,
    hover: false
};
