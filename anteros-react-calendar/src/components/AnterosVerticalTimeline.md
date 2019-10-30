
<h4 style={{marginTop:40}}>Exemplo: </h4>

```jsx
import React, { Component } from 'react'
import {AnterosVerticalTimeline,AnterosVerticalTimelineElement} from './AnterosVerticalTimeline'


class VerticalTimeLineExample extends Component {
  render(){
    return (
      <div style={{backgroundColor:'#f9f9f9',padding:30}}>
          <AnterosVerticalTimeline layout='2-columns'>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--work"
              contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
              contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
              iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}>
                  <h3 className="vertical-timeline-element-title">Creative Director</h3>
                  <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
                  <p>Creative Direction, User Experience, Visual Design, Project Management, Team Leading</p>
            </AnterosVerticalTimelineElement>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--education"
              iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}>
                  <h3 className="vertical-timeline-element-title">Content Marketing for Web, Mobile</h3>
                  <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
                  <p>Strategy, Social Media</p>
            </AnterosVerticalTimelineElement>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--education"
              date="November 2012"
              iconStyle={{ background: 'green', color: '#fff' }}>
                <h3 className="vertical-timeline-element-title">Agile Development Scrum Master</h3>
                <h4 className="vertical-timeline-element-subtitle">Certification</h4>
                <p>Creative Direction, User Experience, Visual Design</p>
            </AnterosVerticalTimelineElement>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--education"
              iconStyle={{ background: 'purple', color: '#fff' }}>
                  <h3 className="vertical-timeline-element-title">Science in Interactive Digital Media</h3>
                  <h4 className="vertical-timeline-element-subtitle">Bachelor Degree</h4>
                  <p>Creative Direction, Visual Design</p>
            </AnterosVerticalTimelineElement>
        </AnterosVerticalTimeline>
      </div>
    )
  }
};<VerticalTimeLineExample/>
```

<h4 style={{marginTop:40}}>Exemplo: </h4>

```jsx
import React, { Component } from 'react'
import {AnterosVerticalTimeline,AnterosVerticalTimelineElement} from './AnterosVerticalTimeline'


class VerticalTimeLineExample extends Component {
  render(){
    return (
      <div style={{backgroundColor:'#f9f9f9',padding:30}}>
          <AnterosVerticalTimeline layout='1-column'>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--work"
              contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
              contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
              iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}>
                  <h3 className="vertical-timeline-element-title">Creative Director</h3>
                  <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
                  <p>Creative Direction, User Experience, Visual Design, Project Management, Team Leading</p>
            </AnterosVerticalTimelineElement>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--education"
              iconStyle={{ background: 'green', color: '#fff' }}
              contentStyle={{ background: 'green', color: '#fff' }}
              contentArrowStyle={{ borderRight: '7px solid  green' }}>
                  <h3 className="vertical-timeline-element-title">Content Marketing for Web, Mobile</h3>
                  <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
                  <p>Strategy, Social Media</p>
            </AnterosVerticalTimelineElement>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--education"
              iconStyle={{ background: 'red', color: '#fff' }}
              contentStyle={{ background: 'red', color: '#fff' }}
              contentArrowStyle={{ borderRight: '7px solid  red' }}>
                  <h3 className="vertical-timeline-element-title">Content Marketing for Web, Mobile</h3>
                  <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
                  <p>Strategy, Social Media</p>
            </AnterosVerticalTimelineElement>
            <AnterosVerticalTimelineElement
              className="vertical-timeline-element--education"
              iconStyle={{ background: 'purple', color: '#fff' }}
              contentStyle={{ background: 'purple', color: '#fff' }}
              contentArrowStyle={{ borderRight: '7px solid  purple' }}>
                  <h3 className="vertical-timeline-element-title">Content Marketing for Web, Mobile</h3>
                  <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
                  <p>Strategy, Social Media</p>
            </AnterosVerticalTimelineElement>
        </AnterosVerticalTimeline>
      </div>
    )
  }
};<VerticalTimeLineExample/>
```
