const colors = ["red", "blue", "green", "yellow", "MediumOrchid", "cyan", "PaleGreen", "DarkSalmon", "HotPink", "Orange"];
const nbColors = 2;
const boardSize = 8; // Change this to adjust the size of the board
const emptyCell = { color: "white", removed: false };

let board = [];
let score = 0;
let nbEffectiveColors;

const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");

function createBoard()
{
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

let inMethodStill = false;

function removeTiles(startingTile)
{
	const queue = [startingTile];
	const color = startingTile.color;
	const tilesToRemove = [];

	console.log("Removing tile " + inMethodStill);
	inMethodStill = true;

	while (queue.length > 0)
	{
		const currentTile = queue.pop();

		if (
			currentTile &&
			!currentTile.removed &&
			currentTile.color === color
		)
		{
			currentTile.removed = true;
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
			tile.style.backgroundColor = emptyCell.color;
			tile.removed = true;
		});

		// Update score
		score += Math.floor(Math.pow(tilesToRemove.length, 1.5));
		scoreDisplay.textContent = score;

		// Collapse columns
		for (let col = 0; col < boardSize; col++)
		{
			const column = board.map((row) => row[col]);
			const nonEmpty = column.filter((tile) => !tile.removed);


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

			if (nonEmpty.length == 0)
			{
				// Empty column, we need to remove it
				for (let colToRemove = col; colToRemove < boardSize - 1; colToRemove++)
				{
					for (let rowToRemove = 0; rowToRemove < boardSize; rowToRemove++)
					{
						board[rowToRemove][colToRemove] = board[rowToRemove][colToRemove + 1];
					}
				}
				// And remove the left-most column
				for (let rowToDelete = 0; rowToDelete < boardSize; rowToDelete++)
				{
					board[rowToDelete][boardSize - 1] = createEmptyTile();
				}
			}
		}

		renderBoard();
		checkWinLose();
	}
	inMethodStill = false;
}

function checkWinLose()
{
	// The board is empty -> Win (score bonus)
	// No 2 tiles of the same colors adjacent -> Lose
	let isWin = true;
	let isLost = true;

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
		gameBoard.appendChild(document.createElement("br"));
	}
	if (isWin)
	{
		score += 10 * boardSize * nbEffectiveColors;
		alert("Congratulations! You cleared the board! Final score: " + score);
		resetGame();
	}
	else if (isLost)
	{
		alert("Game over, no more possible choices! Final score: " + score);
		resetGame();
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

function resetGame()
{
	board = [];
	score = 0;
	scoreDisplay.textContent = score;
	createBoard();
	renderBoard();
}