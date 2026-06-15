import { retryAsync } from '../../src';

retryAsync(() => {
  console.log('retryAsync');
  return Promise.reject('success');
}).catch((err) => {
  console.log('最后', err);
});
