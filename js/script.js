$(function(){
	var socket = io.connect(),
	player = {},
	yc = $('.your_color'),
	your_turn = false,
	url = window.location.href.split('/'),
	room = url[url.length-1];

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
			yc.addClass('yellow');
			player.color = 'yellow';
			player.oponend = 'red';
		}
	});

	socket.on('start', function(data) {
		your_turn = true;
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
		your_turn = true;
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

	function init(){
		socket.emit('join', {room: room});
		$('.popover input').val(window.location.href);
		$('.popover h2').html('Waiting for opponent');
		$('.popover p').html('Give the url to a friend to play a game');
	}

	function reset_board()
	{
		$('.cols .col').attr('data-in-col', '0').html('');
		yc.removeClass('yellow red');
		yc.removeClass('show');
	}

	$('.popover button').click(function(){
		$('.popover input').select();
	});

	$('.popover input').click(function(){
		 $(this).select();
	});

});