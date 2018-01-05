const fib = (n) => {
  let a = 1;
  let b = 1;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
};

export default (value, useServerCall) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(fib(value)), useServerCall ? 2000 : 500);
  });
};
