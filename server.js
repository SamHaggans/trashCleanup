const express = require("express");
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require('body-parser');
const pbkdf2 = require('pbkdf2');

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf-8"));
const client_dir = "./public/";
const partials_dir = "./partials/";

const routes = require("./routing/routes.js")(dirnamey);
const posts = require("./routing/posts.js")(dirnamey);

const app = express();
const port = process.env.PORT || 3006;

var session = require('express-session');
var FileStore = require('session-file-store')(session);
var fileStoreOptions = {};

app.use(express.static(client_dir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const masterKey = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*\'\"(){}[]:;<>,./?|-=_+`~";

global.con = mysql.createConnection({
	host: config.dbHost,
	user: config.dbUser,
	password: config.dbPw,
	database: config.dbName
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected to database");
});

app.set('trust proxy', 1);

app.use(session(
	{
		key: "ID",
		store: new FileStore(fileStoreOptions),
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }
	}
));

app.use("/", routes);
app.use("/", posts);

var server = app.listen(port, function () {
    var port = server.address().port;
    console.log("Server started on port: localhost:%s", port);
});

loadPreviousSessions();
setTimeout(function () {
    createSessions();
}, 5000);

setInterval(function() {
    createSessions();
  }, 1000*10);

async function loadPreviousSessions() {
    var first = new Date(2019, 8, 2).getTime();
    var current = new Date().getTime();
    var increment = 1000 * 60 * 60 * 24;//ms => seconds => minutes => hours => 1 day
    var newTime = first;
    var day;
    var month;
    var year;
    var i = 0;
    while (newTime <= current) {
        newTime = new Date(first + increment*i);
		if (newTime.getDay() > 0 && newTime.getDay()<6) {
			day = newTime.getDate();
			month = newTime.getMonth();
			year = newTime.getFullYear();
            await createSession(year, month, day);
        }
        i++;
    }
}

async function createSessions() {
    var current = new Date().getTime();
    var increment = 1000 * 60 * 60 * 24;//ms => seconds => minutes => hours => 1 day
    var newTime;
    var day;
    var month;
    var year;
    for (var i = 1; i < 15; i++) {
		newTime = new Date(current + increment*i);
		if (newTime.getDay() > 0 && newTime.getDay()<6) {
			day = newTime.getDate();
			month = newTime.getMonth();
			year = newTime.getFullYear();
			await createSession(year, month, day);
		}
	}
}

function createSession(year, month, day) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM sessions WHERE year = ? AND month = ? AND day = ?";
        con.query(sql, [year,month,day], function(err, result) {
            if (err) throw err;
            if (result.length == 0) {
                var sql = "INSERT INTO sessions (year, month, day, leader, status) VALUES (?,?,?,?,?)";
                con.query(sql, [year,month,day,1,0], function (err, result) {
                    if (err) throw err;
                    resolve();
                }); 
            }
            else {
                resolve();
            }
        })
    }); 
}

function sleep(ms) { //Sleep function for pauses between frames
    return new Promise(resolve => setTimeout(resolve, ms));
}
