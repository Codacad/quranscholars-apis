import { model, Schema } from 'mongoose'

const paymentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    course: { type: Schema.Types.ObjectId, ref: "User" },
    orderId: String,
    paymentId: String,
    amount: Number,
    status: { type: String, enum: ['created', 'paid', 'failed'] },
    createdAt: Date
}, { timestamps: true })

const Payment = model('Payment', paymentSchema)
export default Payment