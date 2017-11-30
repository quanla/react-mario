const bodyParser = require("body-parser");
const express = require("express");
// const Path = require("path");
// var ApiRouters = require("./api-routers/api-routers.js").ApiRouters;
// var EventStreamSFactory = require("./common/event-stream-s/event-stream-s-factory.js").EventStreamSFactory;

// const indexRoutes = ["/history", "/config", "/hot-run", "/full-run", "/report/:id"];

const ServerCore = {
    start(port, serverFactory) {

        const app = express();

        app.use(express.static(__dirname + "/public"));
        app.use(express.static(__dirname + "/../../dist"));

        // indexRoutes.map((path) =>
        //     app.get(path, (req, res) => {
        //         res.sendFile(Path.resolve(__dirname + "/public/index.html"));
        //     })
        // );

        let server = serverFactory(app);
        app.use("/api", bodyParser.json());
        // let eventStreamS = EventStreamSFactory.createEventStreamS(server, app);
        // let haanh = Haanh.createHaanh(siteConfig);
        // app.use("/api", ApiRouters.createApiRouter(eventStreamS, haanh));

        server.listen(port, () => console.log(`App started on ${port}`));
    }
};

exports.ServerCore = ServerCore;