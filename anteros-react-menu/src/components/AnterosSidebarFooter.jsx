import React, { forwardRef } from 'react';
import classNames from 'classnames';

const AnterosSidebarFooter = (
  { children, className, ...rest },
  ref,
) => {
  const sidebarFooterRef =
    (ref) || React.createRef();
  return (
    <div ref={sidebarFooterRef} className={classNames('pro-sidebar-footer', className)} {...rest}>
      {children}
    </div>
  );
};

export default forwardRef(AnterosSidebarFooter);
