/*jshint esnext:true*/
/*exported EventEmitter*/
'use strict';

module.exports = (function() {

function EventEmitter(object) {
  this._maxListeners = this.defaultMaxListeners;
}

EventEmitter.prototype.constructor = EventEmitter;

EventEmitter.prototype.defaultMaxListeners = 10;

EventEmitter.prototype.getMaxListeners = function() {
  return this._maxListeners || this.defaultMaxListeners;
};

EventEmitter.prototype.setMaxListeners = function(maxListeners) {
  this._maxListeners = maxListeners;

  return this;
};

EventEmitter.prototype.listenerCount = function(event) {
  var events    = this._events  || {};
  var listeners = events[event] || [];

  return listeners.length;
};

EventEmitter.prototype.listeners = function(event) {
  var events    = this._events  || {};
  var listeners = events[event] || [];

  return listeners.slice(0);
};

EventEmitter.prototype.emit = function(event, ...args) {
  var events    = this._events  || {};
  var listeners = events[event] || [];
  
  var result = listeners.length > 0;

  listeners.forEach((listener) => {
    listener.apply(this, args);

    if (listener._once) {
      this.removeListener(event, listener);
      delete listener._once;
    }
  });

  return result;
};

EventEmitter.prototype.on = function(event, listener) {
  var events    = this._events  = this._events  || {};
  var listeners = events[event] = events[event] || [];
  if (listeners.find(fn => fn === listener)) {
    return this;
  }

  listeners.push(listener);
  this.emit('newListener', event, listener);

  var maxListeners = this.getMaxListeners();
  if (maxListeners > 0 && listeners.length > maxListeners) {
    console.warn('warning: possible EventEmitter memory leak detected. ' +
      maxListeners + ' ' + event + ' listeners added. ' +
      'Use emitter.setMaxListeners() to increase limit.');
  }

  return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.once = function(event, listener) {
  listener._once = true;

  return this.on(event, listener);
};

EventEmitter.prototype.removeListener = function(event, listener) {
  var events    = this._events  || {};
  var listeners = events[event] || [];
  for (var i = listeners.length - 1; i >= 0; i--) {
    if (listeners[i] === listener) {
      listeners.splice(i, 1);
      this.emit('removeListener', event, listener);

      return this;
    }
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(event) {
  var events = this._events || {};
  if (!event) {
    for (event in events) {
      removeAllListeners(event);
    }

    return this;
  }

  var listeners = events[event] || [];
  listeners.forEach((listener) => {
    removeListener(event, listener);
  });

  return this;
};

return EventEmitter;

})();
