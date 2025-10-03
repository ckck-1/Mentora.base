import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateTokenAndSetCookie from "../lib/utils/generateTokenAndSetCookie.js";

// Helper function for consistent response format
const sendResponse = (res, status, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(status).json(response);
};

export const SignUpGet = (req, res) => {
  return sendResponse(res, 200, true, 'Signup endpoint is active');
};


export const SignUpPost = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username?.trim() || !email?.trim() || !password ) {
      return sendResponse(res, 400, false, 'All fields are required');
    }

    // Check username
    const userExists = await User.findOne({ username: username.toLowerCase().trim() });
    if (userExists) {
      return sendResponse(res, 409, false, 'Username already taken');
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, false, 'Invalid email format');
    }

    // Check if email exists
    const emailTaken = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailTaken) {
      return sendResponse(res, 409, false, 'Email already registered');
    }

    // Validate password
    if (password.length <= 6) {
      return sendResponse(res, 400, false, 'Password must be more than 6 characters');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPwd
    });

    // Generate token & set cookie
    const token = generateTokenAndSetCookie(newUser._id, res);

    // Return user data (excluding password)
    const userData = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };

    return sendResponse(res, 201, true, 'User registered successfully', { 
      user: userData,
      token // Include token in response
    });

  } catch (error) {
    console.error('Signup error:', error);
    return sendResponse(res, 500, false, 'Server error during registration');
  }
};

export const loginGet = (req, res) => {
  return sendResponse(res, 200, true, 'Login endpoint is active');
};

export const loginPost = async (req, res) => {
  try {
    console.log('Login attempt with data:', { email: req.body.email });
    const { email, password } = req.body;

    // Input validation
    if (!email?.trim() || !password) {
      console.log('Missing email or password');
      return sendResponse(res, 400, false, 'Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('User not found with email:', email);
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    console.log('User authenticated, generating token...');
    
    // Generate token & set cookie
    const token = generateTokenAndSetCookie(user._id, res);
    console.log('Token generated and cookie set');

    // Get the user data to return (excluding password)
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email
    };

    console.log('Sending successful login response');
    return sendResponse(res, 200, true, 'Login successful', { 
      user: userData,
      token // Include token in response
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(res, 500, false, 'Server error during login');
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return sendResponse(res, 401, false, 'Not authenticated');
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User retrieved successfully', { user });

  } catch (error) {
    console.error('Get current user error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve user');
  }
};