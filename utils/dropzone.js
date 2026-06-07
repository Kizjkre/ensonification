const get = e => {
  const dt = e.dataTransfer;
  return dt?.items ? Array.from(dt.items) : [];
};

export default ({ handleFiles, element, input, validation, clear }) => {
  const onDragEnter = e => {
    const files = get(e);
    if (!files.length) return;

    e.preventDefault();

    if (validation(files)) {
      e.dataTransfer.dropEffect = 'copy';
      element.classList.add('copy');
    } else {
      e.dataTransfer.dropEffect = 'none';
      element.classList.remove('copy');
    }
  };

  const onDragOver = e =>
    e.preventDefault();

  const onDragLeave = () =>
    clear();

  const onDrop = e => {
    e.preventDefault();

    element.classList.remove('drag-over', 'copy');

    const files = get(e);
    handleFiles(files.map(file => file.getAsFile()).filter(f => f));
  };

  const onInputChange = e =>
    handleFiles(Array.from(e.target.files || []));

  element.addEventListener('dragenter', onDragEnter);
  element.addEventListener('dragover', onDragOver);
  element.addEventListener('dragleave', onDragLeave);
  element.addEventListener('drop', onDrop);
  input.addEventListener('change', onInputChange);
};
