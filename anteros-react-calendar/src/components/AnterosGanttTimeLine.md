```jsx

import React from 'react';
import AnterosGanttTimeLine from './AnterosGanttTimeLine'

let d1 = new Date();
    let d2 = new Date();
    d2.setDate(d2.getDate() + 5);
    let d3 = new Date();
    d3.setDate(d3.getDate() + 8);
    let d4 = new Date();
    d4.setDate(d4.getDate() + 20);
    let data = [
      {
        id: 1,
        start: d1,
        end: d2,
        name: "Tarefa 1"
      },
      {
        id: 2,
        start: d3,
        end: d4,
        name: "Tarefa 2",
        color: "orange"
      },
      {
        id: 3,
        start: d1,
        end: d4,
        name: "Tarefa 3",
        color: "red"
      }
    ];
    let links = [{ id: 1, start: 1, end: 2 }];


    const config = {
      header: {
        top: {
          style: {
            background: "#777",
            textShadow: "0.5px 0.5px black",
            fontSize: 20,
          }
        },
        middle: {
          style: {
            backgroundColor: "green",
            color:'black',
            fontSize: 9,
          }
        },
        bottom: {
          style: {
            background: "blue",
            fontSize: 9,
            color: "white",
            
          },
          selectedStyle: {
            background: "linear-gradient( #d011dd ,#d011dd)",
            fontWeight: "bold",
            color: "white"
          }
        }
      },
      taskList: {
        title: {
          label: "Lista",
          style: {
            backgroundColor: "gray"
          }
        },
        task: {
          style: {
            backgroundColor: "#f3f3f3",
            color: "#777",
            
          }
        },
        verticalSeparator: {
          style: {
            backgroundColor: "black"
          },
          grip: {
            style: {
              backgroundColor: "gray"
            }
          }
        }
      },
      dataViewPort: {
        rows: {
          style: {
            backgroundColor: "white",
            //borderBottom: "solid 0.5px black"
          }
        },
        //task: {
          //showLabel: true,
          //style: {
            //borderRadius: 13,
            //boxShadow: "2px 2px 8px #888888"
          //}
        //}
      }
    };

class App extends React.Component {

 

  render(){
  return (
    <div style={{alignItems:'center', justifyContent: 'center'}} className="time-line-container">
      <AnterosGanttTimeLine
        data={data}
        links={links}
        mode="month"
        nonEditableName={false}
        onSelectItem={this.onSelectItem}
        onUpdateTask={this.onUpdateTask}
        onCreateLink={this.onCreateLink}
        itemheight={25}
        config={config}
        dayWidth={40}
        />
    </div>
  )
}
};
<App/>                   



```