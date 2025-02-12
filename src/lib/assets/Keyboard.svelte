<script>
  import samples from '$lib/state/samples.svelte.js';
  import { onMount } from 'svelte';

  const active = $state({});

  '`1234567890-=qwertyuiop[]asdfghjkl;\'zxcvbnm,./'.split('').forEach(key => active[key] = 0);

  $effect(() => Object.entries(samples).forEach(([key, has]) => has && (active[key] = 1)));

  const handleKeyDown = e => active[e.key] && (active[e.key] = 0.5);
  const handleKeyUp = e => samples[e.key] && (active[e.key] = 1);

  let stroke = $state('black');

  onMount(() => {
    const dark = matchMedia('(prefers-color-scheme: dark)');

    if (dark) stroke = 'white';

    dark.addEventListener('change', ({ matches }) => stroke = matches ? 'white' : 'black');
  });
</script>

<svelte:window onkeydown={ handleKeyDown } onkeyup={ handleKeyUp } />

<svg class="max-h-full transition" viewBox="0.0 0.0 1205.249343832021 402.68766404199476" fill="none" stroke="none"
     stroke-linecap="square" stroke-miterlimit="10" title="Adapted from Brilliantwiki2, CC0, via Wikimedia Commons; Edited by kizjkre." xmlns="http://www.w3.org/2000/svg"
>
  <g>
    <path fill="#f87171" fill-opacity={ active['`'] } d="m0.7506562 0.7506562l80.25197 0l0 80.25197l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m0.7506562 0.7506562l80.25197 0l0 80.25197l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['1'] } d="m81.002625 0.7506562l80.25197 0l0 80.25197l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m81.002625 0.7506562l80.25197 0l0 80.25197l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['2'] } d="m161.2546 0.7506562l80.25197 0l0 80.25197l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m161.2546 0.7506562l80.25197 0l0 80.25197l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['3'] } d="m241.50656 0.7506562l80.25198 0l0 80.25197l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m241.50656 0.7506562l80.25198 0l0 80.25197l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['4'] } d="m321.75854 0.7506562l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m321.75854 0.7506562l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['5'] } d="m402.0105 0.7506562l80.25198 0l0 80.25197l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m402.0105 0.7506562l80.25198 0l0 80.25197l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['6'] } d="m482.26248 0.7506562l80.25198 0l0 80.25197l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m482.26248 0.7506562l80.25198 0l0 80.25197l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['7'] } d="m562.51447 0.7506562l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m562.51447 0.7506562l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['8'] } d="m642.7664 0.7506562l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m642.7664 0.7506562l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['9'] } d="m723.0184 0.7506562l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m723.0184 0.7506562l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['0'] } d="m803.2703 0.7506562l80.252014 0l0 80.25197l-80.252014 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m803.2703 0.7506562l80.252014 0l0 80.25197l-80.252014 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['-'] } d="m883.52234 0.7506562l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m883.52234 0.7506562l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['='] } d="m963.7743 0.7506562l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m963.7743 0.7506562l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['q'] } d="m114.44882 81.002625l80.25197 0l0 80.25197l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m114.44882 81.002625l80.25197 0l0 80.25197l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['w'] } d="m194.70079 81.002625l80.25197 0l0 80.25197l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m194.70079 81.002625l80.25197 0l0 80.25197l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['e'] } d="m274.95276 81.002625l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m274.95276 81.002625l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['r'] } d="m355.2047 81.002625l80.25198 0l0 80.25197l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m355.2047 81.002625l80.25198 0l0 80.25197l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['t'] } d="m435.4567 81.002625l80.25198 0l0 80.25197l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m435.4567 81.002625l80.25198 0l0 80.25197l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['y'] } d="m515.7087 81.002625l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m515.7087 81.002625l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['u'] } d="m595.96063 81.002625l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m595.96063 81.002625l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['i'] } d="m676.2126 81.002625l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m676.2126 81.002625l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['o'] } d="m756.46454 81.002625l80.252014 0l0 80.25197l-80.252014 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m756.46454 81.002625l80.252014 0l0 80.25197l-80.252014 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['p'] } d="m836.71655 81.002625l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m836.71655 81.002625l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['['] } d="m916.9685 81.002625l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m916.9685 81.002625l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active[']'] } d="m997.22046 81.002625l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m997.22046 81.002625l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['a'] } d="m137.1811 161.2546l80.25197 0l0 80.25197l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m137.1811 161.2546l80.25197 0l0 80.25197l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['s'] } d="m217.43307 161.2546l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m217.43307 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['d'] } d="m297.68503 161.2546l80.25198 0l0 80.25197l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m297.68503 161.2546l80.25198 0l0 80.25197l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['f'] } d="m377.937 161.2546l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m377.937 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['g'] } d="m458.18896 161.2546l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m458.18896 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['h'] } d="m538.4409 161.2546l80.252014 0l0 80.25197l-80.252014 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m538.4409 161.2546l80.252014 0l0 80.25197l-80.252014 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['j'] } d="m618.69293 161.2546l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m618.69293 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['k'] } d="m698.9449 161.2546l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m698.9449 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['l'] } d="m779.19684 161.2546l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m779.19684 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active[';'] } d="m859.4488 161.2546l80.252014 0l0 80.25197l-80.252014 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m859.4488 161.2546l80.252014 0l0 80.25197l-80.252014 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['\''] } d="m939.7008 161.2546l80.25195 0l0 80.25197l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m939.7008 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>
    <!--    <path fill="#f87171" fill-opacity={ active[''] } d="m1019.95276 161.2546l80.25195 0l0 80.25197l-80.25195 0z"-->
    <!--          fill-rule="evenodd"></path>-->
    <!--    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"-->
    <!--          d="m1019.95276 161.2546l80.25195 0l0 80.25197l-80.25195 0z" fill-rule="evenodd"></path>-->
    <path fill="#f87171" fill-opacity={ active['z'] } d="m94.35696 241.50656l80.25196 0l0 80.25198l-80.25196 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m94.35696 241.50656l80.25196 0l0 80.25198l-80.25196 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['x'] } d="m174.60892 241.50656l80.25197 0l0 80.25198l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m174.60892 241.50656l80.25197 0l0 80.25198l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['c'] } d="m254.86089 241.50656l80.25197 0l0 80.25198l-80.25197 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m254.86089 241.50656l80.25197 0l0 80.25198l-80.25197 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['v'] } d="m335.11285 241.50656l80.25198 0l0 80.25198l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m335.11285 241.50656l80.25198 0l0 80.25198l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['b'] } d="m415.36484 241.50656l80.25195 0l0 80.25198l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m415.36484 241.50656l80.25195 0l0 80.25198l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['n'] } d="m495.6168 241.50656l80.25198 0l0 80.25198l-80.25198 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m495.6168 241.50656l80.25198 0l0 80.25198l-80.25198 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['m'] } d="m575.8688 241.50656l80.25195 0l0 80.25198l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m575.8688 241.50656l80.25195 0l0 80.25198l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active[','] } d="m656.1207 241.50656l80.25195 0l0 80.25198l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m656.1207 241.50656l80.25195 0l0 80.25198l-80.25195 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['.'] } d="m736.3727 241.50656l80.252014 0l0 80.25198l-80.252014 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m736.3727 241.50656l80.252014 0l0 80.25198l-80.252014 0z" fill-rule="evenodd"></path>
    <path fill="#f87171" fill-opacity={ active['/'] } d="m816.6247 241.50656l80.25195 0l0 80.25198l-80.25195 0z"
          fill-rule="evenodd"></path>
    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"
          d="m816.6247 241.50656l80.25195 0l0 80.25198l-80.25195 0z" fill-rule="evenodd"></path>
    <!--    <path fill="#f87171" fill-opacity={ active[''] } d="m896.87665 241.50656l80.25195 0l0 80.25198l-80.25195 0z"-->
    <!--          fill-rule="evenodd"></path>-->
    <!--    <path {stroke} stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt"-->
    <!--          d="m896.87665 241.50656l80.25195 0l0 80.25198l-80.25195 0z" fill-rule="evenodd"></path>-->
  </g>
</svg>
