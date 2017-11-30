const Reports = require("./reports").Reports;

(async ()=> {
    await Reports.save({plan: "Plan"}, [{error: 1}], new Date());

    let id = await Reports.getIdLastRun();
    console.log(id);


    let report = await Reports.getReport(id);
    console.log(report);
})();