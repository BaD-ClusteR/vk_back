const express = require("express");
const mysql = require("mysql");

const pool = mysql.createPool({
    connectionLimit: "100",
    host: "localhost",
    user: "root",
    password: "",
    database: "vk",
    debug: false
});

const app = express();

function sendError(text, res, code) {
    if (typeof code === "undefined")
        code = 400;
    res.statusCode = code;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.json({
        'status': "error",
        'message': text
    });
}

function sendResult(data, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({
        'status': "ok",
        'result': data
    });
}

function isCorrectVKID(id) {
    id = parseInt(id);
    return (id && id > 0 && id < 99999999999);
}

app.get("/visitor.check", (req, res) => {
    let id = (req.query.id ? parseInt(req.query.id) : null);
    if (!isCorrectVKID(id)) {
        sendError("Incorrect VK ID", res);
    } else {
        pool.query(`SELECT id FROM visitors WHERE vk_id = '${id}'`, (error, rows) => {
            if (error)
                sendError("Error while trying to connect to database", res);
            sendResult(rows.length > 0, res);
        });
    }
});

app.get("/visitor.add", (req, res) => {
    let id = (req.query.id ? parseInt(req.query.id) : null);
    if (!isCorrectVKID(id)) {
        sendError("Incorrect VK ID", res);
    } else {
        pool.query(`SELECT id FROM visitors WHERE vk_id = '${id}'`, (error, rows) => {
            if (error)
                sendError("Error while trying to connect to database", res);
            else if (rows.length === 0) {
                pool.query(`INSERT INTO visitors SET vk_id = '${id}'`, error => {
                    if (error)
                        sendError("Error while trying to connect to database");
                })
            }
            sendResult("Successfully added", res);
        });
    }
});

app.listen(3000, () => {

});