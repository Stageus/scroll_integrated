
const pgClient = require("pg").Client;
const pgConfig = require("./private/pgConfig");

const pgRequest = (sql, values) => 
    new Promise((resolve, reject) => {
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
        pg.connect()
        .then(() => {
            let values2 = null;
            if(values != null) {
                values2 = values;
            }
            else {
                values2 = [];
            }

            pg.query(sql, values2)
            .then(res => {
                result.success = true;
                result.data = res.rows;
                resolve(result);
            }).catch(err => {
                console.log("SQL ERROR:", err);
                result.errType = "SQL ERROR";
                reject(err);
            });
        }).catch(err => {
            console.log("CONNECT ERROR:", err);
            result.errType = "CONNECT ERROR";
            reject(err);
        }).finally(() => {
            pg.end();
        });
    });

module.exports = pgRequest;