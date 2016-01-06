/*jshint esnext:true*/
/*exported Socket*/
'use strict';

module.exports = (function() {

var Buffer       = require('buffer').Buffer;

var BinaryUtils  = require('./binary-utils');
var EventEmitter = require('./event-emitter');

const DEFAULT_ENCODING = 'utf8';

function Socket(options) {
  this._address = null;
  this._tcpSocket = null;

  if (options instanceof TCPSocket) {
    this._attachTCPSocket(options);
  }
}

Socket.prototype = new EventEmitter();

Socket.prototype.constructor = Socket;

Socket.prototype._defaultEncoding = DEFAULT_ENCODING;

Socket.prototype.allowHalfOpen = false;

Socket.prototype.bytesRead = 0;

Socket.prototype.bytesWritten = 0;

Socket.prototype.readable = false;

Socket.prototype.writable = false;

Socket.prototype._attachTCPSocket = function(tcpSocket) {
  this._tcpSocket = tcpSocket;

  this._tcpSocket.onopen = () => {
    this._address = {
      address: '127.0.0.1',
      family: 'IPv4',
      port: this._tcpSocket.port // XXX: Incorrect, needs to be *local* port
    };

    this.emit('connect');
  };

  this._tcpSocket.ondata = (evt) => {
    var encoding = this._encoding || this._defaultEncoding;
    var data = encoding === 'utf8' ? BinaryUtils.arrayBufferToString(evt.data) : evt.data;

    this.emit('data', data);
  };

  this._tcpSocket.ondrain = () => this.emit('drain');
  this._tcpSocket.onclose = () => this.emit('close', false); // XXX: Pass had_error
  this._tcpSocket.onerror = (err) => this.emit('error', err);
};

Socket.prototype.address = function() {
  return this._address;
};

Socket.prototype.connect = function(...args) {
  var options, callback;

  if (typeof args[0] === 'object') {
    options = args[0];

    options.host = options.host || 'localhost';
  }

  else if (typeof args[0] === 'string') {
    options = {
      path: args[0]
    };
  }

  else if (typeof args[0] === 'number') {
    options = {
      port: args[0],
      host: 'localhost'
    };

    if (typeof args[1] === 'string') {
      options.host = args[1];
    }
  }

  if (typeof args[args.length - 1] === 'function') {
    callback = args[args.length - 1];

    this.on('connect', callback);
  }

  var tcpSocket = navigator.mozTCPSocket.open(options.host, options.port, {
    binaryType: 'arraybuffer'
  });

  _attachTCPSocket(tcpSocket);
};

Socket.prototype.destroy = function() {
  this._tcpSocket.onopen  = null;
  this._tcpSocket.ondrain = null;
  this._tcpSocket.onerror = null;
  this._tcpSocket.ondata  = null;
  this._tcpSocket.onclose = null;

  this._tcpSocket.close();

  this._address = null;
  this._tcpSocket = null;

  this.emit('close', false);
};

Socket.prototype.end = function(data, encoding) {
  if (data) {
    this.write(data, encoding, () => {
      this.end();
    });

    return;
  }

  this._tcpSocket.close();

  this._address = null;
  this._tcpSocket = null;
};

Socket.prototype.pause = function() {

};

Socket.prototype.ref = function() {
  // Opposite of unref, calling ref on a previously unrefd socket will not let
  // the program exit if it's the only socket left (the default behavior). If
  // the socket is refd calling ref again will have no effect.
  return this;
};

Socket.prototype.resume = function() {

};

Socket.prototype.setDefaultEncoding = function(defaultEncoding) {
  this._defaultEncoding = defaultEncoding;

  return this;
};

Socket.prototype.setEncoding = function(encoding) {
  this._encoding = encoding;

  return this;
};

Socket.prototype.setKeepAlive = function(enable, initialDelay) {
  return this;
};

Socket.prototype.setNoDelay = function(noDelay) {
  return this;
};

Socket.prototype.setTimeout = function(timeout, callback) {
  return this;
};

Socket.prototype.unref = function() {
  // Calling unref on a socket will allow the program to exit if this is the
  // only active socket in the event system. If the socket is already unrefd
  // calling unref again will have no effect.
  return this;
};

Socket.prototype.write = function(data, encoding, callback) {
  if (!encoding || typeof encoding === 'function') {
    callback = encoding;
    encoding = this._encoding || this._defaultEncoding;
  }

  if (typeof callback === 'function') {
    setTimeout(callback);
  }

  if (typeof data === 'string') {
    data = BinaryUtils.stringToArrayBuffer(data);
  }

  else if (data instanceof Blob) {
    data = BinaryUtils.blobToArrayBuffer(data);
  }

  else if (data instanceof Buffer) {
    data = data.toArrayBuffer();
  }

  return this._tcpSocket.send(data);
};

return Socket;

})();
