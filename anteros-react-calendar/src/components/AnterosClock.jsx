import React from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';
import { getHours, getMinutes, getSeconds } from '@wojtekmaj/date-utils';

export const isDefined = variable => typeof variable !== 'undefined';

const isNumberBetween = (min, max) => (props, propName, componentName) => {
    const { [propName]: value } = props;

    if (isDefined(value)) {
        if (typeof value !== 'number') {
            return new Error(`Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected \`number\`.`);
        }

        if (value < min || value > max) {
            return new Error(`Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, length must be between ${min} and ${max}.`);
        }
    }

    // Everything is fine
    return null;
};

export const isHandLength = isNumberBetween(0, 100);

export const isOppositeHandLength = isNumberBetween(-100, 100);

export const isHandWidth = (props, propName, componentName) => {
    const { [propName]: width } = props;

    if (isDefined(width)) {
        if (typeof width !== 'number') {
            return new Error(`Invalid prop \`${propName}\` of type \`${typeof width}\` supplied to \`${componentName}\`, expected \`number\`.`);
        }

        if (width < 0) {
            return new Error(`Invalid prop \`${propName}\` of type \`${typeof width}\` supplied to \`${componentName}\`, width must be greater or equal to 0.`);
        }
    }

    // Everything is fine
    return null;
};

export const isMarkLength = isHandLength;

export const isMarkWidth = isHandWidth;

export function Mark({
    angle = 0,
    length = 10,
    name,
    width = 1,
    number,
}) {
    return (
        <div
            className={`react-clock__mark react-clock__${name}-mark`}
            style={{
                transform: `rotate(${angle}deg)`,
            }}
        >
            <div
                className={`react-clock__mark__body react-clock__${name}-mark__body`}
                style={{
                    width: `${width}px`,
                    top: 0,
                    bottom: `${100 - (length / 2)}%`,
                }}
            />
            {number && (
                <div
                    className="react-clock__mark__number"
                    style={{
                        transform: `rotate(-${angle}deg)`,
                        top: `${length / 2}%`,
                    }}
                >
                    {number}
                </div>
            )}
        </div>
    );
}

Mark.propTypes = {
    angle: PropTypes.number,
    length: isMarkLength,
    name: PropTypes.string.isRequired,
    number: PropTypes.number,
    width: isMarkWidth,
};

export function Hand({
    angle = 0,
    name,
    length = 100,
    oppositeLength = 10,
    width = 1,
}) {
    return (
        <div
            className={`react-clock__hand react-clock__${name}-hand`}
            style={{
                transform: `rotate(${angle}deg)`,
            }}
        >
            <div
                className={`react-clock__hand__body react-clock__${name}-hand__body`}
                style={{
                    width: `${width}px`,
                    top: `${50 - (length / 2)}%`,
                    bottom: `${50 - (oppositeLength / 2)}%`,
                }}
            />
        </div>
    );
}

Hand.propTypes = {
    angle: PropTypes.number,
    length: isHandLength,
    name: PropTypes.string.isRequired,
    oppositeLength: isHandLength,
    width: PropTypes.number,
};

export default function AnterosClock({
    className,
    hourHandLength = 50,
    hourHandOppositeLength,
    hourHandWidth = 4,
    hourMarksLength = 10,
    hourMarksWidth = 3,
    minuteHandLength = 70,
    minuteHandOppositeLength,
    minuteHandWidth = 2,
    minuteMarksLength = 6,
    minuteMarksWidth = 1,
    renderHourMarks = true,
    renderMinuteHand = true,
    renderMinuteMarks = true,
    renderNumbers,
    renderSecondHand = true,
    secondHandLength = 90,
    secondHandOppositeLength,
    secondHandWidth = 1,
    size = 150,
    value,
}) {
    function renderMinuteMarksFn() {
        if (!renderMinuteMarks) {
            return null;
        }

        const minuteMarks = [];
        for (let i = 1; i <= 60; i += 1) {
            const isHourMark = renderHourMarks && !(i % 5);

            if (!isHourMark) {
                minuteMarks.push(
                    <Mark
                        key={`minute_${i}`}
                        angle={i * 6}
                        length={minuteMarksLength}
                        name="minute"
                        width={minuteMarksWidth}
                    />,
                );
            }
        }
        return minuteMarks;
    }

    function renderHourMarksFn() {
        if (!renderHourMarks) {
            return null;
        }

        const hourMarks = [];
        for (let i = 1; i <= 12; i += 1) {
            hourMarks.push(
                <Mark
                    key={`hour_${i}`}
                    angle={i * 30}
                    length={hourMarksLength}
                    name="hour"
                    number={renderNumbers ? i : null}
                    width={hourMarksWidth}
                />,
            );
        }
        return hourMarks;
    }

    function renderFace() {
        return (
            <div className="react-clock__face">
                {renderMinuteMarksFn()}
                {renderHourMarksFn()}
            </div>
        );
    }

    function renderHourHandFn() {
        const angle = value ? (
            (getHours(value) * 30)
            + (getMinutes(value) / 2)
            + (getSeconds(value) / 600)
        ) : 0;

        return (
            <Hand
                angle={angle}
                length={hourHandLength}
                name="hour"
                oppositeLength={hourHandOppositeLength}
                width={hourHandWidth}
            />
        );
    }

    function renderMinuteHandFn() {
        if (!renderMinuteHand) {
            return null;
        }

        const angle = value ? (
            (getHours(value) * 360)
            + (getMinutes(value) * 6)
            + (getSeconds(value) / 10)
        ) : 0;

        return (
            <Hand
                angle={angle}
                length={minuteHandLength}
                name="minute"
                oppositeLength={minuteHandOppositeLength}
                width={minuteHandWidth}
            />
        );
    }

    function renderSecondHandFn() {
        if (!renderSecondHand) {
            return null;
        }

        const angle = value ? (
            (getMinutes(value) * 360)
            + (getSeconds(value) * 6)
        ) : 0;

        return (
            <Hand
                angle={angle}
                length={secondHandLength}
                name="second"
                oppositeLength={secondHandOppositeLength}
                width={secondHandWidth}
            />
        );
    }

    return (
        <time
            className={mergeClassNames('react-clock', className)}
            dateTime={value instanceof Date ? value.toISOString() : value}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
        >
            {renderFace()}
            {renderHourHandFn()}
            {renderMinuteHandFn()}
            {renderSecondHandFn()}
        </time>
    );
}

AnterosClock.propTypes = {
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    hourHandLength: isHandLength,
    hourHandOppositeLength: isOppositeHandLength,
    hourHandWidth: isHandWidth,
    hourMarksLength: isMarkLength,
    hourMarksWidth: isMarkWidth,
    minuteHandLength: isHandLength,
    minuteHandOppositeLength: isOppositeHandLength,
    minuteHandWidth: isHandWidth,
    minuteMarksLength: isMarkLength,
    minuteMarksWidth: isMarkWidth,
    renderHourMarks: PropTypes.bool,
    renderMinuteHand: PropTypes.bool,
    renderMinuteMarks: PropTypes.bool,
    renderNumbers: PropTypes.bool,
    renderSecondHand: PropTypes.bool,
    secondHandLength: isHandLength,
    secondHandOppositeLength: isOppositeHandLength,
    secondHandWidth: isHandWidth,
    size: PropTypes.number,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
};