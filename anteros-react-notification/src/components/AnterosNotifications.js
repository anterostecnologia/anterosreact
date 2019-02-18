import React from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from './CSSTransitionGroup';
import {AnterosUtils} from "anteros-react-core";
import AnterosNotification from './AnterosNotification';

export default class AnterosNotifications extends React.Component {

  constructor(props){
    super(props);
    this.handleRequestHide = this.handleRequestHide.bind(this)
  }

  handleRequestHide(notification) {
    const { onRequestHide } = this.props;
    if (onRequestHide) {
      onRequestHide(notification);
    }
  };

  render() {
    const { notifications, enterTimeout, leaveTimeout } = this.props;
    const className = AnterosUtils.buildClassNames('notification-container', {
      'notification-container-empty': notifications.length === 0
    });
    return (
      <div className={className}>
        <CSSTransitionGroup
          transitionName="notification"
          transitionEnterTimeout={enterTimeout}
          transitionLeaveTimeout={leaveTimeout}
        >
          {notifications.map((notification) => {
            const key = notification.id || new Date().getTime();
            return (<AnterosNotification
                key={key}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                timeOut={notification.timeOut}
                onClick={notification.onClick}
                onRequestHide={this.handleRequestHide(notification)}
              />
            );
          })}
        </CSSTransitionGroup>
      </div>
    );
  }
}


AnterosNotifications.propTypes = {
  notifications: PropTypes.array.isRequired,
  onRequestHide: PropTypes.func,
  enterTimeout: PropTypes.number,
  leaveTimeout: PropTypes.number
};

AnterosNotifications.defaultProps = {
  notifications: [],
  onRequestHide: () => {
  },
  enterTimeout: 400,
  leaveTimeout: 400
};


