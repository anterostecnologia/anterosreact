import React, { Component } from 'react';


export default class AnterosFooter extends Component {
    render() {
        let classFooter = "footer ";
        if (this.context.horizontal) {
            classFooter += " horizontal";
        }
        return (
            <footer className={classFooter}>
                <div className="footer-block buttons">

                </div>
                <div className="footer-block author">
                    <ul>
                        <li> {this.props.children} </li>
                    </ul>
                </div>
            </footer>
        )
    }
}


AnterosFooter.contextTypes = {
    horizontal: React.PropTypes.bool
}
