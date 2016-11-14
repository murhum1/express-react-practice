import React from 'react'
import RoomPeopleBox from './RoomPeopleBox'
import PlayArea from './PlayArea'
import ReactGridLayout from 'react-grid-layout'


export default class GameArea extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ReactGridLayout className="layout" cols={4} rowHeight={600} width={1200}>
        <div style={{transition: 'none'}} key="a" data-grid={{x: 0, y: 0, w: 1, h: 1, static: true}}>
          <RoomPeopleBox people={this.props.people}></RoomPeopleBox>
        </div>
        <div style={{transition: 'none'}} key="b" data-grid={{x: 1, y: 0, w: 3, h: 1, static: true}}>
          <PlayArea socket={this.props.socket} roomId={this.props.roomId}></PlayArea>
        </div>
      </ReactGridLayout>
    )
  }
}