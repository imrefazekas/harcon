function a () {
	return new Promise( (resolve, reject) => {
		setTimeout( function () {
			console.log('A')
			resolve('A')
		}, 1000 )
	} )
}

function b () {
	return new Promise( (resolve, reject) => {
		setTimeout( function () {
			console.log('B')
			resolve('b')
		}, 500 )
	} )
}

a()
.then( b() )

a()
.then( () => { return b() } )
