import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const purchaseSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'RecordedCourse',
        required: true,
    },
    amountPaid: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 3,
        uppercase: true,
        trim: true,
        default: 'INR',

    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    purchasedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date
    },
    accessStatus: {
        type: String,
        enum: ['inactive', 'active', 'expired', 'cancelled'],
        default: 'inactive'
    }

}, {
    timestamps: true
});

const Purchase = model('Purchase', purchaseSchema);

export default Purchase;