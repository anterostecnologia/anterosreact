import React from 'react';
import classnames from 'classnames';


const Button = (props) => {
  const { children, style, className, icon = null, loading = false, onClick } = props;
  return <button className={classnames("button", className, icon && "icon")} style={style} onClick={onClick}>
    {loading && <i className="loading" />}
    {icon}
    <span>{children}</span>
  </button>;
};

Button.Group = ({ children, className }) => <div className={classnames("buttonGroup", className)}>{children}</div>;


export default Button;