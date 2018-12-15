var funcTag = '[object Function]'
var objectProto = Object.prototype
var objToString = objectProto.toString
var isObject = function (value) {
	var type = typeof value
	return !!value && (type === 'object' || type === 'function')
}
var isFunction = function (value) {
	console.log( '::::::::', objToString.call(value) )
	return isObject(value) && objToString.call(value) === funcTag
}

let _ = require('isa.js')

let ignorable = [ 'init', 'ignite', 'request', 'inform', 'delegate', 'erupt', 'setTimeout', 'setInterval' ]

function functions (obj) {
	let res = []
	for (let m in obj)
		if ( !ignorable.includes(m) && isFunction(obj[m]) )
			res.push( m )
	return res
}

var entity = {
	greetings: function () {
		console.log('A')
	},
	agreet: async function () {
		console.log('A')
	}
}

console.log( functions( entity ) )
