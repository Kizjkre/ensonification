export default (key, value) => $effect.root(() => {
  let first = true;
  $effect(() => {
    const serialized = JSON.stringify(value);
    if (first) first = false;
    else localStorage.setItem(key, serialized);
  });
  return () => null;
});
