export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }

    static badRequest(message: string) {
        return new ApiError(400, message);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message: string = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message: string = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message: string) {
        return new ApiError(409, message);
    }

    static internal(message: string = 'Internal server error') {
        return new ApiError(500, message);
    }
}
