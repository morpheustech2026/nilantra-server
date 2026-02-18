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

    if (mainCategory) {
      // ഹൈഫൻ ഉണ്ടെങ്കിൽ സ്പേസ് ആക്കുന്നു, എന്നിട്ട് Case-Insensitive ആയി തിരയുന്നു
      const formattedMain = mainCategory.replace(/-/g, " ");
      query.mainCategory = { $regex: new RegExp(`^${formattedMain}$`, "i") };
    }

    if (subCategory) {
      const formattedSub = subCategory.replace(/-/g, " ");
      query.subCategory = { $regex: new RegExp(`^${formattedSub}$`, "i") };
    }

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
      const newUrls = req.files.map((file) => file.path);
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
