module.exports = {
	games : {},
	make_move : function(room, col, pid){
		var board = this.games[room].board;
		var move_made = false;
		for(var i = board.length-1; i >= 0; i--){
			if(board[i][col] == 0){
				board[i][col] = pid;
				move_made = true;
				break;
			}
		}
		return move_made;
	},
	check_for_win : function(board){
		var found = 0,
		winner_coins = [],
		winner = false,
		data = {},
		person = 0;
		/*horizontal*/
		for(var row = 0; row < board.length; row++){
			if(winner) break;
			found = 0;
			person = 0;
			for(var col = 0; col < board[row].length; col++){
				var selected = board[row][col];
				if(selected !== 0) found = (person != selected) ? 1 : found + 1;
				person = selected;
				if(found >= 4){
					winner = person;
					for(var k = 0; k < 4; k++){
						winner_coins[k] = row+''+(col-k);
					}
				}
				if((col > 2 && found == 0) || found >= 4) break;
			}
		}
		/*vertical*/
		if(!winner){
			for(col = 0; col < board[0].length; col++){
				if(winner) break;
				found = 0;
				person = 0;
				for(row = 0; row < board.length; row++){
					var selected = board[row][col];
					if(selected !== 0) found = (person != selected) ? 1 : found + 1;
					person = selected;
					if(found >= 4){
						winner = person;
						for(var k = 0; k < 4; k++){
							winner_coins[k] = (row-k)+''+col;
						}
					}
					if((row > 1 && found == 0) || found >= 4) break;
				}
			}
		}
		/*diagonal left-up->right*/
		if(!winner){
			for(col = 0; col < board[0].length-3; col++){
				if(winner) break;
				for(row = 0; row < board.length-3; row++){
					var first_val = board[row][col];
					if(first_val == 0) continue;
					if(	first_val === board[row+1][col+1] &&
						first_val === board[row+2][col+2] &&
						first_val === board[row+3][col+3] ){
						winner = first_val;
						winner_coins = [row+''+col,(row+1)+''+(col+1),(row+2)+''+(col+2),(row+3)+''+(col+3)];
						break;
					}
				}
			}
		}
		/*diagonal right-up->left*/
		if(!winner){
			for(col = board[0].length-1; col > 2; col--){
				if(winner) break;
				for(row = 0; row < board.length-3; row++){
					var first_val = board[row][col];
					if(first_val == 0) continue;
					if(	first_val === board[row+1][col-1] &&
						first_val === board[row+2][col-2] &&
						first_val === board[row+3][col-3] ){
						winner = first_val;
						winner_coins = [row+''+col,(row+1)+''+(col-1),(row+2)+''+(col-2),(row+3)+''+(col-3)];
						break;
					}
				}
			}
		}
		
		if(winner) {
			data.winner = winner;
			data.winner_coins = winner_coins;
			return data;
		}
		return false;
	}
}