import AppError from "../utils/AppError.js";

export default function errorMiddleware(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).send({
        success: false,
        status: err.status,
        message: err.code === 'LIMIT_FILE_SIZE' ? "File size exceeds the limit of 3MB" : err.message || 'Internal Server Error',
    })
}
