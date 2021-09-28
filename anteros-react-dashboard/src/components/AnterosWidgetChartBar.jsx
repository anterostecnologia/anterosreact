import { AnterosChart } from '@anterostecnologia/anteros-react-charts';
import { AnterosCard } from '@anterostecnologia/anteros-react-containers';
import { AnterosUtils } from '@anterostecnologia/anteros-react-core';
import { AnterosText } from '@anterostecnologia/anteros-react-label';
import { AnterosCol, AnterosRow } from '@anterostecnologia/anteros-react-layout';
import { AnterosLoader } from '@anterostecnologia/anteros-react-loaders';
import PropTypes from 'prop-types';
import React, { Component } from 'react';


class AnterosWidgetChartBar extends Component {

  getData() {
    return (
      {
        labels: [],
        datasets: [
          {
            label: '',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderColor: 'rgba(255,255,255,1)',
            borderWidth: 1,
            data: []
          }
        ]
      }
    )
  }

  getOptions = () => {
    const options = {
      responsive: true,
      tooltips: {
        mode: 'label',
        callbacks:{
          label:(tooltipItem, data) => {  
            let value = this.convertValue(tooltipItem.value,this.props.money,this.props.number)
            return value;
        }
      }
      },
      elements: {
        line: {
          fill: false
        }
      },
      scales: {
        yAxes: [{
          display: true,
          gridLines: {
            display: false
          },
          ticks: {
            display: false,
            min: 0
          }
        },
        ],
        xAxes: [{
          display: false,
          gridLines: {
            display: false
          },
        }]
      }
    };

    return options
  }

  convertValue = (value,isMoney,isNumber) => {
    let result;
    if(isMoney){
        if(value){
            let s = AnterosUtils.formatNumber(AnterosUtils.parseNumber(value),'R$ ###.###.###,##')
            let t = s.split(',')
            console.log('t[1]',t[1])
                if(t[1]){
                if(t[1].length === 0){
                    result = t[0] + ',00'
                }else if(t[1].length === 1){
                    result = t[0] + ',' + t[1] + '0'
                }else{
                    result = t[0] + ',' + t[1]
                }
            }else{
                result = t[0] + ',00'
            }
            
        }else{
            result = 'R$ 0,00'
        }
    }else if(isNumber){
        if(value){
            let r = AnterosUtils.formatNumber(parseInt(AnterosUtils.parseNumber(value)),'##.###.###.##0,00')
            result = r.split(',')[0]
        }else{
            result = '0'
        }
    }else{
        result = value
    }
    return result
}

  generateFooterData(footerObject) {

    let length = footerObject.length
    const countCol = 12 / length

    let cols = footerObject.map(obj => {
      let primaryText = obj.primaryText
      let secondaryText = obj.secondaryText
      return (
        <AnterosCol medium={countCol}>
          <AnterosText text={secondaryText} h6 textAlign="center" color={this.props.footerSecondaryTextColor ? this.props.footerSecondaryTextColor : (!this.props.fill ? "#FFF" : this.props.color)} />
          <AnterosText text={primaryText} h3 textAlign="center" color={this.props.footerPrimaryTextColor ? this.props.footerPrimaryTextColor : (!this.props.fill ? "#FFF" : "#bdbdbd")} style={{ fontWeight: 'bold' }} />
        </AnterosCol>)
    })
    return cols;
  }

  render() {
    let currentData = this.getData();
    currentData.datasets[0].data = [];
    let opts = this.getOptions()
    currentData.labels = [];
    if (this.props.data) {
      this.props.data.map((d,index) => {
        currentData.datasets[0].data.push(d)
        if (this.props.labels) {
          if(this.props.labels.length>0){
            currentData.labels.push(this.props.labels[index]);
          }else{
            currentData.labels.push(' ');
          }
          
        } else {
          currentData.labels.push(' ');
        }
        return d;
      })
    }
    if (!this.props.fill) {
      currentData.datasets[0].backgroundColor = this.props.barColor ? this.props.barColor : this.props.color
      currentData.datasets[0].borderColor = this.props.borderColor ? this.props.borderColor : this.props.color
    } else {
      currentData.datasets[0].backgroundColor = this.props.barColor ? this.props.barColor : 'rgba(255,255,255,0.2)'
      currentData.datasets[0].borderColor = this.props.borderColor ? this.props.borderColor : 'rgba(255,255,255,1)'
    }

    let date = this.props.txtDate;

    return (
      <div style={{ backgroundColor: this.props.footerBackgroundColor ? this.props.footerBackgroundColor : (!this.props.fill ? this.props.color : "#FFF"), borderRadius: 5 }}>
        {this.props.loading ? <div style={{width:'50%',height:160,marginTop:this.props.medium ? 170 :80,marginLeft:this.props.medium ? 420 : 200}}><AnterosLoader active type="ball-spin-fade-loader" color="#0a2757" style={{ display: 'center' }}/></div> : <AnterosRow>
          <AnterosCol>
            <AnterosCard showHeader={false} style={{ backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : (this.props.fill ? this.props.color : "#FFF") }}>
              <AnterosRow style={{ height: 40 }}>
              {date ? <AnterosText text={date ? date : ''} textAlign="end" style={{padding:6,backgroundColor:'white',borderRadius:20,color:this.props.color,fontSize:12,position:'absolute',top:8,right:8,fontWeight:'bold'}}/> : null}
                <AnterosCol>
                  <AnterosText text={this.props.secondaryText} h6 textAlign="start" color={this.props.secondaryTextColor ? this.props.secondaryTextColor : (this.props.fill ? "#FFF" : "#bdbdbd")} />
                  <AnterosText text={this.convertValue(this.props.value,this.props.money,this.props.number)} h3 textAlign="start" color={this.props.primaryTextColor ? this.props.primaryTextColor : (this.props.fill ? "#FFF" : this.props.color)} />
                </AnterosCol>
              </AnterosRow>
              <AnterosRow style={{ height: this.props.medium ? 300 : 80 }}>
                <AnterosCol style={{ paddingTop: 20 }}>
                  <AnterosChart.Bar
                    height={this.props.medium ? 113 : 68}
                    data={currentData}
                    legend={{ display: false }}
                    options={opts}
                  />
                </AnterosCol>
              </AnterosRow>
            </AnterosCard>
          </AnterosCol>
        </AnterosRow>}
        <AnterosRow style={{ height: this.props.footer ? 80 : 0, marginLeft: 1, marginRight: 1 }} verticalCenter>
          {this.props.footer ? this.generateFooterData([...this.props.footer]) : null}
        </AnterosRow>
      </div>
    )
  }
}


AnterosWidgetChartBar.propTypes = {
  /** Recebe um array de numeros que corresponde aos dados do gráfico */
  data: PropTypes.arrayOf([PropTypes.number]),
  /** Cor do tema do widget */
  color: PropTypes.string,
  /** Cor do fundo do card */
  backgroundColor: PropTypes.string,
  /** Cor do fundo do rodapé */
  footerBackgroundColor: PropTypes.string,
  /** Cor da borda das barras do gráfico */
  borderColor: PropTypes.string,
  /** Cor das barras do gráfico */
  barColor: PropTypes.string,
  /** Texto maior */
  primaryText: PropTypes.string,
  /** Texto menor */
  secondaryText: PropTypes.string,
  /** Cor do texto maior */
  primaryTextColor: PropTypes.string,
  /** Cor do texto menor */
  secondaryTextColor: PropTypes.string,
  /** Cor do texto maior do rodapé */
  footerPrimaryTextColor: PropTypes.string,
  /** Cor do texto menor do rodapé */
  footerSecondaryTextColor: PropTypes.string,
  /** Recebe um array de objetos que contem os dois textos do rodapé */
  footer: PropTypes.arrayOf([PropTypes.object])
}

AnterosWidgetChartBar.defaultProps = {

}

export default AnterosWidgetChartBar