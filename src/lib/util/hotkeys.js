import menu from '$lib/state/menu.svelte.js';
import modifiers from '$lib/state/modifier.svelte.js';
import samples from '$lib/state/samples.svelte.js';

let audio, read;

export default async e => {
  audio ??= await import('./audio.js');
  read ??= (await import('./samples.js')).read;

  if (e.key === 'Escape') {
    e.preventDefault();
    menu.open = !menu.open;
    return;
  }

  if (samples[e.key] && !modifiers.control) {
    const buffer = await (await read(samples[e.key])).arrayBuffer();
    audio.buffers[e.key] = await audio.ctx.decodeAudioData(buffer);

    const source = new AudioBufferSourceNode(audio.ctx, { buffer: audio.buffers[e.key] });
    source.connect(audio.ctx.destination);
    source.start();
  }
};
