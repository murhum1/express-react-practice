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

	return _.omit(room.game, 'deck');
}

function _getGame(roomId) {
	var room = _.find(Rooms.rooms, function(room) {
		return room.id == roomId;
	});

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

	var id = 1;
	_.forEach(deck, function(card) {
		card.id = id;
		id++;
	})

	var room = _.find(Rooms.rooms, function(room) {
		return room.id == roomId;
	});

	room.game.deck = deck;

	room.game.started = true;

	var sockets = getRoomSockets(roomId);

	room.game.sets = {};
	_.forEach(sockets.sockets, function(id) {
		room.game.sets[people[id]] = 0; 
	})

	room.game.activeCards = room.game.deck.splice(0, 12);
}

Rooms.validateSet = function(roomId, set) {
	var attributes = {
		color: [],
		number: [],
		shape: [],
		fill: []
	};
	_.forEach(set, function(card) {
		_.forEach(attributes, function(attrArray, key) {
			attributes[key].push(card[key]);
		})
	});

	var setIsValid = _.every(attributes, function(attr) {
		var allSame = _.uniq(attr).length === 1;
		var allDiffer = _.uniq(attr).length === 3;
		return (allSame || allDiffer);
	})

	return setIsValid;
}

Rooms.processSet = function(clientId, roomId, set) {
	var game = _getGame(roomId);
	_.forEach(set, function(card) {
		var index = _.findIndex(game.activeCards, function(activeCard) {
			return card.color === activeCard.color &&
				   card.number === activeCard.number &&
				   card.shape === activeCard.shape &&
				   card.fill === activeCard.fill;
		})
		game.activeCards.splice(index, 1, game.deck.pop());
	})

	game.sets[people[clientId]] += 1;
}

module.exports = Rooms