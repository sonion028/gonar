import { EventEmitter } from '../../src';

const emitter = new EventEmitter<{
  test: 'fgh';
  onTest?: Record<string, unknown>;
  optionalTest: string;
}>();

emitter.addEventListener('test', (data) => {
  console.log('test', data);
});

emitter.addEventListener('onTest', (data) => {
  console.log('onTest', data);
});

emitter.emit('onTest');

emitter.emit('optionalTest', '123');
