/*jshint esnext:true*/
/*exported Buffer*/
/*exported net*/
'use strict';

window.Buffer = require('buffer').Buffer;

module.exports = window.net = (function() {

var Server = require('./server');
var Socket = require('./socket');

const IPV4_REGEXP = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
const IPV6_REGEXP = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

var net = {
  Server: Server,
  Socket: Socket,

  connect: createConnection,
  createConnection: createConnection,

  createServer: createServer,

  isIP: isIP,
  isIPv4: isIPv4,
  isIPv6: isIPv6
};

function createConnection(...args) {
  var socket = new Socket();

  socket.connect(...args);

  return socket;
}

function createServer(...args) {
  var server = new Server();

  var options, callback;

  if (typeof args[0] === 'object') {
    options = args[0];

    options.allowHalfOpen  = options.allowHalfOpen  || false;
    options.pauseOnConnect = options.pauseOnConnect || false;
  }

  else {
    options = {
      allowHalfOpen: false,
      pauseOnConnect: false
    };
  }

  if (typeof args[args.length - 1] === 'function') {
    callback = args[args.length - 1];

    server.on('connection', callback);
  }

  return server;
}

function isIP(input) {
  return isIPv4(input) ? 4 : isIPv6(input) ? 6 : 0;
}

function isIPv4(input) {
  return IPV4_REGEXP.test(input);
}

function isIPv6(input) {
  return IPV6_REGEXP.test(input);
}

return net;

})();
