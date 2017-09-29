Harcon - Proven and reliable microservice solution for the harmonic convergence of JS entities.
Designed to be insanly scalable to serve enterprise components of real-time systems.

Harcon is strong to build a scalable execution-chain or workflow-based or machine-learning solution for NodeJS applications.

Need help? Join me on

[![Join the chat at https://gitter.im/imrefazekas/harcon](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/imrefazekas/harcon?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![npm version](https://badge.fury.io/js/harcon.svg)](http://badge.fury.io/js/harcon) [![Code Climate](https://codeclimate.com/github/imrefazekas/harcon/badges/gpa.svg)](https://codeclimate.com/github/imrefazekas/harcon)

and level your problem with me freely. :)

!Note: From version 8.0.0, harcon supports only Node v8 and await functions. For callback-based version please use v7 or below.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

========

[harcon](https://github.com/imrefazekas/harcon) is a microservice solution for NodeJS/Browser giving superior abstraction layer for interoperability between entities in a highly structured and fragmented ecosystem.
It allows you to design and implement complex workflows and microservices where context and causality of messages are important.

The library has a stunning feature list beyond basic messaging functionality.

- __Channel-agnostic__: harcon represents a very abstract messaging framework allowing you to use any underlaying technology your application requires: [AMQP](http://www.amqp.org), [MQTT](http://mqtt.org), [Amazon SQS](https://aws.amazon.com/sqs/), etc...
For amqp integration, please check this: [harcon-amqp](https://github.com/imrefazekas/harcon-amqp)
For sqs integration, please check this: [harcon-sqs](https://github.com/imrefazekas/harcon-sqs)
For mqtt integration, please check this: [harcon-mqtt](https://github.com/imrefazekas/harcon-mqtt)
For kafka integration, please check this: [harcon-kafka](https://github.com/imrefazekas/harcon-kafka)

- __Tracking__: you can monitor every message delivered (request or response) by only few lines of code

- __Flow control / Reproducibility__: A flow of communication / messages can be halted / continued / reinitiated anytime with no effort

- __Free orchestration__: your system can be orchestrated and distributed as you wish, message delivery is not limited to nodes or hosts

- __Short learning curve__: no need to learn hundred of pages, communication has to be simple after all

- __Log-free coding__: no more mixture of logging and business logic. Harcon logs all messages exchanged.

- __Transparent__: although harcon introduces lots of complex types and structures, your code will be kept clean and pure, everything is (un)packed in the background in a transparent way

- __Smooth infiltration__: your objects / functions will possess the necessary services via injection, no need to create complex structures and compounds

- __Advanced routing & listening__: system fragmentation, qualified names, regular expressions, wildcards, etc.

- __Execution-chain__: toolset to easily define execution paths between entities to relay messages and results.

- __Business-transaction__: small helpers to manage business executions paths as (distributed) transactions.

__!Note__: Harcon's concept is to introduce a clean and high abstraction layer over messaging between entities. Like in case of every abstraction tool, for webapps which are simple as 1, it can be proven as a liability.

This library starts to shine in a highly structured and distributed environment.



## Installation

$ npm install harcon


## Quick setup
```javascript
var Harcon = require('harcon')
let harcon = new Harcon( { /* opts */ } )
let inflicter = await harcon.init()


// define a listener function listening every message related to "greet" like "greet.goodmorning" or "greet.goodday"
await inflicter.addict( null, 'peter', 'greet.*', async function (greetings1, greetings2) {
	return 'Hi there!'
} )

// define an plain object serving as listener withing the context "greet" to messages "warm"
marie = {
	name: 'marie',
	context: 'greet',
	warm: async function (greetings1, greetings2) {
		return 'Bonjour!'
	}
}
await inflicter.addicts( marie )

// sends a communication 'greet.everyone' with parameters and waits for responses
// will receive back 2 answers: 'Hi there!' and 'Bonjour!'
await harcon.simpleIgnite( 'greet.everyone', 'Whatsup?', 'How do you do?' )
```



## Workflows

In an enterprise-level system, one has to realize complex communication structure where lots of entities are following business logic and rules, involving subsystems and external resources, policies and other considerations, in short form: workflows.
I take the liberty to define the workflow now as well defined routes and causality of messages.
In a workflow, you are not dependent on the response timeframe, workflows manage distance in time and space. The recipient of a message can be on another server or city or planet. Recipient can answer right away or tomorrow or never.

In the JS world, one should mind the introduction of [microservices](http://martinfowler.com/articles/microservices.html) to start with right in the beginning. Just take the advantage of better orchestration, simpler development and debugging, easier deployment, scaling and monitoring.


[harcon](https://github.com/imrefazekas/harcon) is __"just"__ a low-level library to leverage such concept.
_In a simple way, you define entities and the communications among them then publish them._



## Execution-chain

In a microservice architecture, the key to design and orchestrate a working and living system is to abstract out the control in some form and write business logic fitting that abstract description.

[harcon](https://github.com/imrefazekas/harcon) provides the [Bender](#bender) chapter for details, but please learn the basics of harcon before entering the rabbit hole, it is not without a reason that chapter is at the end of the documentation... ;)



## Business transactions

When execution is defined by execution-chains, harcon is capable to tell when a given flow really terminated and inform all entities about the termination opening the gate to the distributed transaction management, when all entities participating to a given flow might react to its termination, performing DB operations for example.

Please check chapter [Transactions](#transactions) for detail.



#### Entities

In [harcon](https://github.com/imrefazekas/harcon), the communication unit is simply called __entity__.
One can define 2 type of entities:
- simple function: when you associate a function with an event-pattern. Recommended to be used as observer, job-like, surveillance-, or interface-related asset.
```javascript
// Qualified name - will answer to only this message
inflicter.addict( null, 'hugh', 'allocate.ip', async function () {
	return 'Done.'
} )
// Wildcards - will answer anything within the context greet
inflicter.addict( null, 'peter', 'greet.*', async function () {
	return 'Done.'
} )
// Regular expression - will answer anything where message name start with string 'job'
inflicter.addict( null, 'john', /job.*/, async function ( partner ) {
	return 'Done.'
} )
...
let res = await inflicter.simpleIgnite( 'job.order', { name: 'Stephen', customerID:123 } )
let res = await inflicter.simpleIgnite( 'john.job', { name: 'Stephen', customerID:123 } )
```

- objects: plain object enclosing functions and a unique name. This is the recommended way to define entities.
```javascript
var bookKeeper = {
	name: 'BookKeeper',
	...
	newOrder: async function ( customer ) {
		return 'Done.'
	},
	ordersOfToday: async function ( ) {
		return []
	}
}
...
let res = await inflicter.simpleIgnite( 'BookKeeper.newOrder', {name: 'Stephen', customerID:123} )
let res = await inflicter.simpleIgnite( 'BookKeeper.ordersOfToday' )
```

The simplest but not the only way to address is to quality entities with their names.

__!Note:__ The following names are strictly forbidden to be used as entity names in any lower- or uppercase version: 'Barrel', 'Bender', 'Blower', 'Communication', 'Fire', 'Firestarter', 'Firestormstarter', 'FireBender', 'Flamestarter', 'FlowBuilder', 'FlowReader', 'Inflicter', 'Mortar', 'Warper'

Those are used by [harcon](https://github.com/imrefazekas/harcon) itself.

All services have to return with a Promise object.



#### Responses

By default, [harcon](https://github.com/imrefazekas/harcon) returns and array of response objects returned by the entities addressed by a message sent or a single object if only one entity has been addressed by the request.

Let's have 2 simple entities:

```javascript
inflicter.addict( null, 'peter', 'greet.*', async function () {
	return 'Hi.'
} )
inflicter.addict( null, 'camille', 'greet.*', async function () {
	return 'Hello.'
} )

let res = await inflicter.simpleIgnite( 'greet.simple' )
```

Returns with the following:

	[ 'Hi.', 'Hello.' ]

In some cases, you might find useful to know which answer comes from which entity. If you add a single parameter to the harcon:

	new Harcon( { namedResponses: true } )

The returned object will look like this:

	{ peter: 'Hi.', camille: 'Hello.' }

__!Note:__ Harcon allows you to enforce the "responses are always arrays" behaviour. Please read [Unfolding](#unfolding) for details.



#### Error responses

Your functions might receive an error object in unwanted situations. The default transport channel of harcon will stop the message processing at the first error occurring as follows:

```javascript
inflicter.addict( null, 'peter', 'greet.*', async function () {
	throw new Error('Stay away, please.')
} )
inflicter.addict( null, 'camille', 'greet.*', async function () {
	throw new Error('Do not bother me.')
} )

try {
	await inflicter.simpleIgnite( 'greet.simple')
} catch (err) {
	console.error( err, res )
}
```

will result the following on your console:

	[Error: Stay away, please.]

The default transport layer is designed for development purposes only.
In an EE, environment, please mind the introduction of a message queue solution like: [AMQP](http://www.amqp.org), [SQS](https://aws.amazon.com/sqs/), [MQTT](http://mqtt.org) or [Kafka](https://kafka.apache.org) using official plugins: [harcon-amqp](https://github.com/imrefazekas/harcon-amqp), [harcon-sqs](https://github.com/imrefazekas/harcon-sqs), [harcon-mqtt](https://github.com/imrefazekas/harcon-mqtt) and [harcon-kafka](https://github.com/imrefazekas/harcon-kafka) accordingly.

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
	parse: async function ( document ) {
		return 'Done.'
	}
}
var observer = {
	name: 'XMLParser',
	context: 'transfer.xml',
	parse: async function ( document ) {
		return 'Done.'
	}
}
```

In this case, such messages can be sent:

```javascript
await inflicter.simpleIgnite( 'transfer.json.parse' )
or
await inflicter.simpleIgnite( 'transfer.xml.parse' )
or
await inflicter.simpleIgnite( 'transfer.'+document.type+'.parse' )
```

addressing directly to one of those entities, depending the type of the document you want to parse.
Let's define the following entity:

```javascript
var observer = {
	name: 'Observer',
	context: 'transfer',
	parse: async  function ( document ) {
		return 'Done.'
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
	newVPN: async function ( customer, ignite ) {
		return await ignite( 'allocate.address', '127.0.0.1' )
	}
}
...
await inflicter.simpleIgnite( 'order.newVPN', {name: 'Stephen', customerID:123} )
```
That will initiate a small workflow. __harcon.simpleIgnite__ sends a message to entity Order who will send within the same workflow to the Allocator. When it answeres, then the message of the beginning will be answered. [harcon](https://github.com/imrefazekas/harcon) will know if you initiate a message within the processing of another one and considers it as part of the ongoing workflow and tracks it.
Mind the async execution to keep everything in track!



#### Entity initialization

The need to pass contextual parameters to entities might rise. The options object passed to the constructure of [harcon](https://github.com/imrefazekas/harcon) allows you to specify parameters for entities which will be passed while the init method defined in the entity is called.
The __init__ function like all services, must return with a promise object!

```javascript
harcon = new Harcon( { /* ... */ marie: {greetings: 'Hi!'} } )
var marie = {
	name: 'marie',
	context: 'test',
	init: async function (options) {
		// {greetings: 'Hi!'} will be passed
		return 'Initiated.'
	}
	// services ...
}
```



#### Distinguishing entities

There is an option for an object-based entity to enforce uniqueness:

```javascript
module.exports = {
	name: 'Charlotte',
	distinguish: 'Unique',
	access: async function ( ) {
		return 'D\'accord?'
	}
}
```

The attribute 'distinguish' can be a boolean or a string which will be added to its name as a postfix. In case of boolean value, a random value will be generated.

The entity can be called with __'Charlotte-Unique.access'__ or __'Charlotte-1231441123.access'__ where __'1231441123'__ is the random string generated by the [harcon](https://github.com/imrefazekas/harcon).

This feature is useful in a largely scaled environment, where a given entity might appear in multiple instances and distinguishing them is a must-have behavior.

The entity will be still available with its own name: 'Charlotte'. You can consider it as a synonym or alternative name.



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
	whiny: async function (greetings) {
		this.harconlog( null, 'Some logging', { data: greetings }, 'silly' )
		return 'Pas du tout!'
	}
}
```
That function should be used for any logging activity you need during the flow of your app.

__Important__: Harcon logs all incoming and outgoing messages at the level 'igniteLevel' set in the configuration file making every-day logging activities unnecessary. You might want to change the default level of this behaviour in order to refine your logging strategy.

```javascript
harcon = new Harcon( { igniteLevel: 'info' /* ... */ } )
```

An entity might exclude itself from the logging process by possessing the attribute "concealed":

```javascript
var Marie = {
	name: 'Marie',
	concealed: true,
	...
}
```

That will turn off the logging of all messages sent or received by the entity 'Marie'.

Another option is to set the the list of entities unlogged.

```javascript
harcon = new Harcon( { seals: [ 'Marie' ] /* ... */ } )
```

That will turn off the logging of all messages sent to Marie. So no answers received by other entities from Marie will be logged.



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
As you saw above, the serices functions might possess a parameter: _ignite_

```javascript
var order = {
	name: 'Order',
	context: 'order',
	newVPN: async function ( customer, ignite ) {
		return await ignite( 'allocate.address', '127.0.0.1' )
	}
}
```

That ignite can be used to chain messages, which means to send messages during the processing of a received one. The tool to initiate sub-workflows.

Of course components are not just reacting entities, they might launch new workflows as well. Object-based components possesses an injected function: _ignite_ and can be used as follows:

```javascript
var timer = {
	name: 'Timer',
	scheduling: async function ( ) {
		return await this.ignite( 'validate.accounts' )
	}
}
```

That ignite function is injected by the [harcon](https://github.com/imrefazekas/harcon) when you publish the components.



## The terms object

In a workflow, a contextual object is much desired to set the context where business entities are participating and share some environmental state or values.
If you implement a financial transaction management system, currencies should be added to the terms object making the information accessible to all entities interoperating within the workflow.

Should you define your business functions as below, the terms will be passed and managed by [harcon](https://github.com/imrefazekas/harcon)

```javascript
module.exports = {
	name: 'Claire',
	init: async function (options) {
		return 'Initiated.'
	},
	simple: async function (greetings1, greetings2, terms, ignite) {
		return 'Pas du tout!'
	}
}
```

Along the parameters you need for your business logic, and the ignite function introduced earlier, the terms can be added to the parameter list in the right order shown above.

```javascript
module.exports = {
	name: 'Domina',
	force: async function ( terms, ignite ) {
		var self = this
		terms.tree = 'grow'
		return await ignite( 'Claire.simple', 'It is morning!', 'Time to wake up!' )
	}
}
```

The 'tree' attribute set by entity 'Domina' will be seen by the entity 'Claire' when it receives the message.



## Divisions

When you orchastrate your system as a microservice architure over a clustered message bus for example, the individual microservicSystems can be orchastrated into divisions which is a tree structure actually. One can create divisions following the control-flow or responsibility-chain of the application.
Every component you deploy will belong to a division. If not declared, then to the system division where all system-level components are put.
Divisions is not just a logical grouping of components, but also an encapsulation-model. A component cannot send messages outside the own division but can send to the inner ones. This means, that system components can send to any component, but non-system components cannot reach the level of the main system or other branches of the division-tree.

Divisions give you a very easy-to-use structure to orchestrate your system. Of course, you can use the [harcon](https://github.com/imrefazekas/harcon) without using divisions, the complexity of your system will show if you needed it or not.

Let's define components and add them to divisions:

```javascript
// This will add John to the division 'workers'
harcon.addict( 'workers', 'john', /job.*/, async function () {
	return 'Done.'
} )
// This will add Claire to the division 'entrance'
var claire = {
	name: 'claire',
	division: 'entrance',
	context: 'greet',
	simple: async function (greetings1, greetings2) {
		return 'Enchanté, mon plaisir!'
	}
}
```

Components in a division can be called to:

```javascript
await inflicter.ignite( null, 'entrance', 'greet.simple', 'Hi', 'Ca vas?' )
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
	init: async function (options) {
		console.log('Init...', options)
		return 'Initiated.'
	}
}
```
The method receives the associated configuration object.
That configuration object can be passed when an entity is published:
```javascript
await inflicter.addicts( Claire, config )
```
or even before, when [harcon](https://github.com/imrefazekas/harcon) is created.
```javascript
harcon = new Harcon( { logger: logger, idLength: 32, Claire: {greetings: 'Hi!'} } )
```

An entity's configuration is an merged object made from the followings (in order):

- environment variables derived from process.env
- the [millieu](#millieu) object in the configuration of harcon
- object in harcon configuration associated through the name of the entity
- the direct configuration passed to the function addicts

Should you use none of them, and your entity shall be initiated with empty object.



## Timeout management

[harcon](https://github.com/imrefazekas/harcon) has an internal handler to deal with messages not answered within a reasonable timeframe.

```javascript
harcon = new Harcon( { ..., blower: { commTimeout: 2000 } } )
```

This configuration will tell your running harcon instance to check if the messages sent to some entities have been answered within __2000__ millisecs. If not, an error will be sent to the sender with the message: __'Communication has not been received answer withing the given timeframe.'__

The nature of your app might urge you to distinguish time management following some business logic. For example: operations involving third party APIs have to be performed with a wider or without time limitation. [harcon](https://github.com/imrefazekas/harcon) supports such demand in many ways.

In the simplest case:

```javascript
harcon = new Harcon( { ..., blower: { commTimeout: 2000, tolerates: [ 'Alizee.superFlegme' ] } } )
```

The field __'tolerates'__ can be defined as an array of strings turning off the global timeout management for the communication enclosing the given messages.

The array tolerate might be enlisting strings, regexp values, functions or objects evaluated as follows:

- Strings will be matched to the event of the message
- Regexp will be matched to the event of the message
- Function will be called by passing the ongoing communication object and the boolean return value will determine if timeout management should be applied.
- Object's _event_ attribute will be matched as the string case above and the timeout will be set by the 'timeout' attribute of the object.

Please find some examples below:

```javascript
harcon = new Harcon( { ..., blower: { commTimeout: 2000, tolerates: [ 'Alizee.superFlegme' ] } } )
... or ...
harcon = new Harcon( { ..., blower: { commTimeout: 2000, tolerates: [ /Alizee\.\w+/g ] } } )
... or ...
harcon = new Harcon( { ..., blower: { commTimeout: 2000, tolerates: [ function (comm) { return comm.event === 'Alizee.flegme' } ] } } )
... or ...
harcon = new Harcon( { ..., blower: { commTimeout: 2000, tolerates: [ { event: 'Alizee.flegme', timeout: 2000 } ] } } )
```

You can mix the techniques as your business logic demands.

!Note: Please, keep it mind, that harcon is transport layer agnostic, so a preferred message broker can also provide some security over interaction.



## Extension

[harcon](https://github.com/imrefazekas/harcon) can be easily extended by using pure harcon components listening to system events:
```javascript
var extension = {
	name: 'As you design it',
	context: harcon.name,
	castOf: async function ( name, firestarter ) {
		return 'OK'
	},
	affiliate: async function ( firestarter ) {
		return 'OK'
	},
	close: async function () {
		return 'OK'
	}
}
await inflicter.addicts( extension )
```
In the current version, the harcon instance you are using will send to your components events about system closing, entity publishing and revoking. For a working example, please check [harcon-radiation](https://github.com/imrefazekas/harcon-radiation).

All funtions must return a promise object.



## Millieu

There is a "shared" environmental object added to all entities deployed within [harcon](https://github.com/imrefazekas/harcon):

```javascript
harcon = new Harcon( { millieu: { workDir: '/temp' } } )
```

That object will be inserted into the initial configuration of all Entities published:

```javascript
var Marie = {
	name: 'Marie',
	init: async function (options) {
		// options = { workDir: '/temp' }
		self.options = options
		return 'OK'
	}
}
```

In any service of entity 'Marie', the _'self.options.workDir'_ will be a valid object.

__!Note:__ please keep in mind, that some transport layers might restrict the size or the content of the packets relayed. Use millieu object wisely.



## State shifting

There is a reverse-directed-like feature in [harcon](https://github.com/imrefazekas/harcon), allowing an entity to shift "internal state" and let other entities to know about it.
Let's say, entities of a system want to know when the DB component becomes "available", or when a third party connector entity becomes "connected".

To build such constellation between entities, is pretty straightforward:

```javascript
module.exports = {
	name: 'Lina',
	...
	registerForShift: function () {
		await self.ignite('Marie.notify', 'data', 'Lina.marieChanged' )
	},
	...
	marieChanged: async function ( payload ) {
		console.log( '>>>>>>>>>>>', payload )
		return 'OK'
	}
}
```

In function _'registerForShift'_ _'Lina'_ tells _'Marie'_ to notify her if the state _'data'_ is changing. The function to be called is _'marieChanged'_. The new value of the given state should be passed.
State is a string. It does not need to be represented as attribute or whatever, just a pure string - object pair.

How Marie can "shift" state:

```javascript
module.exports = {
	name: 'Marie',
	simple: async function (greetings1, greetings2) {
		this.shifted( { data: 'content' } )
		return 'Bonjour!'
	}
}
```

Anytime _Marie_ calls its internal _'shifted'_ function, it triggers the [harcon](https://github.com/imrefazekas/harcon)'s state changing service. You have to pass an object possessing all properties considered to be "states". So an object might shift multiple states at once if needed. The values of the attributes are the payload to send to the listener entities.
That __this.shifted( { data: 'content' } )__ line will initiate an internal communication with the addressing _'Lina.marieChanged'_ as _Lina_ specified. And the function _'marieChanged'_ of _Lina_ will be called with the string _'content'_ passed as payload.



## Interoperating with other harcon instances

By default harcon blocks acts like a blackbox allowing to exchange communication within the main division / name of the system deployed.
If you pass an attribute _'connectedDivisions'_ to the config of harcon, it will accept communication from the enlisted divisions and allow you to connect to those ones.



## Unfolding

The basic concept of [harcon](https://github.com/imrefazekas/harcon) is to relay messages between entities where m:n quantity relationship for delivery is supported. Harcon measures if the response means a single object or a list of objects and returns accordingly.
That behaviour can be turned off to force harcon to return always with an array:

```javascript
let harcon = new Harcon( {
	name: harconName,
	unfoldAnswer: false,
	...
} )
```



## Bender

Bender is a high-level entity over microservices aims to introduce a simple, yet powerful execution-chain-tool for architects helping to drive message relaying between entities in a regulated environment.

How it works: you define your execution logic which is a set of rules pairing
- a message
- a list of messages induced when that message is answered.

Let's say you want to see the following informal execution to be performed:

```javascript
'Order.registerOrder' -> 'DB.storeOrder', 'DB.checkStore', 'Mailer.sendNotif'
```

The event registerOrder will trigger 3 order messages to be sent. Rolling the execution of your business workflow further.
In other way, you can liberate your execution chain from low-level source code. The entity Bender is dedicated to help with you on this road.

One can activate it by using the following configuration:

```javascript
let harcon = new Harcon( {
	name: harconName,
	bender: { enabled: true },
	FireBender: {
		defs: {
			// rules here
		}
	}
	...
} )
```

One has 2 ways to set chain definitions:
- read flow description files from a folder. For this option please check [harcon-flow](https://github.com/imrefazekas/harcon-flow) for details...
- manual flow definition rules

Syntax of a rule definition:

```javascript
{event_name}: {
	type: {execution_type},
	primers: [ {target} ]
}

{execution_type} : 'series' || 'waterfall' || 'spread'

{target} : { division: {domain_name}, event: {event_name}, skipIf: {condition} } || {event_name}

{condition} : {event_name} || function
```

Each rule is set of a message, a list of steps to make (called primers), and an optional validation object
For example :

```javascript
'Order.registerOrder': { primers: [ 'DB.storeOrder', 'DB.checkStore', 'Mailer.sendNotif' ], validation: { minlength: '3' } }

or

'Order.registerOrder': { primers: [ 'DB.storeOrder', 'DB.checkStore', 'Mailer.sendNotif' ], validation: function (payload) { return true } }
```

That works as follows: an entity or external event triggers the message 'registerOrder' sent to entity 'Order'. The call will be performed and the result of that call will be passed as parameter to all messages enlisted in the array 'primer'. So the entity 'DB' will receive the message 'storeOrder' automatically triggered by the message 'Order.registerOrder'. When 'DB' is finished, 'checkStore' will be triggered and so on.
Default execution type is 'series' means sequential execution of the given list.

Validation object can be a JS object or a function. It is used to validate the payload of the message _'registerOrder'_ sent to entity _'Order'_. The functions should return a boolean value to tell if the payload is valid. If the validation is an object, the [vindication.js](https://github.com/imrefazekas/vindication.js) will be used for validation.

Bender is turns harcon into a strict message delivery environment, which means if an event is not recognised by Bender or in other words, there is no rule for that given event, an exception will be thrown to the caller and no message delivery will be performed.

There are several type of execution defined by the {execution_type} above.
- 'series' means to execute all steps in sequential order passing the result of 'Order.registerOrder' to each of them and returning the collected results to the caller of 'Order.registerOrder'.
```javascript
'Order.registerOrder': { type: 'series', primers: [ 'DB.storeOrder', 'DB.checkStore', 'Mailer.sendNotif' ] }
```

- 'waterfall' means a waterfall-like execution. Bender passes the result of 'Order.registerOrder' to 'DB.storeOrder' and 'DB.checkStore' will receive the result of 'DB.storeOrder' and so on...
```javascript
'Order.registerOrder': { type: 'waterfall', primers: [ 'DB.storeOrder', 'DB.checkStore', 'Mailer.sendNotif' ] }
```

- 'spread' means concurrent message sending to all entities enlisted in the array of 'primers'. Basically this is the bulked execution of message sending of entities.
```javascript
'Order.registerOrder': { type: 'spread', primers: [ 'DB.storeOrder', 'DB.checkStore', 'Mailer.sendNotif' ] }
```

The attribute 'skipIf' defines the 'execution-gate' for a given step.
It can be a message string or a function. If it is

- a string, so a message, the given message will be sent to the referred entity and the answer should possess the "allowed" attribute with a value coercing to true to allow the execution of the given step. Will be ignored otherwise. If error is sent back, all remaining steps will be ignored as well.

- a function, the answer coerces to true will allow to perform the step. Will be ignored otherwise. If error is thrown, all remaining steps will be ignored as well.

Attribute 'skipIf' can be used only for 'series' and 'waterfall' as logic follows.

__Important__: The Bender entity has a message 'completeness' telling which entities or services are still missing breaking the business flow(s) defined.

__Note__: harcon tries to validate the passed definitions searching for circles or crossing references. The Bender entity will fail to initialise if the validation process on the definitions falls.



## Transactions

When [Bender](#bender) is activated and your flows are well defined through its services, your entities became capable of reacting the termination of your business flows. That serves to handle flows as transactions.

To be straightforward, when a business flow ends, your entities will be notified and can commit DB transactions to finalize their operations.

Each entity you define will possess the following functions:
```javascript
flowFailed: async function ( flowID, errMessage, terms, ignite ) {
	...
}
flowSucceeded: async function ( flowID, result, terms, ignite ) {
	...
}
```
By default, it does not do anything. If your entity aims to react to 'flowFailed' or 'flowSucceeded' events, override those functions in the source code of your entity. The function must return a promise...

During your business logic, you business logic should access the flowID through the variable 'terms':
```javascript
sign: async function ( document, terms, ignite ) {
	// terms.sourceComm.flowID hold the flowID of the current business flow
	// use it to store some records in your favorite in-memory storage to access it when 'flowTerminated' is induced.
}
```

If you want to use Bender without transaction management, the following configuration will turn it off :

```javascript
let harcon = new Harcon( {
	bender: { enabled: true, igniteTermination: false },
	...
} )
```

__Note__: Please keep in mind, that if you are using a scaling solution, for the safety of the transactions,  [harcon](https://github.com/imrefazekas/harcon) does not distinguish the nodes, one has to facilitate the state sharing between nodes using Redis or similar tool.



## Fragmented in time

Some operations cannot be performed within a reasonable short timeframe. Let's say, a task is sent to another devision requesting for manual acknowledgement. This will make a gap between request and response for sure. Could be proven the measure of days as well...

The design you app should follow for such cases as follows:
The entity receiving the request must send back 'Request accepted'-like message to the sender and store the externalID and flowID of the communication:

```javascript
await ignite( 'ManCanDo.sign', document )
console.log('Accepted.')

...

let ManCanDo = {
	auditor: true,
	sign: async function ( document, terms, ignite ) {
		await database.store( terms.sourceComm, document )
	},
	_signed: async function( document ) {
		let self = this
		let record = await database.readRequest( document )
		await self.ignite( record.externalId, record.flowId, record.sourceDivision, record.source + '.signed', document )
	}
}
```

The param terms holds references about the incoming communication by the name of _sourceComm_.
You can store the _externalID_ if the communication has been initiated by an external party or just the _flowID_ if continuity must be ensured.



## Live-reload entities

There is a built-in entity in [harcon](https://github.com/imrefazekas/harcon): __Mortar__ dedicated to

- collect the entities from a folder - not considering subfolders
- publish them to [harcon](https://github.com/imrefazekas/harcon)
- live-reload the ones which changed during runtime

To activate it:

```javascript
harcon = new Harcon( { ..., mortar: { enable: true, folder: '', liveReload: false } } )
```


## Wrappers

Wrappers are a special services in [harcon](https://github.com/imrefazekas/harcon) allowing to specialize messages before sending them out and - as a gatekeeper, - validate them before delivering them. That functionality is meant to define some kind of contract between entities or [harcon](https://github.com/imrefazekas/harcon) systems.

For example, in order to provide an inter-service security in a highly fragmented microservice architecture, the entities must know if the message is really cominng fron the given entity and answers also have to be ensured to be not forged by any third party, independently of any geographical distribution.
A Warper can ensure, that messages are creating for example signed messages which can be verified by the other entities easily and vica versa.
The system has a default global warper, defining an "always allow" policy for all services and communication. To provide a custom warper, you might want to refine the 'Barrel' settings when initializing the harcon as follows:

```javascript
harcon = new Harcon( { ..., barrel: { Warper: [WarperCreatorFunction] } } )
```

A [WarperCreatorFunction] will be called and instantiated as follows:

```javascript
let warper = new [WarperCreatorFunction]( this.division, config.connectedDivisions )
```

The current division and all connected divisions of the current [harcon](https://github.com/imrefazekas/harcon) will be passed.

Warpers define the following services to be implemented:

```javascript
function conform( comm ) ... // to be called before sending out a message
function referenceMatrix ( object ) ... // to be called optionally if some external data should be considered
function allow ( communication ) ... // to be called before delivering a message
```

All functions are synchronous.

The [harcon-ecdsa-warper](https://github.com/imrefazekas/harcon-ecdsa-warper) defines az ECDSA-based security layer for [harcon](https://github.com/imrefazekas/harcon), please check for details.


## License

(The MIT License)

Copyright (c) 2017 Imre Fazekas

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
