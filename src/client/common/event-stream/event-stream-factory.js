const {api} = require("../api");
const {socket} = require("../ws/ws-c");

const EventStreamFactory = {
    createEventStream({getToken}) {
        return {
            subscribe: (url, watcher)=> {
                let closed = false;
                let cleanup;
                api.post("/event-stream/subscribe", {url}).then((subscribeResult)=> {
                    if (subscribeResult.success && !closed) {
                        watcher(subscribeResult.data);
                        socket.emit("event-stream:join", {url, token: getToken()});
                        socket.on("event-stream:update:" + url, watcher);
                        cleanup = ()=> socket.removeListener("event-stream:update:" + url, watcher);
                    }
                });
                return () => {
                    closed = true;
                    cleanup && cleanup();
                };
            }
        };
    }
};

exports.EventStreamFactory = EventStreamFactory;