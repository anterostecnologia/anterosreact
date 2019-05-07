import React, { Component } from "react";
import PropTypes from "prop-types";
export class Then extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		if (typeof this.props.children === "function") {
			return this.props.children();
		}
		return this.props.children || null;
	}
}

export class Else extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		if (typeof this.props.children === "function") {
			return this.props.children();
		}
		return this.props.children || null;
	}
}

Then.propTypes = Else.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.string,
		PropTypes.number,
		PropTypes.object
	])
};

export class If extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { children } = this.props;
		if (children == null) {
			return null;
		}

		let result =
			[]
				.concat(children)
				.find(c => (c.type !== Else) ^ !this.props.condition) || null;
		return result;
	}
}

const ThenOrElse = PropTypes.oneOfType([
	PropTypes.object,
	PropTypes.instanceOf(Then),
	PropTypes.instanceOf(Else)
]);

If.propTypes = {
	condition: PropTypes.bool.isRequired,
	children: PropTypes.oneOfType([PropTypes.arrayOf(ThenOrElse), ThenOrElse])
};

If.Then = Then;
If.Else = Else;

export class Switch extends Component {
	constructor(props) {
		super(props);
		this.getChildrens = this.getChildrens.bind(this);
	}

	getChildrens() {
		var cases = [],
			defaults = [];

		Children.forEach(this.props.children, item => {
			if (item instanceof Case) {
				if (this.props.condition === item.props.value) {
					cases.push(item);
				}
			} else {
				defaults.push(item);
			}
		});

		if (cases.length > 0) {
			return cases;
		}
		return defaults;
	}

	render() {
		return (
			<div className={this.props.addClass ? this.props.addClass : ""}>
				{this.getChildrens().map(function(item, index) {
					return item;
				})}
			</div>
		);
	}
}

export class Case extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return this.props.children;
	}
}

export class Default extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return this.props.children;
	}
}
