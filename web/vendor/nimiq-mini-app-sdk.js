function init(options) {
  if (window.nimiq) return Promise.resolve(window.nimiq);
  return new Promise((resolve, reject) => {
    const timeout = options?.timeout ?? 10000;
    const timer = setTimeout(() => {
      clearInterval(poll);
      reject(new Error("Nimiq provider was not injected. Are you running inside a Nimiq app?"));
    }, timeout);
    const poll = setInterval(() => {
      if (window.nimiq) {
        clearTimeout(timer);
        clearInterval(poll);
        resolve(window.nimiq);
      }
    }, 50);
  });
}

export { init };
