import save from '$lib/util/save.svelte.js';

const samples = $state(
  Object.fromEntries(
    '`1234567890-=qwertyuiop[]asdfghjkl;\'zxcvbnm,./'
      .split('')
      .map(key => [key, null])
  )
);

save('samples', samples);

export default samples;
