module.exports = {
	name: 'Boss',
	shrink: async function ( terms, ignite, ...args ) {
		console.log('Arguments received: ', args)
		return 'ok'
	}
}
