import React, { cloneElement, Children, Component } from 'react';
import lodash from 'lodash';
import PropTypes from 'prop-types';

export class AnterosFloatingButton extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = { open: props.defaultState === 'open' ? true : false };
        this.idFButton = lodash.uniqueId('FB');
        this.idIconOpen = lodash.uniqueId('FB');
        this.idIconClose = lodash.uniqueId('FB');
        this.idLink = lodash.uniqueId('FB');
        this.onDocumentClick = this.onDocumentClick.bind(this);
        document.onclick = this.onDocumentClick;
    }

    componentDidMount() {
        // $('[data-toggle="tooltip"]').tooltip();
    }

    onDocumentClick(event) {
        if (this.props.autoClose && this.state.open && event.target.id != this.idLink &&
            event.target.id != this.idIconClose && event.target.id != this.idIconOpen) {
            this.setState(() => ({ open: false }));
        }
    }

    onClick(event) {
        if (this.props.openMode == 'click') {
            event.preventDefault();
            let isOpen = !this.state.open;
            this.setState(() => ({ open: isOpen }));
        }
    }

    renderChild(child, index) {
        return cloneElement(child,
            { handleClick: (this.props.autoClose ? this.onClick : undefined), index: index, key: index });
    }

    render() {
        let className = "fab-menu horizontal";
        if (this.props.top) {
            className += " fab-menu-top";
        } else if (this.props.bottom) {
            className += " fab-menu-bottom";
        } else if (this.props.topLeft) {
            className += " fab-menu-top-left";
        } else if (this.props.topRight) {
            className += " fab-menu-top-right";
        } else if (this.props.bottomLeft) {
            className += " fab-menu-bottom-left";
        } else if (this.props.bottomRight) {
            className += " fab-menu-bottom-right";
        } else {
            className += " fab-menu-top";
        }
        if (this.props.fixed) {
            className += " fab-menu-fixed";
        }

        let classNameRef = "fab-menu-btn btn btn-float btn-rounded btn-icon";

        if (this.props.success) {
            classNameRef += " btn-success";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.primary) {
            classNameRef += " btn-primary";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.danger) {
            classNameRef += " btn-danger";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.info) {
            classNameRef += " btn-info";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.warning) {
            classNameRef += " btn-warning";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.secondary) {
            classNameRef += " btn-secondary";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else {
            classNameRef += " btn-primary";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        }


        return (
            <ul id={this.props.id ? this.props.id : this.idFButton}
                className={className}
                style={this.props.style}
                data-fab-toggle={this.props.openMode} data-fab-state={this.state.open ? "open" : "close"}>
                <li>
                    <a href="#" id={this.idLink} className={classNameRef}
                        style={{ backgroundColor: this.props.backgroundColor }}
                        onClick={this.onClick}>
                        <i style={{ color: this.props.color }} id={this.idIconOpen} className={"fab-iiconn-open " + this.props.iconOpen}></i>
                        <i style={{ color: this.props.color }} id={this.idIconClose} className={"fab-iiconn-close " + this.props.iconClose}></i>
                    </a>

                    {this.props.children ? <ul className="fab-menu-inner">
                        {Children.toArray(this.props.children).map((c, i) => (this.renderChild(c, i)))}
                    </ul> : null}
                </li>
            </ul>
        );
    }
}


AnterosFloatingButton.propTypes = {
    iconOpen: PropTypes.string,
    iconClose: PropTypes.string,
    image: PropTypes.string,
    hint: PropTypes.string.isRequired,
    hintPosition: PropTypes.oneOf(['left', 'right', 'top', 'bottom']).isRequired,
    backgroundColor: PropTypes.string,
    color: PropTypes.string,
    success: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    secondary: PropTypes.bool,
    outline: PropTypes.bool,
    onButtonClick: PropTypes.func,
    autoClose: PropTypes.bool.isRequired,
    openMode: PropTypes.oneOf(['click', 'hover']),
    defaultState: PropTypes.oneOf(['open', 'close']),
    top: PropTypes.bool,
    bottom: PropTypes.bool,
    topLeft: PropTypes.bool,
    topRight: PropTypes.bool,
    bottomLeft: PropTypes.bool,
    bottomRight: PropTypes.bool,
    fixed: PropTypes.bool,
    style: PropTypes.any
};

AnterosFloatingButton.defaultProps = {
    iconOpen: "fal fa-plus",
    iconClose: "fal fa-times",
    hintPosition: "top",
    autoClose: true,
    openMode: 'hover'
};




export class AnterosFloatingButtonItem extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.idItemRef = lodash.uniqueId("fbitem");
    }

    onClick(event) {
        event.stopPropagation();
        if (this.props.handleClick) {
            this.props.handleClick(event);
        }
        if (this.props.onButtonClick) {
            this.props.onButtonClick(event, this, this.props.index);
        }
    }

    render() {
        let menuDropDown;
        let badge;
        let mark;
        if (this.props.children) {
            let _this = this;
            let arrChildren = Children.toArray(this.props.children);
            arrChildren.forEach(function (child) {
                if (child.type && (child.type.componentName === 'AnterosDropdownMenu')) {
                    menuDropDown = child;
                } else if (child.type && (child.type.componentName === 'AnterosBadge')) {
                    badge = child;
                } else if (child.type && (child.type.componentName === 'AnterosStatusMark')) {
                    mark = child;
                }
            });
        }

        let classNameRef = "btn btn-rounded btn-icon btn-float";

        if (this.props.success) {
            classNameRef += " btn-success";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.primary) {
            classNameRef += " btn-primary";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.danger) {
            classNameRef += " btn-danger";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.info) {
            classNameRef += " btn-info";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.warning) {
            classNameRef += " btn-warning";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else if (this.props.secondary) {
            classNameRef += " btn-secondary";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        } else {
            classNameRef += " btn-primary";
            if (this.props.outline) {
                classNameRef += "-outline";
            }
        }

        if (this.props.disabled){
            classNameRef += " disabled";
        }
        return (<li>
            <div title={this.props.hint}
                data-placement={this.props.hintPosition}
                data-balloon-pos={this.props.hintPosition}
                aria-label={this.props.hint}
            >
                <a id={this.props.id ? this.props.id : this.idItemRef}
                    key={this.props.id ? this.props.id : this.idItemRef}
                    style={{ backgroundColor: this.props.backgroundColor }}
                    href="#" className={classNameRef} onClick={this.onClick}>
                    {this.props.icon ? <i className={this.props.icon} style={{ color: this.props.color }} onClick={this.onClick} /> : null}
                    <img src={this.props.image} className="img-responsive" style={{ width: this.props.imageWidth, height: this.props.height }} onClick={this.onClick} />
                    {badge}
                    {mark}
                </a>
                {menuDropDown}
            </div>
        </li>)
    }
}

AnterosFloatingButtonItem.propTypes = {
    id: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    hint: PropTypes.string,
    hintPosition: PropTypes.oneOf(['left', 'right', 'top', 'bottom']).isRequired,
    backgroundColor: PropTypes.string,
    color: PropTypes.string,
    success: PropTypes.bool,
    primary: PropTypes.bool,
    danger: PropTypes.bool,
    secondary: PropTypes.bool,
    info: PropTypes.bool,
    onButtonClick: PropTypes.func,
    disabled: PropTypes.bool.isRequired
};

AnterosFloatingButtonItem.defaultProps = {
    hintPosition: "left",
    disabled: false,
};
