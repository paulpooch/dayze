var util  = require('util'),
	process = require('child_process');

var install = process.exec('npm install', function (error, stdout, stderr) {
	console.log('Installing dependencies via npm...')
    if (error !== null) {
    	console.log('There was a problem with installation!');
    	console.error('Error(s): ' + error);
    	console.error('Launch aborted.');
    } else {
		var start = process.spawn('nodemon', ['server/app.js']);

		start.stdout.on('data', function (data) {
		  console.log('' + data);
		});

		start.stderr.on('data', function (data) {
		  console.log('' + data);
		});

		start.on('exit', function (code) {
		  console.log('child process exited with code ' + code);
		});
	}
});

console.log('\n\
     _                              ___   ___   _  \n\
  __| | __ _ _   _ _______  __   __/ _ \\ / _ \\ / | \n\
 / _` |/ _` | | | |_  / _ \\ \\ \\ / / | | | | | || | \n\
| (_| | (_| | |_| |/ /  __/  \\ V /| |_| | |_| || | \n\
 \\__,_|\\__,_|\\__, /___\\___|   \\_/  \\___(_)___(_)_| \n\
             |___/                                 \n\
');