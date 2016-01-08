var http = require('http'),
    scp = require('scp2'),
    argv = require('yargs').argv,
    md5 = require('md5'),
    path = require('path'),
    fs = require('fs');

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
        fmd5 = request.headers.hash;
        scp({
            path: transferFilePath,
            username: 'root',
            host: sourceHost,
            port: sourcePort
        }, FILEDIR, function (err) {
            console.log('File Transfered ');
            if (err) {
                response.writeHead(400, {'Content-Type': 'text/plain'});
                console.log('Error');
            } else {
                var actualmd5 = '';
                fs.readFile(FILEDIR + path.basename(transferFilePath), function (err, buf) {
                    if (err) {
                        console.log('Couldnt read file');
                    } else {
                        actualmd5 = md5(buf);
                        if (actualmd5 === fmd5) {
                            response.writeHead(200, {'Content-Type': 'text/plain'});
                            response.write('Transfer successful');
                            response.end();
                            console.log('Success');
                        }
                    }
                });
            }
        });
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function () {
    console.log('Server is listening on port %s', PORT);
});

