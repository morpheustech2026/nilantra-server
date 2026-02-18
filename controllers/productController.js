import Product from "../models/productModel.js";
import slugify from "slugify";

/* =========================
   HELPER FUNCTIONS
========================= */

// Convert to Array safely
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    return data
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }
  return [data];
};

// Safe number conversion
const toNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Login required" });
    }

    const {
      name,
      description,
      mainCategory,
      subCategory,
      price,
      offerPrice,
      material,
      stock,
      dimensions,
      colors,
      seat,
      isFeatured,
      isBestSeller,
      isActive,
    } = req.body;

    // Required validation
    if (!name || !mainCategory || !subCategory) {
      return res.status(400).json({
        message: `Missing fields: ${
          !name ? "Name " : ""
        }${!mainCategory ? "MainCategory " : ""}${
          !subCategory ? "SubCategory" : ""
        }`,
      });
    }

    const imageUrls = req.files
      ? req.files.map((file) => file.path)
      : [];

    const productData = {
      name: name.trim(),
      description: description || "",
      mainCategory,
      subCategory,
      price: toNumber(price),
      offerPrice: toNumber(offerPrice),
      material: material || "",
      stock: toNumber(stock),
      vendor: req.user.id,
      images: imageUrls,
      slug:
        slugify(name, { lower: true, strict: true }) +
        "-" +
        Date.now(),

      // Boolean handling
      isFeatured: String(isFeatured) === "true",
      isBestSeller: String(isBestSeller) === "true",
      isActive:
        isActive !== undefined
          ? String(isActive) === "true"
          : true,

      // Array handling
      colors: ensureArray(colors),
      seat: ensureArray(seat)
        .map((n) => Number(n))
        .filter((n) => !isNaN(n)),

      // JSON parse safely
      dimensions:
        typeof dimensions === "string"
          ? JSON.parse(dimensions || "{}")
          : dimensions || {},
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ALL PRODUCTS
========================= */
export const getProducts = async (req, res) => {
  try {
    const { mainCategory, subCategory } = req.query;
    let query = {};

    if (mainCategory) query.mainCategory = mainCategory;
    if (subCategory) query.subCategory = subCategory;

    const products = await Product.find(query)
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
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "name email"
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

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

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    let finalImages = [];

    // Keep existing images
    if (req.body.existingImages) {
      finalImages = ensureArray(req.body.existingImages);
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((file) => file.path);
      finalImages = [...finalImages, ...newUrls];
    }

    const updateFields = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      mainCategory: req.body.mainCategory || product.mainCategory,
      subCategory: req.body.subCategory || product.subCategory,
      material: req.body.material || product.material,

      price: toNumber(req.body.price, product.price),
      offerPrice: toNumber(req.body.offerPrice, product.offerPrice),
      stock: toNumber(req.body.stock, product.stock),

      images: finalImages.length > 0 ? finalImages : product.images,

      slug: req.body.name
        ? slugify(req.body.name, {
            lower: true,
            strict: true,
          }) + "-" + Date.now()
        : product.slug,

      dimensions:
        typeof req.body.dimensions === "string"
          ? JSON.parse(req.body.dimensions || "{}")
          : req.body.dimensions || product.dimensions,

      colors: req.body.colors
        ? ensureArray(req.body.colors)
        : product.colors,

      seat: req.body.seat
        ? ensureArray(req.body.seat)
            .map((n) => Number(n))
            .filter((n) => !isNaN(n))
        : product.seat,

      isFeatured:
        req.body.isFeatured !== undefined
          ? String(req.body.isFeatured) === "true"
          : product.isFeatured,

      isBestSeller:
        req.body.isBestSeller !== undefined
          ? String(req.body.isBestSeller) === "true"
          : product.isBestSeller,

      isActive:
        req.body.isActive !== undefined
          ? String(req.body.isActive) === "true"
          : product.isActive,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: "Product Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
