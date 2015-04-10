$(function(){
	var socket = io.connect(),
	player = {},
	yc = $('.your_color'),
	your_turn = false,
	url = window.location.href.split('/'),
	room = url[url.length-1];

	var text = {
		'yt' : "Your turn",
		'nyt' : "Waiting for opponent",
		'popover_h2' : "Waiting for opponent",
		'popover_p' : "Give the url to a friend to play a game",
		'popover_h2_win' : "You won the game!",
		'popover_p_win' : "Give the url to a friend to play another game",
		'popover_h2_lose' : "You lost the game",
		'popover_p_lose' : "Give the url to a friend to play another game",
	}

	init();

	socket.on('assign', function(data) {
		player.pid = data.pid;
		player.hash = data.hash;
		if(player.pid == "1"){
			yc.addClass('red');
			player.color = 'red';
			player.oponend = 'yellow';
			$('.underlay').removeClass('hidden');
			$('.popover').removeClass('hidden');
		}else{
			$('.status').html(text.nyt);
			yc.addClass('yellow');
			player.color = 'yellow';
			player.oponend = 'red';
		}
	});

	socket.on('winner', function(data) {
		change_turn(false);
		for(var i = 0; i < 4; i++){
			$('.cols .col .coin#coin_'+data.winner.winner_coins[i]).addClass('winner_coin');
		}
		if(player.pid == data.winner.winner){
			$('.popover h2').html(text.popover_h2_win);
			$('.popover p').html(text.popover_p_win);
		}else{
			$('.popover h2').html(text.popover_h2_lose);
			$('.popover p').html(text.popover_p_lose);
		}
		
		setTimeout(function(){
			$('.underlay').removeClass('hidden');
			$('.popover').removeClass('hidden');
		},2000);
	});

	socket.on('start', function(data) {
		change_turn(true);
		yc.addClass('show');
		$('.underlay').addClass('hidden');
		$('.popover').addClass('hidden');
	});

	socket.on('stop', function(data) {
		init();
		reset_board();
	});

	socket.on('move_made', function(data) {
		make_move(data.col+1, true);
		change_turn(true);
		yc.addClass('show');
	});

	$('.cols > .col').mouseenter(function(){
		if(your_turn) yc.css('left', $(this).index()*100);
	});

	$('.cols > .col').click(function(){
		if(your_turn){
			var col = $(this).index()+1;
			make_move(col);
			socket.emit('makeMove', {col: col-1, hash: player.hash});
			change_turn(false);
			yc.removeClass('show');
		}
	});

	function make_move(col, other){
		if(!other) other = false;
		var col_elm = $('.cols > .col#col_'+col);
		var current_in_col = parseInt(col_elm.attr('data-in-col'));
		col_elm.attr('data-in-col', current_in_col+1);
		var color = (other) ? player.oponend : player.color;
		var new_coin = $('<div class="coin '+color+'" id="coin_'+(5-current_in_col)+''+(col-1)+'"></div>');
		col_elm.append(new_coin);
		new_coin.animate({
			top : 100*(4-current_in_col+1),
		}, 400);
	}

	function init(){
		socket.emit('join', {room: room});
		$('.popover input').val(window.location.href);
		$('.popover h2').html(text.popover_h2);
		$('.popover p').html(text.popover_p);
		$('.status').html('');
	}

	function reset_board(){
		$('.cols .col').attr('data-in-col', '0').html('');
		yc.removeClass('yellow red');
		yc.removeClass('show');
	}

	function change_turn(yt){
		if(yt){
			your_turn = true;
			$('.status').html(text.yt);
		}else{
			your_turn = false;
			$('.status').html(text.nyt);
		}
	}

	$('.popover button').click(function(){
		$('.popover input').select();
	});

	$('.popover input').click(function(){
		 $(this).select();
	});

});