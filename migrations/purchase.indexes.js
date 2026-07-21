import mongoose from 'mongoose';
import Purchase from '../models/purchase/purchase.model.js';
import dns from 'dns';
import dotenv from 'dotenv';
dns.setServers(['1.1.1.1', '8.8.8.8'])
dotenv.config();
const purchaseIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // console.log(await Purchase.collection.indexes());
        await Purchase.collection.createIndex({ userId: 1, courseId: 1 }, { unique: true }, {name: 'User and Course uniqueness index'});
        await Purchase.collection.createIndex({ transactionId: 1 }, { unique: true }, {name: 'Transaction ID uniqueness index'});
        await Purchase.collection.createIndex({ paymentStatus: 1 }, {name: 'Payment Status index'});
        console.log('Purchase Indexes created successfully');
    } catch (error) {
        console.error('Error creating Purchase Indexes:', error.message);
    }
}
purchaseIndexes()