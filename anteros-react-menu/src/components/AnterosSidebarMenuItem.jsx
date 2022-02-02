import React, {forwardRef} from 'react';
import classNames from 'classnames';

const AnterosSidebarMenuItem = (
  { onSelectMenuItem, route, children, className, icon, active, prefix, suffix, firstchild, popperarrow, ...rest },
  ref,
) => {
  const menuItemRef = (ref) || React.createRef();

  return (
    <li onClick={()=>onSelectMenuItem(route)} ref={menuItemRef} className={classNames('pro-menu-item', className, { active })} {...rest}>
      <div className="pro-inner-item" tabIndex={0} role="button">
        {icon ? (
          <span className="pro-icon-wrapper">
            <span className="pro-icon">
              <i className={`${icon}`}></i>
            </span>
          </span>
        ) : null}

        {prefix ? <span className="prefix-wrapper">{prefix}</span> : null}
        <span className="pro-item-content">{children}</span>
        {suffix ? <span className="suffix-wrapper">{suffix}</span> : null}
      </div>
    </li>
  );
};

export default forwardRef(AnterosSidebarMenuItem);
