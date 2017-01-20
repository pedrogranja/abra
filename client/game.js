/* Game room control */

function showGame(userPlayer) {
	// hide("intro");
	// show("game");
	util.transition("intro", "game");
	showPlayer(userPlayer);
}

function playAgain(userPlayer) {
	connect(userPlayer);

	util.transition("stats", "game");
	document.getElementById("text").innerHTML = "";
	document.getElementById("room-name").textContent = "";
	document.getElementById("status").innerHTML = "";
	document.getElementById("players").innerHTML = "";
	document.querySelector("#stats-table tbody").innerHTML = "";
	userPlayer.reset();

	showPlayer(userPlayer);
	showStatus("Connecting to server...");
}

function showPlayer(player) {
	var li = document.createElement("li");
	li.textContent = player.name;
	li.style.color = player.color;
	li.id = player.id;
	document.getElementById("players").appendChild(li);
}

function showNewRoom(room) {
	document.getElementById("room-name").textContent = room.name;

	// Show the players already in the room
	for (var i = 0; i < room.players.length; i++) {
		room.players[i] = Player.from(room.players[i]);
		showPlayer(room.players[i]);
	}
}

function showStatus(status) {
	document.getElementById("status").textContent = status;
}

function showRoomStatus(statusCode, room) {
	if (statusCode === "foundroom") {
		if (room.timeLeft <= 0) return;

		showStatus("Finding players... " + room.timeLeft);

		room.timer = setInterval(function () {
			room.timeLeft--;
			if (room.timeLeft) {
				showStatus("Finding players... " + room.timeLeft);
			} else {
				clearInterval(room.timer);
				room.timer = undefined;
				showStatus("Game starting... ");
			}
		}, 1000, room);

	} else if (statusCode === "gamestart") {
		if (room.readyTime <= 0) return;

		if (room.timer) {
			clearInterval(room.timer);
			room.timer = undefined;
		}

		showStatus("Start in " + room.readyTime);
		room.timer = setInterval(function () {
			room.readyTime--;
			if (room.readyTime) {
				showStatus("Start in " + room.readyTime);
			} else {
				clearInterval(room.timer);
				room.timer = undefined;
				showStatus("Go!");
			}
		}, 1000, room);
	}
}

function showPreGame(room, text, userPlayer) {
	// Show text (a <span> for each letter)
	for (var i = 0; i < text.length; i++) {
		var span = document.createElement("span");
		span.textContent = text[i];
		span.players = []; // save the players on that span
		document.getElementById("text").appendChild(span);
	}
	for (var i = 0; i < room.players.length; i++) {
		room.players[i].typed(0);
	}
	userPlayer.typed(0);
}

var inputListener;
var keydownListener;
var blurListener;
var clickListener;
function startGame(room, socket, text, userPlayer) {
	var input = document.getElementById("input");
	
	 // Clear the input field, to ensure that the "input" event is triggered
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
		keypress(this.value, room, socket, text, userPlayer);
		this.value = "";
	});

	room.startTime = new Date();
}

function keypress(char, room, socket, text, userPlayer) {
	var span = document.getElementById("text").children[userPlayer.pos];
	if (char === text[userPlayer.pos]) {
		userPlayer.typed(userPlayer.pos + 1);
		span.setAttribute("name","written");
	} else {
		// Wrong keypress
		userPlayer.errors++;

		span.id = "wrong";
		setTimeout(function() {
			span.id = "";
		}, 100);

		return;
	}

	if (userPlayer.pos === text.length) {
		userPlayer.endTime = new Date() - room.startTime;
		socket.emit("finish", {
			time: (userPlayer.endTime / 1000),
			errors: userPlayer.errors
		});
		finishGame();
	} else {
		socket.emit("typed", {
			pos: userPlayer.pos
		});
	}
}

function finishGame() {
	var input = document.getElementById("input");
	input.removeEventListener("input", inputListener);
	input.removeEventListener("keydown", keydownListener);
	input.removeEventListener("blur", blurListener);
}

function endGame() {
	// hide("game");
	// show("stats");
	util.transition("game", "stats");
}

function genStats(stats) {
	var table = document.getElementById("stats-table").tBodies[0];

	for (var row = 0; row < stats.length; row++) {
		var tr = table.insertRow();
		tr.classList.add("border-bottom");
		tr.style.borderBottomColor = stats[row][4];
		var td = tr.insertCell();
		td.textContent = row + 1;

		for (var col = 0; col < 4; col++) {
			var td = tr.insertCell();
			if (col === 0) td.style.color = stats[row][4];
			td.textContent = stats[row][col];
		}
	}
}
