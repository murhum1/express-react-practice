import React from 'react'


export default React.createClass({
  componentWillMount() {
    var socket = io.connect('/');
    this.setState({socket: socket});
  },

  render() {
    return (
      <div>
        {
          React.cloneElement(this.props.children, {socket: this.state.socket})
        }
      </div>
    )
  }
})