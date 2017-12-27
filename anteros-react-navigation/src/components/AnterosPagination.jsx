import React, { Component } from 'react';
import AnterosNavigatorLink  from "anteros-react-menu";
import lodash from 'lodash';
import { AnterosError } from "anteros-react-core";
import { AnterosDatasource, dataSourceEvents } from "anteros-react-datasource";

const BASE_SHIFT = 0;
const TITLE_SHIFT = 1;

const TITLES = {
    first: 'Primeira',
    prev: '\u00AB',
    prevSet: '...',
    nextSet: '...',
    next: '\u00BB',
    last: 'Última',
};


export class AnterosPagination extends Component {
    constructor(props) {
        super(props);

        this.handleFirstPage = this.handleFirstPage.bind(this);
        this.handlePreviousPage = this.handlePreviousPage.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handleLastPage = this.handleLastPage.bind(this);
        this.handleMorePrevPages = this.handleMorePrevPages.bind(this);
        this.handleMoreNextPages = this.handleMoreNextPages.bind(this);
        this.handlePageChanged = this.handlePageChanged.bind(this);
        this.onDatasourceEvent = this.onDatasourceEvent.bind(this);
        this.state = { totalPages: this.props.totalPages, currentPage: this.props.currentPage, disabled: false };
    }

    componentDidMount() {
        if (this.props.dataSource) {
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_CLOSE, this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_OPEN, this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_EDIT, this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_INSERT, this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_DELETE, this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_CANCEL, this.onDatasourceEvent);
            this.props.dataSource.addEventListener(dataSourceEvents.AFTER_GOTO_PAGE, this.onDatasourceEvent);
        }
    }

    componentWillUnmount() {
        if (this.props.dataSource) {
            this.props.dataSource.removeEventListener(dataSourceEvents.AFTER_CLOSE, this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.AFTER_OPEN, this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.AFTER_EDIT, this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.AFTER_DELETE, this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.AFTER_INSERT, this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.AFTER_CANCEL, this.onDatasourceEvent);
            this.props.dataSource.removeEventListener(dataSourceEvents.AFTER_GOTO_PAGE, this.onDatasourceEvent);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource) {
            this.setState({ ...this.state, currentPage: nextProps.dataSource.getCurrentPage(), totalPages: nextProps.dataSource.getTotalPages()});
        }
    }

    onDatasourceEvent(event, error) {
        this.setState({ ...this.state, currentPage: this.props.dataSource.getCurrentPage(), totalPages: this.props.dataSource.getTotalPages()});
    }


    getTitles(key) {
        let title = this.props.titles[key];
        if (title == undefined)
            title = TITLES[key];
        return title;
    }

    getImages(key) {
        if (this.props.images)
            return this.props.images[key];
        return null;
    }

    getIcons(key) {
        if (this.props.icons)
            return this.props.icons[key];
        return null;
    }

    calcBlocks() {
        const props = this.props;
        const total = this.state.totalPages;
        const blockSize = props.visiblePages;
        const current = this.state.currentPage + TITLE_SHIFT;
        const blocks = Math.ceil(total / blockSize);
        const currBlock = Math.ceil(current / blockSize) - TITLE_SHIFT;

        return {
            total: blocks,
            current: currBlock,
            size: blockSize,
        };
    }

    isPrevDisabled() {
        return this.state.currentPage <= BASE_SHIFT;
    }

    isNextDisabled() {
        return this.state.currentPage >= (this.state.totalPages - TITLE_SHIFT);
    }

    isPrevMoreHidden() {
        const blocks = this.calcBlocks();
        return (blocks.total === TITLE_SHIFT) || (blocks.current === BASE_SHIFT);
    }

    isNextMoreHidden() {
        const blocks = this.calcBlocks();
        return (blocks.total === TITLE_SHIFT) || (blocks.current === (blocks.total - TITLE_SHIFT));
    }

    visibleRange() {
        const blocks = this.calcBlocks();
        const start = blocks.current * blocks.size;
        const delta = this.state.totalPages - start;
        const end = start + ((delta > blocks.size) ? blocks.size : delta);

        return [start + TITLE_SHIFT, end + TITLE_SHIFT];
    }


    handleFirstPage() {
        if (!this.isPrevDisabled()) {
            this.handlePageChanged(BASE_SHIFT);
        }
    }

    handlePreviousPage() {
        if (!this.isPrevDisabled()) {
            this.handlePageChanged(this.state.currentPage - TITLE_SHIFT);
        }
    }

    handleNextPage() {
        if (!this.isNextDisabled()) {
            this.handlePageChanged(this.state.currentPage + TITLE_SHIFT);
        }
    }

    handleLastPage() {
        if (!this.isNextDisabled()) {
            this.handlePageChanged(this.state.totalPages - TITLE_SHIFT);
        }
    }

    handleMorePrevPages() {
        const blocks = this.calcBlocks();
        this.handlePageChanged((blocks.current * blocks.size) - TITLE_SHIFT);
    }

    handleMoreNextPages() {
        const blocks = this.calcBlocks();
        this.handlePageChanged((blocks.current + TITLE_SHIFT) * blocks.size);
    }

    handlePageChanged(num) {
        if (this.props.dataSource) {
            this.props.dataSource.goToPage(num);
        }
        const handler = this.props.onPageChanged;
        if (handler) handler(num);
    }


    renderPages(pair) {
        let _this = this;
        return range(pair[0], pair[1]).map((num, idx) => {
            const current = num - TITLE_SHIFT;
            const onClick = this.handlePageChanged.bind(this, current);
            const active = (this.state.currentPage === current);

            return (
                <AnterosPaginationPage
                    key={idx}
                    index={idx}
                    active={active}
                    className="btn-numbered-page"
                    disabled={_this.props.dataSource.getState()!='dsBrowse'}
                    onClick={onClick}
                    caption={num}>
                </AnterosPaginationPage>
            );
        });
    }


    render() {
        if (!this.props.children) {
            if (!this.props.dataSource) {
                if (!this.props.totalPages || this.props.totalPages == 0) {
                    throw new AnterosError("Informe o número total de página do navegador.");
                }
            }
            if (!this.props.visiblePages || this.props.visiblePages == 0) {
                throw new AnterosError("Informe o número de páginas visíveis por bloco no navegador.");
            }

        }
        const titles = this.getTitles.bind(this);
        const images = this.getImages.bind(this);
        const icons = this.getIcons.bind(this);
        let className = "pagination";
        if (this.props.large) {
            className += " pagination-lg";
        }
        if (this.props.small) {
            className += " pagination-sm";
        }

        if (this.props.horizontalAlign === 'start' || this.props.horizontalStart) {
            className += ' justify-content-start';
        } else if (this.props.horizontalAlign === 'center' || this.props.horizontalCenter) {
            className += ' justify-content-center';
        } else if (this.props.horizontalAlign === 'end' || this.props.horizontalEnd) {
            className += ' justify-content-end';
        }

        if (this.props.className) {
            className += " " + this.props.className;
        }

        if (this.props.children) {
            return (<nav>
                <ul className={className}>
                    {this.props.children}
                </ul>
            </nav>)
        } else {
            return (
                <nav>
                    <ul className={className}>
                        <AnterosPaginationPage
                            className="btn-first-page"
                            key="btn-first-page"
                            disabled={this.isPrevDisabled() || this.props.dataSource.getState()!='dsBrowse'}
                            onClick={this.handleFirstPage}
                            image={images('first')}
                            icon={icons('first')}
                            caption={titles('first')}>
                        </AnterosPaginationPage>

                        <AnterosPaginationPage
                            className="btn-prev-page"
                            key="btn-prev-page"
                            disabled={this.isPrevDisabled() || this.props.dataSource.getState()!='dsBrowse'}
                            onClick={this.handlePreviousPage}
                            image={images('prev')}
                            icon={icons('prev')}
                            caption={titles('prev')}>
                        </AnterosPaginationPage>

                        <AnterosPaginationPage
                            className="btn-prev-more"
                            key="btn-prev-more"
                            hidden={this.isPrevMoreHidden() || this.props.dataSource.getState()!='dsBrowse'}
                            onClick={this.handleMorePrevPages}
                            image={images('prevSet')}
                            icon={icons('prevSet')}
                            caption={titles('prevSet')}>
                        </AnterosPaginationPage>

                        {this.renderPages(this.visibleRange())}

                        <AnterosPaginationPage
                            className="btn-next-more"
                            key="btn-next-more"
                            hidden={this.isNextMoreHidden() || this.props.dataSource.getState()!='dsBrowse'}
                            onClick={this.handleMoreNextPages}
                            image={images('nextSet')}
                            icon={icons('nextSet')}
                            caption={titles('nextSet')}>
                        </AnterosPaginationPage>

                        <AnterosPaginationPage
                            className="btn-next-page"
                            key="btn-next-page"
                            disabled={this.isNextDisabled() || this.props.dataSource.getState()!='dsBrowse'}
                            onClick={this.handleNextPage}
                            image={images('next')}
                            icon={icons('next')}
                            caption={titles('next')}>
                        </AnterosPaginationPage>

                        <AnterosPaginationPage
                            className="btn-last-page"
                            key="btn-last-page"
                            disabled={this.isNextDisabled() || this.props.dataSource.getState()!='dsBrowse'}
                            onClick={this.handleLastPage}
                            image={images('last')}
                            icon={icons('last')}
                            caption={titles('last')}>
                        </AnterosPaginationPage>
                    </ul>
                </nav>);
        }
    }
}

AnterosPagination.propTypes = {
    current: React.PropTypes.number,
    totalPages: React.PropTypes.number,
    visiblePages: React.PropTypes.number,
    titles: React.PropTypes.object,
    images: React.PropTypes.object,
    icons: React.PropTypes.object,
    onPageChanged: React.PropTypes.func,
    large: React.PropTypes.bool,
    small: React.PropTypes.bool,
    horizontalAlign: React.PropTypes.oneOf(['start', 'center', 'end']),
    horizontalStart: React.PropTypes.bool,
    horizontalCenter: React.PropTypes.bool,
    horizontalEnd: React.PropTypes.bool,
};

AnterosPagination.defaultProps = {
    titles: TITLES,
    currentPage: 0
};


export class AnterosPaginationPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.hidden) return null;
        const baseCss = this.props.className ? `${this.props.className} ` : '';
        const fullCss = `${baseCss}${this.props.active ? ' active' : ''}${this.props.disabled ? ' disabled' : ''}${' page-item'}`;

        let icon;
        if (this.props.icon) {
            icon = (<i className={this.props.icon}></i>);
        }

        return (
            <li key={this.props.index} className={fullCss} disabled={this.props.disabled}>
                <a href={this.props.href} className="page-link" onClick={this.props.onClick}>{icon}<img src={this.props.image} /> {this.props.caption}</a>
            </li>
        );
    }
};

AnterosPaginationPage.propTypes = {
    hidden: React.PropTypes.bool,
    active: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    className: React.PropTypes.string,
    onClick: React.PropTypes.func,
    image: React.PropTypes.string,
    icon: React.PropTypes.string,
    href: React.PropTypes.string,
    dataSource: React.PropTypes.objectOf(AnterosDatasource)
};


function range(start, end) {
    const res = [];
    for (let i = start; i < end; i++) {
        res.push(i);
    }

    return res;
}




