import Cart from '../models/cartModel.js';


export const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            
            const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            cart = await cart.save();
        } else {
            
            cart = await Cart.create({ user: userId, items: [{ product: productId, quantity }] });
        }
        res.status(200).json(cart);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 2. GET USER CART
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
        res.status(200).json(cart);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 3. REMOVE ITEM FROM CART
export const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.params.userId });
        if (!cart) return res.status(404).json("Cart not found");

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        await cart.save();
        res.status(200).json("Item removed from cart");
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// 4. CLEAR CART
export const deleteCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.params.userId });
        res.status(200).json("Cart cleared!");
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};