let fs = require('fs')

let path = require('path')

let _ = require('isa.js')

let extensionMatcher = function (extension) {
	return function ( file ) {
		return file.endsWith( extension )
	}
}

module.exports = {
	readFlows: function ( folder, matcher = '.flow', defs = [] ) {
		let files = fs.readdirSync(folder )
		for ( let i in files ) {
			let file = path.join(folder, files[i] )
			if ( fs.statSync( file ).isDirectory() ) this.readFiles( file )
			else if ( _.isString( matcher ) ? extensionMatcher(matcher)(file) : matcher( file ) )
				defs.push( {
					title: files[i].substring( 0, files[i].lastIndexOf('.') ),
					def: fs.readFileSync( file, 'utf8' )
				} )
		}
		return defs
	}
}
