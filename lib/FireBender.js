let Proback = require('proback.js')
const sequential = Proback.syncAll

let _ = require('isa.js')

let FlowBuilder = require('../util/FlowBuilder')
let FlowReader = require('../util/FlowReader')
let Parser = require('harcon-flow')

let vindication = require('vindication.js')

module.exports = {
	name: 'FireBender',
	auditor: true,
	bender: true,
	init: function (options, callback) {
		let self = this

		this.harconlog( null, 'FireBender initiated...', options, 'info' )
		this.options = options

		this.defs = this.options.defs || {}

		try {
			if ( _.isString(self.defs) )
				self.defs = FlowReader.readFlows( self.defs )
			if ( Array.isArray(self.defs) )
				Parser.generateDefs(self.defs, {})
				.then( (flows) => {
					self.defs = flows.defs
					self.buildFlow( callback )
				} )
				.catch( (reason) => {
					callback( reason )
				} )
			else
				self.buildFlow( callback )
		} catch (reason) {
			callback( reason )
		}
	},
	buildFlow: function ( callback ) {
		FlowBuilder.build( this.defs, function (err, roots) {
			if (err) return callback( err )
			callback( null, roots )
		} )
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
			fns.push( function (previousResponse, responses, count) {
				return new Promise( (resolve, reject) => {
					previousResponse = self.options.unfoldAnswer ? previousResponse : previousResponse[0]
					ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.skipIf, previousResponse, function (err, ans) {
						if (err) reject(err)
						else if (ans.allowed)
							ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, previousResponse, Proback.handler(null, resolve, reject) )
						else resolve( res )
					} )
				} )
			} )
		else
			fns.push( function (previousResponse, responses, count) {
				return new Promise( (resolve, reject) => {
					ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, self.options.unfoldAnswer ? previousResponse : previousResponse[0], Proback.handler(null, resolve, reject) )
				} )
			} )
	},
	simpleFire: function ( fns, primer, res, terms, ignite, callback ) {
		let self = this
		let event = primer.event || primer
		if ( primer.skipIf )
			if ( _.isFunction( primer.skipIf ) )
				fns.push( function (previousResponse, responses, count) {
					return new Promise( (resolve, reject) => {
						try {
							if ( !primer.skipIf(res) )
								ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res, Proback.handler(null, resolve, reject) )
							else resolve( res )
						} catch (err) { reject( err ) }
					} )
				} )
			else
				fns.push( function (previousResponse, responses, count) {
					return new Promise( (resolve, reject) => {
						ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.skipIf, res, function (err, ans) {
							if (err) reject(err)
							else if (ans.allowed)
								ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res, Proback.handler(null, resolve, reject) )
							else resolve( res )
						} )
					} )
				} )
		else
			fns.push( function (previousResponse, responses, count) {
				return new Promise( (resolve, reject) => {
					ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res, Proback.handler(null, resolve, reject) )
				} )
			} )
	},
	seriesFire: function ( primers, res, terms, ignite, callback ) {
		let self = this
		let fns = []

		if ( primers.length === 0 ) return callback( null, res )

		primers.forEach( function (primer) {
			self.simpleFire( fns, primer, res, terms, ignite, callback )
		} )
		sequential( fns )
		.then( (res) => {
			if (self.options.igniteTermination)
				self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, null, res )
			callback(null, res)
		} )
		.catch( (reason) => {
			if (self.options.igniteTermination)
				self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, reason )
			callback(reason)
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
		sequential( fns )
		.then( (res) => {
			var last = res.pop()
			if (self.options.igniteTermination)
				self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, null, last )
			callback(null, last)
		} )
		.catch( (reason) => {
			if (self.options.igniteTermination)
				self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, reason )
			callback(reason)
		} )
	},
	exec: function ( division, event, parameters, terms, ignite, callback ) {
		if ( !this.defs[event] ) return callback( new Error('Unknown event to trigger: ' + event) )

		let self = this
		let action = self.defs[event]

		if ( parameters.length > 1 ) return callback( new Error('1 message object in total can be exchanged between entities!') )
		if ( action.validation ) {
			if ( _.isFunction(action.validation) ) {
				if ( !action.validation(parameters[0]) )
					return callback( new Error('Validation failed') )
			}
			else if ( _.isObject(action.validation) ) {
				let validation = vindication.validate(parameters[0], action.validation)
				if (validation)
					return callback( new Error('Validation failed. ' + validation ) )
			}
		}

		let as = [ terms.sourceComm.externalId, terms.sourceComm.flowId, division || self.division, event ]
		Array.prototype.push.apply( as, parameters )
		as.push( function (err, res) {
			if (err) return callback(err)
			self[ (action.type || 'series') + 'Fire' ]( action.primers || [], self.options.unfoldAnswer ? res : res[0], terms, ignite, callback )
		} )
		ignite.apply( self, as )
	}
}
