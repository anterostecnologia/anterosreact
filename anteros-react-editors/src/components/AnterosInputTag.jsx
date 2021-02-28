import { Component } from 'react';
import PropTypes from 'prop-types'

import { buildGridClassNames, columnProps } from "@anterostecnologia/anteros-react-layout";
import { AnterosLocalDatasource, AnterosRemoteDatasource } from '@anterostecnologia/anteros-react-datasource';

export default class AnterosInputTag extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tags: this.props.dataSource && this.props.dataSource.fieldByName(this.props.dataField) ?
            this.props.dataSource.fieldByName(this.props.dataField).split(this.props.separator) : this.props.tags
        };
    }

    removeTag = (i) => {
        let disabled = this.props.disabled
        let readOnly = this.props.readOnly
        
        if (this.props.dataSource) {
            readOnly = this.props.dataSource.getState() === 'dsBrowse'
        }

        if (disabled || readOnly) {
            return;
        }

        const newTags = [...this.state.tags];
        newTags.splice(i, 1);
        this.setState({ tags: newTags });
        if (this.props.dataSource && this.props.dataSource.getState() !== 'dsBrowse') {
            this.props.dataSource.setFieldByName(this.props.dataField, newTags.join(this.props.separator))
        }
    }

    inputKeyDown = (evt) => {

        let disabled = this.props.disabled
        let readOnly = this.props.readOnly
        
        if (this.props.dataSource) {
            readOnly = this.props.dataSource.getState() === 'dsBrowse'
        }

        if (disabled || readOnly) {
            evt.preventDefault();
            evt.stopPropagation();
            return;
        }

        const val = evt.target.value;

        let addTag = false;
        let removeTag = false;

        if ((evt.which === 13 || evt.which === 188 || evt.which === 32)) {
            evt.preventDefault();
            addTag = true;
        } else if ((evt.which === 8 || evt.which === 46)) {
            removeTag = true;
        }

        if ( addTag && val) {
            evt.preventDefault();
            if (this.state.tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
                return;
            }
            if (this.props.dataSource && this.props.dataSource.getState() !== 'dsBrowse') {
                this.props.dataSource.setFieldByName(this.props.dataField, ([...this.state.tags, val]).join(this.props.separator));
            }
            this.setState({ tags: [...this.state.tags, val] });
            this.tagInput.value = null;
        } else if (removeTag && !val) {
            this.removeTag(this.state.tags.length - 1);
        }
    }

    onBlur = (evt) => {
        const val = evt.target.value;
        if (val) {
            if (this.state.tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
                return;
            }
            if (this.props.dataSource && this.props.dataSource.getState() !== 'dsBrowse') {
                this.props.dataSource.setFieldByName(this.props.dataField, ([...this.state.tags, val]).join(this.props.separator))
            }
            this.setState({ tags: [...this.state.tags, val] });
            this.tagInput.value = null;
        }

        if (this.props.onBlur) {
            this.props.onBlur(evt, val);
        }
    }

    onChange = (evt) => {
        const val = evt.target.value;

        if (this.props.onChange) {
            this.props.onChange(evt, val);
        }
    }

    render() {
        const colClasses = buildGridClassNames(this.props, false, []);
        const { tags } = this.state;

        let disabled = this.props.disabled
        let readOnly = this.props.readOnly
        
        if (this.props.dataSource) {
            readOnly = this.props.dataSource.getState() === 'dsBrowse'
        }

        return (
            <div className={colClasses}>
                <div className="input-tag">
                    <ul className="input-tag__tags">
                        {tags.map((tag, i) => (
                            <li key={tag}>
                                {tag}
                                <button type="button" onClick={() => { this.removeTag(i); }}>+</button>
                            </li>
                        ))}
                        <li className="input-tag__tags__input">
                            <input
                            type="text"
                            disabled={disabled || readOnly}
                            className={(disabled || readOnly) ? 'disabled':''}
                            onBlur={this.onBlur}
                            onKeyDown={this.inputKeyDown}
                            ref={c => { this.tagInput = c; }} />
                            </li>
                    </ul>
                </div>
            </div>
        );
    }
}

AnterosInputTag.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string),
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    dataSource: PropTypes.oneOfType([
        PropTypes.instanceOf(AnterosLocalDatasource),
        PropTypes.instanceOf(AnterosRemoteDatasource)
    ]),
    dataField: PropTypes.string,
    separator: PropTypes.string,
    extraSmall: columnProps,
    small: columnProps,
    medium: columnProps,
    large: columnProps,
    extraLarge: columnProps,
    onChange: PropTypes.func,
    onBlur: PropTypes.func
}

AnterosInputTag.defaultProps = {
    tags: [],
    disabled: false,
    readOnly: false,
    separator: ','
}
