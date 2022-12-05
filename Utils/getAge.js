module.exports = function getAge([year, month, day]) {
  const now = new Date(), nowMonth = now.getMonth(), nowDay = now.getDate(), age = now.getFullYear() - year;
  return nowMonth - month < -1 || (nowMonth - month == -1 && nowDay < day) ? age - 1 : age;
};