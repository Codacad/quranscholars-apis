import express from 'express'
import { payment } from '../controllers/paymentController.js'
import { isAuthenticatedUser } from '../middlewares/isAuthenticated.js'
const router = express.Router()

router.post('/payment', isAuthenticatedUser, payment)

export default router