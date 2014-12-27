var Inflicter = require('../../../lib/Inflicter');

var inflicter = new Inflicter( { idLength: 32 } );

inflicter.addict( null, 'peter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'Hi there!');
} );

inflicter.addict( null, 'walter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'My pleasure!');
} );

setTimeout( function(){
	inflicter.ignite( null, null, 'greet.simple', 'whatsup?', 'how do you do?', function(err, res){
		console.log( err, res );
	} );
}, 3000 );
