/** @type {import('.').getAge}*/
module.exports = function getAge(date) {
  const
    now = new Date(),
    nowMonth = now.getMonth(),
    month = date.getMonth(),
    age = now.getFullYear() - date.getFullYear();

  return nowMonth - month < -1 || (nowMonth - month == -1 && now.getDate() < date.getDate()) ? age - 1 : age;
};