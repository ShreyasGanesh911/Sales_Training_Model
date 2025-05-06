import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import APIError from "./utils/APIError.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())



app.use(APIError)
export default app