export default strings => {
  if (strings.every(s => !isNaN(s))) return { out: strings, map: {} };

  const map = {};
  const out = [];
  let i = 0;

  strings.forEach(string => {
    if (!(string in map)) map[string] = i++;
    out.push(map[string]);
  });

  return { out, map };
};
