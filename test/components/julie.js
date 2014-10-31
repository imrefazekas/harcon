module.exports = {
	name: 'julie',
	context: 'morning',
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	wakeup: function( ignite, callback ){
		ignite( 'greet.gentle', 'It is morning!', 'Time to wake up!', function(err, res){
			callback(err, res);
		} );
	}
};