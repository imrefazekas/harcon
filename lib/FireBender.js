let _ = require('isa.js')

let FlowBuilder = require('../util/FlowBuilder')
let FlowReader = require('../util/FlowReader')
let Parser = require('harcon-flow')

let vindication = require('vindication.js')

let { OK, SEPARATOR } = require('./Static')

module.exports = {
	name: 'FireBender',
	auditor: true,
	bender: true,
	init: async function (options) {
		let self = this

		this.harconlog( null, 'FireBender initiated...', options, 'info' )
		this.options = options

		this.defs = this.options.defs || {}
		if ( _.isString(self.defs) )
			self.defs = FlowReader.readFlows( self.defs )
		if ( Array.isArray(self.defs) ) {
			let flows = await Parser.generateDefs(self.defs, {})
			self.defs = flows.defs
		}
		await self.buildFlow( )
		return OK
	},
	buildFlow: async function ( ) {
		for (let key in this.defs)
			if ( this.defs[key].timeout )
				this.firestarter.blower.addToleration( { event: key, timeout: this.defs[key].timeout } )

		let roots = await FlowBuilder.build( this.defs )
		return roots
	},
	addExecution: function (event, def) {
		this.defs[ event ] = { type: def.type, primers: def.primers, validation: def.validation, timeout: def.timeout }
	},
	removeExecution: function (event) {
		delete this.defs[ event ]
	},
	completeness: async function ( terms ) {
		let entities = await terms.request( null, null, this.division, 'Inflicter.entities', '' )
		let checkList = {}
		for (let key in this.defs) {
			let entity = key.split( SEPARATOR )
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

		return checkList
	},
	validateFlow: async function (primer, flowId, err, res) {
		let self = this

		let errMessage = err ? err.message || err.toString() : ''
		self.harconlog( null, 'Flow terminated', { flowId: flowId, err: errMessage, res: res }, 'trace' )
		if ( !self.defs[primer] ) {
			let entities = await self.request( '', flowId, self.division, 'Inflicter.entities', '' )
			for ( let entity of entities ) {
				if (err)
					await self.request( '', flowId, entity.division, entity.name + '.flowFailed', flowId, errMessage )
				else
					await self.request( '', flowId, entity.division, entity.name + '.flowSucceeded', flowId, res )
			}
		}
		return OK
	},
	performEachStep: async function ( primer, data, terms ) {
		let self = this
		let res = []
		for (let d of data) {
			res.push( await self.performStep( primer, d, terms ) )
		}
		return res
	},
	performStep: async function ( primer, res, terms ) {
		let self = this
		if ( primer.fragmented ) {
			await self.request( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res )
				.catch(reason => { self.harconlog( reason ) } )
			return res
		}
		return terms.request( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.event || primer, res )
	},
	spreadFire: function ( primers, res, terms ) {
		let self = this
		let promises = []
		primers.forEach( function (primer) {
			let event = primer.event || primer
			promises.push( terms.request( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, event, res ) )
		} )
		return Promise.all( promises )
	},
	simpleFire: async function ( primer, res, terms ) {
		let self = this

		let allowed = true
		if ( primer.skipIf )
			allowed = _.isFunction( primer.skipIf ) ? !primer.skipIf(res) : (await terms.request( terms.sourceComm.externalId, terms.sourceComm.flowId, primer.division || self.division, primer.skipIf, res )).allowed
		if ( !allowed )
			return res

		return self[ primer.foreach ? 'performEachStep' : 'performStep']( primer, res, terms )
	},
	seriesFire: async function ( primers, data, terms ) {
		let self = this

		if ( primers.length === 0 ) return data

		try {
			let res = []
			for (let primer of primers) {
				res.push( await self.simpleFire( primer, data, terms ) )
			}
			if (self.options.igniteTermination)
				await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, null, res )
			return res
		} catch ( err ) {
			if (self.options.igniteTermination)
				await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, err )
			throw err
		}
	},
	waterfallFire: async function ( primers, data, terms ) {
		let self = this

		if ( primers.length === 0 ) return data

		let res = []
		try {
			for (let primer of primers) {
				res.push( await self.simpleFire( primer, (res.length === 0) ? data : res[ res.length - 1 ], terms ) )
			}
			var last = res.pop()
			if (self.options.igniteTermination)
				await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, null, last )
			return last
		} catch (err) {
			if (self.options.igniteTermination)
				await self.validateFlow( primers[ primers.length - 1 ], terms.sourceComm.flowId, err )
			throw err
		}
	},
	exec: async function ( division, event, parameters, terms ) {
		let self = this

		division = division || self.division
		var divEvent = division + SEPARATOR + event

		if ( !this.defs[event] && !this.defs[divEvent] )
			throw new Error('Unknown event to trigger: ' + event)

		let action = self.defs[event] || self.defs[divEvent]

		if ( parameters.length > 1 )
			throw new Error('1 message object in total can be exchanged between entities')
		if ( action.validation ) {
			if ( _.isFunction(action.validation) ) {
				if ( !action.validation(parameters[0]) )
					throw new Error('Validation failed:' + parameters[0])
			}
			else if ( _.isObject(action.validation) ) {
				let validation = vindication.validate(parameters[0], action.validation)
				if (validation)
					throw new Error('Validation failed: ' + validation )
			}
		}

		let as = [ terms.sourceComm.externalId, terms.sourceComm.flowId, division, event ]
		Array.prototype.push.apply( as, parameters )

		let res = await terms.request.apply( self, as )
		return self[ (action.type || 'series') + 'Fire' ]( action.primers || [], self.options.unfoldAnswer ? res : res[0], terms )
	}
}
