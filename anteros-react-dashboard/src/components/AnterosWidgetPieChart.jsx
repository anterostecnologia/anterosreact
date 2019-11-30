import React, { Component } from 'react';
import { AnterosCard } from 'anteros-react-containers'
import { AnterosRow, AnterosCol } from 'anteros-react-layout'
import { AnterosText } from 'anteros-react-label'
import PropTypes from 'prop-types'
import { AnterosChart} from 'anteros-react-charts'



class AnterosWidgetPieChart extends Component{

    getData(){
        return(
            {
                labels: [],
                datasets: [
                  {
                    label: '',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    data: []
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
        let currentData = this.getData();
        currentData.datasets[0].data = [];
        currentData.labels = [];
        currentData.datasets[0].backgroundColor = []
        if(this.props.data){
            this.props.data.map(d => {
                currentData.datasets[0].data.push(d.value)
                currentData.labels.push(d.label)
                currentData.datasets[0].backgroundColor.push(d.color)
            })
        }
      
        return(
          <div style={{backgroundColor:this.props.footerBackgroundColor,borderRadius:5}}>
            <AnterosRow>
                <AnterosCol>
                    <AnterosCard showHeader={false} style={{backgroundColor: this.props.backgroundColor ? this.props.backgroundColor: "#FFF"}}>
                        <AnterosRow style={{height:40}}>
                            <AnterosCol>
                                <AnterosText text={this.props.secondaryText} h6 textAlign="start" color={this.props.secondaryTextColor ? this.props.secondaryTextColor : "#bdbdbd"}/>
                                <AnterosText text={this.props.primaryText} h3 textAlign="start" color={this.props.primaryTextColor ? this.props.primaryTextColor : this.props.color }/>
                            </AnterosCol>
                        </AnterosRow>
                        <AnterosRow style={{height:300}}>
                            <AnterosCol style={{paddingTop:30}}>
                                <AnterosChart.Pie
                                    height={150}
                                    data={currentData}
                                    legend={{position:'bottom',reverse:'false'}}
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


AnterosWidgetPieChart.propTypes = {
    /** Recebe um array de numeros que corresponde aos dados do gráfico */
    data:PropTypes.arrayOf([PropTypes.number]),
    /** Cor do tema do widget */
    color: PropTypes.string,
    /** Cor da borda dos retângulos do gráfico */
    borderColor: PropTypes.string,
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

AnterosWidgetPieChart.defaultProps = {
    
}

export default AnterosWidgetPieChart