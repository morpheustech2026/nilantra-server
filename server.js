import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js'; 
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


connectDB();


const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send("Nilantra Furniture Backend Server is Running...");
});

// 404 Error Handling
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Global Error Handler
// Global Error Handler
app.use((err, req, res, next) => {
    // എറർ ഒബ്ജക്റ്റ് ആണോ എന്ന് ചെക്ക് ചെയ്യുന്നു
    console.log("--- ERROR DETECTED ---");
    console.log("Error type:", typeof err);
    console.log("Error content:", err); 

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err?.message || err || "Unknown Server Error",
        stack: process.env.NODE_ENV === 'production' ? null : err?.stack,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});