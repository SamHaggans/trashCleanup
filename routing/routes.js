const express = require('express')
var router = express.Router()
const partials_dir = "./partials/";
const client_dir = "./public/";

module.exports = function(dirname) {
	
	router.get("/signup", function(req, res) {
		res.sendFile(client_dir + "signup.html", {root: dirname});
	});
	
	router.get("/login", function(req, res) {
		res.sendFile(client_dir + "login.html", {root: dirname});
	});
	
	router.get("/logout", function(req, res) {
		res.sendFile(client_dir + "logout.html", {root: dirname});
	});
	
	router.get("/sessions", function(req, res) {
		res.sendFile(client_dir + "sessions.html", {root: dirname});
	});

	router.get("/account", function(req, res) {
		if (req.session.username) {
			res.sendFile(client_dir + "account.html", {root: dirname});
		}
		else {
			res.sendFile(client_dir + "nosign-account.html", {root: dirname});
		}
	});
	
	router.get("/my-hours", function(req, res) {
		if (req.session.username) {
			res.sendFile(client_dir + "my-hours.html", {root: dirname});
		}
		else {
			res.sendFile(client_dir + "nosign-my-hours.html", {root: dirname});
		}
	});

	router.get("/merch", function(req, res) {
		res.sendFile(client_dir + "merch.html", {root: dirname});
    });

    router.get("/session/:id", function(req, res) {
        if (req.params.id == Number(req.params.id)) {
            res.sendFile(client_dir + "session.html", {root: dirname});
        }
        else {
            res.sendFile(client_dir + req.params.id, {root: dirname});
        }
    });

    var allowedFiles = ["main.js", "account.js", "header.js","login.js","merch.js","myhours.js","session.js","signup.js","style.js","favicon.ico","favicon2.ico"];



	router.get("/headerfile", function(req, res) {
		if (req.session.username) {
			res.sendFile(partials_dir + "signed-header.html", {root: dirname});
		}
		else {
			res.sendFile(partials_dir + "header.html", {root: dirname});
		}
	});

	return router;
}
