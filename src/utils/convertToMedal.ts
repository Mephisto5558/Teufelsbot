const medals = [':first_place:', ':second_place:', ':third_place:'] as const;

export default function convertToMedal<
  POS extends number
>(i: POS): (typeof medals)[POS] extends undefined ? `${Add<POS, 1>}.` : (typeof medals)[POS] {
  return medals[i] ?? `${i + 1}.`;
}