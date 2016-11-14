import ReactDOM from 'react-dom'
import React from 'react';
import TextField from 'material-ui/TextField';
import moment from 'moment'
import Paper from 'material-ui/Paper';
import ReactGridLayout from 'react-grid-layout'

TextField.contextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export default class Room extends React.Component {

	initState(props) {
		this.state = {value: "", messages: []}
	}

	constructor(props) {
		super(props);
		this.state = {value: '', messages: []}
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

	componentWillReceiveProps(nextProps) {
		if (this.props.roomId && this.props.roomId !== nextProps.roomId) {
			this.initState(nextProps)
		}
	}

	componentWillUnmount() {
		var c = this;
	}

	renderMessage(message) {
		if (message.server) {
			return <span style={{color: 'gray'}}>{message.message}</span>
		}
		else {
			return message.sender + ": " + message.message;
		}
	}

	render() {
		const c = this;
		return (
			<ReactGridLayout className="layout" cols={1} rowHeight={300} width={1200}>
				<div key="a" data-grid={{x: 0, y: 0, w: 1, h: 1, static: true}}>
					<Paper zDepth={2} style={{width: '100%', height:'100%', padding: '15px'}}>
						<div style={{height:'200px', 'overflow': 'none', position: 'relative', width: '100%'}}>
							<div id="chatMessages" style={{position:'absolute', bottom: 0, maxHeight:'200px', overflow: 'auto', width: '100%'}}>
								{c.state.messages.map((message) => {
									return	(
											<p style={{margin: '5px auto'}} key={message.timestamp.getTime()}>							
												{
													c.renderMessage(message)
												}
											</p>
									)
								})}
							</div>
						</div>
						<form onSubmit={c.onSubmit.bind(c)}>
							<TextField
								placeholder="Type to chat!"
								style={{width: '100%'}}
								id="gameChatTextField"
								value={c.state.value}
								onChange={c.handleChange.bind(c)}
							/>
						</form>
					</Paper>
				</div>
			</ReactGridLayout>
		)
	}
	
}