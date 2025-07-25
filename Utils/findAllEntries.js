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

function _testFindAllEntries() {
  const testCases = [
    {
      name: 'Single match',
      input: {
        key1: 'value1',
        nested: { key2: 'value2', deeper: { key3: 'value3' } }
      },
      key: 'key3',
      expectedOutput: { key3: 'value3' }
    },
    {
      name: 'Multiple matches',
      input: {
        key1: 'value1', nested: {
          key2: 'value2', deeper: { key3: 'value3', anotherKey: 'anotherValue' }
        }
      },
      key: 'key3',
      expectedOutput: { key3: 'value3' }
    },
    {
      name: 'No match',
      input: { key1: 'value1', nested: { key2: 'value2' } },
      key: 'nonExistentKey',
      expectedOutput: {}
    },
    {
      name: 'No object or key provided',
      input: {},
      key: '',
      expectedOutput: undefined
    }
  ];

  for (const { name, input, key, expectedOutput } of testCases) {
    const result = findAllEntries(input, key);
    if (JSON.stringify(result) !== JSON.stringify(expectedOutput))
      console.log(`Test case "${name}" failed. Expected: ${JSON.stringify(expectedOutput)}, Actual: ${JSON.stringify(result)}`);
  }
}