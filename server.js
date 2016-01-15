var http = require('http'),
    argv = require('yargs').argv,
    checksum = require('checksum'),
    fs = require('fs'),
    SFTPS = require('sftps');


var sourceHost;
var sourcePort;
var transferFilePath;


if (argv._[0] && argv._[1]) {
    sourceHost = argv._[0];
    sourcePort = argv._[1];
} else {
    console.log('Incorrect parameters');
    return 1;
}

const PORT = 8080;
const FILEDIR = '/root/transfers/';


function handleRequest(request, response) {
    if (request.headers.filename && request.headers.hash) {
        transferFilePath = request.headers.filename;
        var fmd5 = request.headers.hash;
		var sftp = new SFTPS({
			host: '10.131.143.93', // required
			username: 'root', // required
			password: process.env.NODEPASS, // required
			port: 22 // optional
		});


        sftp.get(transferFilePath, transferFilePath).exec(function (err, res) {
            if (!err) {
                fs.exists(transferFilePath, function (exists) {
                    if (exists) {
                        checksum.file(transferFilePath, function (err, sum) {
                            if (sum === fmd5) {
                                response.writeHead(200, {'Content-Type': 'text/plain'});
                                response.write('Transfer successful');
                                response.end();
                                console.log(transferFilePath + ' transfered');
                            }else{
                                response.writeHead(400, {'Content-Type': 'text/plain'});
                                response.write('MD5 check unsuccessful');
                                response.end();
								console.log(transferFilePath + ' Failed');
                            }
                        });
                    }else{
//                        console.log(transferFilePath + ' does not exist');
                    }
                });
            } else {
                console.log('Error with scp connection');
            }
        });
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function () {
    console.log('Server is listening on port %s', PORT);
});

