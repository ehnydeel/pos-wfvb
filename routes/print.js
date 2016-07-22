// routes/print.js

// =======================================
// Import packages
// =======================================
var express = require('express');
var router = express.Router();

// =======================================
// Configuration 
// =======================================
// Avaiable printers: gk420, hp521dw
var printer = '/dev/usb/lp0';

// =======================================
// PRINT LABEL 
// =======================================
function printLabel(file) {
	var exec = require('child_process').execSync;
	var options =  ' -o Collate=True -o landscape -o ppi=75 -o media=custom_28.96';
	var command = 'ql720nw ' + printer + ' n ' + '/home/pi/pos/prtsrc/brother/' + file;
	
	exec(command, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log('printing /home/pi/pos/prtsrc/brother/' + file + options);
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

module.exports = router;
