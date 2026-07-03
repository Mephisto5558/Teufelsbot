export default function getAge(birthday: Temporal.PlainDate): number {
  return birthday.until(Temporal.Now.plainDateISO(), { largestUnit: 'years' }).years;
}