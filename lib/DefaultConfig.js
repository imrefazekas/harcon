let emptyLogFn = function () { console.log( arguments ) }

let dummyLogger = {
	dummy: true
}

let logFnNames = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']
logFnNames.forEach(function ( name ) {
	dummyLogger[name] = emptyLogFn
})

module.exports = {
	name: 'Harcon',
	logger: dummyLogger,
	bender: {
		enabled: false,
		entity: './FireBender',
		forced: true,
		privileged: [ 'FireBender', 'Inflicter', 'Mortar' ],
		igniteTermination: true
	},
	callStackExtension: {
		level: 1,
		enabled: true
	},
	igniteLevel: 'info',
	unfoldAnswer: true,
	suppressing: false,
	idLength: 32,
	blower: {
		commTimeout: 2000,
		tolerates: [ ]
	},
	mortar: {
		enabled: true,
		folder: '',
		liveReload: false,
		liveReloadTimeout: 5000,
		pattern: ''
		//, matcher: function (filePath) { }
	},
	connectedDivisions: [ ]
}
