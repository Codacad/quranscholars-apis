import AppError from "../utils/AppError.js";

export default function errorMiddleware(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).send({
        success: false,
        status: err.status,
        message: err.message
    })
}
