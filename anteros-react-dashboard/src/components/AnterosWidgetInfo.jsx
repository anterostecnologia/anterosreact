import React, { Component } from 'react';
import { AnterosCard } from '@anterostecnologia/anteros-react-containers'
import { AnterosRow, AnterosCol } from '@anterostecnologia/anteros-react-layout'
import { AnterosIcon } from '@anterostecnologia/anteros-react-image'
import { AnterosText } from '@anterostecnologia/anteros-react-label'
import PropTypes from 'prop-types'
import { AnterosUtils } from '@anterostecnologia/anteros-react-core';
import moment from 'moment';
import { AnterosLoader } from '@anterostecnologia/anteros-react-loaders';

class AnterosWidgetInfo extends Component {

    convertValue = (value, isMoney, isNumber) => {
        let result;
        if (isMoney) {
            if (value) {
                result = AnterosUtils.formatNumber(AnterosUtils.parseNumber(value), 'R$ ###.###.###,##')
                let aux = result.split(',')
                if (aux[1]) {
                    if (aux[1].length === 0) {
                        result = aux[0] + ',00'
                    } else if (aux[1].length === 1) {
                        result = aux[0] + ',' + aux[1] + '0'
                    }
                } else {
                    result = aux[0] + ',00'
                }

            } else {
                result = 'R$ 0,00'
            }
        } else if (isNumber) {
            if (value) {
                result = AnterosUtils.formatNumber(parseInt(AnterosUtils.parseNumber(value)), '##.###.###.##00')
            } else {
                result = '0'
            }
        } else {
            result = value
        }
        return result
    }

    getDate = () => {
        const { dtInicial, dtFinal } = this.props;
        let result = false;
        if (dtInicial) {
            if (dtInicial && dtFinal) {
                result = moment(dtInicial).format('DD [de] MMM. [de] YYYY') + ' - ' + moment(dtFinal).format('DD [de] MMM. [de] YYYY')
            } else {
                result = moment(dtInicial).format('DD [de] MMM. [de] YYYY') + ' até Hoje.'
            }
        }

        return result
    }

    render() {
        let footer = { ...this.props.footer }
        let date = this.props.txtDate;
        let value;
        if (this.props.data) {
            this.props.data.map(d => {
                value += d
                return d
            })
        } else {
            value = this.props.value
        }
        return (
            <div style={{ backgroundColor: this.props.footerBackgroundColor ? this.props.footerBackgroundColor : (!this.props.fill ? this.props.color : "#FFF"), borderRadius: 5, ...this.props.style }}>
                {this.props.loading ? <div style={{ width: '50%', height: 160, marginTop: 80, marginLeft: 200 }}><AnterosLoader active type="ball-spin-fade-loader" color="#0a2757" style={{ display: 'center' }} /></div> : <AnterosRow>
                    <AnterosCol>
                        <AnterosCard id={this.props.id ? this.props.id : ''} showHeader={false} style={{ backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : (this.props.fill ? this.props.color : "#FFF") }}>
                            <AnterosRow verticalAlign='center' style={{ height: this.props.footer ? 80 : 120 }}>
                                {date ? <AnterosText text={date ? date : ''} textAlign="end" style={{ padding: 6, backgroundColor: 'white', borderRadius: 20, color: this.props.color, fontSize: 12, position: 'absolute', top: 8, right: 8, fontWeight: 'bold' }} /> : null}
                                <AnterosCol large={3}>
                                    <AnterosIcon icon={this.props.icon} color={this.props.iconColor ? this.props.iconColor : (this.props.fill ? "#FFF" : this.props.color)} size={this.props.iconSize ? this.props.iconSize : 50} />
                                </AnterosCol>
                                <AnterosCol medium={9} style={{ marginTop: date ? 25 : 0 }}>
                                    <AnterosText text={this.props.secondaryText} h6 textAlign="end" color={this.props.secondaryTextColor ? this.props.secondaryTextColor : (this.props.fill ? "#FFF" : "#bdbdbd")} />
                                    <AnterosText text={this.convertValue(value, this.props.money, this.props.number)} h2 textAlign="end" color={this.props.primaryTextColor ? this.props.primaryTextColor : (this.props.fill ? "#FFF" : this.props.color)} />
                                </AnterosCol>
                            </AnterosRow>
                        </AnterosCard>
                    </AnterosCol>
                </AnterosRow>}
                <AnterosRow style={{ height: this.props.footer ? 40 : 0, marginLeft: 1, marginRight: 1, paddingLeft: 10 }} verticalTop>
                    <AnterosCol small={8}>
                        <AnterosText text={footer.text} h6 textAlign="start" color={this.props.footerTextColor ? this.props.footerTextColor : (!this.props.fill ? "#FFF" : this.props.color)} />
                    </AnterosCol>
                    <AnterosCol small={{ size: 2, push: 2 }} horizontalEnd>
                        <AnterosIcon icon={footer.icon} color={this.props.footerIconColor ? this.props.footerIconColor : (!this.props.fill ? "#FFF" : this.props.color)} size={20} />
                    </AnterosCol>
                </AnterosRow>
            </div>
        )
    }
}

AnterosWidgetInfo.propTypes = {
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
    footer: PropTypes.object
}

AnterosWidgetInfo.defaultProps = {

}

export default AnterosWidgetInfo