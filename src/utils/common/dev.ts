declare global {
  interface Console {
    clog: typeof console.log;
  }
}

type ClogParams = Parameters<typeof console.log>;

export const clog = (...args: ClogParams) => {
  const style =
    'padding: 4px 8px; border-radius: 4px; color:#fff; background: linear-gradient(90deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);';
  const first = typeof args[0] === 'string' ? args.shift() : '==>';
  args.unshift(`%c ${first}`, style);
  console.log(...args);
};
console.clog = clog;
