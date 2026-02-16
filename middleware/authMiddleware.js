import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: "User not found!" });
            }

            return next(); // Corrected: return next() to stop execution here
        } catch (error) {
            console.error("Auth Error:", error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
};

export const verifyToken = protect;


export const isAdmin = (req, res, next) => {

    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Access denied! Admins only." });
    }
};
export const isVendor = (req, res, next) => {
    if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: "Access denied! Vendors only." });
    }
};