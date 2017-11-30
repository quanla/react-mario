var EventStreamFactory = require("./event-stream-factory.js").EventStreamFactory;
const eventStream = EventStreamFactory.createEventStream({getToken: () => null});

exports.eventStream = eventStream;