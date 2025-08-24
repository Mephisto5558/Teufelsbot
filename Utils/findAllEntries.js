/** @type {import('.').findAllEntires} */
function findAllEntries(obj, key, entryList = {}) {
  const stack = [obj];
  while (stack.length) {
    /** @type {Record<string, unknown>} */
    const currentObj = stack.pop();

    for (const [oKey, oVal] of Object.entries(currentObj)) {
      if (oKey === key) entryList[key] = oVal;
      else if (typeof oVal == 'object' && oVal !== null && !Array.isArray(oVal)) stack.push(oVal);
    }
  }

  return entryList;
}

module.exports = findAllEntries;