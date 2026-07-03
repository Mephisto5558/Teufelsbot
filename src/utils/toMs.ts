import { daysInYear, hoursInDay, minutesInHour, msInSecond, secsInMinute } from './timeFormatter.ts';

export const
  secToMs = (secs: number): number => secs * msInSecond,
  minToMs = (mins: number): number => secToMs(mins * secsInMinute),
  hourToMs = (hours: number): number => minToMs(hours * minutesInHour),
  dayToMs = (days: number): number => hourToMs(days * hoursInDay),
  yearToMs = (years: number): number => dayToMs(years * daysInYear);