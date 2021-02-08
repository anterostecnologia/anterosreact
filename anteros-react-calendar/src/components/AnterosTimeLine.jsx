import moment from "moment";
import PropTypes from "prop-types";

/**
 * 
 * 
 *
 * @param {Array} items Array of events in the form of ts and text
 * @returns {Object} return object with key as date and values array in events for that date
 */


function getFormattedData(items) {
  const activities = {};
  items.forEach(({ date, text }, index) => {
    const da = moment(date);
    const dateStr = da.format("DD MMM YYYY");
    const list = activities[dateStr] || [];
    list.push({
      time: da.format("hh:mm"),
      text,
      key: index,
    });
    activities[dateStr] = list;
  });
  return activities;
}

const timeline = {
  position: 'relative',
  background: 'black',
  before:{
    content: '',
    background: 'black',
  }
}
/** Componente AnterosTimeLine */
const AnterosTimeLine = ({ items,labelColor,labelTextColor,itemColor,itemTextColor,timeTextColor,circleColor,circleBorderColor}) => {
  const activities = getFormattedData(items);
  const dates = Object.keys(activities);
  return (
    <div className="time-line-ctnr">
      {dates.map(d => (
        <ul className="time-line" key={d} style={{timeline}} css={{timeline}}>
          <li className="time-label">
            <span style={{backgroundColor: labelColor,color:labelTextColor}}>{d}</span>
          </li>
          {activities[d].map(({ time, text, key }) => (
            <TimlineItem time={time} text={text} key={key} itemColor={itemColor} itemTextColor={itemTextColor}
              timeTextColor={timeTextColor} circleColor={circleColor} circleBorderColor={circleBorderColor}/>
          ))}
        </ul>
      ))}
    </div>
  );
}

AnterosTimeLine.propTypes = {
  /**  Esta propriedade é o array de itens que tem como propriedades 'date' e 'text'*/
  items: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  /**  Esta propriedade altera a cor do label superior dos itens*/
  labelColor:PropTypes.string,
  /**  Esta propriedade altera a cor do texto do label superior dos itens*/
  labelTextColor:PropTypes.string,
  /**  Esta propriedade altera a cor do container do item*/
  itemColor:PropTypes.string,
  /**  Esta propriedade altera a cor do texto do item*/
  itemTextColor:PropTypes.string,
  /**  Esta propriedade altera a cor da hora do item*/
  timeTextColor:PropTypes.string,
  /**  Esta propriedade altera a cor da hora do item*/
  circleColor:PropTypes.string,
  /** Esta propriedade altera a cor do circulo*/
  circleBorderColor:PropTypes.string,
};

//item
function TimlineItem({ time, text, itemColor, itemTextColor, timeTextColor, circleColor, circleBorderColor }) {
    return (
      <li>
        <i className="fa" style={{backgroundColor:circleColor,borderColor:circleBorderColor}}/>
        <div className="time-line-item" style={{backgroundColor:itemColor}}>
          <span className="time" style={{color:timeTextColor}}>
            <i className="fa fa-clock-o" />
            {time}
          </span>
          <div className="time-line-header" style={{color:itemTextColor,borderBottomColor: itemColor,fontWeight:'bold'}}>{text}</div>
        </div>
      </li>
    );
  }

TimlineItem.defaultProps = {};

TimlineItem.propTypes = {
  time: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default AnterosTimeLine;