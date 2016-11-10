import ReactDOM from 'react-dom'
import React from 'react';
import GameChat from './GameChat'

export default class Room extends React.Component {

	componentWillMount() {
		var c = this;
		var socket = c.props.socket.emit('joinRoom', {roomId: c.props.routeParams.roomId})
	}

	componentWillUnmount() {
		var c = this;
		c.props.socket.emit('leaveRoom', {roomId: c.props.routeParams.roomId});
	}

	render() {
		return (
			<div>
				<div></div>
				<GameChat socket={this.props.socket} />
			</div>
		)
	}
	
}