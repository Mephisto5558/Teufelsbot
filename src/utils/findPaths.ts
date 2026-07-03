export default function findPaths(
  obj: Record<string, unknown>, targetKey: string,
  keys: string[] = [], values: string[] = [], currKey = ''
): { keys: string[]; values: string[] } {
  for (const [k, v] of Object.entries(obj)) {
    if (k == targetKey) keys.push(currKey);

    const newKey = currKey ? `${currKey}.${k}` : k;
    if (v == targetKey) values.push(newKey);
    else if (typeof v == 'object' && v !== null) findPaths(v, targetKey, keys, values, newKey);
  }

  return { keys, values };
}