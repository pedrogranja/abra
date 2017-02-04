const PROTOCOL = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const PORT = window.location.port ? ':' + window.location.port : '';
const WS_SERVER = PROTOCOL + window.location.hostname + PORT + '/abra';

function initPlayer() {
	let selectedColor = document.querySelector("#color-box > .selected-color");

	let user = new Player(
		document.querySelector("#getname").value,
		window.getComputedStyle(selectedColor).getPropertyValue('background-color'),
		USER_ID
	);

	connect(user);

	let againButton = document.getElementById("again-button");
	againButton.addEventListener("click", playAgain(user));

	showGame(user);
}

function connect(user) {
	let socket = new WebSocket(WS_SERVER);

	manageSocketEvents(socket, user);

	socket.addEventListener('open', function () {
		socket.send(JSON.stringify({
			event: 'newPlayer',
			name: user.name,
			color: user.color
		}));
	});
}

function manageSocketEvents(socket, user) {
	let room;

	socket.addEventListener('message', function(message) {
		data = JSON.parse(message.data);

		switch (data.event) {
			case 'foundRoom':
				room = Room.from(data);
				showNewRoom(room);
				showRoomStatus("foundroom", room);
				room.players.push(user);
				break;

			case 'playerEntered':
				player = Player.from(data);
				room.players.push(player);
				showPlayer(player);
				break;

			case 'startGame':
				room.players = room.players.slice();
				setTimeout(startGame, room.readyTime*1000, room, socket, data.text, user);
				showPreGame(room, data.text, user);
				showRoomStatus("gamestart", room);
				break;

			case 'playerTyped':
				var player = util.findPlayer(data.id, room.players);
				if (!player) return;
				player.typed(data.pos);
				break;

			case 'endGame':
				endGame();
				genStats(data.stats, room);
				break;

			case 'playerDisconnected':
				var i = util.findPlayerIndex(data.id, room.players);
				var player = room.players[i];
				room.players.splice(i, 1); // remove from players
				player.typed(-1); // hide cursor
				document.getElementById(player.id).remove(); // Remove from lobby list
				break;

			default:
				break;
		}
	});

	socket.addEventListener('error', console.log);
}
