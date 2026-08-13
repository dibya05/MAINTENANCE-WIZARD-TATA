const jwt = require('jsonwebtoken');

// Purpose: This is a "guard" that checks if a user has a valid digital ID (JWT token) before letting them access protected routes.
const protect = (req, res, next) => {
  // 1. Look for the token in the headers (it usually looks like "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // 2. Extract just the token part
      const token = authHeader.split(' ')[1];
      
      // 3. Verify if the token is real and hasn't been tampered with
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 4. Attach the decoded user data to the request so the next function can use it
      req.user = decoded;
      
      // 5. Let the user pass through to the actual route!
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
