let Proback = require('proback.js')
let async = require('async')

let _ = require('isa.js')

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
	validateFlow: function (primer, flowId, err, res) {
		let self = this
		let errMessage = err ? err.message || err.toString() : ''
		self.harconlog( null, 'Flow terminated', { flowId: flowId, err: errMessage, res: res }, 'silly' )
		if ( !self.defs[primer] ) {
			self.ignite( '', flowId, self.division, 'Inflicter.entities', '', function (err, entities) {
				if (err) return self.harconlog(err)
				entities.forEach( function (entity) {
					if (err)
						self.ignite( '', flowId, entity.division, entity.name + '.flowFailed', flowId, errMessage )
					else
						self.ignite( '', flowId, entity.division, entity.name + '.flowSucceeded', flowId, res )
				} )
			} )
		}
	},
	spreadFire: function ( primers, res, terms, ignite, callback ) {
		let self = this
		let promises = []
		primers.forEach( function (primer) {
			let event = primer.event || primer
			promises.push( ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res ) )
		} )
		Proback.forAll( promises, callback, 'ok' )
	},
	crossFire: function ( fns, primer, res, terms, ignite, callback ) {
		let self = this
		let event = primer.event || primer
		if ( primer.skipIf )
			fns.push( function (_res, cb) {
				_res = self.options.unfoldAnswer ? _res : _res[0]
				ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.skipIf, _res, function (err, ans) {
					if (err) return cb(err)
					if (ans.allowed)
						ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, _res, cb )
					else cb( null, res )
				} )
			} )
		else
			fns.push( function (_res, cb) {
				ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, self.options.unfoldAnswer ? _res : _res[0], cb )
			} )
	},
	simpleFire: function ( fns, primer, res, terms, ignite, callback ) {
		let self = this
		let event = primer.event || primer
		if ( primer.skipIf )
			if ( _.isFunction( primer.skipIf ) )
				fns.push( function (cb) {
					try {
						if ( primer.skipIf(res) )
							return ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res, cb )
						else return cb( null, res )
					} catch (err) { return cb( err ) }
				} )
			else
				fns.push( function (cb) {
					ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.skipIf, res, function (err, ans) {
						if (err) return cb(err)
						if (ans.allowed)
							ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res, cb )
						else cb( null, res )
					} )
				} )
		else
			fns.push( terms.erupt()( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res ) )
	},
	seriesFire: function ( primers, res, terms, ignite, callback ) {
		let self = this
		let fns = []

		if ( primers.length === 0 ) return callback( null, res )

		primers.forEach( function (primer) {
			self.simpleFire( fns, primer, res, terms, ignite, callback )
		} )
		async.series( fns, function (err, res) {
			if (self.options.igniteTermination)
				self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, err, res )
			callback(err, res)
		} )
	},
	waterfallFire: function ( primers, res, terms, ignite, callback ) {
		let self = this
		let fns = []

		if ( primers.length === 0 ) return callback( null, res )

		primers.forEach( function (primer) {
			if (fns.length === 0)
				self.simpleFire( fns, primer, res, terms, ignite, callback )
			else
				self.crossFire( fns, primer, res, terms, ignite, callback )
		} )
		async.waterfall( fns, function (err, res) {
			if (self.options.igniteTermination)
				self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, err, res )
			callback(err, res)
		} )
	},
	exec: function ( division, event, parameters, terms, ignite, callback ) {
		if ( !this.defs[event] ) return callback( new Error('Unknown event to trigger: ' + event) )

		let self = this
		let action = self.defs[event]

		let as = [ terms.sourceComm.externalId, terms.sourceComm.flowId, division || self.division, event ]
		Array.prototype.push.apply( as, parameters )
		as.push( function (err, res) {
			if (err) return callback(err)
			self[ (action.type || 'series') + 'Fire' ]( action.primers || [], self.options.unfoldAnswer ? res : res[0], terms, ignite, callback )
		} )
		ignite.apply( self, as )
	}
}
