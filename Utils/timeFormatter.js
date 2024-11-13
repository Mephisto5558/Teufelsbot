const
  msInSecond = 1000,
  secsInMinute = 60,
  minutesInHour = 60,
  hoursInDay = 24,
  daysInWeek = 7,
  daysInMonthAvg = 30,
  daysInMonthMax = 31,
  daysInYear = 365,
  monthsInYear = 12,
  secsInHour = secsInMinute * minutesInHour,
  secsInDay = secsInHour * hoursInDay,
  secsInWeek = secsInDay * daysInWeek,
  secsInMonth = secsInDay * daysInMonthAvg,
  secsInYear = secsInDay * daysInYear;

/**
 * @type {import('.').timeFormatter['timeFormatter']}*/
function timeFormatter({ sec = 0, lang } = {}) {
  const
    total = sec * 1000,
    negative = sec < 0;

  sec = Math.abs(sec);
  const year = Math.floor(sec / secsInYear);
  sec %= secsInYear;
  const day = Math.floor(sec / secsInDay);
  sec %= secsInDay;
  const hour = Math.floor(sec / secsInHour);
  sec %= secsInHour;
  const minute = Math.floor(sec / secsInMinute);
  sec %= secsInMinute;
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

module.exports = {
  timeFormatter,
  msInSecond, secsInMinute, minutesInHour, hoursInDay, daysInWeek, daysInMonthAvg, daysInMonthMax,
  daysInYear, monthsInYear, secsInHour, secsInDay, secsInWeek, secsInMonth, secsInYear
};

/** Tests the timeFormatter*/
function _testTimeFormatter() {
  const testCases = [
    { input: { sec: 0 }, expectedOutput: '0000-00, 00:00:00' },
    { input: { sec: secsInMinute }, expectedOutput: '0000-00, 00:01:00' },
    { input: { sec: secsInHour }, expectedOutput: '0000-00, 01:00:00' },
    { input: { sec: secsInDay }, expectedOutput: '0000-01, 00:00:00' },
    { input: { sec: secsInWeek }, expectedOutput: '0000-07, 00:00:00' },
    { input: { sec: secsInMonth }, expectedOutput: '0000-30, 00:00:00' },
    { input: { sec: secsInYear }, expectedOutput: '0001-00, 00:00:00' },
    { input: { sec: secsInYear + secsInWeek }, expectedOutput: '0001-07, 00:00:00' },
    { input: { sec: secsInYear + secsInMonth }, expectedOutput: '0001-30, 00:00:00' },
    { input: { sec: secsInYear + secsInDay * daysInYear }, expectedOutput: '0002-00, 00:00:00' },
    { input: { sec: secsInYear + secsInDay * daysInYear + secsInWeek }, expectedOutput: '0002-07, 00:00:00' },
    { input: { sec: secsInYear + secsInDay * daysInYear + secsInMonth }, expectedOutput: '0002-30, 00:00:00' }
  ];

  require('./testAFunction')(timeFormatter, testCases);
}