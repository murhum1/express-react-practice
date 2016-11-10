var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var _ = require('lodash');

var settings = require('./settings.js');
var path = require('path')


var Rooms = require('./Rooms.js')
Rooms.io = io;

app.use(express.static(settings.STATIC_DIR));

app.get('/', function(req, res) {
	return res.sendFile(path.join(__dirname, 'static/index.html'))
})

app.get('/rooms', function(req, res) {
	var rooms = Rooms.getRooms();
	return res.json(rooms);
})

var people = {};

io.on('connection', function(client) {
	console.log("Client connected, id: ", client.id);

	client.on('joinRoom', function(data) {
		people[client.id] = data.name || "Guest#" + randomIntBetween(1000, 9999);
		client.join('rooms/' + data.roomId);
		io.emit('updateRooms', {rooms: Rooms.getRooms()});
	})

	client.on('messageSent', function(message) {
		var room = _.find(client.rooms, function(room) {
			return room.indexOf('rooms/') > -1;
		})
		io.to(room).emit('message', {timestamp: new Date(), sender: people[client.id], message: message});
	})

	client.on('leaveRoom', function(data) {
		client.leave('rooms/' + data.roomId);
		io.emit('updateRooms', {rooms: Rooms.getRooms()});
	})

	client.on('disconnect', function(data) {
		io.sockets.emit('updateRooms', {rooms: Rooms.getRooms()})
	})
})

server.listen(settings.PORT_NUMBER, function() {
	console.log("Server running at port " + settings.PORT_NUMBER);
});

function randomIntBetween(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}