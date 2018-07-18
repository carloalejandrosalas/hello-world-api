/**
 * Primary file for the API
*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require("string_decoder").StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate the HTTP server
var httpServer = http.createServer(function(req, res){
    unifedServer(req, res)
});

// Start the HTTP server
httpServer.listen(config.httpPort, function(){
    console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions,function(req, res){
    unifedServer(req, res)
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
    console.log(`The server is listening on port ${config.httpsPort}`);
});


// All the server logic for both the http and https CreateServer
var unifedServer = function(req, res){
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path 
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');


    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder("utf-8");
    var buffer = '';
    
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        // Choose the handler this request should go. If one is not found, use the notFound handler
        var chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        }

        // Route the request to the handler specified in the router
        chooseHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler, or default to 200    
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            // Use the payload called back by the handler, or default by the empty object
            payload = typeof(payload) == "object" ? payload : {};
        
            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);
            
            // Send the response
            res.setHeader("Content-Type", 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            // Log the request path
            console.log("Returning this response: ", statusCode, payloadString);
        });
        
    });
};

// Define the handlers
var handlers = {};

handlers.ping = function(data, callback){
    // Callback a http status code, and a payload object
    callback(200);
};


handlers.hello = function(data, callback){
    var response = {
        'message' : "Welcome to my first NodeJS API with no dependencies"
    } 
    
    callback(200, response);
}

// Not found handlers
handlers.notFound = function(data, callback){
    callback(404);
};

// Define a request router
var router = {
    'ping' : handlers.ping,
    'hello' : handlers.hello
};
