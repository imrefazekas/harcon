Harcon - Microservice solution for the harmonic convergence of node-based enterprise entities or in-browser communication between web components. It serves as a messaging/service bus allowing your to orchestrate your entities.

[![NPM](https://nodei.co/npm/harcon.png)](https://nodei.co/npm/harcon/)


========
[harcon](https://github.com/imrefazekas/harcon) is a enterprise-level service bus for NodeJS/Browser giving superior abstraction layer for interoperability between entities in a highly structured and fragmented ecosystem. It allows you to design and implement complex workflows where context and causality of messages are important.

The library has a stunning feature list beyond basic messaging functionality.

- __Channel-agnostic__: harcon represents a very abstract messaging framework allowing you to use any underlaying technology your application requires: [AMQP](http://www.amqp.org), [ZeroMQ](http://zeromq.org), [XMPP](http://xmpp.org), etc...
For zeromq plugin, please check this: [harcon-zero](https://github.com/imrefazekas/harcon-zero)

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
var Inflicter = require('Inflicter');
var inflicter = new Inflicter( );

// define a listener function listening every message related to "greet" like "greet.goodmorning" or "greet.goodday"
inflicter.addict( null, 'peter', 'greet.*', function(greetings1, greetings2, callback){
	callback(null, 'Hi there!');
} );

// define an plain object serving as listener withing the context "greet" to messages "warm"
marie = {
	name: 'marie',
	context: 'greet',
	warm: function(greetings1, greetings2, callback){
		callback( null, 'Bonjour!' );
	}
};
inflicter.addicts( marie );

// sends a communication 'greet.everyone' with parameters and defines a callback to handle responses
// will receive back 2 answers: 'Hi there!' and 'Bonjour!'
inflicter.ignite( null, null, 'greet.everyone', 'Whatsup?', 'How do you do?', function(err, res){
	console.log( err, res );
} );
```
[Back to Feature list](#features)

## Workflows

In an enterprise-level system, one has to realize complex communication structure where lots of entities are following business logic and rules, involving subsystems and external resources, policies and other considerations, in short form: workflows.
I take the liberty to define the workflow now as well defined routes and causality of messages.
Simple method calls do the same, you can say. Yes and no.
In a workflow, you are not dependent on the response timeframe, workflows manage distance in time and space. The recepient of a message can be on another server or city or planet. Recepient can answer right away or tomorrow or never.

Let me show a very short example:
You are a company providing VPN services to customers.
Orders taken by agents go to some accounting and client management subsystem and eventually your subsystem dealing with the technical setup receives a request through an interface of yours.
Next step is to identify the network the user will be connected to, so a message is sent to the networking department who will respond maybe a day later. When it does, you have to continue your workflow where it is stopped, so you try to allocate network resources there and if it is successful you create a network configuration firmware to be used on the client's router to communicate with your backbone. When it is done by a config creator submodule of yours, you send it to an operation department for testing and when it is done you send back the results to the accounting for validation.
And of course everything must be traceable and reconstructable and maybe rollable backwards.
This is an extremely simplified use case, in real-life, workflows are much more complicated things and even harder to handle properly.

[harcon](https://github.com/imrefazekas/harcon) is not a workflow designer tool, __"just"__ a low-level library to manage such processes. You define entities and the communications among them then publish them.

You can resurrect a workflow if it failed and continue where it failed.
You have to understand some details to use this lib at full scale.

#### Entities

In [harcon](https://github.com/imrefazekas/harcon), the communication unit is called simple entity.
One can define 2 type of entities:
- simple function: when you associate a function with an event-pattern. Recommended to be used as observer, job-like, surveillance-, or interface-related asset.
```javascript
// Qualified name - will answer to only this message
inflicter.addict( null, 'hugh', 'allocate.ip', function(callback){
	callback(null, 'Done.');
} );
// Wildcards - will answer anything within the context greet
inflicter.addict( null, 'peter', 'greet.*', function(callback){
	callback(null, 'Done.');
} );
// Regular expression - will answer anything where message name start with string 'job'
inflicter.addict( null, 'john', /job.*/, function(callback){
	callback(null, 'Done.');
} );
```

- objects: service object enclosing service functions as a unique and complete context. Recommended to be used as business entities.
```javascript
var bookKeeper = {
	name: 'BookKeeper',
	context: 'booking',
	newOrder: function( customer, callback ){
		callback( null, 'Done.' );
	},
	ordersOfToday: function( callback ){
		callback( null, [] );
	}
};
...
inflicter.ignite( 'booking.newOrder', {name: 'Stephen', customerID:123}, function(err, res){
	console.log( 'Finished', err, res );
} );
inflicter.ignite( 'booking.ordersOfToday', function(err, res){
	console.log( 'Finished', err, res );
} );
```

#### Orchestration

Basically, you define service functions which can be called through its name (object-based entity) or expression evaluation (function-based entity). When you orchestrate a complex system, you define object-based entities providing functions to be called.
There are 2 orthogonal ways to orchestrate such entities in your system.

__Context__: a qualified name identifying the field/purpose the entity is operating. For example an entity parsing incoming JSON document can have the context "transfer" answering communications addressed to "transfer.parse" where __parse__ is the function provided by that entity. Within a given context, multiple entitiy can answer a communication with a given name.

```javascript
var parser = {
	name: 'JSONParser',
	context: 'transfer',
	parse: function( document, callback ){
		callback( null, 'Done.' );
	}
};
var observer = {
	name: 'Observer',
	context: 'transfer',
	parse: function( document, callback ){
		callback( null, null );
	}
};
```

Sending a message "transfer.parse" will be interpreted as follows:
context: "transfer"
functionSelector: "parse"
The entities published in the context "transfer" possessin the function "parse" will be notified and their service function will be invoked.

A context might contain subcontexts depending on the complexity of your system.


__Division__: divisions is a diffferent angle of orchestrating entities. A division is a closed "box" of entities, meaning that an entity can operate only within the division it is member of. Every entity belongs to a division. Divisions can be encapsulated, so a complete division-tree can be built-up in a harcon application. The reason why divisions are important, because it represents a responsibility unit. Entities within it (in normal cases) cannot see outside and an entity published to a container division can answer to messages initiated by an entity somewhere lower in the tree. This gives you a control to define surveillance-like or control-like features and much higher complexity of communication-management.

_Note_: these features are not mandatory to be used. The complexity will tell you how to orchestrate. If you only need function-based simple entities, feel free to go along with them. If you need to implement a highly structured money transaction management system in a financial environment, those features above will be urged to be defined.


#### Chain messages

To chain messages, define the next point in the workflow you have to add another parameter to your service function:
```javascript
var order = {
	name: 'Order',
	context: 'order',
	newVPN: function( customer, ignite, callback ){
		ignite( 'allocate.address', '127.0.0.1', function(err, res){
			callback(err, res);
		} );
	}
};
...
inflicter.ignite( 'order.newVPN', {name: 'Stephen', customerID:123}, function(err, res){
	console.log( 'Finished', err, res );
} );
```
That will initiate a small workflow. __inflicter.ignite__ send a message to entity Order who will send within the same workflow to the Allocator. When it answeres, then the message of the beginning will be answered. [harcon](https://github.com/imrefazekas/harcon) will know if you initiate a message within the processing of another one and considers it as part of the ongoing workflow and tracks it.
Mind the async execution to keep everything in track!

#### Call back or not?

You are not forced to always send answer, in some cases a quite entities is desired. If you do not define a callback neither side of the communication, [harcon](https://github.com/imrefazekas/harcon) will consider it as a one-ways message sending.
```javascript
// Qualified name - will answer to only this message
inflicter.addict( null, 'karl', 'reserve.address', function( address ){
	// Do something...
} );
...
inflicter.ignite( 'reserve.address', '127.0.0.1' );
```

#### Entity initialization

The need to pass contextual parameters to entities might rise. The options object passed to the constructure of Inflicter allows you to specify parameters for entities which will be passed while the init method defined in the entity is called.
```javascript
inflicter = new Inflicter( { /* ... */ marie: {greetings: 'Hi!'} } );
var marie = {
	name: 'marie',
	context: 'test',
	init: function (options) {
		// {greetings: 'Hi!'} will be passed
	}
	// services ...
};
```

#### Logging

When you create the Inflicter instance, you can pass a logger object which will be respected and used to do loggings. If not set, [harcon](https://github.com/imrefazekas/harcon) will log everything to the console. So in production, setting up a logging facility ( like [winston](https://github.com/flatiron/winston) or [bunyan](https://github.com/trentm/node-bunyan) ) is strongly adviced.
```javascript
inflicter = new Inflicter( { logger: logger /* ... */ } );
```

That logger instance will be used as logging facility all over the system, including internal services and entities.
Each entity receives a function: _harconlog_ with the signature:
```javascript
function( err, message, obj, level ){ ... }
```
That function can be used anything within your entity object:
```javascript
var Marie = {
	name: 'Marie',
	context: 'greet',
	whiny: function (greetings, callback) {
		this.harconlog( null, 'Some logging', { data: greetings }, 'silly' );
		callback( null, 'Pas du tout!' );
	}
};
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

By default, [harcon](https://github.com/imrefazekas/harcon) uses 32 as length of the IDs which are unique over time and among computer nodes. You can override this default when initiating Inflicter
```javascript
inflicter = new Inflicter( { /* ... */ idLength: 32 } );
```

## Message exchange

When you defined your components, the need to send and receive messages arises. In a workflow, your component might initiate a message, response one or while responding one sends other ones.
The function-based components can perform only the latter 2 cases, cannot initiate anything by its own. This type of components are present to define services, listeners, definitely not serious business entities.
As you saw above, the serices functions might possess a parameter before the __callback__: _ignite_

```javascript
var order = {
	name: 'Order',
	context: 'order',
	newVPN: function( customer, ignite, callback ){
		ignite( 'allocate.address', '127.0.0.1', function(err, res){
			callback(err, res);
		} );
	}
};
```

That ignite can be used to chain messages, which means to send messages during the processing of a received one. The tool to initiate sub-workflows.

Of course components are not just reacting entities, they might launch new workflows as well. Object-based components possesses an injected function: _ignite_ and can be used as follows:

```javascript
var timer = {
	name: 'Timer',
	scheduling: function( ){
		this.ignite( 'validate.accounts', function(err, res){
		} );
	}
};
```

That ignite function is injected by the [harcon](https://github.com/imrefazekas/harcon) when you publish the components.


## Divisions

Systems can be orchastrated into divisions which is a tree structure actually. One can create divisions following the control-flow or responsibility-chain of the application.
Every component you deploy will belong to a division. If not declared, then to the system division where all system-level components are put.
Divisions is not just a logical grouping of components, but also an encapsulation-model. A component cannot send messages outside the own division but can send to the inner ones. This means, that system components can send to any component, but non-system components cannot reach the level of the main system or other branches of the division-tree.

Divisions give you a very easy-to-use structure to orchestrate your system. Of course, you can use the [harcon](https://github.com/imrefazekas/harcon) without using divisions, the complexity of your system will show if you needed it or not.

Let's define components and add them to divisions:

```javascript
// This will add John to the division 'workers'
inflicter.addict( 'workers', 'john', /job.*/, function(callback){
	callback(null, 'Done.');
} );
// This will add Claire to the division 'entrance'
var claire = {
	name: 'claire',
	division: 'entrance',
	context: 'greet',
	simple: function (greetings1, greetings2, callback) {
		callback(null, 'Enchanté, mon plaisir!');
	}
};
```

Components in a division can be called to:

```javascript
inflicter.ignite( null, 'entrance', 'greet.simple', 'Hi', 'Ca vas?', function(err, res){
} );
```

Note: please keep in mind, that __inflicter.ignite__ can be and should be used only when you initiate a workflow from outside the harcon!


## Entity configuration

Entities can be configured easily. The _init_ method of an entity if present, will be called at the end of its publishing process withing the [harcon](https://github.com/imrefazekas/harcon).
The function can be used to set up DB connections or anything required for your entities.
```javascript
module.exports = {
	name: 'Claire',
	context: 'greet',
	init: function (options, callback) {
		console.log('Init...', options);
		callback();
	}
};
```
The method receives a configuration object and a callback to be called when the init method finishes.
That configuration object can be passed when an entity is published:
```javascript
inflicter.addicts( Claire, config );
```
or even before, when [harcon](https://github.com/imrefazekas/harcon) is created.
```javascript
inflicter = new Inflicter( { logger: logger, idLength: 32, Claire: {greetings: 'Hi!'} } );
```

## Extension

[harcon](https://github.com/imrefazekas/harcon) can be easily extended by using pure harcon components listening to system events:
```javascript
var extension = {
	name: 'As you design it',
	context: inflicter.name,
	castOf: function( name, firestarter ){
	},
	affiliate: function( firestarter ){
	},
	close: function(){
	}
}
inflicter.addicts( extension );
```
In the current version, the inflicter instance you are using will send to your components events about system closing, entity publishing and revoking. For a working example, please check [harcon-radiation](https://github.com/imrefazekas/harcon-radiation).


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

- 1.0.X : serious fixes
- 1.0.0 : first stable release
- 0.9.0 : small redesign to allow to use in a Browserify/Webpack environment
- 0.8.0 : automated (re/un)deployment added, rewritten event coordination subsystem
- 0.6.0 : delivery fixes
- 0.5.0 : initial release
