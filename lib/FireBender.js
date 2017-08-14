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
	init: function (options) {
		let self = this

		this.harconlog( null, 'FireBender initiated...', options, 'info' )
		this.options = options

		this.defs = this.options.defs || {}
		return new Promise( async (resolve, reject) => {
			try {
				if ( _.isString(self.defs) )
					self.defs = FlowReader.readFlows( self.defs )
				if ( Array.isArray(self.defs) ) {
					let flows = await Parser.generateDefs(self.defs, {})
					self.defs = flows.defs
				}
				await self.buildFlow( )
				resolve('ok')
			} catch (reason) { reject( reason ) }
		} )
	},
	buildFlow: function ( ) {
		for (let key in this.defs)
			if ( this.defs[key].timeout )
				this.firestarter.blower.addToleration( { event: key, timeout: this.defs[key].timeout } )
		return new Promise( async (resolve, reject) => {
			try {
				let roots = await FlowBuilder.build( this.defs )
				resolve( roots )
			} catch (err) { resolve(err) }
		} )
	},
	addExecution: function (event, def) {
		this.defs[ event ] = { type: def.type, primers: def.primers, validation: def.validation, timeout: def.timeout }
	},
	removeExecution: function (event) {
		delete this.defs[ event ]
	},
	completeness: function ( terms, ignite ) {
		ignite( null, null, this.division, 'Inflicter.entities', '' )
		.then( (entities) => {
			let checkList = {}
			for (let key in this.defs) {
				let entity = key.split('.')
				if ( !checkList[ entity[0] ] ) checkList[ entity[0] ] = []
				if ( !checkList[ entity[0] ].includes(entity[1]) )
					checkList[ entity[0] ].push( entity[1] )
			}
			for (let key in checkList) {
				let entity = entities.find( (entity) => { return entity.name === key } )
				if ( !entity ) continue

				checkList[key] = checkList[key].filter( (event) => { return !entity.events.includes(event) } )

				if ( checkList[key].length === 0 )
					delete checkList[key]
			}
			callback( null, checkList )
		} )
		.catch( callback )
	},
	validateFlow: async function (primer, flowId, err, res) {
		let self = this
		return new Promise( async (resolve, reject) => {
			let errMessage = err ? err.message || err.toString() : ''
			self.harconlog( null, 'Flow terminated', { flowId: flowId, err: errMessage, res: res }, 'trace' )
			if ( !self.defs[primer] ) {
				try {
					let entities = await self.ignite( '', flowId, self.division, 'Inflicter.entities', '' )
					for ( let entity of entities ) {
						if (err)
							await self.ignite( '', flowId, entity.division, entity.name + '.flowFailed', flowId, errMessage )
						else
							await self.ignite( '', flowId, entity.division, entity.name + '.flowSucceeded', flowId, res )
					}
				} catch (err) { reject(err) }
			}
			resolve('ok')
		} )
	},
	spreadFire: function ( primers, res, terms, ignite ) {
		let self = this
		let promises = []
		primers.forEach( function (primer) {
			let event = primer.event || primer
			promises.push( ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res ) )
		} )
		Proback.forAll( promises, callback, 'ok' )
	},
	promiseEachStep: function ( fns, primer, res, terms, ignite ) {
		let self = this
		return sequential( res.map( ( r ) => {
			return function (_previousResponse, _responses, _count) {
				return self.promiseStep( fns, primer, r, terms, ignite, callback )
			}
		} ) )
	},
	promiseStep: function ( fns, primer, res, terms, ignite ) {
		let self = this
		return new Promise( (resolve, reject) => {
			ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res, Proback.handler(null, resolve, reject) )
		} )
	},
	igniteEachStep: function ( fns, primer, res, terms, ignite, resolve, reject ) {
		let self = this
		sequential( res.map( ( r ) => {
			return function (_previousResponse, _responses, _count) {
				return self.promiseStep( fns, primer, r, terms, ignite, Proback.handler(null, resolve, reject) )
			}
		} ) )
		.then( (data) => { resolve(data) } )
		.catch( (reason) => { reject(reason) } )
	},
	igniteStep: function ( fns, primer, res, terms, ignite, resolve, reject ) {
		let self = this
		return ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res, Proback.handler(null, resolve, reject) )
	},
	crossFire: function ( fns, primer, res, terms, ignite ) {
		let self = this
		return new Promise( async (resolve, reject) => {
			try {
				if ( primer.skipIf )
					if ( _.isFunction( primer.skipIf ) )
						fns.push( function (previousResponse, responses, count) {
							previousResponse = self.options.unfoldAnswer ? previousResponse : previousResponse[0]
							return primer.skipIf(res) ? Proback.quicker( res, callback ) : self[ primer.foreach ? 'promiseEachStep' : 'promiseStep']( fns, primer, previousResponse, terms, ignite, callback )
						} )
					else
						fns.push( function (previousResponse, responses, count) {
							return new Promise( (resolve, reject) => {
								previousResponse = self.options.unfoldAnswer ? previousResponse : previousResponse[0]
								ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.skipIf, previousResponse, function (err, ans) {
									if (err) reject(err)
									else if (ans.allowed)
										return self[ primer.foreach ? 'igniteEachStep' : 'igniteStep']( fns, primer, previousResponse, terms, ignite, resolve, reject )
									else resolve( res )
								} )
							} )
						} )
				else
					resolve( await self[ primer.foreach ? 'promiseEachStep' : 'promiseStep']( fns, primer, self.options.unfoldAnswer ? previousResponse : previousResponse[0], terms, ignite ) )
			} catch (err) { reject(err) }
		} )
	},
	simpleFire: function ( fns, primer, res, terms, ignite ) {
		let self = this
		return new Promise( async (resolve, reject) => {
			try {
				if ( primer.skipIf )
					if ( _.isFunction( primer.skipIf ) ) {
						resolve( primer.skipIf(res) ? res : await self[ primer.foreach ? 'promiseEachStep' : 'promiseStep']( fns, primer, res, terms, ignite ) )
					} else {
						let ans = await ignite( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.skipIf, res )
						if (ans.allowed)
							resolve( !ans.allowed ? res : await self[ primer.foreach ? 'igniteEachStep' : 'igniteStep']( fns, primer, res, terms, ignite, resolve, reject ) )
					}
				else
					resolve( await self[ primer.foreach ? 'promiseEachStep' : 'promiseStep']( fns, primer, res, terms, ignite ) )
			} catch (err) { reject(err) }
		} )
	},
	seriesFire: function ( primers, res, terms, ignite ) {
		let self = this
		let fns = []

		return new Promise( async (resolve, reject) => {
			if ( primers.length === 0 ) return resolve( res )

			try {
				let res = []
				for (let primer of primers) {
					res.push( await self.simpleFire( fns, primer, res, terms, ignite ) )
				}
				if (self.options.igniteTermination)
					await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, null, res )
				resolve( res)
			} catch ( err ) {
				if (self.options.igniteTermination)
					await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, reason )
				reject(err)
			}
		} )
	},
	waterfallFire: function ( primers, res, terms, ignite ) {
		let self = this
		let fns = []

		return new Promise( async (resolve, reject) => {
			if ( primers.length === 0 ) return reject( null, res )

			let res = []
			try {
				for (let primer of primers) {
					if (fns.length === 0)
						res.push( await self.simpleFire( fns, primer, res, terms, ignite ) )
					else
						res.push( await self.crossFire( fns, primer, res, terms, ignite ) )
				}
				var last = res.pop()
				if (self.options.igniteTermination)
					await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, null, last )
				resolve( last )
			} catch (err) {
				if (self.options.igniteTermination)
					await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, err )
				reject( err )
			}
		} )
	},
	exec: function ( division, event, parameters, terms, ignite ) {
		let self = this

		return new Promise( async (resolve, reject) => {
			division = division || self.division
			var divEvent = division + '.' + event

			if ( !this.defs[event] && !this.defs[divEvent] ) return reject( new Error('Unknown event to trigger: ' + event) )

			let action = self.defs[event] || self.defs[divEvent]

			if ( parameters.length > 1 ) return reject( new Error('1 message object in total can be exchanged between entities!') )
			if ( action.validation ) {
				if ( _.isFunction(action.validation) ) {
					if ( !action.validation(parameters[0]) )
						return reject( new Error('Validation failed') )
				}
				else if ( _.isObject(action.validation) ) {
					let validation = vindication.validate(parameters[0], action.validation)
					if (validation)
						return reject( new Error('Validation failed. ' + validation ) )
				}
			}
			try {
				let as = [ terms.sourceComm.externalId, terms.sourceComm.flowId, division, event ]
				Array.prototype.push.apply( as, parameters )

				let res = await ignite.apply( self, as )
				resolve( await self[ (action.type || 'series') + 'Fire' ]( action.primers || [], self.options.unfoldAnswer ? res : res[0], terms, ignite ) )
			} catch ( err ) { reject(err) }
		} )
	}
}
