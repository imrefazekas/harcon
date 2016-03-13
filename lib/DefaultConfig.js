var emptyLogFn = function () { console.log( arguments ) }

var dummyLogger = { }
var logFnNames = ['info', 'debug', 'error', 'silly', 'warn', 'verbose', 'log']
logFnNames.forEach(function ( name ) {
	dummyLogger[name] = emptyLogFn
})

module.exports = {
	name: 'Harcon',
	logger: dummyLogger,
	idLength: 32,
	blower: {
		commTimeout: 2000,
		tolerates: [ ]
	},
	connectedDivisions: [ ]
}
