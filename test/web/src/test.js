var Inflicter = require('../../../lib/Inflicter');

var inflicter = new Inflicter( { idLength: 32 } );

inflicter.addict('peter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'Hi there!');
} );

inflicter.addict('walter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'My pleasure!');
} );

setTimeout( function(){
	inflicter.ignite( 'greet.simple', 'whatsup?', 'how do you do?', function(err, res){
		console.log( err, res );
	} );
}, 3000 );
