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
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let finalImages = [];

    // 1. (Existing Images)
    if (req.body.existingImages) {
      finalImages = ensureArray(req.body.existingImages);
    }

    // 2. add new images
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map(file => file.path);
      finalImages = [...finalImages, ...newUrls];
    }

    // 3. Update Data Object
    const updateFields = {
      ...req.body,
      price: Number(req.body.price),
      offerPrice: Number(req.body.offerPrice || 0),
      stock: Number(req.body.stock),
      images: finalImages,
      dimensions: typeof req.body.dimensions === "string" ? JSON.parse(req.body.dimensions) : req.body.dimensions,
      colors: ensureArray(req.body.colors),
      seat: ensureArray(req.body.seat).map(Number).filter(n => !isNaN(n)),
      isFeatured: String(req.body.isFeatured) === "true",
      isBestSeller: String(req.body.isBestSeller) === "true",
      isActive: String(req.body.isActive) === "true",
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);

  } catch (err) {
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