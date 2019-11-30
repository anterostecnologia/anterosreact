import React, { Component } from 'react';
import { AnterosRow, AnterosCol } from 'anteros-react-layout'
import AnterosWidgetInfo from './AnterosWidgetInfo'
import AnterosWidgetProgress from './AnterosWidgetProgress'
import AnterosWidgetChartBar from './AnterosWidgetChartBar'
import AnterosWidgetLineChart from './AnterosWidgetLineChart'
import AnterosWidgetPieChart from './AnterosWidgetPieChart'
import AnterosWidgetDoughnutChart from './AnterosWidgetDoughnutChart'
import AnterosWidgetMultipleProgressBar from './AnterosWidgetMultipleProgressBar'

class Example extends Component {

  
  render = () => {

    return (
      <div style={{backgroundColor:'#f7f7f7'}}>
      <AnterosRow style={{margin:30,padding:20}}>
          <AnterosCol medium={3}>
              <AnterosWidgetInfo icon="fa fa-comments" primaryText="1294" secondaryText="Comments" color="#ce93d8" fill/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetInfo icon="fa fa-comments" primaryText="1294" secondaryText="Comments" color="#ce93d8"/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetProgress icon="fa fa-thumbs-up" primaryText="110.190" secondaryText="Likes" color="#e57373" fill progress={88}/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetProgress icon="fa fa-thumbs-up" primaryText="110.190" secondaryText="Likes" color="#f48fb1" progress={88}/>
          </AnterosCol>
      </AnterosRow>
      <AnterosRow style={{margin:30,padding:20}}>
          <AnterosCol medium={3}>
              <AnterosWidgetChartBar primaryText="R$1.000.000,00" secondaryText="Vendas" color="#2196f3" data={[8,6,3,4,5,6,7,6,9,10,12,8,6,3]}/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetChartBar primaryText="R$1.000.000,00" secondaryText="Vendas" color="#2196f3" fill data={[3,6,7,4,5,5,9]}/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetLineChart primaryText="1996" secondaryText="Pedidos" color="#80cbc4" borderColor="#4db6ac" data={[8,6,3,4,5,6,7,6,9,10,12,8,6,3]}/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetLineChart primaryText="1996" secondaryText="Pedidos" color="#80cbc4" borderColor="#4db6ac" fill data={[3,5,4,8,7,9,3,5,9,8]}/>
          </AnterosCol>
      </AnterosRow>
      <AnterosRow style={{margin:30,padding:20}}>
          <AnterosCol medium={6}>
              <AnterosWidgetChartBar primaryText="R$1.000.000,00" secondaryText="Vendas" color="#2196f3" data={[8,6,3,4,5,6,7,6,9,10,12,8,6,3,8,6,3,4,5,6,7,6,9,10,12,8,6,3]} medium/>
          </AnterosCol>
          <AnterosCol medium={6}>
              <AnterosWidgetLineChart primaryText="1996" secondaryText="Pedidos" color="#80cbc4" borderColor="#4db6ac" data={[8,6,3,4,5,6,7,6,9,10,12,8,6,3]} medium/>
          </AnterosCol>
      </AnterosRow>
      <AnterosRow style={{margin:30,padding:20}}>
        <AnterosCol medium={3}>
              <AnterosWidgetChartBar primaryText="R$1.000.000,00" secondaryText="Vendas" color="#ce93d8" data={[3,6,7,4,5,5,9]}
                    footer={[{primaryText:"187",secondaryText:"Realizado"},
                    {primaryText:"80",secondaryText:"Concluido"},
                    {primaryText:"9",secondaryText:"Recusado"},
                    {primaryText:"34",secondaryText:"Recusado"}]}/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetChartBar primaryText="R$1.000.000,00" secondaryText="Vendas" color="#ce93d8" fill data={[3,6,7,4,5,5,9]}
              footer={[{primaryText:"187",secondaryText:"Realizado"},
              {primaryText:"80",secondaryText:"Concluido"},
              {primaryText:"9",secondaryText:"Recusado"},
              {primaryText:"34",secondaryText:"Recusado"}]}/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetLineChart primaryText="R$1.000.000,00" secondaryText="Vendas" color="#e57373" chartColor="#e5737340" data={[3,6,7,4,5,5,9]}
              footer={[{primaryText:"187",secondaryText:"Realizado"},
              {primaryText:"80",secondaryText:"Concluido"},
              {primaryText:"9",secondaryText:"Recusado"},
              ]}/>
          </AnterosCol>
          <AnterosCol medium={3}>
              <AnterosWidgetLineChart primaryText="R$1.000.000,00" secondaryText="Vendas" color="#e57373" chartColor="#e5737340" fill data={[3,6,7,4,5,5,9]}
              footer={[{primaryText:"187",secondaryText:"Realizado"},
              {primaryText:"80",secondaryText:"Concluido"},
              {primaryText:"9",secondaryText:"Recusado"},
              ]}/>
          </AnterosCol>
      </AnterosRow>
      <AnterosRow style={{margin:30,padding:20}}>
        <AnterosCol medium={3}>
            <AnterosWidgetInfo icon="fa fa-comments" primaryText="1294" secondaryText="Comments" color="#78909c" footer={{text:"Change +5%",icon:"fa fa-share"}}/>
          </AnterosCol>
          <AnterosCol medium={3}>
            <AnterosWidgetInfo icon="fa fa-comments" primaryText="1294" secondaryText="Comments" color="#78909c" fill footer={{text:"Change +5%",icon:"fa fa-share"}}/>  
          </AnterosCol>
          <AnterosCol medium={3}>
            <AnterosWidgetProgress icon="fa fa-comments" primaryText="1294" secondaryText="Comments" color="#ffa726" progress={60} footer={{text:"Change +5%",icon:"fa fa-share"}}/>
          </AnterosCol>
          <AnterosCol medium={3}>
            <AnterosWidgetProgress icon="fa fa-comments" primaryText="1294" secondaryText="Comments" color="#ffa726" progress={60} fill footer={{text:"Change +5%",icon:"fa fa-share"}}/>
          </AnterosCol>
      </AnterosRow>
      <AnterosRow style={{margin:30,padding:20}}>
        <AnterosCol medium={3}>
            <AnterosWidgetInfo icon="fa fa-comments" primaryText="1294" secondaryText="Comments" iconColor="#455a64" backgroundColor="#eceff1"
                footerBackgroundColor="#455a64" footerIconColor="#b0bec5" primaryTextColor="#455a64" secondaryTextColor="#b0bec5" iconSize={20} footer={{text:"Change +5%",icon:"fa fa-share"}}/>
          </AnterosCol>
          <AnterosCol medium={3}>
                <AnterosWidgetProgress icon="fa fa-comments" primaryText="1294" fill secondaryText="Comments" progress={60}
                    iconColor="#a5d6a7" backgroundColor="#4caf50" primaryTextColor="#1b5e20" footerIconColor="#64b5f6" footerTextColor="#64b5f6"
                    secondaryTextColor="#a5d6a7" footer={{text:"Change +5%",icon:"fa fa-share"}}/> 
          </AnterosCol>
          <AnterosCol medium={3}>
            <AnterosWidgetChartBar primaryText="R$1.000.000,00" secondaryText="Vendas" data={[3,6,7,4,5,5,9]}
                footer={[{primaryText:"187",secondaryText:"Realizado"},
                {primaryText:"80",secondaryText:"Perdido"},
                ]}
                backgroundColor="#c62828" primaryTextColor="#e53935" secondaryTextColor="#ef9a9a" footerBackgroundColor="#ef9a9a"
                barColor="#ffffff60" borderColor="#e53935" footerPrimaryTextColor="#FFF" footerSecondaryTextColor="#FFFFFF90"/>
          </AnterosCol>
          <AnterosCol medium={3}>
            <AnterosWidgetLineChart primaryText="R$1.000.000,00" secondaryText="Vendas" color="#e57373" chartColor="#e5737340" data={[3,6,7,4,5,5,9]}
              footer={[
              {primaryText:"80",secondaryText:"Concluido"},
              {primaryText:"9",secondaryText:"Recusado"},
              ]}
              backgroundColor="#64b5f6" primaryTextColor="#1565c0" secondaryTextColor="#1565c070" footerBackgroundColor="#1565c0"
              borderColor="#0d47a1" chartColor="#0d47a130" footerPrimaryTextColor="#000" footerSecondaryTextColor="#00000090"
              />
          </AnterosCol>
      </AnterosRow>
      <AnterosRow style={{margin:30,padding:20}}>
          <AnterosCol medium={4}>
            <AnterosWidgetPieChart primaryText="" secondaryText="Marketing" footerBackgroundColor="#2196f3"
                data={[
                    {value:10,label:'Google Ads', color:'#2196f3'},
                    {value:17,label:'Facebook Ads', color:'#ffa726'},
                    {value:13,label:'Youtube Ads', color:'#e57373'},
                    {value:22,label:'Twitter Ads', color:'#ce93d8'},
                    ]}
                footer={[{primaryText:"187",secondaryText:"Realizado"},
                    {primaryText:"80",secondaryText:"Concluido"},
                    {primaryText:"9",secondaryText:"Recusado"},
                    {primaryText:"34",secondaryText:"Recusado"}]}
                    footerPrimaryTextColor="#000" footerSecondaryTextColor="#00000090"/>
          </AnterosCol>
            <AnterosCol medium={4}>
            <AnterosWidgetDoughnutChart primaryText="" secondaryText="Custos" footerBackgroundColor="#78909c"
                data={[
                    {value:10,label:'Marketing', color:'#2196f3'},
                    {value:17,label:'Recursos Humanos', color:'#ffa726'},
                    {value:13,label:'Vendas', color:'#e57373'},
                    {value:22,label:'Financeiro', color:'#ce93d8'},
                    ]}
                footer={[{primaryText:"187",secondaryText:"Realizado"},
                    {primaryText:"80",secondaryText:"Concluido"},
                    {primaryText:"9",secondaryText:"Recusado"},
                    {primaryText:"34",secondaryText:"Recusado"}]}
                    backgroundColor="#b0bec5"/>
          </AnterosCol>
          <AnterosCol medium={4}>
            <AnterosWidgetDoughnutChart primaryText="" secondaryText="Custos" footerBackgroundColor="#3f51b5"
                data={[
                    {value:10,label:'Marketing', color:'#ec407a'},
                    {value:17,label:'Recursos Humanos', color:'#ff7043'},
                    {value:13,label:'Vendas', color:'#a1887f'},
                    {value:22,label:'Financeiro', color:'#ce93d8'},
                    ]}
                footer={[{primaryText:"187",secondaryText:"Realizado"},
                    {primaryText:"80",secondaryText:"Concluido"},
                    {primaryText:"9",secondaryText:"Recusado"},
                    {primaryText:"34",secondaryText:"Recusado"}]}
                    footerPrimaryTextColor="#000" footerSecondaryTextColor="#00000090"/>
          </AnterosCol>
      </AnterosRow>
      <AnterosRow style={{margin:30,padding:20}}>
          <AnterosCol medium={4}>
            <AnterosWidgetPieChart primaryText="" secondaryText="Marketing" footerBackgroundColor="#2196f3"
                data={[
                    {value:10,label:'Google Ads', color:'#2196f3'},
                    {value:17,label:'Facebook Ads', color:'#ffa726'},
                    {value:13,label:'Youtube Ads', color:'#e57373'},
                    {value:22,label:'Twitter Ads', color:'#ce93d8'},
                    ]}
                    backgroundColor="#b0bec5"
                />
          </AnterosCol>
            <AnterosCol medium={4}>
            <AnterosWidgetPieChart primaryText="" secondaryText="Custos" footerBackgroundColor="#78909c"
                data={[
                    {value:10,label:'Marketing', color:'#ec407a'},
                    {value:17,label:'Recursos Humanos', color:'#ff7043'},
                    {value:13,label:'Vendas', color:'#a1887f'},
                    {value:22,label:'Financeiro', color:'#ce93d8'},
                    ]}
                />
          </AnterosCol>
          <AnterosCol medium={4}>
            <AnterosWidgetDoughnutChart primaryText="" secondaryText="Custos" footerBackgroundColor="#3f51b5"
                data={[
                    {value:10,label:'Marketing', color:'#ec407a'},
                    {value:17,label:'Recursos Humanos', color:'#ff7043'},
                    {value:13,label:'Vendas', color:'#a1887f'},
                    {value:22,label:'Financeiro', color:'#ce93d8'},
                    ]}
                />
          </AnterosCol>
      </AnterosRow>
      
      </div>
    );
  }
}

export default Example;
