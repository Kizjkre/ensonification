import { data } from '$lib/state/data.svelte.js';
import file from '$lib/state/file.svelte.js';
import menu from '$lib/state/menu.svelte.js';
import modifiers from '$lib/state/modifier.svelte.js';
import samples from '$lib/state/samples.svelte.js';

let audio, read;

export const handleKeydown = async e => {
  audio ??= await import('./audio.js');
  read ??= (await import('./samples.js')).read;

  const keys = Object.keys(data);

  switch (e.key) {
    case 'Control':
    case 'Alt':
    case 'Shift':
      modifiers[e.key.toLowerCase()] = true;
      return;
    case 'Escape':
      e.preventDefault();
      menu.open = !menu.open;
      return;
    case 'ArrowLeft':
      file.id = +keys[keys.indexOf('' + file.id) - 1] || file.id;
      break;
    case 'ArrowRight':
      file.id = +keys[keys.indexOf('' + file.id) + 1] || file.id;
      break;
  }

  if (samples[e.key] && !modifiers.control) {
    const buffer = await (await read(samples[e.key])).arrayBuffer();
    audio.buffers[e.key] = await audio.ctx.decodeAudioData(buffer);

    const source = new AudioBufferSourceNode(audio.ctx, { buffer: audio.buffers[e.key] });
    source.connect(audio.ctx.destination);
    source.start();
  }

  if (modifiers.control && e.key.match(/[0-9]/)) file.id = +keys[e.key - 1] || file.id;
};

export const handleKeyUp = e => {
  switch (e.key) {
    case 'Control':
    case 'Alt':
    case 'Shift':
      modifiers[e.key.toLowerCase()] = false;
      break;
  }
}
