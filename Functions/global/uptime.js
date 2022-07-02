module.exports = (client, asMessage) => {
  let data;

  let totalSeconds = (Date.now() - client.startTime) / 1000
  const days = Math.floor(totalSeconds / 86400).toString();
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600).toString();
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60).toString();
  const seconds = Math.floor(totalSeconds % 60).toString();

  if (asMessage) {
    if (Number(days)) data = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    else if (Number(hours)) data = `${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    else if (Number(minutes)) data = `${minutes} minutes and ${seconds} seconds`;
    else data = `${seconds} seconds`;
  }

  return {
    total: client.startTime,
    formatted: data || `${days.padStart(2, 0)}:${hours.padStart(2, 0)}:${minutes.padStart(2, 0)}:${seconds.padStart(2, 0)}`
  };
}