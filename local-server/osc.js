export default packet => {
  let offset = 0;

  const readString = () => {
    const end = packet.indexOf(0, offset);
    if (end === -1) throw new Error('Unterminated OSC string');

    const value = packet.toString('utf8', offset, end);
    offset = (end + 4) & ~3; // Skip NUL and padding to a 4-byte boundary
    if (offset > packet.length) throw new Error('Truncated OSC string');
    return value;
  };

  const requireBytes = count => {
    if (offset + count > packet.length) {
      throw new Error('Truncated OSC argument');
    }
  };

  const address = readString();
  const typeTags = readString();

  if (!address.startsWith('/')) throw new Error('Invalid OSC address');
  if (!typeTags.startsWith(',')) throw new Error('Missing OSC type tags');

  const args = [];

  for (const tag of typeTags.slice(1)) {
    switch (tag) {
      case 'i':
        requireBytes(4);
        args.push(packet.readInt32BE(offset));
        offset += 4;
        break;
      case 'f':
        requireBytes(4);
        args.push(packet.readFloatBE(offset));
        offset += 4;
        break;
      case 's':
        args.push(readString());
        break;
      case 'b': {
        requireBytes(4);
        const length = packet.readUInt32BE(offset);
        offset += 4;
        requireBytes(length);
        args.push(packet.subarray(offset, offset + length));
        offset = (offset + length + 3) & ~3; // Blob padding
        break;
      }
      default:
        throw new Error(`Unsupported OSC type tag: ${ tag }`);
    }
  }

  return { address, args };
}
