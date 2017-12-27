import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import lodash from "lodash";
import { loadScript } from 'anteros-react-core';
import MarkerClustererPlus from "marker-clusterer-plus";



const loadGoogleMapApi = function (url, success, error) {
    if (window.google.maps) {
        success();
    } else {
        loadScript(url, err => {
            if (err) {
                const callback = err ? error : success;
                callback(err);
            } else {
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js', err2 => {
                    const callback = err2 ? error : success;
                    callback(err2);
                })
            }
        });
    }
};

export default class AnterosGoogleMaps extends Component {

    constructor(props) {
        super(props);
        this.idMap = lodash.uniqueId("map");
        this.getBounds = this.getBounds.bind(this);
        this.getCenter = this.getCenter.bind(this);
        this.getClickableIcons = this.getClickableIcons.bind(this);
        this.getDiv = this.getDiv.bind(this);
        this.getHeading = this.getHeading.bind(this);
        this.getMapTypeId = this.getMapTypeId.bind(this);
        this.getProjection = this.getProjection.bind(this);
        this.getStreetView = this.getStreetView.bind(this);
        this.getTilt = this.getTilt.bind(this);
        this.getZoom = this.getZoom.bind(this);
        this.panBy = this.panBy.bind(this);
        this.panTo = this.panTo.bind(this);
        this.panToBounds = this.panToBounds.bind(this);
        this.setCenter = this.setCenter.bind(this);
        this.setClickableIcons = this.setClickableIcons.bind(this);
        this.setHeading = this.setHeading.bind(this);
        this.setMapTypeId = this.setMapTypeId.bind(this);
        this.setOptions = this.setOptions.bind(this);
        this.setStreetView = this.setStreetView.bind(this);
        this.setTilt = this.setTilt.bind(this);
        this.setZoom = this.setZoom.bind(this);
        this.setMarkerAnimationById = this.setMarkerAnimationById.bind(this);
        this.goToMarkerById = this.goToMarkerById.bind(this);
        this.map;
        this.oms;
        this.markers = [];
        this.updateMarkers = false;
        this.state = { update: Math.random() };
    }

    getChildContext() {
        return { map: this.map, markers: this.markers, oms: this.oms };
    }


    getBounds() {
        return this.map.getBounds();
    }
    getCenter() {
        return this.map.getCenter();
    }
    getClickableIcons() {
        return this.map.getClickableIcons();
    }
    getDiv() {
        return this.map.getDiv();
    }
    getHeading() {
        return this.map.getHeading();
    }
    getMapTypeId() {
        return this.map.getMapTypeId();
    }
    getProjection() {
        return this.map.getProjection();
    }
    getStreetView() {
        return this.map.getStreetView();
    }
    getTilt() {
        return this.map.getTilt();
    }
    getZoom() {
        return this.map.getZoom();
    }
    panBy(x, y) {
        this.map.panBy(x, y);
    }
    panTo(latLng) {
        this.map.panTo(latLng);
    }
    panToBounds(latLngBounds) {
        this.map.panToBounds(latLngBounds);
    }
    setCenter(latlng) {
        this.map.setCenter(latlng);
    }
    setClickableIcons(value) {
        this.map.setClickableIcons(value);
    }
    setHeading(heading) {
        this.map.setHeading(heading);
    }
    setMapTypeId(mapTypeId) {
        this.map.setMapTypeId(mapTypeId);
    }

    setOptions(options) {
        this.map.setOptions(options)
    }
    setStreetView(panorama) {
        this.map.setStreetView(panorama);
    }
    setTilt(tilt) {
        this.map.setTilt(tilt);
    }
    setZoom(zoom) {
        this.map.setZoom(zoom);
    }

    setMarkerAnimationById(id, animation) {
        this.markers.forEach(function (marker) {
            if (marker.id == id) {
                marker.setAnimation(animation);
            }
        });
    }

    goToMarkerById(id){
        let _this = this;
        this.markers.forEach(function (marker) {
            if (marker.id == id) {
                _this.map.setCenter(marker.getPosition());
            }
        });
    }

    componentDidMount() {
        let _this = this;
        loadGoogleMapApi(`https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&language=${this.props.language}&region=${this.props.region}`, () => {
            let options = {
                backgroundColor: _this.props.backgroundColor,
                clickableIcons: _this.props.clickableIcons,
                disableDefaultUI: _this.props.disableDefaultUI,
                disableDoubleClickZoom: _this.props.disableDoubleClickZoom,
                draggable: _this.props.draggable,
                draggableCursor: _this.props.draggableCursor,
                draggingCursor: _this.props.draggingCursor,
                fullscreenControl: _this.props.fullscreenControl,
                fullscreenControlOptions: _this.props.fullscreenControlOptions,
                gestureHandling: _this.props.gestureHandling,
                keyboardShortcuts: _this.props.keyboardShortcuts,
                zoom: _this.props.zoom,
                zoomControl: _this.props.zoomControl,
                zoomControlOptions: _this.props.zoomControlOptions,
                mapTypeId: _this.props.mapTypeId,
                maxZoom: _this.props.maxZoom,
                minZoom: _this.props.minZoom,
                noClear: _this.props.noClear,
                panControl: _this.props.panControl,
                panControlOptions: _this.props.panControlOptions,
                rotateControl: _this.props.rotateControl,
                rotateControlOptions: _this.props.rotateControlOptions,
                scaleControl: _this.props.scaleControl,
                scaleControlOptions: _this.props.scaleControlOptions,
                scrollwheel: _this.props.scrollwheel,
                heading: _this.props.heading,
                tilt: _this.props.tilt,
                streetView: _this.props.streetView,
                streetViewControl: _this.props.streetViewControl,
                streetViewControlOptions: _this.props.streetViewControlOptions,
                mapTypeControl: _this.props.mapTypeControl,
                mapTypeControlOptions: _this.props.mapTypeControlOptions,
                styles: _this.props.styles
            }
            if (_this.props.center) {
                options = { ...options, center: new google.maps.LatLng(_this.props.center.lat, _this.props.center.lng) }
            }
            _this.updateMarkers = true;
            _this.map = new google.maps.Map(_this.divMap, options);

            _this.oms = new OverlappingMarkerSpiderfier(_this.map, {
                markersWontMove: true,
                markersWontHide: true,
                basicFormatEvents: true,
                keepSpiderfied: _this.props.keepSpiderfied
            });
            _this.setState({ update: Math.random() });

            if (_this.props.onBoundsChanged) {
                _this.map.addListener('bounds_changed', _this.props.onBoundsChanged);
            }
            if (_this.props.onCenterChanged) {
                _this.map.addListener('center_changed', _this.props.onCenterChanged);
            }
            if (_this.props.onClick) {
                _this.map.addListener('click', _this.props.onClick);
            }
            if (_this.props.onDblClick) {
                _this.map.addListener('dblclick', _this.props.onDblClick);
            }
            if (_this.props.onDrag) {
                _this.map.addListener('drag', _this.props.onDrag);
            }
            if (_this.props.onDragEnd) {
                _this.map.addListener('dragend', _this.props.onDragEnd);
            }
            if (_this.props.onDragStart) {
                _this.map.addListener('dragstart', _this.props.onDragStart);
            }
            if (_this.props.onHeadingChanged) {
                _this.map.addListener('heading_changed', _this.props.onHeadingChanged);
            }
            if (_this.props.onIdle) {
                _this.map.addListener('idle', _this.props.onIdle);
            }
            if (_this.props.onMapTypeIdChanged) {
                _this.map.addListener('maptypeid_changed', _this.props.onMapTypeIdChanged);
            }
            if (_this.props.onMouseMove) {
                _this.map.addListener('mousemove', _this.props.onMouseMove);
            }
            if (_this.props.onMouseOut) {
                _this.map.addListener('mouseout', _this.props.onMouseOut);
            }
            if (_this.props.onMouseOver) {
                _this.map.addListener('mouseover', _this.props.onMouseOver);
            }
            if (_this.props.onProjectionChanged) {
                _this.map.addListener('projection_changed', _this.props.onProjectionChanged);
            }
            if (_this.props.onResize) {
                _this.map.addListener('resize', _this.props.onResize);
            }
            if (_this.props.onRightClick) {
                _this.map.addListener('rightclick', _this.props.onRightClick);
            }
            if (_this.props.onTilesLoaded) {
                _this.map.addListener('tilesloaded', _this.props.onTilesLoaded);
            }
            if (_this.props.onTiltChanged) {
                _this.map.addListener('tilt_changed', _this.props.onTiltChanged);
            }
            if (_this.props.onZoomChanged) {
                _this.map.addListener('zoom_changed', _this.props.onZoomChanged);
            }
        });




    }

    render() {
        if (this.props.id) {
            this.idMap = this.props.id;
        }
        if (!this.map) {
            return (<div style={{
                position: 'absolute',
                top: this.props.top,
                left: this.props.left,
                right: this.props.right,
                bottom: this.props.bottom
            }} id={this.idMap} ref={ref => this.divMap = ref}>
            </div>);
        } else {
            return (<div style={{
                position: 'absolute',
                top: this.props.top,
                left: this.props.left,
                right: this.props.right,
                bottom: this.props.bottom
            }} id={this.idMap} ref={ref => this.divMap = ref}>
                {this.props.children}
            </div>);
        }
    }
}


AnterosGoogleMaps.propTypes = {
    id: React.PropTypes.string,
    top: React.PropTypes.string,
    left: React.PropTypes.string,
    right: React.PropTypes.string,
    bottom: React.PropTypes.string,
    apiKey: React.PropTypes.string.isRequired,
    language: React.PropTypes.string.isRequired,
    region: React.PropTypes.string.isRequired,
    backgroundColor: React.PropTypes.string,
    clickableIcons: React.PropTypes.bool.isRequired,
    disableDefaultUI: React.PropTypes.bool.isRequired,
    disableDoubleClickZoom: React.PropTypes.bool.isRequired,
    draggable: React.PropTypes.bool.isRequired,
    draggableCursor: React.PropTypes.string,
    draggingCursor: React.PropTypes.string,
    fullscreenControl: React.PropTypes.bool.isRequired,
    fullscreenControlOptions: React.PropTypes.object,
    gestureHandling: React.PropTypes.oneOf(['cooperative', 'greedy', 'none', 'auto']),
    keyboardShortcuts: React.PropTypes.bool.isRequired,
    zoom: React.PropTypes.number.isRequired,
    zoomControl: React.PropTypes.bool.isRequired,
    zoomControlOptions: React.PropTypes.object,
    centerLat: React.PropTypes.number,
    centerLng: React.PropTypes.number,
    mapTypeId: React.PropTypes.oneOf(['roadmap', 'satellite', 'hybrid', 'terrain']),
    maxZoom: React.PropTypes.number,
    minZoom: React.PropTypes.number,
    noClear: React.PropTypes.bool.isRequired,
    panControl: React.PropTypes.bool.isRequired,
    panControlOptions: React.PropTypes.object,
    rotateControl: React.PropTypes.bool.isRequired,
    rotateControlOptions: React.PropTypes.object,
    scaleControl: React.PropTypes.bool.isRequired,
    scaleControlOptions: React.PropTypes.object,
    scrollwheel: React.PropTypes.bool.isRequired,
    heading: React.PropTypes.number,
    tilt: React.PropTypes.number,
    streetView: React.PropTypes.object,
    streetViewControl: React.PropTypes.bool.isRequired,
    streetViewControlOptions: React.PropTypes.object,
    mapTypeControl: React.PropTypes.bool.isRequired,
    mapTypeControlOptions: React.PropTypes.object,
    styles: React.PropTypes.arrayOf(React.PropTypes.object),
    onBoundsChanged: React.PropTypes.func,
    onCenterChanged: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onDblClick: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onHeadingChanged: React.PropTypes.func,
    onIdle: React.PropTypes.func,
    onMapTypeIdChanged: React.PropTypes.func,
    onMouseMove: React.PropTypes.func,
    onMouseOut: React.PropTypes.func,
    onMouseOver: React.PropTypes.func,
    onProjectionChanged: React.PropTypes.func,
    onResize: React.PropTypes.func,
    onRightClick: React.PropTypes.func,
    onTilesLoaded: React.PropTypes.func,
    onTiltChanged: React.PropTypes.func,
    onZoomChanged: React.PropTypes.func,
    keepSpiderfied: React.PropTypes.bool.isRequired
}

AnterosGoogleMaps.defaultProps = {
    language: 'pt',
    region: 'BR',
    zoom: 4,
    streetViewControl: false,
    mapTypeControl: true,
    clickableIcons: true,
    disableDefaultUI: false,
    disableDoubleClickZoom: false,
    draggable: true,
    fullscreenControl: false,
    keyboardShortcuts: true,
    noClear: false,
    panControl: true,
    rotateControl: true,
    scaleControl: true,
    scrollwheel: true,
    zoomControl: true,
    top: "0px",
    left: "0px",
    right: "0px",
    bottom: "0px",
    keepSpiderfied: true
}

AnterosGoogleMaps.childContextTypes = {
    map: React.PropTypes.object,
    oms: React.PropTypes.object,
    markers: React.PropTypes.array,
}

export class AnterosMarkerClusterer extends Component {

    constructor(props, context) {
        super(props);
        this.markerClusterer;
        this.getAverageCenter = this.getAverageCenter.bind(this);
        this.getBatchSizeIE = this.getBatchSizeIE.bind(this);
        this.getBatchSize = this.getBatchSize.bind(this);
        this.getCalculator = this.getCalculator.bind(this);
        this.getClusterClass = this.getClusterClass.bind(this);
        this.getClusters = this.getClusters.bind(this);
        this.getEnableRetinaIcons = this.getEnableRetinaIcons.bind(this);
        this.getGridSize = this.getGridSize.bind(this);
        this.getIgnoreHidden = this.getIgnoreHidden.bind(this);
        this.getImageExtension = this.getImageExtension.bind(this);
        this.getImagePath = this.getImagePath.bind(this);
        this.getImageSize = this.getImageSize.bind(this);
        this.getMarkers = this.getMarkers.bind(this);
        this.getMaxZoom = this.getMaxZoom.bind(this);
        this.getMinimumClusterSize = this.getMinimumClusterSize.bind(this);
        this.getStyles = this.getStyles.bind(this);
        this.getTitle = this.getTitle.bind(this);
        this.getTotalClusters = this.getTotalClusters.bind(this);
        this.getZoomOnClick = this.getZoomOnClick.bind(this);
        this.addMarker = this.addMarker.bind(this);
        this.addMarkers = this.addMarkers.bind(this);
        this.removeMarker = this.removeMarker.bind(this);
        this.removeMarkers = this.removeMarkers.bind(this);
        this.clearMarkers = this.clearMarkers.bind(this);
        this.fitMapToMarkers = this.fitMapToMarkers.bind(this);
        this.repaint = this.repaint.bind(this);
        this.averageCenter = this.averageCenter.bind(this);
        this.batchSizeIE = this.batchSizeIE.bind(this);
        this.batchSize = this.batchSize.bind(this);
        this.calculator = this.calculator.bind(this);
        this.enableRetinaIcons = this.enableRetinaIcons.bind(this);
        this.gridSize = this.gridSize.bind(this);
        this.ignoreHidden = this.ignoreHidden.bind(this);
        this.imageExtension = this.imageExtension.bind(this);
        this.imagePath = this.imagePath.bind(this);
        this.imageSizes = this.imageSizes.bind(this);
        this.maxZoom = this.maxZoom.bind(this);
        this.minimumClusterSize = this.minimumClusterSize.bind(this);
        this.styles = this.styles.bind(this);
        this.title = this.title.bind(this);
        this.zoomOnClick = this.zoomOnClick.bind(this);

        let options = { ...this.props };

        this.markerClusterer = new MarkerClustererPlus(
            context.map,
            [],
            options
        );

        if (this.props.onClick)
            google.maps.event.addListener(this.markerClusterer, "click", this.props.onClick);

    }

    getAverageCenter() { return this.markerClusterer.getAverageCenter(); }

    getBatchSizeIE() { return this.markerClusterer.getBatchSizeIE(); }

    getBatchSize() { return this.markerClusterer.getBatchSize(); }

    getCalculator() { return this.markerClusterer.getCalculator(); }

    getClusterClass() { return this.markerClusterer.getClusterClass(); }

    getClusters() { return this.markerClusterer.getClusters(); }

    getEnableRetinaIcons() { return this.markerClusterer.getEnableRetinaIcons(); }

    getGridSize() { return this.markerClusterer.getGridSize(); }

    getIgnoreHidden() { return this.markerClusterer.getIgnoreHidden(); }

    getImageExtension() { return this.markerClusterer.getImageExtension(); }

    getImagePath() { return this.markerClusterer.getImagePath(); }

    getImageSize() { return this.markerClusterer.getImageSize(); }

    getMarkers() { return this.markerClusterer.getMarkers(); }

    getMaxZoom() { return this.markerClusterer.getMaxZoom(); }
    getMinimumClusterSize() { return this.markerClusterer.getMinimumClusterSize(); }

    getStyles() { return this.markerClusterer.getStyles(); }

    getTitle() { return this.markerClusterer.getTitle(); }

    getTotalClusters() { return this.markerClusterer.getTotalClusters(); }

    getZoomOnClick() { return this.markerClusterer.getZoomOnClick(); }

    addMarker(marker, nodraw = false) {
        return this.markerClusterer.addMarker(marker, nodraw);
    }

    addMarkers(markers, nodraw = false) {
        return this.markerClusterer.addMarkers(markers, nodraw);
    }

    removeMarker(marker, nodraw = false) {
        return this.markerClusterer.removeMarker(marker, nodraw);
    }

    removeMarkers(markers, nodraw = false) {
        return this.markerClusterer.removeMarkers(markers, nodraw);
    }

    clearMarkers() { return this.markerClusterer.clearMarkers(); }

    fitMapToMarkers() { return this.markerClusterer.fitMapToMarkers(); }

    repaint() { return this.markerClusterer.repaint(); }

    averageCenter(averageCenter) {
        this.markerClusterer.setAverageCenter(averageCenter);
    }

    batchSizeIE(batchSizeIE) {
        this.markerClusterer.setBatchSizeIE(batchSizeIE);
    }

    batchSize(batchSize) {
        this.markerClusterer.setBatchSize(batchSize);
    }

    calculator(calculator) { this.markerClusterer.setCalculator(calculator); }

    enableRetinaIcons(enableRetinaIcons) {
        this.markerClusterer.setEnableRetinaIcons(enableRetinaIcons);
    }

    gridSize(gridSize) { this.markerClusterer.setGridSize(gridSize); }

    ignoreHidden(ignoreHidden) { this.markerClusterer.setIgnoreHidden(ignoreHidden); }

    imageExtension(imageExtension) {
        this.markerClusterer.setImageExtension(imageExtension);
    }

    imagePath(imagePath) { this.markerClusterer.setImagePath(imagePath); }

    imageSizes(imageSizes) { this.markerClusterer.setImageSizes(imageSizes); }

    maxZoom(maxZoom) { this.markerClusterer.setMaxZoom(maxZoom); }

    minimumClusterSize(minimumClusterSize) {
        this.markerClusterer.setMinimumClusterSize(minimumClusterSize);
    }

    styles(styles) { this.markerClusterer.setStyles(styles); }

    title(title) { this.markerClusterer.setTitle(title); }

    zoomOnClick(zoomOnClick) { this.markerClusterer.setZoomOnClick(zoomOnClick); }

    componentDidMount() {

    }

    componentDidUpdate() {
        if (this.markerClusterer)
            this.markerClusterer.repaint();
    }

    componentWillUnmount() {
        if (this.markerClusterer) {
            this.markerClusterer.setMap(null);
        }
    }

    getChildContext() {
        return {
            anchor: this.markerClusterer,
            markerClusterer: this.markerClusterer,
            map: this.context.map,
            oms: this.context.oms,
            markers: this.context.markers,
        };
    }

    render() {
        return (<div>{this.props.children}</div>);
    }


}

AnterosMarkerClusterer.propTypes = {
    averageCenter: React.PropTypes.bool,
    batchSizeIE: React.PropTypes.number,
    batchSize: React.PropTypes.number,
    calculator: React.PropTypes.func,
    clusterClass: React.PropTypes.string,
    enableRetinaIcons: React.PropTypes.bool,
    gridSize: React.PropTypes.number,
    ignoreHidden: React.PropTypes.bool,
    imageExtension: React.PropTypes.string,
    imagePath: React.PropTypes.string,
    imageSizes: React.PropTypes.array,
    maxZoom: React.PropTypes.number,
    minimumClusterSize: React.PropTypes.number,
    styles: React.PropTypes.array,
    title: React.PropTypes.string,
    zoomOnClick: React.PropTypes.bool,
}

AnterosMarkerClusterer.contextTypes = {
    map: React.PropTypes.object,
    oms: React.PropTypes.object,
    markers: React.PropTypes.array,
};

AnterosMarkerClusterer.childContextTypes = {
    anchor: React.PropTypes.object,
    markerClusterer: React.PropTypes.object,
    map: React.PropTypes.object,
    oms: React.PropTypes.object,
    markers: React.PropTypes.array,
}


export class AnterosMarker extends Component {

    constructor(props, context) {
        super(props);
        this.marker;
        this.getAnimation = this.getAnimation.bind(this);
        this.getAttribution = this.getAttribution.bind(this);
        this.getClickable = this.getClickable.bind(this);
        this.getCursor = this.getCursor.bind(this);
        this.getDraggable = this.getDraggable.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.getLabel = this.getLabel.bind(this);
        this.getOpacity = this.getOpacity.bind(this);
        this.getPlace = this.getPlace.bind(this);
        this.getPosition = this.getPosition.bind(this);
        this.getShape = this.getShape.bind(this);
        this.getTitle = this.getTitle.bind(this);
        this.getVisible = this.getVisible.bind(this);
        this.getZIndex = this.getZIndex.bind(this);
        this.animation = this.animation.bind(this);
        this.attribution = this.attribution.bind(this);
        this.clickable = this.clickable.bind(this);
        this.cursor = this.cursor.bind(this);
        this.draggable = this.draggable.bind(this);
        this.icon = this.icon.bind(this);
        this.label = this.label.bind(this);
        this.opacity = this.opacity.bind(this);
        this.options = this.options.bind(this);
        this.place = this.place.bind(this);
        this.position = this.position.bind(this);
        this.shape = this.shape.bind(this);
        this.title = this.title.bind(this);
        this.visible = this.visible.bind(this);
        this.zIndex = this.zIndex.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
    }

    getAnimation() { return this.getAnimation(); }

    getAttribution() { return this.getAttribution(); }

    getClickable() { return this.getClickable(); }

    getCursor() { return this.getCursor(); }

    getDraggable() { return this.getDraggable(); }

    getIcon() { return this.getIcon(); }

    getLabel() { return this.getLabel(); }

    getOpacity() { return this.getOpacity(); }

    getPlace() { return this.getPlace(); }

    getPosition() { return this.getPosition(); }

    getShape() { return this.getShape(); }

    getTitle() { return this.getTitle(); }

    getVisible() { return this.getVisible(); }

    getZIndex() { return this.getZIndex(); }
    animation(animation) { this.setAnimation(animation); }

    attribution(attribution) { this.setAttribution(attribution); }

    clickable(clickable) { this.setClickable(clickable); }

    cursor(cursor) { this.setCursor(cursor); }

    draggable(draggable) { this.setDraggable(draggable); }

    icon(icon) { this.setIcon(icon); }

    label(label) { this.setLabel(label); }

    opacity(opacity) { this.setOpacity(opacity); }

    options(options) { this.setOptions(options); }

    place(place) { this.setPlace(place); }

    position(position) { this.setPosition(position); }

    shape(shape) { this.setShape(shape); }

    title(title) { this.setTitle(title); }

    visible(visible) { this.setVisible(visible); }

    zIndex(zIndex) { this.setZIndex(zIndex); }

    onClick(event) {
        if (this.props.onClick) {
            this.props.onClick(this.props, this.marker, event);
        }
    }

    onMouseOut(event){
        if (this.props.onMouseOut){
            this.props.onMouseOut(this.props, this.marker, event);
        }
    }

    onMouseOver(event){
        if (this.props.onMouseOver){
            this.props.onMouseOver(this.props, this.marker, event);
        }
    }

    componentDidMount() {
        let options = {
            animation: this.props.animation,
            attribution: this.props.attribution,
            clickable: this.props.clickable,
            cursor: this.props.cursor,
            draggable: this.props.draggable,
            icon: this.props.icon,
            label: this.props.label,
            noRedraw: this.props.noRedraw,
            opacity: this.props.opacity,
            options: this.props.options,
            place: this.props.place,
            position: this.props.position,
            shape: this.props.shape,
            title: this.props.title,
            visible: this.props.visible,
            zIndex: this.props.zIndex
        }
        this.marker = new google.maps.Marker(options);
        this.marker.id = this.props.id;
        const markerClusterer = this.context.markerClusterer;
        if (markerClusterer) {
            markerClusterer.addMarker(this.marker, !!this.props.noRedraw);
        }
        this.context.oms.addMarker(this.marker);
        this.context.markers.push(this.marker);

        if (this.props.onAnimationChanged) this.marker.addListener(`animation_changed`, this.props.onAnimationChanged);
        google.maps.event.addListener(this.marker, 'spider_click', this.onClick);
        if (this.props.onClickableChanged) this.marker.addListener(`clickable_changed`, this.props.onClickableChanged);
        if (this.props.onCursorChanged) this.marker.addListener(`cursor_changed`, this.props.onCursorChanged);
        if (this.props.onDblClick) this.marker.addListener(`dblclick`, this.props.onDblClick);
        if (this.props.onDrag) this.marker.addListener(`drag`, this.props.onDrag);
        if (this.props.onDragEnd) this.marker.addListener(`dragend`, this.props.onDragEnd);
        if (this.props.onDraggableChanged) this.marker.addListener(`draggable_changed`, this.props.onDraggableChanged);
        if (this.props.onDragStart) this.marker.addListener(`dragstart`, this.props.onDragStart);
        if (this.props.onFlatChanged) this.marker.addListener(`flat_changed`, this.props.onFlatChanged);
        if (this.props.onIconChanged) this.marker.addListener(`icon_changed`, this.props.onIconChanged);
        if (this.props.onMouseDown) this.marker.addListener(`mousedown`, this.props.onMouseDown);
        if (this.props.onMouseOut) this.marker.addListener(`mouseout`, this.onMouseOut);
        if (this.props.onMouseOver) this.marker.addListener(`mouseover`, this.onMouseOver);
        if (this.props.onMouseUp) this.marker.addListener(`mouseup`, this.props.onMouseUp);
        if (this.props.onPositionChanged) this.marker.addListener(`position_changed`, this.props.onPositionChanged);
        if (this.props.onRightClick) this.marker.addListener(`rightclick`, this.props.onRightClick);
        if (this.props.onShapeChanged) this.marker.addListener(`shape_changed`, this.props.onShapeChanged);
        if (this.props.onTitleChanged) this.marker.addListener(`title_changed`, this.props.onTitleChanged);
        if (this.props.onVisibleChanged) this.marker.addListener(`visible_changed`, this.props.onVisibleChanged);
        if (this.props.onZindexChanged) this.marker.addListener(`zindex_changed`, this.props.onZindexChanged);
    }

    getChildContext() {
        return {
            map: this.context.map,
            anchor: this.context.anchor || this.marker
        };
    }

    componentWillUnmount() {
        if (this.marker) {
            const markerClusterer = this.context.markerClusterer;
            if (markerClusterer) {
                markerClusterer.removeMarker(this.marker, !!this.props.noRedraw);
            }
            this.marker.setMap(null);
            for (var i = 0; i < this.context.markers.length; i++)
                if (this.context.markers[i] === this.marker) {
                    this.context.markers.splice(i, 1);
                    break;
                }
        }
    }

    render() {
        return (<div>{this.props.children}</div>);
    }
}

AnterosMarker.childContextTypes = {
    anchor: React.PropTypes.object,
    map: React.PropTypes.object
}

AnterosMarker.contextTypes = {
    map: React.PropTypes.object,
    oms: React.PropTypes.object,
    markerClusterer: React.PropTypes.object,
    markers: React.PropTypes.array
};

AnterosMarker.propTypes = {
    id: React.PropTypes.string.isRequired,
    animation: React.PropTypes.any,
    attribution: React.PropTypes.any,
    clickable: React.PropTypes.bool,
    cursor: React.PropTypes.string,
    draggable: React.PropTypes.bool,
    icon: React.PropTypes.any,
    label: React.PropTypes.any,
    noRedraw: React.PropTypes.bool,
    opacity: React.PropTypes.number,
    options: React.PropTypes.object,
    place: React.PropTypes.any,
    position: React.PropTypes.any,
    shape: React.PropTypes.any,
    title: React.PropTypes.string,
    visible: React.PropTypes.bool,
    zIndex: React.PropTypes.number,
    onAnimationChanged: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onClickableChanged: React.PropTypes.func,
    onCursorChanged: React.PropTypes.func,
    onDblClick: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    onDraggableChanged: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onFlatChanged: React.PropTypes.func,
    onIconChanged: React.PropTypes.func,
    onMouseDown: React.PropTypes.func,
    onMouseOut: React.PropTypes.func,
    onMouseOver: React.PropTypes.func,
    onMouseUp: React.PropTypes.func,
    onPositionChanged: React.PropTypes.func,
    onRightClick: React.PropTypes.func,
    onShapeChanged: React.PropTypes.func,
    onTitleChanged: React.PropTypes.func,
    onVisibleChanged: React.PropTypes.func,
    onZindexChanged: React.PropTypes.func
}


export class AnterosInfoWindow extends Component {

    constructor(props, context) {
        super(props);
    }

    componentDidMount() {
        this.renderInfoWindow();
    }

    componentDidUpdate(prevProps) {

        if (this.props.position !== prevProps.position) {
            this.updatePosition();
        }

        if (this.props.children !== prevProps.children) {
            this.updateContent();
        }

        if ((this.props.visible !== prevProps.visible ||
            this.props.marker !== prevProps.marker ||
            this.props.position !== prevProps.position)) {
            this.props.visible ?
                this.openWindow() :
                this.closeWindow();
        }
    }

    renderInfoWindow() {
        const iw = this.infowindow = new google.maps.InfoWindow({
            content: ''
        });

        google.maps.event
            .addListener(iw, 'closeclick', this.onClose.bind(this))
        google.maps.event
            .addListener(iw, 'domready', this.onOpen.bind(this));
    }

    onOpen() {
        if (this.props.onOpen) {
            this.props.onOpen();
        }
    }

    onClose() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    openWindow() {
        this.infowindow.open(this.context.map, this.props.marker);
    }

    updatePosition() {
        let pos = this.props.position;
        if (!(pos instanceof google.maps.LatLng)) {
            pos = pos && new google.maps.LatLng(pos.lat, pos.lng);
        }
        this.infowindow.setPosition(pos);
    }

    updateContent() {
        const content = this.renderChildren();
        this.infowindow.setContent(content);
    }

    closeWindow() {
        this.infowindow.close();
    }

    renderChildren() {
        const { children } = this.props;
        var temp = document.createElement('div');
        let detail = (
            <div>
                {children}
            </div>
        );
        ReactDOM.render(detail, temp);
        return temp.innerHTML;
    }

    render() {
        return null;
    }
}

AnterosInfoWindow.propTypes = {
    children: PropTypes.element.isRequired,
    position: PropTypes.object,
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
    onContentChanged: PropTypes.func,
    onDomReady: PropTypes.func,
    onPositionChanged: PropTypes.func,
    onZIndexChanged: PropTypes.func
}

AnterosInfoWindow.defaultProps = {
    visible: false
}

AnterosInfoWindow.contextTypes = {
    map: PropTypes.object
}



export class AnterosPolygon extends React.Component {
    constructor(props, context) {
        super(props);
        this.polygon;
        this.getDraggable = this.getDraggable.bind(this);
        this.getEditable = this.getEditable.bind(this);
        this.getPath = this.getPath.bind(this);
        this.getPaths = this.getPaths.bind(this);
        this.getVisible = this.getVisible.bind(this);
        this.draggable = this.setDraggable.bind(this);
        this.editable = this.setEditable.bind(this);
        this.options = this.setOptions.bind(this);
        this.path = this.setPath.bind(this);
        this.paths = this.setPaths.bind(this);
        this.visible = this.setVisible.bind(this);

    }

    componentDidMount() {
        let options = {
            draggable: this.props.draggable,
            editable: this.props.editable,
            options: this.props.options,
            path: this.props.path,
            paths: this.props.paths,
            visible: this.props.visible
        }
        this.polygon = new google.maps.Polygon({
            map: this.context.map, ...options
        });

        if (this.props.onClick) {
            this.polygon.addListener('click', this.props.onClick);
        }
        if (this.props.onDblClick) {
            this.polygon.addListener('dblclick', this.props.onDblClick);
        }
        if (this.props.onDrag) {
            this.polygon.addListener('drag', this.props.onDrag);
        }
        if (this.props.onDragEnd) {
            this.polygon.addListener('dragend', this.props.onDragEnd);
        }
        if (this.props.onDragStart) {
            this.polygon.addListener('dragstart', this.props.onDragStart);
        }
        if (this.props.onMouseDown) {
            this.polygon.addListener('mousedown', this.props.onMouseDown);
        }
        if (this.props.onMouseMove) {
            this.polygon.addListener('mousemove', this.props.onMouseMove);
        }
        if (this.props.onMouseOut) {
            this.polygon.addListener('mouseout', this.props.onMouseOut);
        }
        if (this.props.onMouseOver) {
            this.polygon.addListener('mouseover', this.props.onMouseOver);
        }
        if (this.props.onMouseUp) {
            this.polygon.addListener('mouseup', this.props.onMouseUp);
        }
        if (this.props.onRightClick) {
            this.polygon.addListener('rightclick', this.props.onRightClick);
        }
    }

    componentWillUnmount() {
        if (this.polygon) {
            this.polygon.setMap(null);
        }
    }

    getDraggable() { return this.polygon.getDraggable(); }
    getEditable() { return this.polygon.getEditable(); }
    getPath() { return this.polygon.getPath(); }
    getPaths() { return this.polygon.getPaths(); }
    getVisible() { return this.polygon.getVisible(); }
    draggable(draggable) { this.polygon.setDraggable(draggable); }
    editable(editable) { this.polygon.setEditable(editable); }
    options(options) { this.polygon.setOptions(options); }
    path(path) { this.polygon.setPath(path); }
    paths(paths) { this.polygon.setPaths(paths); }
    visible(visible) { this.polygon.setVisible(visible); }

    render() {
        return false;
    }
}

AnterosPolygon.propTypes = {
    draggable: PropTypes.bool,
    editable: PropTypes.bool,
    options: PropTypes.object,
    path: PropTypes.any,
    paths: PropTypes.any,
    visible: PropTypes.bool,
    onClick: PropTypes.func,
    onDblClick: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseUp: PropTypes.func,
    onRightClick: PropTypes.func
}

AnterosPolygon.defaultProps = {
    visible: true
}

AnterosPolygon.contextTypes = {
    map: PropTypes.object,
}


export class AnterosPolyline extends React.Component {

    constructor(props) {
        super(props);
        this.polyline;
        this.getDraggable = this.getDraggable.bind(this);
        this.getEditable = this.getEditable.bind(this);
        this.getPath = this.getPath.bind(this);
        this.getVisible = this.getVisible.bind(this);
        this.draggable = this.setDraggable.bind(this);
        this.editable = this.setEditable.bind(this);
        this.options = this.setOptions.bind(this);
        this.path = this.setPath.bind(this);
        this.visible = this.setVisible.bind(this);
    }

    getDraggable() { return this.polyline.getDraggable(); }
    getEditable() { return this.polyline.getEditable(); }
    getPath() { return this.polyline.getPath(); }
    getVisible() { return this.polyline.getVisible(); }
    draggable(draggable) { this.polyline.setDraggable(draggable); }
    editable(editable) { this.polyline.setEditable(editable); }
    options(options) { this.polyline.setOptions(options); }
    path(path) { this.polyline.setPath(path); }
    visible(visible) { this.polyline.setVisible(visible); }

    componentDidMount() {
        let options = {
            draggable: this.props.draggable,
            editable: this.props.editable,
            options: this.props.options,
            path: this.props.path,
            visible: this.props.visible
        }
        this.polyline = new google.maps.Polyline({
            map: this.context.map, ...options
        });

        if (this.props.onClick) {
            this.polyline.addListener('click', this.props.onClick);
        }
        if (this.props.onDblClick) {
            this.polyline.addListener('dblclick', this.props.onDblClick);
        }
        if (this.props.onDrag) {
            this.polyline.addListener('drag', this.props.onDrag);
        }
        if (this.props.onDragEnd) {
            this.polyline.addListener('dragend', this.props.onDragEnd);
        }
        if (this.props.onDragStart) {
            this.polyline.addListener('dragstart', this.props.onDragStart);
        }
        if (this.props.onMouseDown) {
            this.polyline.addListener('mousedown', this.props.onMouseDown);
        }
        if (this.props.onMouseMove) {
            this.polyline.addListener('mousemove', this.props.onMouseMove);
        }
        if (this.props.onMouseOut) {
            this.polyline.addListener('mouseout', this.props.onMouseOut);
        }
        if (this.props.onMouseOver) {
            this.polyline.addListener('mouseover', this.props.onMouseOver);
        }
        if (this.props.onMouseUp) {
            this.polyline.addListener('mouseup', this.props.onMouseUp);
        }
        if (this.props.onRightClick) {
            this.polyline.addListener('rightclick', this.props.onRightClick);
        }
    }

    componentWillUnmount() {
        if (this.polyline) {
            this.polyline.setMap(null);
        }
    }

    render() {
        return false;
    }
}


AnterosPolyline.propTypes = {
    draggable: PropTypes.bool,
    editable: PropTypes.bool,
    options: PropTypes.object,
    path: PropTypes.any,
    visible: PropTypes.bool,
    onClick: PropTypes.func,
    onDblClick: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseUp: PropTypes.func,
    onRightClick: PropTypes.func
}

AnterosPolyline.defaultProps = {
    visible: true
}

AnterosPolyline.contextTypes = {
    map: PropTypes.object,
}


export class AnterosRectangle extends React.Component {

    constructor(props) {
        super(props);
        this.rectangle;
        this.getBounds = this.getBound.bind(this);
        this.getDraggable = this.getDraggable.bind(this);
        this.getEditable = this.getEditable.bind(this);
        this.bounds = this.bounds.bind(this);
        this.getVisible = this.getVisible.bind(this);
        this.draggable = this.setDraggable.bind(this);
        this.editable = this.setEditable.bind(this);
        this.options = this.setOptions.bind(this);
        this.visible = this.setVisible.bind(this);
    }

    getBounds() { return this.rectangle.getBounds(); }
    getDraggable() { return this.rectangle.getDraggable(); }
    getEditable() { return this.rectangle.getEditable(); }
    getVisible() { return this.rectangle.getVisible(); }
    bounds(bounds) { this.rectangle.setBounds(bounds); }
    draggable(draggable) { this.rectangle.setDraggable(draggable); }
    editable(editable) { this.rectangle.setEditable(editable); }
    options(options) { this.rectangle.setOptions(options); }
    visible(visible) { this.rectangle.setVisible(visible); }

    componentDidMount() {
        let options = {
            bounds: this.props.bounds,
            draggable: this.props.draggable,
            editable: this.props.editable,
            options: this.props.options,
            visible: this.props.visible
        }
        this.rectangle = new google.maps.Rectangle({
            map: this.context.map, ...options
        });

        if (this.props.onBoundsChanged) {
            this.rectangle.addListener('bounds_changed', this.props.onBoundsChanged);
        }
        if (this.props.onClick) {
            this.rectangle.addListener('click', this.props.onClick);
        }
        if (this.props.onDblClick) {
            this.rectangle.addListener('dblclick', this.props.onDblClick);
        }
        if (this.props.onDrag) {
            this.rectangle.addListener('drag', this.props.onDrag);
        }
        if (this.props.onDragEnd) {
            this.rectangle.addListener('dragend', this.props.onDragEnd);
        }
        if (this.props.onDragStart) {
            this.rectangle.addListener('dragstart', this.props.onDragStart);
        }
        if (this.props.onMouseDown) {
            this.rectangle.addListener('mousedown', this.props.onMouseDown);
        }
        if (this.props.onMouseMove) {
            this.rectangle.addListener('mousemove', this.props.onMouseMove);
        }
        if (this.props.onMouseOut) {
            this.rectangle.addListener('mouseout', this.props.onMouseOut);
        }
        if (this.props.onMouseOver) {
            this.rectangle.addListener('mouseover', this.props.onMouseOver);
        }
        if (this.props.onMouseUp) {
            this.rectangle.addListener('mouseup', this.props.onMouseUp);
        }
        if (this.props.onRightClick) {
            this.rectangle.addListener('rightclick', this.props.onRightClick);
        }
    }

    componentWillUnmount() {
        if (this.rectangle) {
            this.rectangle.setMap(null);
        }
    }

    render() {
        return false;
    }
}


AnterosRectangle.propTypes = {
    bounds: PropTypes.any,
    draggable: PropTypes.bool,
    editable: PropTypes.bool,
    options: PropTypes.object,
    visible: PropTypes.bool,
    onBoundsChanged: PropTypes.func,
    onClick: PropTypes.func,
    onDblClick: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseUp: PropTypes.func,
    onRightClick: PropTypes.func
}

AnterosRectangle.defaultProps = {
    visible: true
}

AnterosRectangle.contextTypes = {
    map: PropTypes.object,
}



export class AnterosCircle extends React.Component {

    constructor(props) {
        super(props);
        this.circle;
        this.getBounds = this.getBound.bind(this);
        this.getCenter = this.getCenter.bind(this);
        this.getDraggable = this.getDraggable.bind(this);
        this.getEditable = this.getEditable.bind(this);
        this.getVisible = this.getVisible.bind(this);
        this.getMap = this.getMap.bind(this);
        this.getRadius = this.getRadius.bind(this);
        this.draggable = this.setDraggable.bind(this);
        this.editable = this.setEditable.bind(this);
        this.options = this.setOptions.bind(this);
        this.visible = this.setVisible.bind(this);
    }

    getBounds() { return this.circle.getBounds(); }
    getCenter() { return this.circle.getCenter(); }
    getDraggable() { return this.circle.getDraggable(); }
    getEditable() { return this.circle.getEditable(); }
    getMap() { return this.circle.getMap(); }
    getRadius() { return this.circle.getRadius(); }
    getVisible() { return this.circle.getVisible(); }
    draggable(draggable) { this.circle.setDraggable(draggable); }
    editable(editable) { this.circle.setEditable(editable); }
    options(options) { this.circle.setOptions(options); }
    visible(visible) { this.circle.setVisible(visible); }

    componentDidMount() {
        let options = {
            center: this.props.center,
            draggable: this.props.draggable,
            editable: this.props.editable,
            options: this.props.options,
            radius: this.props.radius,
            visible: this.props.visible
        }
        this.circle = new google.maps.Circle({
            map: this.context.map, ...options
        });

        if (this.props.onCenterChanged) {
            this.circle.addListener('center_changed', this.props.onCenterChanged);
        }
        if (this.props.onClick) {
            this.circle.addListener('click', this.props.onClick);
        }
        if (this.props.onDblClick) {
            this.circle.addListener('dblclick', this.props.onDblClick);
        }
        if (this.props.onDrag) {
            this.circle.addListener('drag', this.props.onDrag);
        }
        if (this.props.onDragEnd) {
            this.circle.addListener('dragend', this.props.onDragEnd);
        }
        if (this.props.onDragStart) {
            this.circle.addListener('dragstart', this.props.onDragStart);
        }
        if (this.props.onMouseDown) {
            this.circle.addListener('mousedown', this.props.onMouseDown);
        }
        if (this.props.onMouseMove) {
            this.circle.addListener('mousemove', this.props.onMouseMove);
        }
        if (this.props.onMouseOut) {
            this.circle.addListener('mouseout', this.props.onMouseOut);
        }
        if (this.props.onMouseOver) {
            this.circle.addListener('mouseover', this.props.onMouseOver);
        }
        if (this.props.onMouseUp) {
            this.circle.addListener('mouseup', this.props.onMouseUp);
        }
        if (this.props.onRightClick) {
            this.circle.addListener('rightclick', this.props.onRightClick);
        }
    }

    componentWillUnmount() {
        if (this.circle) {
            this.circle.setMap(null);
        }
    }

    render() {
        return false;
    }
}


AnterosRectangle.propTypes = {
    defaultViewport: PropTypes.any,
    options: PropTypes.any,
    metadata: PropTypes.any,
    status: PropTypes.any,
    url: PropTypes.string,
    zIndex: PropTypes.number,
    onClick: PropTypes.func,
    onDefaultViewportChanged: PropTypes.func,
    onStatusChanged: PropTypes.func
}

AnterosRectangle.defaultProps = {
    visible: true
}

AnterosRectangle.contextTypes = {
    map: PropTypes.object,
}



export class AnterosKmlLayer extends React.Component {
    constructor(props) {
        super(props);
        this.kmlLayer;
        this.getDefaultViewport = this.getDefaultViewport.bind(this);
        this.getMetadata = this.getMetadata.bind(this);
        this.getOptions = this.getOptions.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.getUrl = this.getUrl.bind(this);
        this.getZIndex = this.getZIndex.bind(this);
        this.defaultViewport = this.defaultViewport.bind(this);
        this.metadata = this.metadata.bind(this);
        this.options = this.options.bind(this);
        this.status = this.status.bind(this);
        this.url = this.url.bind(this);
        this.zIndex = this.zIndex.bind(this);
    }

    componentDidMount() {
        let options = {
            defaultViewport: this.props.defaultViewport,
            options: this.props.options,
            metadata: this.props.metadata,
            status: this.props.status,
            url: this.props.url,
            zIndex: this.props.zIndex
        }
        this.kmlLayer = new google.maps.KmlLayer({
            map: this.context.map, ...options
        });
        this.kmlLayer.setMap(this.context.map);

        if (this.props.onDefaultViewportChanged) {
            this.kmlLayer.addListener('defaultviewport_changed', this.props.onDefaultViewportChanged);
        }
        if (this.props.onClick) {
            this.kmlLayer.addListener('click', this.props.onClick);
        }
        if (this.props.onStatusChanged) {
            this.kmlLayer.addListener('status_changed', this.props.onStatusChanged);
        }
    }

    getDefaultViewport() { return this.kmlLayer.getDefaultViewport(); }
    getMetadata() { return this.kmlLayer.getMetadata(); }
    getOptions() { return this.kmlLayer.getOptions(); }
    getStatus() { return this.kmlLayer.getStatus(); }
    getUrl() { return this.kmlLayer.getUrl(); }
    getZIndex() { return this.kmlLayer.getZIndex(); }
    defaultViewport(defaultViewport) { this.kmlLayer.setDefaultViewport(defaultViewport); }
    metadata(metadata) { this.kmlLayer.setMetadata(metadata); }
    options(options) { this.kmlLayer.setOptions(options); }
    status(status) { this.kmlLayer.setStatus(status); }
    url(url) { this.kmlLayer.setUrl(url); }
    zIndex(zIndex) { this.kmlLayer.setZIndex(zIndex); }

    componentWillUnmount() {
        if (this.kmlLayer) {
            this.kmlLayer.setMap(null);
        }
    }

    render() {
        return false;
    }
}


AnterosKmlLayer.propTypes = {
    defaultViewport: PropTypes.any,
    options: PropTypes.any,
    metadata: PropTypes.any,
    status: PropTypes.any,
    url: PropTypes.string,
    zIndex: PropTypes.number,
    onClick: PropTypes.func,
    onDefaultViewportChanged: PropTypes.func,
    onStatusChanged: PropTypes.func
}

AnterosKmlLayer.defaultProps = {
    visible: true
}

AnterosKmlLayer.contextTypes = {
    map: PropTypes.object,
}



export class AnterosTrafficLayer extends React.Component {
    constructor(props) {
        super(props);
        this.trafficLayer;
        this.options = this.setOptions.bind(this);
    }

    componentDidMount() {
        let options = {
            options: this.props.options
        }
        this.trafficLayer = new google.maps.TrafficLayer({
            map: this.context.map, ...options
        });
    }

    options(options) { this.trafficLayer.setOptions(options); }

    componentWillUnmount() {
        if (this.trafficLayer) {
            this.trafficLayer.setMap(null);
        }
    }

    render() {
        return false;
    }
}


AnterosTrafficLayer.propTypes = {
    options: PropTypes.object,
    onClick: PropTypes.func,
    onDefaultViewportChanged: PropTypes.func,
    onStatusChanged: PropTypes.func
}

AnterosTrafficLayer.defaultProps = {

}

AnterosTrafficLayer.contextTypes = {
    map: PropTypes.object,
}

export class AnterosHeatmapLayer extends React.Component {
    constructor(props) {
        super(props);
        this.heatmapLayer;
        this.data = this.setData.bind(this);
        this.options = this.setOptions.bind(this);
    }

    componentDidMount() {
        let options = {
            data: this.props.data,
            options: this.props.options
        }
        this.heatmapLayer = new google.maps.visualization.HeatmapLayer({
            map: this.context.map, ...options
        });

        if (this.props.onZoomChanged) {
            this.heatmapLayer.addListener('zoom_changed', this.props.onZoomChanged);
        }
    }

    componentWillUnmount() {
        if (this.heatmapLayer) {
            this.heatmapLayer.setMap(null);
        }
    }

    data(data) { this.heatmapLayer.setData(data); }
    options(options) { this.heatmapLayer.setOptions(options); }

    render() {
        return false;
    }
}

AnterosHeatmapLayer.propTypes = {
    data: PropTypes.any,
    options: PropTypes.object,
    onZoomChanged: PropTypes.func
}

AnterosHeatmapLayer.contextTypes = {
    map: PropTypes.object,
}


export class AnterosFusionTablesLayer extends React.Component {
    constructor(props) {
        super(props);
        this.fusionTablesLayer;
        this.options = this.setOptions.bind(this);
    }

    options(options) { this.fusionTablesLayer.setOptions(options); }

    componentDidMount() {
        let options = {
            options: this.props.options
        }
        this.fusionTablesLayer = new google.maps.FusionTablesLayer({
            map: this.context.map, ...options
        });

        if (this.props.onClick) {
            this.fusionTablesLayer.addListener('click', this.props.onClick);
        }
    }

    componentWillUnmount() {
        if (this.fusionTablesLayer) {
            this.fusionTablesLayer.setMap(null);
        }
    }

    render() {
        return false;
    }
}

AnterosFusionTablesLayer.propTypes = {
    options: PropTypes.object,
    onClick: PropTypes.func
}

AnterosFusionTablesLayer.contextTypes = {
    map: PropTypes.object,
}


export class AnterosStreetViewPanorama extends React.Component {

    constructor(props) {
        super(props);
        this.streetViewPanorama;

        this.getLinks = this.getLinks.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.getMotionTracking = this.getMotionTracking.bind(this);
        this.getPano = this.getPano.bind(this);
        this.getPhotographerPov = this.getPhotographerPov.bind(this);
        this.getPosition = this.getPosition.bind(this);
        this.getPov = this.getPov.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.getVisible = this.getVisible.bind(this);
        this.getZoom = this.getZoom.bind(this);
        this.links = this.setLinks.bind(this);
        this.motionTracking = this.setMotionTracking.bind(bind);
        this.options = this.setOptions.bind(this);
        this.pano = this.setPano.bind(this);
        this.panoProvider = this.registerPanoProvider.bind(this);
        this.position = this.setPosition.bind(this);
        this.pov = this.setPov.bind(this);
        this.visible = this.setVisible.bind(this);
        this.zoom = this.setZoom.bind(this);

        this.streetViewPanorama;
        if (!this.props.containerElement && this.context.map) {
            this.streetViewPanorama = this.context.map.getStreetView();
            this.streetViewPanorama.setOptions(this.getInitialOptions());
        }
        if (!this.props.containerElement && !this.context.map) {
            throw new Error(`Você precisa usar AnterosStreetViewPanorama no contexto do mapa ou passar um containerElement para renderizá-lo.`);
        }

    }

    getLinks() { return this.streetViewPanorama.getLinks(); }
    getLocation() { return this.streetViewPanorama.getLocation(); }
    getMotionTracking() { return this.streetViewPanorama.getMotionTracking(); }
    getPano() { return this.streetViewPanorama.getPano(); }
    getPhotographerPov() { return this.streetViewPanorama.getPhotographerPov(); }
    getPosition() { return this.streetViewPanorama.getPosition(); }
    getPov() { return this.streetViewPanorama.getPov(); }
    getStatus() { return this.streetViewPanorama.getStatus(); }
    getVisible() { return this.streetViewPanorama.getVisible(); }
    getZoom() { return this.streetViewPanorama.getZoom(); }
    links(links) { this.streetViewPanorama.setLinks(links); }
    motionTracking(motionTracking) { this.streetViewPanorama.setMotionTracking(motionTracking); }
    options(options) { this.streetViewPanorama.setOptions(options); }
    pano(pano) { this.streetViewPanorama.setPano(pano); }
    panoProvider(panoProvider) { this.streetViewPanorama.registerPanoProvider(panoProvider); }
    position(position) { this.streetViewPanorama.setPosition(position); }
    pov(pov) { this.streetViewPanorama.setPov(pov); }
    visible(visible) { this.streetViewPanorama.setVisible(visible); }
    zoom(zoom) { this.streetViewPanorama.setZoom(zoom); }

    getChildContext() {
        return {
            map: this.state.streetViewPanorama
        };
    }

    handleComponentMount(container) {
        this.container = container;
        if (this.container) {
            let options = {
                links: this.props.links,
                motionTracking: this.props.motionTracking,
                options: this.props.options,
                pano: this.props.pano,
                panoProvider: this.props.panoProvider,
                position: this.props.position,
                pov: this.props.pov,
                visible: this.props.visible,
                zoom: this.props.zoom
            }
            this.streetViewPanorama = new google.maps.StreetViewPanorama(this.container, {
                map: this.context.map, ...options
            });
            if (this.props.onCloseClick) {
                this.streetViewPanorama.addListener('closeclick', this.props.onCloseClick);
            }
            if (this.props.onPanoChanged) {
                this.streetViewPanorama.addListener('pano_changed', this.props.onPanoChanged);
            }
            if (this.props.onPositionChanged) {
                this.streetViewPanorama.addListener('position_changed', this.props.onPositionChanged);
            }
            if (this.props.onLinksChanged) {
                this.streetViewPanorama.addListener('links_changed', this.props.onLinksChanged);
            }
            if (this.props.onPovChanged) {
                this.streetViewPanorama.addListener('pov_changed', this.props.onPovChanged);
            }
            if (this.props.onResize) {
                this.streetViewPanorama.addListener('resize', this.props.onResize);
            }
            if (this.props.onStatusChanged) {
                this.streetViewPanorama.addListener('status_changed', this.props.onStatusChanged);
            }
            if (this.props.onVisibleChanged) {
                this.streetViewPanorama.addListener('visible_changed', this.props.onVisibleChanged);
            }
            if (this.props.onZoomChanged) {
                this.streetViewPanorama.addListener('zoom_changed', this.props.onZoomChanged);
            }
            if (this.context.map) {
                this.context.map.setStreetView(this.streetViewPanorama);
            }
            this.setState({ streetViewPanorama: streetViewPanorama });
        }
    }

    componentWillUnmount() {
        if (this.streetViewPanorama) {
            this.streetViewPanorama.setVisible(false);
        }
    }

    render() {
        if (this.props.containerElement) {
            return (
                React.cloneElement(
                    this.props.containerElement,
                    { ref: this.handleComponentMount },
                    this.props.children,
                )
            );
        }
        return <div>{this.props.children}</div>;
    }
}

AnterosStreetViewPanorama.propTypes = {
    links: PropTypes.array,
    motionTracking: PropTypes.bool,
    options: PropTypes.object,
    pano: PropTypes.string,
    panoProvider: PropTypes.func,
    position: PropTypes.object,
    pov: PropTypes.object,
    visible: PropTypes.bool,
    zoom: PropTypes.number,
    onCloseClick: PropTypes.func,
    onPanoChanged: PropTypes.func,
    onPositionChanged: PropTypes.func,
    onLinksChanged: PropTypes.func,
    onPovChanged: PropTypes.func,
    onResize: PropTypes.func,
    onStatusChanged: PropTypes.func,
    onVisibleChanged: PropTypes.func,
    onZoomChanged: PropTypes.func
}

AnterosStreetViewPanorama.contextTypes = {
    map: PropTypes.object,
}

AnterosStreetViewPanorama.childContextTypes = {
    map: PropTypes.object
}



export class AnterosDrawingManager extends React.Component {
    constructor(props) {
        super(props);
        this.drawingManager;
        this.getDrawingMode = this.getDrawingMode.bind(this);
        this.drawingMode = this.setDrawingMode.bind(this);
        this.options = this.setOptions.bind(this);

    }

    componentDidMount() {
        let options = {
            drawingMode: this.props.drawingMode,
            options: this.props.options
        }
        this.drawingManager = new google.maps.drawing.DrawingManager({ map: this.context.map, ...options });
        if (this.props.onCircleComplete) {
            this.drawingManager.addListener('circlecomplete', this.props.onCircleComplete);
        }
        if (this.props.onMarkerComplete) {
            this.drawingManager.addListener('markercomplete', this.props.onMarkerComplete);
        }
        if (this.props.onOverlayComplete) {
            this.drawingManager.addListener('overlaycomplete', this.props.onOverlayComplete);
        }
        if (this.props.onPolygonComplete) {
            this.drawingManager.addListener('polygoncomplete', this.props.onPolygonComplete);
        }
        if (this.props.onPolylineComplete) {
            this.drawingManager.addListener('polylinecomplete', this.props.onPolylineComplete);
        }
        if (this.props.onRectangleComplete) {
            this.drawingManager.addListener('rectanglecomplete', this.props.onRectangleComplete);
        }
    }

    componentWillUnmount() {
        if (this.drawingManager) {
            this.drawingManager.setMap(null);
        }
    }

    getDrawingMode() { return this.drawingManager.getDrawingMode(); }
    drawingMode(drawingMode) { this.drawingManager.setDrawingMode(drawingMode); }
    options(options) { this.drawingManager.setOptions(options); }

    render() {
        return false;
    }
}


AnterosDrawingManager.propTypes = {
    drawingMode: PropTypes.any,
    options: PropTypes.object,
    onCircleComplete: PropTypes.func,
    onMarkerComplete: PropTypes.func,
    onOverlayComplete: PropTypes.func,
    onPolygonComplete: PropTypes.func,
    onPolylineComplete: PropTypes.func,
    onRectangleComplete: PropTypes.func
}


AnterosDrawingManager.contextTypes = {
    map: PropTypes.object,
}

export class AnterosDirectionsRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.directionsRenderer;
        this.getDirections = this.getDirections.bind(this);
        this.getPanel = this.getPanel.bind(this);
        this.getRouteIndex = this.getRouteIndex.bind(this);
        this.directions = this.setDirections.bind(this);
        this.options = this.setOptions.bind(this);
        this.panel = this.setPanel.bind(this);
        this.routeIndex = this.setRouteIndex.bind(this);
    }

    componentDidMount() {
        let options = {
            directions: this.props.directions,
            options: this.props.options,
            panel: this.props.panel,
            routeIndex: this.props.routeIndex
        }
        this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.context.map, ...options });
        if (this.props.onDirectionsChanged) {
            this.directionsRenderer.addListener('directions_changed', this.props.onDirectionsChanged);
        }
    }

    componentWillUnmount() {
        if (this.directionsRenderer) {
            this.directionsRenderer.setMap(null);
        }
    }

    getDirections() { return this.directionsRenderer.getDirections(); }
    getPanel() { return this.directionsRenderer.getPanel(); }
    getRouteIndex() { return this.directionsRenderer.getRouteIndex(); }
    directions(directions) { this.directionsRenderer.setDirections(directions); }
    options(options) { this.directionsRenderer.setOptions(options); }
    panel(panel) { this.directionsRenderer.setPanel(panel); }
    routeIndex(routeIndex) { this.directionsRenderer.setRouteIndex(routeIndex); }

    render() {
        return false;
    }
}

AnterosDirectionsRenderer.propTypes = {
    directions: PropTypes.any,
    options: PropTypes.object,
    panel: PropTypes.object,
    routeIndex: PropTypes.number,
    onDirectionsChanged: PropTypes.func
}
