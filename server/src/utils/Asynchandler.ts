import { NextFunction, Request, Response } from "express"

const AsyncHandler = (fn:Function)=>(req:Request,res:Response,next:NextFunction)=>{
    Promise.resolve(fn(req,res,next)).catch(next)
}

export default AsyncHandler