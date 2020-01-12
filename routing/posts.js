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
        var sql = "SELECT * FROM users WHERE email = ? OR name = ?";
		con.query(sql, [req.body.email, req.body.name], function (err, result) {
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
          else {res.json({ok: false, error: "valueReuse"})}
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
	
	router.post('/logout', async function(req, res) {
		if (req.session.username){
			req.session.username = null;
            req.session.user_id = null;
            req.session.admin = null;
            await sleep(2000);
            res.json(
                {
                    ok: true
                }
            ); 
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
        var locations = ["600 & 800 Halls, Bricks", "600 & 800 Halls, Bricks", "200 & 400 Halls", "Library, Student Center", "Library, Student Center", "100 & 300 Halls, Cafeteria Area", "100 & 300 Halls, Cafeteria Area", "500 & 700 Halls, Ramps", "500 & 700 Halls, Ramps", "Front Exterior of School"];
        var sessionID = req.body.id;
        var html = "";
        var sql = "SELECT * FROM sessions WHERE id = ?";
        con.query(sql, [sessionID], async function (err, session) {
            if (err) throw err;
            session = session[0];
            var leader = await getUser(Number(session.leader));
			var currentSignup = await (getSignup(session.id, req.session.user_id));
			var otherSignups = await getSignups(session.id);
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

            var buttonHTML = "";
            if (currentSignup.attendance == 0) {
                signupStatus = "You are signed up for this session";
                buttonHTML = `<div class = "redButton cancel">
                              Cancel signup
                              </div>`;
            }
            else if (currentSignup.attendance == 3) {
                signupStatus = "This session was cancelled";
                buttonHTML = "";
            }
            if (session.status == 3) {
                signupStatus = "This session was cancelled";
                buttonHTML = "";
            }
            if (session.status == 4) {
                signupStatus = "This session already happened";
                buttonHTML = "";
            }
            if (currentSignup.attendance == 1) {
                signupStatus = "You were present at this session";
                buttonHTML = "";
            }
            if (currentSignup.attendance == 2) {
                signupStatus = "You were absent at this session";
                buttonHTML = "";
            }
            if (session.day < 5) {
                ending = endings[session.day-1];
            }
            else {
                ending = endings[endings.length-1];
            }
            
            var attendeeHTML = "";
            for (var j = 1; j< 11; j++) {
                var attendee = "";
			    for (var i = 0; i < otherSignups.length; i++) {
                    if (otherSignups[i].position == j) {
                        var user = await getUser(Number(otherSignups[i].user_id));
                        attendee = `<tr class = "attendeeInfo">
                                        <td class = "number">${j}</td> 
                                        <td class = "location">${locations[j-1]}</td>
                                        <td class = "name">${user.name}</td>
                                    </tr>`;
                    }
                }
                if (attendee == "") {
                    if (currentSignup.attendance == undefined && session.status != 3 && session.status !=4) {
                        var signupButton = `<div class = "greenButton signup" id = ${j}>
                                            Sign up for this position
                                            </div>`;
                    }
                    else if (session.status == 3){
                        var signupButton = `Cancelled`;
                    }
                    else if (session.status == 4){
                        var signupButton = `Empty`;
                    }
                    else {
                        var signupButton = `Available`;
                    }

                    attendee = `<tr class = "attendeeInfo">
                                        <td class = "number">${j}</td> 
                                        <td class = "location">${locations[j-1]}</td>
                                        <td class = "name">${signupButton}</td>
                                    </tr>`;
                }
                attendeeHTML += attendee; 
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
                        <table class = "positions">
                            <tr>
                                <th>Number</th>
                                <th>Location</th>
                                <th>Name</th>
                            </tr>
                            ${attendeeHTML}
                        </table>
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
			var session = await getSession(year, month, day);
            var leader = await getUser(Number(session.leader));
            var currentSignup = await (getSignup(session.id, req.session.user_id));
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
            var signups = await getSignups(session.id);
            var otherSignups = [];
            for (var k = 0; k< signups.length; k++) {
                if (signups[k].position != 0) {
                    otherSignups.push(signups[k]);
                }
            }
			var attendeesWord = "attendees";
			if (otherSignups.length ==1) {
				attendeesWord = "attendee";
            }
            var others = `${otherSignups.length} ${attendeesWord}`;
            if (session.status == 3) {
                others = "Cancelled";
            }
            html += `
                    <div class = "sessionCard" id = "${session.id}">
                        <h3 class = "sessionDay">${weekdays[newDate.getDay()]}</h3>
                        <div class = "sessionDate">
                            ${months[session.month]} ${session.day}${ending}, ${session.year}
                        </div><br>
                        <div class ="others">
                            ${others}
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
            var sql = "INSERT INTO signups (session_id, user_id, attendance, position) VALUES(?,?,0,?)";
			con.query(sql, [req.body.id, req.session.user_id, req.body.position],function (err, result) {
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
        
        var leader = await getSessionLeader(req.body.id);
        var user = await getUser(req.session.user_id);
        if (user.admin || leader == user.id) {
            var html = "";
            var username;
            var signups = await getSignups(req.body.id);
            for (var i = 0; i < signups.length; i++) {
                if (signups[i].position != 0) {
                    var user = await getUser(signups[i].user_id);
                    username = user.name;
                    html+= `<div class = "attendee" id = "${user.id}">${username}</div>`;
                }
            }
            res.json({ok: true, html: html});
        }
        else {res.json({ok: false});}
    });

    router.post("/takeattendance", async function (req, res) {
        var leader = await getSessionLeader(req.body.id);
        var user = await getUser(req.session.user_id);
            if (user.admin || leader == user.id) {
            var present = req.body.present;
            if (present == undefined) {
                present = [];
            }
            var signups = await getSignups(req.body.id);
            for (var i = 0; i < signups.length; i++) {
                if (present.includes(signups[i].user_id)) {
                    await markAttendance(req.body.id, signups[i].user_id, 1);
                }
                else {
                    if (signups[i].user_id != leader){
                        await markAttendance(req.body.id, signups[i].user_id, 2);
                    }
                }
            }
            var leader = await getSessionLeader(req.body.id);
            if (await getSignup(req.body.id, leader) == false) {
                var sql = "INSERT INTO signups (session_id, user_id, attendance, position) VALUES (?,?,?,?)";
                await con.query(sql, [req.body.id, leader, 1, 0], function (err, result) {
                    if (err) throw err;
                });
            }
            res.json({ok: true});
        } else {res.json({ok: false});}
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

function getSignup(session_id, user_id) {
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

function getSignups(session_id) {
	return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM signups WHERE session_id = ?";
        con.query(sql, [session_id], function (err, result) {
			if (err) throw err;
            resolve(result);
        })
    });
}

function getSessionId(id) {
	return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM sessions WHERE id = ?";
        con.query(sql, [id], function (err, result) {
            if (err) throw err;
            resolve(result[0]);
        });
    }); 
}

function getSessionLeader(id) { 
    return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM sessions WHERE id = ?";
        con.query(sql, [id], function (err, result) {
            if (err) throw err;
            resolve(result[0].leader);
        });
    });
}
function getSession(year, month, day) {
	return new Promise(function(resolve, reject) {
        var sql = "SELECT * FROM sessions WHERE year = ? AND month = ? AND day = ?";
        con.query(sql, [year, month, day], function (err, result) {
            if (err) throw err;
            resolve(result[0]);
        });
    }); 
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}