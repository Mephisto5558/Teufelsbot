const dateMonthOffset = -1;

/** @type {import('.').getAge} */
module.exports = function getAge(date) {
  const
    now = new Date(),
    nowMonth = now.getMonth(),
    month = date.getMonth(),
    age = now.getFullYear() - date.getFullYear();

  return nowMonth - month < dateMonthOffset || (nowMonth - month == dateMonthOffset && now.getDate() < date.getDate()) ? age - 1 : age;
};