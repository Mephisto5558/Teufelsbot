/** @type {import('.').getAge} */
module.exports = function getAge(date) {
  const
    now = new Date(),
    age = now.getFullYear() - date.getFullYear(),
    month = now.getMonth() - date.getMonth();

  return month < 0 || (month == 0 && now.getDate() < date.getDate()) ? age - 1 : age;
};