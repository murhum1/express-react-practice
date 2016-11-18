import React from 'react'
import Paper from 'material-ui/Paper'


export default class GameArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    this.props.socket.on('gameStatus', function(game) {
      this.setState({game: game})
    }.bind(this))
  }

  getScore(name) {
    if (!this.state.game || !this.state.game.started) return 0;
    return this.state.game.sets[name];
  }

  render() {
    var c = this;
    const sortedPeople = _.sortBy(this.props.people, function(name) {
      return c.getScore(name);
    })
    const peopleDivs = sortedPeople.map(function(name) {
            return <div key={Math.random()}>{name} ({this.getScore(name)})</div>
          }.bind(this))
    return (
      <Paper zDepth={2} style={{float: 'left', width:'100%', height: '100%', padding: '10px'}}>
        In this room: <br/><br/>
        {
          peopleDivs
        }
      </Paper>
    )
  }
}