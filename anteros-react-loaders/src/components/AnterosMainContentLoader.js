import React, { Component, Fragment } from 'react'
import {AnterosCol, AnterosRow} from '@anterostecnologia/anteros-react-layout';
import PropTypes from 'prop-types';

import AnterosWidgetLoader from './AnterosWidgetLoader';
import AnterosTitlebarLoader from './AnterosTitlebarLoader';

export default class AnterosMainContentLoader extends Component {
	render() {
		return (
			<Fragment>
				<AnterosTitlebarLoader />
				<AnterosRow>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosWidgetLoader />
					</AnterosCol>
					<AnterosCol small={6} medium={4} large={4} className="w-8-half-block">
						<AnterosTitlebarLoader />
					</AnterosCol>
				</AnterosRow>
			</Fragment>
		)
	}
}
