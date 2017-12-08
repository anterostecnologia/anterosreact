import PropTypes from 'prop-types';
import React from 'react';

export default class AnterosFlexBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const DynamicComponent = this.props.element;

        let style = {};
        if (this.props.style){
            style = this.props.style;
        }
        if (this.props.alignContent) {
            style = { ...style, alignContent: this.props.alignContent };
        }
        if (this.props.alignItems) {
            style = { ...style, alignItems: this.props.alignItems };
        }
        if (this.props.alignSelf) {
            style = { ...style, alignSelf: this.props.alignSelf };
        }
        if (this.props.display) {
            style = { ...style, display: this.props.display };
        }
        if (this.props.flex) {
            style = { ...style, flex: this.props.flex };
        }
        if (this.props.flexBasis) {
            style = { ...style, flexBasis: this.props.flexBasis };
        }
        if (this.props.flexDirection) {
            style = { ...style, flexDirection: this.props.flexDirection };
        }
        if (this.props.flexGrow) {
            style = { ...style, flexGrow: this.props.flexGrow };
        }
        if (this.props.flexShrink) {
            style = { ...style, flexShrink: this.props.flexShrink };
        }
        if (this.props.flexWrap) {
            style = { ...style, flexWrap: this.props.flexWrap };
        }
        if (this.props.height) {
            style = { ...style, height: this.props.height };
        }
        if (this.props.justifyContent) {
            style = { ...style, justifyContent: this.props.justifyContent };
        }
        if (this.props.margin) {
            style = { ...style, margin: this.props.margin };
        }
        if (this.props.marginBottom) {
            style = { ...style, marginBottom: this.props.marginBottom };
        }
        if (this.props.marginLeft) {
            style = { ...style, marginLeft: this.props.marginLeft };
        }
        if (this.props.marginRight) {
            style = { ...style, marginRight: this.props.marginRight };
        }
        if (this.props.marginTop) {
            style = { ...style, marginTop: this.props.marginTop };
        }
        if (this.props.maxHeight) {
            style = { ...style, maxHeight: this.props.maxHeight };
        }
        if (this.props.maxWidth) {
            style = { ...style, maxWidth: this.props.maxWidth };
        }
        if (this.props.minHeight) {
            style = { ...style, minHeight: this.props.minHeight };
        }
        if (this.props.minWidth) {
            style = { ...style, minWidth: this.props.minWidth };
        }
        if (this.props.order) {
            style = { ...style, order: this.props.order };
        }
        if (this.props.padding) {
            style = { ...style, padding: this.props.padding };
        }
        if (this.props.paddingBottom) {
            style = { ...style, paddingBottom: this.props.paddingBottom };
        }
        if (this.props.paddingLeft) {
            style = { ...style, paddingLeft: this.props.paddingLeft };
        }
        if (this.props.paddingRight) {
            style = { ...style, paddingRight: this.props.paddingRight };
        }
        if (this.props.paddingTop) {
            style = { ...style, paddingTop: this.props.paddingTop };
        }
        if (this.props.width) {
            style = { ...style, width: this.props.width };
        }

        return (<DynamicComponent style={style} className={this.props.className} id={this.props.id}>
            {this.props.children}
        </DynamicComponent>);
    }
}


AnterosFlexBox.propTypes = {
    alignContent: PropTypes.oneOf([
        'center',
        'flex-end',
        'flex-start',
        'space-around',
        'space-between',
        'stretch',
    ]),
    alignItems: PropTypes.oneOf(['baseline', 'center', 'flex-end', 'flex-start', 'stretch']),
    alignSelf: PropTypes.oneOf(['baseline', 'center', 'flex-end', 'flex-start', 'stretch']),
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    display: PropTypes.oneOf(['flex', 'inline-flex']),
    element: PropTypes.oneOf([
        'article',
        'aside',
        'div',
        'figure',
        'footer',
        'header',
        'main',
        'nav',
        'section',
    ]),
    flex: PropTypes.string,
    flexBasis: PropTypes.string,
    flexDirection: PropTypes.oneOf(['column-reverse', 'column', 'row-reverse', 'row']),
    flexGrow: PropTypes.number,
    flexShrink: PropTypes.number,
    flexWrap: PropTypes.oneOf(['nowrap', 'wrap-reverse', 'wrap']),
    height: PropTypes.string,
    inline: PropTypes.bool,
    justifyContent: PropTypes.oneOf([
        'center',
        'flex-end',
        'flex-start',
        'space-around',
        'space-between',
    ]),
    margin: PropTypes.string,
    marginBottom: PropTypes.string,
    marginLeft: PropTypes.string,
    marginRight: PropTypes.string,
    marginTop: PropTypes.string,
    maxHeight: PropTypes.string,
    maxWidth: PropTypes.string,
    minHeight: PropTypes.string,
    minWidth: PropTypes.string,
    order: PropTypes.number,
    padding: PropTypes.string,
    paddingBottom: PropTypes.string,
    paddingLeft: PropTypes.string,
    paddingRight: PropTypes.string,
    paddingTop: PropTypes.string,
    style: PropTypes.object,
    width: PropTypes.string,
};

AnterosFlexBox.defaultProps = {
    display: 'flex',
    element: 'div'
};

