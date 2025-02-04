export default strings => {
  if (typeof strings[0] === 'number') return strings;

  const map = {};
  const out = [];
  let i = 0;

  strings.forEach(string => {
    if (!(string in map)) map[string] = i++;
    out.push(map[string]);
  });

  return out;
}
