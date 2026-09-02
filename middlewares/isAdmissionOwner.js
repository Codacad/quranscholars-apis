import Admission from "../models/admission/admission.model.js";
export default async function isAdmissionOwner(req, res, next) {
    if (!req.user) {
        const error = new Error('Authentication is required')
        error.statusCode = 401;
        return next(error)
    }

    const { admissionId } = req.params;
    try {
        const admission = await Admission.findById(admissionId);
        if (!admission) {
            const error = new Error('Admission not found')
            error.statusCode = 404;
            return next(error)
        }
        if (admission.user.toString() !== req.user._id.toString()) {
            const error = new Error('You are not the owner of this admission')
            error.statusCode = 403;
            return next(error)
        }
        next()
    } catch (error) {
        return next(error)
    }
}