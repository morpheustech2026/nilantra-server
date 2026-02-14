import express from 'express';
import { addToCart, getCart, removeFromCart, deleteCart } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', verifyToken, addToCart);
router.get('/:userId', verifyToken, getCart);
router.delete('/remove/:userId/:productId', verifyToken, removeFromCart);
router.delete('/clear/:userId', verifyToken, deleteCart);

export default router;