/* Entry point. */

const STORE_USER_COLOR= "userColor";
const COLOR_PALETTE_LENGTH = 21;

// Show the user's color from last time
let colorBox = document.getElementById("color-box");
recallPreviousColor(colorBox);

// Bind the start button to initPlayer
let startButton = document.getElementById("start-button");
startButton.addEventListener("click", initPlayer);

// Focus the name input field
let getname = document.getElementById("getname");
getname.focus();
// Bind Enter on the <input> to START button
getname.addEventListener("keyup", function (e) {
	if (e.key == "Enter") {
		startButton.click();
	}
});
