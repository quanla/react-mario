const RegexUtil = require("../../../utils/regex-util.js").RegexUtil;

const streams = [];

function createUrlFormatter(urlFormat) {
    const ptn = /:([^/]+)/g;

    let tokens = [];
    let index = 0;
    for (let match;(match = ptn.exec(urlFormat)) != null;) {
        if (match.index > index) {
            let str = urlFormat.substring(index, match.index);
            tokens.push((params)=> str);
        }

        let paramName = match[1];
        tokens.push((params)=> params[paramName]);

        index = match.index + match[0].length;
    }
    if (index < urlFormat.length) {
        let str = urlFormat.substring(index);
        tokens.push((params)=> str);
    }

    return (params)=> {
        return tokens.map((token)=> token(params)).join("");
    };
}

function createUrlParser(urlFormat) {

    let paramNames = [];
    let ptn = new RegExp("^" + RegexUtil.replaceAll(urlFormat, ":([^/]+)", (m)=> {
        paramNames.push(m[1]);
        return "([^/]+)";
    }) + "$");


    return (url)=> {
        let match = ptn.exec(url);
        if (match == null ) {
            return null;
        }
        let ret = {};
        for (let i = 0; i < paramNames.length; i++) {
            const paramName = paramNames[i];
            ret[paramName] = match[i + 1];
        }
        return ret;
    };
}



const EventStreamSFactory = {
    createEventStreamS(server, httpApp) {

        let io = require('socket.io')(server);

        io.on('connection', function(socket){
            socket.on("event-stream:join", (req)=> {

                let url = req.url;
                let token = req.token;
                for (let i = 0; i < streams.length; i++) {
                    const stream = streams[i];
                    let params = stream.match(url);
                    if (params) {

                        (stream.authenticate==null ? Promise.resolve(true) : stream.authenticate(params, token)).then((success)=> {
                            if (success) {
                                socket.join(url);
                            }
                        });
                        return;
                    }
                }
            });
        });


        httpApp.post("/api/event-stream/subscribe", (req, res)=> {
            let url = req.body.url;
            for (let i = 0; i < streams.length; i++) {
                const stream = streams[i];
                let params = stream.match(url);
                if (params) {
                    // Get init data
                    (stream.authenticate==null ? Promise.resolve(true) : stream.authenticate(params, req.headers["token"])).then((success)=> {
                        if (success) {
                            stream.getValue(params).then((data)=> {
                                res.json({
                                    success: true,
                                    data: data
                                });
                            });
                        }
                    });
                    return;
                }
            }
            res.status(404);
        });

        return {
            register({urlFormat, authenticate, getValue}) {
                let urlFormatter = createUrlFormatter(urlFormat);
                let urlParser = createUrlParser(urlFormat);

                let stream = {
                    match(url) {
                        return urlParser(url);
                    },
                    getValue: getValue,
                    authenticate: authenticate,
                    updated(params) {
                        getValue(params).then((data)=> io.to(urlFormatter(params)).emit(`event-stream:update:${urlFormatter(params)}`, data));
                    }
                };
                streams.push(stream);
                return stream;
            }
        };
    }
};

exports.EventStreamSFactory = EventStreamSFactory;