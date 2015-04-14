//server needs
var express = require('express'),
	game_logic = require('./game_logic'),
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
			console.log('player 1 is here');
			if(socket.rooms.indexOf(data.room) <= 0) socket.join(data.room);
			socket.room = data.room;
			socket.pid = 1;
			socket.hash = generateHash(8);
			games[data.room] = {
				player1: socket,
				moves: 0,
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
				var move_made = make_move(games[socket.room].board, data.col, socket.pid);
				if(move_made){
					games[socket.room].moves = parseInt(games[socket.room].moves)+1;
					socket.broadcast.to(socket.room).emit('move_made', {pid: socket.pid, col: data.col});
					games[socket.room].turn = socket.opponent.pid;
					var winner = game_logic.check_for_win(games[socket.room].board);
					if(winner){
						io.to(socket.room).emit('winner', {winner: winner});
					}
					if(games[socket.room].moves >= 42){
						io.to(socket.room).emit('draw');
					}
				}
			}
		});

		socket.on('my_move', function(data){
			socket.broadcast.to(socket.room).emit('opponent_move', {col: data.col});
		})

		socket.on('disconnect', function () {
			if(socket.room in games){
				delete games[socket.room];
				io.to(socket.room).emit('stop');
				console.log('room closed: '+socket.room);
			}else{
				console.log('disconnect called but nothing happend');
			}
		});
	});
});