import PropTypes from 'prop-types';
import React, { PureComponent} from 'react';

function max(data) {
    return Math
        .max
        .apply(Math, data);
}

function min(data) {
    return Math
        .min
        .apply(Math, data);
}

function mean(data) {
    return data.reduce((a, b) => a + b) / data.length;
}

function median(data) {
    return data.sort((a, b) => a - b)[Math.floor(data.length / 2)];
}

function midRange(data) {
    return max(data) - min(data) / 2;
}

function stdev(data) {
    const dataMean = mean(data);
    const sqDiff = data.map(n => Math.pow(n - dataMean, 2));
    const avgSqDiff = mean(sqDiff);
    return Math.sqrt(avgSqDiff);
}

function variance(data) {
    const dataMean = mean(data);
    const sq = data.map(n => Math.pow(n - dataMean, 2));
    return mean(sq);
}

const dataToPoints = ({ data, limit, width = 1, height = 1, margin = 0, _max = max(data), _min = min(data) }) => {
    const len = data.length;
    if (limit && limit < len) {
        data = data.slice(len - limit);
    }
    const vfactor = (height - margin * 2) / ((_max - _min) || 2);
    const hfactor = (width - margin * 2) / ((limit || len) - (len > 1 ? 1 : 0));
    return data.map((d, i) => ({
        x: i * hfactor + margin,
        y: (_max === _min ? 1 : (_max - d)) * vfactor + margin
    }));
};

class AnterosSparklines extends PureComponent {
    constructor (props) {
        super(props);
    }

    render() {
        const {  data, limit, width, height, svgWidth, svgHeight, preserveAspectRatio, margin, style, max, min} = this.props;
        if (data.length === 0) return null;
        const points = dataToPoints({ data, limit, width, height, margin, max, min });
        const svgOpts = { style: style, viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: preserveAspectRatio };
        if (svgWidth > 0) svgOpts.width = svgWidth;
        if (svgHeight > 0) svgOpts.height = svgHeight;

        return (
            <svg {...svgOpts}>
                {
                    React.Children.map(this.props.children, function(child) {
                        return React.cloneElement(child, { data, points, width, height, margin });
                    })
                }
            </svg>
        );
    }
}

AnterosSparklines.propTypes = {
    data: PropTypes.array,
    limit: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    svgWidth: PropTypes.number,
    svgHeight: PropTypes.number,
    preserveAspectRatio: PropTypes.string,
    margin: PropTypes.number,
    style: PropTypes.object,
    min: PropTypes.number,
    max: PropTypes.number,
    onMouseMove: PropTypes.func
};

AnterosSparklines.defaultProps = {
    data: [],
    width: 240,
    height: 60,
    //Scale the graphic content of the given element non-uniformly if necessary such that the element's bounding box exactly matches the viewport rectangle.
    preserveAspectRatio: 'none', //https://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
    margin: 2
};


class AnterosSparklinesBars extends React.Component {
    constructor(props){
        super(props);
    }
  
    render() {
      const { points, height, style, barWidth, margin, onMouseMove } = this.props;
      const strokeWidth = 1 * ((style && style.strokeWidth) || 0);
      const marginWidth = margin ? 2 * margin : 0;
      const width =
        barWidth ||
        (points && points.length >= 2
          ? Math.max(0, points[1].x - points[0].x - strokeWidth - marginWidth)
          : 0);
  
      return (
        <g transform="scale(1,-1)">
          {points.map((p, i) =>
            <rect
              key={i}
              x={p.x - (width + strokeWidth) / 2}
              y={-height}
              width={width}
              height={Math.max(0, height - p.y)}
              style={style}
              onMouseMove={onMouseMove && onMouseMove.bind(this, p)}
            />,
          )}
        </g>
      );
    }
  }

  AnterosSparklinesBars.propTypes = {
    points: PropTypes.arrayOf(PropTypes.object),
    height: PropTypes.number,
    style: PropTypes.object,
    barWidth: PropTypes.number,
    margin: PropTypes.number,
    onMouseMove: PropTypes.func,
  };

  AnterosSparklinesBars.defaultProps = {
    style: { fill: 'slategray' },
  };



  class AnterosSparklinesCurve extends React.Component {
    constructor(props){
        super(props);
    }  

    render() {
        const { points, width, height, margin, color, style, divisor = 0.25 } = this.props;
        let prev;
        const curve = (p) => {
            let res;
            if (!prev) {
                res = [p.x, p.y]
            } else {
                const len = (p.x - prev.x) * divisor;
                res = [ "C",
                    //x1
                    prev.x + len,
                    //y1
                    prev.y,
                    //x2,
                    p.x - len,
                    //y2,
                    p.y,
                    //x,
                    p.x,
                    //y
                    p.y
                ];
            }
            prev = p;
            return res;

        }
        const linePoints = points
            .map((p) => curve(p))
            .reduce((a, b) => a.concat(b));
        const closePolyPoints = [
            "L" + points[points.length - 1].x, height - margin,
            margin, height - margin,
            margin, points[0].y
        ];
        const fillPoints = linePoints.concat(closePolyPoints);

        const lineStyle = {
            stroke: color || style.stroke || 'slategray',
            strokeWidth: style.strokeWidth || '1',
            strokeLinejoin: style.strokeLinejoin || 'round',
            strokeLinecap: style.strokeLinecap || 'round',
            fill: 'none'
        };
        const fillStyle = {
            stroke: style.stroke || 'none',
            strokeWidth: '0',
            fillOpacity: style.fillOpacity || '.1',
            fill: style.fill || color || 'slategray'
        };

        return (
            <g>
                <path d={"M"+fillPoints.join(' ')} style={fillStyle} />
                <path d={"M"+linePoints.join(' ')} style={lineStyle} />
            </g>
        )
    }
}

AnterosSparklinesCurve.propTypes = {
    color: PropTypes.string,
    style: PropTypes.object
};

AnterosSparklinesCurve.defaultProps = {
    style: {}
};


class AnterosSparklinesLine extends React.Component {
    constructor(props){
        super(props);
    }
  
    render() {
      const { data, points, width, height, margin, color, style, onMouseMove } = this.props;
  
      const linePoints = points.map(p => [p.x, p.y]).reduce((a, b) => a.concat(b));
  
      const closePolyPoints = [
        points[points.length - 1].x,
        height - margin,
        margin,
        height - margin,
        margin,
        points[0].y,
      ];
  
      const fillPoints = linePoints.concat(closePolyPoints);
  
      const lineStyle = {
        stroke: color || style.stroke || 'slategray',
        strokeWidth: style.strokeWidth || '1',
        strokeLinejoin: style.strokeLinejoin || 'round',
        strokeLinecap: style.strokeLinecap || 'round',
        fill: 'none',
      };
      const fillStyle = {
        stroke: style.stroke || 'none',
        strokeWidth: '0',
        fillOpacity: style.fillOpacity || '.1',
        fill: style.fill || color || 'slategray',
        pointerEvents: 'auto',
      };
  
      const tooltips = points.map((p, i) => {
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2}
            style={fillStyle}
            onMouseEnter={e => onMouseMove('enter', data[i], p)}
            onClick={e => onMouseMove('click', data[i], p)}
          />
        );
      });
  
      return (
        <g>
          {tooltips}
          <polyline points={fillPoints.join(' ')} style={fillStyle} />
          <polyline points={linePoints.join(' ')} style={lineStyle} />
        </g>
      );
    }
  }

  AnterosSparklinesLine.propTypes = {
    color: PropTypes.string,
    style: PropTypes.object,
  };

  AnterosSparklinesLine.defaultProps = {
    style: {},
    onMouseMove: () => {},
  };


  class AnterosSparklinesNormalBand extends React.Component {

    constructor(props){
        super(props);
    }

    render() {

        const { points, margin, style } = this.props;

        const ypoints = points.map(p => p.y);
        const dataMean = mean(ypoints);
        const dataStdev = stdev(ypoints);

        return (
            <rect x={points[0].x} y={dataMean - dataStdev + margin}
                width={points[points.length - 1].x - points[0].x} height={stdev * 2}
                style={style} />
        )
    }
}

AnterosSparklinesNormalBand.propTypes = {
    style: PropTypes.object
};

AnterosSparklinesNormalBand.defaultProps = {
    style: { fill: 'red', fillOpacity: .1 }
};


class AnterosSparklinesSpots extends React.Component {

    constructor(props){
        super(props);
    }

    lastDirection(points) {

        Math.sign = Math.sign || function(x) { return x > 0 ? 1 : -1; }

        return points.length < 2
            ? 0
            : Math.sign(points[points.length - 2].y - points[points.length - 1].y);
    }

    render() {

        const { points, width, height, size, style, spotColors } = this.props;

        const startSpot = <circle
                            cx={points[0].x}
                            cy={points[0].y}
                            r={size}
                            style={style} />

        const endSpot = <circle
                            cx={points[points.length - 1].x}
                            cy={points[points.length - 1].y}
                            r={size}
                            style={style || { fill: spotColors[this.lastDirection(points)] }} />

        return (
            <g>
                {style && startSpot}
                {endSpot}
            </g>
        )
    }
}

AnterosSparklinesSpots.propTypes = {
    size: PropTypes.number,
    style: PropTypes.object,
    spotColors: PropTypes.object
};

AnterosSparklinesSpots.defaultProps = {
    size: 2,
    spotColors: {
        '-1': 'red',
        '0': 'black',
        '1': 'green'
    }
};


class AnterosSparklinesText extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        const { point, text, fontSize, fontFamily } = this.props;
        const { x, y } = point;
        return (
            <g>
              <text x={ x } y={ y } fontFamily={fontFamily || "Verdana"} fontSize={fontSize || 10}>
                { text }
              </text>
            </g>
        )
    }
}

AnterosSparklinesText.propTypes = {
    text: PropTypes.string,
    point: PropTypes.object,
    fontSize: PropTypes.number,
    fontFamily: PropTypes.string
  };

  AnterosSparklinesText.defaultProps = {
      text: '',
      point: { x: 0, y: 0 }
  };



class AnterosSparklinesReferenceLine extends React.Component {

    constructor(props){
        super(props);
    }

    render() {

        const { points, margin, type, style, value } = this.props;

        const ypoints = points.map(p => p.y);
        
        let calc;
        if (type == "max"){
            calc = max(ypoints);
        } else if (type == "min"){
            calc = min(ypoints);
        } else if (type == "mean"){
            calc = mean(ypoints);
        } else if (type == "avg"){
            calc = mean(ypoints);
        } else if (type == "median"){
            calc = median(ypoints);
        }

        const y = type == 'custom' ? value : calc;

        return (
            <line
                x1={points[0].x} y1={y + margin}
                x2={points[points.length - 1].x} y2={y + margin}
                style={style} />
        )
    }
}

AnterosSparklinesReferenceLine.propTypes = {
    type: PropTypes.oneOf(['max', 'min', 'mean', 'avg', 'median', 'custom']),
    value: PropTypes.number,
    style: PropTypes.object
};

AnterosSparklinesReferenceLine. defaultProps = {
    type: 'mean',
    style: { stroke: 'red', strokeOpacity: .75, strokeDasharray: '2, 2' }
};


export { AnterosSparklines, AnterosSparklinesLine, AnterosSparklinesCurve, AnterosSparklinesBars, AnterosSparklinesSpots, AnterosSparklinesReferenceLine, AnterosSparklinesNormalBand, AnterosSparklinesText }
