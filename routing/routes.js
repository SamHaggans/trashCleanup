const express = require('express')
var router = express.Router()
const partials_dir = "./partials/";
const client_dir = "./public/";

// var ip = req.headers['x-forwarded-for'];
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
	
	router.get("/session-signup", function(req, res) {
        if (req.session.username) {
            res.sendFile(client_dir + "sessions.html", {root: dirname});
        }
        else {
            res.sendFile(client_dir + "illegal.html", {root: dirname});
        }
	});

	router.get("/account", function(req, res) {
		if (req.session.username) {
            res.sendFile(client_dir + "account.html", {root: dirname});
        }
        else {
            res.sendFile(client_dir + "illegal.html", {root: dirname});
        }
	});
	
	router.get("/my-hours", function(req, res) {
		if (req.session.username) {
            res.sendFile(client_dir + "my-hours.html", {root: dirname});
        }
        else {
            res.sendFile(client_dir + "illegal.html", {root: dirname});
        }
	});

    router.get("/session/:id", function(req, res) {
        if (req.params.id == Number(req.params.id)) {
            if (req.session.username) {
                res.sendFile(client_dir + "session.html", {root: dirname});
            }
            else {
                res.sendFile(client_dir + "illegal.html", {root: dirname});
            }
        }
        else if (req.params.id == "header.js" || req.params.id == "header.html"|| req.params.id == "signed-header.html"){
            res.sendFile(partials_dir + req.params.id, {root: dirname});
        }
        else {
            res.sendFile(client_dir + req.params.id, {root: dirname});
        }
    });

    router.get("/session/:id/:query", async function(req, res) {
        if (req.params.query == "attendance") {
            var leader = await getSession(req.params.id).leader;
            var user = await getUser(req.session.user_id);
            if (req.session.username) {
                if (user.admin || leader == req.session.user_id) {
                    res.sendFile(client_dir + "attendance.html", {root: dirname});
                }
                else {
                    res.sendFile(client_dir + "illegal.html", {root: dirname});
                }
            }
            else {
                res.sendFile(client_dir + "illegal.html", {root: dirname});
            }
        }
        else if (req.params.query == "header.js" || req.params.query == "header.html"|| req.params.query == "signed-header.html"){
            res.sendFile(partials_dir + req.params.query, {root: dirname});
        }
        else {
            res.sendFile(client_dir + req.params.query, {root: dirname});
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

	router.get("/header.js", function(req, res) {
		res.sendFile(partials_dir + "header.js", {root: dirname});
	});

	router.get("/public/header.js", function(req, res) {
		res.sendFile(partials_dir + "header.js", {root: dirname});
	});

	return router;
}


function getUser(id) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM users WHERE id = ?";
        con.query(sql, [id], function (err, result) {
            if (err) throw err;
            resolve(result[0]);
        });
    });  
}

function getSignupfromSessionUser(session_id, user_id) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM signups WHERE session_id = ? AND user_id = ?";
        con.query(sql, [session_id, user_id], function (err, result) {
            if (err) throw err;
            if (result.length == 0) {
                resolve(false);
            }
            else {
                resolve(result[0]);
            }
        })
    });
}

function markAttendance(session_id, user_id, attendance) {
    return new Promise(function(resolve,reject) {
        var sql = "UPDATE signups SET attendance = ? WHERE session_id = ? AND user_id = ?";
        con.query(sql, [attendance, session_id, user_id], function(err, result) {
            if (err) throw err;
            else{
                resolve(true);
            }
        })
    })
}

function getSignupsBySession(session_id) {
	return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM signups WHERE session_id = ?";
        con.query(sql, [session_id], function (err, result) {
			if (err) throw err;
            resolve(result);
        })
    });
}

function getSession(id) {
	return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM sessions WHERE id = ?";
        con.query(sql, [id], function (err, result) {
            if (err) throw err;
            resolve(result[0]);
        });
    }); 
}

function getSessions(year, month, day) {
	return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM sessions WHERE year = ? AND month = ? AND day = ?";
        con.query(sql, [year, month, day], function (err, result) {
            if (err) throw err;
            resolve(result[0]);
        });
    }); 
}