import type { NextFunction, Request, Response } from "express";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { ZodError } from "zod";

const Errors =  {
    ZodError:(err:ZodError):{cause:APIErrors,message:string,code:number}=>{
        try {
            const messageError = JSON.parse(err.message.replace("[ "," ")
            .replace("] "," ").trim())
    
            const msg = messageError
            .map((err:{expected:string,code:string,path:string[],message:string}) => 
            `${err.message} in ${err.path}`).join(". ");
    
            return {
                cause:APIErrors.badRequestError,
                message:msg,
                code:400
            }
        } catch (e) {
            return {
                cause: APIErrors.badRequestError,
                message: err.message,
                code: 400
            }
        }
    },
    ApiError:(err:ApiError):{cause:APIErrors,message:string,code:number}=>{
        try {
            return JSON.parse(err.message);
        } catch (e) {
             return {
                 cause: APIErrors.internalServerError,
                 message: err.message,
                 code: 500
             }
        }
    },
    Error:(err:any):{cause:APIErrors,message:string,code:number}=>{
        return {
            cause: APIErrors.internalServerError,
            message: "Internal Server Error",
            code: 500
        }
    }
}

export const errorMiddleware = (err:ApiError | ZodError | Error, req:Request, res:Response, next:NextFunction)=> {
    const handler = Errors[err.name as keyof typeof Errors];
    if (handler) {
        const error = handler(err as any);
        return res.status(error.code).json({cause:error.cause,message:error.message});
    }
    
    // Fallback for unhandled errors
    console.error("Unhandled error:", err);
    return res.status(500).json({
        cause: APIErrors.internalServerError,
        message: "Internal Server Error"
    });
}
