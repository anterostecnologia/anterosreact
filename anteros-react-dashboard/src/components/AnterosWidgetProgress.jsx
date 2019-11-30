import React, { Component } from 'react';
import { AnterosCard } from 'anteros-react-containers'
import { AnterosRow, AnterosCol } from 'anteros-react-layout'
import { AnterosIcon } from 'anteros-react-image'
import { AnterosText } from 'anteros-react-label'
import { AnterosProgressBar } from 'anteros-react-misc'
import PropTypes from 'prop-types'


class AnterosWidgetProgress extends Component{

    render(){
        let footer = {...this.props.footer}
        return(
            <div style={{backgroundColor: this.props.footerBackgroundColor ? this.props.footerBackgroundColor : (!this.props.fill ? this.props.color : "#FFF"),borderRadius:5}}>
                <AnterosRow>
                    <AnterosCol>
                    <AnterosCard showHeader={false} style={{backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : (this.props.fill ? this.props.color : "#FFF")}}>
                        <AnterosRow verticalAlign='center' style={{height:120}}>
                            <AnterosCol large={4}>
                                <AnterosIcon icon={this.props.icon} color={this.props.iconColor ? this.props.iconColor : (this.props.fill ? "#FFF" : this.props.color)} size={this.props.iconSize ? this.props.iconSize : 50}/>
                            </AnterosCol>
                            <AnterosCol medium={8} horizontalEnd>
                                <AnterosText text={this.props.secondaryText} h6 textAlign="end" color={this.props.secondaryTextColor ? this.props.secondaryTextColor : (this.props.fill ? "#FFF" : "#bdbdbd")}/>
                                <AnterosText text={this.props.primaryText} h2 textAlign="end" color={this.props.primaryTextColor ? this.props.primaryTextColor : (this.props.fill ? "#FFF" : this.props.color)}/>
                                <AnterosProgressBar value={this.props.progress} height={5} backgroundColor={this.props.fill ? "#FFF" : this.props.color}/>
                            </AnterosCol>
                        </AnterosRow>
                    </AnterosCard>
                    </AnterosCol>
                </AnterosRow>
                <AnterosRow style={{height:this.props.footer ? 50 : 0,marginLeft:1,marginRight:1,paddingLeft:10}} verticalCenter>
                    <AnterosCol small={8}>
                        <AnterosText text={footer.text} h6 textAlign="start" color={this.props.footerTextColor ? this.props.footerTextColor : (!this.props.fill ? "#FFF" : this.props.color)}/>
                    </AnterosCol>
                    <AnterosCol small={{size:2,push:2}} horizontalEnd>
                        <AnterosIcon icon={footer.icon} color={this.props.footerIconColor ? this.props.footerIconColor : (!this.props.fill ? "#FFF" : this.props.color)} size={20}/>
                    </AnterosCol>
                </AnterosRow>
            </div>
        )
    }
}

AnterosWidgetProgress.propTypes = {
    /** Cor do tema do widget */
    color: PropTypes.string,
    /** Cor do fundo do card */
    backgroundColor: PropTypes.string,
    /** Cor do fundo do rodapé */
    footerBackgroundColor: PropTypes.string,
    /** Cor do texto do rodapé */
    footerTextColor: PropTypes.string,
    /** Cor do ícone do rodapé */
    footerIconColor: PropTypes.string,
    /** Cor do ícone superior */
    iconColor: PropTypes.string,
    /** Ícone do widget */
    icon: PropTypes.string,
    /** Tamanho do ícone superior*/
    iconSize: PropTypes.number,
    /** Texto maior */
    primaryText: PropTypes.string,
    /** Texto menor */
    secondaryText: PropTypes.string,
    /** Cor do texto maior */
    primaryTextColor: PropTypes.string,
    /** Cor do texto menor */
    secondaryTextColor: PropTypes.string,
    /** Determina se o widget será preenchido pela cor passada por parâmetro */
    fill: PropTypes.bool,
    /** Recebe um objeto que contem o texto e o icone do rodapé */
    footer: PropTypes.object,
    /** Porcentagem do progresso variando de 0 a 100 */
    progress: PropTypes.number
}

AnterosWidgetProgress.defaultProps = {
    fill: false,
    progress:0
}

export default AnterosWidgetProgress