const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'missing_authorization', message: 'Authorization bearer token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.AUTH_JWT_SECRET);
    const userId = payload.sub || payload.user_id || payload.id;
    if (!userId) {
      return res.status(401).json({ error: 'invalid_token_subject', message: 'Token missing subject/user id' });
    }
    req.user = { id: userId, ...payload };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token', message: err.message });
  }
}

module.exports = requireAuth;
