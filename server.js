//server needs
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	port = Number(process.env.PORT || 3000),
	io = require('socket.io').listen(server);

server.listen(port);

/*routing*/
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/img", express.static(__dirname + '/img'));

app.get('/', function(req, res){
	res.writeHead(302, {
		'Location': '/'+generateHash(6)
	});
	res.end();
	/*res.sendFile(__dirname+'/index.html');*/
})

app.get('/:room([A-Za-z0-9]{6})', function(req, res) {
	console.log('now:'+req.params.room);
	res.sendFile(__dirname+'/index.html');
});

/*game*/
var games = {};

function generateHash(length) {
	var haystack = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		output = '';
	for(var i = 0; i < length; i++) {
		output += haystack.charAt(Math.floor(Math.random() * haystack.length));
	}
	return output;
};

function check_for_win(board){
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

function make_move(board, col, pid){
	var move_made = false;
	for(var i = board.length-1; i >= 0; i--){
		if(board[i][col] == 0){
			board[i][col] = pid;
			move_made = true;
			break;
		}
	}
	return move_made;
}

io.sockets.on('connection', function(socket){

	socket.on('join', function(data){
		if(data.room in games){
			if(typeof games[data.room].player2 != 'undefined'){
				console.log('second user trys to login');
				return;
			}
			console.log('player 2 logged on');
			socket.join(data.room);
			socket.room = data.room;
			socket.pid = 2;
			socket.hash = generateHash(8);
			games[data.room].player2 = socket;
			socket.opponent = games[data.room].player1;
			games[data.room].player1.opponent = socket;
			socket.emit('assign', {pid: socket.pid, hash: socket.hash});
			games[data.room].turn = 1;
			socket.broadcast.to(data.room).emit('start');
		}else{
			console.log('player 1 logged on');
			socket.join(data.room);
			socket.room = data.room;
			socket.pid = 1;
			socket.hash = generateHash(8);
			games[data.room] = {
				player1: socket,
				board: [[0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0],
						[0,0,0,0,0,0,0]]
			}
			socket.emit('assign', {pid: socket.pid, hash: socket.hash});
		}

		socket.on('makeMove', function(data){
			if(data.hash = socket.hash && games[socket.room].turn == socket.pid){
				make_move(games[socket.room].board, data.col, socket.pid);
				socket.broadcast.to(socket.room).emit('move_made', {pid: socket.pid, col: data.col});
				games[socket.room].turn = socket.opponent.pid;
			}
			console.log(games[socket.room].board);
			console.log(check_for_win(games[socket.room].board));
		});

		socket.on('disconnect', function () {
			delete games[socket.room];
			io.to(socket.room).emit('stop');
			console.log('room closed: '+socket.room);
		});
	});
});