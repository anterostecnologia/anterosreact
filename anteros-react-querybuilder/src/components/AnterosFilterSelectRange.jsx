import React from "react";
import { AnterosPanel } from "@anterostecnologia/anteros-react-containers";
import { autoBind } from "@anterostecnologia/anteros-react-core";
import { AnterosButton } from "@anterostecnologia/anteros-react-buttons";
import Modal from "react-modal";
import { Calendar } from "react-multi-date-picker";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

class AnterosFilterSelectRange extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = { value: undefined };
    this.dateRef = React.createRef();
  }

  componentWillReceiveProps(nextProps){
    this.setState({value:undefined});
  }

  handleDateChange(value) {
    this.setState({ value });
  }

  render() {
    return (
      <Modal
        id={this.props.id}
        key={this.props.key}
        isOpen={this.props.isOpen}
        onRequestClose={this.onCancel}
        style={{
          overlay: {
            position: "fixed",
            left: this.props.left,
            top: this.props.top,
            width: this.props.selectRangeType==='month'?'260px':this.props.width,
            height: this.props.selectRangeType==='month'?'350px':'320px',
            backgroundColor: "rgba(255, 255, 255, 0.75)",
          },
          content: {
            inset: 0,
            padding: 0,
            position: "absolute",
            border: 0,
            background: "rgb(255, 255, 255)",
            borderRadius: "4px",
            outline: "none",
          },
        }}
        centered={true}
      >
        <Calendar
          ref={this.dateRef}
          value={this.state.value}
          shadow={false}
          weekDays={weekDays}
          months={months}
          weekPicker={this.props.selectRangeType === "week"}
          onlyMonthPicker={this.props.selectRangeType === "month"}
          range={
            this.props.selectRangeType === "week" ||
            this.props.selectRangeType === "month" ||
            this.props.selectRangeType === "range"
          }
          multiple={this.props.selectRangeType === "day"}
          onOpen={this.onOpen}
          onClose={this.onClose}
          format={"DD/MM/YYYY"}
          numberOfMonths={2}
          onChange={this.handleDateChange}
          style={{
            height: "100%",
            width: "100%",
            border: "1px solid silver",
          }}
        />
        <AnterosPanel
          border={false}
          style={{
            display: "flex",
            justifyContent: "end",
            width: "100%",
            height: "40px",
            marginTop: "10px",
          }}
        >
          <AnterosButton
            primary
            caption="Aplicar"
            onButtonClick={()=>this.props.onConfirmSelectRange(this.state.value)}
          ></AnterosButton>
          <AnterosButton
            danger
            caption="Cancela"
            onButtonClick={this.props.onCancelSelectRange}
          ></AnterosButton>
        </AnterosPanel>
      </Modal>
    );
  }
}

export { AnterosFilterSelectRange };
