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
		}else{
			yc.addClass('yellow');
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

	$('.cell').mouseenter(function(){
		yc.css('left', $(this).index()*100);
	});

	$('.cell').click(function(){
		if(!yc.hasClass('hidden')){
			var col = $(this).index()+1;
			socket.emit('makeMove', {col: col-1});
			
		}
	});

});