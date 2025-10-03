import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
  console.log('=== generateTokenAndSetCookie ===');
  
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not defined in environment variables');
    console.error('JWT_SECRET error:', error.message);
    throw error;
  }

  console.log('Generating JWT token for user ID:', userId);

  try {
    // Create JWT token
    const token = jwt.sign(
      { 
        userId,
        iat: Math.floor(Date.now() / 1000) // Issued at time
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '15d', // 15 days
        algorithm: 'HS256'
      }
    );

    console.log('Token generated successfully');

    // Set cookie options
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
      httpOnly: true,
      sameSite: isProduction ? 'lax' : 'lax', // Changed to 'lax' for local development
      secure: false, // Explicitly set to false for local development
      path: '/',
      // Don't set domain for localhost as it can cause issues
      domain: undefined,
      overwrite: true
    };

    console.log('Cookie options:', JSON.stringify(cookieOptions, null, 2));
    
    // Set the JWT as HTTP-only cookie
    res.cookie('jwt', token, cookieOptions);
    console.log('JWT cookie set in response');

    // Also return the token in case it's needed in the response
    return token;
  } catch (error) {
    console.error('Error in generateTokenAndSetCookie:', error);
    throw error;
  }
};

export default generateTokenAndSetCookie;
