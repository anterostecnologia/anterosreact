import * as L from 'leaflet';
import * as React from 'react';
import { Map, Polyline, Rectangle, TileLayer, ZoomControl } from 'react-leaflet';
import AnterosLocationMarker from './AnterosLocationMarker';

const colors = ['deepskyblue', 'crimson', 'seagreen', 'slateblue', 'gold', 'darkorange'];

function color(index) {
  return colors[index % colors.length];
}

function createMarkers(visits, selectedId, popupMarkerCreator) {
  let markers = [];
  visits.forEach(function (item, index) {
    markers.push(<AnterosLocationMarker
      key={item.id}
      index={index + 1}
      popupMarkerCreator={popupMarkerCreator}
      location={item}
      isDepot={false}
      isSelected={visits.id === selectedId}
    />);
  })
  return markers;
}

const AnterosRouteMap = ({
  boundingBox,
  userViewport,
  selectedId,
  depot,
  routes,
  clickHandler,
  removeHandler,
  updateViewport,
  popupMarkerCreator

}) => {
  const bounds = boundingBox ? new L.LatLngBounds(boundingBox[0], boundingBox[1]) : undefined;
  const mapBounds = userViewport.isDirty ? undefined : bounds;
  const tileLayerUrl = window.Cypress ? 'test-mode-empty-url' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  return (
    <Map
      bounds={mapBounds}
      viewport={userViewport}
      onViewportChanged={updateViewport}
      onClick={clickHandler}
      style={{ width: '100%', height: 'calc(100vh - 176px)', border: '1px solid silver' }}
      zoomControl={false}
    >
      <TileLayer
        attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
        url={tileLayerUrl}
      />
      <ZoomControl position="topright" />
      {depot && (
        <AnterosLocationMarker
          location={depot}
          isDepot
          isSelected={depot.id === selectedId}
          removeHandler={removeHandler}
        />
      )}
      {routes.map((route) => (
        createMarkers(route.visits, selectedId, popupMarkerCreator)
      ))}
      {routes.map((route, index) => (
        <Polyline
          key={index}
          positions={route.track}
          fill={false}
          color={color(index)}
        />
      ))}
      {bounds && (
        <Rectangle
          bounds={bounds}
          color="seagreen"
          fill={false}
          dashArray="10,5"
          weight={1}
        />
      )}
    </Map>
  );
};

export default AnterosRouteMap;
