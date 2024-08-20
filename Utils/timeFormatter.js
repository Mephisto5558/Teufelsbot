/**
 * @type {import('.').timeFormatter}*/
function timeFormatter({ sec = 0, lang }) {
  const
    total = sec * 1000,
    negative = sec < 0;

  sec = Math.abs(sec);
  const year = Math.floor(sec / (60 * 60 * 24 * 365));
  sec %= 60 * 60 * 24 * 365;
  const day = Math.floor(sec / (60 * 60 * 24));
  sec %= 60 * 60 * 24;
  const hour = Math.floor(sec / (60 * 60));
  sec %= 60 * 60;
  const minute = Math.floor(sec / 60);
  sec %= 60;
  const second = Math.floor(sec);

  let id = 'others.timeFormatter.';
  if (lang) {
    if (year) id += 'ydhms';
    else if (day) id += 'dhms';
    else if (hour) id += 'hms';
    else id += minute ? 'ms' : 's';
  }

  return {
    total, negative,
    formatted: lang?.(id, { year, day, hour, minute, second })
    ?? `${year.toString().padStart(4, '0')}-${day.toString().padStart(2, '0')}, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
  };
}

module.exports = timeFormatter;

/** Tests the timeFormatter*/
function _testTimeFormatter() {
  const testCases = [
    { input: { sec: 0 }, expectedOutput: '0000-00, 00:00:00' },
    { input: { sec: 60 }, expectedOutput: '0000-00, 00:01:00' },
    { input: { sec: 3600 }, expectedOutput: '0000-00, 01:00:00' },
    { input: { sec: 86_400 }, expectedOutput: '0000-01, 00:00:00' },
    { input: { sec: 604_800 }, expectedOutput: '0000-07, 00:00:00' },
    { input: { sec: 2_592_000 }, expectedOutput: '0000-30, 00:00:00' },
    { input: { sec: 31_536_000 }, expectedOutput: '0001-00, 00:00:00' },
    { input: { sec: 31_536_000 + 604_800 }, expectedOutput: '0001-07, 00:00:00' },
    { input: { sec: 31_536_000 + 86_400 * 30 }, expectedOutput: '0001-30, 00:00:00' },
    { input: { sec: 31_536_000 + 86_400 * 365 }, expectedOutput: '0002-00, 00:00:00' },
    { input: { sec: 31_536_000 + 86_400 * 365 + 604_800 }, expectedOutput: '0002-07, 00:00:00' },
    { input: { sec: 31_536_000 + 86_400 * 365 + 86_400 * 30 }, expectedOutput: '0002-30, 00:00:00' }
  ];

  require('./testAFunction')(timeFormatter, testCases);
}