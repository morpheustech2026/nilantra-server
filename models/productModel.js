import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  mainCategory: { type: String, required: true },
  subCategory: { type: String, required: true },
  price: { type: Number, default: 0 },
  offerPrice: { type: Number }, 
  material: { type: String },
  dimensions: { length: String, width: String, height: String },
  colors: [String],
  images: [{ type: String, required: true }],
  seat:[{type:Number}],
  stock: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, { timestamps: true });

export default mongoose.model("Product", productSchema);