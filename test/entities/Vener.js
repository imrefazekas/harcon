module.exports = {
	name: 'Vener',
	async supervene ( event, ...params ) {
		console.log('Accepted: ', event, params )
		return params
	},
	async superform ( event, result ) {
		console.log('Formed: ', event, result )
		return result
	}
}
