const { getAdminId } = require('../utils/authToken')

// Admin gate. Runs AFTER userExtractor (needs req.userId). Admin identity is the
// single REACT_APP_ADMIN(_PRE) id, matched the same way as everywhere else in
// the app (see authToken.getAdminId).
module.exports = (req, res, next) => {
  if (!req.userId || String(req.userId) !== getAdminId()) {
    return res.status(403).json({ error: 'Admin only' })
  }
  next()
}
