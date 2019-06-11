import React, { Component } from "react";
import lodash from "lodash";
import { AnterosError } from "anteros-react-core";
import PropTypes from "prop-types";

export default class AnterosPageControl extends Component {
	constructor(props) {
		super(props);
		this.state = { active: undefined };
		this.handleSelectTab = this.handleSelectTab.bind(this);
	}

	handleSelectTab(item) {
		this.setState({ active: item });
	}

	render() {
		let style;
		if (this.props.height) {
			style = { height: this.props.height };
		}

		if (this.props.width) {
			style = { ...style, width: this.props.width };
		}

		let tabs = [];
		let contents = [];

		let headerActionsVisible = true;
		let headerActions;

		if (this.props.children) {
			let arrChildren = React.Children.toArray(this.props.children);
			let _this = this;
			arrChildren.forEach(function(child) {
				if (child.type && child.type.componentName === "PageHeaderActions") {
					headerActions = child.props.children;
					headerActionsVisible = child.props.visible;
				} else {
					let active = child.props.active;
					if (_this.state.active) {
						active = false;
						if (_this.state.active == child.props.caption) {
							active = true;
						}
					}

					if (!child.props.id) {
						throw new AnterosError("Informe um ID para aba.");
					}

					if (!child.props.caption) {
						throw new AnterosError("Informe o título(caption) para aba.");
					}

					let href = "#" + child.props.id;

					tabs.push(
						React.createElement(AnterosTabLink, {
							key: lodash.uniqueId(),
							active: active,
							href: href,
							disabled: child.props.disabled,
							caption: child.props.caption,
							icon: child.props.icon,
							visible: child.props.visible,
							image: child.props.image,
							imageCircle: child.props.imageCircle,
							imageWidth: child.props.imageWidth,
							imageHeight: child.props.imageHeight,
							onTabLinkClick: child.props.onTabLinkClick
						})
					);

					contents.push(
						React.createElement(
							AnterosTabContent,
							{
								key: lodash.uniqueId(),
								active: active,
								id: child.props.id,
								onTabClick: child.props.onTabClick,
								onPageChange: _this.props.onPageChange
							},
							child.props.children
						)
					);
				}
			});
		}

		if (this.props.vertical) {
			let classNameTab = "nav nav-tabs tabs-vertical";
			return (
				<div className={this.props.className ? ("page-control " + this.props.className) : "page-control"} style={style}>
					<div className={this.props.custom1 ? "vtabs customvtab" : "vtabs"}>
						<ul className={classNameTab} role="tablist">
							{tabs}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "flex-start",
									position: "absolute",
									right: "0"
								}}
							>
								{headerActionsVisible ? headerActions : null}
							</div>
						</ul>
						<div className="tab-content">{contents}</div>
					</div>
				</div>
			);
		} else {
			let classNameTab = "nav nav-tabs";
			if (this.props.custom1) {
				classNameTab += " customtab";
			} else if (this.props.custom2) {
				classNameTab += " customtab2";
			} else if (this.props.pill) {
				classNameTab += " nav-pills";
			}
			return (
				<div className={this.props.className ? ("page-control " + this.props.className) : "page-control"} style={style}>
					<div
						className={
							this.props.custom1
								? "page-control-header-custom"
								: "page-control-header"
						}
					>
						<ul className={classNameTab} role="tablist">
                            {tabs}
                            <div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "flex-start",
									position: "absolute",
									right: "20px"
								}}
							>
								{headerActionsVisible ? headerActions : null}
							</div>
						</ul>
					</div>
					<div className="tab-content">{contents}</div>
				</div>
			);
		}
	}
}

AnterosPageControl.propTypes = {
	vertical: PropTypes.bool.isRequired,
	custom1: PropTypes.bool.isRequired,
	custom2: PropTypes.bool.isRequired,
	pill: PropTypes.bool.isRequired,
	onPageChange: PropTypes.func
};

AnterosPageControl.defaultProps = {
	vertical: false,
	custom1: false,
	custom2: false,
	pill: false
};

export class AnterosTabLink extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		let className = "nav-link";
		if (this.props.active) {
			className += " active";
		}
		let icon;
		if (this.props.icon) {
			icon = <i className={this.props.icon} />;
		}
		let classNameImage;
		if (this.props.imageCircle) {
			classNameImage = "img-circle";
		}
		let newStyle = {};
		if (!this.props.visible) {
			newStyle = { display: "none" };
		}
		return (
			<li className="nav-item" style={newStyle} onClick={this.onTabLinkClick}>
				<a
					className={className}
					data-toggle="tab"
					href={this.props.href}
					role="tab"
				>
					{icon}{" "}
					<img
						style={{ marginLeft: "3px", marginRight: "3px" }}
						className={classNameImage}
						src={this.props.image}
						height={this.props.imageHeight}
						width={this.props.imageWidth}
					/>{" "}
					{this.props.caption}
				</a>
			</li>
		);
	}
}

AnterosTabLink.propTypes = {
	active: PropTypes.bool.isRequired,
	icon: PropTypes.string,
	image: PropTypes.string,
	imageCircle: PropTypes.bool.isRequired,
	imageHeight: PropTypes.string,
	imageWidth: PropTypes.string,
	onPageChange: PropTypes.func,
	onTabLinkClick: PropTypes.func
};

AnterosTabLink.defaultProps = {
	active: false,
	imageCircle: false
};

export class AnterosTabContent extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		let _this = this;
		$("a[href='#" + this.props.id + "']").on("shown.bs.tab", function(e) {
			if (_this.props.onPageChange) {
				_this.props.onPageChange(_this.props.id);
			}

			if (_this.props.onTabClick) {
				_this.props.onTabClick(_this.props.id);
			}
		});
	}

	render() {
		let className = "tab-pane";
		if (this.props.active) {
			className += " active";
		}
		return (
			<div className={className} id={this.props.id} role="tabpanel">
				{this.props.children}
			</div>
		);
	}
}

AnterosTabContent.propTypes = {
	active: PropTypes.bool.isRequired,
	icon: PropTypes.string,
	image: PropTypes.string,
	imageCircle: PropTypes.bool.isRequired,
	imageHeight: PropTypes.string,
	imageWidth: PropTypes.string,
	onPageChange: PropTypes.func,
	onTabClick: PropTypes.func
};

AnterosTabContent.defaultProps = {
	active: false,
	imageCircle: false
};

export class PageHeaderActions extends Component {
	static get componentName() {
		return "PageHeaderActions";
	}
	render() {
		return <div>{this.props.children}</div>;
	}
}

PageHeaderActions.propTypes = {
	visible: PropTypes.bool
};

PageHeaderActions.defaultProps = {
	visible: true
};
