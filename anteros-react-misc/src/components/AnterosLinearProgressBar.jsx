import PropTypes from 'prop-types';
import React,{Component} from 'react';
import {AnterosUtils} from '@anterostecnologia/anteros-react-core';

const transformStyleProperties = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'MSTransform'];
const ROOT = 'linear-progress';
const INDETERMINATE = `${ROOT}-indeterminate`;
const ACCENT = `${ROOT}-accent`;
const REVERSED = `${ROOT}-reversed`;


export default class AnterosLinearProgressBar extends Component {

    constructor(props){
        super(props);
    }

    render() {
        const {accent, buffer, className, indeterminate, progress, reversed, ...otherProps} = this.props;
        const classes = AnterosUtils.buildClassNames(
                ROOT, {
                [ACCENT]: accent,
                [INDETERMINATE]: indeterminate,
                [REVERSED]: reversed,
                }, className);
        const progressScales = {};
        transformStyleProperties.forEach((property) => {
            progressScales[property] = `scaleX(${progress})`;
        });

        const bufferScales = {};
        transformStyleProperties.forEach((property) => {
            bufferScales[property] = `scaleX(${buffer})`;
        });

        return (
            <div
            role="progressbar"
            className={classes}
            {...otherProps}
            >
                <div className="linear-progress_buffering-dots" />
                    <div
                        className="linear-progress_buffer"
                        style={{ ...bufferScales }}
                    />
                <div
                    className="linear-progress_bar linear-progress_primary-bar"
                    style={{ ...progressScales }}
                >
                    <span className="linear-progress_bar-inner" />
                </div>
                <div className="linear-progress_bar linear-progress_secondary-bar">
                    <span className="linear-progress_bar-inner" />
                </div>
            </div>
        );
    }
};



AnterosLinearProgressBar.propTypes = {
    accent: PropTypes.bool,
    buffer: PropTypes.number,
    className: PropTypes.string,
    indeterminate: PropTypes.bool,
    progress: PropTypes.number,
    reversed: PropTypes.bool,
  };
