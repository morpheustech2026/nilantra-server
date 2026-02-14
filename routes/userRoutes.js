import express from 'express';
import { register, login, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/', verifyToken, isAdmin, getAllUsers); 
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;