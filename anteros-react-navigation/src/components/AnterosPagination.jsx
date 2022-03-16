import React, { Component } from "react";
import PropTypes from "prop-types";
import { AnterosError, autoBind } from "@anterostecnologia/anteros-react-core";
import {
  dataSourceEvents,
} from "@anterostecnologia/anteros-react-datasource";
import ReactPaginate from "react-paginate";

const TITLES = {
  first: "Primeira",
  prev: "\u00AB",
  prevSet: "...",
  nextSet: "...",
  next: "\u00BB",
  last: "Última",
};

export class AnterosPagination extends Component {
  constructor(props) {
    super(props);

    this.handlePageChanged = this.handlePageChanged.bind(this);
    this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
    this.state = {
      totalPages: this.props.totalPages,
      currentPage: this.props.currentPage,
      disabled: false,
    };
    autoBind(this);
  }

  componentDidMount() {
    if (this.props.dataSource) {
      this.props.dataSource.addEventListener(
        dataSourceEvents.AFTER_CLOSE,
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.AFTER_OPEN,
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.AFTER_EDIT,
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.AFTER_INSERT,
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.AFTER_DELETE,
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.AFTER_CANCEL,
        this.onDatasourceEvent
      );
      this.props.dataSource.addEventListener(
        dataSourceEvents.AFTER_GOTO_PAGE,
        this.onDatasourceEvent
      );
    }
  }

  componentWillUnmount() {
    if (this.props.dataSource) {
      this.props.dataSource.removeEventListener(
        dataSourceEvents.AFTER_CLOSE,
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.AFTER_OPEN,
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.AFTER_EDIT,
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.AFTER_DELETE,
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.AFTER_INSERT,
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.AFTER_CANCEL,
        this.onDatasourceEvent
      );
      this.props.dataSource.removeEventListener(
        dataSourceEvents.AFTER_GOTO_PAGE,
        this.onDatasourceEvent
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource) {
      this.setState({
        ...this.state,
        currentPage: nextProps.dataSource.getCurrentPage(),
        totalPages: nextProps.dataSource.getTotalPages(),
      });
    }
  }

  onDatasourceEvent(event, error) {
    this.setState({
      ...this.state,
      currentPage: this.props.dataSource.getCurrentPage(),
      totalPages: this.props.dataSource.getTotalPages(),
      update: Math.random(),
    });
  }

  handlePageChanged(event) {
    let num = event.selected;
    if (this.props.onBeforePageChanged) {
      this.props.onBeforePageChanged(this.state.currentPage, num);
    }
    if (this.props.dataSource) {
      this.props.dataSource.goToPage(num);
    }
    const handler = this.props.onPageChanged;
    if (handler) handler(num);
  }


  onClick(event) {
    console.log("onClick", event);
  }

  render() {
    if (!this.props.children) {
      if (!this.props.dataSource) {
        if (!this.props.totalPages || this.props.totalPages === 0) {
          throw new AnterosError(
            "Informe o número total de página do navegador."
          );
        }
      }
      if (!this.props.visiblePages || this.props.visiblePages === 0) {
        throw new AnterosError(
          "Informe o número de páginas visíveis por bloco no navegador."
        );
      }
    }
    let className = "pagination";
    if (this.props.large) {
      className += " pagination-lg";
    }
    if (this.props.small) {
      className += " pagination-sm";
    }

    if (this.props.horizontalAlign === "start" || this.props.horizontalStart) {
      className += " justify-content-start";
    } else if (
      this.props.horizontalAlign === "center" ||
      this.props.horizontalCenter
    ) {
      className += " justify-content-center";
    } else if (
      this.props.horizontalAlign === "end" ||
      this.props.horizontalEnd
    ) {
      className += " justify-content-end";
    }

    if (this.props.className) {
      className += " " + this.props.className;
    }

    return (
      <ReactPaginate
        containerClassName={className}
        breakLabel="..."
        nextLabel={this.props.titles.next}
        onPageChange={this.handlePageChanged}
        pageRangeDisplayed={this.props.visiblePages}
        marginPagesDisplayed={this.props.marginVisiblePages}
        pageCount={this.state.totalPages}
        previousLabel={this.props.titles.prev}
        renderOnZeroPageCount={null}
        onClick={this.onClick}
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        activeClassName="active"
        hrefAllControls
        breakClassName="page-item"
        breakLinkClassName="page-link"
        forcePage={this.state.currentPage}
      />
    );
  }
}

AnterosPagination.propTypes = {
  current: PropTypes.number,
  totalPages: PropTypes.number,
  visiblePages: PropTypes.number,
  marginVisiblePages: PropTypes.number,
  titles: PropTypes.object,
  images: PropTypes.object,
  icons: PropTypes.object,
  onPageChanged: PropTypes.func,
  onBeforePageChanged: PropTypes.func,
  large: PropTypes.bool,
  small: PropTypes.bool,
  horizontalAlign: PropTypes.oneOf(["start", "center", "end"]),
  horizontalStart: PropTypes.bool,
  horizontalCenter: PropTypes.bool,
  horizontalEnd: PropTypes.bool,
};

AnterosPagination.defaultProps = {
  titles: TITLES,
  currentPage: 0,
  marginVisiblePages: 2,
  visiblePages: 5
};

function range(start, end) {
  const res = [];
  for (let i = start; i < end; i++) {
    res.push(i);
  }

  return res;
}
