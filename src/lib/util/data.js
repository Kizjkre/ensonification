const root = await navigator.storage.getDirectory();
const dir = await root.getDirectoryHandle('data', { create: true });

const save = new Event('save-data');

export const add = async (name, data) => {
  const file = await dir.getFileHandle(name + '.json', { create: true });
  return file.createWritable().then(async writer => {
    await writer.write(data);
    await writer.close();
    document.dispatchEvent(save);
  });
};

export const read = async name => {
  const listener = res => async () => {
    if (!name) res();
    const file = await dir.getFileHandle(name + '.json');
    res(JSON.parse(await (await file.getFile()).text()));
  };

  let l;

  const result = await new Promise(async res => {
    try {
      await listener(res)();
    } catch {
      l = listener(res);
      document.addEventListener('save-data', l);
    }
  });

  document.removeEventListener('save-data', l);

  return result;
};

export const remove = async name => {
  const file = await dir.getFileHandle(name + '.json');
  return file.remove();
};
