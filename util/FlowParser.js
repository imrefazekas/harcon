let Proback = require('proback.js')

let Assigner = require('assign.js')
let assigner = new Assigner().excluded( ['message'] )


function densify (str) {
	return str.replace(/[^A-Za-z0-9\{\}\[\]\<\>\{\}\(\)]+/g, '')
}
function namify ( str ) {
	if (!str) return str
	return ( densify( str ).charAt(0).toUpperCase() + str.slice(1).toLowerCase() ).match(/[A-Z][A-Za-z0-9]*/g)[0]
}
function messagify ( str ) {
	if (!str) return str
	return ( densify( str ).charAt(0).toLowerCase() + str.slice(1) ).match(/[a-z][A-Za-z0-9]+/g)[0]
}

function extractActor (actor) {
	if ( actor.startsWith('()') ) return { actor: actor.substring(2), web: true }
	if ( actor.startsWith('<>') ) return { actor: actor.substring(2), websocket: true }
	if ( actor.startsWith('{}') ) return { actor: actor.substring(2), websocket: true, rest: true }
	if ( actor.startsWith('[]') ) return { actor: actor.substring(2), rest: true }
	return { actor: actor }
}

function getType (sign) {
	switch ( sign ) {
	case '->': return 'series'
	case '=>': return 'waterfall'
	case '>>': return 'spread'
	}
	throw new Error('Malformed rule')
}

function extractEntity (def, res) {
	res = res || {}

	let comp = def.split(':')
	res = assigner.assign( res, extractActor( densify( comp[0].trim() ) ) )
	res.actor = namify( res.actor )

	if (comp.length > 1) res.message = messagify( comp[1].trim() )

	return res
}

function extractSource ( title, def ) {
	let res = { message: messagify(title) }
	if ( def.startsWith('->') || def.startsWith('=>') || def.startsWith('>>') ) {
		res.external = true
		res.rest = true
		res.websocket = true
		def = def.substring( 2 )
	} else {
		res.internal = true
	}

	res.type = getType( def.substring( def.length - 2 ) )
	def = def.substring( 0, def.length - 2 )

	return extractEntity( def, res )
}
function clean (def) {
	return def.split('//')[0].trim()
}

function findActor ( actor, actors ) {
	let existing = actors.find( function (ref) { return ref.actor === actor.actor } )

	if (existing) {
		existing.rest = existing.rest || !!actor.rest
		existing.websocket = existing.websocket || !!actor.websocket
		existing.web = existing.web || !!actor.web
	} else {
		actors.push( assigner.assign( { }, actor ) )
	}
}
function collectActors ( flows ) {
	let actors = []
	flows.forEach( function (flow) {
		findActor( flow.source, actors )
		flow.messages.forEach( function (message) {
			findActor( message, actors )
		} )
	} )
	return actors
}

module.exports = {
	generateDefs: function ( flowDefs, callback ) {
		let self = this
		return new Promise( (resolve, reject) => {
			let res = { }
			Promise.all( flowDefs.map( function (flowDef) {
				return self.parse( flowDef.name, flowDef.def )
			} ) )
			.then( (flows) => {
				res.flows = flows
				res.actors = collectActors( flows )
				return res
			} )
			.then( () => {
				let defs = res.flows.map( function (flow) {
					let def = {}
					def[ flow.source.actor + '.' + flow.source.message ] = {
						type: flow.source.type,
						primers: flow.messages.map( function (message) { return message.actor + '.' + message.message } )
					}
					return def
				} )
				res.defs = assigner.assign.apply( assigner, defs )
				return Proback.resolver(res, callback, resolve)
			} )
			.catch( (reason) => {
				Proback.rejecter(reason, callback, reject)
			} )
		} )
	},
	parse: function ( title, flowDef, callback ) {
		return new Promise( (resolve, reject) => {
			if (!flowDef) return Proback.rejecter(new Error('No content passed'), callback, reject)
			try {
				let def = flowDef.split('\n').map( function (def) { return def.trim() } ).filter( function (def) {
					return def.length > 0 && !def.startsWith('#') && !def.startsWith('//')
				} )
				if ( def.length < 2 ) return Proback.rejecter(new Error('The flow definition seems to be invalid: ' + flowDef), callback, reject)

				let source = extractSource( title, clean( def[0] ) )
				let messages = []

				def.slice( 1 ).forEach( function (exchange) {
					messages.push( extractEntity( clean( exchange ) ) )
				} )
				return Proback.resolver( {source: source, messages: messages}, callback, resolve)
			} catch (err) { return Proback.rejecter(err, callback, reject) }
		} )
	}
}
