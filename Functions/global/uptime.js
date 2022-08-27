module.exports = asMessage => {
  let data;

  let s = process.uptime();
  let m = s / 60;
  let h = m / 60;
  const d = Math.floor(h / 24).toString();

  s = Math.floor(s % 60).toString();
  m = Math.floor(m % 60).toString();
  h = Math.floor(h % 24).toString();

  if (asMessage) {
    if (parseInt(d)) data = `${d} days, ${h} hours, ${m} minutes and ${s} seconds`;
    else if (parseInt(h)) data = `${h} hours, ${m} minutes and ${s} seconds`;
    else if (parseInt(m)) data = `${m} minutes and ${s} seconds`;
    else data = `${s} seconds`;
  }

  return {
    total: process.uptime() * 1000,
    formatted: data || `${d.padStart(2, 0)}:${h.padStart(2, 0)}:${m.padStart(2, 0)}:${s.padStart(2, 0)}`
  }
}