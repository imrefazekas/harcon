module.exports = {
	name: 'marie',
	context: 'greet',
    init: function( options ){
        console.log('Init...', options);
    },
	// Simple service function listening to the morning.simple message where morning comes from context and simple is identified by the name of the fuction.
	simple: function(greetings1, greetings2, callback){
		this.greetings = [ greetings1, greetings2 ];
		callback( null, 'Bonjour!' );
	}
};