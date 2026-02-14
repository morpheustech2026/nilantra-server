import Product from "../models/productModel.js";
import slugify from "slugify";

/* ===============================
    1. CREATE PRODUCT
================================= */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      mainCategory,
      subCategory,
      price,
      offerPrice,
      material,
      dimensions, 
      colors,
      images,
      stock,
      isFeatured,
      isBestSeller,
      isActive,
      seat 
    } = req.body;

    
    if (!name || !description || !mainCategory || !subCategory || !price || !images || images.length === 0) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

   
    let slug = slugify(name, { lower: true, strict: true });
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const product = new Product({
      name,
      slug,
      description,
      mainCategory,
      subCategory,
      price,
      offerPrice,
      material,
      dimensions,
      colors,
      images,
      stock,
      isFeatured,
      isBestSeller,
      isActive: isActive !== undefined ? isActive : true,
      seat, 
      vendor: req.user.id 
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);

  } catch (err) {
    res.status(500).json({ message: "Error creating product: " + err.message });
  }
};

/* ===============================
    2. GET PRODUCTS (With Filters)
================================= */
export const getProducts = async (req, res) => {
  try {
    const { main, sub, offer, best, featured, seatCount } = req.query;
    let query = { isActive: true };

    if (main) query.mainCategory = main;
    if (sub) query.subCategory = sub;
    if (offer === "true") query.offerPrice = { $exists: true, $ne: null };
    if (best === "true") query.isBestSeller = true;
    if (featured === "true") query.isFeatured = true;
    if (seatCount) query.seat = seatCount; 

    const products = await Product.find(query)
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
    3. GET SINGLE PRODUCT
================================= */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("vendor", "name email");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
    4. UPDATE PRODUCT
================================= */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
    5. DELETE PRODUCT
================================= */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};