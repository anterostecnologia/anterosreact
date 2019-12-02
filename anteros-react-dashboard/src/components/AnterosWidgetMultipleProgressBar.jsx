import React, {Component} from 'react'
import { AnterosText } from 'anteros-react-label'
import { AnterosRow, AnterosCol } from 'anteros-react-layout'
import { AnterosCard } from 'anteros-react-containers'
import PropTypes from 'prop-types'


class AnterosWidgetMultipleProgressBar extends Component{

    renderProgressBar(data){
        
        let total = 0
        data.map(item => {
            total = total + item.value
        })

        let progressBar = data.map((item,index) => {
            if(index === 0){
                let value = parseInt(item.value * 100/total)
                return <AnterosText style={{height:15,width:`${value}%`,backgroundColor:item.color,borderTopLeftRadius:5,borderBottomLeftRadius:5,fontSize:10,color:"#FFF"}} text={`${value}%`} textAlign="center"/>
            }else if (index < data.length - 1){
                let value = parseInt(item.value * 100/total)
                return <AnterosText style={{height:15,width:`${value}%`,backgroundColor:item.color,fontSize:10,color:"#FFF"}} text={`${value}%`} textAlign="center"/>
            }else{
                let value = parseInt(item.value * 100/total)
                return <AnterosText style={{height:15,width:`${value}%`,backgroundColor:item.color,borderTopRightRadius:5,borderBottomRightRadius:5,fontSize:10,color:"#FFF"}} text={`${value}%`} textAlign="center"/>
            }
        })

        return progressBar
    }

    renderLegend(data){

        let legend = data.map(item => {
            if(this.props.bigPercent){
                let total = 0
                data.map(item => {
                    total = total + item.value
                })
                let value = parseInt(item.value * 100/total)

                return(
                    <AnterosCol small={3} style={{height:40}}>
                        <AnterosRow verticalCenter>
                            <div style={{height:10,width:10,backgroundColor:item.color,borderRadius:5}}/>
                            <AnterosCol>
                                <AnterosRow>
                                    <AnterosText style={{fontSize:34,color:"#666",marginLeft:5,fontWeight:'bold'}} text={`${value}%`} textAlign="center"/>
                                </AnterosRow>
                                <AnterosRow>
                                    <AnterosText style={{fontSize:12,color:"#666",marginLeft:5}} text={item.label} textAlign="center"/>
                                </AnterosRow>
                            </AnterosCol>
                        </AnterosRow>
                    </AnterosCol>
                )
            }else{
                return(
                    <AnterosCol small={6} style={{height:30}}>
                        <AnterosRow verticalCenter>
                            <div style={{height:10,width:10,backgroundColor:item.color,borderRadius:5}}/>
                            <AnterosText style={{fontSize:14,color:"#666",marginLeft:10}} text={item.label} textAlign="center"/>
                        </AnterosRow>
                    </AnterosCol>
                )
            }
        })

        return legend
    }

render(){
    return(
        <AnterosCard showHeader={false} style={{backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : (this.props.fill ? this.props.color : "#FFF")}}>
            <AnterosRow style={{height:40}}>
                <AnterosCol>
                    <AnterosText text={this.props.secondaryText} h6 textAlign="start" color={this.props.secondaryTextColor ? this.props.secondaryTextColor : "#bdbdbd"}/>
                    <AnterosText text={this.props.primaryText} h3 textAlign="start" color={this.props.primaryTextColor ? this.props.primaryTextColor : "#333"}/>
                </AnterosCol>
            </AnterosRow>
            <AnterosRow style={{marginBottom:this.props.bigPercent ? 40 : 20,marginLeft:10,marginTop:30}}>
                {this.props.data ? this.renderLegend(this.props.data) : null}
            </AnterosRow>
            <AnterosRow style={{margin: 10}}>
                {this.props.data ? this.renderProgressBar(this.props.data) : null}
            </AnterosRow>
        </AnterosCard>  
    )
}

}

AnterosWidgetMultipleProgressBar.propTypes = {
    /** Recebe um array de objetos que corresponde aos dados do gráfico */
    data:PropTypes.arrayOf([PropTypes.object]),
    /** Cor do fundo do card */
    backgroundColor: PropTypes.string,
    /** Texto maior */
    primaryText: PropTypes.string,
    /** Texto menor */
    secondaryText: PropTypes.string,
    /** Cor do texto maior */
    primaryTextColor: PropTypes.string,
    /** Cor do texto menor */
    secondaryTextColor: PropTypes.string,
    /** Altera a exibição das porcentagens dos itens */
    bigPercent: PropTypes.bool
    
}

AnterosWidgetMultipleProgressBar.defaultProps = {
    
}


export default AnterosWidgetMultipleProgressBar