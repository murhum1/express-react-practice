var _ = require('lodash');
var people = require('./People')

var Rooms = {};

var CARD_COLORS = ['green', 'red', 'blue'];
var CARD_NUMBERS = [1, 2, 3];
var CARD_SHAPES = ['S', 'oval', 'diamond'];
var CARD_FILLS = ['empty', 'striped', 'full'];

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

Rooms.rooms = [
	{id: 1, maxPeople: 8, game: { started: false }},
	{id: 2, maxPeople: 8, game: { started: false }},
	{id: 3, maxPeople: 8, game: { started: false }}
]

Rooms.getRooms = function() {
	var rooms = _.map(Rooms.rooms, function(room) {
		return Rooms.getRoom(room.id);
	})
	return rooms;
}

function getRoomSockets(roomId) {
	var sockets = _.clone(Rooms.io.sockets.adapter.rooms["rooms/" + roomId] || {length: 0});
	sockets.sockets = _.keys(sockets.sockets);
	return sockets;
}

Rooms.getRoom = function(roomId) {
	var room = _.find(Rooms.rooms, function(room) {
		return room.id == roomId;
	});
	var socketRoom = getRoomSockets(roomId);
	var returnedRoom = _.clone(room);
	returnedRoom.currentPeople = socketRoom.length;
	delete returnedRoom.game;
	returnedRoom.names = _.map(socketRoom.sockets, function(socketId) {
		return people[socketId];
	})
	return returnedRoom;
}

Rooms.assignGameOwner = function(roomId, ownerId) {
	var room = _.find(Rooms.rooms, function(room) {
		return room.id == roomId;
	});
	room.game.owner = ownerId;
}

Rooms.getGame = function(roomId) {
	var room = _.find(Rooms.rooms, function(room) {
		return room.id == roomId;
	});

	delete room.game.deck;

	return room.game;
}

Rooms.playerLeft = function(socketId) {
	_.forEach(Rooms.rooms, function(room) {
		if (room.game.owner === socketId) {
			var roomSockets = getRoomSockets(room.id);
			if (roomSockets.length) {
				room.game.owner = roomSockets[0];
			}
			else {
				room.game.owner = undefined;
			}
		}
	})
}

Rooms.startGame = function(roomId) {
	var deck = [];
	_.forEach(CARD_COLORS, function(color) {
		_.forEach(CARD_NUMBERS, function(number) {
			_.forEach(CARD_SHAPES, function(shape) {
				_.forEach(CARD_FILLS, function(fill) {
					deck.push({
						color: color,
						number: number,
						shape: shape,
						fill: fill
					})
				})
			})
		})
	})

	deck = shuffle(deck);

	var room = _.find(Rooms.rooms, function(room) {
		return room.id == roomId;
	});

	room.game.deck = deck;

	room.game.started = true;

	var socketIds = getRoomSockets(roomId);

	room.game.participants = _.map(socketIds, function(id) {
		return {
			name: people[id],
			sets: 0
		}
	})

	room.game.activeCards = room.game.deck.splice(0, 12);
}

module.exports = Rooms