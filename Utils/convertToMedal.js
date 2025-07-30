const medals = [':first_place:', ':second_place:', ':third_place:'];

/** @type {import('.').convertToMedal} */
module.exports = function convertToMedal(i) {
  return medals[i] ?? `${i + 1}.`;
};