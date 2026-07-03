import type { DateResolvable, TimestampStylesString } from 'discord.js';

export const
  msInSecond = 1000,
  secsInMinute = 60,
  minutesInHour = 60,
  hoursInDay = 24,
  daysInWeek = 7,
  daysInMonthMin = 28,
  daysInMonthAvg = 30,
  daysInMonthMax = 31,
  daysInYear = 365,
  monthsInYear = 12,
  secsInHour = secsInMinute * minutesInHour,
  secsInDay = secsInHour * hoursInDay,
  secsInWeek = secsInDay * daysInWeek,
  secsInMonth = secsInDay * daysInMonthAvg,
  secsInYear = secsInDay * daysInYear;

/** @param ms the time value in milliseconds since midnight, January 1, 1970 UTC. */
export function timeFormatter<T extends lang | undefined>(ms: number, lang?: T): {
  total: number; negative: boolean;
  formatted: T extends undefined
    ? `${number}${number}${number}${number}-${number}${number}, ${number}${number}:${number}${number}:${number}${number}`
    : string;
} {
  const
    now = Temporal.Now.instant(),
    target = Temporal.Instant.fromEpochMilliseconds(ms),
    targetUtc = target.toZonedDateTimeISO('UTC'),
    duration = now.toZonedDateTimeISO('UTC').until(targetUtc, { largestUnit: 'years', smallestUnit: 'seconds' }).abs();

  let id = 'others.timeFormatter.';
  if (lang) {
    id += Object.entries({ years: 'ymdhms', months: 'mdhms', days: 'dhms', hours: 'hms', minutes: 'ms' })
      .find(([unit]) => duration[unit] > 0)?.[1] ?? 's';
  }

  return {
    negative: Temporal.Instant.compare(now, target) > 0,
    total: ms,
    formatted: lang?.(id, duration) ?? targetUtc.toPlainDateTime().toString({ fractionalDigits: 0 }).replace('T', ', ')
  };
}

export function timestamp<T extends TimestampStylesString | undefined = TimestampStylesString | undefined>(
  time: Temporal.Instant, code?: T
): T extends undefined ? `<t:${number}>` : `<t:${number}:${T}>` {
  const seconds = Math.round(time.epochMilliseconds / msInSecond);
  return code ? `<t:${seconds}:${code}>` : `<t:${seconds}>`;
}