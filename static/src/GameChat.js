import ReactDOM from 'react-dom'
import React from 'react';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import moment from 'moment'

TextField.contextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export default class Room extends React.Component {


	constructor(props) {
		super(props);
		this.state = {value: 'Hello World!', messages: [{timestamp: new Date(), sender: "None", message: "Lol"}]}
	}

	handleChange(event) {
		this.setState({
			value: event.target.value,
		});
	};

	onSubmit() {
		const socket = this.props.socket;
		const message = this.state.value;
		socket.emit('messageSent', message);
		this.setState({value: ""})
	}

	componentWillMount() {
		const c = this;
		const socket = c.props.socket;

		socket.on('message', function(message) {
			message.timestamp = new Date(message.timestamp);
			var currentMessages = c.state.messages;
			currentMessages.push(message);
			c.setState({messages: currentMessages}, function() {
				var element = document.getElementById("chatMessages");
				element.scrollTop = element.scrollHeight;
			});
		})
	}

	componentWillUnmount() {
		var c = this;
	}

	render() {
		const c = this;
		return (
			<div style={{width: '100%'}}>
				<div style={{height:'200px', 'overflow': 'none', position: 'relative', width: '100%'}}>
					<div id="chatMessages" style={{position:'absolute', bottom: 0, maxHeight:'200px', overflow: 'auto', width: '100%'}}>
						{c.state.messages.map((message) => {
							return	(
									<p style={{margin: '5px auto'}} key={message.timestamp.getTime()}>
										<span style={{color: 'gray', marginRight:'15px'}}>{moment(message.timestamp).format('HH:mm:ss')}</span>

										{message.sender}: {message.message}
									</p>
							)
						})}
					</div>
				</div>
				<form onSubmit={c.onSubmit.bind(c)}>
					<MuiThemeProvider muiTheme={getMuiTheme()}>
						<TextField
							style={{width: '100%'}}
							id="gameChatTextField"
							value={c.state.value}
							onChange={c.handleChange.bind(c)}
						/>
					</MuiThemeProvider>
				</form>
			</div>
		)
	}
	
}