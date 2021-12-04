import React from "react";
import PropTypes from "prop-types";
import { Route, Link } from "react-router-dom";

/*
    AnterosRouterNavTab é apenas o <NavLink> do React-Router com alguns adereços padrão alterados + um manipulador onClick para bloquear cliques na guia ativa.
    Bifurcar o código em vez de envolver <NavLink> porque ele invoca o objeto de correspondência que podemos usar no onClick, evitando que façamos a mesma coisa mais acima.
    Tirado de: https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/NavLink.js 
*/

export const AnterosRouterNavTab = ({
  to,
  replace,
  exact,
  strict,
  location,
  activeClassName,
  className,
  activeStyle,
  style,
  isActive: getIsActive,
  "aria-current": ariaCurrent,
  disabled,
  allowClickOnActive,
  ...rest
}) => {
  const path = typeof to === "object" ? to.pathname : to;

  // Regex retirado de: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202
  const escapedPath = path && path.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");


  return (
    <Route
      exact={exact}
      path={escapedPath}
      strict={strict}
      location={location}
      children={({ location, match }) => {
        const isActive = !!(getIsActive ? getIsActive(match, location) : match);

        const onClick = (e) => {
          if (disabled || (isActive && !allowClickOnActive)) {
            e.preventDefault();
          }
        };

        return (
          <Link
            to={to}
            replace={replace} // Normalmente não queremos a navegação com guias anexada ao histórico do navegador
            onClick={onClick} // Impedir qualquer ação quando a guia clicada estiver ativa ou desabilitada
            className={
              isActive
                ? [className, activeClassName].filter((i) => i).join(" ")
                : className
            }
            style={isActive ? { ...style, ...activeStyle } : style}
            aria-current={(isActive && ariaCurrent) || null}
            {...rest}
          />
        );
      }}
    />
  );
};

if (process.env.NODE_ENV !== "production") {
  AnterosRouterNavTab.propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    replace: PropTypes.bool,
    exact: PropTypes.bool,
    strict: PropTypes.bool,
    activeClassName: PropTypes.string,
    className: PropTypes.string,
    activeStyle: PropTypes.object,
    style: PropTypes.object,
    "aria-current": PropTypes.oneOf([
      "page",
      "step",
      "location",
      "date",
      "time",
      "true",
    ]),
    disabled: PropTypes.bool,
  };
}

AnterosRouterNavTab.defaultProps = {
  "aria-current": "page",
  className: "nav-tab",
  activeClassName: "active",
  replace: true,
};

export const AnterosRoutedTabs = ({
  startPathWith,
  elementType,
  className,
  style,
  tabClassName,
  activeTabClassName,
  tabStyle,
  activeTabStyle,
  children,
  ...extraProps
}) => {
  const enhancedChildren = React.Children.map(children, (tab) => {
    if (!tab) return;

    if (typeof tab.type === "string") {
      return tab;
    }

    const { props } = tab;

    const to =
      typeof props.to === "object"
        ? { ...props.to, pathname: startPathWith + props.to.pathname }
        : startPathWith + props.to;

    return React.cloneElement(tab, {
      to,
      className: props.className !== "nav-tab" ? props.className : tabClassName,
      activeClassName:
        props.activeClassName !== "active"
          ? props.activeClassName
          : activeTabClassName,
      style: props.style || tabStyle,
      activeStyle: props.activeStyle || activeTabStyle,
      ...extraProps,
    });
  });

  const El = elementType;

  return (
    <El className={className} style={style}>
      {enhancedChildren}
    </El>
  );
};

if (process.env.NODE_ENV !== "production") {
  AnterosRoutedTabs.propTypes = {
    startPathWith: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    tabClassName: PropTypes.string,
    activeTabClassName: PropTypes.string,
    tabStyle: PropTypes.object,
    activeTabStyle: PropTypes.object,
    children: PropTypes.node,
  };
}

AnterosRoutedTabs.defaultProps = {
  startPathWith: "",
  elementType: "div",
  className: "anteros-router-tabs",
  tabClassName: "anteros-nav-tab",
  activeTabClassName: "active",
  tabStyle: null,
  activeTabStyle: null,
};
