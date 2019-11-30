import React, {Component,PureComponent} from 'react'
import PropTypes from 'prop-types'
import moment from  'moment'
import './Header.css'
import './TimeLine.css'
import sizeMe from 'react-sizeme'

let MConfig = null
let MDateHelper = null
let MRegistry = null
let MDataViewPort = null

class AnterosGanttTimeLine extends Component{
    constructor(props){
        super(props);
        MConfig = new Config();
        MDateHelper = new DateHelper();
        MRegistry = new Registry();
        MDataViewPort = sizeMe({monitorWidth:true,monitorHeight:true})(DataViewPort);
        this.dragging=false;
        this.draggingPosition=0;
        this.dc=new DataController();
        this.dc.onHorizonChange=this.onHorizonChange;
        this.initialise=false;
        //This variable define the number of pixels the viewport can scroll till arrive to the end of the context
        this.pxToScroll=1900;
       
        let dayWidth=this.getDayWidth(this.props.mode);
        MConfig.load(this.props.config)
        //Initialising state
        this.state={
            currentday:0,//Day that is in the 0px horizontal    
            //nowposition is the reference position, this variable support the infinit scrolling by accumulatning scroll times and redefining the 0 position 
            // if we accumulat 2 scroll to the left nowposition will be 2* DATA_CONTAINER_WIDTH
            nowposition:0,
            startRow:0,//
            endRow:10,
            sideStyle:{width:200},
            scrollLeft:0,
            scrollTop:0,
            numVisibleRows:40,
            numVisibleDays:60,
            dayWidth:dayWidth,
            interactiveMode:false,
            taskToCreate:null,
            links:[],
            mode:this.props.mode?this.props.mode:VIEW_MODE_MONTH,
            size:{width:1,height:1},
            changingTask:null
  
        }
    }

      ////////////////////
     //     ON MODE    //
    ////////////////////

   


    getDayWidth(mode){
        switch(mode){

            case VIEW_MODE_DAY:
                return DAY_DAY_MODE;
            case VIEW_MODE_WEEK:
                return DAY_WEEK_MODE;
            case VIEW_MODE_MONTH:
                return DAY_MONTH_MODE;
            case VIEW_MODE_YEAR:
                return DAY_YEAR_MODE;
            default:
                return DAY_MONTH_MODE;
        }
    }


      ////////////////////
     //     ON SIZE    //
    ////////////////////
    

    onSize = size => {
        //If size has changed
        this.calculateVerticalScrollVariables(size);
         if (!this.initialise){
            this.dc.initialise(this.state.scrollLeft+this.state.nowposition,
                this.state.scrollLeft+this.state.nowposition+size.width,
                this.state.nowposition,this.state.dayWidth
            )
            this.initialise=true;

         }
        this.setStartEnd();
        let newNumVisibleRows=Math.ceil(size.height / this.props.itemheight);
        let newNumVisibleDays=this.calcNumVisibleDays(size)
        let rowInfo=this.calculateStartEndRows(newNumVisibleRows,this.props.data,this.state.scrollTop);
        this.setState({
            numVisibleRows:newNumVisibleRows,
            numVisibleDays:newNumVisibleDays,
            startRow:rowInfo.start,
            endRow:rowInfo.end,
            size:size
        })
    }
    
      /////////////////////////
     //   VIEWPORT CHANGES  //
    /////////////////////////

    verticalChange=(scrollTop)=>{ 
        if (scrollTop==this.state.scrollTop)
            return;
        //Check if we have scrolling rows
        let rowInfo=this.calculateStartEndRows(this.state.numVisibleRows,this.props.data,scrollTop);
        if (rowInfo.start!==this.state.start){
            this.setState(
                this.state={
                    scrollTop:scrollTop,
                    startRow:rowInfo.start,
                    endRow:rowInfo.end,
            })
        }
    }

    calculateStartEndRows=(numVisibleRows,data,scrollTop)=>{
        let new_start=Math.trunc(scrollTop/this.props.itemheight)
        let new_end =new_start+numVisibleRows>=data.length?data.length:new_start+numVisibleRows;
        return {start:new_start,end:new_end}
    }

    
    setStartEnd=()=>{
        this.dc.setStartEnd(this.state.scrollLeft,
                            this.state.scrollLeft+this.state.size.width,
                            this.state.nowposition,
                            this.state.dayWidth)
    }


    horizontalChange=(newScrollLeft)=>{
        let new_nowposition=this.state.nowposition;
        let new_left=-1;
        let headerData=this.state.headerData;
        let new_startRow=this.state.startRow;
        let new_endRow=this.state.endRow;
        
        //Calculating if we need to roll up the scroll
        if (newScrollLeft>this.pxToScroll){//ContenLegnth-viewportLengt
            new_nowposition=this.state.nowposition-this.pxToScroll
            new_left=0;
        } else{
            if (newScrollLeft<=0){//ContenLegnth-viewportLengt
                new_nowposition=this.state.nowposition+this.pxToScroll
                new_left=this.pxToScroll;
            }else{
                new_left=newScrollLeft;
            }
        }

        //Get the day of the left position
        let currentIndx=Math.trunc((newScrollLeft-this.state.nowposition) /this.state.dayWidth)
        
  
        //Calculate rows to render
        new_startRow=Math.trunc(this.state.scrollTop/this.props.itemheight)
        new_endRow =new_startRow+this.state.numVisibleRows>=this.props.data.length?this.props.data.length-1:new_startRow+this.state.numVisibleRows;
        //If we need updates then change the state and the scroll position
        //Got you
        this.setStartEnd();
        this.setState(
            this.state={
                currentday:currentIndx,
                nowposition:new_nowposition,
                headerData:headerData,
                scrollLeft: new_left,
                startRow:new_startRow,
                endRow:new_endRow,
        })
        
    }


  

    calculateVerticalScrollVariables=(size)=>{
        //The pixel to scroll verically is equal to the pecentage of what the viewport represent in the context multiply by the context width
        this.pxToScroll=(1-(size.width/DATA_CONTAINER_WIDTH)) * DATA_CONTAINER_WIDTH -1;
    }

    onHorizonChange=(lowerLimit,upLimit)=>{
        if (this.props.onHorizonChange)
            this.props.onHorizonChange(lowerLimit,upLimit)
    }
    
      /////////////////////
     //   MOUSE EVENTS  //
    /////////////////////

    doMouseDown=(e)=>{
        this.dragging=true;
        this.draggingPosition=e.clientX;
    }
    doMouseMove=(e)=>{
        if(this.dragging){
            let delta=this.draggingPosition-e.clientX;
                   
            if (delta!==0){
                this.draggingPosition=e.clientX;
                this.horizontalChange(this.state.scrollLeft+delta);
            }
        }
    }
    doMouseUp=(e)=>{
        this.dragging=false;
    }
    doMouseLeave=(e)=>{
        // if (!e.relatedTarget.nodeName)
        //     this.dragging=false;
       this.dragging=false;
    }
    
    doTouchStart=(e)=>{
        this.dragging=true;
        this.draggingPosition=e.touches[0].clientX;
    }
    doTouchEnd=(e)=>{
        this.dragging=false;
    }
    doTouchMove=(e)=>{
        if(this.dragging){
            let delta=this.draggingPosition-e.touches[0].clientX;
                   
            if (delta!==0){
                this.draggingPosition=e.touches[0].clientX;
                this.horizontalChange(this.state.scrollLeft+delta);
            }
        }
    }
    doTouchCancel=(e)=>{
        this.dragging=false;
    }

    doMouseLeave=(e)=>{
        // if (!e.relatedTarget.nodeName)
        //     this.dragging=false;
       this.dragging=false;
    }

    //Child communicating states
    onTaskListSizing=(delta)=>{
        this.setState((prevState) => {
            let result={...prevState};
            result.sideStyle={width:result.sideStyle.width-delta};
            return result;
        })
    }

      /////////////////////
     //   ITEMS EVENTS  //
    /////////////////////
    
    onSelectItem=(item)=>{
        if (this.props.onSelectItem && item!=this.props.selectedItem)
            this.props.onSelectItem(item)
    }

 
    onStartCreateLink=(task,position)=>{
        console.log(`Start Link ${task}`)
        this.setState({
            interactiveMode:true,
            taskToCreate:{task:task,position:position}
        })
        
    }

 
    onFinishCreateLink=(task,position)=>{
        console.log(`End Link ${task}`)
        if (this.props.onCreateLink && task){
            this.props.onCreateLink({start:this.state.taskToCreate,end:{task:task,position:position}})
        }
        this.setState({
            interactiveMode:false,
            taskToCreate:null
        })
    }

    onTaskChanging=(changingTask)=>{
        this.setState({
            changingTask:changingTask
        })

    }

    calcNumVisibleDays=(size)=>{
        return Math.ceil(size.width / this.state.dayWidth)+BUFFER_DAYS
    }
    checkMode(){
        if(this.props.mode!=this.state.mode && this.props.mode){
            this.state.mode=this.props.mode
            let newDayWidth=this.getDayWidth(this.state.mode);
            this.state.dayWidth=newDayWidth;
            this.state.numVisibleDays=this.calcNumVisibleDays(this.state.size)
            //to recalculate the now position we have to see how mwny scroll has happen
            //to do so we calculate the diff of days between current day and now 
            //And we calculate how many times we have scroll
            let scrollTime=Math.ceil(-this.state.currentday*this.state.dayWidth/this.pxToScroll)
            //We readjust now postion to the new number of scrolls
            this.state.nowposition=scrollTime*this.pxToScroll;
            let scrollLeft=(this.state.currentday*this.state.dayWidth+this.state.nowposition)%this.pxToScroll
            // we recalculate the new scroll Left value
            this.state.scrollLeft=scrollLeft;
         }
    }
    checkNeeeData=()=>{
        if (this.props.data!=this.state.data){
            this.state.data=this.props.data;
            let rowInfo=this.calculateStartEndRows(this.state.numVisibleRows,this.props.data,this.state.scrollTop);
            this.state.startRow=rowInfo.start;
            this.state.endRow=rowInfo.end;
            MRegistry.registerData(this.state.data)
        }
        if (this.props.links!=this.state.links){
            this.state.links=this.props.links;
            MRegistry.registerLinks(this.props.links)
        }
        
    }
    render(){
        this.checkMode();
        this.checkNeeeData();
        return (
        <div className="timeLine">   
            <div className="timeLine-side-main" style={this.state.sideStyle}> 
                <TaskList
                    ref='taskViewPort'
                    itemheight={this.props.itemheight} 
                    startRow={this.state.startRow}
                    endRow={this.state.endRow}
                    data={this.props.data}
                    selectedItem={this.props.selectedItem}
                    onSelectItem={this.onSelectItem}
                    onUpdateTask={this.props.onUpdateTask}
                    onScroll={this.verticalChange}/>
                <VerticalSpliter onTaskListSizing={this.onTaskListSizing}/>
            </div>       
            <div className="timeLine-main">
                <Header headerData={this.state.headerData} 
                        numVisibleDays={this.state.numVisibleDays}
                        currentday={this.state.currentday}
                        nowposition={this.state.nowposition}
                        dayWidth={this.state.dayWidth}
                        mode={this.state.mode}
                        scrollLeft={this.state.scrollLeft}/>
                <MDataViewPort 
                    ref='dataViewPort'
                    scrollLeft={this.state.scrollLeft}
                    scrollTop={this.state.scrollTop}
                    itemheight={this.props.itemheight}
                    nowposition={this.state.nowposition}
                    startRow={this.state.startRow}
                    endRow={this.state.endRow}
                    data={this.props.data}
                    selectedItem={this.props.selectedItem}
                    dayWidth={this.state.dayWidth}
                    onScroll={this.scrollData}  
                    onMouseDown={this.doMouseDown} 
                    onMouseMove={this.doMouseMove}
                    onMouseUp={this.doMouseUp} 
                    onMouseLeave ={this.doMouseLeave}
                    onTouchStart={this.doTouchStart}
                    onTouchMove={this.doTouchMove}
                    onTouchEnd={this.doTouchEnd}
                    onTouchCancel={this.doTouchCancel}
                    onSelectItem={this.onSelectItem}
                    onUpdateTask={this.props.onUpdateTask}
                    onTaskChanging={this.onTaskChanging}
                    onStartCreateLink={this.onStartCreateLink}
                    onFinishCreateLink={this.onFinishCreateLink}
                    boundaries={{lower:this.state.scrollLeft,upper:this.state.scrollLeft+this.state.size.width}}
                    onSize={this.onSize}/>
                <LinkViewPort 
                    scrollLeft={this.state.scrollLeft}
                    scrollTop={this.state.scrollTop}
                    startRow={this.state.startRow}
                    endRow={this.state.endRow}
                    data={this.props.data}
                    nowposition={this.state.nowposition}
                    dayWidth={this.state.dayWidth}
                    interactiveMode={this.state.interactiveMode}
                    taskToCreate={this.state.taskToCreate}
                    onFinishCreateLink={this.onFinishCreateLink}
                    changingTask={this.state.changingTask}
                    selectedItem={this.props.selectedItem}
                    onSelectItem={this.onSelectItem}
                    itemheight={this.props.itemheight}
                    onSelectItem={this.onSelectItem}
                    links={this.props.links}/>
            </div>
        </div>)
    }

}

AnterosGanttTimeLine.propTypes = {
    /** Altura do item */
    itemheight: PropTypes.number.isRequired,
    /**  */
    dayWidth:PropTypes.number.isRequired,
    /** Função disparada quando um item é selecionado */
    onSelectItem:PropTypes.func,
    /** Função disparada quando um item é alterado */
    onUpdateTask:PropTypes.func,
    /** Recebe por parâmetro um objeto que corresponde ao item selecionado */
    selectedItem:PropTypes.object,
    /** Recebe um array de objetos que correspondem ao inicio e fim de um link entre dois itens */
    links:PropTypes.arrayOf(PropTypes.object),
    /** Recebe um array de objetos que correspondem aos itens */
    data:PropTypes.arrayOf(PropTypes.object),
    /** Alterna o modo de exibição do calendário */
    mode:PropTypes.oneOf(["day","month","week","year"]),
    /**  */
    nonEditableName:PropTypes.bool,
    /** Recebe um objeto que altera as propriedades de estilo do componente */
    config:PropTypes.object,
  };

AnterosGanttTimeLine.defaultProps = {
    itemheight:20,
    dayWidth:24,
    mode:"month"
  };



  //================   VerticalSpliter   =========================

  class VerticalSpliter extends Component{
    constructor(props){
        super(props);
        this.doMouseMove=this.doMouseMove.bind(this)
        this.doMouseDown=this.doMouseDown.bind(this)
        this.doMouseUp=this.doMouseUp.bind(this)
        this.state={dragging:false}
    }

    doMouseDown(e){
        if (e.button === 0){
            this.draggingPosition=e.clientX;
            this.setState({dragging:true})
        }
    }

    componentDidUpdate(props, state) {
        if (this.state.dragging && !state.dragging) {
          document.addEventListener('mousemove', this.doMouseMove)
          document.addEventListener('mouseup', this.doMouseUp)
        } else if (!this.state.dragging && state.dragging) {
          document.removeEventListener('mousemove', this.doMouseMove)
          document.removeEventListener('mouseup', this.doMouseUp)
        }
      }

    doMouseMove(e){
       if(this.state.dragging){
            e.stopPropagation();
            let delta=this.draggingPosition-e.clientX;
            this.draggingPosition=e.clientX;
            this.props.onTaskListSizing(delta)
        }
    }

    doMouseUp(e){

        this.setState({dragging:false})
    }

    render(){
        return (
            <div className="verticalResizer"   
                style={MConfig.values.taskList.verticalSeparator.style}              
                onMouseDown={this.doMouseDown}>   
                <div className="squareGrip" style={MConfig.values.taskList.verticalSeparator.grip.style} ></div>
                <div className="squareGrip" style={MConfig.values.taskList.verticalSeparator.grip.style}></div>
                <div className="squareGrip" style={MConfig.values.taskList.verticalSeparator.grip.style}></div>
                <div className="squareGrip" style={MConfig.values.taskList.verticalSeparator.grip.style}></div>
            </div>)
    }
}
//==========================================


//========================= Config =======================
const defvalues={
    header:{
        top:{
            style:{
                backgroundColor:"#333333",
                fontSize:10,
                color:'white',
                textAlign:'center'
            }
        },
        middle:{
            style:{
                backgroundColor:"chocolate"
            },
            selectedStyle:{
                backgroundColor:"#b13525",
                fontWeight: 'bold' 
            }
        },
        bottom:{
            style:{
              background:"grey",
              color:'white',
              fontSize:9
            },
            selectedStyle:{
                backgroundColor:"#b13525",
                fontWeight: 'bold'
            }
          }
    },
    taskList:{
        title:{
            label:"Projects",
            style:{
                backgroundColor: '#333333',
                borderBottom: 'solid 1px silver',
                color: 'white',
                textAlign: 'center'
            }
        },
        task:{
            style:{
                backgroundColor: '#fbf9f9',
            }
        },
        verticalSeparator:{
            style:{
                backgroundColor: '#333333',
            },
            grip:{
                style:{
                  backgroundColor: '#cfcfcd',
                }
              }
        }
        
  
    },
    dataViewPort:{
        rows:{
          style:{
            backgroundColor:"#fbf9f9",
            borderBottom:'solid 0.5px #cfcfcd'
          }
        },
        task:{
            showLabel:false,
            
            style:{
                position: 'absolute',
                borderRadius:14,
                color: 'white',
                textAlign:'center',
                backgroundColor:'grey'
            },
            selectedStyle:{
                position: 'absolute',
                borderRadius:14,
                border:'solid 1px #ff00fa',
                color: 'white',
                textAlign:'center',
                backgroundColor:'grey'
            }
        }
      },
    links:{
        color:'black',
        selectedColor:'#ff00fa',

    }
  }
 

class Config {
    constructor(){
        this.data=defvalues;
    }

    load=(values)=>{
        this.data={}
        if (values)
            this.populate(values,defvalues,this.data);
        else
        this.data=defvalues;
    }


    populate(values,defvalues,final){
        if (!this.isObject(defvalues))
            return;
        for(let key in defvalues){
            if (!values[key]){
                //if not exits
                final[key]=defvalues[key]
            }
            else{
                //if it does
                final[key]=values[key]
                this.populate(values[key],defvalues[key],final[key]);
            }
        }
    }
    isObject(value){
        if (typeof value === 'string'
        || typeof value === 'boolean'
        || typeof value === 'number')
            return false;
        return true;
    }
    
    get values(){
        return this.data;
    }

}
//=======================================


//================================  Header  ============================

class HeaderItem extends PureComponent{
    constructor(props){
        super(props);
        
    }
    render(){
        return (
        <div  style={{ display: 'flex',justifyContent:'center',alignItems:'center', borderLeft:'solid 1px white',position:'absolute',height:20,left:this.props.left,width:this.props.width}}>
            <div>
            {this.props.label}
            </div>
        </div>)
    }
}


class Header extends PureComponent {
    constructor (props){
        super(props)
        this.setBoundaries();
 
    }

    getFormat(mode,position){

        switch (mode){
            case 'year':
                return 'YYYY'
            case 'month':
                if (position =='top')
                    return 'MMMM YYYY'
                else
                    return 'MMMM' 
            case 'week':
                if (position =='top')
                    return 'ww MMMM YYYY'
                else
                    return 'ww'
            case 'dayweek':
                return 'dd'
            case 'daymonth':
                return 'D'
            
        }

       

    }

    getModeIncrement(date,mode){
        switch (mode){
            case 'year':
                return MDateHelper.daysInYear(date.year())
            case 'month':
                return date.daysInMonth()
            case 'week':
                return 7;
            default: 
                return 1;
        }
    }


    getStartDate=(date,mode)=>{
        let year=null;
        switch (mode){
            case 'year':
                year=date.year();
                return moment([year, 0, 1]);
            case 'month':
                year=date.year();
                let month=date.month();
                return moment([year, month, 1]);
            case 'week':
               
                return date.subtract(date.day(), 'days')
            default:
                return date
        
        }
    }


    renderTime=(left,width,mode,key)=>{
        let result=[]
        let hourWidth=width/24;
        let iterLeft=0;
        for(let i=0;i<24;i++){

            result.push(<HeaderItem key={i} left={iterLeft}   width={hourWidth}  label={mode=='shorttime'?i:`${i}:00`}/>)
            iterLeft=iterLeft+hourWidth;
        }
        return <div key={key} style={{position:'absolute',height:20,left:left,width:width}}> {result}</div>;
    }
    getBox(date,mode,lastLeft){
        let increment=this.getModeIncrement(date,mode)*this.props.dayWidth
        if(!lastLeft){
            let starDate=this.getStartDate(date,mode)
            starDate=starDate.startOf('day')
            let now =moment().startOf('day')
            let daysInBetween=starDate.diff(now,'days');
            lastLeft=MDateHelper.dayToPosition(daysInBetween,this.props.nowposition,this.props.dayWidth);
     
                
        }
        
        return {left:lastLeft,width:increment} 
    }

    renderHeaderRows=(top,middle,bottom)=>{
        let result ={"top":[],"middle":[],"bottom":[]}
        let lastLeft ={}
        let currentTop=""
        let currentMiddle=""
        let currentBottom=""
        let currentDate=null;
        let box=null

        let start=this.props.currentday;
        let end=this.props.currentday+this.props.numVisibleDays;
       
        for (let i=start-BUFFER_DAYS;i<end+BUFFER_DAYS;i++ ){
            //The unit of iteration is day 
            currentDate=moment().add(i, 'days')       
            if (currentTop!=currentDate.format(this.getFormat(top,'top'))){
                currentTop=currentDate.format(this.getFormat(top,'top'));
                box=this.getBox(currentDate,top,lastLeft.top)
                lastLeft.top=box.left+box.width;
                result.top.push(<HeaderItem key={i} left={box.left}   width={box.width}  label={currentTop}/>)
            }

            if (currentMiddle!=currentDate.format(this.getFormat(middle))){
                currentMiddle=currentDate.format(this.getFormat(middle));
                box=this.getBox(currentDate,middle,lastLeft.middle)
                lastLeft.middle=box.left+box.width;
                result.middle.push(<HeaderItem key={i} left={box.left}   width={box.width}  label={currentMiddle}/>)
            }

            if (currentBottom!=currentDate.format(this.getFormat(bottom))){
                currentBottom=currentDate.format(this.getFormat(bottom));
                box=this.getBox(currentDate,bottom,lastLeft.bottom)
                lastLeft.bottom=box.left+box.width;
                if (bottom == 'shorttime' ||bottom == 'fulltime'){
                    result.bottom.push(this.renderTime(box.left,box.width,bottom,i))
                }else{
                    result.bottom.push(<HeaderItem key={i} left={box.left}   width={box.width}  label={currentBottom}/>)
                }
                
            }            
    
        }

        return (<div  className="timeLine-main-header-container" style={{width:DATA_CONTAINER_WIDTH,maxWidth:DATA_CONTAINER_WIDTH}}>
                    <div className="header-top"  style={{...MConfig.values.header.top.style}}>
                        {result.top}
                    </div>
                    <div className="header-middle" style={{...MConfig.values.header.middle.style}} >
                        {result.middle}
                    </div>
                    <div className="header-bottom" style={{...MConfig.values.header.bottom.style}}>
                        {result.bottom}
                    </div>
                </div>
                )
    }

    renderHeader=()=>{
        switch (this.props.mode){
            case VIEW_MODE_DAY:
                return this.renderHeaderRows('week','dayweek','fulltime')
            case VIEW_MODE_WEEK:
                return this.renderHeaderRows('week','dayweek','shorttime')
            case VIEW_MODE_MONTH:
                return  this.renderHeaderRows('month','dayweek','daymonth')
            case VIEW_MODE_YEAR:
                return this.renderHeaderRows('year','month','week')
        }
        
    }

    setBoundaries=()=>{
        this.start=this.props.currentday-BUFFER_DAYS;
        this.end=this.props.currentday+this.props.numVisibleDays+BUFFER_DAYS
    }
    
    needToRender=()=>{
        return (this.props.currentday<this.start)|| (this.props.currentday+this.props.numVisibleDays>  this.end)
    }

    render(){
        if (this.refs.Header)
            this.refs.Header.scrollLeft=this.props.scrollLeft;
        return  <div id="timeline-header" ref="Header"  className="timeLine-main-header-viewPort">
                    {this.renderHeader()}
                </div>
    }
}
//=======================================

//======================================  Const ==========================

const MODE_NONE              =0;
const MODE_MOVE              =1;
const MOVE_RESIZE_LEFT       =2;
const MOVE_RESIZE_RIGHT      =3;

const BUFFER_DAYS             =30;

const DATA_CONTAINER_WIDTH   =5000;

const VIEW_MODE_DAY          = "day"
const VIEW_MODE_WEEK         = "week"
const VIEW_MODE_MONTH        = "month"
const VIEW_MODE_YEAR         = "year"

const DAY_YEAR_MODE          =4
const DAY_MONTH_MODE         =24
const DAY_WEEK_MODE          =480 //each hour 20 px
const HOUR_DAY_WEEK          =20;
const DAY_DAY_MODE           =1440 //each hour 60 px
const HOUR_DAY_DAY           =60;
//=============================================


//===================================== DateHelper ================================

const MIL_IN_HOUR=1000*3600;
class DateHelper{

    dateToPixel(input,nowposition,daywidth){
        let nowDate=this.getToday();//
        let inputTime=new Date(input);

        //Day light saving patch
        let lightSavingDiff=(inputTime.getTimezoneOffset()-nowDate.getTimezoneOffset())*60*1000
        let timeDiff = inputTime.getTime() - nowDate.getTime()-lightSavingDiff;
        let pixelWeight=daywidth/24;//Value in pixels of one hour
        return (timeDiff / MIL_IN_HOUR )*pixelWeight+nowposition;
    }
    pixelToDate(position,nowposition,daywidth){
        let hoursInPixel=24/daywidth;
        let pixelsFromNow=position-nowposition;
        let today=this.getToday();
        let milisecondsFromNow=today.getTime()+pixelsFromNow*hoursInPixel*MIL_IN_HOUR;
        let result =new Date(milisecondsFromNow)
        let lightSavingDiff=(result.getTimezoneOffset()-today.getTimezoneOffset())*60*1000
        result.setTime(result.getTime() + lightSavingDiff);
        return result;
    }
    getToday(){
        let date =new Date()
        date.setHours(0,0,0,0);
        return date
    }
    monthDiff(start,end){
        return  Math.abs(end.getMonth() - start.getMonth() + (12 * (end.getFullYear() - start.getFullYear())));
    }

    daysInMonth (month, year) {
        return new Date(year, month, 0).getDate();
    }


    dayToPosition=(day,now,dayWidth)=>{
        return day * dayWidth +now;

    }

    daysInYear=(year)=> 
    {
        return this.isLeapYear(year) ? 366 : 365;
    }

    isLeapYear(year) {
        return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
    }
}
//===============================

//======================================= DataViewPort =============================
class DataRow extends Component{
    constructor(props){
        super(props);

    }
    render(){
        return (
        <div className="timeLine-main-data-row" 
            style={{...MConfig.values.dataViewPort.rows.style,top:this.props.top,height:this.props.itemheight}}>
        {this.props.children}
        </div>)    
    }
}

class DataViewPort extends Component{
    constructor(props){
        super(props)
        this.childDragging=false
    }
    getContainerHeight(rows){
        let new_height=rows>0?rows * this.props.itemheight:10;
        return new_height
    }
    onChildDrag=(dragging)=>{
        this.childDragging=dragging;
    }


    renderRows=()=>{
        let result=[];
        for (let i=this.props.startRow;i<this.props.endRow+1;i++){
            let item=this.props.data[i];
            if(!item) break
            //FIXME PAINT IN BOUNDARIES
            
            let new_position=MDateHelper.dateToPixel(item.start,this.props.nowposition,this.props.dayWidth);
            let new_width=MDateHelper.dateToPixel(item.end,this.props.nowposition,this.props.dayWidth)-new_position;
            result.push(<DataRow key={i} label={item.name} top={i*this.props.itemheight} left={20} itemheight={this.props.itemheight} >
                    <DataTask item={item} label={item.name}  
                              nowposition={this.props.nowposition} 
                              dayWidth={this.props.dayWidth}
                              color={item.color} 
                              left={new_position} 
                              width={new_width} 
                              height={this.props.itemheight}
                              onChildDrag={this.onChildDrag}
                              isSelected={this.props.selectedItem==item}
                              onSelectItem={this.props.onSelectItem} 
                              onStartCreateLink={this.props.onStartCreateLink}
                              onFinishCreateLink={this.props.onFinishCreateLink}
                              onTaskChanging={this.props.onTaskChanging}
                              onUpdateTask={this.props.onUpdateTask}> </DataTask> 
                </DataRow>);
 
        }
        return result;
    }

    doMouseDown=(e)=>{
        if ((e.button === 0) && (!this.childDragging)) {
            this.props.onMouseDown(e)
        }
    }
    doMouseMove=(e)=>{
        this.props.onMouseMove(e,this.refs.dataViewPort)
    }

    doTouchStart=(e)=>{
        if (!this.childDragging) {
            this.props.onTouchStart(e)
        }
    }
    doTouchMove=(e)=>{
        this.props.onTouchMove(e,this.refs.dataViewPort)
    }

    componentDidMount(){
        this.refs.dataViewPort.scrollLeft=0;
    }

    render(){
        if (this.refs.dataViewPort){
            this.refs.dataViewPort.scrollLeft=this.props.scrollLeft;
            this.refs.dataViewPort.scrollTop=this.props.scrollTop;
        }
            
        let height=this.getContainerHeight(this.props.data.length)
        return (
        <div ref="dataViewPort"  id="timeLinedataViewPort" className="timeLine-main-data-viewPort" 
                    onMouseDown={this.doMouseDown} 
                    onMouseMove={this.doMouseMove}
                    onMouseUp={this.props.onMouseUp} 
                    onMouseLeave ={this.props.onMouseLeave}
                    onTouchStart={this.doTouchStart}
                    onTouchMove={this.doTouchMove}
                    onTouchEnd={this.props.onTouchEnd}
                    onTouchCancel={this.props.onTouchCancel}
                    >   
                                 
            <div className="timeLine-main-data-container" style={{height:height,width:DATA_CONTAINER_WIDTH,maxWidth:DATA_CONTAINER_WIDTH}}>                   
                {this.renderRows()} 
            </div>
        </div>)
    }
}
//=================================================


//========================================= DataTask ======================
class DataTask extends Component{
    constructor(props){
        super(props);
        this.calculateStyle=this.calculateStyle.bind(this)
        this.state={dragging:false,
                    left:this.props.left,
                    width:this.props.width,
                    mode:MODE_NONE}
    }

    onCreateLinkMouseDown=(e,position)=>{
        if (e.button === 0){
            e.stopPropagation();
            this.props.onStartCreateLink(this.props.item,position)
        }
    }
    onCreateLinkMouseUp=(e,position)=>{
            e.stopPropagation();
            this.props.onFinishCreateLink(this.props.item,position)
    }
    onCreateLinkTouchStart=(e,position)=>{
        e.stopPropagation();
        this.props.onStartCreateLink(this.props.item,position)
    }
    onCreateLinkTouchEnd=(e,position)=>{
        e.stopPropagation();
        this.props.onFinishCreateLink(this.props.item,position)
    }

    componentDidUpdate(props, state) {
        if (this.state.dragging && !state.dragging) {
            document.addEventListener('mousemove', this.doMouseMove)
            document.addEventListener('mouseup', this.doMouseUp)
            document.addEventListener('touchmove', this.doTouchMove)
            document.addEventListener('touchend', this.doTouchEnd)
        } else if (!this.state.dragging && state.dragging) {
          document.removeEventListener('mousemove', this.doMouseMove)
          document.removeEventListener('mouseup', this.doMouseUp)
          document.removeEventListener('touchmove', this.doTouchMove)
          document.removeEventListener('touchend', this.doTouchEnd)
        }
    }

    dragStart(x, mode) {
        this.props.onChildDrag(true)
        this.draggingPosition=x;
        this.setState({
            dragging: true,
            mode: mode,
            left: this.props.left,
            width: this.props.width,
        });
    }
    dragProcess(x) {
        let delta=this.draggingPosition-x;
        let newLeft=this.state.left;
        let newWidth=this.state.width;
        
        switch(this.state.mode){
            case MODE_MOVE:
                newLeft=this.state.left-delta
                break;
            case MOVE_RESIZE_LEFT:
                newLeft=this.state.left-delta;
                newWidth=this.state.width+delta;
                break;
            case MOVE_RESIZE_RIGHT :
                newWidth=this.state.width-delta;
                break;
        }
        //the coordinates need to be global
        let changeObj={item:this.props.item,position:{start:newLeft-this.props.nowposition,end:newLeft+newWidth-this.props.nowposition}};
        this.props.onTaskChanging(changeObj);
        this.setState({left:newLeft,width: newWidth}) 
        this.draggingPosition=x;
    }
    dragEnd() {
        this.props.onChildDrag(false)
        let new_start_date=MDateHelper.pixelToDate(this.state.left,this.props.nowposition,this.props.dayWidth);
        let new_end_date=MDateHelper.pixelToDate(this.state.left+this.state.width,this.props.nowposition,this.props.dayWidth);
        this.props.onUpdateTask(this.props.item,{start:new_start_date,end:new_end_date})
        this.setState({dragging:false,mode:MODE_NONE})
    }

    doMouseDown=(e, mode)=>{
        if(!this.props.onUpdateTask)
            return;
        if (e.button === 0){
            e.stopPropagation();
            this.dragStart(e.clientX, mode)
        }
    }
    doMouseMove=(e)=>{
        if (this.state.dragging) {
            e.stopPropagation();
            this.dragProcess(e.clientX);
        }
    }
    doMouseUp=()=>{
        this.dragEnd();
    }

    doTouchStart=(e, mode)=>{
        if(!this.props.onUpdateTask)
            return;
            console.log('start')
        e.stopPropagation();
        this.dragStart(e.touches[0].clientX, mode);
    }
    doTouchMove=(e)=>{
        if (this.state.dragging) {
            console.log('move')
            e.stopPropagation();
            this.dragProcess(e.changedTouches[0].clientX);
        }
    }
    doTouchEnd=(e)=>{
        console.log('end')
        this.dragEnd();
    }
    
    calculateStyle(){
        let configStyle=this.props.isSelected?MConfig.values.dataViewPort.task.selectedStyle:MConfig.values.dataViewPort.task.style;
        let backgroundColor= this.props.color?this.props.color:configStyle.backgroundColor
        

        if(this.state.dragging){
            return {...configStyle,backgroundColor: backgroundColor,left:this.state.left,width:this.state.width,height:this.props.height-5,top:2}
        }else{
            return {...configStyle, backgroundColor,left:this.props.left,width:this.props.width,height:this.props.height-5,top:2}
       }
     
    }
    render(){
        let style=this.calculateStyle()
        return (
        <div 
            onMouseDown={(e)=>this.doMouseDown(e,MODE_MOVE)}
            onTouchStart={(e)=>this.doTouchStart(e,MODE_MOVE)}
            onClick={(e)=>{this.props.onSelectItem(this.props.item)}}
            style={style}>
            <div
                className="timeLine-main-data-task-side" 
                style={{top:0,left:-4,height:style.height}}
                onMouseDown={(e)=>this.doMouseDown(e,MOVE_RESIZE_LEFT)}
                onTouchStart={(e)=>this.doTouchStart(e,MOVE_RESIZE_LEFT)}
            >
                <div
                    className="timeLine-main-data-task-side-linker" 
                    //onMouseUp={(e)=>this.onCreateLinkMouseUp(e,LINK_POS_LEFT)}
                    //onTouchEnd={(e)=>this.onCreateLinkTouchEnd(e,LINK_POS_LEFT)}
                />
            </div>
            <div style={{overflow:'hidden'}}>
            {MConfig.values.dataViewPort.task.showLabel?this.props.item.name:""}
            </div>
            <div className="timeLine-main-data-task-side" 
                style={{top:0,left:style.width-3,height:style.height}}
                onMouseDown={(e)=>this.doMouseDown(e,MOVE_RESIZE_RIGHT)}
                onTouchStart={(e)=>this.doTouchStart(e,MOVE_RESIZE_RIGHT)}
            >
                <div
                    className="timeLine-main-data-task-side-linker" 
                    //onMouseDown={(e)=>this.onCreateLinkMouseDown(e,LINK_POS_RIGHT)}
                    //onTouchStart={(e)=>this.onCreateLinkTouchStart(e,LINK_POS_RIGHT)}
                />
            </div>  
        </div>)
          
    }
}
//===========================================

//========================================== linkViewPort =========================
class LinkViewPort extends Component{
    constructor(props){
        super(props);
        this.cache=[];
        this.state={links:[],data:[],selectedItem:null}
    }

    renderLink(startItem,endItem,link,key){
        
        let startPosition = this.getItemPosition(startItem.index,startItem.item.end)
        let endPosition   = this.getItemPosition(endItem.index,endItem.item.start) 
        return<Link key={key} 
                    item={link}
                    start={{x:startPosition.x,y:startPosition.y}} 
                    end={{x:endPosition.x,y:endPosition.y}} 
                    isSelected={this.props.selectedItem==link}
                    onSelectItem={this.props.onSelectItem}/>  
    }

    getItemPosition=(index,date)=>{
        let x=MDateHelper.dateToPixel(date,0,this.props.dayWidth)
        let y=index*this.props.itemheight+this.props.itemheight/2
        return{x:x,y:y}
    }


    renderLinks(){
        this.cache=[];
        let renderLinks={};
        let startItem,endItem={}
        if (this.state.data.length==0)
            return;
        for (let i=0;i<this.state.links.length;i++){
            let link=this.state.links[i];
            if (!link)
                if (renderLinks[link.id])
                    continue;
            startItem=MRegistry.getTask(link.start)
            if (!startItem){
                this.cache.push(null)
                continue
            }
            endItem=MRegistry.getTask(link.end)
            if (!endItem){
                this.cache.push(null)
                continue
            }
                
            this.cache.push( this.renderLink(startItem,endItem,link,i)  )
            renderLinks[link.id]=""
        
        }
    }

    refreshData(){
        if ( this.props.links!=this.state.links ||
            this.props.data!=this.state.data 
            || this.props.dayWidth!=this.state.dayWidth
            ||this.props.selectedItem!=this.state.selectedItem){
            this.state.selectedItem=this.props.selectedItem
            this.state.dayWidth=this.props.dayWidth;
            this.state.links=this.props.links
            this.state.data=this.props.data
            if (this.state.links && this.state.data)
                this.renderLinks();
        }
    }

    renderCreateLink=()=>{
        if (this.props.interactiveMode){
            let record=MRegistry.getTask(this.props.taskToCreate.task.id)
            let position =this.getItemPosition(record.index,record.item.end)
            return <CreateLink  start={position} onFinishCreateLink={this.props.onFinishCreateLink}/>
        }
    }
    
    renderChangingTaskLinks=()=>{
        if ( this.props.changingTask!=this.state.changingTask){
            this.state.changingTask=this.props.changingTask;
            //Get Links from task
            let links=MRegistry.getLinks(this.state.changingTask.item.id);
            if (!links)
                return
            let item=null
            let startItem=null
            let endItem =null;
            let startPosition={}
            let endPosition={}
            for (let i=0;i<links.length;i++){
                item=links[i];
                startItem=MRegistry.getTask(item.link.start)
                if (!startItem)
                    continue
                endItem=MRegistry.getTask(item.link.end)
                if (!endItem)
                    continue
                startPosition =   this.getItemPosition(startItem.index,startItem.item.end)
                if (this.state.changingTask.item.id==item.link.start)
                    startPosition.x= this.state.changingTask.position.end;
                endPosition   =  this.getItemPosition(endItem.index,endItem.item.start)
                if (this.state.changingTask.item.id==item.link.end)
                    endPosition.x= this.state.changingTask.position.start;
                
                this.cache[item.index]=(<Link   key={-i-1} 
                                                item={item}
                                                start={{x:startPosition.x,y:startPosition.y}} 
                                                end={{x:endPosition.x,y:endPosition.y}} 
                                                isSelected={this.props.selectedItem==item}
                                                onSelectItem={this.props.onSelectItem}/>  )
                this.cache=[...this.cache]
            }
        }
    }

    render(){
        this.refreshData();
        this.renderChangingTaskLinks()
        return  (<svg   x={0} y={0} width="100%"  
                        pointerEvents="none" 
                        style={{position:'absolute', top:60, userSelect: 'none',height:'100%' }} >
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9"
                                orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z"  strokeLinejoin="round"  />
                            </marker>
                        </defs>
                        <g  transform={`matrix(1,0,0,1,${-(this.props.scrollLeft-this.props.nowposition)},${-this.props.scrollTop})`}>
                            {this.cache}
                            {this.renderCreateLink()}
                        </g>
                </svg>)
    }
}
//============================================


//=========================================== Registry ==================
class Registry{
    constructor(){
        this.data={}
        this.link={}
    }

    registerData(list){
        if (!list)
            return;
        this.data={}
        for (let i=0;i<list.length;i++){
            this.data[list[i].id]={item:list[i],index:i};
        }
    }
    registerLinks(list){
        if(!list)
            return
        this.link={}
        let start=0;
        let end=0;

        for (let i=0;i<list.length;i++){
            start=list[i].start;
            end=list[i].end;
            let value={link:list[i],index:i}
            this.createAddTo(start,this.link,value,i)
            this.createAddTo(end,this.link,value,i)
        }
    }
    createAddTo(id,list,value,index){
        if (!list[id])
            list[id]=[]
        if (list[id].indexOf(value)==-1)
            list[id].push(value)
    }

    getTask(id){
        return this.data[id]
    }
    getLinks(id){
        return this.link[id]
    }

}
//===============================================


//============================================ Link  ======================

const SSHAPE_SIDE_WIDTH=20;

class Link extends Component{
    constructor(props){
        super(props);
    }

    calcNormCoordinates=()=>{
        let cpt1={x:0,y:0}
        let cpt2={x:0,y:0}
        let middle=0;
        middle=this.props.start.x+((this.props.end.x-this.props.start.x)/2)
        cpt1={x:middle,y:this.props.start.y}
        cpt2={x:middle,y:this.props.end.y}
        return {cpt1:cpt1,cpt2:cpt2}
    }
   
    calcSCoordinates=()=>{

        let cpt1={x:this.props.start.x+SSHAPE_SIDE_WIDTH,y:this.props.start.y}
        let halfY=(this.props.end.y-this.props.start.y)/2
        let cpt2={x:cpt1.x,y:cpt1.y+halfY}
        let cpt3={x:this.props.end.x-SSHAPE_SIDE_WIDTH,y:cpt2.y}
        let cpt4={x:cpt3.x,y:cpt3.y+halfY}
        return {cpt1:cpt1,cpt2:cpt2,cpt3:cpt3,cpt4:cpt4}
    }

    getPath=()=>{
        let coordinates=null
        if (this.props.start.x>this.props.end.x){
            coordinates=this.calcSCoordinates();
            return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${coordinates.cpt3.x} ${coordinates.cpt3.y} ${coordinates.cpt4.x} ${coordinates.cpt4.y} ${this.props.end.x} ${this.props.end.y}`;
        }
        else{
            coordinates=this.calcNormCoordinates()
            return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${this.props.end.x} ${this.props.end.y}`;
        }
    }

    onSelect=(e)=>{
        if (this.props.onSelectItem)
            this.props.onSelectItem(this.props.item)

    }


    render(){
        let pathColor=this.props.isSelected?MConfig.values.links.selectedColor:MConfig.values.links.color;
        return (<g   className="timeline-link"   >   
              <path 
                pointerEvents="stroke"
                onMouseDown={this.onSelect}
                stroke='white'
                d={this.getPath()} 
                strokeLinejoin="round" 
                fill="transparent" 
                strokeWidth="4"  
                cursor="pointer"/> 
            
            <path 
                pointerEvents="stroke"
                onMouseDown={this.onSelect}
                stroke={pathColor}
                d={this.getPath()} 
                strokeLinejoin="round" 
                fill="transparent" 
                strokeWidth="1"  
                cursor="pointer"
                markerEnd="url(#arrow)"/>    
                
            {/* <circle cx={this.props.start.x} 
                    cy={this.props.start.y} r="3" fill='white'  
                    stroke={pathColor} strokeWidth="1" />     */}
        </g>) 
    }
}
//=========================================


//======================================= CreateLink =====================================

class CreateLink extends Component{
    constructor(props){
        super(props);
        this.state={x:this.props.start.x,y:this.props.start.y}
        this.init=false;
        this.lastX=-1;
        this.lastY=-1;
    }


    componentDidMount(){
        document.addEventListener('mousemove', this.doMouseMove)
        document.addEventListener('mouseup', this.doMouseUp)
    }
    componentWillUnmount(){
        document.removeEventListener('mousemove', this.doMouseMove)
        document.removeEventListener('mouseup', this.doMouseUp)
    }

    doMouseMove=(e)=>{
        if(!this.init){
            this.lastX=e.clientX;
            this.lastY=e.clientY; 
            this.init=true;
        }
        let newX=this.state.x+(e.clientX-this.lastX);
        let newY=this.state.y+(e.clientY-this.lastY);
        this.lastX=e.clientX;
        this.lastY=e.clientY; 
        this.setState({x:newX,y:newY})
    }

    doMouseUp=(e)=>{
        this.props.onFinishCreateLink()
    }
    
 
    render(){
        return (
            <Link   key={-1} 
                    start={{x:this.props.start.x,y:this.props.start.y}} 
                    end={{x:this.state.x,y:this.state.y}} />)
          
    }
}
//=====================================================


//======================================== TaskList ======================
class VerticalLine extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return (<div className="timeLine-main-data-verticalLine" style={{left:this.props.left}}>
        </div> )
    }

}

class TaskRow extends Component{
    constructor(props){
        super(props);
    }
    onChange=(value)=>{
        if (this.props.onUpdateTask){
            this.props.onUpdateTask(this.props.item,{name:value})
        }

    }

    render(){
       
        return (
        <div className="timeLine-side-task-row" 
             style={{...MConfig.values.taskList.task.style,top:this.props.top,height:this.props.itemheight}}
             onClick={(e)=>this.props.onSelectItem(this.props.item)}>

             <ContentEditable value={this.props.label} 
                              index={this.props.index}
                              onChange={this.onChange}/>
    
            
        </div>)    
    }
}

class TaskList extends Component{
    constructor(props){
        super(props)
    }
    getContainerStyle(rows){
        let new_height=rows>0?rows * this.props.itemheight:10;
        return {height:new_height}
    }
    renderTaskRow(data){
        let result=[];
        for (let i=this.props.startRow;i<this.props.endRow+1;i++){
            let item=data[i];
            if(!item) break
            result.push(<TaskRow key={i}  
                                 index={i}  
                                 item={item}
                                 label={item.name} 
                                 top={i*this.props.itemheight} 
                                 itemheight={this.props.itemheight} 
                                 isSelected={this.props.selectedItem==item}
                                 onUpdateTask={this.props.onUpdateTask}
                                 onSelectItem={this.props.onSelectItem}></TaskRow>);
                        
        }
        return result;
    }
    doScroll=()=>{
        this.props.onScroll(this.refs.taskViewPort.scrollTop)
    }
    render(){
        let data =this.props.data?this.props.data:[];
        this.containerStyle=this.getContainerStyle(data.length)
        return(
            <div className="timeLine-side"> 
                <div className="timeLine-side-title" style={MConfig.values.taskList.title.style}>
                    <div>
                      {MConfig.values.taskList.title.label}
                    </div>  
                </div>    
                <div ref="taskViewPort"  className="timeLine-side-task-viewPort" onScroll={this.doScroll}  >                
                    <div className="timeLine-side-task-container" style={this.containerStyle}>                   
                        { this.renderTaskRow(data) }
                    </div> 
                </div>
            </div> 
        )

    }
} 
//==========================================


//======================================= ContentEditable =========================

class ContentEditable extends Component{
    constructor(props){
        super(props)
        this.isFocus=false;
        this.state={
            editing:false,
            value:this.props.value,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.refs.textInput && !this.isFocus){
            this.refs.textInput.focus();
            this.isFocus=true;
        }
    }

    onFocus=()=>{
        this.setState({editing:true})
    }   

    onBlur=()=>{
        this.finishEditing()
    }    

    handleKey=(e)=>{
        const keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            this.finishEditing()
        }
    }

    finishEditing=()=>{
        this.isFocus=false;
        this.setState({editing:false})
        if(this.props.onChange)
            this.props.onChange(this.state.value)
    }

    handleChange=(e)=> {
        this.setState({value: e.target.value});
    }

    renderDiv=()=>{
        return <div  tabIndex={this.props.index} 
                    onClick={this.onFocus} 
                    onFocus={this.onFocus} 
                    style={{width:'100%'}}> {this.state.value}</div>
    }
    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.value!=this.props.value){
            this.state.value=nextProps.value;
        }
        return true;
    }

    renderEditor=()=>{

        return <input ref='textInput' onBlur={this.onBlur} 
                    style={{width:'100%',outlineColor:'black',outlineStyle: 'oinset'}}  
                    type="text" 
                    name="name" 
                    value={this.state.value} 
                    onKeyUp={this.handleKey}
                    onChange={this.handleChange}/>
    }

    render(){
        return this.state.editing?this.renderEditor():this.renderDiv();

    }
}
//==============================================================


//======================================================= DataController ================================
const HORIZON_BUFFER=1000
const HORIZON_BUFFER_ALERT=750;

class DataController{
    constructor(){
        this.lower_limit=0;
        this.upper_limit=0;
        this._dataToRender=[];
        
       
    }
    initialise=(start,end,nowposition,daywidth)=>{
        this.nowposition=nowposition
        this.daywidth=daywidth
        this.setLimits(start,end,nowposition,daywidth)
        this.loadDataHorizon();
    }

    //OnScroll
    setStartEnd=(start,end,nowposition,daywidth)=>{
        this.nowposition=nowposition
        this.daywidth=daywidth
        if (this.needData(start,end)){
            this.setLimits(start,end);
            this.loadDataHorizon();
        }
    }


    needData=(start,end)=>{
        return start<this.lower_data_limit || end>this.upper_data_limit
    }

    setLimits=(start,end)=>{
        this.lower_limit=start-HORIZON_BUFFER;
        this.lower_data_limit=start-HORIZON_BUFFER_ALERT;
        this.upper_limit=end+HORIZON_BUFFER;
        this.upper_data_limit=end+HORIZON_BUFFER_ALERT;
    }

    //OnScroll
    loadDataHorizon=()=>{
        let lowerLimit=MDateHelper.pixelToDate(this.lower_limit,this.nowposition,this.daywidth)
        let upLimit=MDateHelper.pixelToDate(this.upper_limit,this.nowposition,this.daywidth)
        this.onHorizonChange(lowerLimit,upLimit)
    }   
}
//===========================================================

export default AnterosGanttTimeLine