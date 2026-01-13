// import Razorpay from "razorpay"
// import User from "../models/user/userModel.js"
// import Payment from "../models/payment/paymentModel.js"
// import mongoose from "mongoose"
// import crypto from 'crypto'

// const courseCollection = mongoose.connection.collection('courses')
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_SECRET
// })
// // Create Order
// export const payment = async (req, res) => {
//     const { courseId } = req.body
//     if (!courseId) {
//         return res.status(400).send({ message: 'Course ID is required!' })
//     }
//     try {
//         const course = await courseCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId) })
//         if (!course) {
//             return res.status(404).send({ message: "Course not found!" })
//         }
//         const amount = course.amount * 100
//         const order = await razorpay.orders.create({
//             amount: amount,
//             currency: 'INR',
//             receipt: `receipt_${Date.now()}`,
//             notes: { // to ask
//                 courseId: course._id.toString(),
//                 userId: req.user._id.toString(),
//             }
//         })
//         res.status(201).send({
//             success: true,
//             orderId: order.id,
//             amount: order.amount,
//             currency: order.currency,
//             key: process.env.RAZORPAY_KEY_ID
//         })
//     } catch (error) {
//         res.status(500).send({ message: "Order failed" })
//     }
// }

// // Verify Order
// export const verifyOrder = async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, courseId, razorpay_signature } = req.body
//     if (!razorpay_order_id || !razorpay_payment_id || courseId || razorpay_signature) {
//         return res.status(400).send({ message: 'Missing required field' })
//     }
//     try {
//         const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
//             .update(`${razorpay_order_id}` | `${razorpay_payment_id}`)
//             .digest('hex')
//         if (!expectedSignature !== razorpay_signature) {
//             return res.status(400).send({ message: 'Invalid signature. Payment verification failed.' })
//         }
//         await User.findByIdAndUpdate(req.user._id, {
//             $addToSet: {
//                 courses: new mongoose.Types.ObjectId(courseId)
//             }
//         })
//         return res.status(200).send({ message: "Payment successful, course purchased" })
//     } catch (error) {
//         res.status(500).send({ message: error.message })
//     }
// }