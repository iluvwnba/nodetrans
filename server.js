var http = require('http'),
    scp = require('scp'),
    argv = require('yargs').argv;

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
    
function handleRequest(request, response){
    if(request.headers.filename && request.headers.hash){
        transferFilePath = request.headers.filename;
        scp.get({
            file:transferFilePath,
            user:'root',
            host:sourceHost,
            port:sourcePort,
            path: '~'
        });
    } 
    response.end('Hit ');
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log('Server is listening on port %s', PORT);
});

