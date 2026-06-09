const defaultdict = (defaultFactory = defaultdict) =>
  new Proxy({}, {
    get(target, prop) {
      if (!(prop in target)) {
        target[prop] = defaultFactory();
      }
      return target[prop];
    }
  });

const observed = defaultdict();

export default (path, effect) => {
  path(observed);
  console.log(observed);
};
