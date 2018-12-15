module.exports = {
	name: 'Boss',
	shrink: async function ( terms, ...args ) {
		console.log('Arguments received: ', args )
		return 'ok'
	}
}
