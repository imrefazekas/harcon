var Inflicter = require('../lib/Inflicter');

var inflicter = new Inflicter( { idLength: 32 } );

var claire = {
	name: 'claire',
	context: 'dire',
	bonjour: function(greetings1, callback){
		callback( null, 'Bonjour!' );
	}
};
var claireFS = inflicter.addicts( claire );

setTimeout( function(){
	inflicter.ignite( '', 'dire.bonjour', function(err, res){
		console.log( '::::::::::::', err, res );
	} );
 }, 1000);
/*
var marie = {
	name: 'marie',
	context: 'morning',
	simple: function(greetings1, greetings2, ignite, callback){
		console.log( ignite.toString() );
		ignite( 'dire.bonjour', 'Say bonjour!', function(err, res){
			callback(err, res[0]);
		} );
	}
};
var marieFS = inflicter.addicts( marie );*/
/*
var julie = {
	name: 'julie',
	context: 'morning',
	wakeup: function( ignite, callback ){
		ignite( 'morning.simple', 'It is morning!', 'Time to wake up!', function(err, res){
			callback(err, res[0]);
		} );
	}
};
var julieFS = inflicter.addicts( julie );*/
/*
inflicter.ignite( 'morning.wakeup', function(err, res){
	console.log( '>>>>>>>>>>', err, res );
} );*/
/*
var karl = {
	name: 'karl',
	context: 'morning',
	enter: function( ){
		this.ignite( 'dire.bonjour', 'Ca vas?', function(err, res){
			console.log( '>>>>>>', err, res );
		} );
	}
};
var karlFS = inflicter.addicts( karl );
karl.enter();*/

/*
inflicter.addict('peter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'Hi there!');
} );
inflicter.addict('walter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'My pleasure!');
} );
inflicter.addict('steve', 'gentle.greetings', function(ignite, callback){
	ignite( 'greet.all', 'Hi!', 'Hello!', function(err, res){
		callback(err, res);
	} );
} );

inflicter.ignite( 'gentle.greetings', function(err, res){
	console.log( err, res );
} );
*/
//setTimeout( function(){ console.log(':::', inflicter.listeners()); }, 1000);

setTimeout( function(){ inflicter.close(); }, 2000);