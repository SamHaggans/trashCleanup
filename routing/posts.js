const express = require("express");
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require('body-parser');
const pbkdf2 = require('pbkdf2');

var router = express.Router();
const partials_dir = "./partials/";
const client_dir = "./public/";
const masterKey = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*\'\"(){}[]:;<>,./?|-=_+`~";



module.exports = function (dirname) {
	router.post('/signup', function(req, res) {
        var sql = "SELECT * FROM users WHERE email = ?";
		con.query(sql, [req.body.email], function (err, result) {
		  if (err) throw err;
		  if (result.length===0){
			var saltVal = masterKey.indexOf(req.body.email[0]) * masterKey.indexOf(req.body.email[1]);
			var saltLines = fs.readFileSync("./config/salt.txt", "utf-8").split(/\n/g);
			var salt = saltLines[saltVal];
			var derivedKey = pbkdf2.pbkdf2Sync(req.body.pass, salt, 1000000, 64, 'sha512').toString('hex');
			var sql = "INSERT INTO users (name,email,pwhash, admin) VALUES (?, ?, ?, 0)";
			con.query(sql, [req.body.name, req.body.email, derivedKey], function (err, result) {
              if (err) throw err;
              res.json({ ok: true });
			});
          }
          else {res.json({ok: false, error: "emailReuse"})}
		});
	});
	  
	router.post('/login', function(req, res) {
        var sql = "SELECT * FROM users WHERE email = ?";
		con.query(sql, [req.body.email], function (err, result) {
			if (err) throw err;
			if (result.length === 0){
				res.json({noAccount: true});
			}
			else{
				result = result[0];
				var saltVal = masterKey.indexOf(req.body.email[0]) * masterKey.indexOf(req.body.email[1]);
				var saltLines = fs.readFileSync("./config/salt.txt", "utf-8").split(/\n/g);
				var salt = saltLines[saltVal];
				var derivedKey = pbkdf2.pbkdf2Sync(req.body.pass, salt, 1000000, 64, 'sha512').toString('hex');
				if (derivedKey == result.pwhash) {
					req.session.username = result.name;
                    req.session.user_id = result.id;
                    req.session.admin = result.admin;
					res.json({signIn: true, uName: result.name, id: result.id});
				}
				else {
					res.json({signIn: false});
				}
			}
	});
	});
	
	router.post('/logout', function(req, res) {
		if (req.session.username){
			req.session.destroy(function(err){  
			if (err) {
				res.json({ok: false});
				throw err; 
			}
			else {
				res.json(
					{
						ok: true
					}
				); 
			}  
		}); 
			
		}
		else {
			res.json({ok: false});
		}
	});

	router.post("/gethours", function (req, res) {
		if (req.session.username){
			var sql = "SELECT * FROM signups WHERE user_id = ?";
			con.query(sql, [req.session.user_id], function (err, result) {
				
				if (err) {
					res.json({ok: false});
					throw err;
				}
				else {
					var totalHours = 0;
					for (var i = 0; i < result.length; i++){
						if (result[i].attendance == 1) {
							totalHours += 0.5;
						}
					}
					res.json({ok: true, hours: totalHours});
				}

			})
		} 
			
		else {
			res.json({ok: false});
		}
    });
    
    router.post("/getsession", function (req, res) {
        var months = ["January", "February","March","April","May","June","July","August","September", "October","November","December"];
		var endings = ["st", "nd","rd","th"];
        var sessionID = req.body.id;
        var html = "";
        var sql = "SELECT * FROM sessions WHERE id = ?";
        con.query(sql, [sessionID], async function (err, session) {
            if (err) throw err;
            session = session[0];
            var leader = await getUser(Number(session.leader));
			var currentSignup = await (getSignupfromSessionUser(session.id, req.session.user_id));
			var otherSignups = await getSignupsBySession(session.id);
            var signupStatus = "You are not currently signed up for this session";
            var currentUser = await getUser(req.session.user_id);
            if (currentUser.admin || req.session.user_id == Number(session.leader)) {
                var attendanceButton = `<div class = "attendanceButton greenButton" ">
                                            Take Attendance
                                        </div>`;
            }
            else {
                var attendanceButton = "";
            }

            var buttonHTML = `<div class = "greenButton signup">
                              Sign up for this session
                              </div>`;
            if (currentSignup.attendance == 0) {
                signupStatus = "You are signed up for this session";
                buttonHTML = `<div class = "redButton cancel">
                              Cancel signup
                              </div>`;
            }
            else if (currentSignup.attendance == 1) {
                signupStatus = "You were present at this session";
                buttonHTML = "";
            }
            else if (currentSignup.attendance == 2) {
                signupStatus = "You were absent at this session";
                buttonHTML = "";
            }
            else if (currentSignup.attendance == 3) {
                signupStatus = "This session was cancelled";
                buttonHTML = "";
            }
            if (session.day < 5) {
                ending = endings[session.day-1];
            }
            else {
                ending = endings[endings.length-1];
            }
            
			var attendeeHTML = "";
			for (var i = 0; i < otherSignups.length; i++) {
				var user = await getUser(Number(otherSignups[i].user_id));
				attendeeHTML+=`<div class = "attendeeInfo">${i+1}. ${user.name}</div>`;
			}
            html = `
                    <div class = "sessionInfo">
                        <h3>Session Information:</h3>
                        <div class = "sessionDate">
                            ${months[session.month]} ${session.day}${ending}, ${session.year}
                        </div>
                        <div class ="attendance">
                            Your Attendance Status: ${signupStatus}
                        </div>
                        <div class = "leader">
                            Leader: ${leader.name}<br>
                        </div>
                        <div class = "actionButton">
                            ${buttonHTML}
                            ${attendanceButton}
						</div>
						<h4 class = "center">Attendees:</h6>
						<hr />
						<div class = "attendees">
							${attendeeHTML}
						</div>
                    </div>
						`;
            res.send({ok: true, html: html});
        });
        
    });

	router.post("/getsessions", async function (req, res) {
		if (req.session.username){
			var result;
			function getSignups() {
				return new Promise(function(resolve, reject) {
					var sql = "SELECT * FROM signups WHERE user_id = ?";
					con.query(sql, [req.session.user_id], function (err, resulty) {
					if (err) {
						res.json({ok: false});
						throw err;
						
					}
					resolve(resulty);
					});
				});
			}
			result = await getSignups();
			var thisAttendance;
			var html = "";

			function getSession (result, j) {
				return new Promise(function(resolve, reject) {
					var attendanceOptions = ["scheduled","present","absent", "session cancelled"];
					var months = ["January", "February","March","April","May","June","July","August","September", "October","November","December"];
					var endings = ["st", "nd","rd","th"];
                    var ending;
                    var sql = "SELECT * FROM sessions WHERE id = ?";
					con.query(sql, [result[j].session_id], function (err, sessionResult) {  
						sessionResult = sessionResult[0];
						if (err) throw err;
						thisAttendance = attendanceOptions[result[j].attendance];
						if (sessionResult.day < 5) {
							ending = endings[sessionResult.day-1];
						}
						else {
							ending = endings[endings.length-1];
						}
						html = `
						<div class = "session ${thisAttendance}" id = "${sessionResult.id}">
							<div class = "sessionDate">
								${months[sessionResult.month]} ${sessionResult.day}${ending}, ${sessionResult.year}
							</div>
							<div class ="attendance">
							Attendance: ${thisAttendance}
							</div>
						</div>
						`;
						resolve(html);
					});
				});
			}

			for (var j = 0; j < result.length; j++){
				html += await getSession(result, j);
			}
			res.json({ok: true, html: html});	
			
		} 
			
		else {
			res.json({ok: false});
		}
	});

	router.post("/getsessionslist", async function (req, res) {
        var months = ["January", "February","March","April","May","June","July","August","September", "October","November","December"];
		var endings = ["st", "nd","rd","th"];
		var weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var html = "";
		var increment = 1000 * 60 * 60 * 24;//ms => seconds => minutes => hours => 1 day
		var current = new Date().getTime();
		var currentDate = new Date(current);
		var newTime;
		var day;
		var month;
		var year;
		if (currentDate.getDay() < 6) {
			var starting = new Date(current - currentDate.getDay()*(increment));
		}
		else {
			var starting = new Date(current + increment);
		}
        for (var i = 1; i < 6; i++) {
			var newDate = new Date(starting.getTime() + i*increment);
			day = newDate.getDate();
			month = newDate.getMonth();
			year = newDate.getFullYear();
			var session = await getSessionByDate(year, month, day);
            var leader = await getUser(Number(session.leader));
            var currentSignup = await (getSignupfromSessionUser(session.id, req.session.user_id));
            var signupStatus = "You are not currently signed up for this session";
            if (currentSignup.attendance == 0) {
                signupStatus = "You are signed up for this session";
            }
            else if (currentSignup.attendance == 1) {
                signupStatus = "You were present at this session";
            }
            else if (currentSignup.attendance == 2) {
                signupStatus = "You were absent at this session";
            }
            else if (currentSignup.attendance == 3) {
                signupStatus = "This session was cancelled";
            }
            if (session.day < 5) {
                ending = endings[session.day-1];
            }
            else {
                ending = endings[endings.length-1];
			}
			var otherSignups = await getSignupsBySession(session.id);
			var attendeesWord = "attendees";
			if (otherSignups.length ==1) {
				attendeesWord = "attendee";
			}
            html += `
                    <div class = "sessionCard" id = "${session.id}">
                        <h3 class = "sessionDay">${weekdays[newDate.getDay()]}</h3>
                        <div class = "sessionDate">
                            ${months[session.month]} ${session.day}${ending}, ${session.year}
                        </div><br>
                        <div class ="others">
                            ${otherSignups.length} ${attendeesWord}
                        </div><br>
                        <div class = "leader">
                            Leader: ${leader.name}<br>
                        </div>
                    </div>
						`;
		}
		res.send({ok: true, html: html});
	});

    router.post("/cancelSignup", function (req, res) {
		if (req.session.username){
			var sql = "DELETE FROM signups WHERE user_id = ? AND session_id = ?";
			con.query(sql, [req.session.user_id, req.body.id],function (err, result) {
				if (err) {
					res.json({ok: false});
					throw err;
				}
				else {
                    res.json({ok: true});
                }

			})
		} 
			
		else {
			res.json({ok: false});
		}
    });

    router.post("/sessionSignup", function (req, res) {
		if (req.session.username){
			var sql = "INSERT INTO signups (session_id, user_id, attendance) VALUES(?,?,0)";
			con.query(sql, [req.body.id, req.session.user_id],function (err, result) {
				if (err) {
					res.json({ok: false});
					throw err;
				}
				else {
                    res.json({ok: true});
                }

			})
		} 
			
		else {
			res.json({ok: false});
		}
    });
    router.post("/getattendance", async function (req, res) {
        var html = "";
        var username;
        var signups = await getSignupsBySession(req.body.id);
        for (var i = 0; i < signups.length; i++) {
            var user = await getUser(signups[i].user_id);
            username = user.name;
            html+= `<div class = "attendee" id = "${user.id}">${username}</div>`;
        }
        res.json({ok: true, html: html});
    });

    router.post("/takeattendance", async function (req, res) {
        var html = "";
        var present = req.body.present;
        var signups = await getSignupsBySession(req.body.id);
        for (var i = 0; i < signups.length; i++) {
            if (present.includes(signups[i].user_id)) {
                await markAttendance(req.body.id, signups[i].user_id, 1);
            }
            else {
                await markAttendance(req.body.id, signups[i].user_id, 2);
            }
        }
        res.json({ok: true});
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

function getSessionByDate(year, month, day) {
	return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM sessions WHERE year = ? AND month = ? AND day = ?";
        con.query(sql, [year, month, day], function (err, result) {
            if (err) throw err;
            resolve(result[0]);
        });
    }); 
}
