/* "game" screen */

function playAgain(user) {
	util.clear(document.getElementById("text"));
	util.clear(document.getElementById("room-name"));
	util.clear(document.getElementById("status"));
	util.clear(document.getElementById("players"));
	util.clear(document.querySelector("#stats-table tbody"));
	user.reset();

	util.transition("stats", "game");
	showGame(user);
	connect(user);
}

function showGame(user) {
	showNewPlayer(user);
	util.setTextOpacity(0.5);
	util.showRoomStatus("Connecting to server...");
}

function showNewPlayer(player) {
	let li = document.createElement("li");
	li.textContent = player.name;
	li.style.color = player.color;
	li.id = player.id;
	document.getElementById("players").appendChild(li);
}

function showNewRoom(room) {
	document.getElementById("room-name").textContent = room.name;

	// Show the players that were already in the room.
	for (let i = 0; i < room.players.length; i++) {
		room.players[i] = Player.from(room.players[i]);
		showNewPlayer(room.players[i]);
	}
}

function foundRoom(room, user) {
	showNewRoom(room);
	room.players.push(user);

	if (room.timeLeft === 0) {
		util.showRoomStatus("Game starting... ");
		return;
	}

	util.showRoomStatus("Finding players... " + room.timeLeft);
	room.timer = setInterval(() => {
		room.timeLeft--;
		if (room.timeLeft) {
			util.showRoomStatus("Finding players... " + room.timeLeft);
		} else {
			clearInterval(room.timer);
			room.timer = undefined;
			util.showRoomStatus("Game starting... ");
		}
	}, 1000, room); // Tick every second.
}

function playerEnteredRoom(room, player) {
	room.players.push(player);
	showNewPlayer(player);
}

function showPreGame(room, socket, text, user) {
	setTimeout(startGame, room.readyTime*1000, room, socket, data.text, user);

	// Show text (a <span> for each letter)
	// TODO: DocumentFragment?
	for (let i = 0; i < text.length; i++) {
		let span = document.createElement("span");
		span.textContent = text[i];
		// save the players on this particular span in its own object.
		span.players = [];
		document.getElementById("text").appendChild(span);
	}
	user.moveCursor(0);

	if (room.timer) {
		clearInterval(room.timer);
	}

	util.showRoomStatus("Start in " + room.readyTime + "...");
	room.timer = setInterval(() => {
		room.readyTime--;
		if (room.readyTime) {
			util.showRoomStatus("Start in " + room.readyTime + "...");
		} else {
			clearInterval(room.timer);
			room.timer = undefined;
			util.showRoomStatus("Go!");
		}
	}, 1000, room);

}

function startGame(room, socket, text, user) {
	prepareInput(room, socket, text, user);
	util.setTextOpacity(1);
	room.startTime = new Date();
}

let blurListener;
let clickListener;
let inputListener;
function prepareInput(room, socket, text, user) {
	let input = document.getElementById("hidden-input");

	// Clear the input field, to ensure that the
	// "input" event is triggered next time.
	input.value = "";

	// Always focus input box
	input.addEventListener("blur", blurListener = function (e) {
		input.focus();
	});
	window.addEventListener("click", clickListener = function (e) {
		input.focus();
	});
	input.focus();

	// Catch keypresses inside input box
	input.addEventListener("input", inputListener = function (e) {
		userKeyPress(this.value, room, socket, text, user);
		this.value = "";
	});
}

function userKeyPress(char, room, socket, text, user) {
	let span = document.getElementById("text").children[user.pos];

	if (char !== text[user.pos]) {
		// Wrong keypress
		user.errors++;
		span.classList.add('wrong');

		setTimeout(function() {
			span.classList.remove('wrong');
		}, 200);

		return;
	}

	socket.send(JSON.stringify({
		event: 'playerTyped',
		pos: user.pos
	}));

	user.moveCursor(user.pos + 1);
	user.pos++;
	span.setAttribute('written', '');

	if (user.pos === text.length) {
		finishGame(room, user, socket);
	}
}

function finishGame(room, user, socket) {
	user.endTime = new Date() - room.startTime;

	socket.send(JSON.stringify({
		event: 'playerDone',
		time: (user.endTime / 1000),
		mistakes: user.errors
	}));

	// Clear event listeners related to the <input>
	let input = document.getElementById("hidden-input");
	input.removeEventListener("blur", blurListener);
	window.removeEventListener("click", clickListener);
	input.removeEventListener("input", inputListener);
}

function playerTyped(room, playerId, pos) {
	let player = util.findPlayer(playerId, room.players);
	player.moveCursor(pos);
	player.pos = pos;
}

function playerDisconnected(room, playerId) {
	let i = util.findPlayerIndex(data.id, room.players);
	let player = room.players[i];

	room.players.splice(i, 1); // remove from room players list
	player.moveCursor(-1); // hide cursor
	document.getElementById(playerId).remove(); // Remove from lobby list
}
