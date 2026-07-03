export default function findAllEntries(
  obj: Record<string, unknown>, key: string, entryList: Record<string, unknown> = {}
): Record<string, unknown> {
  const stack = [obj];

  let currentObj;
  while (currentObj = stack.pop()) {
    for (const [oKey, oVal] of Object.entries(currentObj)) {
      if (oKey === key) entryList[key] = oVal;
      else if (typeof oVal == 'object' && oVal !== null && !Array.isArray(oVal)) stack.push(oVal);
    }
  }

  return entryList;
}