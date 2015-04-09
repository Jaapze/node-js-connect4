$(function(){
	var socket = io.connect();
	var player = {};
	var yc = $('.your_color');
	var your_turn = false;

	socket.emit('join', {room: 'test12'});

	socket.on('assign', function(data) {
		player.pid = data.pid;
		player.hash = data.hash;
		if(player.pid == "1"){
			yc.addClass('red');
			player.color = 'red';
			player.oponend = 'yellow';
		}else{
			yc.addClass('yellow');
			player.color = 'yellow';
			player.oponend = 'red';
		}
	});

	socket.on('start', function(data) {
		console.debug('GO');
		your_turn = true;
	});

	socket.on('stop', function(data) {
		socket.emit('join', {room: 'test12'});
		console.log('Other player left the game');
	});

	socket.on('move_made', function(data) {
		make_move(data.col+1, true);
		your_turn = true;
	});

	$('.cols > .col').mouseenter(function(){
		if(your_turn){
			yc.addClass('show');
			yc.css('left', $(this).index()*100);
		}
	});

	$('.cols > .col').mouseleave(function(){
		yc.removeClass('show');
	});

	$('.cols > .col').click(function(){
		if(your_turn){
			var col = $(this).index()+1;
			make_move(col);
			socket.emit('makeMove', {col: col-1, hash: player.hash});
			your_turn = false;
			yc.removeClass('show');
		}
	});

	function make_move(col, other){
		if(!other) other = false;
		var col_elm = $('.cols > .col#col_'+col);
		var current_in_col = parseInt(col_elm.attr('data-in-col'));
		col_elm.attr('data-in-col', current_in_col+1);
		var color = (other) ? player.oponend : player.color;
		var new_coin = $('<div class="coin '+color+'" id="col_'+(5-current_in_col)+''+(col-1)+'"></div>');
		col_elm.append(new_coin);
		new_coin.animate({
			top : 100*(4-current_in_col+1),
		}, 400);
	}

});