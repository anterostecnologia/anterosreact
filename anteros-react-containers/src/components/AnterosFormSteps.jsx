import React, { Component } from 'react';
import {AnterosButton} from "anteros-react-buttons";
import lodash from 'lodash';
import { AnterosError, AnterosUtils } from "anteros-react-core";



export class AnterosFormSteps extends Component {
    constructor(props) {
        super(props);
        this.onBackClick = this.onBackClick.bind(this);
        this.onFinishClick = this.onFinishClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.idFormStep = (this.props.id ? this.props.id : lodash.uniqueId("formStep"));
        this.state = { activeIndex: 0, doneIndex: -1 };
        this.numberOfSteps = -1;
    }

    onBackClick(event) {
        if (this.props.onBackClick) {
            this.props.onBackClick(event, this.state.activeIndex);
        }
        if (event.isDefaultPrevented() == true) {
            return false;
        }

        this.setState({ ...this.state, activeIndex: this.state.activeIndex - 1, doneIndex: this.state.doneIndex - 1 })
    }

    onFinishClick(event) {
        if (this.props.onFinishClick) {
            this.props.onFinishClick(event, this.state.activeIndex);
        }
        if (event.isDefaultPrevented() == true) {
            return false;
        }

    }

    onNextClick(event) {
        if (this.props.onNextClick) {
            this.props.onNextClick(event, this.state.activeIndex);
        }
        if (event.isDefaultPrevented() == true) {
            return false;
        }

        this.setState({ ...this.state, activeIndex: this.state.activeIndex + 1, doneIndex: this.state.doneIndex + 1 })
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

        this.props.children.forEach(function (item, index) {
            if (item.type && item.type.name != "AnterosFormStep") {
                throw new AnterosError("Apenas componentes do tipo AnterosFormStep podem ser usados como filhos de AnterosFormSteps.");
            }
            let active = index == _this.state.activeIndex;
            steps.push(React.cloneElement(item, { index: index + 1, active: active, circle: _this.props.circle, key: "stp" + index, done: index <= _this.state.doneIndex, disabled: index > _this.state.activeIndex }));
            content.push(<section key={"sec" + index} style={{ display: active ? "block" : "none", overflow: "hidden" }}>{item.props.children}</section>);
            _this.numberOfSteps++;
        });


        let stepsDiv = <div className={this.props.circle ? "pearls row" : "steps steps-sm row"}>
            {steps}
        </div>;

        return (
            <div style={{ ...this.props.style, height: this.props.height, width: this.props.width }}>
                {stepsDiv}

                <div className="wizard-content" style={{ ...this.props.contentStyle, height: this.props.contentHeight, overflow: "auto" }}>
                    {content}
                </div>

                <div className="wizard-buttons step-footer">
                    <AnterosButton id={this.idFormStep + "_btnBack"} secondary visible={this.state.activeIndex > 0} outline={this.props.buttonOutline} caption={this.props.backCaption} onClick={this.onBackClick} />
                    <AnterosButton id={this.idFormStep + "_btnNext"} primary visible={this.state.activeIndex < this.numberOfSteps - 1} outline={this.props.buttonOutline} pullRight caption={this.props.nextCaption} onClick={this.onNextClick} />
                    <AnterosButton id={this.idFormStep + "_btnSuccess"} success visible={this.state.activeIndex == this.numberOfSteps - 1} outline={this.props.buttonOutline} pullRight caption={this.props.finishCaption} onClick={this.onFinishClick} />
                </div>
            </div>
        );
    }
}


AnterosFormSteps.propTypes = {
    contentHeight: React.PropTypes.string,
    contentStyle: React.PropTypes.object,
    circle: React.PropTypes.bool.isRequired,
    backCaption: React.PropTypes.string.isRequired,
    nextCaption: React.PropTypes.string.isRequired,
    finishCaption: React.PropTypes.string.isRequired,
    buttonOutline: React.PropTypes.bool.isRequired,
    height: React.PropTypes.string,
    width: React.PropTypes.string,
    style: React.PropTypes.object,
    onBackClick: React.PropTypes.func,
    onFinishClick: React.PropTypes.func,
    onNextClick: React.PropTypes.func

};

AnterosFormSteps.defaultProps = {
    circle: false,
    backCaption: "Voltar",
    nextCaption: "Próximo",
    finishCaption: "Finalizar",
    buttonOutline: false
}



export class AnterosFormStep extends Component {
    constructor(props) {
        super(props);

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

            return (<div className={className} aria-expanded="true">
                <div className="pearl-icon"><i className={this.props.icon} aria-hidden="true"></i></div>
                <span className="pearl-title">{this.props.caption}</span>
            </div>)
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

            return (<div className={className} role="tab" aria-expanded="true" style={{ height: "70px" }}>
                {this.props.icon ? <span className="step-icon"><i className={this.props.icon} aria-hidden="true"></i></span> : <span className="step-number">{this.props.index}</span>}
                <div className="step-desc">
                    <span className="step-title">{this.props.caption}</span>
                    <p>{this.props.description}</p>
                </div>
            </div>)
        };
    }
}


AnterosFormStep.propTypes = {
    caption: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string,
    image: React.PropTypes.string
};

