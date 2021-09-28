import { Control, DomUtil, DomEvent, icon, LatLng, Marker as LeafletMarker } from "leaflet";
import React from "react";
import ReactDOM from "react-dom";
import { Popup, MapControl, LeafletProvider, withLeaflet, MapLayer } from "react-leaflet";
import PropTypes from "prop-types";
import { autoBind } from "@anterostecnologia/anteros-react-core";


const defaultPoint = new LatLng(-23.425269, -51.9382078);


class AnterosLeafletSearch extends MapControl {
    constructor(props, context) {
        super(props);
        this.div = DomUtil.create("div", "leaflet-search-wrap");
        DomEvent.disableClickPropagation(this.div);
        DomEvent.disableScrollPropagation(this.div);
        this.state = {
            search: defaultPoint,
            info: false
        };
        this.markerIcon = icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });
        this.SearchInfo = null;
        this.map = context.map || props.leaflet.map;
        this.markerRef = React.createRef();
        autoBind(this);
    }

    createLeafletElement(props) {
        const AnterosLeafletSearchControl = Control.extend({
            onAdd: (map) => this.div,
            onRemove: (map) => { }
        });
        return new AnterosLeafletSearchControl(props);
    }

    handler = ({ event, payload }) => {
        if (event === "add") {
            payload && this.latLngHandler(payload.latlng, payload.info, payload.raw);
        } else {
            this.removeMarkerHandler();
        }
    };

    latLngHandler(latLng, info, raw) {
        this.SearchInfo = { info, latLng, raw };
        let popUpStructure = (
            <div>
                {info ? (
                    <>
                        <p>{Array.isArray(info) ? info.toString() : info}</p>
                        <div className="search-control-popup-seperator"></div>
                    </>
                ) : null
                }
                <div>{`latitude: ${latLng.lat}`}</div>
                <div>{`longitude: ${latLng.lng}`}</div>
            </div>);
        if (raw) {
            popUpStructure = (
                <div>
                    <p>{Array.isArray(info) ? info.toString() : info}</p>
                    <div className="search-control-popup-seperator"></div>
                    <div>{`Latitude: ${latLng.lat}`}</div>
                    <div>{`Longitude: ${latLng.lng}`}</div>
                </div>
            );
        } else {
            //
        }
        this.goToLatLng(latLng, popUpStructure);
    }

    removeMarkerHandler() {
        this.setState({ search: false });
    }

    goToLatLng(latLng, info) {
        if (this.props.onChangeLatLng) {
            this.props.onChangeLatLng(latLng, info);
        }
        let _this = this;
        this.setState({ search: latLng, info: info }, () => {
            _this.flyTo();
        });
    }
    flyTo() {
        if (this.state.search) {
            switch (this.props.mapStateModifier) {
                case "flyTo":
                    this.map && this.map.flyTo(this.state.search, this.props.zoom, this.props.zoomPanOptions);
                    break;
                case "setView":
                    this.map && this.map.setView(this.state.search, this.props.zoom, this.props.zoomPanOptions);
                    break;
                default:
                    typeof this.props.mapStateModifier === "function" && this.props.mapStateModifier(this.state.search);
            }
        }
    }

    componentDidMount() {
        super.componentDidMount && super.componentDidMount();
        if (this.state.search.lat === defaultPoint.lat && this.state.search.lng === defaultPoint.lng) {
            this.latLngHandler(defaultPoint, 'Ponto inicial', undefined);
        }
        ReactDOM.render(
            <AnterosSearchControl
                className={this.props.className}
                provider={this.props.provider}
                customProvider={this.props.customProvider}
                providerOptions={this.props.providerOptions}
                openSearchOnLoad={this.props.openSearchOnLoad}
                closeResultsOnClick={this.props.closeResultsOnClick}
                inputPlaceholder={this.props.inputPlaceholder}
                search={this.props.search}
                map={this.map}
                handler={this.handler}
                removeMarker={this.handler}
                {...(this.props.tabIndex !== undefined ? { tabIndex: this.props.tabIndex } : {})}
            />,
            this.div
        );
    }

    componentDidUpdate() {
        this.markerRef.current && this.markerRef.current.leafletElement.openPopup();
    }

    onDragEnd(event) {
        this.latLngHandler(event.target.getLatLng());
        if (this.props.onDragEnd(event)) {
            this.props.onDragEnd(event);
        }
    }

    defaultPopUp() {
        return (
            <Popup className="default-popup">
                <span>{this.state.info}</span>
            </Popup>
        );
    }

    render() {
        return this.SearchInfo && this.state.search && this.props.showMarker ? (
            <AnterosDraggableMarkerLeaftLet
                draggable={true}
                onDragEnd={this.onDragEnd}
                ref={this.markerRef}
                icon={this.props.markerIcon || this.markerIcon}
                key={`marker-search-${this.state.search.toString()}`}
                position={this.state.search}
            >
                {this.props.showPopup && (this.props.popUp ? this.props.popUp(this.SearchInfo) : this.defaultPopUp())}
            </AnterosDraggableMarkerLeaftLet>
        ) : null;
    }
}

AnterosLeafletSearch.propTypes = {
    onChangeLatLng: PropTypes.func
}

AnterosLeafletSearch.defaultProps = {
    inputPlaceholder: "Localizar",
    showMarker: true,
    showPopup: true,
    zoom: 10,
    closeResultsOnClick: false,
    openSearchOnLoad: false,
    search: undefined,
    provider: "OpenStreetMap",
    mapStateModifier: "flyTo",
    zoomPanOptions: {
        animate: true,
        duration: 0.25,
        easeLinearity: 0.25,
        noMoveStart: false
    }
};


class AnterosSearchControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: this.props.openSearchOnLoad,
            closeButton: false,
            showInfo: false
        };
        this.SearchResponseInfo = "";
        this.responseCache = {};
        this.lastInfo = null;
        this.inputValueSetter = () => { };
        this.selectbox = React.createRef();
        this.div = React.createRef();
        this.input = React.createRef();
        if (this.props.customProvider) {
            this.provider = this.props.customProvider;
        } else if (this.props.provider) {
            if (this.props.provider === "OpenStreetMap") {
                this.provider = new OpenStreetMap(this.props.providerOptions);
            } else if (this.props.provider === "BingMap") {
                this.provider = new BingMap(this.props.providerOptions);
            }
        } else {
            throw new Error(
                `Você definiu o suporte do provedor como ${this.props.provider} mas isso não é reconhecido."
                )}`
            );
        }
        autoBind(this);
    }

    setLock(value) {
        this.lock = value;
    };

    openSearch() {
        this.setState({ open: true }, () => {
            this.input.current.focus();
        });
    };
    closeSearch = () => {
        this.setState({ open: this.props.openSearchOnLoad, closeButton: false, showInfo: false }, () => {
            this.inputValueSetter("");
            this.SearchResponseInfo = "";
            this.props.removeMarker && this.props.removeMarker({ event: "remove" });
        });
    };

    aClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.state.open ? this.closeSearch() : this.openSearch();
    };
    inputBlur(e) {
        this.input.current.value === "" && !this.lock && this.closeSearch();
    };
    inputClick(e) {
        this.input.current.focus();
        if (!this.input.current.value.startsWith(":") && this.lastInfo !== null && this.lastInfo !== "" && this.input.current.value !== "") {
            this.SearchResponseInfo = this.lastInfo;
            this.lastInfo = null;
            this.setState({ showInfo: true });
        }
    };
    inputKeyUp(e) {
        e.keyCode === 13 && this.beautifyValue(this.input.current.value);
    };
    closeClick(e) {
        this.closeSearch();
    };

    async sendToAction(e) {
        if (!this.input.current.value.startsWith(":")) {
            if (Object.prototype.hasOwnProperty.call(this.responseCache, this.input.current.value)) {
                this.showInfo(this.responseCache[this.input.current.value].info);
            } else {
                if (this.input.current.value.length >= 3) {
                    this.showInfo("Localizando...");
                    const response = await this.provider.search(this.input.current.value);
                    if (response.error) {
                        return false;
                    }
                    this.responseCache[this.input.current.value] = response;
                    this.showInfo(response.info);
                }
            }
        }
    };
    syncInput() {
        !this.state.closeButton && this.setState({ closeButton: true });
        if (this.input.current.value === "") {
            this.hideInfo();
            this.state.closeButton && this.setState({ closeButton: false });
        }
        if (!this.input.current.value.startsWith(":")) {
            //
        }
    };

    beautifyValue(value) {
        if (value.startsWith(":")) {
            const latLng = value
                .slice(1)
                .split(",")
                .filter((e) => !isNaN(Number(e)))
                .map((e) => Number(e ? e : 0));
            if (latLng.length <= 1) {
                this.showInfo("Digita uma lat/long válida");
            } else {
                this.hideInfo();
                this.props.handler &&
                    this.props.handler({
                        event: "add",
                        payload: {
                            latlng: new LatLng(Number(latLng[0]), Number(latLng[1])),
                            info: latLng.join(","),
                            raw: latLng.join(",")
                        }
                    });
            }
        } else {
            if (this.input.current.value.length < 3) {
                const response = 'Digite um lat, lng válido, começando com ":" ou no mínimo 3 caracteres para pesquisar';
                this.showInfo(response);
            }
        }
    }

    hideInfo() {
        this.lastInfo = this.SearchResponseInfo;
        this.SearchResponseInfo = "";
        this.setState({ showInfo: false });
    }
    showInfo(info, activeIndex) {
        this.SearchResponseInfo = (
            <SearchInfoList
                ref={this.selectbox}
                activeIndex={activeIndex}
                list={info}
                handler={this.listItemClick}
                tabIndex={this.props.tabIndex !== undefined ? this.props.tabIndex + 1 : 2}
            />
        );
        this.input.current.value && this.setState({ showInfo: true });
    }

    listItemClick(itemData, totalInfo, activeIndex) {
        this.showInfo(totalInfo, activeIndex);
        this.props.handler &&
            this.props.handler({
                event: "add",
                payload: {
                    latlng: new LatLng(Number(itemData.latitude), Number(itemData.longitude)),
                    info: itemData.name,
                    raw: this.responseCache[this.input.current.value]
                }
            });
        if (this.props.closeResultsOnClick) {
            this.hideInfo();
        }
    };

    setMaxHeight() {
        const containerRect = this.props.map ? this.props.map.getContainer().getBoundingClientRect() : document.body.getBoundingClientRect();
        const divRect = this.input.current.getBoundingClientRect();
        const maxHeight = `${Math.floor((containerRect.bottom - divRect.bottom - 10) * 0.6)}px`;
        this.selectbox.current && this.selectbox.current.style && (this.selectbox.current.style.maxHeight = maxHeight);
    };

    componentDidMount() {
        this.setMaxHeight();
        if (this.props.search && !isNaN(Number(this.props.search.lat)) && !isNaN(Number(this.props.search.lng))) {
            const inputValue = `:${this.props.search.lat},${this.props.search.lng}`;
            this.inputValueSetter(inputValue);
            this.openSearch();
            this.syncInput();
            this.props.handler &&
                this.props.handler({
                    event: "add",
                    payload: {
                        latlng: new LatLng(Number(this.props.search.lat), Number(this.props.search.lng)),
                        info: inputValue,
                        raw: this.props.search
                    }
                });
        }
    }

    componentDidUpdate() {
        this.setMaxHeight();
        if (this.state.showInfo) {
            // this.selectbox.current && this.selectbox.current.focus();
        }
    }

    render() {
        return (
            <article className={`${this.props.className ? `${this.props.className} ` : ""}search-control-wrap`}>
                <section className={`search-control${this.state.open ? " search-control-active" : ""}`}>
                    <SearchIconButton
                        className="search-control-icon-button"
                        onClick={this.aClick}
                        onMouseEnter={() => this.setLock(true)}
                        onMouseLeave={() => this.setLock(false)}
                    />
                    <SearchInput
                        tabIndex={this.props.tabIndex !== undefined ? this.props.tabIndex : 1}
                        ref={this.input}
                        getInputValueSetter={(fn) => (this.inputValueSetter = fn)}
                        className="search-control-input"
                        placeholder={this.props.inputPlaceholder}
                        onClick={this.inputClick}
                        onMouseEnter={() => this.setLock(true)}
                        onMouseLeave={() => this.setLock(false)}
                        onChange={this.syncInput}
                        onChangeAsync={this.sendToAction}
                        onBlur={this.inputBlur}
                        onKeyUp={this.inputKeyUp}
                        onKeyPress={(e) => {
                            e.stopPropagation();
                            e.keyCode === 40 && e.preventDefault();
                        }}
                        onKeyDown={(e) => {
                            if (e.keyCode === 40) {
                                e.preventDefault();
                                e.stopPropagation();
                                this.selectbox.current.focus();
                            }
                        }}
                        onSubmit={(e) => e.preventDefault()}
                    />
                    <SearchCloseButton className={this.state.closeButton ? " search-control-close-button-active" : ""} onClick={this.closeClick} />
                </section>
                <section className={`search-control-info-wrapper${this.state.showInfo ? "" : " search-control-info-wrapper-close"}`}>
                    <section ref={this.div} className={`search-control-info`}>
                        {this.state.showInfo && this.SearchResponseInfo}
                    </section>
                </section>
            </article>
        );
    }
}

AnterosSearchControl.propTypes = {
    provider: PropTypes.string,
    providerKey: PropTypes.string,
    inputPlaceholder: PropTypes.string,
    coords: PropTypes.arrayOf(PropTypes.number),
    closeResultsOnClick: PropTypes.bool,
    openSearchOnLoad: PropTypes.bool,
    searchBounds: PropTypes.array,
    providerOptions: PropTypes.object
};

AnterosSearchControl.defaultProps = {
    inputPlaceholder: "Localizar",
    closeResultsOnClick: false,
    openSearchOnLoad: false,
    search: undefined,
    provider: "OpenStreetMap"
};

const SearchInputCore = (
    {
        placeholder = "PlaceHolder",
        type = "text",
        initialValue = "",
        className = "",
        debounceTime = 400,
        getInputValueSetter = () => { },
        onClick = () => { },
        onDoubleClick = () => { },
        onMouseDown = () => { },
        onMouseEnter = () => { },
        onMouseLeave = () => { },
        onChange = () => { },
        onChangeAsync = () => { },
        onFocus = () => { },
        onBlur = () => { },
        onKeyUp = () => { },
        onKeyDown = () => { },
        onKeyPress = () => { },
        onSubmit = () => { },
        tabIndex = 0
    },
    ref
) => {
    const [value, setValue] = React.useState(initialValue);
    const handlerDefaults = React.useCallback((e, cb) => {
        cb(e);
    }, []);
    const inputHandlers = React.useCallback(
        asyncInputEvent(
            (e) => {
                e.preventDefault();
                e.stopPropagation();
                onChangeAsync(e);
            },
            (e) => {
                e.preventDefault();
                e.stopPropagation();
                setValue(e.target.value);
                onChange(e);
            },
            debounceTime
        ),
        [setValue]
    );
    React.useLayoutEffect(() => {
        getInputValueSetter(setValue);
    });
    return (
        <input
            tabIndex={tabIndex}
            ref={ref}
            type={type}
            name="SearchInput"
            value={value}
            placeholder={placeholder}
            className={`search-input${className ? ` ${className}` : ""}`}
            onClick={(e) => handlerDefaults(e, onClick)}
            onDoubleClick={(e) => handlerDefaults(e, onDoubleClick)}
            onMouseEnter={(e) => handlerDefaults(e, onMouseEnter)}
            onMouseLeave={(e) => handlerDefaults(e, onMouseLeave)}
            onMouseDown={(e) => handlerDefaults(e, onMouseDown)}
            onChange={inputHandlers}
            onFocus={(e) => handlerDefaults(e, onFocus)}
            onBlur={(e) => handlerDefaults(e, onBlur)}
            onKeyUp={(e) => handlerDefaults(e, onKeyUp)}
            onKeyDown={(e) => handlerDefaults(e, onKeyDown)}
            onKeyPress={(e) => handlerDefaults(e, onKeyPress)}
            onSubmit={(e) => handlerDefaults(e, onSubmit)}
        />
    );
};

const SearchInput = React.forwardRef(SearchInputCore);

const SearchInfoListItem = ({
    value,
    className,
    candidate,
    onClick,
    onKeyDown,
    children
}) => {
    const r = React.useRef(null);
    React.useEffect(() => {
        if (value === candidate && r.current && r.current.offsetParent) {
            r.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [candidate, value]);
    return (
        <li ref={r} value={value} className={className} onClick={onClick} onKeyDown={onKeyDown}>
            {children}
        </li>
    );
};

const SearchInfoListCore = (
    props,
    ref
) => {
    const { handler, list, tabIndex, activeIndex } = props;
    const [cand, setCand] = React.useState(0);
    const arrowKeyHandler = React.useCallback(e => {
        if (Array.isArray(list)) {
            e.stopPropagation();
            e.keyCode !== 9 && e.preventDefault();
            const length = list.length;
            // Enter 13, Spacebar 32
            if ((!(length <= cand || cand < 0) && e.keyCode === 13) || e.keyCode === 32) {
                handler(list[cand], list, cand);
            } else {
                const c = length <= cand || cand < 0 ? 0 : cand;
                // ArrowUp 38
                if (e.keyCode === 38) {
                    setCand(c === 0 ? list.length - 1 : c - 1);
                }
                // ArrowDown 40
                else if (e.keyCode === 40) {
                    setCand(c + 1 === list.length ? 0 : c + 1);
                }
            }
        }
    },
        [setCand, cand, list]
    );

    React.useLayoutEffect(() => setCand(0), [list]);

    return Array.isArray(list) ? (
        <ul
            ref={ref}
            {...(tabIndex !== undefined ? { tabIndex: props.tabIndex } : {})}
            className="search-control-info-list"
            onKeyDown={arrowKeyHandler}
        >
            {list.map((item, i) => (
                <SearchInfoListItem
                    value={i}
                    candidate={cand}
                    key={`${item.name}-${i}`}
                    className={`search-control-info-list-item${i === activeIndex || item.checked ? " active" : ""}${cand === i ? " candidate" : ""}`}
                    onClick={() => {
                        setCand(i);
                        handler(item, list, i);
                    }}
                    onKeyDown={arrowKeyHandler}
                >
                    {item.name}
                </SearchInfoListItem>
            ))}
        </ul>
    ) : (
            <span className="search-control-info-span">{list}</span>
        );
};

SearchInfoListCore.displayName = "SearchInfoList";

const SearchInfoList = React.forwardRef(SearchInfoListCore);


function asyncInputEvent(asyncHandler, syncHandler, debounceTime = 400) {
    let t;
    return (e) => {
        e.persist();
        syncHandler && syncHandler(e);
        clearTimeout(t);
        t = window.setTimeout(() => {
            asyncHandler(e);
        }, debounceTime);
    };
};

function SearchIconButton({ className = "", onClick = () => { }, onMouseEnter = () => { }, onMouseLeave = () => { } }) {
    return (
        <button
            className={`${className ? className : ""}`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <svg viewBox="0 0 50 50">
                <line x1="35" y1="35" x2="46" y2="46" />
                <circle cx="23" cy="23" r="16" fill="none" />
                Desculpe, seu navegador não suporta SVG embutido.
            </svg>
        </button>
    );
}

function SearchCloseButton({
    className = "",
    onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }
}) {
    return (
        <button className={`search-control-close-button${className ? ` ${className}` : ""}`} onClick={onClick}>
            <svg viewBox="0 0 50 50">
                <path d="M5 5 L45 45 M45 5 L5 45" />
                Sorry, your browser does not support inline SVG.
            </svg>
        </button>
    );
}


class BingMap {
    constructor(options) {
        this.key = options.providerKey;
        //Bounds are expected to be a nested array of [[sw_lat, sw_lng],[ne_lat, ne_lng]].
        // We convert them into a string of 'x1,y1,x2,y2'
        let boundsUrlComponent = "";
        if (options.searchBounds.length) {
            const bounds = options.searchBounds.reduce((acc, b) => [...acc, b.lat, b.lng], []);
            boundsUrlComponent = `&umv=${bounds.join(",")}`;
        }
        this.url = `https://dev.virtualearth.net/REST/v1/Locations?output=json${boundsUrlComponent}&key=${this.key}&q=`;
    }

    async search(query) {
        if (typeof this.key === "undefined") {
            return { error: "O BingMap requer uma chave API" };
        }
        const response = await fetch(this.url + query).then((res) => res.json());
        return this.formatResponse(response);
    }

    formatResponse(response) {
        const resources = response.resourceSets[0].resources;
        const count = response.resourceSets[0].estimatedTotal;
        const info =
            count > 0
                ? resources.map((e) => ({
                    bounds: e.bbox.map((bound) => Number(bound)),
                    latitude: Number(e.point.coordinates[0]),
                    longitude: Number(e.point.coordinates[1]),
                    name: e.name
                }))
                : "Not Found";
        return {
            info: info,
            raw: response
        };
    }
}


class OpenStreetMap {
    constructor(options) {
        //Bounds are expected to be a nested array of [[sw_lat, sw_lng],[ne_lat, ne_lng]].
        // We convert them into a string of 'x1,y1,x2,y2' which is the opposite way around from lat/lng - it's lng/lat
        let boundsUrlComponent = "";
        let regionUrlComponent = "";
        if (options && options.searchBounds && options.searchBounds.length) {
            const reversedBounds = options.searchBounds.reduce((acc, b) => [...acc, b.lng, b.lat], []);
            boundsUrlComponent = `&bounded=1&viewbox=${reversedBounds.join(",")}`;
        }
        if (options && "region" in options) {
            regionUrlComponent = `&countrycodes=${options.region}`;
        }
        this.url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&polygon_svg=1&countrycodes=br&namedetails=1${boundsUrlComponent}${regionUrlComponent}&q=`;
    }

    async search(query) {
        const rawResponse = await fetch(this.url + query);
        const response = await rawResponse.json();
        return this.formatResponse(response);
    }

    formatResponse(response) {
        const resources = response;
        const count = response.length;
        const info =
            count > 0
                ? resources.map((e) => ({
                    bounds: e.boundingbox.map((bound) => Number(bound)),
                    latitude: Number(e.lat),
                    longitude: Number(e.lon),
                    name: e.display_name
                }))
                : "Not Found";
        return {
            info: info,
            raw: response
        };
    }
}








class AnterosDraggableMarker extends MapLayer {
    constructor(props) {
        super(props);
        this.onDragEnd = this.onDragEnd.bind(this);
    }
    createLeafletElement(props) {
        const el = new LeafletMarker(props.position, this.getOptions(props))
        this.contextValue = { ...props.leaflet, popupContainer: el }

        if (this.props.onDragEnd) {
            el.on("dragend", this.onDragEnd);
        }
        return el
    }

    onDragEnd(event) {
        this.options.onDragEnd(event, this.getLatLng());
    }

    updateLeafletElement(fromProps, toProps) {
        if (toProps.position !== fromProps.position) {
            this.leafletElement.setLatLng(toProps.position)
        }
        if (toProps.icon !== fromProps.icon) {
            this.leafletElement.setIcon(toProps.icon)
        }
        if (toProps.zIndexOffset !== fromProps.zIndexOffset) {
            this.leafletElement.setZIndexOffset(toProps.zIndexOffset)
        }
        if (toProps.opacity !== fromProps.opacity) {
            this.leafletElement.setOpacity(toProps.opacity)
        }
        if (toProps.draggable !== fromProps.draggable) {
            if (toProps.draggable === true) {
                this.leafletElement.dragging.enable()
            } else {
                this.leafletElement.dragging.disable()
            }
        }
    }

    render() {
        const { children } = this.props
        return children == null || this.contextValue == null ? null : (
            <LeafletProvider value={this.contextValue}>{children}</LeafletProvider>
        )
    }
}

const AnterosDraggableMarkerLeaftLet = withLeaflet(AnterosDraggableMarker);



export { OpenStreetMap, BingMap };
export { AnterosSearchControl };
export default withLeaflet(AnterosLeafletSearch);
