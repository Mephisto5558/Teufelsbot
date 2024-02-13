/**
 * @param {number}sec
 * @param {lang?}lang
 * @returns `formatted` has the format 'year-day, hour:minute:second' if `lang` is not provided.*/
function timeFormatter(sec = 0, lang = undefined) {
  const
    total = sec * 1000,
    negative = sec < 0;

  sec = Math.abs(sec);
  const y = Math.floor(sec / (60 * 60 * 24 * 365));
  sec %= 60 * 60 * 24 * 365;
  const d = Math.floor(sec / (60 * 60 * 24));
  sec %= 60 * 60 * 24;
  const h = Math.floor(sec / (60 * 60));
  sec %= 60 * 60;
  const m = Math.floor(sec / 60);
  sec %= 60;
  const s = Math.floor(sec);

  let id = 'others.timeFormatter.';
  if (lang) {
    if (y) id += 'ydhms';
    else if (d) id += 'dhms';
    else if (h) id += 'hms';
    else id += m ? 'ms' : 's';
  }

  return {
    total, negative,
    formatted: lang?.(id, { y, d, h, m, s })
    ?? `${y.toString().padStart(4, '0')}-${d.toString().padStart(2, '0')}, ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  };
}

module.exports = timeFormatter;

/** Tests the timeFormatter*/
// eslint-disable-next-line no-unused-vars
function testTimeFormatter() {
  const testCases = [
    { input: 0, expectedOutput: '0000-00, 00:00:00' },
    { input: 60, expectedOutput: '0000-00, 00:01:00' },
    { input: 3600, expectedOutput: '0000-00, 01:00:00' },
    { input: 86400, expectedOutput: '0000-01, 00:00:00' },
    { input: 604800, expectedOutput: '0000-07, 00:00:00' },
    { input: 2592000, expectedOutput: '0000-30, 00:00:00' },
    { input: 31536000, expectedOutput: '0001-00, 00:00:00' },
    { input: 31536000 + 604800, expectedOutput: '0001-07, 00:00:00' },
    { input: 31536000 + 86400 * 30, expectedOutput: '0001-30, 00:00:00' },
    { input: 31536000 + 86400 * 365, expectedOutput: '0002-00, 00:00:00' },
    { input: 31536000 + 86400 * 365 + 604800, expectedOutput: '0002-07, 00:00:00' },
    { input: 31536000 + 86400 * 365 + 86400 * 30, expectedOutput: '0002-30, 00:00:00' }
  ];

  for (const { input, expectedOutput } of testCases) {
    const result = timeFormatter(input).formatted;
    if (result != expectedOutput) console.log(`Input: "${input}" | Expected output: "${expectedOutput}" | Actual output: "${result}"`);
  }
}