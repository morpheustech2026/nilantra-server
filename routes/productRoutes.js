import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/cloudinaryConfig.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/',verifyToken,upload.array('images', 10), isAdmin,createProduct);

router.put('/:id',verifyToken,upload.array('images', 10), isAdmin,updateProduct);

router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export default router;
