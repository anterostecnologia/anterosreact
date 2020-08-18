import React from 'react';
import classnames from 'classnames';

class Tabs extends React.Component {

  state = {
    selectedIndex: 0
  }

  static Tab;

  render() {
    const { children, onClick } = this.props;
    return <React.Fragment>
      <ul className="nav nav-tabs" onClick={onClick}>
        {React.Children.map(children, (value, index) => {
          return <li className="nav-item">
            <a 
              onClick={() => { this.setState({ selectedIndex: index }); }}
              className={classnames("nav-link", this.state.selectedIndex === index && "active")}
            >
              <i className={`${value.props.icon} icon`} />{value.props.tab}
            </a>
          </li>;
        })}
      </ul>
      <div onClick={onClick}>
        {React.Children.toArray(children)[this.state.selectedIndex]}
      </div>
    </React.Fragment>;
  }
}

class Tab extends React.Component {
  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}

Tabs.Tab = Tab;

export default Tabs;