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
    constructor(cause:APIErrors,message:string,code:number){
        super(JSON.stringify({cause,message,code}))
        this.name = 'ApiError';
    }
}
