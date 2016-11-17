var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var _ = require('lodash');

var settings = require('./settings.js');
var path = require('path')


var people = require('./People.js')
var Rooms = require('./Rooms.js')
Rooms.io = io;

app.use(express.static(settings.STATIC_DIR));
app.use('/node_modules', express.static('node_modules'))

app.get('/', function(req, res) {
	return res.sendFile(path.join(__dirname, 'static/index.html'))
})

app.get('/rooms', function(req, res) {
	var rooms = Rooms.getRooms();
	return res.json(rooms);
})


io.on('connection', function(client) {
	console.log("Client connected, id: ", client.id);

	client.on('joinRoom', function(data) {
		people[client.id] = data.name || "Guest#" + randomIntBetween(1000, 9999);
		var roomName = 'rooms/' + data.roomId;
		client.join(roomName);
		if (!Rooms.getGame(data.roomId).owner) {
			Rooms.assignGameOwner(data.roomId, client.id);
		}
		io.to(roomName).emit('message', {timestamp: new Date(), server: true, message: people[client.id] + " has joined the room!"});
		client.emit('gameStatus', Rooms.getGame(data.roomId))
		io.emit('updateRooms', {rooms: Rooms.getRooms()});
	})

	client.on('leaveRoom', function(data) {
		var roomName = 'rooms/' + data.roomId;
		client.leave(roomName);
		io.to(roomName).emit('message', {timestamp: new Date(), server: true, message: people[client.id] + " has left the room."})
		io.emit('updateRooms', {rooms: Rooms.getRooms()});
	})

	client.on('messageSent', function(message) {
		var room = _.find(client.rooms, function(room) {
			return room.indexOf('rooms/') > -1;
		})
		io.to(room).emit('message', {timestamp: new Date(), sender: people[client.id], message: message});
	})

	client.on('startGame', function(roomId) {
		var roomName = 'rooms/' + roomId;
		Rooms.startGame(roomId);
		var game = Rooms.getGame(roomId);
		if (client.id === game.owner) {
			io.to(roomName).emit('gameStatus', Rooms.getGame(roomId))
		}
	})

	client.on('submitSet', function(data) {
		var setIsValid = Rooms.validateSet(client.id, data.roomId, data.set);
		if (setIsValid) {
			io.to('rooms/' + data.roomId).emit('correctSet', {
				scorer: people[client.id],
				set: data.set,
				timestamp: new Date()
			})
			setTimeout(function() {
				Rooms.processSet(data.roomId, data.set);
				var game = Rooms.getGame(roomId);
				io.to('rooms/' + data.roomId).emit('gameStatus', game);
			}, 1000);
		}
		else {
			io.to('rooms/' + data.roomId).emit('failSet', {
				failure: people[client.id]
			})
		}
	})

	client.on('disconnect', function(data) {
		Rooms.playerLeft(client.id);
		io.sockets.emit('updateRooms', {rooms: Rooms.getRooms()})
	})
})

server.listen(settings.PORT_NUMBER, function() {
	console.log("Server running at port " + settings.PORT_NUMBER);
});

function randomIntBetween(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}