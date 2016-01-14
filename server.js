var http = require('http'),
    argv = require('yargs').argv,
    md5 = require('checksum'),
    path = require('path'),
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

var sftp = new SFTPS({
	host: '10.131.143.93', // required
	username: 'root', // required
	password: process.env.NODEPASS// required
	port: 22 // optional
});


function handleRequest(request, response) {
    if (request.headers.filename && request.headers.hash) {
        transferFilePath = request.headers.filename;
        fmd5 = request.headers.hash;
		
		sftp.get(transferFilePath, transferFilePath).exec(function(err, res){
			if(!err){
				fs.exists(transferFilePath, function(exists) {
					console.log(transferFilePath + '   exists');
					if (exists) {
					var actualmd5 = '';
					fs.readFile(transferFilePath, function (err, buf) {
						if (err) {
							console.log('Couldnt read file');
							console.log(err);
						} else {
							actualmd5 = md5(buf);
							console.log(md5(buf));

							if (actualmd5 === fmd5) {
								response.writeHead(200, {'Content-Type': 'text/plain'});
								response.write('Transfer successful');
								response.end();
								console.log('Success');
							}else{
								response.writeHead(400, {'Content-Type': 'text/plain'});
								response.write('MD5 check unsuccessful');
								response.end();
								console.log(transferFilePath + ' transfered');
							}
						}
					});
				}	
                });
			}else{
				console.log(transferFilePath + ' not transfered');
			}
		});		

    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function () {
    console.log('Server is listening on port %s', PORT);
});

