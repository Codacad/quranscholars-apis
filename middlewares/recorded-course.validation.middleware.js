export function recordedCourseValidationMiddleware(schema) {
    return (req, res, next) => {
        try {
            req.payload = schema.parse(req.body)
            return next()
        } catch (error) {
            return next(error)
        }
    }

}