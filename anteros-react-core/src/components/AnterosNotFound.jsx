import React, { Component } from "react";

export class AnterosNotFound extends Component {
	render() {
		return (
			<div className="nb-error">
				<div className="error-code">404</div>
				<h3 className="font-bold">We couldn"t find the page..</h3>

				<div className="error-desc">
					Sorry, but the page you are looking for was either not found or does
					not exist. <br />
					Try refreshing the page or click the button below to go back to the
					Homepage.
					<div className="input-group">
						<input
							type="text"
							placeholder="Try with a search"
							className="form-control"
						/>
						<span className="input-group-btn">
							<button type="button" className="btn btn-default">
								<em className="fa fa-search" />
							</button>
						</span>
					</div>
				</div>
			</div>
		);
	}
}
