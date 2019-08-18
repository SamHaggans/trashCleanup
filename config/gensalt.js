const fs = require("fs");
const masterKey = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*\'\"(){}[]:;<>,./?|-=_+`~";
try {
	var currentSalt = fs.readFileSync("salt.txt");
	if (!(currentSalt === "")) {
		console.log("Salt has already been generated (salt.txt is not empty)");
	}
	else {
		for (var i = 0; i< masterKey.length * masterKey.length; i++) {
			fs.appendFileSync("salt.txt", masterKey.split('').sort(function(){return 0.5-Math.random()}).join('') + "\n"); 
		}
		console.log("Finished generating salt");
	}
}
catch {
	for (var i = 0; i< masterKey.length * masterKey.length; i++) {
		fs.appendFileSync("salt.txt", masterKey.split('').sort(function(){return 0.5-Math.random()}).join('') + "\n"); 
	}
	console.log("Finished generating salt");    
}
