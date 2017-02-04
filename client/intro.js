const COOKIE_USER_COLOR= "userColor";
const COLOR_PALETTE_LENGTH = 21;

let colorBox = document.getElementById("color-box");
recallPreviousColor(colorBox);

let startButton = document.getElementById("start-button");
startButton.addEventListener("click", initPlayer);

// Focus the name input field
let getname = document.getElementById("getname");
getname.focus();

// Bind Enter to START button
getname.addEventListener("keyup", function (e) {
	if (e.key == "Enter") {
		startButton.click();
	}
});

// Color selection handler.
function selectColor() {
	let prevColor = document.querySelector("#color-box > .selected-color");
	prevColor.classList.remove("selected-color");

	this.classList.add("selected-color");
	util.setCookie(COOKIE_USER_COLOR, this.value);
}

// Remember the user's last color.
function recallPreviousColor(colorBox) {
	let box;
	for (let i = 0; i < COLOR_PALETTE_LENGTH; i++) {
		box = colorBox.children[i];
		box.addEventListener("click", selectColor);
		box.value = i;
	}

	let cachedColor = util.getCookie(COOKIE_USER_COLOR);
	if (!cachedColor) {
		cachedColor = Math.floor(Math.random() * COLOR_PALETTE_LENGTH);
	}
	colorBox.children[cachedColor].classList.add("selected-color");
}
