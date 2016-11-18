import ReactDOM from 'react-dom'
import React from 'react';
import {List, ListItem} from 'material-ui/List';
import {Link} from 'react-router'

List.contextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export default class extends React.Component {

	updateRooms(data) {
		this.setState({rooms: data.rooms});
	}

	componentDidMount() {

		const c = this;
		c.setState({rooms: null}, function() {
			const socket = c.props.socket;
			c.updateRoomsListener = c.updateRooms.bind(c);
			socket.on('updateRooms', c.updateRoomsListener);

			var getRooms = new Request('/rooms');

			return fetch(getRooms)
				.then(function(response) {
					return response.json();
				})
				.then(function(rooms) {
					c.setState({rooms: rooms});
				}.bind(c))
		})
	}

	componentWillUnmount() {
		this.props.socket.removeListener('updateRooms', this.updateRoomsListener);
	}

	render() {
		if (!this.state || !this.state.rooms) {
			return <div>Loading...</div>
		}
		else {
			const rooms = this.state.rooms;
			const listItems = rooms.map((room) => {
				const primaryText = "Room " + room.id;
				const gameRunningText = (room.game.started ? " - Game started" : "")
				const secondaryText = room.currentPeople + "/" + room.maxPeople + " playing" + gameRunningText;
				const link = <Link key={room.id} to={"rooms/" + room.id}><ListItem primaryText={primaryText} secondaryText={secondaryText} /></Link>
				return link;
			})
			const list = (
			    <List>
			    	{listItems}
			    </List>
			)

			return list;
		}
	}

	
}