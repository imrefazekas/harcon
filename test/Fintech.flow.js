module.exports = [
	{ title: 'watch trades', def: '-> {}Client : watch ->\n  Assistant : registerWatcher\n Storage: book' },
	{ title: 'notify about trades', def: 'Assistant : notify ->\n  Client : matchingTrades' },
	{ title: 'make trade', def: 'Client : trade ->\n  [secure goods]\n  [make offer]' },
	{ title: 'secure goods', def: 'Assistant : secureGoods ->\n  Finster : letterLading\n Storage: book' },
	{ title: 'make offer', def: 'Assistant : makeOffer ->\n  Trade : offer\n  Client : offerReceived' },
	{ title: 'accept offer', def: '-> Client : offerAccepted ->\n  Finster : letterCredit\n  Assistant : transact\n  Client : gratulate' }
]
