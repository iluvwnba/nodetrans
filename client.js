/**
 * Created by mb on 08/01/2016.
 */

var http = require('http'),
    argv = require('yargs').argv,
    md5 = require('md5'),
    chokidar = require('chokidar'),
    fs = require('fs'),
    destinationHost, destinationPort, watchDir;
var req;

if (argv._[0] && argv._[1]) {
    destinationHost = argv._[0];
    destinationPort = argv._[1];
    watchDir = argv._[2];
} else {
    console.log('Incorrect parameters');
    return 1;
}


var watcher = chokidar.watch(watchDir, {
    ignored: /[\/\\]\./,
    persistent: true
});


callback = function (response) {
    var str = '';
//	console.log(`STATUS: ${response.statusCode}`);
//  console.log(`HEADERS: ${JSON.stringify(response.headers)}`);


    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        console.log('DONE');
    });
};

// Add event listeners.
watcher.on('add', function (path) {
    var fmd5;
    fs.readFile(path, function (err, buf) {
        fmd5 = (md5(buf));
        var options = {
            host: destinationHost,
            port: destinationPort,
            headers: {
                host: destinationHost,
                port: destinationPort,
                filename: path,
                hash: fmd5
            }
        };
        //console.log(options);
        req = http.request(options, callback);
        req.end();
    });
});

