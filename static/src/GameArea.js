import React from 'react'
import RoomPeopleBox from './RoomPeopleBox'
import PlayArea from './PlayArea'


export default class GameArea extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{width:'100%', height:'600px'}}>
        <RoomPeopleBox people={this.props.people}></RoomPeopleBox>
        <PlayArea></PlayArea>
      </div>
    )
  }
}