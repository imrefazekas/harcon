const Proback = require( 'proback.js' )

let Harcon = require('../lib/Inflicter')
let Nats = require('harcon-nats')

let Clerobee = require('clerobee')
let clerobee = new Clerobee(16)

let inflicter
async function start () {
	let harcon = new Harcon( {
		name: 'Demo',
		idLength: 32,
		Barrel: Nats.Barrel,
		barrel: { 'url': 'nats://localhost:4222' },
		logger: {
			debug () {},
			warn () {},
			trace () {},
			info () {},
			error () {}
		},
		blower: { commTimeout: 40000 },
		mortar: { enabled: false }
	} )

	inflicter = await harcon.init()
	await inflicter.inflicterEntity.deploy( {
		name: 'Marie',
		version: '2.0.0',
		async echo (...params) {
			let terms = params[ params.length - 1 ]
			return params.slice(0, -1).concat( await terms.request( 'Claire.extend', 'Wow' ) ).concat( await this.request( 'Claire.extend', 'Awesome' ) )
		}
	} )
	await inflicter.inflicterEntity.deploy( {
		name: 'Claire',
		version: '2.0.0',
		async extend (...params) {
			return params.slice(0, -1)
		}
	} )

	let entities = await inflicter.entities( )
	console.log( entities.map( function (entity) { return entity.name } ).sort() )
}


async function comm () {
	let time = Date.now()
	let ps = []
	for (let i = 0; i < 5000; ++i)
		ps.push( inflicter.request( clerobee.generate(), null, '', 'Marie.echo',
			{'name': {'common': 'Belgium', 'official': 'Kingdom of Belgium', 'native': {'deu': {'official': 'K\u00f6nigreich Belgien', 'common': 'Belgien'}, 'fra': {'official': 'Royaume de Belgique', 'common': 'Belgique'}, 'nld': {'official': 'Koninkrijk Belgi\u00eb', 'common': 'Belgi\u00eb'}}}, 'tld': ['.be'], 'cca2': 'BE', 'ccn3': '056', 'cca3': 'BEL', 'cioc': 'BEL', 'independent': true, 'status': 'officially-assigned', 'currencies': {'EUR': {'name': 'Euro', 'symbol': '\u20ac'}}, 'idd': {'root': '+3', 'suffixes': ['2']}, 'capital': ['Brussels'], 'altSpellings':['BE', 'Belgi\u00eb', 'Belgie', 'Belgien', 'Belgique', 'Kingdom of Belgium', 'Koninkrijk Belgi\u00eb', 'Royaume de Belgique', 'K\u00f6nigreich Belgien'], 'region': 'Europe', 'subregion': 'Western Europe', 'languages': {'deu': 'German', 'fra': 'French', 'nld': 'Dutch'}, 'translations': {'ces': {'official': 'Belgick\u00e9 kr\u00e1lovstv\u00ed', 'common': 'Belgie'}, 'cym': {'official': 'Teyrnas Gwlad Belg', 'common': 'Gwlad Belg'}, 'deu': {'official': 'K\u00f6nigreich Belgien', 'common': 'Belgien'}, 'fra': {'official': 'Royaume de Belgique', 'common': 'Belgique'}, 'hrv': {'official': 'Kraljevina Belgija', 'common': 'Belgija'}, 'ita': {'official': 'Regno del Belgio', 'common': 'Belgio'}, 'jpn': {'official': '\u30d9\u30eb\u30ae\u30fc\u738b\u56fd', 'common': '\u30d9\u30eb\u30ae\u30fc'}, 'nld': {'official': 'Koninkrijk Belgi\u00eb', 'common': 'Belgi\u00eb'}, 'por': {'official': 'Reino da B\u00e9lgica', 'common': 'B\u00e9lgica'}, 'rus': {'official': '\u041a\u043e\u0440\u043e\u043b\u0435\u0432\u0441\u0442\u0432\u043e \u0411\u0435\u043b\u044c\u0433\u0438\u044f', 'common': '\u0411\u0435\u043b\u044c\u0433\u0438\u044f'}, 'slk': {'official': 'Belgick\u00e9 kr\u00e1\u013eovstvo', 'common': 'Belgicko'}, 'spa': {'official': 'Reino de B\u00e9lgica', 'common': 'B\u00e9lgica'}, 'fin': {'official': 'Belgian kuningaskunta', 'common': 'Belgia'}, 'est': {'official': 'Belgia Kuningriik', 'common': 'Belgia'}, 'zho': {'official': '\u6bd4\u5229\u65f6\u738b\u56fd', 'common': '\u6bd4\u5229\u65f6'}, 'pol': {'official': 'Kr\u00f3lestwo Belgii', 'common': 'Belgia'}, 'urd': {'official': '\u0645\u0645\u0644\u06a9\u062a\u0650 \u0628\u0644\u062c\u0626\u06cc\u0645', 'common': '\u0628\u0644\u062c\u0626\u06cc\u0645'}, 'kor': {'official': '\ubca8\uae30\uc5d0 \uc655\uad6d', 'common': '\ubca8\uae30\uc5d0'}, 'per': {'official': '\u067e\u0627\u062f\u0634\u0627\u0647\u06cc \u0628\u0644\u0698\u06cc\u06a9', 'common': '\u0628\u0644\u0698\u06cc\u06a9'}}, 'latlng': [50.83333333, 4], 'landlocked': false, 'borders': ['FRA', 'DEU', 'LUX', 'NLD'], 'area':30528, 'flag': '\ud83c\udde7\ud83c\uddea', 'demonyms': {'eng': {'f': 'Belgian', 'm': 'Belgian'}, 'fra': {'f': 'Belge', 'm': 'Belge'}}},
			{'name': {'common': 'United Kingdom', 'official': 'United Kingdom of Great Britain and Northern Ireland', 'native': {'eng': {'official': 'United Kingdom of Great Britain and Northern Ireland', 'common': 'United Kingdom'}}}, 'tld': ['.uk'], 'cca2': 'GB', 'ccn3': '826', 'cca3': 'GBR', 'cioc': 'GBR', 'independent': true, 'status': 'officially-assigned', 'currencies': {'GBP': {'name': 'British pound', 'symbol': '\u00a3'}}, 'idd': {'root': '+4', 'suffixes': ['4']}, 'capital': ['London'], 'altSpellings': ['GB', 'UK', 'Great Britain'], 'region': 'Europe', 'subregion': 'Northern Europe', 'languages': {'eng': 'English'}, 'translations': {'ces': {'official': 'Spojen\u00e9 kr\u00e1lovstv\u00ed Velk\u00e9 Brit\u00e1nie a Severn\u00edho Irska', 'common': 'Spojen\u00e9 kr\u00e1lovstv\u00ed'}, 'deu': {'official': 'Vereinigtes K\u00f6nigreich Gro\u00dfbritannien und Nordirland', 'common': 'Vereinigtes K\u00f6nigreich'}, 'fra': {'official': 'Royaume-Uni de Grande-Bretagne et dIrlande du Nord', 'common': 'Royaume-Uni'}, 'hrv': {'official': 'Ujedinjeno Kraljevstvo Velike Britanije i Sjeverne Irske', 'common': 'Ujedinjeno Kraljevstvo'}, 'ita': {'official': 'Regno Unito di Gran Bretagna e Irlanda del Nord', 'common': 'Regno Unito'}, 'jpn': {'official': '\u30b0\u30ec\u30fc\u30c8\u00b7\u30d6\u30ea\u30c6\u30f3\u304a\u3088\u3073\u5317\u30a2\u30a4\u30eb\u30e9\u30f3\u30c9\u9023\u5408\u738b\u56fd', 'common': '\u30a4\u30ae\u30ea\u30b9'}, 'nld': {'official': 'Verenigd Koninkrijk van Groot-Brittanni\u00eb en Noord-Ierland', 'common': 'Verenigd Koninkrijk'}, 'por': {'official': 'Reino Unido da Gr\u00e3-Bretanha e Irlanda do Norte', 'common': 'Reino Unido'}, 'rus': {'official': '\u0421\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u043d\u043e\u0435 \u041a\u043e\u0440\u043e\u043b\u0435\u0432\u0441\u0442\u0432\u043e \u0412\u0435\u043b\u0438\u043a\u043e\u0431\u0440\u0438\u0442\u0430\u043d\u0438\u0438 \u0438 \u0421\u0435\u0432\u0435\u0440\u043d\u043e\u0439 \u0418\u0440\u043b\u0430\u043d\u0434\u0438\u0438', 'common': '\u0412\u0435\u043b\u0438\u043a\u043e\u0431\u0440\u0438\u0442\u0430\u043d\u0438\u044f'}, 'slk': {'official': 'Spojen\u00e9 kr\u00e1\u013eovstvo Ve\u013ekej Brit\u00e1nie a Severn\u00e9ho\u00ccrska', 'common': 'Ve\u013ek\u00e1 Brit\u00e1nia (Spojen\u00e9 kr\u00e1\u013eovstvo)'}, 'spa': {'official': 'Reino Unido de Gran Breta\u00f1a e Irlanda del Norte', 'common': 'Reino Unido'}, 'fin': {'official': 'Ison-Britannian ja Pohjois-Irlannin yhdistynyt kuningaskunta', 'common': 'Yhdistynyt kuningaskunta'}, 'est': {'official': 'Suurbritannia ja P\u00f5hja-Iiri \u00dchendkuningriik', 'common': 'Suurbritannia'}, 'zho': {'official': '\u5927\u4e0d\u5217\u98a0\u53ca\u5317\u7231\u5c14\u5170\u8054\u5408\u738b\u56fd', 'common': '\u82f1\u56fd'}, 'pol': {'official': 'Zjednoczone Kr\u00f3lestwo Wielkiej Brytanii i Irlandii P\u00f3\u0142nocnej', 'common': 'Zjednoczone Kr\u0142lestwo'}, 'urd': {'official': '\u0645\u0645\u0644\u06a9\u062a\u0650 \u0645\u062a\u062d\u062f\u06c1 \u0628\u0631\u0637\u0627\u0646\u06cc\u06c1 \u0639\u0638\u0645\u06cc \u0648 \u0634\u0645\u0627\u0644\u06cc \u0622\u0626\u0631\u0644\u06cc\u0646\u0688', 'common': '\u0645\u0645\u0644\u06a9\u062a\u0650 \u0645\u062a\u062d\u062f\u06c1'}, 'kor': {'official': '\uadf8\ub808\uc774\ud2b8\ube0c\ub9ac\ud2bc \ubd81\uc544\uc77c\ub79c\ub4dc \uc5f0\ud569 \uc655\uad6d', 'common': '\uc601\uad6d'}, 'per': {'official': '\u067e\u0627\u062f\u0634\u0627\u0647\u06cc \u0645\u062a\u062d\u062f \u0628\u0631\u06cc\u062a\u0627\u0646\u06cc\u0627\u06cc \u06a9\u0628\u06cc\u0631 \u0648 \u0627\u06cc\u0631\u0644\u0646\u062f \u0634\u0645\u0627\u0644\u06cc', 'common': '\u0627\u0646\u06af\u0644\u06cc\u0633'}}, 'latlng': [54, -2], 'landlocked': false, 'borders': ['IRL'], 'area': 242900, 'flag': '\ud83c\uddec\ud83c\udde7', 'demonyms': {'eng': {'f': 'British', 'm': 'British'}, 'fra': {'f': 'Britannique', 'm': 'Britannique'}}}
		) )
	console.log('Promises made')
	console.log( await Promise.all( ps ) )
	console.log('>>>>>>>>', (Date.now() - time) )
	return 'OK'
}

async function close () {
	if (inflicter)
		await inflicter.close( )
}

start().then( () => {
	return Proback.timeout( 3000 )
} ).then( () => {
	return comm( )
} ).then( (response) => {
	console.log('>>>>>>>', response)
	return Proback.timeout( 3000 )
} ).then( () => {
	return close()
} ).catch( console.error )
