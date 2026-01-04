import express from 'express';
import multer from 'multer';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validation/auth.js';
import { register as registerCtrl, login as loginCtrl } from '../controllers/authController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Register (multipart/form-data - supports avatar file or avatarUrl)
router.post('/register', upload.single('avatar'), validate(registerSchema), registerCtrl);

// Login
router.post('/login', validate(loginSchema), loginCtrl);

export default router;

