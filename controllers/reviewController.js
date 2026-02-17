import Review from '../models/reviewModel.js';


export const createReview = async (req, res) => {
    try {
        const { product, rating, comment, images, guestName } = req.body;
        const userId = req.user ? req.user._id : null; 

        const review = new Review({
            product: product || null, 
            user: userId,
            rating: Number(rating),
            comment,
            images: images || [],
            name: req.user ? req.user.name : (guestName || "Anonymous")
        });

        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { rating, comment, images, reply } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        
        const isAdmin = req.user && req.user.role === 'admin';
        const isOwner = req.user && review.user && review.user.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(401).json({ message: "Unauthorized to update" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.images = images || review.images;
        
        
        if (isAdmin && reply !== undefined) {
            review.reply = reply;
        }

        const updatedReview = await review.save();
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

       
        const isAdmin = req.user && req.user.role === 'admin';
        const isOwner = req.user && review.user && review.user.toString() === req.user._id.toString();

        if (isAdmin || isOwner) {
            await review.deleteOne();
            res.status(200).json({ message: "Review deleted successfully" });
        } else {
            res.status(401).json({ message: "Not authorized to delete this review" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name image')
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('user', 'name image');
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name image')
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGeneralReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: null })
            .populate('user', 'name image')
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};