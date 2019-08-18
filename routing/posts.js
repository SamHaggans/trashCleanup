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
		con.query("SELECT * FROM users WHERE email = '"+req.body.email+"'", function (err, result) {
		  if (err) throw err;
		  if (result.length===0){
			var saltVal = masterKey.indexOf(req.body.email[0]) * masterKey.indexOf(req.body.email[1]);
			var saltLines = fs.readFileSync("./config/salt.txt", "utf-8").split(/\n/g);
			var salt = saltLines[saltVal];
			var derivedKey = pbkdf2.pbkdf2Sync(req.body.pass, salt, 1000000, 64, 'sha512').toString('hex');
			var sql = "INSERT INTO users (name,email,pwhash, admin) VALUES ('"+req.body.name+"', '" + req.body.email + "', '" + derivedKey+"', 0)";
			con.query(sql, function (err, result) {
			  if (err) throw err;
			});
		  }
		});
		res.json({ ok: true });
	});
	  
	router.post('/login', function(req, res) {
		con.query("SELECT * FROM users WHERE email = '"+req.body.email+"'", function (err, result) {
			if (err) throw err;
			if (result.length === 0){
				console.log("yeet");
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
					res.json({signIn: true, uName: result.name});
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
	return router;
}
