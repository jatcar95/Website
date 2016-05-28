(function() {
	$(document).ready(function() {
		$("#singlePlayer input").on("click", toggleSinglePlayerOptions);
		$("#play").on("click", setupGame);
		$("#singleplayerOptions").hide();
		$("#playerOptions").addClass("multi");
		$("#singlePlayer > input").prop("checked", false);
	});

	function toggleSinglePlayerOptions() {
		// hide error text
		$("#error").text("");

		var singlePlayerSwitch = $("#singlePlayer > input");
		var options = $("#playerOptions");
		var single = $("#singleplayerOptions");
		var multi = $("#multiplayerOptions")
		var playerNum = $("#playerNum");
		if (singlePlayerSwitch.prop("checked")) {
			// show singleplayer options
			options.addClass("single");
			options.removeClass("multi");
			playerNum.text("Single Player (not currently implemented)");
			single.show();
			multi.hide();
		} else {
			// show multiplayer options
			options.addClass("multi");
			options.removeClass("single");
			playerNum.text("Multiplayer");
			single.hide();
			multi.show();
		}
	}

	// determines whether or not the player has completed the necessary options,
	// directs them to the game if they have, shows an error otherwise
	function setupGame() {
		var singleplayer = $("#singlePlayer > input").prop("checked");
		if (singleplayer) {
			// get name
			var name = $("#singleplayerOptions input[type=text]").val();
			var difficulty;
			// get difficulty
			$("#singleplayerOptions input[name=difficulty]").each(function() {
				if ($(this).prop("checked")) {
					difficulty = $(this).val();
				}
			});
			// must show name, otherwise error
			if (name == "") {
				error("Please enter your name");
			} else {
				// start the game
				playGame(1, name);
			}
		} else {
			// get names from input boxes
			var p1Name = $("#p1").val();
			var p2Name = $("#p2").val();
			if (p1Name != "" && p2Name != "") {
				// start game
				playGame(2, p1Name, p2Name);
			} else {
				// one/both of the names are blank,
				// figure out which and display error
				if (p1Name == "" && p2Name == "") {
					error("Please enter the players' names");
				} else if (p1Name == "") {
					error("Please enter player 1's name");
				} else {
					error("Please enter player 2's name");
				}
			}
		}
	}

	// displays an error to the user
	function error(text) {
		var err = $("#error");
		err.text(text);
	}

	// starts the game by showing the board
	function playGame(numPlayers, p1Name, p2Name="Computer Overlord") {
		// construct appropriate board
		if (numPlayers == 1) {
			game = new Board(numPlayers, p1Name);
		} else {
			game = new Board(numPlayers, p1Name, p2Name);
		}
		// hide options, shows the actual game
		$("#options").hide();
		$("#playArea").show();
		// initialize board
		makeBoard();
		placePieces();
		// display correct turn info
		$("#turn").text("It's " + p1Name + "'s turn");
		$("#p1Name").text(game.p1Name);
		$("#p2Name").text(game.p2Name);
	}

})();