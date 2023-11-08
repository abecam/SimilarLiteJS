const colors = ["red", "blue", "green", "yellow", "MediumOrchid", "cyan", "PaleGreen", "DarkSalmon", "HotPink", "Orange"];
let nbColors = 4;
let boardSize = 10; // Change this to adjust the size of the board
const emptyCell = { color: "white", removed: false };

let board = [];
let score = 0;
let nbEffectiveColors;
let highscore = 0;

const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");

function createBoard(newBoardSize = 4, newNbColors = 10)
{
	nbColors = newNbColors;
	boardSize = newBoardSize;

	for (let row = 0; row < boardSize; row++)
	{
		const rowTiles = [];
		for (let col = 0; col < boardSize; col++)
		{
			const tile = createTile();
			tile.row = row;
			tile.col = col;
			rowTiles.push(tile);
		}
		board.push(rowTiles);
	}
}

function createTile()
{
	nbEffectiveColors = (nbColors > colors.length) ? colors.length : nbColors;
	const color = colors[Math.floor(Math.random() * nbEffectiveColors)];
	const tile = document.createElement("div");
	tile.className = "tile";
	tile.style.backgroundColor = color;
	tile.color = color;
	tile.removed = false;
	tile.style.width = 400 / boardSize + "px";
	tile.style.height = 400 / boardSize + "px";

	tile.addEventListener("click", () => removeTiles(tile));
	//tile.addEventListener("mouseover", () => showTilesToRemove(tile));

	return tile;
}

function createEmptyTile()
{
	const tile = document.createElement("div");
	tile.className = "tile";
	tile.removed = true;
	tile.style.backgroundColor = emptyCell.color;
	tile.style.border = "1px solid #0fff";
	tile.style.cursor = "default";
	tile.style.width = 400 / boardSize + "px";
	tile.style.height = 400 / boardSize + "px";

	return tile;
}

function renderBoard()
{
	gameBoard.innerHTML = "";
	for (let row = board.length - 1; row >= 0; row--)
	{
		for (let col = 0; col < board[row].length; col++)
		{
			const tile = board[row][col];
			gameBoard.appendChild(tile);
		}
		gameBoard.appendChild(document.createElement("br"));
	}
}

function removeTiles(startingTile)
{
	const queue = [startingTile];
	const color = startingTile.color;
	const tilesToRemove = [];

	while (queue.length > 0)
	{
		const currentTile = queue.pop();

		if (
			currentTile &&
			!currentTile.removed && !currentTile.toremove &&
			currentTile.color === color
		)
		{
			currentTile.toremove = true;
			tilesToRemove.push(currentTile);

			const row = currentTile.row;
			const col = currentTile.col;

			// Check adjacent tiles
			const neighbors = [
				[row - 1, col], // top
				[row + 1, col], // bottom
				[row, col - 1], // left
				[row, col + 1], // right
			];

			neighbors.forEach(([r, c]) =>
			{
				if (
					r >= 0 &&
					r < boardSize &&
					c >= 0 &&
					c < boardSize
				)
				{
					queue.push(board[r][c]);
				}
			});
		}
	}

	if (tilesToRemove.length > 1)
	{
		// Remove tiles
		tilesToRemove.forEach((tile) =>
		{
			//tile.style.backgroundColor = emptyCell.color;
			tile.style.border = "2px dotted #009f";
			tile.innerHTML = tile.row + "," + tile.col;
			tile.toremove = true;
		});

		// Update score

		score += (tilesToRemove.length - 1) * (tilesToRemove.length) / 2;

		scoreDisplay.textContent = score;

		let nbTry = 0;
		// Collapse columns
		for (let col = 0; col < boardSize; col++)
		{
			const column = board.map((row) => row[col]);
			const nonEmpty = column.filter((tile) => !tile.toremove);
			console.debug(nonEmpty);

			for (let row = 0; row < boardSize; row++)
			{
				if (row < nonEmpty.length)
				{
					board[row][col] = nonEmpty[row];
					board[row][col].row = row;
					board[row][col].col = col;
				} else
				{
					// Better to create a new tile, so we don't risk using a non-empty tile (still referenced there)
					board[row][col] = createEmptyTile();
					board[row][col].style.border = "1px solid #f0ff";
				}
			}
		}

		// Now remove the empty columns
		for (let col = 0; col < boardSize; col++)
		{
			const column = board.map((row) => row[col]);
			const nonEmptyNow = column.filter((tile) => !tile.removed);

			if (nonEmptyNow.length == 0 && nbTry < 100)
			{
				nbTry++;
				console.debug("Removing column " + col);
				// Empty column, we need to remove it
				for (let colToRemove = col; colToRemove < boardSize - 1; colToRemove++)
				{
					for (let rowToRemove = 0; rowToRemove < boardSize; rowToRemove++)
					{
						board[rowToRemove][colToRemove] = board[rowToRemove][colToRemove + 1];
						board[rowToRemove][colToRemove].col = colToRemove;
					}
				}
				// And remove the left-most column
				for (let rowToDelete = 0; rowToDelete < boardSize; rowToDelete++)
				{
					board[rowToDelete][boardSize - 1] = createEmptyTile();
				}
				// But now we need to go back one column!
				col--;
			}
		}

		renderBoard();
		checkWinLose();
	}
}

let isWin = false;
let isLost = false;

function checkWinLose()
{
	// Only if not already in win/lose situation
	if (!isWin && !isLost)
	{
		isWin = true;
 		isLost = true;
		// The board is empty -> Win (score bonus)
		// No 2 tiles of the same colors adjacent -> Lose

		for (let row = board.length - 1; row >= 0; row--)
		{
			for (let col = 0; col < board[row].length; col++)
			{
				const tile = board[row][col];
				const color = board[row][col].color;

				if (!tile.removed)
				{
					isWin = false;

					const neighbors = [
						[row - 1, col], // top
						[row + 1, col], // bottom
						[row, col - 1], // left
						[row, col + 1], // right
					];

					neighbors.forEach(([r, c]) =>
					{
						if (
							r >= 0 &&
							r < boardSize &&
							c >= 0 &&
							c < boardSize
						)
						{
							if (!board[r][c].removed && board[r][c].color === color)
							{
								isLost = false;
							}
						}
					});
					if (!isLost)
					{
						break;
					}
				}
				if (!isLost)
				{
					break;
				}
			}
		}
		if (isWin)
		{
			score += 1000 * boardSize * nbEffectiveColors;
			document.getElementById("message").innerHTML = "Congratulations! You cleared the board! Final score: " + score;
		}
		else if (isLost)
		{
			let nbLeft = 0;

			for (let row = board.length - 1; row >= 0; row--)
			{
				for (let col = 0; col < board[row].length; col++)
				{
					const tile = board[row][col];

					if (!tile.removed)
					{
						nbLeft++;
					}
				}
			}
			if (nbLeft < 5)
			{
				score += 100 * boardSize * nbEffectiveColors;
				document.getElementById("message").innerHTML = "Game over, no more possible choices! Less than 5 tiles remaining, good job! Final score: " + score;
			}
			else
			{
				document.getElementById("message").innerHTML = "Game over, no more possible choices! Final score: " + score;
			}
		}
		if ((isWin || isLost) && score > highscore)
		{
			highscore = score;
			document.getElementById("message").innerHTML = document.getElementById("message").innerHTML +"<br>New High Score!";
		}
	}
}

function showTilesToRemove(startingTile)
{
	const queue = [startingTile];
	const color = startingTile.color;
	const tilesToRemove = [];

	while (queue.length > 0)
	{
		const currentTile = queue.pop();

		if (
			currentTile &&
			!currentTile.preremoved &&
			currentTile.color === color
		)
		{
			currentTile.preremoved = true;
			tilesToRemove.push(currentTile);

			const row = currentTile.row;
			const col = currentTile.col;

			// Check adjacent tiles
			const neighbors = [
				[row - 1, col], // top
				[row + 1, col], // bottom
				[row, col - 1], // left
				[row, col + 1], // right
			];

			neighbors.forEach(([r, c]) =>
			{
				if (
					r >= 0 &&
					r < boardSize &&
					c >= 0 &&
					c < boardSize
				)
				{
					queue.push(board[r][c]);
				}
			});
		}
	}

	if (tilesToRemove.length > 1)
	{
		// Remove tiles
		tilesToRemove.forEach((tile) =>
		{
			tile.style.border = "4px solid #f00";
			tile.preremoved = true;
		});

		// Collapse columns
		for (let col = 0; col < boardSize; col++)
		{
			for (let row = 0; row < boardSize; row++)
			{
				if (!board[row][col].preremoved)
				{
					board[row][col].style.border = "1px solid #000";
				}
			}
		}

		for (let col = 0; col < boardSize; col++)
		{
			for (let row = 0; row < boardSize; row++)
			{
				board[row][col].preremoved = false;
			}
		}

		renderBoard();
	}
}

function resetGame(newBoardSize = 4, newNbColors = 10)
{
	isWin = false;
	isLost = false;
	board = [];
	score = 0;
	scoreDisplay.textContent = score;
	document.getElementById("message").innerHTML = "High score = " + highscore;
	createBoard(newBoardSize, newNbColors);
	renderBoard();
}