import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// 1. PLACE ORDER 
export const createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 2. GET USER ORDERS 
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).populate("items.product");
        res.status(200).json(orders);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 3. GET ALL ORDERS 
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email");
        res.status(200).json(orders);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 4. GET SINGLE ORDER
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.product user", "name email");
        if (!order) return res.status(404).json("Order not found");
        res.status(200).json(order);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 5. UPDATE ORDER STATUS 
export const updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { orderStatus: req.body.orderStatus } },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 6. DELETE ORDER 
export const deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order deleted successfully");
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 7. GET VENDOR ORDERS 
export const getVendorOrders = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.params.vendorId });
        const productIds = products.map(p => p._id);
        const orders = await Order.find({ "items.product": { $in: productIds } }).populate("user", "name email");
        res.status(200).json(orders);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};