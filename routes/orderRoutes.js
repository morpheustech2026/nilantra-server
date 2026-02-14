import express from 'express';
import { 
    createOrder, 
    getUserOrders, 
    getAllOrders, 
    getOrderById, 
    updateOrderStatus, 
    deleteOrder, 
    getVendorOrders 
} from '../controllers/orderController.js';
import { processPayment } from '../controllers/paymentController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);

router.get('/user/:userId', verifyToken, getUserOrders);

router.get('/vendor/:vendorId', verifyToken, getVendorOrders);

router.get('/:id', verifyToken, getOrderById);

// --- ADMIN ONLY ROUTES ---
router.get('/all', verifyToken, isAdmin, getAllOrders);
router.put('/:id', verifyToken, isAdmin, updateOrderStatus);
router.delete('/:id', verifyToken, isAdmin, deleteOrder);

// Payment Route 
router.post('/payment/process', verifyToken, processPayment);

export default router;