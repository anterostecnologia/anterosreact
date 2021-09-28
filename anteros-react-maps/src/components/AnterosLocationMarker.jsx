import * as L from 'leaflet';
import * as React from 'react';
import { Marker, Tooltip } from 'react-leaflet';

const homeIcon = L.icon({
  iconAnchor: [12, 12],
  iconSize: [24, 24],
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAA3FJREFUSImllF9oW1UYwH/nntz8adrUZtmmnWs70XYP24N/JlJFZPowi2DBtCux4pDR94kMmUwcDpmIDJXpg2/SbGZxA/swERFhiGxWHwZBpINR7HDQNo1pmpib5J7jy3qbk5sqm9/b9+O73+9853xcwV1EMpmMSzv4GYicatTey2az7ma14k6bj6dST+PqtGVZ9wOguax1YzKTySz8L8HU1JRdLJXf1kod64rFrJBt49TrhGyb5XyhIKQ+nDl79uJ/CsbGxjqltF+TUmTT6fQtgFQq9YBSOo2wngAYHBwkHu9hZaVAPN7DlStXbw/D57YUR6anp8vtBOLgwdS4ZekPd7vVHXMiVHKFdUJrFoXQZxBW13phtLOT5glWCgWviVL8jhYT589PX/ME4+OTeyzpfrJT1Z8Zqy8x4FbJC5sLwQQ5GfVd12YTNEVNw9HMufTHYmLi5VNRod54oZaXw41VBNqozMkoF4IJ8sLe5HX+Nb6xlODQ69UF+WSj6GsOsMct81b1D6KouxE8HwAIa0Xl0acojUz4KiK//kjs0pdIrTjuLNCpNl15X5yM9BPQjdpQl2rMVWRg20UnwQdLMa9gtLvCO/bG1YS1ojY6iQ51eCz29ReUDiQNts5Hq0tDgWw2Wzzz4j4NsK/D4d17NzZiR8B/2uruhzlR7qOkBce3FYldOmcwwOOPlQqrgeaP5x3JTHFja4ajVR5pM3qnVKAsY8fXGZi7bwj+bAT4oRz28i1tJgDYGXSpugoptI8BBjcEw1GH0715L293RQCfLneRdyUHuio+BhjcE4Su59ib+Yi9Lc2sv5Z9gpe6K5SVIGJpHwMM7gl0KEyjZ4uvme1Ujbxj9jJHQ7ev8TpQr5msiRuCWt+D/PLsK/xcCXl1D4Xr7M99S/DGbx6LXPsJxMYziprjY+vcEADM1wPMlDb2+Tn9N/tbJsoffpP5YBwX6Au69L5/xGA0ceEUTMHjEYf+7Q0v75btfw+HbibIu5Lvd92it4UBBjcE361FOLl4j5cnu8ucaiP4qn8JpTXxgPYxwOCGoFsqhkJ1L9++yZq+ejPBSsNiZmCR+1oYYHBPYFXKjKzNMRJs6lQDa7VAa5RdwZqy0Fr7GGBwTxDOzRLOzbY9cWvMDCyigahQPkYLD3CHsfX0MbY2raTlVH1snWvgH3jqgl1xwySaAAAAAElFTkSuQmCC',
  popupAnchor: [0, -10],
  shadowAnchor: [16, 2],
  shadowSize: [50, 16],
  shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAQCAYAAABUWyyMAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsAAAA7ABJ8QPrQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHISURBVEiJzZbpUsJAEIQ/5AgoCrz/QyoeiFzxx3ZXxiUJkmCVXTUVspuQ7pnp3R3wfzDIrkaZXVtf/mvUfWeguFMMFX72GOKkgAZBoxuSzQnmEeeH+vYYKICJ4k6Ed8AXsNXvvd5trM4thMTMOqsmOdR4fGYk8gUwlYCx5o4ivgU2Gt9obkdVnTMxfYTEzBbALEQRhMTeH2VhoSZ2JGV/ovl8ziLO0EWIMzsW6TnwqLivIeF32lquVPj+RJUI35fh2ru1nNUCeAAWwFIiZkFAk7kvwf7YAGvgBXgjtdqBSkinP68TMQdWQcRUc7mxfwNn2gJeJWCte3uj9/Jrcm6lJwlYkqpS8NML1wgoSZnekjL/onjXWKsvcpKX5oekvncrrXSdkcTdogpr4JmqCnta2qiJaBO8VE5JrbSUiLnG4opzDU6kTH+RMv/MuRdqDd2GOrN7VZqQViEbekG1KnUR4CrsgU9+VuFD4xe90IS8Im6lQqQtIBq6qwjvER8k8muSsbcav7oKEbEi3pldiTlJEFRHhS5nM5+TdqRKvFOZuVcVIuKuayE+Xoyp39h+C5OzJw4k4nsu7AldkB/m6g55fREPer3apw3fjTiMxz7HLS8AAAAASUVORK5CYII=',
});

function createIcon(nrSequencia) {
  let icon = L.ExtraMarkers.icon({
      icon: 'fa-number',
      markerColor: 'cyan',
      shape: 'square',
      prefix: 'fa',
      number: nrSequencia
  });

  return icon;
}

const AnterosLocationMarker = ({
  index,
  location,
  isDepot,
  isSelected,
  removeHandler,
  popupMarkerCreator
}) => {
  const icon = isDepot ? homeIcon : createIcon(index);
  return (
    <Marker
      key={location.id}
      position={location}
      icon={icon}
    >
     {popupMarkerCreator? popupMarkerCreator(location.description):<Tooltip
        key={isSelected ? 'selected' : ''}
        permanent={isSelected}
      >
        {`Location ${location.id} [Lat=${location.lat}, Lng=${location.lng}]`}
      </Tooltip>}
    </Marker>
  );
};

export default AnterosLocationMarker;
