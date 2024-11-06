const
  secsInMinute = 60,
  minutesInHour = 60,
  hoursInDay = 24,
  weekInDays = 7,
  monthInDays = 30,
  yearInDays = 365,
  hourInSecs = secsInMinute * minutesInHour,
  dayInSecs = hourInSecs * hoursInDay,
  weekInSecs = dayInSecs * weekInDays,
  monthInSecs = dayInSecs * monthInDays,
  yearInSecs = dayInSecs * yearInDays;

/**
 * @type {import('.').timeFormatter['timeFormatter']}*/
function timeFormatter({ sec = 0, lang } = {}) {
  const
    total = sec * 1000,
    negative = sec < 0;

  sec = Math.abs(sec);
  const year = Math.floor(sec / yearInSecs);
  sec %= yearInSecs;
  const day = Math.floor(sec / dayInSecs);
  sec %= dayInSecs;
  const hour = Math.floor(sec / hourInSecs);
  sec %= hourInSecs;
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

module.exports = { timeFormatter, secsInMinute, minutesInHour, hoursInDay, weekInDays, monthInDays, yearInDays, hourInSecs, dayInSecs, weekInSecs, monthInSecs, yearInSecs };

/** Tests the timeFormatter*/
function _testTimeFormatter() {
  const testCases = [
    { input: { sec: 0 }, expectedOutput: '0000-00, 00:00:00' },
    { input: { sec: secsInMinute }, expectedOutput: '0000-00, 00:01:00' },
    { input: { sec: hourInSecs }, expectedOutput: '0000-00, 01:00:00' },
    { input: { sec: dayInSecs }, expectedOutput: '0000-01, 00:00:00' },
    { input: { sec: weekInSecs }, expectedOutput: '0000-07, 00:00:00' },
    { input: { sec: monthInSecs }, expectedOutput: '0000-30, 00:00:00' },
    { input: { sec: yearInSecs }, expectedOutput: '0001-00, 00:00:00' },
    { input: { sec: yearInSecs + weekInSecs }, expectedOutput: '0001-07, 00:00:00' },
    { input: { sec: yearInSecs + monthInSecs }, expectedOutput: '0001-30, 00:00:00' },
    { input: { sec: yearInSecs + dayInSecs * yearInDays }, expectedOutput: '0002-00, 00:00:00' },
    { input: { sec: yearInSecs + dayInSecs * yearInDays + weekInSecs }, expectedOutput: '0002-07, 00:00:00' },
    { input: { sec: yearInSecs + dayInSecs * yearInDays + monthInSecs }, expectedOutput: '0002-30, 00:00:00' }
  ];

  require('./testAFunction')(timeFormatter, testCases);
}