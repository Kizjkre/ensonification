import samples from '$lib/state/samples.svelte.js';

const root = await navigator.storage.getDirectory();
const dir = await root.getDirectoryHandle('samples', { create: true });

const save = new Event('save-sample');

export const add = async (name, data) => {
  const char = name.split('.').slice(0, -1).join('.');
  char in samples && (samples[char] = name);
  const file = await dir.getFileHandle(name, { create: true });
  return file.createWritable().then(async writer => {
    await writer.write(data);
    await writer.close();
    document.dispatchEvent(save);
  });
};

export const read = async name => {
  const listener = res => async () => {
    if (!name) res();
    const file = await dir.getFileHandle(name);
    res(file.getFile());
  };

  let l;

  const result = await new Promise(async res => {
    try {
      await listener(res)();
    } catch {
      l = listener(res);
      document.addEventListener('save-sample', l);
    }
  });

  document.removeEventListener('save-sample', l);

  return result;
};

export const remove = async name => {
  const char = name.split('.').slice(0, -1).join('.');
  char in samples && (samples[char] = null);
  const file = await dir.getFileHandle(name);
  return file.remove();
};

export const clear = async () => await (await navigator.storage.getDirectory()).remove({ recursive: true });
