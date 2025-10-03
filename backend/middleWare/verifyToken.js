import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    console.log('\n=== verifyToken Middleware ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    
    // Log request details
    console.log('Request details:', {
        method: req.method,
        url: req.originalUrl,
        headers: {
            'authorization': req.headers.authorization ? '***' : 'not present',
            'cookie': req.headers.cookie ? '***' : 'not present'
        },
        cookies: Object.keys(req.cookies || {}).length > 0 ? '***' : 'no cookies'
    });
    
    // Check for token in cookies first, then in Authorization header
    const token = req.cookies?.jwt || 
                 (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    console.log('Token found:', token ? 'yes' : 'no');
    
    if (!token) {
        console.log('No token provided in request');
        return res.status(401).json({ 
            success: false,
            error: "Authentication required. Please log in." 
        });
    }

    try {
        console.log('Verifying token...');
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully. User ID:', decoded.userId || decoded.id);
        
        // Add user ID to request object
        req.userId = decoded.userId || decoded.id;
        
        // Continue to the next middleware/route handler
        next();
    } catch (err) {
        console.error('Token verification failed:', {
            name: err.name,
            message: err.message,
            expiredAt: err.expiredAt
        });
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                error: "Session expired. Please log in again." 
            });
        }
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                error: "Invalid token. Please log in again." 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            error: `Authentication failed: ${err.message}` 
        });
    }
};

export default verifyToken;
