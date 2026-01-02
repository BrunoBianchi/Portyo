export enum APIErrors {
    authenticationError = "Authentication error",
    authorizationError = "Authorization error",
    notFoundError = "Not found error",
    internalServerError = "Internal server error",
    badRequestError = "Bad request error",
    conflictError = "Conflict error",
    forbiddenError = "Forbidden error",
    unauthorizedError = "Unauthorized error",
    paymentRequiredError = "Payment required error",
    requestTimeoutError = "Request timeout error",
    requestEntityTooLargeError = "Request entity too large error",
    dtoError = "DTO error",
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"
}

export class ApiError extends Error {
    public readonly cause: APIErrors;
    public readonly code: number;

    constructor(cause: APIErrors, message: string, code: number) {
        super(message);
        this.name = 'ApiError';
        this.cause = cause;
        this.code = code;
    }
}
