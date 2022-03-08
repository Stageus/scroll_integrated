
const pgClient = require("pg").Client;
const pgConfig = require("./private/pgConfig");

const pgRequest = (sql, values, work) => {
    console.log("pgRequest Start");
    const result = {
        "success": false,
        "data": null,
        "errType": null
    };
    console.log("Set Result");

    const pg = new pgClient(pgConfig);
    console.log("Set Variables");

    console.log("before pg.connect");
    pg.connect(err => {
        if (err) {
            console.log("CONNECT ERROR:", err);
            result.errType = "CONNECT ERROR";
            work(result);

            pg.end();
        }
        else {
            pg.query(sql, values, (err, res2) => {
                if (err) {
                    console.log("SQL ERROR:", err);
                    result.errType = "SQL ERROR";
                }
                else {
                    result.success = true;
                    result.data = res2.rows;
                    console.log("res2.rows:", res2.rows);
                }

                work(result);

                pg.end();
            });
        }
    });
};

module.exports = pgRequest;