/* "stats" screen */

function showStats(stats) {
	let table = document.getElementById("stats-table").tBodies[0];

	for (let row = 0; row < stats.length; row++) {
		let tr = table.insertRow();
		tr.classList.add("border-bottom");
		tr.style.borderBottomColor = stats[row][4];
		let td = tr.insertCell();
		td.textContent = row + 1;

		for (let col = 0; col < 4; col++) {
			td = tr.insertCell();
			if (col === 0) td.style.color = stats[row][4];
			td.textContent = stats[row][col];
		}
	}

	util.transition("game", "stats");
	document.getElementById("again-button").focus();
}
