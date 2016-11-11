var _ = require('lodash');
var people = require('./People')

var Rooms = {};

Rooms.rooms = [
	{id: 1, maxPeople: 8},
	{id: 2, maxPeople: 8},
	{id: 3, maxPeople: 8}
]

Rooms.getRooms = function() {
	var rooms = _.map(Rooms.rooms, function(room) {
		return Rooms.getRoom(room.id);
	})
	return rooms;
}

Rooms.getRoom = function(roomId) {
	var room = _.find(Rooms.rooms, function(room) {
		return room.id == roomId;
	});
	var socketRoom = Rooms.io.sockets.adapter.rooms["rooms/" + room.id] || {length: 0};
	var returnedRoom = _.clone(room);
	returnedRoom.currentPeople = socketRoom.length;
	returnedRoom.names = _.map(socketRoom.sockets, function(val, key) {
		return people[key];
	})
	return returnedRoom;
}

module.exports = Rooms