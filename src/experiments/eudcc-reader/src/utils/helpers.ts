export const padObject = (text: string, size = 2): string => {
  const indent = ' '.repeat(size);
  const [firstLine, ...otherLines] = text.split('\n');

  return [firstLine, ...otherLines.map(line => `${indent}${line}`)].join('\n');
};

export const stringify = (
  value: unknown,
  indentSize = 2,
  padSize = 0,
): string => {
  if (value instanceof Uint8Array) {
    // Convert to hex string
    return Array.from(value)
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => stringify(item)).join(', ')}]`;
  }

  if (!(value instanceof Map)) {
    return padObject(JSON.stringify(value, null, indentSize), padSize);
  }

  const indent = ' '.repeat(indentSize);
  const pad = ' '.repeat(padSize);
  const entries = Array.from(value.entries());

  return `Map(${entries.length}) {\n${entries
    .map(
      ([key, val], index) =>
        `${pad}${indent}${stringify(
          key,
          indentSize,
          padSize + indentSize,
        )} => ${stringify(val, indentSize, padSize + indentSize)}${
          index < entries.length - 1 ? ',' : ''
        }`,
    )
    .join('\n')}\n${pad}}`;
};

export const formatDate = (date: Date | undefined): string | undefined => {
  if (!date) {
    return;
  }

  return date.toISOString().endsWith('T00:00:00.000Z')
    ? // The object only contains a date without the time
      date.toLocaleDateString()
    : date.toLocaleString();
};
