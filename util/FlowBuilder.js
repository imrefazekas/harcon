let _ = require('isa.js')

function Element ( name, parents, children ) {
	this.name = name
	this.parents = parents || []
	this.children = children || []
}

function findMessage (roots, message) {
	for ( let i = 0; i < roots.length; ++i ) { let root = roots[i]
		if (root.name === message) return root
		let found = findMessage( root.children, message )
		if (found) return found
	}
	return null
}

function selectMessages (primers) {
	return primers.map( function (primer) {
		return _.isString( primer ) ? primer : (primer.division ? primer.division + '.' : '') + primer.event
	} )
}

/*
function names ( element, attribute ) {
	if (!element) return ''
	return element[attribute].map( function (element) { return element.name } )
}
*/
function buildTree ( roots, key, value ) {
	let found = findMessage( roots, key )
	// console.log('found :::', found ? found.name : '', names( found, 'parents' ), names( found, 'children' ) )

	let primers = selectMessages( value.primers || [] )
	let primerElements = primers.map( function (primer) {
		return findMessage( roots, primer ) || new Element( primer, [], [] )
	} )

	let newElement = new Element( key, [], primerElements )
	primerElements.forEach( function (primerElement) {
		// console.log('primerElement :::', primerElement.name, names( primerElement, 'parents' ), names( primerElement, 'children' ) )
		primerElement.parents.push( found || newElement )
	} )

	if ( !found ) {
		// console.log( 'New Element:', newElement.name )
		roots.push( newElement )
	} else {
		if ( found.children.length > 0) throw new Error('Multiple definition for ' + key + ' has been found.')
		found.children.push.apply(found.children, primerElements)
	}

	return roots
}

module.exports = {
	clean: function (roots) {
		let self = this
		for ( let i = 0; i < roots.length; ++i ) {
			let root = roots[i]
			root.checked = false
			self.clean( root.children )
		}
	},
	validate: function (roots) {
		let self = this
		for ( let i = 0; i < roots.length; ++i ) {
			let root = roots[i]
			if ( root.checked ) return new Error('Possible circle found at: ' + root.name)

			root.checked = true
			let err = self.validate( root.children )
			if (err) throw err
			self.clean( roots )
		}
		return null
	},
	build: async function (defs) {
		let roots = []
		for (let key in defs) {
			// console.log('::::', key, selectMessages( defs[key].primers || [] ) )
			buildTree( roots, key, defs[key] )
		}
		let realRoots = roots.filter( function (element) { return element.parents.length === 0 } )
		realRoots.forEach( function (element) { element.root = true } )
		this.validate( realRoots )
		return realRoots
	}
}
