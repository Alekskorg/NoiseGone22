export default function handler(req, res) {
  const prog = parseFloat(req.query.prog || '0');
  const next = Math.min(prog + 0.2, 1);
  const payload = { progress: next };
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(payload);
}
