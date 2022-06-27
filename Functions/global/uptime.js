module.exports = (client, asMessage) => {
  let data;

  let totalSeconds = (Date.now() - client.startTime) / 1000
  const days = Math.floor(totalSeconds / 86400).toString().padStart(2, 0);
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, 0);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, 0);
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, 0);

  if (asMessage) {
    if (days) data = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    else if (hours) data = `${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    else if (minutes) data = `${minutes} minutes and ${seconds} seconds`;
    else data = `${seconds} seconds`;
  }

  return {
    total: client.startTime,
    formatted: data ? data : `${days}:${hours}:${minutes}:${seconds}`
  }
}