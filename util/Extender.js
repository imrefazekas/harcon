let Assigner = require('assign.js')
let assigner = (new Assigner()).recursive(true)
let fs = require('fs')
let path = require('path')

function getFiles (srcpath, extension) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return file.endsWith(extension)
	})
}

module.exports = {
	getExtensions: function ( path ) {
		return getFiles( path, '.js' )
	},
	extend: function ( firestarter, protoType, extPath, opts ) {
		assigner.respect( !opts.suppressing )

		let extensions = this.getExtensions( extPath )
		extensions.forEach( function ( extension ) {
			let newServices = require( path.join( extPath, extension ) )
			protoType = assigner.assign( protoType, newServices(firestarter) )
		} )
		return protoType
	}
}
