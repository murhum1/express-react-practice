import React from 'react'
import Paper from 'material-ui/Paper'


export default class GameArea extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <Paper zDepth={2} style={{float: 'left', width:'100%', height: '100%', padding: '10px'}}>
        In this room: <br/><br/>
        {
          this.props.people.map(function(name) {
            return <div key={Math.random()}>{name}</div>
          })
        }
      </Paper>
    )
  }
}