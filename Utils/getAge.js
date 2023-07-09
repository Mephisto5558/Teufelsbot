module.exports = function getAge([year, month, day]) {
  const now = new Date(), nowMonth = now.getMonth(), age = now.getFullYear() - year;
  return nowMonth - month < -1 || (nowMonth - month == -1 && now.getDate() < day) ? age - 1 : age;
};