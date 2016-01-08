var http = require('http'),
    scp = require('scp'),
    argv = require('yargs').argv,
    md5 = require('md5-file'),
    path = require('path');

var sourceHost;
var sourcePort;
var transferFilePath;

if(argv._[0] && argv._[1]){
    sourceHost = argv._[0];
    sourcePort = argv._[1];
}else{
    console.log('Incorrect parameters');
    return 1;
}

const PORT = 8080;
const FILEDIR = '/root/transfers/';
    
function handleRequest(request, response){
    if(request.headers.filename && request.headers.hash){
        transferFilePath = request.headers.filename;
	fmd5 = request.headers.hash;
        scp.get({
            file:transferFilePath,
            user:'root',
            host:sourceHost,
            port:sourcePort,
            path: FILEDIR
        }, function(err, stdout, stderr){
	   if (err){
		response.writeHead(400, {'Content-Type': 'text/plain'});
		response.write(stderr);
		console.log('Error');
		console.log(path);
	   }else{
		var baseFile =  FILEDIR + path.basename(transferFilePath);
		if(md5(baseFile.toString()) === fmd5){
		    response.writeHead(111, {'Content-Type': 'text/plain'} );
		    response.write('Transfer successful');
		    response.end();
      		    console.log('Success');
		}
	   }
	});
    } 
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log('Server is listening on port %s', PORT);
});

