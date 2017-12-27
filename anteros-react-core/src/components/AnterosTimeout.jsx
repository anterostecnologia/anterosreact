import React from 'react';
import PropTypes from 'prop-types';


export class AnterosTimeout extends React.Component {

    constructor(props) {
        super(props);
        this.callback = this.callback.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }


    componentDidMount() {
        if (this.props.enabled) {
            this.start();
        }
    }

    shouldComponentUpdate({ timeout, callback, enabled }) {
        return (
            this.props.timeout !== timeout ||
            this.props.callback !== callback ||
            this.props.enabled !== enabled
        );
    }

    componentDidUpdate({ enabled }) {
        if (this.props.enabled !== enabled) {
            if (this.props.enabled) {
                this.start();
            } else {
                this.stop();
            }
        }
    }

    componentWillUnmount() {
        this.stop();
    }

    callback() {
        if (this.timer) {
            this.props.callback();
            this.start();
        }
    };

    start() {
        this.stop();
        this.timer = setTimeout(this.callback, this.props.timeout);
    };

    stop() {
        clearTimeout(this.timer);
        this.timer = null;
    };

    render() {
        return false;
    }
}


AnterosTimeout.defaultProps = {
    enabled: false,
    timeout: 1000
};

AnterosTimeout.propTypes = {
    callback: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
    timeout: PropTypes.number
};