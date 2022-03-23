
const pgClient = require("pg").Client;
// const pgConfig = require("./private/pgConfig");
const pgConfig = require("./private/testConfig"); // 테스트용

const pgRequest = async (sql, values=null) => {
    console.log("pgRequest Start");

    const result = {
        "success": false,
        "data": null,
        "errType": null
    };

    const pg = new pgClient(pgConfig);
    console.log("Set Variables");

    console.log("before pg.connect");
    try {
        await pg.connect();
    }
    catch(err) {
        console.log("SQL ERROR:", err);
        result.errType = "SQL ERROR";
        pg.end();
        
        return result;
    }

    let sql2 = null;
    let values2 = null;

    if (Array.isArray(sql)) {
        result.data = [];

        for (let index = 0; index < sql.length; index++) {
            if(values[index] != null) {
                values2 = values[index];
            }
            else {
                values2 = [];
            }
            sql2 = sql[index];

            try {
                const pgResult = await pg.query(sql2, values2);
                result.data.push(pgResult.rows);
            }
            catch(err) {
                console.log("SQL ERROR:", err);
                result.errType = "SQL ERROR";
                pg.end();
            }
        }

        result.success = true;
    }
    else {
        if(values != null) {
            values2 = values;
        }
        else {
            values2 = [];
        }
        
        sql2 = sql;

        try {
            const pgResult = await pg.query(sql2, values2);
            result.data = pgResult.rows;
        }
        catch(err) {
            console.log("SQL ERROR:", err);
            result.errType = "SQL ERROR";
            pg.end();
            return result;
        }

        result.success = true;
    }

    pg.end();
    return result;
};

module.exports = pgRequest;
