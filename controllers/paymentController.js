import Order from '../models/paymentModel.js';


export const processPayment = async (req, res) => {
    const { orderId, status, transactionId } = req.body;
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { 
                $set: { 
                    paymentStatus: status, // 'Completed'
                    transactionId: transactionId 
                } 
            },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
};