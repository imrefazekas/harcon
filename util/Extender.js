let Assigner = require('assign.js')
let assigner = (new Assigner()).respect(true).recursive(true)
let fs = require('fs')
let path = require('path')

function getFiles (srcpath, extension) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return file.endsWith(extension)
	})
}

let _ = require('isa.js')
let ignorable = [ 'init', 'ignite', 'request', 'inform', 'delegate', 'startCron', 'stopCron', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval' ]

module.exports = {
	ignorable,
	functions (obj) {
		let res = []
		for (let m in obj)
			if ( !ignorable.includes(m) && _.isFunction(obj[m]) )
				res.push( m )
		return res
	},
	getExtensions: function ( path ) {
		return getFiles( path, '.js' )
	},
	extend: function ( firestarter, protoType, extPath ) {
		let extensions = this.getExtensions( extPath )
		extensions.forEach( function ( extension ) {
			let newServices = require( path.join( extPath, extension ) )
			protoType = assigner.logger( firestarter.logger ).assign( protoType, newServices(firestarter) )
		} )
		return protoType
	}
}
