
<h4 style={{marginTop:40}}>Exemplo Básico: </h4>

```jsx
import React, { Component } from 'react'
import AnterosTimeLine from './AnterosTimeLine'

const events = [
  {date: "2017-09-14T12:22:46.587Z", text: 'Logged in'},
  {date: "2017-09-14T12:21:46.587Z", text: 'Clicked Home Page'},
  {date: "2017-09-14T12:20:46.587Z", text: 'Edited Profile'},
  {date: "2017-09-16T12:22:46.587Z", text: 'Registred'},
  {date: "2017-09-16T12:21:46.587Z", text: 'Clicked Cart'},
  {date: "2017-09-16T12:20:46.587Z", text: 'Clicked Checkout'},
]

class TimeLineExample extends Component {
  render(){
    return (
      <div style={{backgroundColor:'#f9f9f9',padding:30}}>
          <AnterosTimeLine items={events}/>
      </div>
    )
  }
};<TimeLineExample/>
```

<h4 style={{marginTop:40}}>Você também pode customizar a cor de várias partes do componente:</h4>

```jsx
import React, { Component } from 'react'
import AnterosTimeLine from './AnterosTimeLine'

const events = [
  {date: "2017-09-12T12:22:46.587Z", text: 'Logged in'},
  {date: "2017-09-13T12:21:46.587Z", text: 'Clicked Home Page'},
  {date: "2017-09-13T12:20:46.587Z", text: 'Edited Profile'},
  {date: "2017-09-13T12:22:46.587Z", text: 'Registred'},
  {date: "2017-09-16T12:21:46.587Z", text: 'Clicked Cart'},
  {date: "2017-09-16T12:20:46.587Z", text: 'Clicked Checkout'},
]

class TimeLineCustomExample extends Component {
  render(){
    return (
      <div style={{backgroundColor:'#f9f9f9',padding:30}}>
          <AnterosTimeLine
            items={events}
            labelColor='#052B47'
            labelTextColor='#fff'
            itemColor='#fff'
            itemTextColor='#052B47'
            circleColor='#fff'
            circleBorderColor='#052B47'/>
      </div>
    )
  }
};<TimeLineCustomExample/>
```