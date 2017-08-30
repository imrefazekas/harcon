module.exports = {
	name: 'Marion',
	auditor: true,
	// When Julie is woken up, send a gentle message to everyone listening to such messages...  Walter and Pater namely
	force: async function ( terms, ignite ) {
		let self = this
		let answer1 = await ignite( 0, null, '', 'greet.gentle', 'It is morning!', 'Time to wake up!')
		let answer2 = await ignite( 1, null, self.division + '.click', 'Claire.simple', 'It is morning!', 'Time to wake up!')
		return [ answer1, answer2 ]
	}
}
