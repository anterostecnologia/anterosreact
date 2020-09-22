import React, { Component } from 'react';
import { AnterosCard } from '@anterostecnologia/anteros-react-containers'
import { AnterosRow, AnterosCol } from '@anterostecnologia/anteros-react-layout'
import { AnterosText } from '@anterostecnologia/anteros-react-label'
import PropTypes from 'prop-types'
import { Line} from '@anterostecnologia/anteros-react-charts'



  const optionsLine = {
    responsive: true,
    tooltips: {
      mode: 'label'
    },
    elements: {
      line: {
        fill: true
      }
    },
    scales: {
        yAxes: [{
            display: true,
            gridLines: {
            display: false
          },
          ticks:{
            display: false
            }
        },
        ],
        xAxes: [{
            display:false,
            gridLines: {
                display: false
            },
        }]
    }
  };

class AnterosWidgetLineChart extends Component{

    getData(){
      return(
        {
          labels: [],
          datasets: [
            {
              label: '',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,1)',
              borderWidth: 2,
              data: [],
              pointBorderColor:'rgba(255,255,255,1)',
              pointBackgroundColor:'rgba(255,255,255,0.2)'
            }
          ]
        }
      )
    }

    generateFooterData(footerObject){

      let length = footerObject.length
      const countCol = 12/length
        
      let cols = footerObject.map(obj => {
          let primaryText = obj.primaryText
          let secondaryText = obj.secondaryText
          return(
              <AnterosCol medium={countCol}>
                  <AnterosText text={secondaryText} h6 textAlign="center" color={this.props.footerSecondaryTextColor ? this.props.footerSecondaryTextColor : (!this.props.fill ? "#FFF" : this.props.color)}/>
                  <AnterosText text={primaryText} h3 textAlign="center" color={this.props.footerPrimaryTextColor ? this.props.footerPrimaryTextColor : (!this.props.fill ? "#FFF" : "#bdbdbd")} style={{fontWeight:'bold'}}/>
              </AnterosCol>)
      })
        
      return cols

    }

    render(){
        let currentData = this.getData()
        currentData.datasets[0].data = []
        if(this.props.data){
            this.props.data.map(d => {
                currentData.datasets[0].data.push(d)
                currentData.labels.push('')
            })
        }

        if(!this.props.fill){
          currentData.datasets[0].backgroundColor = this.props.chartColor ? this.props.chartColor : this.props.color
          currentData.datasets[0].borderColor = this.props.borderColor ? this.props.borderColor : this.props.color
          currentData.datasets[0].pointBorderColor = this.props.borderColor ? this.props.borderColor : this.props.color
          currentData.datasets[0].pointBackgroundColor = 'rgba(255,255,255,0.2)'
        }else{
          currentData.datasets[0].backgroundColor = 'rgba(255,255,255,0.2)'
          currentData.datasets[0].borderColor = 'rgba(255,255,255,1)'
          
        }
      
        return(
          <div style={{backgroundColor: this.props.footerBackgroundColor ? this.props.footerBackgroundColor : (!this.props.fill ? this.props.color : "#FFF"),borderRadius:5}}>
            <AnterosRow>
              <AnterosCol>
                  <AnterosCard showHeader={false} style={{backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : (this.props.fill ? this.props.color : "#FFF")}}>
                      <AnterosRow style={{height:40}}>
                          <AnterosCol>
                          <AnterosText text={this.props.secondaryText} h6 textAlign="start" color={this.props.secondaryTextColor ? this.props.secondaryTextColor : (this.props.fill ? "#FFF" : "#bdbdbd")}/>
                                <AnterosText text={this.props.primaryText} h3 textAlign="start" color={this.props.primaryTextColor ? this.props.primaryTextColor : (this.props.fill ? "#FFF" : this.props.color) }/>
                          </AnterosCol>
                      </AnterosRow>
                      <AnterosRow style={{height: this.props.medium ? 450 : 80}}>
                          <AnterosCol style={{paddingTop:20}}>
                              <Line
                                  height={this.props.medium ? 160 : 65}
                                  data={currentData}
                                  legend={{display:false}}
                                  options={optionsLine}
                                  />
                          </AnterosCol>
                      </AnterosRow>
                  </AnterosCard>
              </AnterosCol>
            </AnterosRow>
            <AnterosRow style={{height:this.props.footer ? 80 : 0,marginLeft:1,marginRight:1}} verticalCenter>
                  {this.props.footer ? this.generateFooterData([...this.props.footer]) : null}
            </AnterosRow>
          </div>
        )
    }
}

AnterosWidgetLineChart.propTypes = {
    /** Recebe um array de numeros que corresponde aos dados do gráfico */
    data:PropTypes.arrayOf([PropTypes.number]),
    /** Cor do tema do widget */
    color: PropTypes.string,
    /** Cor do fundo do card */
    backgroundColor: PropTypes.string,
    /** Cor do fundo do rodapé */
    footerBackgroundColor: PropTypes.string,
    /** Cor da linha em torno do gráfico*/
    borderColor: PropTypes.string,
    /** Cor do gráfico */
    chartColor: PropTypes.string,
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

AnterosWidgetLineChart.defaultProps = {
    
}

export default AnterosWidgetLineChart