import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {AnterosUtils} from '@anterostecnologia/anteros-react-core';

export default class AnterosNavigatorBar extends Component {
    
    constructor(props){
        super(props);
        this.getExpandClass = this.getExpandClass.bind(this);
        this.getToggleableClass = this.getToggleableClass.bind(this);
        this.toggleableToExpand = {
            xs: 'sm',
            sm: 'md',
            md: 'lg',
            lg: 'xl',
          };
    }

    static get componentName() {
      return "AnterosNavigatorBar";
    }

    getExpandClass(expand){
        if (expand === false) {
          return false;
        } else if (expand === true || expand === 'xs') {
          return 'navbar-expand';
        }
      
        return `navbar-expand-${expand}`;
      };

    getToggleableClass(toggleable) {
        if (toggleable === undefined || toggleable === 'xl') {
          return false;
        } else if (toggleable === false) {
          return 'navbar-expand';
        }
      
        return `navbar-expand-${toggleable === true ? 'sm' : (this.toggleableToExpand[toggleable] || toggleable)}`;
      };  
    

    render(){
        const {
            toggleable,
            expand,
            className,
            cssModule,
            light,
            dark,
            inverse,
            fixed,
            sticky,
            color,
            tag: Tag,
            ...attributes
        } = this.props;

        const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
            className,
            'navbar',
            this.getExpandClass(expand) || this.getToggleableClass(toggleable),
            {
            'navbar-light': light,
            'navbar-dark': inverse || dark,
            [`bg-${color}`]: color,
            [`fixed-${fixed}`]: fixed,
            [`sticky-${sticky}`]: sticky,
            }
        ), cssModule);

        return (
            <Tag {...attributes} className={classes} />
        );
    }
};

AnterosNavigatorBar.propTypes = {
    light: PropTypes.bool,
    dark: PropTypes.bool,
    full: PropTypes.bool,
    fixed: PropTypes.string,
    sticky: PropTypes.string,
    color: PropTypes.string,
    role: PropTypes.string,
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    className: PropTypes.string,
    cssModule: PropTypes.object,
    expand: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  };
  
  AnterosNavigatorBar.defaultProps = {
    tag: 'nav',
    expand: false,
  };



  export class AnterosNavigatorBarItem extends Component {
  
    constructor(props){
        super(props);
    }
 
    render(){
        const {
        className,
        cssModule,
        active,
        tag: Tag,
        ...attributes
        } = this.props;
    
        const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
        className,
        'nav-item',
        active ? 'active' : false
        ), cssModule);
    
        return (
            <Tag {...attributes} className={classes} />
        );
    }
  };


  AnterosNavigatorBarItem.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    active: PropTypes.bool,
    className: PropTypes.string,
    cssModule: PropTypes.object,
  };
  
  AnterosNavigatorBarItem.defaultProps = {
    tag: 'li'
  };



export class AnterosNavigatorBarLink extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    if (this.props.disabled) {
      e.preventDefault();
      return;
    }

    if (this.props.href === '#') {
      e.preventDefault();
    }

    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    let {
      className,
      cssModule,
      active,
      tag: Tag,
      innerRef,
      ...attributes
    } = this.props;

    const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
      className,
      'nav-link',
      {
        disabled: attributes.disabled,
        active: active
      }
    ), cssModule);

    return (
      <Tag {...attributes} ref={innerRef} onClick={this.onClick} className={classes} />
    );
  }
}

AnterosNavigatorBarLink.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    onClick: PropTypes.func,
    href: PropTypes.any,
  };
  
  AnterosNavigatorBarLink.defaultProps = {
    tag: 'a',
  };

   
  
  export class AnterosNavigatorBarBrand extends Component {

    constructor(props){
        super(props);
    }

    render(){
        const {
        className,
        cssModule,
        tag: Tag,
        ...attributes
        } = this.props;
    
        const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
        className,
        'navbar-brand'
        ), cssModule);
    
        return (
        <Tag {...attributes} className={classes} />
        );
    }
  };
  
  AnterosNavigatorBarBrand.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    className: PropTypes.string,
    cssModule: PropTypes.object,
  };
  
  AnterosNavigatorBarBrand.defaultProps = {
    tag: 'a'
  };


  
  
  export class AnterosNavigatorBarToggler extends Component {
      constructor(props){
          super(props);
      }

      render(){
        const {
        className,
        cssModule,
        children,
        tag: Tag,
        ...attributes
        } = this.props;
    
        const classes = AnterosUtils.mapToCssModules(AnterosUtils.buildClassNames(
        className,
        'navbar-toggler'
        ), cssModule);
    
        return (
        <Tag {...attributes} className={classes}>
            {children || <span className={AnterosUtils.mapToCssModules('navbar-toggler-icon', cssModule)} />}
        </Tag>
        );
    }
  };


  AnterosNavigatorBarToggler.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    type: PropTypes.string,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    children: PropTypes.node,
  };
  
  AnterosNavigatorBarToggler.defaultProps = {
    tag: 'button',
    type: 'button'
  };
  
