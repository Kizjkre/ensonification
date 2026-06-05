document.addEventListener('keyup', e => {
  switch (e.key) {
    case 'Escape':
      document.dispatchEvent(new CustomEvent('hotkey-escape'));
      break;
  }
});
