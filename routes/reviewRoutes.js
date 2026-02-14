import express from 'express';
import { 
    createReview, 
    getAllReviews, 
    getGeneralReviews, 
    getProductReviews, 
    updateReview, 
    deleteReview 
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/general', createReview);
router.get('/', getAllReviews);
router.get('/general', getGeneralReviews);
router.get('/product/:productId', getProductReviews);


router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;