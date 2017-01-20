const WS_SERVER = window.location.href;
const WORD_SIZE = 5;

function initPlayer() {
	var player = new Player(
		document.querySelector("#getname").value,
		document.querySelector("#getcolor > .selected-color").value,
		USER_ID
	);

	var socket = connect(player);

	var againButton = document.getElementById("again-button");
	againButton.addEventListener("click", function (e) {
		playAgain(player);
		socket.emit("findroom", {});
	});

	showGame(player);
}

function connect(player) {
	var socket = io(WS_SERVER);

	manageSocketEvents(socket, player);

	socket.emit("newplayer", {
		name: player.name,
		color: player.color
	});

	socket.emit("findroom", {});

	return socket;
}

function manageSocketEvents(socket, userPlayer) {
	var room;

	socket.on("foundroom", function (foundRoom) {
		room = Room.from(foundRoom);
		showNewRoom(room);
		showRoomStatus("foundroom", room);
		room.players.push(userPlayer);
	});

	socket.on("playerentered", function (player) {
		player = Player.from(player);
		room.players.push(player);
		showPlayer(player);
	});

	socket.on("gamestart", function (text) {
		room.players = room.players.slice();
		setTimeout(startGame, room.readyTime*1000, room, socket, text, userPlayer);
		showPreGame(room, text, userPlayer);
		showRoomStatus("gamestart", room);
	});

	socket.on("typed", function (data) {
		var player = util.findPlayer(data.id, room.players);
		if (!player) return;
		player.typed(data.pos);
	});

	socket.on("end", function (stats) {
		endGame();
		genStats(stats, room);
	});

	socket.on("disconnected", function(data) {
		var i = util.findPlayerIndex(data.id, room.players);
		var player = room.players[i];
		room.players.splice(i,1); // remove from players
		player.typed(-1); // hide cursor
		document.getElementById(player.id).remove(); // Remove from lobby list
	})
}
