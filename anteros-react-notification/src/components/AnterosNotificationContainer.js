import React from 'react';
import PropTypes from 'prop-types';
import AnterosNotificationManager from './AnterosNotificationManager';
import AnterosNotifications from './AnterosNotifications';

export default class AnterosNotificationContainer extends React.Component {
  
  constructor(props){
    super(props);
    this.handleStoreChange = this.handleStoreChange.bind(this);
    this.handleRequestHide = this.handleRequestHide.bind(this);
    this.state = {
      notifications: []
    };
  }

  componentWillMount(){
    AnterosNotificationManager.addChangeListener(this.handleStoreChange);
  };

  componentWillUnmount(){
    AnterosNotificationManager.removeChangeListener(this.handleStoreChange);
  };

  handleStoreChange(notifications) {
    this.setState({
      notifications
    });
  };

  handleRequestHide(notification) {
    AnterosNotificationManager.remove(notification);
  };

  render() {
    const { notifications } = this.state;
    const { enterTimeout, leaveTimeout } = this.props;
    return (
      <AnterosNotifications
        enterTimeout={enterTimeout}
        leaveTimeout={leaveTimeout}
        notifications={notifications}
        onRequestHide={this.handleRequestHide}
      />
    );
  }
}


AnterosNotificationContainer.propTypes = {
  enterTimeout: PropTypes.number,
  leaveTimeout: PropTypes.number
};

AnterosNotificationContainer.defaultProps = {
  enterTimeout: 400,
  leaveTimeout: 400
};


