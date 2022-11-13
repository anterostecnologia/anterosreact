import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import lodash from "lodash";
import {
  AnterosCol,
  AnterosRow,
} from "@anterostecnologia/anteros-react-layout";

/**
 * Componente Botão
 */
export default class AnterosButton extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.idButton = lodash.uniqueId("btn");
  }

  componentDidMount() {}

  onClick(event) {
    event.stopPropagation();
    if (!this.props.disabled && this.props.onButtonClick) {
      this.props.onButtonClick(event, this);
    }

    if (!this.props.disabled && this.props.onClick) {
      this.props.onClick(event, this);
    }
  }

  static get componentName() {
    return "AnterosButton";
  }

  render() {
    let className = "btn";
    if (this.props.className) {
      className += " " + this.props.className;
    }
    if (this.props.oval) {
      className += " btn-oval";
    }

    if (this.props.circle) {
      className += " btn-circle";
    }

    if (this.props.success) {
      className += " btn-success";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.large) {
      className += " btn-lg";
    }

    if (this.props.small) {
      className += " btn-sm";
    }

    if (this.props.primary) {
      className += " btn-primary";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.danger) {
      className += " btn-danger";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.info) {
      className += " btn-info";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.link) {
      className += " btn-link";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.warning) {
      className += " btn-warning";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.secondary) {
      className += " btn-secondary";
      if (this.props.outline) {
        className += "-outline";
      }
    }

    if (this.props.default) {
      className += " btn-default";
    }

    if (this.props.inline) {
      className += " btn-inline";
    }

    if (this.props.pillLeft) {
      className += " btn-pill-left";
    }

    if (this.props.pillRight) {
      className += " btn-pill-right";
    }

    if (this.props.block) {
      className += " btn-block";
    }

    if (this.props.disabled) {
      className += " disabled";
    }

    let customIcon = this.props.icon;

    if (this.props.facebook) {
      className += " btn-facebook";
      customIcon = "fab fa-facebook";
    }

    if (this.props.twitter) {
      className += " btn-twitter";
      customIcon = "fab fa-twitter";
    }

    if (this.props.googlePlus) {
      className += " btn-googleplus";
      customIcon = "fab fa-google-plus";
    }

    if (this.props.linkedin) {
      className += " btn-linkedin";
      customIcon = "fab fa-linkedin";
    }

    if (this.props.instagram) {
      className += " btn-instagram";
      customIcon = "fab fa-instagram";
    }

    if (this.props.pinterest) {
      className += " btn-pinterest";
      customIcon = "fab fa-pinterest";
    }

    if (this.props.dribbble) {
      className += " btn-dribbble";
      customIcon = "fab fa-dribbble";
    }

    if (this.props.youtube) {
      className += " btn-youtube";
      customIcon = "fab fa-youtube";
    }

    if (this.props.pullRight) {
      className += " pull-right";
    }

    let style = this.props.style;

    if (this.props.backgroundColor) {
      style = { ...style, backgroundColor: this.props.backgroundColor };
    }

    if (this.props.borderColor) {
      style = { ...style, borderColor: this.props.borderColor };
    }

    if (this.props.color) {
      style = { ...style, color: this.props.color };
    }

    if (!this.props.visible) {
      style = { ...style, display: "none" };
    }

    let dataToggle, ariaHaspopup, ariaExpanded, ariaControls, href;
    if (this.props.dropdown) {
      dataToggle = "dropdown";
      ariaHaspopup = "true";
      ariaExpanded = "true";
      className += " dropdown-toggle";
    }

    if (this.props.collapseContent) {
      dataToggle = "collapse";
      ariaExpanded = "true";
      ariaControls = this.props.collapseContent;
      href = "#" + this.props.collapseContent;
      className += " collapsed";
    }

    let icon = null;
    if (customIcon) {
      icon = (
        <i
          data-user={this.props.dataUser}
          onClick={this.onClick}
          className={customIcon}
          style={{
            ...this.props.iconStyle,
            color: this.props.iconColor,
            fontSize: this.props.iconSize,
          }}
        />
      );
    }

    let image;
    if (this.props.image) {
      image = (
        <img
          data-user={this.props.dataUser}
          style={{
            width: this.props.imageWidth,
            height: this.props.imageHeight,
          }}
          onClick={this.onClick}
          src={this.props.image}
        />
      );
    }

    return (
      <button
        id={this.props.id ? this.props.id : this.idButton}
        data-placement={this.props.hintPosition}
        data-balloon-pos={this.props.hintPosition}
        aria-label={this.props.hint}
        data-user={this.props.dataUser}
        data-toggle={dataToggle}
        aria-haspopup={ariaHaspopup}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        href={href}
        onClick={this.onClick}
        style={style}
        ref={(ref) => (this.button = ref)}
        type="button"
        className={className}
      >
        {this.props.useColsAndRows ? null : <Fragment>{icon}</Fragment>}

        {image}
        {this.props.useColsAndRows ? (
          <Fragment>
            <AnterosRow horizontalCenter verticalCenter>
              {this.props.iconAsCaption ? null : (
                <AnterosCol small={1}>{icon}</AnterosCol>
              )}
              <AnterosCol small={this.props.iconAsCaption ? 12 : 10}>
                {this.props.caption && !this.props.iconAsCaption ? (
                  <span
                    style={
                      this.props.captionStyle
                        ? this.props.captionStyle
                        : { paddingLeft: "4px" }
                    }
                  >
                    {this.props.caption}
                  </span>
                ) : (
                  <Fragment>
                    {this.props.iconAsCaption ? (
                      <Fragment>{icon}</Fragment>
                    ) : null}
                  </Fragment>
                )}
                {this.props.subCaption ? (
                  <Fragment>
                    <br />
                    <span
                      style={
                        this.props.subCaptionStyle
                          ? this.props.subCaptionStyle
                          : { paddingLeft: "4px" }
                      }
                    >
                      {this.props.subCaption}
                    </span>
                  </Fragment>
                ) : null}
              </AnterosCol>
            </AnterosRow>
          </Fragment>
        ) : (
          <Fragment>
            {this.props.caption ? (
              <Fragment>
                <span
                  style={
                    this.props.captionStyle
                      ? this.props.captionStyle
                      : { paddingLeft: "4px" }
                  }
                >
                  {this.props.caption}
                </span>
                <Fragment>
                  {this.props.subCaption ? (
                    <Fragment>
                      <br />
                      <span
                        style={
                          this.props.subCaptionStyle
                            ? this.props.subCaptionStyle
                            : { paddingLeft: "4px" }
                        }
                      >
                        {this.props.subCaption}
                      </span>
                    </Fragment>
                  ) : null}
                </Fragment>
              </Fragment>
            ) : null}
          </Fragment>
        )}
        {this.props.children}
      </button>
    );
  }
}

AnterosButton.propTypes = {
  /** Permite desabilitar o uso do componente */
  disabled: PropTypes.bool,
  /** Transforma o botão no formato oval */
  oval: PropTypes.bool,
  /** Troca a cor do componente para o definido no tema em sucess */
  success: PropTypes.bool,
  /** Troca a cor do componente para o definido no tema em info */
  info: PropTypes.bool,
  /** Transforma o botão num link */
  link: PropTypes.bool,
  /** Troca a cor do componente para o definido no tema em warning */
  warning: PropTypes.bool,
  /** Muda o tamanho do botão para o maior */
  large: PropTypes.bool,
  /** Muda o tamanho do botão para o menor */
  small: PropTypes.bool,
  /** Troca a cor do componente para o definido no tema em primary */
  primary: PropTypes.bool,
  /** Troca a cor do componente para o definido no tema em danger */
  danger: PropTypes.bool,
  /** Troca a cor do componente para o definido no tema em secondary */
  secondary: PropTypes.bool,
  /** Troca a cor do componente para o definido no tema em default */
  default: PropTypes.bool,
  /** Troca o lado esquerdo do botão para o formato de pilula */
  pillLeft: PropTypes.bool,
  /** Troca o lado direito do botão para o formato de pilula */
  pillRight: PropTypes.bool,
  pullRight: PropTypes.bool,
  block: PropTypes.bool,
  /** Cor de fundo do botão */
  backgroundColor: PropTypes.string,
  /** Cor da borda do botão */
  borderColor: PropTypes.string,
  /** Cor do botão */
  color: PropTypes.string,
  /** Indica se o botão vai ser dropdown */
  dropdown: PropTypes.bool,
  /** Ícone do botão */
  icon: PropTypes.string,
  /** Cor do Ícone do botão */
  iconColor: PropTypes.string,
  /** Tamanho do ícone */
  iconSize: PropTypes.string,
  /** Estilo do ícone */
  iconStyle: PropTypes.object,
  /** Imagem a ser usada no botão */
  image: PropTypes.string,
  imageWidth: PropTypes.any,
  imageHeight: PropTypes.any,
  /** Utilizar AnterosCol e AnterosRow */
  useColsAndRows: PropTypes.bool,
  /** Título do botão */
  caption: PropTypes.string,
  /** Estilo do título do botão */
  captionStyle: PropTypes.object,
  /** subtítulo do botão */
  subCaption: PropTypes.string,
  /** Estilo do subtítulo do botão */
  subCaptionStyle: PropTypes.object,
  /** Evento onclick no botão */
  onButtonClick: PropTypes.func,
  /** Dica do botão */
  hint: PropTypes.string,
  /** Posição da dica(hint) no botão */
  hintPosition: PropTypes.oneOf(["up", "right", "left", "down"]),
  /** Transforma o botão no estilo Facebook */
  facebook: PropTypes.bool,
  /** Transforma o botão no estilo Twitter */
  twitter: PropTypes.bool,
  /** Transforma o botão no estilo Google Plus */
  googlePlus: PropTypes.bool,
  /** Transforma o botão no estiloe Linkedin */
  linkedin: PropTypes.bool,
  /** Transforma o botão no estiloe Instagram */
  instagram: PropTypes.bool,
  /** Transforma o botão no estiloe Pinterest */
  pinterest: PropTypes.bool,
  /** Transforma o botão no estiloe Dribbble */
  dribbble: PropTypes.bool,
  /** Transforma o botão no estiloe youtube */
  youtube: PropTypes.bool,
  inline: PropTypes.bool,
  dataUser: PropTypes.string,
  route: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  collapseContent: PropTypes.string,
};

AnterosButton.defaultProps = {
  disabled: false,
  oval: false,
  success: false,
  warning: false,
  info: false,
  large: false,
  small: false,
  primary: false,
  danger: false,
  secondary: false,
  pillLeft: false,
  pillRight: false,
  pullRight: false,
  block: false,
  backgroundColor: undefined,
  borderColor: undefined,
  color: undefined,
  dropdown: false,
  icon: undefined,
  iconStyle: {},
  image: undefined,
  caption: undefined,
  captionStyle: undefined,
  subCaption: undefined,
  subcCaptionStyle: undefined,
  useColsAndRows: false,
  iconAsCaption: false,
  hintPosition: "down",
  inline: true,
  visible: true,
  imageWidth: undefined,
  imageHeight: undefined,
};
