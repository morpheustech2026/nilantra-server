import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
   
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false, 
    },
   
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, 
    },
   
    name: {
      type: String,
      required: true,
      default: "Anonymous"
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [String],
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;