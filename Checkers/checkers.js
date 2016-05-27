"use strict";

var game = new Board();

$(document).ready(function() {
	makeBoard();
	placePieces();
	$(document).on("mouseenter", ".piece", highlightMovable);
	$(document).on("mouseleave", ".piece", resetNormal);
	$(document).on("click", ".piece", selectPiece);
	$(document).on("click", ".possibleSpot", movePiece);
	$(document).on("click", ".possibleJump", jumpPiece);
});

function makeBoard() {
	var board = document.createElement("table");
	for (var i = 0; i < 8; i++) {
		var row = document.createElement("tr");
		for (var j = 0; j < 8; j++) {
			var spot = document.createElement("td");
			$(spot).attr("id", (j + 1) + "_" + (-i + 8));
			if ((i + j) % 2 == 1) {
				$(spot).addClass("dark");
			} else {
				$(spot).addClass("light");
			}
			$(row).append(spot);
		}
		$(board).append(row);
	}
	$("#board").append(board);
}

function placePieces() {
	for (var i = 1; i <= 2; i++) {
		for (var j = 1; j <= 8; j++) {
			if ((i + j) % 2 == 0) {
				game.placePiece(new Piece("goldenrod", true, j, i), j, i);
			} else {
				game.placePiece(new Piece("purple", false, j, i), j, -i + 9);
			}
		}
	}
}

function highlightMovable() {
	var coords = getCoords($(this).parent().attr("id"));
	var piece = game.getPiece(coords[0], coords[1]);
	if (piece.isPlayer1sPiece == game.isPlayer1sTurn) {
		if (piece.movable() || piece.canJump()) {
			$(this).addClass("selected");
		}
	}
}

function selectPiece() {
	var coords = getCoords($(this).parent().attr("id"));
	clearOld();
	game.selectedPiece = game.getPiece(coords[0], coords[1]);
	selectSpots();
	selectJumps();
}

function clearOld() {
	// remove old selection
	if (game.selectedPiece != null) {
		$("#" + game.selectedPiece.x + "_" + game.selectedPiece.y).children().removeClass("selected");
		var spots = game.selectedPiece.getPossibleSpots();
		for (var i = 0; i < spots.length; i++) {
			var spot = $("#" + spots[i][0] + "_" + spots[i][1]);
			spot.removeClass("possibleSpot");
			if (spots[i][0] + spots[i][1] % 2 != 0) {
				spot.addClass("dark");
			} else {
				spot.addClass("light");
			}
		}
		var jumps = game.selectedPiece.getPossibleJumps();
		for (var i = 0; i < jumps.length; i++) {
			var spot = $("#" + jumps[i][0] + "_" + jumps[i][1]);
			spot.removeClass("possibleJump");
			if (jumps[i][0] + jumps[i][1] % 2 != 0) {
				spot.addClass("dark");
			} else {
				spot.addClass("light");
			}		
		}			
	}
}


function selectSpots() {
	// select new piece/spots
	if (game.selectedPiece.isPlayer1sPiece == game.isPlayer1sTurn) {
		if (game.selectedPiece.movable() || game.selectedPiece.canJump()) {
			$(this).addClass("selected");
			var spots = game.selectedPiece.getPossibleSpots();
			for (var i = 0; i < spots.length; i++) {
				var spot = $("#" + spots[i][0] + "_" + spots[i][1]);
				spot.addClass("possibleSpot");
				if (spots[i][0] + spots[i][1] % 2 != 0) {
					spot.removeClass("dark");
				} else {
					spot.removeClass("light");
				}		
			}
		}		
	}
}

function selectJumps() {
	if (game.selectedPiece.isPlayer1sPiece == game.isPlayer1sTurn) {
		if (game.selectedPiece.movable() || game.selectedPiece.canJump()) {
			var jumps = game.selectedPiece.getPossibleJumps();
			for (var i = 0; i < jumps.length; i++) {
				var spot = $("#" + jumps[i][0] + "_" + jumps[i][1]);
				spot.addClass("possibleJump");
				if (jumps[i][0] + jumps[i][1] % 2 != 0) {
					spot.removeClass("dark");
				} else {
					spot.removeClass("light");
				}		
			}			
		}	
	}
}

function resetNormal() {
	var coords = getCoords($(this).parent().attr("id"));
	var piece = game.getPiece(coords[0], coords[1]);
	if (piece != game.selectedPiece) {
		$(this).removeClass("selected");
	}
}

function getCoords(rawClass) {
	var rawCoords = rawClass.split("_");
	var coords = [parseInt(rawCoords[0]), parseInt(rawCoords[1])];
	return coords;
}

function movePiece() {
	var moveTo = getCoords($(this).attr("id"));
	var moveFrom = [game.selectedPiece.x, game.selectedPiece.y];
	game.takeTurn(moveFrom[0], moveFrom[1], moveTo[0], moveTo[1], false);
}

function jumpPiece() {
	var moveTo = getCoords($(this).attr("id"));
	var moveFrom = [game.selectedPiece.x, game.selectedPiece.y];
	var between = getBetween(moveFrom, moveTo);
	if (game.isPlayer1sTurn) {
		game.player1Score++;
	} else {
		game.player2Score++;
	}

	// save to reset as selected piece if can jump again
	var oldSelectedPiece = game.selectedPiece;
	game.removePiece(between[0], between[1]);
	game.takeTurn(moveFrom[0], moveFrom[1], moveTo[0], moveTo[1], true);
	
	// if it can jump again
	if (oldSelectedPiece.canJump()) {
		// reselect it as the selected piece
		game.selectedPiece = oldSelectedPiece;
		// highlight only the jump spots
		selectJumps();
	} else {
		// gross hack to get it to switch turns
		game.takeTurn(moveTo[0], moveTo[1], moveTo[0], moveTo[1], false);
	}
}

// finds the coords of the spot between the given pairs of coords
function getBetween(from, to) {
	var resultX = (from[0] + to[0]) / 2;
	var resultY = (from[1] + to[1]) / 2;
	return [resultX, resultY];
}

function Board() {
	this.board = new Array(8);
	for (var i = 0; i < this.board.length; i++) {
		this.board[i] = new Array(8);
		for (var j = 0; j < this.board[i].length; j++) {
			this.board[i][j] = null;
		}
	}
	this.selectedPiece = null;
	this.selectedSpots = null;
	this.isPlayer1sTurn = true;
	this.numTurns = 0;
	this.player1Score = 0;
	this.player2Score = 0;

	this.removePiece = function(x, y) {
		if (!this.inBounds(x, y)) {
			return false;
		} else {
			var realX = x - 1;
			var realY = -y + 8;
			var piece = this.board[realX][realY];
			this.board[realX][realY] = null;
			piece.x = null;
			piece.y = null;
			this.drawBoard();
			return piece;
		}
	};

	this.placePiece = function(piece, x, y) {
		if (!this.inBounds(x, y)) {
			return false;
		} else {
			var realX = x - 1;
			var realY = -y + 8;
			this.board[realX][realY] = piece;
			piece.x = x;
			piece.y = y;
			this.drawBoard();
		}
	};

	this.takeTurn = function(xFrom, yFrom, xTo, yTo, jump) {
		var piece = this.removePiece(xFrom, yFrom);
		this.placePiece(piece, xTo, yTo);
		if (!jump) {
			this.isPlayer1sTurn = !this.isPlayer1sTurn;
			this.numTurns++;
			var turn = "";
			if (game.gameOver()) {
				$("#turn").text("Congrats! You won!");
			} else if (game.isPlayer1sTurn) {
				$("#turn").text("It's player 1's turn");
			} else {
				$("#turn").text("It's player 2's turn");
			}
		}
		$("#player1Score").text(game.player1Score);
		$("#player2Score").text(game.player2Score);
		console.log(this.gameOver());
	};

	this.getPiece = function(x, y) {
		if (!this.inBounds(x, y)) {
			return false;
		} else {
			var realX = x - 1;
			var realY = -y + 8;
			return this.board[realX][realY];
		}
	};

	this.inBounds = function(x, y) {
		return x >= 1 && x <= 8 && y >= 1 && y <= 8;
	};

	// checks if game is over by seeing if only one teams' pieces remain
	this.gameOver = function() {
		var seenPlayer1 = false;
		var seenPlayer2 = false;
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				if (this.board[i][j] != null) {
					if (this.board[i][j].isPlayer1sPiece) {
						seenPlayer1 = true;
					} else {
						seenPlayer2 = true;
					}
				}
				if (seenPlayer1 && seenPlayer2) {
					return false;
				}
			}
		}
		return true;
	};

	this.drawBoard = function() {
		game.selectedPiece = null;
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				var piece = this.board[j][i];
				var x = j + 1;
				var y = -i + 8;
				var spot = $("#" + x + "_" + y);
				$(spot).removeClass("possibleSpot");
				$(spot).removeClass("possibleJump");
				if (x + y % 2 != 0) {
					$(spot).addClass("dark");
				} else {
					$(spot).addClass("light");
				}
				if (piece != null) { // we should draw a piece there
					if ($(spot).children().length == 0 || 
					  		(piece.x != x || piece.y != y)) { // the spot is empty or the piece is in the wrong place
						$(spot).empty();
						var physicalPiece = document.createElement("div");
						$(physicalPiece).addClass("piece");
						$(physicalPiece).css("background-color", piece.color);
						if (piece.king) {
							$(physicalPiece).css("border-color", "gold");
						}
						$(spot).append(physicalPiece);
					} else { // the piece is in the right spot, reset some styles
						var physicalPiece = $(spot).children()[0];
						$(physicalPiece).removeClass("selected");
					}
				} else {
					$(spot).empty();
				}
			}
		}
	};
}

function Piece(color, player, x, y) {
	this.isPlayer1sPiece = player;
	this.color = color;
	this.king = false;
	this.x = x;
	this.y = y;

	this.kingMe = function() {
		this.king = true;
		game.drawBoard();
	};

	this.unKingMe = function() {
		this.king = false;
		game.drawBoard();
	};

	this.movable = function() {
		return this.getPossibleSpots().length > 0;
	};

	this.canJump = function() {
		return this.getPossibleJumps().length > 0;
	};

	this.getPossibleSpots = function() {
		var result = [];
		if (this.isPlayer1sPiece) {
			var checkY = this.y + 1;
			var checkX = this.x + 1;
			if (game.getPiece(checkX, checkY) == null) {
				result.push([checkX, checkY]);
			}
			var checkX = this.x - 1;
			if (game.getPiece(checkX, checkY) == null) {
				result.push([checkX, checkY]);
			}
			if (this.king) {
				checkY = this.y - 1;
				if (game.getPiece(checkX, checkY) == null) {
					result.push([checkX, checkY]);
				}
				checkX = this.x + 1;
				if (game.getPiece(checkX, checkY) == null) {
					result.push([checkX, checkY]);
				}
			}
		} else {
			var checkY = this.y - 1;
			var checkX = this.x + 1;
			if (game.getPiece(checkX, checkY) == null) {
				result.push([checkX, checkY]);
			}
			var checkX = this.x - 1;			
			if (game.getPiece(checkX, checkY) == null) {
				result.push([checkX, checkY]);
			}
			if (this.king) {
				checkY = this.y + 1;
				if (game.getPiece(checkX, checkY) == null) {
					result.push([checkX, checkY]);
				}
				checkX = this.x + 1;
				if (game.getPiece(checkX, checkY) == null) {
					result.push([checkX, checkY]);
				}
			}
		}
		return result;
	};

	this.getPossibleJumps = function() {
		var result = [];
		if (this.isPlayer1sPiece) {
			var checkY = this.y + 1;
			var checkX = this.x + 1;
			if (game.getPiece(checkX, checkY) != null && !game.getPiece(checkX, checkY).isPlayer1sPiece) {
				if (game.getPiece(checkX + 1, checkY + 1) == null) {
					result.push([checkX + 1, checkY + 1]);
				}
			}
			var checkX = this.x - 1;
			if (game.getPiece(checkX, checkY) != null && !game.getPiece(checkX, checkY).isPlayer1sPiece) {
				if (game.getPiece(checkX - 1, checkY + 1) == null) {
					result.push([checkX - 1, checkY + 1]);
				}
			}
			if (this.king) {
				checkY = this.y - 1;
				if (game.getPiece(checkX, checkY) != null && !game.getPiece(checkX, checkY).isPlayer1sPiece) {
					if (game.getPiece(checkX - 1, checkY - 1) == null) {
						result.push([checkX - 1, checkY - 1]);
					}
				}
				checkX = this.x + 1;
				if (game.getPiece(checkX, checkY) != null && !game.getPiece(checkX, checkY).isPlayer1sPiece) {
					if (game.getPiece(checkX + 1, checkY - 1) == null) {
						result.push([checkX + 1, checkY - 1]);
					}
				}
			}
		} else {
			var checkY = this.y - 1;
			var checkX = this.x + 1;
			if (game.getPiece(checkX, checkY) != null && game.getPiece(checkX, checkY).isPlayer1sPiece) {
				if (game.getPiece(checkX + 1, checkY - 1) == null) {
					result.push([checkX + 1, checkY - 1]);
				}
			}
			var checkX = this.x - 1;
			if (game.getPiece(checkX, checkY) != null && game.getPiece(checkX, checkY).isPlayer1sPiece) {
				if (game.getPiece(checkX - 1, checkY - 1) == null) {
					result.push([checkX - 1, checkY - 1]);
				}
			}
			if (this.king) {
				checkY = this.y + 1;
				if (game.getPiece(checkX, checkY) != null && game.getPiece(checkX, checkY).isPlayer1sPiece) {
					if (game.getPiece(checkX - 1, checkY + 1) == null) {
						result.push([checkX - 1, checkY + 1]);
					}
				}
				checkX = this.x + 1;
				if (game.getPiece(checkX, checkY) != null && game.getPiece(checkX, checkY).isPlayer1sPiece) {
					if (game.getPiece(checkX + 1, checkY + 1) == null) {
						result.push([checkX + 1, checkY + 1]);
					}
				}
			}
		}
		return result;
	};
}

