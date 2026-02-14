import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* ===============================
    1. REGISTER USER
================================= */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

      
        const userExists = await User.findOne({ email });
        if (userExists) {
            
            return res.status(400).json({ error: "Email already used or exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role 
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) { 
        
        res.status(500).json({ error: err.message }); 
    }
};

/* ===============================
    2. LOGIN USER
================================= */
export const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found!");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password!");

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "3d" }
        );

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, token });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// 3. GET ALL USERS (Admin Only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// 4. GET USER BY ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json("User not found");
        res.status(200).json(user);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// 5. UPDATE USER
export const updateUser = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        ).select("-password");
        
        res.status(200).json(updatedUser);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// 6. DELETE USER
export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User deleted!");
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};