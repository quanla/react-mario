const fs = require("fs");
const {promisify} = require('util');
const mkdirp = promisify(require("mkdirp"));
const moment = require("moment");
const Cols = require("../../utils/cols").Cols;

let writeFile = promisify(fs.writeFile);
let readFile = promisify(fs.readFile);

let readdir = promisify(fs.readdir);

function timeToId(time) {
    return moment(time).format("YYYYMMDD-HHmmss");
}

const Reports = {
    getIdLastRun: async () => {
        let listIds = await readdir("reports");
        return Cols.maxValue(listIds);
    },
    save: async (plan, errors, startTime) => {
        let endTime = new Date();
        let id = timeToId(endTime);
        let reportDir = `reports/${id}`;

        await mkdirp(reportDir);

        await Promise.all([
            writeFile(`${reportDir}/full.json`, JSON.stringify({id, plan, errors, startTime, endTime})),
            writeFile(`${reportDir}/brief.json`, JSON.stringify({id, planTitle: plan.title, errorCount: errors.length, startTime, endTime})),
        ]);

        return id;
    },
    getReport: async (id) => {
        let content = await readFile(`reports/${id}/full.json`);
        return JSON.parse(content);
    },
    listBrief: async () => {
        let idList = await readdir("reports");
        return Promise.all(idList.map(async (id) => {
            let str = await readFile(`reports/${id}/brief.json`, "utf8");
            return JSON.parse(str);
        }));
    },
};

exports.Reports = Reports;