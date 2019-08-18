const express = require("express");
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require('body-parser');
const pbkdf2 = require('pbkdf2');

const config = JSON.parse(fs.readFileSync("./config/config.json","utf-8"));
const client_dir = "./public/";
const partials_dir = "./partials/";
const dirnamey = __dirname;
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

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database");
});

app.set('trust proxy', 1);

app.use(session({
  key: "ID",
  store: new FileStore(fileStoreOptions),
  secret: 'yjdlkasjflkdsaf',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use("/", routes);
app.use("/", posts);

var server = app.listen(port, function(){
    var port = server.address().port;
    console.log("Server started on port: localhost:%s", port);
});
