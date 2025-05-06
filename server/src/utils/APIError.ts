import { NextFunction, Request, Response } from "express";
type Error = {
    message: string
    statusCode:number
}
const APIError = (err:Error,req:Request,res:Response,next:NextFunction)=>{
    err.message = err.message || "Internal Server Error"
    err.statusCode = err.statusCode || 500
    console.log("Error occured\n------------------")
    console.log(err.message)
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}

export default APIError 