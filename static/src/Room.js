import ReactDOM from 'react-dom'
import React from 'react';
import GameChat from './GameChat'
import Dialog from 'material-ui/Dialog'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import GameArea from './GameArea'

export default class Room extends React.Component {

	constructor(props) {
		super(props);

		var noName = !this.props.socket.name || this.props.socket.name.indexOf('Guest') > -1;
		this.state = {nameModalOpen: noName, inputName: "", people: []}

		this.handleClose = this.handleClose.bind(this);
		this.inputNameChange = this.inputNameChange.bind(this);
	}

	handleClose(data) {
		var c = this;
		c.setState({nameModalOpen: false}, function() {
			c.props.socket.emit('joinRoom', {roomId: c.props.routeParams.roomId, name: c.state.inputName})
		})
	}

	inputNameChange(event) {
		this.setState({
			inputName: event.target.value
		})
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.routeParams.roomId !== nextProps.routeParams.roomId) {
			this.props.socket.emit('leaveRoom', {roomId: this.props.routeParams.roomId});
			this.setState({nameModalOpen: true, inputName: ""})
		}
	}

	componentDidMount() {
		this.props.socket.on('updateRooms', function(rooms) {
			var room = _.find(rooms.rooms, function(room) {
				return room.id == this.props.routeParams.roomId
			}.bind(this));
			this.setState({people: room.names});
		}.bind(this))
	}

	componentWillUnmount() {
		var c = this;
		c.props.socket.emit('leaveRoom', {roomId: c.props.routeParams.roomId});
	}

	render() {
		var c = this;
		return (
			<div>
				<MuiThemeProvider muiTheme={getMuiTheme()}>
			        <Dialog
			          modal={false}
			          open={this.state.nameModalOpen}
			          onRequestClose={c.handleClose}
			        >
			        <form onSubmit={c.handleClose}>
						Choose your name (or join as guest):<br/>
						<TextField
							placeholder="Name"
							id="inputNameField"
							value={c.state.inputName}
							onChange={c.inputNameChange}
						>
						</TextField>
						<RaisedButton style={{margin:'10px'}} label={"Join room"} type="submit" primary={true}></RaisedButton>
			          </form>
			        </Dialog>
		        </MuiThemeProvider>
				<GameArea socket={this.props.socket} people={this.state.people}></GameArea>
				<GameChat socket={this.props.socket} roomId={c.props.routeParams.roomId} />
			</div>
		)
	}
	
}