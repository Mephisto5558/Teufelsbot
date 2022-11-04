module.exports = function getAge([year, month, day]) {
  const now = new Date();
  return now.getMonth() - month < -1 || (now.getMonth() - month == -1 && now.getDate() < day) ? now.getFullYear() - year - 1 : now.getFullYear() - year;
};