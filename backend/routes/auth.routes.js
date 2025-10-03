import { Router } from "express";
import { 
  SignUpGet, 
  SignUpPost, 
  loginGet, 
  loginPost,
  getCurrentUser 
} from "../controllers/auth.controllers.js";
import verifyToken from "../middleWare/verifyToken.js";

const router = Router();

// Public routes
router.get('/signup', SignUpGet);
router.post('/signup', SignUpPost);
router.get('/login', loginGet);
router.post('/login', loginPost);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;