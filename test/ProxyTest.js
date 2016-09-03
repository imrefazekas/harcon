function invariant (key, action) {
	if (key[0] === '_') {
		throw new Error(`Invalid attempt to ${action} private "${key}" property`)
	}
}

let target = {
	foo: 'Welcome, foo'
}
let proxy = new Proxy(target, {
	get (receiver, name) {
		invariant(name, 'get')
		return target[ name ]
	},
	set (receiver, name, value) {
		invariant(name, 'set')
		target[ name ] = value
	}
})

console.log( proxy.foo )
console.log( proxy.world )
proxy.ouff = 'Helloka'
console.log( proxy.ouff )
