Harcon - Proven and reliable microservice solution for the harmonic convergence of JS entities.
Scalable from in-browser web components till highly structured node-based enterprise components of real-time systems.

Need help? Join me on

[![Join the chat at https://gitter.im/imrefazekas/harcon](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/imrefazekas/harcon?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![npm version](https://badge.fury.io/js/harcon.svg)](http://badge.fury.io/js/harcon) [![Code Climate](https://codeclimate.com/github/imrefazekas/harcon/badges/gpa.svg)](https://codeclimate.com/github/imrefazekas/harcon)

and level your problem with me freely. :)

!Note: From version 3.0.0, harcon provides callback interface with Promise support in its functions.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

========

[harcon](https://github.com/imrefazekas/harcon) is a microservice solution for NodeJS/Browser giving superior abstraction layer for interoperability between entities in a highly structured and fragmented ecosystem.
It allows you to design and implement complex workflows and microservices where context and causality of messages are important.

The library has a stunning feature list beyond basic messaging functionality.

- __Channel-agnostic__: harcon represents a very abstract messaging framework allowing you to use any underlaying technology your application requires: [AMQP](http://www.amqp.org), [NSQ](http://nsq.io), [XMPP](http://xmpp.org), etc...
For amqp integration, please check this: [harcon-amqp](https://github.com/imrefazekas/harcon-amqp)
For nsq integration, please check this: [harcon-nsq](https://github.com/imrefazekas/harcon-nsq)

- __Tracking__: you can monitor every message delivered (request or response) by only few lines of code

- __Flow control / Reproducibility__: A flow of communication / messages can be halted / continued / reinitiated anytime with no effort

- __Free orchestration__: your system can be orchestrated and distributed as you wish, message delivery is not limited to nodes or hosts

- __Short learning curve__: no need to learn hundred of pages, communication has to be simple after all

- __Transparent__: although harcon introduces lots of complex types and structures, your code and callbacks will be kept clean and pure, everything is (un)packed in the background in a transparent way

- __Smooth infiltration__: your objects / functions will possess the necessary services via injection, no need to create complex structures and compounds

- __Advanced routing & listening__: system fragmentation, qualified names, regular expressions, wildcards, etc.

__!Note__: Harcon's concept is to introduce a clean and high abstraction layer over messaging between entities. Like in case of every abstraction tool, for webapps which are simple as 1, it can be proven as a liability.

__!Note__: To use in browser, a CommonJS-enabled packager has to be applied like [browserify](http://browserify.org) or [webpack](http://webpack.github.io) or [jspm](http://jspm.io).

This library starts to shine in a highly structured and distributed environment.


## Installation

$ npm install harcon


## Quick setup
```javascript
var Harcon = require('harcon')
var harcon = new Harcon( )

// define a listener function listening every message related to "greet" like "greet.goodmorning" or "greet.goodday"
harcon.addict( null, 'peter', 'greet.*', function (greetings1, greetings2, callback) {
	callback(null, 'Hi there!')
} )

// define an plain object serving as listener withing the context "greet" to messages "warm"
marie = {
	name: 'marie',
	context: 'greet',
	warm: function (greetings1, greetings2, callback) {
		callback( null, 'Bonjour!' )
	}
}
harcon.addicts( marie )

// sends a communication 'greet.everyone' with parameters and defines a callback to handle responses
// will receive back 2 answers: 'Hi there!' and 'Bonjour!'
harcon.simpleIgnite( 'greet.everyone', 'Whatsup?', 'How do you do?', function (err, res) {
	console.log( err, res )
} )
```


## Workflows

In an enterprise-level system, one has to realize complex communication structure where lots of entities are following business logic and rules, involving subsystems and external resources, policies and other considerations, in short form: workflows.
I take the liberty to define the workflow now as well defined routes and causality of messages.
In a workflow, you are not dependent on the response timeframe, workflows manage distance in time and space. The recipient of a message can be on another server or city or planet. Recipient can answer right away or tomorrow or never.

In the JS world, one should mind the introduction of [microservices](http://martinfowler.com/articles/microservices.html) to start with right in the beginning. Just take the advantage of better orchestration, simpler development and debugging, easier deployment, scaling and monitoring.


[harcon](https://github.com/imrefazekas/harcon) is __"just"__ a low-level library to leverage such concept.
_In a simple way, you define entities and the communications among them then publish them._


#### Entities

In [harcon](https://github.com/imrefazekas/harcon), the communication unit is simply called __entity__.
One can define 2 type of entities:
- simple function: when you associate a function with an event-pattern. Recommended to be used as observer, job-like, surveillance-, or interface-related asset.
```javascript
// Qualified name - will answer to only this message
harcon.addict( null, 'hugh', 'allocate.ip', function (callback) {
	callback(null, 'Done.')
} )
// Wildcards - will answer anything within the context greet
harcon.addict( null, 'peter', 'greet.*', function (callback) {
	callback(null, 'Done.')
} )
// Regular expression - will answer anything where message name start with string 'job'
harcon.addict( null, 'john', /job.*/, function ( partner, callback) {
	callback(null, 'Done.')
} )
...
harcon.simpleIgnite( 'job.order', {name: 'Stephen', customerID:123}, function (err, res) {
	console.log( 'Finished.', err, res )
} )
harcon.simpleIgnite( 'john.job', {name: 'Stephen', customerID:123}, function (err, res) {
	console.log( 'Finished.', err, res )
} )
```

- objects: plain object enclosing functions and a unique name. This is the recommended way to define entities.
```javascript
var bookKeeper = {
	name: 'BookKeeper',
	...
	newOrder: function ( customer, callback ) {
		callback( null, 'Done.' )
	},
	ordersOfToday: function ( callback ) {
		callback( null, [] )
	}
}
...
harcon.simpleIgnite( 'BookKeeper.newOrder', {name: 'Stephen', customerID:123}, function (err, res) {
	console.log( 'Finished', err, res )
} )
harcon.simpleIgnite( 'BookKeeper.ordersOfToday', function (err, res) {
	console.log( 'Finished.', err, res )
} )
```

The simplest but not the only way to address is to quality entities with their names.


#### Responses

By default, [harcon](https://github.com/imrefazekas/harcon) returns and array of response objects returned by the entities addressed by a message sent.

Let's have 2 simple entities:

```javascript
harcon.addict( null, 'peter', 'greet.*', function (callback) {
	callback(null, 'Hi.')
} )
harcon.addict( null, 'camille', 'greet.*', function (callback) {
	callback(null, 'Hello.')
} )

harcon.simpleIgnite( 'greet.simple', function (err, res) {
	console.error( err, res )
} )
```

Returns with the following:

	[ 'Hi.', 'Hello.' ]

(Note: for consistency reason, you got an array even if one entity has been addressed.)

In some cases, you might find useful to know which answer comes from which entity. If you add a single parameter to the harcon:

	var harcon = new Harcon( { namedResponses: true } )

The returned object will look like this:

	{ peter: 'Hi.', camille: 'Hello.' }


#### Error responses

Your callback might receive an error object in unwanted situations. The default transport channel of harcon will stop the message processing at the first error occurring as follows:

```javascript
harcon.addict( null, 'peter', 'greet.*', function (callback) {
	callback( new Error('Stay away, please.') )
} )
harcon.addict( null, 'camille', 'greet.*', function (callback) {
	callback( new Error('Do not bother me.') )
} )

harcon.simpleIgnite( 'greet.simple', function (err, res) {
	console.error( err, res )
} )
```

will result the following on your console:

	[Error: Stay away, please.] null

The default transport layer is designed for development purposes or in-browser usage only.
In an EE, environment, please mind the introduction of a message queue solution like: [AMQP](http://www.amqp.org) or [NSQ](http://nsq.io) using official plugins: [harcon-amqp](https://github.com/imrefazekas/harcon-amqp) and [harcon-nsq](https://github.com/imrefazekas/harcon-nsq) accordingly.

By using a real transport layer, all occurred error messages will be delegated. In such cases, harcon will retrieve an Error object encapsulating all error object received from entities.


#### Orchestration

You have seen how to call service functions using qualified names and regular expressions (function-based entity).
If a much structured system must be orchestrated, a set of finer toolset is at you disposal: __contexts and divisions__, representing different abstraction levels.

__Context__: is a named set of object-based entities and contexts. a qualified name identifying the field/purpose the entity is operating. To refine the structure of your service.
For example you can have multiple entities providing service like _parse_ but in different context like: _"xml"_ or _"json"_.
You can structure your entities like the following:

```javascript
var parser = {
	name: 'JSONParser',
	context: 'transfer.json',
	parse: function ( document, callback ) {
		callback( null, 'Done.' )
	}
}
var observer = {
	name: 'XMLParser',
	context: 'transfer.xml',
	parse: function ( document, callback ) {
		callback( null, null )
	}
}
```

In this case, such messages can be sent:

```javascript
harcon.simpleIgnite( 'transfer.json.parse', function (err, res) { ... } )
or
harcon.simpleIgnite( 'transfer.xml.parse', function (err, res) { ... } )
or
harcon.simpleIgnite( 'transfer.'+document.type+'.parse', function (err, res) { ... } )
```

addressing directly to one of those entities, depending the type of the document you want to parse.
Let's define the following entity:

```javascript
var observer = {
	name: 'Observer',
	context: 'transfer',
	parse: function ( document, callback ) {
		callback( null, null )
	}
}
```

Such entity will also receive those message and might do logging or measuring or perform preliminary actions.
In short form: you can address multiple entities with a single message.
The matching algorithm is simple: spliting the title by _'.'_ matching with the context you specify and fails only if the compared strings are not equals.
This means, that:

__The title 'transfer.xml.parse' will target the XMLParser and Observer entities.__

and

__The title 'transfer.parse' will target the XMLParser, JSONParser and Observer entities.__

Contexts are very good way to refine your structures and entities and express overlapping functional behaviors.


__Division__: divisions is a different angle on the plane of orchestration. A _division_ is a closed "box" of entities, meaning that an entity can operate only within the division it is a member of.
In fact, every entity belongs to a division defined explicitly or implicitly by the harcon.
Divisions can be encapsulated, so a complete division-tree can be built-up in a harcon application.
The reason why divisions are important, because it represents a responsibility and/or legal unit. Entities within it (in normal cases) cannot see outside and an entity published to a container division can answer to messages initiated by an entity somewhere lower in the tree. This gives you a control to define surveillance-like or control-like features and much higher complexity of communication-management.

Please find the [Divisions](#divisions) chapter for details.


_Note_: contexts and divisions are not mandatory to be used. The complexity will tell you how to orchestrate your app. It might happen, that simple function-based named entities are fitting your need. Feel free to act on your own, there is no pattern to follow.



#### Chain messages

If you work with workflows, the sequence/order of your messages will get an importance. To chain messages, define the next point in the workflow you have to add another parameter to your service function:
```javascript
var order = {
	name: 'Order',
	context: 'order',
	newVPN: function ( customer, ignite, callback ) {
		ignite( 'allocate.address', '127.0.0.1', function (err, res) {
			callback(err, res)
		} )
	}
}
...
harcon.simpleIgnite( 'order.newVPN', {name: 'Stephen', customerID:123}, function (err, res) {
	console.log( 'Finished', err, res )
} )
```
That will initiate a small workflow. __harcon.simpleIgnite__ sends a message to entity Order who will send within the same workflow to the Allocator. When it answeres, then the message of the beginning will be answered. [harcon](https://github.com/imrefazekas/harcon) will know if you initiate a message within the processing of another one and considers it as part of the ongoing workflow and tracks it.
Mind the async execution to keep everything in track!


#### Call back or not?

You are not forced to always expect answer, in some cases a quite entity is desired.
If you do not pass a callback when a communication is initiated, [harcon](https://github.com/imrefazekas/harcon) will consider it as a one-ways message sending.

```javascript
// Qualified name - will answer to only this message
harcon.addict( null, 'karl', 'reserve.address', function ( address, callback ) {
	// Do something...
	callback(null, 'Done.')
} )
...
harcon.simpleIgnite( 'reserve.address', '127.0.0.1' )
```

Harcon will know, that sender does not expect any answer at all. But, considering that [harcon](https://github.com/imrefazekas/harcon) is designed for highly structured and fragmented context, receiver entities always __MUST__ have a callback, to let [harcon](https://github.com/imrefazekas/harcon) know about the termination of the given operation for operational prudence!

#### Entity initialization

The need to pass contextual parameters to entities might rise. The options object passed to the constructure of Harcon allows you to specify parameters for entities which will be passed while the init method defined in the entity is called.
```javascript
harcon = new Harcon( { /* ... */ marie: {greetings: 'Hi!'} } )
var marie = {
	name: 'marie',
	context: 'test',
	init: function (options) {
		// {greetings: 'Hi!'} will be passed
	}
	// services ...
}
```

#### Logging

When you create the Harcon instance, you can pass a logger object which will be respected and used to do loggings. If not set, [harcon](https://github.com/imrefazekas/harcon) will log everything to the console. So in production, setting up a logging facility ( like [winston](https://github.com/flatiron/winston) or [bunyan](https://github.com/trentm/node-bunyan) ) is strongly adviced.
```javascript
harcon = new Harcon( { logger: logger /* ... */ } )
```

That logger instance will be used as logging facility all over the system, including internal services and entities.
Each entity receives a function: _harconlog_ with the signature:
```javascript
function( err, message, obj, level ) { ... }
```
That function can be used anything within your entity object:
```javascript
var Marie = {
	name: 'Marie',
	context: 'greet',
	whiny: function (greetings, callback) {
		this.harconlog( null, 'Some logging', { data: greetings }, 'silly' )
		callback( null, 'Pas du tout!' )
	}
}
```
That function should be used for any logging activity you need during the flow of your app.


#### Unique messages

Every communication exchanged possesses the following properties (not exclusively):
- unique ID
- reference to the parent message if exists
- uniqued ID of the workflow itself
- external ID of the workflow started by an external communication involving a reference number to consider
- timestamp

Any time you sends a message or receives an answer, such objects are bypassing through the harcon system which logs and tracks all of them.

By default, [harcon](https://github.com/imrefazekas/harcon) uses 32 as length of the IDs which are unique over time and among computer nodes. You can override this default when initiating Harcon
```javascript
harcon = new Harcon( { /* ... */ idLength: 32 } )
```

## Message exchange

When you defined your components, the need to send and receive messages arises. In a workflow, your component might initiate a message, response one or while responding one sends other ones.
The function-based components can perform only the latter 2 cases, cannot initiate anything by its own. This type of components are present to define services, listeners, definitely not serious business entities.
As you saw above, the serices functions might possess a parameter before the __callback__: _ignite_

```javascript
var order = {
	name: 'Order',
	context: 'order',
	newVPN: function ( customer, ignite, callback ) {
		ignite( 'allocate.address', '127.0.0.1', function (err, res) {
			callback(err, res)
		} )
	}
}
```

That ignite can be used to chain messages, which means to send messages during the processing of a received one. The tool to initiate sub-workflows.

Of course components are not just reacting entities, they might launch new workflows as well. Object-based components possesses an injected function: _ignite_ and can be used as follows:

```javascript
var timer = {
	name: 'Timer',
	scheduling: function ( ) {
		this.ignite( 'validate.accounts', function (err, res) {
		} )
	}
}
```

That ignite function is injected by the [harcon](https://github.com/imrefazekas/harcon) when you publish the components.


## Divisions

When you orchastrate your system as a microservice architure over a clustered message bus for example, the individual microservicSystems can be orchastrated into divisions which is a tree structure actually. One can create divisions following the control-flow or responsibility-chain of the application.
Every component you deploy will belong to a division. If not declared, then to the system division where all system-level components are put.
Divisions is not just a logical grouping of components, but also an encapsulation-model. A component cannot send messages outside the own division but can send to the inner ones. This means, that system components can send to any component, but non-system components cannot reach the level of the main system or other branches of the division-tree.

Divisions give you a very easy-to-use structure to orchestrate your system. Of course, you can use the [harcon](https://github.com/imrefazekas/harcon) without using divisions, the complexity of your system will show if you needed it or not.

Let's define components and add them to divisions:

```javascript
// This will add John to the division 'workers'
harcon.addict( 'workers', 'john', /job.*/, function (callback) {
	callback(null, 'Done.')
} )
// This will add Claire to the division 'entrance'
var claire = {
	name: 'claire',
	division: 'entrance',
	context: 'greet',
	simple: function (greetings1, greetings2, callback) {
		callback(null, 'Enchanté, mon plaisir!')
	}
}
```

Components in a division can be called to:

```javascript
harcon.ignite( null, 'entrance', 'greet.simple', 'Hi', 'Ca vas?', function (err, res) {
} )
```

Note: please keep in mind, that __harcon.ignite__ can be and should be used only when you initiate a workflow from outside the harcon!

If you initiate a communication through the harcon instance, it means, that you wants to drop in a message "from outside" which could mean an integration with an external system or just kick off a workflow.
There are 2 methods to be called:

ignite and simpleIgnite

The different between them is the parameter list. The later does not require to specify external messageId or division, the prior one does as you can see in the example just above.

External ID is very useful, when the workflow is initiated by some external event possessing an id which must be kept for further logging or tracking or just because a communication harmonization across the complete company.

By default, [harcon](https://github.com/imrefazekas/harcon) presumes to have one division per node following the concept of microservices. That division name can be given via its config object or will be derived from its unique name. The created division will serve as the root for every divisions and entities defined.

```javascript
harcon = new Harcon( { division: 'District 8', ... } )
```

## Entity configuration

Entities can be configured easily. The _init_ method of an entity if present, will be called at the end of its publishing process withing the [harcon](https://github.com/imrefazekas/harcon).
The function can be used to set up DB connections or anything required for your entities.
```javascript
module.exports = {
	name: 'Claire',
	context: 'greet',
	init: function (options, callback) {
		console.log('Init...', options)
		callback()
	}
}
```
The method receives a configuration object and a callback to be called when the init method finishes.
That configuration object can be passed when an entity is published:
```javascript
harcon.addicts( Claire, config )
```
or even before, when [harcon](https://github.com/imrefazekas/harcon) is created.
```javascript
harcon = new Harcon( { logger: logger, idLength: 32, Claire: {greetings: 'Hi!'} } )
```

An entity's configuration is an merged object made from the followings (in order):

- the [millieu](#millieu) object in the configuration of harcon
- object in harcon configuration associated through the name of the entity
- the direct configuration passed to the function addicts

Should you use none of them, and your entity shall be initiated with empty object.

## Timeout management

[harcon](https://github.com/imrefazekas/harcon) has an internal handler - which is off by default - to deal with messages not answered within a reasonable timeframe.

```javascript
harcon = new Harcon( { ..., blower: { commTimeout: 2000 } } )
```

This configuration will tell your running harcon instance to check if the messages sent to some entities have been answered within __2000__ millisecs. If not, an error will be sent to the sender with the message: __'Communication has not been received answer withing the given timeframe.'__

The nature of your app might urge you to distinguish time management following some business logic. For example: operations involving third party APIs have to be performed with a wider or without time limitation. [harcon](https://github.com/imrefazekas/harcon) supports such logic in many ways:

```javascript
harcon = new Harcon( { ..., blower: { commTimeout: 2000, tolerates: [ 'Alizee.superFlegme' ] } } )
```

The field __'tolerates'__ defines the list of conditions turning off the global timeout management. It is an array with possible values of types: String, Regexp and Function.

- Strings will be matched to the address of the message
- Regexp will be matched to the address of the message
- Function will be called by passing the ongoing communication object and the return value will determine if timeout management should be applied.

In [harcon](https://github.com/imrefazekas/harcon), event the attribute _'commTimeout'_ can be a function to define custom timeouts to different communication.

!Note: Please, keep it mind, that harcon is transport layer agnostic, so a preferred message broker can also provide some security over interaction.


## Extension

[harcon](https://github.com/imrefazekas/harcon) can be easily extended by using pure harcon components listening to system events:
```javascript
var extension = {
	name: 'As you design it',
	context: harcon.name,
	castOf: function ( name, firestarter ) {
	},
	affiliate: function ( firestarter ) {
	},
	close: function () {
	}
}
harcon.addicts( extension )
```
In the current version, the harcon instance you are using will send to your components events about system closing, entity publishing and revoking. For a working example, please check [harcon-radiation](https://github.com/imrefazekas/harcon-radiation).


## Promises

To think in terms of the current trends in the JS-world, the services of [harcon](https://github.com/imrefazekas/harcon) might give you back a promise of no callback is provided as last parameter.
```javascript
harcon.ignite( '0', 'Inflicter.click', 'greet.simple', 'Hi', 'Ca vas?' )
.then( function ( res ) {
})
.catch( function ( reason ) {
} )
```

## Millieu

There is a "shared" environmental object added to all entities deployed within [harcon](https://github.com/imrefazekas/harcon):

```javascript
harcon = new Harcon( { millieu: { workDir: '/temp' } } )
```

That object will be inserted into the initial configuration of all Entities published:

```javascript
var Marie = {
	name: 'Marie',
	init: function (options) {
		// options = { workDir: '/temp' }
		self.options = options
	}
}
```

In any service of entity 'Marie', the _'self.options.workDir'_ will be a valid object.



## State shifting

There is a reverse-directed-like feature in [harcon](https://github.com/imrefazekas/harcon), allowing an entity to shift "internal state" and let other entities to know about it.
Let's say, entities of a system want to know when the DB component becomes "available", or when a third party connector entity becomes "connected".

To build such constellation between entities, is pretty straightforward:

```javascript
module.exports = {
	name: 'Lina',
	...
	registerForShift: function () {
		self.ignite('Marie.notify', 'data', 'Lina.marieChanged', function (err) { if (err) { self.harconlog(err) } } )
	}, ...
	marieChanged: function ( payload, callback ) {
		console.log( '>>>>>>>>>>>', payload )
		callback( null, 'OK' )
	}
}
```

In function _'registerForShift'_ _'Lina'_ tells _'Marie'_ to notify her if the state _'data'_ is changing. The function to be called is _'marieChanged'_. The new value of the given state should be passed.
State is a string. It does not need to be represented as attribute or whatever, just a pure string - object pair.

How Marie can "shift" state:

```javascript
module.exports = {
	name: 'Marie',
	simple: function (greetings1, greetings2, callback) {
		this.shifted( { data: 'content' } )
		callback(null, 'Bonjour!')
	}
}
```

Anytime _Marie_ calls its internal _'shifted'_ function, it triggers the [harcon](https://github.com/imrefazekas/harcon)'s state changing service. You have to pass an object possessing all properties considered to be "states". So an object might shift multiple states at once if needed. The values of the attributes are the payload to send to the listener entities.
That __this.shifted( { data: 'content' } )__ line will initiate an internal communication with the addressing _'Lina.marieChanged'_ as _Lina_ specified. And the function _'marieChanged'_ of _Lina_ will be called with the string _'content'_ passed as payload.



## Interoperating with other harcon instances

By default harcon blocks acts like a blackbox allowing to exchange communication within the main division / name of the system deployed.
If you pass an attribute _'connectedDivisions'_ to the config of harcon, it will accept communication from the enlisted divisions and allow you to connect to those ones.


## Functions erupt

On the line to ease the management of workflows, [harcon](https://github.com/imrefazekas/harcon) introduces the _erupt_ functions appearing in the published entities and in the terms object passed to the services functions during ongoing communication.
It represents a simple trick to call ignite by returning the following:

```javascript
function (cb) {
	var _args = self.sliceArguments.apply( self, arguments )
	return function (cb) {
		_args.push( cb )
		igniteFn.apply( self, _args )
	}
}
```

In case, you are building up a complete chain of calls, you can use your favorite functional abstraction tool as the following example demonstrates through the popular _async.js_:

```javascript
async.series([
	erupt( 'Marie.greet', 'Hello' ),
	erupt( 'Julie.greet', 'Hello' )
], function(err, res){ })
```

No need to pass callback, the function returned by _erupt_ will possess a callback function as parameter used as THE callback of the communication.
Pretty nasty, huh?


## Fragmented in time

Some operations cannot be performed within a reasonable short timeframe. Let's say, a task is sent to another devision requesting for manual acknowledgement. This will make a gap between request and response for sure. Could be proven the measure of days as well...

The design you app should follow for such cases as follows:
The entity receiving the request must send back 'Request accepted'-like message to the sender and store the externalID and flowID of the communication:

```javascript
ignite( 'ManCanDo.sign', document, function () {
	console.log('Accepted.')
} )

...

let ManCanDo = {
	auditor: true,
	sign: function ( document, terms, ignite, callback ) {
		database.store( terms.sourceComm, document, callback )
	},
	_signed: function( document ) {
		let self = this
		database.readRequest( document, function(err, record){
			self.ignite( record.externalId, record.flowId, record.sourceDivision, record.source + '.signed', document )
		} )
	}
}
```

The param terms holds references about the incoming communication by the name of _sourceComm_.
You can store the _externalID_ if the communication has been initiated by an external party or just the _flowID_ if continuity must be ensured.


## License

(The MIT License)

Copyright (c) 2015 Imre Fazekas

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Bugs

See <https://github.com/imrefazekas/harcon/issues>.


## Changelog

- 3.0.0 : promise support added and tons of tweaks and features
- 2.0.0 : reimplemented architecture and division management
- 1.2.X : plugin architecture added
- 1.1.X : division concept added
- 1.0.X : serious fixes
- 1.0.0 : first stable release
- 0.9.0 : small redesign to allow to use in a Browserify/Webpack environment
- 0.8.0 : automated (re/un)deployment added, rewritten event coordination subsystem
- 0.6.0 : delivery fixes
- 0.5.0 : initial release
