import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";
import * as WebDataRocks from "webdatarocks";
import en from './en.json';
import pt_BR from './pr.json';
import es from './es.json';
import { AnterosLocalDatasource, AnterosRemoteDatasource, dataSourceEvents } from '@anterostecnologia/anteros-react-datasource';
import { autoBind } from '@anterostecnologia/anteros-react-core';



class AnterosPivotTableAdvanced extends Component {
    constructor(props) {
        super(props);
        this.webdatarocks = undefined;
        autoBind(this);
    }

    componentDidMount() {
        if (this.props.dataSource && ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource))) {
            this.props.dataSource.addEventListener([dataSourceEvents.AFTER_OPEN], this.onDatasourceEvent);
        }
        var config = {};
        let _this = this;
        config.container = ReactDOM.findDOMNode(this);
        this.parseProps(config);

        this.webdatarocks = new WebDataRocks({ ...config, beforetoolbarcreated: customizeToolbar });


        function customizeToolbar(toolbar) {
            if (_this.props.toolbar === false) {
                var tabs = toolbar.getTabs(); // get all tabs from the toolbar
                toolbar.getTabs = function () {
                    delete tabs[0];
                    delete tabs[1];
                    delete tabs[2];
                    delete tabs[3];
                    delete tabs[4];
                    delete tabs[5];
                    delete tabs[6];
                    delete tabs[7];
                    return tabs;
                }
            }
            _this.toolbar = toolbar;
        }

        this.webdatarocks.on('reportchange', function () {

        });
        this.webdatarocks.on('reportcomplete', function () {
            if (_this.props.toolbar === false) {
                var element = document.getElementById("wdr-toolbar-wrapper");
                if (element) {
                    element.style.height = "0px";
                }
                element = document.getElementsByClassName("wdr-ui-element wdr-ui wdr-ui-label wdr-credits");
                if (element[0]) {
                    element[0].style.height = "0px";
                    element[0].style.display = 'none';
                }
            }
        });

    }

    getPivot() {
        return this.webdatarocks;
    }

    getToolbar() {
        return this.toolbar;
    }


    componentWillUnmount() {
        if (this.props.dataSource && ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource))) {
            this.props.dataSource.removeEventListener([
                dataSourceEvents.AFTER_OPEN], this.onDatasourceEvent);
        }
        this.webdatarocks.dispose();
    }

    shouldComponentUpdate() {
        return false;
    }

    onDatasourceEvent(event, error) {
        if (event === dataSourceEvents.AFTER_OPEN) {
            this.webdatarocks.updateData({ data: this.props.dataSource.getData() })
        }
    }

    parseProps(config) {

        config.toolbar = true;

        if (this.props.width !== undefined) {
            config.width = this.props.width;
        }
        if (this.props.height !== undefined) {
            config.height = this.props.height;
        }
        if (this.props.report !== undefined) {
            let data = [];
            if ((this.props.dataSource instanceof AnterosRemoteDatasource) || (this.props.dataSource instanceof AnterosLocalDatasource)) {
                data = this.props.dataSource.getData();
            } else {
                data = this.props.dataSource;
            }
            config.report = {
                dataSource: {
                    data: data
                }
            }
        }
        if (this.props.global !== undefined) {
            if (this.props.global.localization === 'en') {
                config.global = { localization: en };
            } else if (this.props.global.localization === 'pt_BR') {
                config.global = { localization: pt_BR };
            } else if (this.props.global.localization === 'es') {
                config.global = { localization: es };
            }
        }
        if (this.props.customizeCell !== undefined) {
            config.customizeCell = this.props.onCustomizeCell;
        }
        // events
        if (this.props.cellclick !== undefined) {
            config.cellclick = this.props.onCellclick;
        }
        if (this.props.celldoubleclick !== undefined) {
            config.celldoubleclick = this.props.onCellDoubleclick;
        }
        if (this.props.dataerror !== undefined) {
            config.dataerror = this.props.onDataError;
        }
        if (this.props.datafilecancelled !== undefined) {
            config.datafilecancelled = this.props.onDataFileCancelled;
        }
        if (this.props.dataloaded !== undefined) {
            config.dataloaded = this.props.onDataLoaded;
        }
        if (this.props.datachanged !== undefined) {
            config.datachanged = this.props.onDataChanged;
        }
        if (this.props.fieldslistclose !== undefined) {
            config.fieldslistclose = this.props.onFieldsListClose;
        }
        if (this.props.fieldslistopen !== undefined) {
            config.fieldslistopen = this.props.onFieldsListOpen;
        }
        if (this.props.filteropen !== undefined) {
            config.filteropen = this.props.onFilterOpen;
        }
        if (this.props.fullscreen !== undefined) {
            config.fullscreen = this.props.onFullscreen;
        }
        if (this.props.loadingdata !== undefined) {
            config.loadingdata = this.props.onLoadingData;
        }
        if (this.props.loadinglocalization !== undefined) {
            config.loadinglocalization = this.props.onLoadingLocalization;
        }
        if (this.props.loadingreportfile !== undefined) {
            config.loadingreportfile = this.props.LoadingReportFile;
        }
        if (this.props.localizationerror !== undefined) {
            config.localizationerror = this.props.onLocalizationError;
        }
        if (this.props.localizationloaded !== undefined) {
            config.localizationloaded = this.props.onLocalizationLoaded;
        }
        if (this.props.openingreportfile !== undefined) {
            config.openingreportfile = this.props.onOpeningReportFile;
        }
        if (this.props.querycomplete !== undefined) {
            config.querycomplete = this.props.onQueryComplete;
        }
        if (this.props.queryerror !== undefined) {
            config.queryerror = this.props.onQueryError;
        }
        if (this.props.ready !== undefined) {
            config.ready = this.props.onReady;
        }
        if (this.props.reportchange !== undefined) {
            config.reportchange = this.props.onReportChange;
        }
        if (this.props.reportcomplete !== undefined) {
            config.reportcomplete = this.props.onReportComplete;
        }
        if (this.props.reportfilecancelled !== undefined) {
            config.reportfilecancelled = this.props.onReportFileCancelled;
        }
        if (this.props.reportfileerror !== undefined) {
            config.reportfileerror = this.props.onReportFileError;
        }
        if (this.props.reportfileloaded !== undefined) {
            config.reportfileloaded = this.props.onReportFileLoaded;
        }
        if (this.props.runningquery !== undefined) {
            config.runningquery = this.props.onRunningQuery;
        }
        if (this.props.update !== undefined) {
            config.update = this.props.onUpdate;
        }
        if (this.props.beforetoolbarcreated !== undefined) {
            config.beforetoolbarcreated = this.props.onBeforeToolbarCreated;
        }
    }

    render() {
        return <div></div>;
    }

}


AnterosPivotTableAdvanced.propTypes = {
    dataSource: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    global: PropTypes.object,
    width: [PropTypes.string, PropTypes.number],
    height: [PropTypes.string, PropTypes.number],
    report: [PropTypes.string, PropTypes.object],
    toolbar: PropTypes.bool,
    onCustomizeCell: PropTypes.func,
    onCellclick: PropTypes.func,
    onCellDoubleclick: PropTypes.func,
    onDataError: PropTypes.func,
    onDataFileCancelled: PropTypes.func,
    onDataLoaded: PropTypes.func,
    onDataChanged: PropTypes.func,
    onFieldsListClose: PropTypes.func,
    onFieldsListOpen: PropTypes.func,
    onFilterOpen: PropTypes.func,
    onFullScreen: PropTypes.func,
    onLoadingData: PropTypes.func,
    onLoadingLocalization: PropTypes.func,
    onLoadingReportFile: PropTypes.func,
    onLocalizationError: PropTypes.func,
    onLocalizationLoaded: PropTypes.func,
    onOpeningReportFile: PropTypes.func,
    onQueryComplete: PropTypes.func,
    onQueryError: PropTypes.func,
    onReady: PropTypes.func,
    onReportChange: PropTypes.func,
    onReportComplete: PropTypes.func,
    onReportFileCancelled: PropTypes.func,
    onReportFileError: PropTypes.func,
    onReportFileLoaded: PropTypes.func,
    onRunningQuery: PropTypes.func,
    onUpdate: PropTypes.func,
    onBeforeToolbarCreated: PropTypes.func
}

AnterosPivotTableAdvanced.defaultProps = {
    toolbar: false,
    global: { localization: 'pt_BR' }
}

export { AnterosPivotTableAdvanced }; 