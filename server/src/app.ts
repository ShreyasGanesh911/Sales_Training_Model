import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import APIError from "./utils/APIError.js"
import gptRoute from "./routes/gpt.route.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/gpt",gptRoute)


app.use(APIError)
export default app