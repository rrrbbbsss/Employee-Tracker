const mysql = require('mysql2/promise');

require('dotenv').config();
const DBNAME = process.env.DBNAME;
const DBUSER = process.env.DBUSER;
const DBPASS = process.env.DBPASS;

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: DBUSER,
        password: DBPASS,
        database: DBNAME
    }
);

module.exports = db;