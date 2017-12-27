import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import lodash from "lodash";


export default class AnterosObjectInspector extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (<div className="meta-attributes">
            <table className="meta-attributes__table" style={{cellSpacing:"0", cellPadding:"0", border:"0"}}>
                <tbody>
                    {this.props.children}
                </tbody>
            </table>
        </div>);
    }
}

AnterosObjectInspector.propTypes = {

}


AnterosObjectInspector.defaultProps = {

}

export class InspectorItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<tr>
            <td className="meta-attributes__attr-name">{this.props.label}</td>
            <td className="meta-attributes__attr-detail">
                {this.props.value}
                {this.props.children}
            </td>
        </tr>);
    }
}

InspectorItem.propTypes = {
    label: React.PropTypes.string,
    value: React.PropTypes.any
}

InspectorItem.defaultProps = {

}