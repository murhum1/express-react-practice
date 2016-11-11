import React from 'react'


export default class GameArea extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <div style={{width:'250px', height: '100%', border: '1px solid', float: 'left', 'borderRadius': '4px', padding: '5px'}}>
        In this room: <br/><br/>
        {
          this.props.people.map(function(name) {
            return <div key={Math.random()}>{name}</div>
          })
        }
      </div>
    )
  }
}