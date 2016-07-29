// routes/print.js

// =======================================
// Import packages
// =======================================
var express = require('express');
var router = express.Router();

// =======================================
// Configuration 
// =======================================
// Avaiable printers (default /dev/usb/lp0)
var printer = '/dev/usb/lp0';
var printerCUPS = '720nw';
// Format (n=29mm, w=54mm)
var pageSize  = 'w'

// =======================================
// PRINT LABEL 
// =======================================
function printLabel(file) {
	var exec = require('child_process').execSync;
	var command = 'ql720nw ' + printer + ' ' + pageSize + ' /home/pi/pos/prtsrc/brother/' + pageSize + '/' + file;
	
	exec(command, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log('printing /home/pi/pos/prtsrc/brother/' + pageSize + '/' + file + options);
		}
	});
};

// =======================================
// POST Route 
// =======================================
router.post('/:item/:times', function(req, res, next) {
	var result = '';
	for (var i = 1; i <= req.params['times']; i++) {
		printLabel(req.params['item'] + ".png");
	}
	res.send(result);
});


// =======================================
// POST Route Testpage
// =======================================
router.get('/testpage', function(req, res, next) {
	var exec = require('child_process').execSync;
	var options =  ' -o Collate=True -o landscape -o media=54x1';
	var command = 'lp -d 720nw /usr/share/cups/data/testprint ' + options;
	
	exec(command, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log('printing /home/pi/pos/prtsrc/brother/' + pageSize + '/' + file + options);
		}
	});

	res.send('<h1>Testseite erfolgreich gedruckt.</h1><h4>Eine Minute warten und dann die Grillkassen-App starten</h4>' );
});

module.exports = router;
