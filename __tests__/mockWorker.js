import { EventEmitter } from 'node:events';

const emmitter = new EventEmitter();

const mockParentPort = {
  on: (_, cb) => {
    emmitter.on('post_message', (data) => {
      cb(data);
    });
  },
  send: (data) => {
    emmitter.emit('post_message', data);
  },
  recieve: (cb) => {
    emmitter.on('message_back', (data) => cb(data));
  },
  postMessage: (data) => {
    emmitter.emit('message_back', data);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { mockParentPort };
