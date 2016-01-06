var client;
var server;

function startClient() {
  client = new net.Socket();

  client.on('data', function(data) {
    console.log('Received: ' + data);
    client.destroy();
  });

  client.on('close', function() {
    console.log('Connection closed');
  });

  client.connect(1337, '10.0.1.10', function() {
    console.log('Connected');
    client.write('Hello, server! Love, Client.');
  });
}

function startServer() {
  server = net.createServer(function(socket) {
    socket.on('data', function(data) {
      socket.write('ECHO: ' + data.toString());
    });
  });

  server.listen(1337);
}
