$(function(){
	var socket = io.connect();
	var player = {};
	var yc = $('.your_color');

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
		console.log('Second player joined the game, lets GO');
		if(player.pid === 1){
			yc.removeClass('hidden');
		}
	});

	socket.on('stop', function(data) {
		console.log('Other player left the game');
	});

	$('.cols > .col').mouseenter(function(){
		yc.css('left', $(this).index()*100);
	});

	$('.cols > .col').click(function(){
		if(!yc.hasClass('hidden')){
			var col = $(this).index()+1;
			make_move(col);
			socket.emit('makeMove', {col: col-1});
		}
	});

	function make_move(col, other){
		if(!other) other = false;
		var col_elm = $('.cols > .col#col_'+col);
		var current_in_col = parseInt(col_elm.attr('data-in-col'));
		col_elm.attr('data-in-col', current_in_col+1);
		var color = (other) ? player.oponend : player.color;
		var new_coin = $('<div class="coin '+color+'"></div>');
		col_elm.append(new_coin);
		new_coin.animate({
			top : 100*(4-current_in_col+1),
		}, 400, function() {
		
		});
	}

});