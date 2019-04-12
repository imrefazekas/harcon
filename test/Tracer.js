let initTracer = require('jaeger-client').initTracer
let SpanContext = require('jaeger-client/dist/src/span_context.js').default

var config = {
	serviceName: 'my-awesome-service',
	reporter: {
		agentHost: 'localhost',
		agentPort: 6832
	}
}
let tracer = initTracer(config)

let Clerobee = require('clerobee')
let clerobee = new Clerobee( 32 )

let traceId = Buffer.from( clerobee.generate(), 'utf-8')
let spanId = Buffer.from( clerobee.generate(), 'utf-8')

console.log('-------', traceId, SpanContext)
let SC = SpanContext.withStringIds(traceId, spanId, '')
tracer.inject(SC, 'binary')

const span = tracer.startSpan( 'EXAMPLE', {
	startTime: 1000
} )
const context = span.context()
console.log('>>>>>>>>', context)

span.setTag('hello', 'world')
span.log( { foo: 'bar' } )

console.log('do stuff...')

span.finish( Date.now() )
// (this, operationName, spanContext, startTime, references)
