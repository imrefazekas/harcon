let emptyLogFn = function () { console.log( arguments ) }

let dummyLogger = {
	dummy: true
}
let logFnNames = ['info', 'debug', 'error', 'silly', 'warn', 'verbose', 'log']
logFnNames.forEach(function ( name ) {
	dummyLogger[name] = emptyLogFn
})

module.exports = {
	name: 'Harcon',
	logger: dummyLogger,
	bender: {
		enabled: false,
		entity: './FireBender'
	},
	callStackExtension: {
		level: 1,
		enabled: true
	},
	igniteLevel: 'info',
	unfoldAnswer: false,
	idLength: 32,
	blower: {
		commTimeout: 2000,
		tolerates: [ ]
	},
	connectedDivisions: [ ]
}
