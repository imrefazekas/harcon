async function F () {
	return 4
}

async function F2 () {
	return new Promise( (resolve) => {
		resolve(4)
	} )
}

F().then( console.log )
F2().then( console.log )
