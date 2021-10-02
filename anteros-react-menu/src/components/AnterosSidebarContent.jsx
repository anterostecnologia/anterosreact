import React, { forwardRef } from 'react';
import classNames from 'classnames';


const AnterosSidebarContent = (
  { children, className, ...rest },
  ref,
) => {
  const sidebarContentRef =
    (ref) || React.createRef();
  return (
    <div ref={sidebarContentRef} className={classNames('pro-sidebar-content', className)} {...rest}>
      {children}
    </div>
  );
};

export default forwardRef(AnterosSidebarContent);
