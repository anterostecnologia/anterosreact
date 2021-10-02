import React, { forwardRef } from 'react';
import classNames from 'classnames';

const AnterosSidebarHeader = (
  { children, className, ...rest },
  ref,
) => {
  const sidebarHeaderRef =
    (ref) || React.createRef();
  return (
    <div ref={sidebarHeaderRef} className={classNames('pro-sidebar-header', className)} {...rest}>
      {children}
    </div>
  );
};

export default forwardRef(AnterosSidebarHeader);
