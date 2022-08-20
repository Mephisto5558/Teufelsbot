module.exports = ({ startTime }, asMessage) => {
  const now = Date.now();
  let data;

  let s = (now - startTime) / 1000;
  let m = s / 60;
  let h = m / 60;
  const d = Math.round(h / 24).toString();

  s = Math.round(s % 60).toString();
  m = Math.round(m % 60).toString();
  h = Math.round(h % 24).toString();

  if (asMessage) {
    if (parseInt(d)) data = `${d} days, ${h} hours, ${m} minutes and ${s} seconds`;
    else if (parseInt(h)) data = `${h} hours, ${m} minutes and ${s} seconds`;
    else if (parseInt(m)) data = `${m} minutes and ${s} seconds`;
    else data = `${s} seconds`;
  }

  return {
    total: (now - startTime),
    formatted: data || `${d.padStart(2, 0)}:${h.padStart(2, 0)}:${m.padStart(2, 0)}:${s.padStart(2, 0)}`
  };
}