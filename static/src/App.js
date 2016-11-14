import React from 'react'

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


export default React.createClass({
  componentWillMount() {
    var socket = io.connect('/');
    this.setState({socket: socket});
  },

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        {
          React.cloneElement(this.props.children, {socket: this.state.socket})
        }
      </MuiThemeProvider>
    )
  }
})