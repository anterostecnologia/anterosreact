/* eslint-disable no-console */
//http://jerairrest.github.io/react-chartjs-2/
import React from "react";
import PropTypes from "prop-types";
import Chart from "chart.js";
import { isEqual } from "lodash";
import keyBy from "lodash/keyBy";

// eslint-disable-next-line no-undef
const NODE_ENV = (typeof process !== "undefined") && process.env && process.env.NODE_ENV;

export class AnterosChart extends React.Component {

  constructor(props){
    super(props);
    this.transformDataProp = this.transformDataProp.bind(this);
    this.destroyChart =this.destroyChart.bind(this);
    this.renderChart = this.renderChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.memoizeDataProps = this.memoizeDataProps.bind(this);
    this.saveCurrentDatasets = this.saveCurrentDatasets.bind(this);
    this.getCurrentDatasets = this.getCurrentDatasets.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.ref = this.ref.bind(this);
  }

  componentWillMount() {
    this.chartInstance = undefined;
  } 

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    if (this.props.redraw) {
      this.destroyChart();
      this.renderChart();
      return;
    }

    this.updateChart();
  }

  shouldComponentUpdate(nextProps) {
    const {
      type,
      options,
      plugins,
      legend,
      height,
      width
    } = this.props;

    if (nextProps.redraw === true) {
      return true;
    }

    if (height !== nextProps.height || width !== nextProps.width) {
      return true;
    }

    if (type !== nextProps.type) {
      return true;
    }

    if (!isEqual(legend, nextProps.legend)) {
      return true;
    }

    if (!isEqual(options, nextProps.options)) {
      return true;
    }

    const nextData = this.transformDataProp(nextProps);

    if (!isEqual(this.shadowDataProp, nextData)) {
      return true;
    }

    return !isEqual(plugins, nextProps.plugins);


  }

  componentWillUnmount() {
    this.destroyChart();
  }

  transformDataProp(props) {
    const { data } = props;
    if (typeof (data) == "function") {
      const node = this.element;
      return data(node);
    } else {
      return data;
    }
  }

  memoizeDataProps() {
    if (!this.props.data) {
      return;
    }

    const data = this.transformDataProp(this.props);

    this.shadowDataProp = {
      ...data,
      datasets: data.datasets && data.datasets.map(set => {
        return {
          ...set
        };
      })
    };

    this.saveCurrentDatasets();
    return data;
  }

  checkDatasets(datasets) {
    const isDev = NODE_ENV !== "production" && NODE_ENV !== "prod";
    const usingCustomKeyProvider = this.props.datasetKeyProvider !== AnterosChart.getLabelAsKey;
    const multipleDatasets = datasets.length > 1;

    if (isDev && multipleDatasets && !usingCustomKeyProvider) {
      let shouldWarn = false;
      datasets.forEach((dataset) => {
        if (!dataset.label) {
          shouldWarn = true;
        }
      });

      if (shouldWarn) {
        console.error("Warning: Each dataset needs a unique key. By default, the 'label' property on each dataset is used. Alternatively, you may provide a 'datasetKeyProvider' as a prop that returns a unique key.");
      }
    }
  }

  getCurrentDatasets() {
    return (this.chartInstance && this.chartInstance.config.data && this.chartInstance.config.data.datasets) || [];
  }

  saveCurrentDatasets() {
    this.datasets = this.datasets || {};
    var currentDatasets = this.getCurrentDatasets();
    currentDatasets.forEach(d => {
      this.datasets[this.props.datasetKeyProvider(d)] = d;
    });
  }

  updateChart() {
    const { options } = this.props;

    const data = this.memoizeDataProps(this.props);

    if (!this.chartInstance) return;

    if (options) {
      this.chartInstance.options = Chart.helpers.configMerge(this.chartInstance.options, options);
    }

    let currentDatasets = this.getCurrentDatasets();
    const nextDatasets = data.datasets || [];
    this.checkDatasets(currentDatasets);

    const currentDatasetsIndexed = keyBy(
      currentDatasets,
      this.props.datasetKeyProvider
    );


    this.chartInstance.config.data.datasets = nextDatasets.map(next => {
      const current =
        currentDatasetsIndexed[this.props.datasetKeyProvider(next)];

      if (current && current.type === next.type) {
        // The data array must be edited in place. As chart.js adds listeners to it.
        current.data.splice(next.data.length);
        next.data.forEach((point, pid) => {
          current.data[pid] = next.data[pid];
        });
        // eslint-disable-next-line no-unused-vars
        const { data, ...otherProps } = next;
        // Merge properties. Notice a weakness here. If a property is removed
        // from next, it will be retained by current and never disappears.
        // Workaround is to set value to null or undefined in next.
        return {
          ...current,
          ...otherProps
        };
      } else {
        return next;
      }
    });

    // eslint-disable-next-line no-unused-vars
    const { datasets, ...rest } = data;

    this.chartInstance.config.data = {
      ...this.chartInstance.config.data,
      ...rest
    };

    this.chartInstance.update();
  }

  renderChart() {
    const { options, legend, type, plugins } = this.props;
    const node = this.element;
    const data = this.memoizeDataProps();

    if (typeof legend !== "undefined" && !isEqual(AnterosChart.defaultProps.legend, legend)) {
      options.legend = legend;
    }

    this.chartInstance = new Chart(node, {
      type,
      data,
      options,
      plugins
    });
  }

  destroyChart() {
    // Put all of the datasets that have existed in the chart back on the chart
    // so that the metadata associated with this chart get destroyed.
    // This allows the datasets to be used in another chart. This can happen,
    // for example, in a tabbed UI where the chart gets created each time the
    // tab gets switched to the chart and uses the same data).
    this.saveCurrentDatasets();
    const datasets = Object.values(this.datasets);
    this.chartInstance.config.data.datasets = datasets;

    this.chartInstance.destroy();
  }

  handleOnClick(event) {
    const instance = this.chartInstance;

    const {
      getDatasetAtEvent,
      getElementAtEvent,
      getElementsAtEvent,
      onElementsClick
    } = this.props;

    getDatasetAtEvent && getDatasetAtEvent(instance.getDatasetAtEvent(event), event);
    getElementAtEvent && getElementAtEvent(instance.getElementAtEvent(event), event);
    getElementsAtEvent && getElementsAtEvent(instance.getElementsAtEvent(event), event);
    onElementsClick && onElementsClick(instance.getElementsAtEvent(event), event); // Backward compatibility
  }

  ref(element) {
    this.element = element;
  }

  render() {
    const { height, width, id } = this.props;

    return (
      <canvas
        ref={this.ref}
        height={height}
        width={width}
        id={id}
        onClick={this.handleOnClick}
      />
    );
  }
}

AnterosChart.getLabelAsKey = d => d.label;

AnterosChart.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func
  ]).isRequired,
  getDatasetAtEvent: PropTypes.func,
  getElementAtEvent: PropTypes.func,
  getElementsAtEvent: PropTypes.func,
  height: PropTypes.number,
  legend: PropTypes.object,
  onElementsClick: PropTypes.func,
  options: PropTypes.object,
  plugins: PropTypes.arrayOf(PropTypes.object),
  redraw: PropTypes.bool,
  type: function (props, propName, componentName) {
    if (!Chart.controllers[props[propName]]) {
      return new Error(
        "Invalid chart type `" + props[propName] + "` supplied to" +
        " `" + componentName + "`."
      );
    }
  },
  width: PropTypes.number,
  datasetKeyProvider: PropTypes.func
};

AnterosChart.defaultProps = {
  legend: {
    display: true,
    position: "bottom"
  },
  type: "doughnut",
  height: 150,
  width: 300,
  redraw: false,
  options: {},
  datasetKeyProvider: AnterosChart.getLabelAsKey
};


export class Doughnut extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="doughnut"
      />
    );
  }
}

export class Pie extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="pie"
      />
    );
  }
}

export class Line extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="line"
      />
    );
  }
}

export class Bar extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="bar"
      />
    );
  }
}

export class HorizontalBar extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="horizontalBar"
      />
    );
  }
}

export class Radar extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="radar"
      />
    );
  }
}

export class Polar extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="polarArea"
      />
    );
  }
}

export class Bubble extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="bubble"
      />
    );
  }
}

export class Scatter extends React.Component {
  render() {
    return (
      <AnterosChart
        {...this.props}
        ref={ref => this.chart_instance = ref && ref.chart_instance}
        type="scatter"
      />
    );
  }
}


export const defaults = Chart.defaults;


AnterosChart.Doughnut = Doughnut;
AnterosChart.Pie = Pie;
AnterosChart.Bar = Bar;
AnterosChart.HorizontalBar = HorizontalBar;
AnterosChart.Radar = Radar;
AnterosChart.Polar = Polar;
AnterosChart.Bubble = Bubble;
AnterosChart.Scatter = Scatter;
