const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the request header
    const token = req.header('Authorization');

    // 2. If there is no token, deny access
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // 3. Verify the token using your secret key
        // We remove the word "Bearer " which is standard formatting
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Save the user info
        next(); // Let them pass to the next route!
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};