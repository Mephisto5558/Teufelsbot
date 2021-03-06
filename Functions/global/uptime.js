module.exports = ({ startTime }, asMessage) => {
  let data;

  let totalSeconds = (Date.now() - startTime) / 1000
  const days = Math.round(totalSeconds / 86400).toString();
  totalSeconds %= 86400;
  const hours = Math.round(totalSeconds / 3600).toString();
  totalSeconds %= 3600;
  const minutes = Math.round(totalSeconds / 60).toString();
  const seconds = Math.round(totalSeconds % 60).toString();

  if (asMessage) {
    if (Number(days)) data = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    else if (Number(hours)) data = `${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    else if (Number(minutes)) data = `${minutes} minutes and ${seconds} seconds`;
    else data = `${seconds} seconds`;
  }

  return {
    total: (Date.now() - startTime),
    formatted: data || `${days.padStart(2, 0)}:${hours.padStart(2, 0)}:${minutes.padStart(2, 0)}:${seconds.padStart(2, 0)}`
  };
}