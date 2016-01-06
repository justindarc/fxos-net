/*jshint esnext:true*/
/*exported Server*/
'use strict';

module.exports = (function() {

var BinaryUtils  = require('./binary-utils');
var EventEmitter = require('./event-emitter');
var Socket       = require('./socket');

function Server() {
  this._address = null;
  this._tcpServerSocket = null;

  this._connections = 0;
}

Server.prototype = new EventEmitter();

Server.prototype.constructor = Server;

Server.prototype.address = function() {
  return this._address;
};

Server.prototype.close = function(callback) {
  this._tcpServerSocket.onconnect = null;
  this._tcpServerSocket.onerror   = null;

  this._tcpServerSocket.close();

  this._address = null;
  this._tcpServerSocket = null;

  this.emit('close', false);

  if (typeof callback === 'function') {
    callback(); // XXX: pass an `Error` if server was not open
  }
};

Server.prototype.getConnections = function(callback) {
  if (typeof callback !== 'function') {
    return;
  }

  setTimeout(() => {
    var err = null;

    callback(err, this._connections);
  });
};

Server.prototype.listen = function(...args) {
  var handle, options, callback;

  if (typeof args[0] === 'object' && args[0]._handle) {
    handle = args[0];
    options = {};
  }

  else if (typeof args[0] === 'object') {
    options = args[0];
  }

  else if (typeof args[0] === 'string') {
    options = {
      path: args[0]
    };
  }

  else if (typeof args[0] === 'number') {
    options = {
      port: args[0]
    };

    if (typeof args[1] === 'string') {
      options.host = args[1];
    }

    if (typeof args[2] === 'number') {
      options.backlog = args[2];
    }
  }

  if (typeof args[args.length - 1] === 'function') {
    callback = args[args.length - 1];

    this.on('connection', callback);
  }

  this._tcpServerSocket = navigator.mozTCPSocket.listen(options.port, {
    binaryType: 'arraybuffer'
  }, options.backlog);

  this._tcpServerSocket.onconnect = (evt) => {
    var socket = new Socket(evt.socket);
    socket.on('close', () => this._connections -= 1);

    this._connections += 1;

    this.emit('connection', socket);
  };

  this._tcpServerSocket.onerror = (err) => {
    this.emit('error', err);

    this.close();
  };

  this._address = {
    address: '127.0.0.1',
    family: 'IPv4',
    port: this._tcpServerSocket.port
  };

  this.emit('listening');
};

Server.prototype.ref = function() {
  // Opposite of unref, calling ref on a previously unrefd server will not let
  // the program exit if it's the only server left (the default behavior). If
  // the server is refd calling ref again will have no effect.
  return this;
};

Server.prototype.unref = function() {
  // Calling unref on a server will allow the program to exit if this is the
  // only active server in the event system. If the server is already unrefd
  // calling unref again will have no effect.
  return this;
};

return Server;

})();
