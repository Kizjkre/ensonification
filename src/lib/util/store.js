const request = indexedDB.open('ensonificaiton');

let store = {};

const stores = Object.freeze(['bpm', 'colorrange', 'data', 'file', 'matrix', 'mode', 'menu', 'samples']);

request.onupgradeneeded = () => {
  const db = request.result;

  stores.forEach(name => db.createObjectStore(name, { keyPath: 'id' }));
};

request.onsuccess = () => {
  const db = request.result;
  const transaction = db.transaction('data', 'readwrite');

  stores.forEach(s => store[s] = transaction.objectStore(s));
};

export default store;
