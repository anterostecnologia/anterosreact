import React from 'react';
import PropTypes from 'prop-types';
import timeago from 'timeago.js';

timeago.register('pt_BR', require('timeago.js/locales/pt_BR'));
timeago.register('en', require('timeago.js/locales/en'));

export default class AnterosTimeAgo extends React.Component {
  constructor(props) {
    super(props);
    this.timeagoInstance = null;
  }
  componentDidMount() {
    this.renderTimeAgo();
  }
  componentWillMount() {
    if (this.timeagoInstance === null) 
      this.timeagoInstance = timeago();
    }
  componentDidUpdate() {
    this.renderTimeAgo();
  }
  renderTimeAgo() {
    const {live, datetime, locale} = this.props;
    timeago.cancel(this.timeagoDom);
    if (live !== false) {
      if (datetime instanceof Date) {
        this
          .timeagoDom
          .setAttribute('datetime', datetime.getTime());
      } else {
        this
          .timeagoDom
          .setAttribute('datetime', datetime);
      }
      this
        .timeagoInstance
        .render(this.timeagoDom, locale);
    }
  }
  componentWillUnmount() {
    timeago.cancel(this.timeagoDom);
    this.timeagoInstance = null;
  }
  render() {
    const {
      datetime,
      live,
      locale,
      className,
      style,
      ...others
    } = this.props;
    return (
      <time
        ref={(c) => {
        this.timeagoDom = c
      }}
        className={className || ''}
        style={style}
        {...others}>
        {this
          .timeagoInstance
          .format(datetime, locale)}
      </time>
    );
  }
};

AnterosTimeAgo.propTypes = {
  datetime: PropTypes.oneOfType([
    PropTypes.string, PropTypes.instanceOf(Date),
    PropTypes.number
  ]).isRequired, 
  live: PropTypes.bool, 
  locale: PropTypes.string, 
  className: PropTypes.string, 
  style: PropTypes.object 
};

AnterosTimeAgo.defaultProps = {
  live: true,
  locale: 'pt_BR'
};