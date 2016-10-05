let Proback = require('proback.js')
let async = require('async')

module.exports = {
	name: 'FireBender',
	auditor: true,
	bender: true,
	init: function (options, callback) {
		this.harconlog( null, 'FireBender initiated...', options, 'info' )
		this.options = options
		this.defs = this.options.defs || {}
		callback()
	},
	addExecution: function (event, type, primers, callback) {
		this.defs[ event ] = { type: type, primers: primers }
	},
	removeExecution: function (event, callback) {
		delete this.defs[ event ]
	},
	spreadFire: function ( primers, res, terms, ignite, callback ) {
		let self = this
		let promises = []
		primers.forEach( function (primer) {
			promises.push( ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res ) )
		} )
		Proback.forAll( promises, callback, 'ok' )
	},
	seriesFire: function ( primers, res, terms, ignite, callback ) {
		let self = this
		let fns = []
		primers.forEach( function (primer) {
			fns.push( terms.erupt()( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res ) )
		} )
		async.series( fns, callback )
	},
	waterfallFire: function ( primers, res, terms, ignite, callback ) {
		let self = this
		let fns = []
		primers.forEach( function (primer) {
			if (fns.length === 0) {
				fns.push( terms.erupt()( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res ) )
			} else {
				fns.push( function (res, cb) {
					ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res[0], cb )
				} )
			}
		} )
		async.waterfall( fns, callback )
	},
	exec: function ( division, event, parameters, terms, ignite, callback ) {
		if ( !this.defs[event] ) return callback( new Error('Unknown event to trigger: ' + event) )

		let self = this
		let action = self.defs[event]

		let as = [ terms.sourceComm.externalId, terms.sourceComm.flowId, division || self.division, event ]
		Array.prototype.push.apply( as, parameters )
		as.push( function (err, res) {
			if (err) return callback(err)
			self[ action.type + 'Fire' ]( action.primers || [], res[0], terms, ignite, callback )
		} )
		ignite.apply( self, as )
	}
}
