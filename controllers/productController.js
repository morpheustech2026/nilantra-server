import Product from "../models/productModel.js";
import slugify from "slugify";

/* =========================
   HELPER FUNCTIONS
========================= */
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    return data.split(',').map(item => item.trim()).filter(item => item !== "");
  }
  return [data];
};

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = async (req, res) => {
  try {
    // 1. Auth Check
    if (!req.user) {
      return res.status(401).json({ message: "ലോഗിൻ വിവരങ്ങൾ ലഭ്യമല്ല!" });
    }

    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const {
      description, price,
      offerPrice, material, stock, dimensions, colors, seat,
      isFeatured, isBestSeller, isActive
    } = req.body;

    const name = req.body.name;
    const mainCategory = req.body.mainCategory;
    const subCategory = req.body.subCategory;

    if (!name || !mainCategory || !subCategory) {
      return res.status(400).json({
        message: `Missing: ${!name ? 'Name ' : ''}${!mainCategory ? 'Category ' : ''}${!subCategory ? 'SubCat' : ''}`
      });
    }

    const productData = {
      name,
      description: description || "",
      mainCategory,
      subCategory,
      price: Number(price) || 0,
      offerPrice: Number(offerPrice) || 0,
      material: material || "",
      stock: Number(stock) || 0,
      vendor: req.user.id,
      images: imageUrls,
      slug: slugify(name, { lower: true, strict: true }) + "-" + Date.now(),

      // Booleans (String to Boolean conversion)
      isFeatured: String(isFeatured) === "true",
      isBestSeller: String(isBestSeller) === "true",
      isActive: String(isActive) === "true",

      // Arrays handling
      colors: colors ? colors.split(',').map(c => c.trim()) : [],
      seat: seat ? seat.split(',').map(Number).filter(n => !isNaN(n)) : [],

      // Dimensions Parsing
      dimensions: typeof dimensions === "string" ? JSON.parse(dimensions) : dimensions
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ALL PRODUCTS
========================= */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SINGLE PRODUCT
========================= */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("vendor", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE PRODUCT
========================= */
/* =========================
   UPDATE PRODUCT
========================= */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // req.body-യിൽ നിന്ന് vendor മാറ്റുക. കാരണം vendor മാറ്റാൻ പാടില്ല, 
    // അല്ലെങ്കിൽ അത് Object ആയി വന്ന് എറർ അടിക്കും.
    const { vendor, ...otherBodyData } = req.body;

    let finalImages = [];
    if (req.body.existingImages) {
      finalImages = ensureArray(req.body.existingImages);
    } else {
      finalImages = product.images; 
    }

    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map(file => file.path);
      finalImages = [...finalImages, ...newUrls];
    }

    let parsedDimensions = otherBodyData.dimensions;
    if (typeof otherBodyData.dimensions === "string") {
      try {
        parsedDimensions = JSON.parse(otherBodyData.dimensions);
      } catch (e) {
        parsedDimensions = product.dimensions;
      }
    }

    const updateFields = {
      ...otherBodyData, // vendor ഇല്ലാത്ത ബാക്കി ഡാറ്റ മാത്രം എടുക്കുന്നു
      price: otherBodyData.price ? Number(otherBodyData.price) : product.price,
      offerPrice: otherBodyData.offerPrice ? Number(otherBodyData.offerPrice) : product.offerPrice,
      stock: otherBodyData.stock ? Number(otherBodyData.stock) : product.stock,
      images: finalImages,
      dimensions: parsedDimensions,
      colors: otherBodyData.colors ? ensureArray(otherBodyData.colors) : product.colors,
      seat: otherBodyData.seat ? ensureArray(otherBodyData.seat).map(Number).filter(n => !isNaN(n)) : product.seat,
      isFeatured: otherBodyData.isFeatured !== undefined ? String(otherBodyData.isFeatured) === "true" : product.isFeatured,
      isBestSeller: otherBodyData.isBestSeller !== undefined ? String(otherBodyData.isBestSeller) === "true" : product.isBestSeller,
      isActive: otherBodyData.isActive !== undefined ? String(otherBodyData.isActive) === "true" : product.isActive,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);

  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};
/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};