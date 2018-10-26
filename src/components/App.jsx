import React, { Component } from 'react';
import Nav from './Nav.jsx';
import Map from './Map.jsx';
import axios from 'axios';
import NewParkingInfo from './NewParkingInfo.jsx'
import ParkingInfo from './ParkingInfo.jsx'
class App extends Component {
  state = {
    map:'',
    infofromserver:[],
    polyline:'',    // update static line when change on dynamic line confirm
    dynline:'',    // dynamic line to store change
    lines:[],
    isInfoOpen: false,
    isSubmitInfoOpen: false,
    isClearPoly:false,
    isShowInputBox:false
  }

  componentDidMount() {

    axios.get("http://localhost:8080/parking_info",{
      withCredentials: true
    })
    .then(res => {
      this.setState(prevState => ({...prevState, infofromserver:res.data}))
    })
  }

  // handle new parking info sumbmit which it passed to NewParkingInfo component
  _handleInfoSubmit = () => {

    let poly = this.state.polyline;
    poly.rating = this.state.dynline.rating;
    poly.hours = this.state.dynline.hours;
    poly.setPath(this.state.dynline.coords);
    this.setState(prevState => ({...prevState, polyline:poly}));

    axios.post("http://localhost:8080/add_parking_info_data",{
      data:{coords:this.state.polyline.getPath().getArray(),
            id: this.state.polyline.id,
            hours:this.state.polyline.hours,
            rate:this.state.polyline.rate,
            rating:this.state.polyline.rating,
            comment: this.state.polyline.comment},
      withCredentials: true
    })
    .then(res => {
      this.setPolyWithKey('id',res.data.id)
      this.setPolyWithKey('comments',res.data.comments)
      this.setPolyWithKey('rating',res.data.rating)
    })
  }

  _handleCommentSubmit = () => {
    axios.post("http://localhost:8080/add_comment",{
      data:{comment:this.state.polyline.comment,
            parking_id:this.state.polyline.id},
      withCredentials: true
    })
    .then(res => {console.log(res.data)
    })
  }

  _handleRatingSubmit = (key,value) => {
    this.setPolyWithKey(key,value)
    console.log('rating',this.state.polyline.rating)
    axios.post("http://localhost:8080/add_rating",{
      data:{rating:this.state.polyline.rating,
            parking_id:this.state.polyline.id},
      withCredentials: true
    })
    .then(res => {console.log(res.data)
    })
  }
  // set condition base on the input key value and boolean value
  setCond = (key,boolean) => {
    this.setState(prevState => ({...prevState, [key]: boolean}));
  }

  setPoly = (poly) => {
    let dynline = {
      address:'',
      rate:'',
      hours:'',
      rating:'',
      comments:'',
      parking_id:'',
      coords:[]
    };
    if(poly!==undefined){
      dynline['address'] = poly.address;
      dynline['rate'] = poly.rate;
      dynline['rating'] = poly.rating;
      dynline['hours'] = poly.hours;
      dynline['comments'] = poly.comments;
      dynline['parking_id'] = poly.parking_id;
      dynline['coords'] = poly.getPath().getArray();
    }

    this.setState(prevState => ({...prevState, polyline:poly}));
    this.setState(prevState => ({...prevState, dynline:dynline}));
  }

  clearPoly = () => {
    if(this.state.isClearPoly){
      this.state.polyline.setMap(null);
    }
  }

  setMap = (map) => {
    this.setState(prevState => ({...prevState, map:map}));
  }
  setPolyWithKey = (key,value) => {
    let dynline = this.state.dynline;
    dynline[key] = value;
    this.setState(prevState => ({...prevState, dynline:dynline}));
  }

  addLine = (newline) => {
    this.setState(prevState => ({lines: [...prevState.lines, newline]}))
  }

  hideLines = () => {
    this.state.lines.forEach(line=>{
      // line.setVisible(false)
      line.setMap(null)
    })
  }
  newLines = () => {
    this.state.lines.forEach(line=>{
      line.setMap(this.state.map)
    })
  }

  render() {
    return (
      <div>
        <button onClick={this.hideLines}> hide lines </button>
        <button onClick={this.newLines}> show lines </button>
        <Nav username={this.props.username}/>

        <NewParkingInfo
        classname={this.state.isSubmitInfoOpen ? 'parking-info': 'parking-info-hide'}
        onCondChange={this.setCond}
        dynline={this.state.dynline}
        polyline={this.state.polyline}
        onSubmit={this._handleInfoSubmit}
        onChange={this.setPolyWithKey}
        clearPoly={this.clearPoly}
        />

        <ParkingInfo
        classname={this.state.isInfoOpen ? 'parking-info': 'parking-info-hide'}
        onClick={this.setCond}
        polyline={this.state.polyline}
        onRatingSubmit={this._handleRatingSubmit}
        onChange={this.setPolyWithKey}
        showInputBox={this.state.isShowInputBox}
        onCommentSubmit={this._handleCommentSubmit}
        />

        <div className='map-container'>
          < Map
          coords={this.state.infofromserver}
          setCond={this.setCond}
          setPoly={this.setPoly}
          clearPoly={this.clearPoly}
          addLine={this.addLine}
          setMap={this.setMap}
          />
        </div>
      </div>
    );
  }
}

export default App;
