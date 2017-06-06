process.on('unhandledRejection', r => console.log(r))

async function c () {
	return new Promise( (resolve, reject) => {
		resolve('OK')
	} )
}

async function a () {
	return new Promise( async (resolve, reject) => {
		let res = await c()
		resolve( res )
	} )
}

async function b () {
	return new Promise( async (resolve, reject) => {
		let res = await Promise.all( [ a() ] )
		resolve( res )
	} )
}

async function ab () {
	return new Promise( async (resolve, reject) => {
		const akarmi = await b()
		resolve( akarmi )
	} )
}

let pms = []

let time = Date.now()
for ( let i = 0; i < 10000; ++i ) {
	pms.push( ab() )
}
Promise.all( pms )
.then( () => {
	console.log( (time - Date.now()) )
} )
