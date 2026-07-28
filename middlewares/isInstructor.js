export default async function isInstructor(req, res, next) {
    if (!req.user) {
        const error = new Error('Authentication is required')
        error.statusCode = 401;
        return next(error)
    }
    if (req.user.role != 'instructor') {
        const error = new Error('Instructor access required')
        error.statusCode = 403;
        return next(error)
    }
    return next()
}