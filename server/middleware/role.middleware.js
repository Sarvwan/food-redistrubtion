module.exports = function (roles) {
  return function (req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ msg: 'Not authenticated or role missing' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: insufficient permissions' });
    }
    
    next();
  };
};
