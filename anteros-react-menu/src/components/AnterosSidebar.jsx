import React, { forwardRef, createContext, useEffect, useState } from 'react';
import classNames from 'classnames';


export const AnterosSidebarContext = createContext({
  collapsed: false,
  rtl: false,
  toggled: false,
});

const AnterosSidebar = (
  {
    children,
    className,
    width,
    collapsedWidth,
    collapsed,
    rtl,
    toggled,
    image,
    breakPoint,
    onToggle,
    style = {},
    ...rest
  },
  ref,
) => {
  const [sidebarState, setSidebarState] = useState({
    collapsed: typeof collapsed === 'undefined' ? false : collapsed,
    rtl: typeof rtl === 'undefined' ? false : rtl,
    toggled: typeof toggled === 'undefined' ? false : toggled,
  });

  const sidebarRef =
    (ref) || React.createRef();

  const handleToggleSidebar = () => {
    const toggleValue = sidebarState.toggled;
    setSidebarState({ ...sidebarState, toggled: !toggleValue });
    if (onToggle) {
      onToggle(!toggleValue);
    }
  };

  const widthStyle = width ? { width, minWidth: width } : {};
  const collapsedWidthStyle = collapsedWidth
    ? { width: collapsedWidth, minWidth: collapsedWidth }
    : {};
  const finalWidth = collapsed ? collapsedWidthStyle : widthStyle;

  useEffect(() => {
    setSidebarState({ ...sidebarState, collapsed, rtl, toggled });
  }, [collapsed, rtl, toggled]);

  return (
    <AnterosSidebarContext.Provider value={sidebarState}>
      <div
        ref={sidebarRef}
        className={classNames('pro-sidebar', className, breakPoint, { collapsed, rtl, toggled })}
        style={{ ...finalWidth, ...style }}
        {...rest}
      >
        <div className="pro-sidebar-inner">
          {image ? <img src={image} alt="sidebar background" className="sidebar-bg" /> : null}
          <div className="pro-sidebar-layout">{children}</div>
        </div>
        <div
          className="overlay"
          onClick={handleToggleSidebar}
          onKeyPress={handleToggleSidebar}
          role="button"
          tabIndex={0}
          aria-label="overlay"
        />
      </div>
    </AnterosSidebarContext.Provider>
  );
};

export default forwardRef(AnterosSidebar);
