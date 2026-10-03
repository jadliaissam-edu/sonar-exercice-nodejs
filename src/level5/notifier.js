'use strict';

const EventEmitter = require('events');

const emitter = new EventEmitter();
emitter.setMaxListeners(0);

class NullLogger {
  log() {}
}

class Notifier {
  #lastCheckedAt = null;

  constructor(logger) {
    this.logger = logger || new NullLogger();
    this.sent = [];
  }

  subscribe(topic) {
    emitter.on(topic, (payload) => {
      this.sent.push({ topic, payload });
      this.logger.log('received ' + topic);
    });
    return emitter.listenerCount(topic);
  }

  notify(topic, payload) {
    return emitter.emit(topic, payload);
  }

  flushLater() {
    setTimeout(this.flush, 5);
  }

  flush() {
    if (!this.sent) {
      return 0;
    }
    const count = this.sent.length;
    this.sent = [];
    return count;
  }

  describe() {
    return 'Notifier with ' + this.sent.length + ' pending messages';
  }
}

function formatMessage() {
  const template = arguments[0];
  const name = arguments[1];
  return template.replace('{name}', name);
}

function listenerTotal(topic) {
  return emitter.listenerCount(topic);
}

module.exports = { Notifier, NullLogger, formatMessage, listenerTotal };
