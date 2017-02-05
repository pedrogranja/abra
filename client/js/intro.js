/* "intro" screen (main screen). */

// Remember the user's last color.
function recallPreviousColor(colorBox) {
	let box;
	for (let i = 0; i < COLOR_PALETTE_LENGTH; i++) {
		box = colorBox.children[i];
		box.addEventListener("click", selectColor);
		box.value = i;
	}

	let cachedColor = window.localStorage.getItem(STORE_USER_COLOR);
	if (!cachedColor) {
		cachedColor = Math.floor(Math.random() * COLOR_PALETTE_LENGTH);
	}
	colorBox.children[cachedColor].classList.add("selected-color");
}

// Color selection handler.
function selectColor() {
	let prevColor = document.querySelector("#color-box > .selected-color");
	prevColor.classList.remove("selected-color");

	this.classList.add("selected-color");
	window.localStorage.setItem(STORE_USER_COLOR, this.value);
}

function initPlayer() {
	let selectedColor = document.querySelector("#color-box > .selected-color");
	let color = util.RGB2hex(window.getComputedStyle(selectedColor)
				.getPropertyValue('background-color'));

	let user = new Player(
		document.querySelector("#getname").value,
		color,
		USER_ID
	);

	let againButton = document.getElementById("again-button");
	againButton.addEventListener("click", () => {
		playAgain(user); // Capture the user player object.
	});

	util.transition("intro", "game");
	showGame(user);
	connect(user);
}
