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
var printer = '720nw';

// =======================================
// PRINT LABEL 
// =======================================
function printLabel(file) {
	var exec = require('child_process').exec;
	var command = 'lp -d ' + printer + ' /home/pi/pos/prtsrc/brother/' + file + ' -o landscape';
	
	exec(command, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log('printing /home/pi/pos/prtsrc/brother/' + file);
		}
	});
	console.log('lp -d ' + printer + ' /home/pi/pos/prtsrc/brother/' + file);
};
// =======================================
// POST Route 
// =======================================
router.post('/:item/:times', function(req, res, next) {
	var result = '';

	for (var i = 1; i <= req.params['times']; i++) {
		printLabel(req.params['item'] + '.pdf');
		result += 'print ' + req.params['item'] + '<br>';
	}

	// Send result to browser
	res.send(result);
});

module.exports = router;
