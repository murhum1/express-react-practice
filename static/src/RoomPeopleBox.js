import React from 'react'
import Paper from 'material-ui/Paper'
import globals from './globals'

export default class GameArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = {failTimers: {}}
    this.failIntervals = {};
  }

  componentDidMount() {
    var socket = this.props.socket;
    var c = this;
    socket.on('gameStatus', function(game) {
      c.setState({game: game})
    })

    socket.on('failSet', function(data) {
      var timers = c.state.failTimers;
      timers[data.failure] = globals.FAIL_SET_IGNORE_TIME;
      c.setState({ failTimers: timers }, function() {
        c.failIntervals[data.failure] = setInterval(function() {
          if (c.state.failTimers[data.failure] === 0) {
            clearInterval(c.failIntervals[data.failure]);
            delete c.state.failTimers[data.failure];
            c.setState({failTimers: c.state.failTimers})
          }
          else {
            c.state.failTimers[data.failure] -= 1;
            c.setState({failTimers: c.state.failTimers})
          }
        }, 1000);
      })
    })
  }

  getScore(name) {
    if (!this.state.game || !this.state.game.started) return 0;
    return this.state.game.sets[name];
  }

  getFailTimer(name) {
    return this.state.failTimers[name];
  }

  render() {
    var c = this;
    const sortedPeople = _.sortBy(this.props.people, function(name) {
      return c.getScore(name);
    })
    const peopleDivs = sortedPeople.map(function(name) {
            return (
              <div key={Math.random()}>
                {name} ({this.getScore(name)}) <span style={{color:'red'}}>{this.getFailTimer(name)}</span>
              </div>
            )
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