import React from 'react'
import RoomPeopleBox from './RoomPeopleBox'


export default class PlayArea extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{width:'900px', padding: '5px', marginLeft: '15px', float: 'left', height:'600px', border: '1px solid', borderRadius: '4px'}}>
      </div>
    )
  }
}