import React from "react";

class AnterosRibbonButton extends React.Component {
  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.route);
    }
  };
  render() {
    const { icon, caption, wordBreak, color, disabled } = this.props;
    let captions = [caption];
    if (wordBreak) {
      captions = caption.split(" ");
    }

    return (
      <button
        disabled={disabled}
        style={{ minHeight: "78px" }}
        type="button"
        className="btn btn-light btn-block"
        onClick={this.onClick}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ display: "grid" }}>
            <i
              className={icon}
              style={{
                fontSize: "28px",
                marginBottom: "6px",
                color: color,
              }}
            ></i>
            {captions.map((item) => {
              return <span style={{ fontSize: "14px" }}>{item}</span>;
            })}
          </div>
        </div>
      </button>
    );
  }
}

export default AnterosRibbonButton;
