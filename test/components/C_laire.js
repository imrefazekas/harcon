module.exports = {
	name: 'Claire',
	division: 'click',
	context: 'greet',
	init: function (options) {
		console.log('Init...', options);
	},
	// Simple service function listening to the greet.usual message where greet comes from context and usual is identified by the name of the fuction.
	usual: function (callback) {
		callback(null, 'Enchanté, mon plaisir!');
	},
	simple: function (greetings1, greetings2, callback) {
		callback( null, 'Pas du tout!' );
	}
};
