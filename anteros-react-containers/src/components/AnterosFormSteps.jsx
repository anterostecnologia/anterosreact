import React, {Component, Fragment} from 'react';
import {AnterosButton} from "anteros-react-buttons";
import lodash from 'lodash';
import {AnterosError, AnterosUtils} from "anteros-react-core";
import PropTypes from 'prop-types';

export class AnterosFormSteps extends Component {
    constructor(props) {
        super(props);
        this.onBackClick = this
            .onBackClick
            .bind(this);
        this.onFinishClick = this
            .onFinishClick
            .bind(this);
        this.onCancelClick = this
            .onCancelClick
            .bind(this);
        this.onNextClick = this
            .onNextClick
            .bind(this);
        this.idFormStep = (this.props.id
            ? this.props.id
            : lodash.uniqueId("formStep"));
        this.state = {
            activeIndex: 0,
            doneIndex: -1
        };
        this.numberOfSteps = -1;
    }

    onBackClick(event) {
        if (this.props.onBackClick) {
            this
                .props
                .onBackClick(event, this.state.activeIndex);
        }
        if (event.isDefaultPrevented() == true) {
            return false;
        }

        let index = this.state.activeIndex - 1;

        if (this.props.onFormStepChange) {
            this
                .props
                .onFormStepChange(index);
        }

        this.setState({
            ...this.state,
            activeIndex: index,
            doneIndex: this.state.doneIndex - 1
        })
    }

    onFinishClick(event) {
        if (this.props.onFinishClick) {
            this
                .props
                .onFinishClick(event, this.state.activeIndex);
        }
        if (event.isDefaultPrevented() == true) {
            return false;
        }

    }

    onCancelClick(event) {
        if (this.props.onCancelClick) {
            this
                .props
                .onCancelClick(event, this.state.activeIndex);
        }
        if (event.isDefaultPrevented() == true) {
            return false;
        }

    }

    static get componentName(){
        return 'AnterosFormSteps';
    }

    onNextClick(event) {
        if (this.props.onNextClick) {
            let result = this
                .props
                .onNextClick(event, this.state.activeIndex);
            let _this = this;
            if (result instanceof Promise) {
                event.preventDefault();
                result
                    .then(function (data) {
                        let index = _this.state.activeIndex + 1;
                        if (_this.props.onFormStepChange) {
                            _this
                                .props
                                .onFormStepChange(index);
                        }
                        _this.setState({
                            ..._this.state,
                            activeIndex: index,
                            doneIndex: _this.state.doneIndex + 1
                        })
                    }, function (err) {
                        if (_this.props.onError) {
                            _this
                                .props
                                .onError(err);
                        }
                    });
            }
        }
        if (event.isDefaultPrevented() == true) {
            return false;
        }

        let index = this.state.activeIndex + 1;

        if (this.props.onFormStepChange) {
            this
                .props
                .onFormStepChange(index);
        }

        this.setState({
            ...this.state,
            activeIndex: index,
            doneIndex: this.state.doneIndex + 1
        })
    }

    componentDidUpdate(){
        if (this.props.onAfterUpdateFormSteps) {
            this.props.onAfterUpdateFormSteps();
        }
    }

    render() {
        let className = "wizard clearfix";
        if (this.props.className) {
            className = this.props.className + " clearfix";
        }

        let steps = [];
        let content = [];
        let _this = this;

        this.numberOfSteps = 0;

        let footerContent = [];
        let headerContent;
        let position = 'first';

        let index = 0;

        this
            .props
            .children
            .forEach(function (item, idx) {
                if (item.type){
                    if (!(item.type.componentName === 'AnterosFormStep') &&
                        !(item.type.componentName === 'AnterosStepFooter') &&
                        !(item.type.componentName === 'AnterosStepHeader')){
                            throw new AnterosError("Apenas componentes do tipo AnterosFormStep, AnterosStepFooter, AnterosStepHeader" +
                            " e podem ser usados como filhos de AnterosFormSteps" +
                            ".");
                        }
                }
                if (item.type.componentName === 'AnterosFormStep') {
                    let active = index == _this.state.activeIndex;
                    steps.push(React.cloneElement(item, {
                        index: index + 1,
                        active: active,
                        circle: _this.props.circle,
                        key: "stp" + index,
                        done: index <= _this.state.doneIndex,
                        disabled: index > _this.state.activeIndex,
                        onAfterUpdateFormStep : item.props.onAfterUpdateFormStep?item.props.onAfterUpdateFormStep:_this.props.onAfterUpdateFormStep
                    }));
                    content.push(
                        <section
                            key={"sec" + index}
                            style={{
                            display: active
                                ? "block"
                                : "none",
                            overflow: "hidden"
                        }}>{item.props.children}</section>
                    );
                    _this.numberOfSteps++;
                    index++;
                } else if (item.type.componentName === 'AnterosStepHeader') {
                    headerContent = item;
                } else if (item.type.componentName === 'AnterosStepFooter') {
                    position = item.props.position;
                    footerContent.push(item.props.children);
                }
            });

        let stepsDiv = <div
            className={this.props.circle
            ? "pearls row"
            : "steps steps-sm row"}>
            {steps}
        </div>;

        return (
            <div
                style={{
                ...this.props.style,
                height: this.props.height,
                width: this.props.width
            }}>
                {stepsDiv}
                {headerContent}
                <div
                    className="wizard-content"
                    style={{
                    ...this.props.contentStyle,
                    height: this.props.contentHeight,
                    overflow: "auto"
                }}>
                    {content}
                </div>

                <div className="wizard-buttons step-footer">
                    {position === 'first'
                        ? footerContent.map((item, index) => {
                            let newItem = React.cloneElement(item, {
                                key: "ft" + index
                            });
                            return newItem;
                        })
                        : null}
                    <AnterosButton
                        id={this.idFormStep + "_btnBack"}
                        secondary
                        visible={this.state.activeIndex > 0}
                        outline={this.props.buttonOutline}
                        caption={this.props.backCaption}
                        onClick={this.onBackClick}/>
                    <AnterosButton
                        id={this.idFormStep + "_btnNext"}
                        primary
                        visible={this.state.activeIndex < this.numberOfSteps - 1}
                        outline={this.props.buttonOutline}
                        pullRight
                        caption={this.props.nextCaption}
                        onClick={this.onNextClick}/>
                    <AnterosButton
                        id={this.idFormStep + "_btnSuccess"}
                        success
                        visible={this.state.activeIndex == this.numberOfSteps - 1}
                        outline={this.props.buttonOutline}
                        pullRight
                        caption={this.props.finishCaption}
                        onClick={this.onFinishClick}/>
                    <AnterosButton
                        id={this.idFormStep + "_btnCancel"}
                        danger
                        visible={true}
                        outline={this.props.buttonOutline}
                        pullRight
                        caption={this.props.cancelCaption}
                        onClick={this.onCancelClick}/> {position === 'last'
                        ? footerContent.map((item, index) => {
                            let newItem = React.cloneElement(item, {
                                key: "ft" + index
                            });
                            return newItem;
                        })
                        : null}
                </div>
            </div>
        );
    }
}

AnterosFormSteps.propTypes = {
    contentHeight: PropTypes.string,
    contentStyle: PropTypes.object,
    circle: PropTypes.bool.isRequired,
    backCaption: PropTypes.string.isRequired,
    nextCaption: PropTypes.string.isRequired,
    finishCaption: PropTypes.string.isRequired,
    cancelCaption: PropTypes.string.isRequired,
    buttonOutline: PropTypes.bool.isRequired,
    height: PropTypes.string,
    width: PropTypes.string,
    style: PropTypes.object,
    onBackClick: PropTypes.func,
    onFinishClick: PropTypes.func,
    onCancelClick: PropTypes.func,
    onNextClick: PropTypes.func,
    onFormStepChange: PropTypes.func,
    onError: PropTypes.func,
    onAfterUpdateFormSteps: PropTypes.func,
    onAfterUpdateFormStep: PropTypes.func
};

AnterosFormSteps.defaultProps = {
    circle: false,
    backCaption: "Voltar",
    nextCaption: "Próximo",
    finishCaption: "Finalizar",
    cancelCaption: "Cancelar",
    buttonOutline: false
}

export class AnterosStepFooter extends Component {
    constructor(props) {
        super(props);
    }

    static get componentName(){
        return 'AnterosStepFooter';
    }

    render() {
        return (
            <Fragment>
                {this.props.children}
            </Fragment>
        );
    }
}

export class AnterosStepHeader extends Component {
    constructor(props) {
        super(props);

    }

    static get componentName(){
        return 'AnterosStepHeader';
    }

    render() {
        return (
            <Fragment>
                {this.props.children}
            </Fragment>
        );
    }
}

AnterosStepFooter.propTypes = {
    position: PropTypes.oneOf(['first', 'last'])
}

AnterosStepFooter.defaultProps = {
    position: 'last'
}


export class AnterosFormStep extends Component {
    constructor(props) {
        super(props);
    }

    static get componentName(){
        return 'AnterosFormStep';
    }

    componentDidUpdate(){
        if (this.props.onAfterUpdateFormStep){
            this.props.onAfterUpdateFormStep(this);
        }
    }

    render() {
        if (this.props.circle) {
            let className = "pearl col";
            if (this.props.active) {
                className += " current";
            }
            if (this.props.done) {
                className += " done";
            } else {
                className += " disabled";
            }

            return (
                <div className={className} aria-expanded="true">
                    <div className="pearl-icon">
                        <i className={this.props.icon} aria-hidden="true"></i>
                    </div>
                    <span className="pearl-title">{this.props.caption}</span>
                </div>
            )
        } else {
            let className = "step col";
            if (this.props.active) {
                className += " current";
            }
            if (this.props.done) {
                className += " done";
            }

            if (this.props.disabled) {
                className += " disabled";
            }

            return (
                <div
                    className={className}
                    role="tab"
                    aria-expanded="true"
                    style={{
                    height: "70px"
                }}>
                    {this.props.icon
                        ? <span className="step-icon">
                                <i className={this.props.icon} aria-hidden="true"></i>
                            </span>
                        : <span className="step-number">{this.props.index}</span>}
                    <div className="step-desc">
                        <span className="step-title">{this.props.caption}</span>
                        <p>{this.props.description}</p>
                    </div>
                </div>
            )
        };
    }
}

AnterosFormStep.propTypes = {
    caption: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string,
    image: PropTypes.string
};
