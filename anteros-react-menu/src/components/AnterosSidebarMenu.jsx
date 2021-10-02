/* eslint-disable react/no-array-index-key */
import React, { forwardRef } from 'react';
import classNames from 'classnames';


const AnterosSidebarMenu = (
  {
    children,
    className,
    iconShape,
    popperArrow = false,
    subMenuBullets = false,
    innerSubMenuArrows = true,
    ...rest
  },
  ref,
) => {
  const menuRef = (ref) || React.createRef();
  return (
    <nav
      ref={menuRef}
      className={classNames('pro-menu', className, {
        [`shaped ${iconShape}`]: ['square', 'round', 'circle'].indexOf(iconShape) >= 0,
        'submenu-bullets': subMenuBullets,
        'inner-submenu-arrows': innerSubMenuArrows,
      })}
      {...rest}
    >
      <ul>
        {React.Children.toArray(children)
          .filter(Boolean)
          .map((child, index) =>
            React.cloneElement(child, {
              key: index,
              firstchild: 1,
              popperarrow: popperArrow === true ? 1 : 0,
            }),
          )}
      </ul>
    </nav>
  );
};

export default forwardRef(AnterosSidebarMenu);
