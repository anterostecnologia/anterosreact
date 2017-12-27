import lodash from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {AnterosUtils} from "anteros-react-core";


const colWidths = ['xs', 'sm', 'md', 'lg', 'xl'];
const stringOrNumberProp = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

export const columnProps = PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
    PropTypes.string,
    PropTypes.shape({
        size: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
        push: stringOrNumberProp,
        pull: stringOrNumberProp,
        offset: stringOrNumberProp
    })
]);

export const getColumnSizeClass = (isXs, colWidth, colSize) => {
    return `col-${colWidth}-${colSize}`;
};

export const getColumnAlignClass = (horizontalAlign) => {
    if (horizontalAlign === 'start') {
        return 'align-self-start';
    } else if (horizontalAlign === 'center') {
        return 'align-self-center';
    } else if (horizontalAlign === 'end') {
        return 'align-self-end';
    }
};

export function buildGridClassNames(props, useHorizontalClass, attributes) {
    const colClasses = [];
    if (!props || props == null) {
        return colClasses;
    } else {
        const {
            horizontalAlign,
            horizontalCenter,
            horizontalEnd,
            horizontalStart,
        } = props;

        colWidths.forEach((colWidth, i) => {
            let columnProp;
            if (colWidth == 'xs')
                columnProp = props.extraSmall;
            else if (colWidth == 'sm')
                columnProp = props.small;
            else if (colWidth == 'md')
                columnProp = props.medium;
            else if (colWidth == 'lg')
                columnProp = props.large;
            else if (colWidth == 'xl')
                columnProp = props.extraLarge;

            if (attributes)
                delete attributes[colWidth];

            if (columnProp) {
                const isXs = !i;
                let colClass;

                if (lodash.isObject(columnProp)) {
                    const colSizeInterfix = isXs ? '-' : `-${colWidth}-`;
                    colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);
                    let horizontalClass;
                    if (useHorizontalClass) {
                        horizontalClass = horizontalAlign ? getColumnAlignClass(horizontalAlign) : "";
                        if (horizontalStart) {
                            horizontalClass = 'align-self-start';
                        } else if (horizontalCenter) {
                            horizontalClass = 'align-self-center';
                        } else if (horizontalEnd) {
                            horizontalClass = 'align-self-end';
                        }
                    }

                    colClasses.push(AnterosUtils.buildClassNames({
                        [colClass]: columnProp.size || columnProp.size === '',
                        [`push${colSizeInterfix}${columnProp.push}`]: columnProp.push || columnProp.push === 0,
                        [`pull${colSizeInterfix}${columnProp.pull}`]: columnProp.pull || columnProp.pull === 0,
                        [`offset${colSizeInterfix}${columnProp.offset}`]: columnProp.offset || columnProp.offset === 0,
                        horizontalClass
                    }));
                } else {
                    colClass = getColumnSizeClass(isXs, colWidth, columnProp);
                    colClasses.push(colClass);
                }
            }
        });
        return colClasses;
    }
}

export class AnterosCol extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const {
    className,
            tag: Tag,
            horizontalAlign,
            horizontalCenter,
            horizontalEnd,
            horizontalStart,
            extraSmall,
            small,
            medium,
            large,
            extraLarge,
            ...attributes
  } = this.props;
        const colClasses = buildGridClassNames(this.props, true, attributes);
        const classes = AnterosUtils.buildClassNames(
            className,
            (colClasses.length == 0 ? "col" : colClasses)
        );

        return (
            <Tag {...attributes} className={classes} />
        );
    };
}


AnterosCol.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    className: PropTypes.string,
    horizontalAlign: PropTypes.oneOf(['start', 'center', 'end']),
    horizontalStart: PropTypes.bool,
    horizontalCenter: PropTypes.bool,
    horizontalEnd: PropTypes.bool,
    style: PropTypes.object
};

AnterosCol.defaultProps = {
    tag: 'div'
};


const getRowVerticalAlignClass = (verticalAlign) => {
    if (verticalAlign === 'start') {
        return 'align-items-start';
    } else if (verticalAlign === 'center') {
        return 'align-items-center';
    } else if (verticalAlign === 'end') {
        return 'align-items-end';
    }
};

const getRowHorizontalAlignClass = (horizontalAlign) => {
    if (horizontalAlign === 'start') {
        return 'justify-content-start';
    } else if (horizontalAlign === 'center') {
        return 'justify-content-center';
    } else if (horizontalAlign === 'end') {
        return 'justify-content-end';
    } else if (horizontalAlign === 'around') {
        return 'justify-content-around';
    } else if (horizontalAlign === 'between') {
        return 'justify-content-between';
    }
};

export class AnterosRow extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            className,
            noGutters,
            tag: Tag,
            verticalAlign,
            verticalStart,
            verticalCenter,
            verticalEnd,
            horizontalAlign,
            horizontalStart,
            horizontalCenter,
            horizontalEnd,
            horizontalAround,
            horizontalBetween,
            ...attributes
  } = this.props;

        let horizontalClass = horizontalAlign ? getRowHorizontalAlignClass(horizontalAlign) : "";
        if (horizontalStart) {
            horizontalClass = 'justify-content-start';
        } else if (horizontalCenter) {
            horizontalClass = 'justify-content-center';
        } else if (horizontalEnd) {
            horizontalClass = 'justify-content-end';
        } else if (horizontalAround) {
            horizontalClass = 'justify-content-around';
        } else if (horizontalBetween) {
            horizontalClass = 'justify-content-between';
        }

        let verticalClass = verticalAlign ? getRowVerticalAlignClass(verticalAlign) : "";
        if (verticalStart) {
            verticalClass = 'align-items-start';
        } else if (verticalCenter) {
            verticalClass = 'align-items-center';
        } else if (verticalEnd) {
            verticalClass = 'align-items-end';
        }

        const classes = AnterosUtils.buildClassNames(
            className,
            noGutters ? 'no-gutters' : null,
            'row',
            horizontalClass,
            verticalClass,
        );

        return (
            <Tag {...attributes} className={classes} />
        );
    };
}

AnterosRow.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    noGutters: PropTypes.bool,
    className: PropTypes.string,
    verticalAlign: PropTypes.oneOf(['start', 'center', 'end']),
    verticalStart: PropTypes.bool,
    verticalCenter: PropTypes.bool,
    verticalEnd: PropTypes.bool,
    horizontalAlign: PropTypes.oneOf(['start', 'center', 'end', 'around', 'between']),
    horizontalStart: PropTypes.bool,
    horizontalCenter: PropTypes.bool,
    horizontalEnd: PropTypes.bool,
    horizontalAround: PropTypes.bool,
    horizontalBetween: PropTypes.bool

};

AnterosRow.defaultProps = {
    tag: 'div',
    verticalAlign: 'start',
    horizontalAlign: 'start'
};




