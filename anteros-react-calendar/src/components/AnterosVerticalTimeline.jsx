import { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import VisibilitySensor from 'react-visibility-sensor';

/** Componente AnterosVerticalTimeline */

class AnterosVerticalTimeline extends PureComponent {
  render(){
    let {animate, children, className, layout, style} = this.props;
    let clns = classNames(className, 'vertical-timeline', {
      'vertical-timeline--animate': animate,
      'vertical-timeline--two-columns': layout === '2-columns',
      'vertical-timeline--one-column': layout === '1-column',
    });
    return (<div style={style} className={clns}>
      {children}
    </div>);
  }

}


AnterosVerticalTimeline.propTypes = {
  /** Esta propriedade requer um conjunto de elementos do componente 'AnterosVerticalTimelineElement' */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  /** Esta propriedade indica se a lista de elementos será animada, o padrao é true */
  animate: PropTypes.bool,
  /** Esta propriedade indica se a timeline será dividida em duas colunas ou uma coluna, o padrão é 2 colunas */
  layout: PropTypes.oneOf(['1-column', '2-columns']),
  /** Identificador do item */
  id: PropTypes.string,
  /**  Propriedade que contém os elementos que preenchem o container do item */
   children: PropTypes.oneOfType([
     PropTypes.arrayOf(PropTypes.node),
     PropTypes.node,
   ]),
  className: PropTypes.string,
  /** Altera as propriedades da 'seta' do componente 'AnterosVerticalTimelineElement'*/
  contentArrowStyle: PropTypes.shape({}),
  /**  Altera as propriedades de estilo do container do componente 'AnterosVerticalTimelineElement' */
  contentStyle: PropTypes.shape({}),
  /**  Recebe um elemento com um icone que fica dentro do círculo **/
  icon: PropTypes.element,
  /**  Altera as propriedades de estilo do icone no centro do círculo */
  iconStyle: PropTypes.shape({}),
  /**  Recebe uma função que será acionada ao clicar no circulo */
  iconOnClick: PropTypes.func,
  /**  Altera as propriedaes de estilo do container do componente 'AnterosVerticalTimelineElement'*/
  style: PropTypes.shape({}),
  /*   **/
  date: PropTypes.node,
  /**  Esta propriedade altera a posição (left ou right) do item do componente 'AnterosVerticalTimelineElement', se não for indicado os itens irão alternar automaticamente*/
  position: PropTypes.string,
  //visibilitySensorProps: PropTypes.shape({}),
};

AnterosVerticalTimeline.defaultProps = {
  animate: true,
  className: '',
  layout: '2-columns',
};


/* Classe AnterosVerticalTimeLineElement **/

class AnterosVerticalTimelineElement extends Component {
  constructor(props) {
    super(props);
    this.onVisibilitySensorChange = this.onVisibilitySensorChange.bind(this);
    this.state = { visible: false };
  }

  onVisibilitySensorChange(isVisible) {
    if (isVisible) {
      this.setState({ visible: true });
    }
  }

  render() {
    const {
      id,
      contentArrowStyle,
      contentStyle,
      icon,
      iconStyle,
      iconOnClick,
      date,
      position,
      style,
      className,
      visibilitySensorProps,
      children
    } = this.props;

    const { visible } = this.state;

    return (
      <div
        id={id}
        onClick={this.props.onClick}
        className={classNames(className, 'vertical-timeline-element', {
          'vertical-timeline-element--left': position === 'left',
          'vertical-timeline-element--right': position === 'right',
          'vertical-timeline-element--no-children': children === '',
        })}
        style={style}
      >
        <VisibilitySensor
          {...visibilitySensorProps}
          onChange={this.onVisibilitySensorChange}
        >
          <div style={this.props.selected?{borderRight:"8px solid yellow"}:{}}>
            <span // eslint-disable-line jsx-a11y/no-static-element-interactions
              style={iconStyle}
              onClick={iconOnClick}
              className={`vertical-timeline-element-icon ${
                visible ? 'bounce-in' : 'is-hidden'
              }`}
            >
              {icon}
            </span>
            <div
              style={contentStyle}
              className={`vertical-timeline-element-content ${
                visible ? 'bounce-in' : 'is-hidden'
              }`}
            >
              <div
                style={contentArrowStyle}
                className="vertical-timeline-element-content-arrow"
              />
              {children}
            </div>
          </div>
        </VisibilitySensor>
      </div>
    );
  }
}

AnterosVerticalTimelineElement.propTypes = {
  /** identificador do item */
  id: PropTypes.string,
  /**  propriedade que contém os elementos que preenchem o container do item **/
   children: PropTypes.oneOfType([
     PropTypes.arrayOf(PropTypes.node),
     PropTypes.node,
   ]),
  className: PropTypes.string,
  /** atribui um evento quando clicar no card */
  onClick: PropTypes.func,
  /** altera as propriedades da 'seta' **/
  contentArrowStyle: PropTypes.shape({}),
  /**  altera as propriedades de estilo do conteudo do item **/
  contentStyle: PropTypes.shape({}),
  /**  recebe um elemento com um icone que fica dentro do círculo **/
  icon: PropTypes.element,
  /**  altera as propriedades de estilo do icone no centro do círculo **/
  iconStyle: PropTypes.shape({}),
  /**  recebe uma função que será acionada ao clicar no circulo **/
  iconOnClick: PropTypes.func,
  /**  altera as propriedaes de estilo do container **/
  style: PropTypes.shape({}),
  /*   **/
  date: PropTypes.node,
  /**  esta propriedade altera a posição (left ou right) do item, se não for indicado os itens irão alternar automaticamente**/
  position: PropTypes.string,
  visibilitySensorProps: PropTypes.shape({}),
  
};

AnterosVerticalTimelineElement.defaultProps = {
  id: '',
  children: '',
  className: '',
  contentArrowStyle: null,
  contentStyle: null,
  icon: null,
  iconStyle: null,
  style: null,
  date: '',
  position: '',
  iconOnClick: null,
  visibilitySensorProps: { partialVisibility: true, offset: { bottom: 40 } },
  
};

export { AnterosVerticalTimeline,AnterosVerticalTimelineElement }


//https://github.com/stephane-monnot/react-vertical-timeline