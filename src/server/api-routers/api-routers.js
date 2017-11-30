const express = require("express");

const ApiRouters = {
    createApiRouter(eventStreamS, haanh) {

        let modules = {eventStreamS, haanh};

        let router = express.Router();

        require("../../client/react/api/haanh/haanh-api-s")(router, modules);
        require("../../client/react/api/hot-run/hot-run-api-s")(router, modules);
        require("../../client/react/api/report/report-api-s")(router, modules);

        return router;
    }
};

exports.ApiRouters = ApiRouters;