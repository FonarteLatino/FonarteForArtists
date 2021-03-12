const http = require('http');

const server = http.createServer((request, response) => {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hola maldito mundo");
});

const port = process.env.PORT || 1337;

console.log("Servidor corriendo en local");