const PROTOCOL = (window.location.protocol === 'https:') ? 'wss://' : 'ws://';
const PORT = window.location.port ? ':' + window.location.port : '';
const WS_SERVER = PROTOCOL + window.location.hostname + PORT + '/abra';

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
	// Various events need the room.
	let room;

	socket.addEventListener('message', function(message) {
		data = JSON.parse(message.data);

		switch (data.event) {
			case 'foundRoom':
				room = Room.from(data);
				foundRoom(room, user);
				break;

			case 'playerEnteredRoom':
				playerEnteredRoom(room, Player.from(data));
				break;

			case 'startGame':
				showPreGame(room, socket, data.text, user);
				break;

			case 'playerTyped':
				playerTyped(room, data.id, data.pos);
				break;

			case 'endGame':
				showStats(data.stats);
				socket.close();
				break;

			case 'playerDisconnected':
				playerDisconnected(room, data.id);
				break;

			default:
				break;
		}
	});

	socket.addEventListener('error', console.log);
}
